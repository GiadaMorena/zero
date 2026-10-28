import type { TransactionItem } from "@/context/AppContext";
import { readTracking, validDay, type SubscriptionTracking } from "./subscriptionTracking";

export interface SubscriptionPaymentInput {
  subscriptionId: string;
  cycleDate: string;
  paid: boolean;
  existingTransactionId?: string;
  allowNew?: boolean;
}
export type SubscriptionPaymentResult =
  | { error: string; code?: string }
  | { needsChoice: true; candidates: TransactionItem[] }
  | { tracking: SubscriptionTracking; transaction: TransactionItem | null; balance: { id: string; balance: number } | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function transactionFromRow(value: unknown): TransactionItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const amount = Number(row.amount);
  if (typeof row.id !== "string" || !UUID.test(row.id) || row.type !== "expense"
    || !Number.isFinite(amount) || amount >= 0 || Math.abs(amount) > 999999999.99
    || typeof row.title !== "string" || typeof row.category !== "string" || typeof row.date !== "string"
    || !(row.card_id === null || typeof row.card_id === "string")
    || typeof row.created_at !== "string" || !Number.isFinite(new Date(row.created_at).getTime())) return null;
  return { id: row.id, title: row.title, category: row.category, amount, date: row.date,
    cardId: row.card_id || "", type: "expense", ...(typeof row.note === "string" ? { note: row.note } : {}), createdAt: row.created_at };
}

function paymentError(error: unknown): { error: string; code?: string } {
  const message = error && typeof error === "object" ? String((error as { message?: unknown }).message || "") : "";
  const messages: Record<string, { error: string; code: string }> = {
    ZERO_SUB_AUTH_REQUIRED: { error: "Accedi al tuo account per confermare questo pagamento.", code: "account" },
    ZERO_SUB_UNAVAILABLE: { error: "L’abbonamento non è più disponibile o è escluso. Aggiorna la schermata.", code: "unavailable-subscription" },
    ZERO_SUB_CYCLE_CHANGED: { error: "La scadenza è cambiata. Aggiorna la schermata e conferma il rinnovo attuale.", code: "cycle-changed" },
    ZERO_SUB_MISSING_CARD: { error: "Associa una carta disponibile all’abbonamento prima di registrare il pagamento.", code: "missing-card" },
    ZERO_SUB_INVALID_COST: { error: "Controlla il costo dell’abbonamento: deve essere maggiore di zero, con al massimo due decimali.", code: "invalid-cost" },
    ZERO_SUB_INVALID_BALANCE: { error: "Il saldo della carta non è valido. Controlla la carta prima di riprovare.", code: "invalid-balance" },
    ZERO_SUB_EXISTING_INVALID: { error: "Questo movimento non può essere collegato al rinnovo. Aggiorna l’elenco e riprova.", code: "invalid-existing" },
    ZERO_SUB_LINKED_PAYMENT: { error: "Il pagamento ha già una spesa nei movimenti. Per indicare Non pagato, elimina prima la spesa collegata dai Movimenti.", code: "linked-payment" },
    ZERO_SUB_DELETED_PAYMENT: { error: "La spesa collegata è stata eliminata. Segna prima Non pagato, poi conferma di nuovo per registrarne un’altra.", code: "deleted-payment" },
    ZERO_SUB_INVALID: { error: "Controlla i dati del pagamento e riprova.", code: "invalid" },
  };
  for (const [key, value] of Object.entries(messages)) if (message.includes(key)) return value;
  if (message.includes("record_subscription_payment") && /does not exist|could not find|schema cache/i.test(message)) return {
    error: "Il collegamento dei pagamenti deve ancora essere attivato. Nessuna spesa è stata registrata.", code: "not-configured",
  };
  return { error: "Non riesco a confermare il salvataggio. Riprova: lo stesso rinnovo non verrà registrato due volte.", code: "unavailable" };
}

export async function persistSubscriptionPayment(
  client: { rpc: (name: string, values: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> },
  input: SubscriptionPaymentInput,
): Promise<SubscriptionPaymentResult> {
  if (!input || !UUID.test(input.subscriptionId) || !validDay(input.cycleDate) || typeof input.paid !== "boolean"
    || (input.existingTransactionId !== undefined && !UUID.test(input.existingTransactionId))
    || (input.allowNew !== undefined && typeof input.allowNew !== "boolean")) return { error: "Controlla abbonamento e data del rinnovo.", code: "invalid" };
  try {
    const { data, error } = await client.rpc("record_subscription_payment", {
      p_subscription_id: input.subscriptionId, p_cycle_date: input.cycleDate, p_paid: input.paid,
      p_existing_transaction_id: input.existingTransactionId || null, p_allow_new: input.allowNew === true,
    });
    if (error) return paymentError(error);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("Unconfirmed payment");
    const value = data as Record<string, unknown>;
    if (value.needsChoice === true) {
      if (!input.paid || !Array.isArray(value.candidates) || !value.candidates.length || value.candidates.length > 10) throw Error("Invalid choice");
      const candidates = value.candidates.map(transactionFromRow);
      if (candidates.some(item => !item)) throw Error("Invalid movement");
      return { needsChoice: true, candidates: candidates as TransactionItem[] };
    }
    if (!value.tracking || typeof value.tracking !== "object" || Array.isArray(value.tracking)) throw Error("Missing confirmation");
    const tracking = readTracking(value.tracking);
    if (tracking.subscriptions[input.subscriptionId]?.payments[input.cycleDate] !== input.paid) throw Error("Unconfirmed cycle");
    const transaction = value.transaction === null ? null : transactionFromRow(value.transaction);
    if ((input.paid && !transaction) || (!input.paid && value.transaction !== null)) throw Error("Unconfirmed expense");
    let balance: { id: string; balance: number } | null = null;
    if (value.balance !== null) {
      if (!value.balance || typeof value.balance !== "object" || Array.isArray(value.balance)) throw Error("Invalid balance");
      const row = value.balance as Record<string, unknown>, amount = Number(row.balance);
      if (typeof row.id !== "string" || !UUID.test(row.id) || !Number.isFinite(amount) || amount < 0 || transaction?.cardId !== row.id) throw Error("Invalid balance");
      balance = { id: row.id, balance: amount };
    }
    return { tracking, transaction, balance };
  } catch (error) { return paymentError(error); }
}
