import type { CardItem, TransactionItem } from "@/context/AppContext";

export function parseTransactionAmount(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) / 100 : null;
}

export function recentTransactionCategories(transactions: TransactionItem[], type: TransactionItem["type"], allowed: string[]): string[] {
  return [...new Set(transactions.filter(tx => tx.type === type && allowed.includes(tx.category)).map(tx => tx.category))].slice(0, 3);
}

export function preferredTransactionCard(cards: CardItem[], transactions: TransactionItem[], activeCardId?: string): string {
  const recent = transactions.find(tx => cards.some(card => card.id === tx.cardId));
  return recent?.cardId ?? cards.find(card => card.id === activeCardId)?.id ?? cards[0]?.id ?? "";
}
