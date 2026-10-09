import type { CardItem, TransactionItem } from "@/context/AppContext";
import { transactionDate } from "./monthlyBudget";
import { periodRange, shiftPeriod } from "./financialAnalysis";
export type MovementPeriod = "all" | "month" | "previous-month" | "year";
export interface MovementFilters {
  query: string;
  category: string;
  cardId: string;
  period: MovementPeriod;
  type: "all" | "expense" | "income";
}
export function movementDateLabel(item: TransactionItem) {
  return (
    transactionDate(item)?.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) ||
    item.date ||
    "Data non indicata"
  );
}
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
export function filterMovements(
  items: TransactionItem[],
  cards: CardItem[],
  filters: MovementFilters,
  now = new Date(),
) {
  const words = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  const range =
    filters.period === "all"
      ? null
      : periodRange(
          filters.period === "year" ? "Anno" : "Mese",
          filters.period === "previous-month"
            ? shiftPeriod("Mese", now, -1)
            : now,
        );
  return items.filter((item) => {
    if (!Number.isFinite(item.amount)) return false;
    if (filters.category !== "Tutte" && item.category !== filters.category)
      return false;
    if (
      filters.cardId !== "Tutte" &&
      (filters.cardId === "none"
        ? !!item.cardId
        : item.cardId !== filters.cardId)
    )
      return false;
    if (
      filters.type !== "all" &&
      (filters.type === "income" ? item.amount <= 0 : item.amount >= 0)
    )
      return false;
    const date = transactionDate(item);
    if (range && (!date || date < range.start || date >= range.end))
      return false;
    const bank = cards.find((card) => card.id === item.cardId)?.bankName || "";
    const haystack = normalize(
      [
        item.title,
        item.note || "",
        item.category,
        bank,
        Math.abs(item.amount).toFixed(2),
        Math.abs(item.amount).toFixed(2).replace(".", ","),
      ].join(" "),
    );
    return words.every((word) => haystack.includes(word));
  });
}
export function sortMovements(
  items: TransactionItem[],
  field: "date" | "amount" = "date",
  order: "asc" | "desc" = "desc",
) {
  const direction = order === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    if (field === "amount")
      return direction * (Math.abs(a.amount) - Math.abs(b.amount));
    const ad = transactionDate(a)?.getTime(),
      bd = transactionDate(b)?.getTime();
    if (ad === undefined) return bd === undefined ? 0 : 1;
    if (bd === undefined) return -1;
    return (
      direction *
      (ad - bd ||
        (Date.parse(a.createdAt || "") || 0) -
          (Date.parse(b.createdAt || "") || 0))
    );
  });
}
export function movementTotals(items: TransactionItem[]) {
  let expense = 0,
    income = 0;
  for (const item of items) {
    if (!Number.isFinite(item.amount)) continue;
    const cents = Math.round(item.amount * 100);
    if (cents < 0) expense -= cents;
    else income += cents;
  }
  return {
    expense: expense / 100,
    income: income / 100,
    net: (income - expense) / 100,
  };
}
const csvText = (value: string) =>
  `"${(/^\s*[=+@-]/.test(value) ? "'" : "") + value.replace(/"/g, '""')}"`;
export function movementsCsv(items: TransactionItem[], cards: CardItem[]) {
  const rows = items
    .filter((item) => Number.isFinite(item.amount))
    .map((item) => {
      const date = transactionDate(item),
        dateText = date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : item.date || "Data non indicata";
      const card = cards.find((card) => card.id === item.cardId);
      return [
        csvText(dateText),
        csvText(item.title),
        csvText(item.category),
        csvText(
          card
            ? card.bankName
            : item.cardId
              ? "Carta non più presente"
              : "Nessuna carta",
        ),
        csvText(item.amount > 0 ? "Entrata" : "Uscita"),
        (Math.round(item.amount * 100) / 100).toFixed(2).replace(".", ","),
        csvText(item.note || ""),
      ].join(";");
    });
  return (
    "\uFEFFData;Descrizione;Categoria;Carta;Tipo;Importo (EUR);Nota\r\n" +
    rows.join("\r\n")
  );
}
