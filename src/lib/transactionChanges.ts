import type { CardItem, TransactionItem } from "@/context/AppContext";

export type TransactionEdit = Pick<TransactionItem, "title" | "category" | "amount" | "type" | "date" | "cardId" | "note">;

export function changedBalances(cards: CardItem[], original: TransactionItem, replacement: TransactionItem | null) {
  return cards.map(card => {
    // Combine both deltas before clamping, especially when keeping the same card.
    const delta = (original.cardId === card.id ? -original.amount : 0) + (replacement?.cardId === card.id ? replacement.amount : 0);
    return delta ? { ...card, balance: Math.max(0, Math.round((Number(card.balance) + delta) * 100) / 100) } : card;
  });
}

const fields = ["title", "category", "amount", "date", "card_id", "type", "note"] as const;
const payload = (tx: TransactionItem) => ({ title: tx.title, category: tx.category, amount: tx.amount, date: tx.date, card_id: tx.cardId || null, type: tx.type, note: tx.note || null });

// Existing schema has separate movement and card records. Compare-and-set updates
// avoid overwriting another device; compensate card writes if the movement fails.
export async function persistTransactionChange(client: any, uid: string, original: TransactionItem, replacement: TransactionItem | null): Promise<{ error?: string; balances?: { id: string; balance: number }[] }> {
  const affected = [...new Set([original.cardId, replacement?.cardId].filter(Boolean))] as string[];
  const writes: { id: string; before: number; after: number }[] = [];
  let movementAttempted = false;
  let savedBalances: { id: string; balance: number }[] = [];
  try {
    const current = await client.from("transactions").select("*").eq("user_id", uid).eq("id", original.id).maybeSingle();
    const expectedOriginal = payload(original);
    if (current.error || !current.data || !fields.every(field => current.data[field] === expectedOriginal[field])) throw Error("stale-movement");
    const loaded = affected.length ? await client.from("cards").select("id,balance").eq("user_id", uid).in("id", affected) : { data: [], error: null };
    if (loaded.error || !loaded.data) throw Error("load");
    if (replacement?.cardId && !loaded.data.some((card: { id: string }) => card.id === replacement.cardId)) throw Error("missing-card");
    const next = changedBalances(loaded.data as CardItem[], original, replacement);
    savedBalances = next.map(card => ({ id: card.id, balance: Number(card.balance) }));
    for (const card of loaded.data) {
      const before = Number(card.balance), after = next.find(item => item.id === card.id)!.balance;
      if (before === after) continue;
      const saved = await client.from("cards").update({ balance: after }).eq("user_id", uid).eq("id", card.id).eq("balance", before).select("id").single();
      if (saved.error || !saved.data) throw Error("card-write");
      writes.push({ id: card.id, before, after });
    }
    let query = replacement ? client.from("transactions").update(payload(replacement)) : client.from("transactions").delete();
    query = query.eq("user_id", uid).eq("id", original.id);
    const expected = payload(original);
    for (const field of fields) query = expected[field] === null ? query.is(field, null) : query.eq(field, expected[field]);
    movementAttempted = true;
    const saved = await query.select("id").single();
    if (saved.error || !saved.data) { movementAttempted = false; throw Error("movement-write"); }
    return { balances: savedBalances };
  } catch {
    if (movementAttempted) {
      // A lost response can follow a successful write. Read its outcome before
      // undoing any balance changes, so a retry cannot reverse a saved movement.
      try {
        const check = await client.from("transactions").select("*").eq("user_id", uid).eq("id", original.id).maybeSingle();
        if (check.error) throw Error("unknown-outcome");
        const expected = replacement ? payload(replacement) : null;
        if ((!replacement && !check.data) || (expected && check.data && fields.every(field => check.data[field] === expected[field]))) return { balances: savedBalances };
      } catch { return { error: "La risposta del server non è arrivata. Riapri l’app per verificare il movimento prima di riprovare." }; }
    }
    let rollbackFailed = false;
    for (const write of writes.reverse()) {
      try {
        const restored = await client.from("cards").update({ balance: write.before }).eq("user_id", uid).eq("id", write.id).eq("balance", write.after).select("id").single();
        if (restored.error || !restored.data) rollbackFailed = true;
      } catch { rollbackFailed = true; }
    }
    return { error: rollbackFailed
      ? "Il movimento non è stato modificato, ma non è stato possibile ripristinare un saldo. Controlla le carte prima di riprovare."
      : "Non è stato possibile salvare: connessione non disponibile o dati aggiornati altrove. Riapri il movimento e riprova." };
  }
}
