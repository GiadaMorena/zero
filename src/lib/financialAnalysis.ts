import type { TransactionItem } from "@/context/AppContext";
import { transactionDate } from "./monthlyBudget";

export type AnalysisPeriod = "Settimana" | "Mese" | "Trimestre" | "Anno";
const dateAt = (year: number, month: number, day = 1) => new Date(year, month, day, 12);
export function periodRange(period: AnalysisPeriod, anchor: Date) {
  const year = anchor.getFullYear(), month = anchor.getMonth();
  let start: Date, end: Date;
  if (period === "Anno") { start = dateAt(year, 0); end = dateAt(year + 1, 0); }
  else if (period === "Trimestre") { const first = Math.floor(month / 3) * 3; start = dateAt(year, first); end = dateAt(year, first + 3); }
  else if (period === "Settimana") { start = dateAt(year, month, anchor.getDate() - (anchor.getDay() + 6) % 7); end = dateAt(start.getFullYear(), start.getMonth(), start.getDate() + 7); }
  else { start = dateAt(year, month); end = dateAt(year, month + 1); }
  const last = new Date(end); last.setDate(last.getDate() - 1);
  const short = (date: Date) => date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const label = period === "Mese" ? start.toLocaleDateString("it-IT", { month: "long", year: "numeric" })
    : period === "Anno" ? String(year)
    : `${short(start)} – ${short(last)} ${last.getFullYear()}`;
  return { start, end, label };
}
export function shiftPeriod(period: AnalysisPeriod, anchor: Date, step: number) {
  const { start } = periodRange(period, anchor);
  return period === "Settimana" ? dateAt(start.getFullYear(), start.getMonth(), start.getDate() + 7 * step)
    : dateAt(start.getFullYear(), start.getMonth() + (period === "Anno" ? 12 : period === "Trimestre" ? 3 : 1) * step);
}
const colors: Record<string, string> = { Casa: "#FDC909", Cibo: "#0B0B0B", Trasporti: "#73736E", Shopping: "#A7A7A7", Abbonamenti: "#B79905", Svago: "#262626", Salute: "#8A9871", Altro: "#D4D4D0" };
export function financialAnalysis(transactions: TransactionItem[], period: AnalysisPeriod, anchor: Date) {
  const range = periodRange(period, anchor);
  let undated = 0, expenseCents = 0, incomeCents = 0;
  const categoryCents = new Map<string, number>();
  const buckets: { label: string; expense: number; income: number }[] = [];
  const days = new Date(range.end.getFullYear(), range.end.getMonth(), 0).getDate();
  const count = period === "Anno" ? 12 : period === "Trimestre" ? 3 : period === "Settimana" ? 7 : Math.ceil(days / 7);
  for (let i = 0; i < count; i++) {
    const label = period === "Anno" || period === "Trimestre" ? dateAt(range.start.getFullYear(), range.start.getMonth() + i).toLocaleDateString("it-IT", { month: "short" })
      : period === "Settimana" ? dateAt(range.start.getFullYear(), range.start.getMonth(), range.start.getDate() + i).toLocaleDateString("it-IT", { weekday: "short" })
      : `${i * 7 + 1}–${Math.min(days, i * 7 + 7)}`;
    buckets.push({ label, expense: 0, income: 0 });
  }
  const current = transactions.filter(tx => {
    const date = transactionDate(tx);
    if (!date) { undated++; return false; }
    const calendar = dateAt(date.getFullYear(), date.getMonth(), date.getDate());
    if (calendar < range.start || calendar >= range.end || !Number.isFinite(tx.amount)) return false;
    const cents = Math.round(Math.abs(tx.amount) * 100);
    const index = period === "Anno" || period === "Trimestre" ? (date.getFullYear() - range.start.getFullYear()) * 12 + date.getMonth() - range.start.getMonth()
      : period === "Settimana" ? (date.getDay() + 6) % 7 : Math.floor((date.getDate() - 1) / 7);
    if (tx.type === "expense") {
      expenseCents += cents;
      const category = tx.category.trim() || "Altro";
      categoryCents.set(category, (categoryCents.get(category) || 0) + cents);
      buckets[index].expense += cents;
    } else { incomeCents += cents; buckets[index].income += cents; }
    return true;
  });
  const categories = [...categoryCents].map(([name, cents]) => ({ name, amount: cents / 100, share: expenseCents ? cents / expenseCents : 0, percent: expenseCents ? Math.floor(cents / expenseCents * 100) : 0, color: colors[name] || "#A7A7A7" })).sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "it"));
  // Largest remainders keep the displayed category percentages at exactly 100%.
  if (expenseCents) {
    const remainder = 100 - categories.reduce((sum, item) => sum + item.percent, 0);
    [...categories].sort((a, b) => (b.share * 100 - b.percent) - (a.share * 100 - a.percent)).slice(0, remainder).forEach(item => item.percent++);
  }
  return { ...range, transactions: current, undated, spent: expenseCents / 100, income: incomeCents / 100, net: (incomeCents - expenseCents) / 100, categories, buckets: buckets.map(bucket => ({ ...bucket, expense: bucket.expense / 100, income: bucket.income / 100 })) };
}
