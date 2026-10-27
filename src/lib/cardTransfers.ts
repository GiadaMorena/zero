export interface CardTransferInput {
  fromCardId: string;
  toCardId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CardTransferItem {
  id: string;
  fromCardId: string | null;
  toCardId: string | null;
  fromLabel: string;
  toLabel: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface TransferBalance { id: string; balance: number }
export type TransferResult = { error: string } | { transfer: CardTransferItem; balances: TransferBalance[]; error?: never };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_TRANSFER_AMOUNT = 999999999.99;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateCardTransfer(input: CardTransferInput): string | null {
  if (!input || !UUID.test(input.fromCardId) || !UUID.test(input.toCardId)) return "Scegli due carte disponibili.";
  if (input.fromCardId.toLowerCase() === input.toCardId.toLowerCase()) return "Scegli due carte diverse.";
  if (!Number.isFinite(input.amount) || input.amount < 0.01 || input.amount > MAX_TRANSFER_AMOUNT
    || Math.abs(input.amount * 100 - Math.round(input.amount * 100)) > 0.00001) return "Inserisci un importo maggiore di zero, con al massimo due decimali.";
  if (!validDate(input.date)) return "Scegli una data valida per il trasferimento.";
  if (input.note !== undefined && (typeof input.note !== "string" || input.note.trim().length > 500)) return "La nota può contenere al massimo 500 caratteri.";
  return null;
}

export function transferFromRow(row: unknown): CardTransferItem | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const value = row as Record<string, unknown>;
  const amount = Number(value.amount);
  if (typeof value.id !== "string" || !UUID.test(value.id)
    || !(value.from_card_id === null || typeof value.from_card_id === "string" && UUID.test(value.from_card_id))
    || !(value.to_card_id === null || typeof value.to_card_id === "string" && UUID.test(value.to_card_id))
    || typeof value.from_label !== "string" || typeof value.to_label !== "string"
    || !Number.isFinite(amount) || amount < 0.01 || amount > MAX_TRANSFER_AMOUNT
    || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001 || !validDate(value.date)
    || typeof value.created_at !== "string" || !Number.isFinite(new Date(value.created_at).getTime())) return null;
  return {
    id: value.id, fromCardId: value.from_card_id as string | null, toCardId: value.to_card_id as string | null,
    fromLabel: value.from_label, toLabel: value.to_label, amount: Math.round(amount * 100) / 100,
    date: value.date, ...(typeof value.note === "string" && value.note ? { note: value.note } : {}), createdAt: value.created_at,
  };
}

const errorText = (error: unknown) => {
  const message = error && typeof error === "object" ? String((error as { message?: unknown }).message || "") : "";
  if (message.includes("ZERO_TRANSFER_INSUFFICIENT_FUNDS")) return "Il saldo della carta di partenza non è sufficiente.";
  if (message.includes("ZERO_TRANSFER_CARD_UNAVAILABLE")) return "Una delle carte non è più disponibile. Aggiorna le carte e riprova.";
  if (message.includes("ZERO_TRANSFER_REQUEST_CONFLICT")) return "Questa richiesta è già stata usata con dati diversi. Chiudi il modulo e riprova.";
  if (message.includes("ZERO_TRANSFER_AUTH_REQUIRED")) return "Accedi di nuovo a ZERO per registrare il trasferimento.";
  if (message.includes("ZERO_TRANSFER_INVALID")) return "Controlla carte, importo, data e nota del trasferimento.";
  if (message.includes("record_card_transfer") && /does not exist|could not find|schema cache/i.test(message)) return "Il servizio trasferimenti deve ancora essere attivato. Il trasferimento non è stato registrato e i saldi non sono cambiati.";
  return "Non è stato possibile confermare il trasferimento. Riprova senza chiudere questo modulo: la stessa richiesta non verrà registrata due volte.";
};

/** One RPC is one database transaction: never fall back to separate card writes. */
export async function persistCardTransfer(
  client: { rpc: (name: string, values: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> },
  input: CardTransferInput,
  requestId: string,
): Promise<TransferResult> {
  const invalid = validateCardTransfer(input);
  if (invalid) return { error: invalid };
  if (!UUID.test(requestId)) return { error: "Non riesco a identificare il trasferimento. Riapri il modulo e riprova." };
  const canonicalRequestId = requestId.toLowerCase();
  try {
    const { data, error } = await client.rpc("record_card_transfer", {
      p_request_id: canonicalRequestId, p_from_card_id: input.fromCardId, p_to_card_id: input.toCardId,
      p_amount: Math.round(input.amount * 100) / 100, p_date: input.date, p_note: input.note?.trim() || null,
    });
    if (error) return { error: errorText(error) };
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("Malformed transfer response");
    const value = data as Record<string, unknown>;
    const transfer = transferFromRow(value.transfer);
    if (!transfer || transfer.id !== canonicalRequestId || !Array.isArray(value.balances)
      || (transfer.fromCardId && transfer.fromCardId !== input.fromCardId.toLowerCase())
      || (transfer.toCardId && transfer.toCardId !== input.toCardId.toLowerCase())
      || transfer.amount !== Math.round(input.amount * 100) / 100 || transfer.date !== input.date
      || (transfer.note || "") !== (input.note?.trim() || "")) throw Error("Unconfirmed transfer");
    const balances: TransferBalance[] = [];
    for (const item of value.balances) {
      if (!item || typeof item !== "object" || typeof item.id !== "string" || !UUID.test(item.id)
        || !Number.isFinite(Number(item.balance)) || Number(item.balance) < 0 || balances.some(row => row.id === item.id)) throw Error("Invalid balance response");
      balances.push({ id: item.id, balance: Number(item.balance) });
    }
    // A historical retry can return a null card after it was explicitly deleted.
    const knownIds = [transfer.fromCardId, transfer.toCardId].filter((id): id is string => !!id);
    if (balances.length !== knownIds.length || knownIds.some(id => !balances.some(row => row.id === id))) throw Error("Incomplete balance response");
    return { transfer, balances };
  } catch (error) { return { error: errorText(error) }; }
}
