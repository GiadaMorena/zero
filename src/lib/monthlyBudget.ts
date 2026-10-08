import type { TransactionItem } from "@/context/AppContext";
export function validMonthlyBudget(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0.01 ? Math.round(value * 100) / 100 : null;
}
function calendarDate(year: number, month: number, day: number): Date | null {
  const result = new Date(year, month - 1, day, 12);
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day ? result : null;
}
export function transactionDate(tx: Pick<TransactionItem, "date" | "createdAt">): Date | null {
  const anchor = tx.createdAt ? new Date(tx.createdAt) : null;
  const recorded = anchor && Number.isFinite(anchor.getTime()) ? anchor : null;
  const text = (tx.date || "").trim().toLowerCase();
  if (/^(oggi|ieri)\b/.test(text)) {
    if (!recorded) return null;
    const result = new Date(recorded);
    if (text.startsWith("ieri")) result.setDate(result.getDate() - 1);
    return result;
  }
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|t)/);
  if (iso) return calendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const numeric = text.match(/^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{4}))?(?:$|[,\s])/);
  if (numeric) {
    const year = numeric[3] ? Number(numeric[3]) : recorded?.getFullYear();
    return year ? calendarDate(year, Number(numeric[2]), Number(numeric[1])) : null;
  }
  const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const italian = text.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/);
  if (italian) {
    const month = months.indexOf(italian[2].slice(0, 3)) + 1;
    const year = italian[3] ? Number(italian[3]) : recorded?.getFullYear();
    return month && year ? calendarDate(year, month, Number(italian[1])) : null;
  }
  return recorded;
}
export function monthlySummary(transactions: TransactionItem[], now = new Date()) {
  let undated = 0, expenseCents = 0, incomeCents = 0;
  const current = transactions.filter(tx => {
    const date = transactionDate(tx);
    if (!date) { undated++; return false; }
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  for (const tx of current) {
    if (!Number.isFinite(tx.amount)) continue;
    if (tx.type === "expense") expenseCents += Math.round(Math.abs(tx.amount) * 100);
    else incomeCents += Math.round(Math.abs(tx.amount) * 100);
  }
  return { transactions: current, spent: expenseCents / 100, income: incomeCents / 100, undated };
}
