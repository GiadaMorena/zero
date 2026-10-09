export interface ReceiptFields {
  title: string;
  amount: string;
  date: string;
  category: string;
}
const moneyPattern = /(?<![\d.,])(?:\d{1,3}(?:\.\d{3})+|\d+)[,.]\d{2}(?!\d)/g;
function amountValue(value: string): number {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  return Math.round(Number(normalized) * 100);
}
function validDate(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : "";
}
// Prefer an explicitly labelled total. Item prices, cash received and change are never used as a fallback.
export function receiptFields(text: string): ReceiptFields {
  text = text.replace(/(\d)\s*([\/.-])\s*(?=\d)/g, "$1$2");
  const lines = text
    .normalize("NFKC")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const candidates: { cents: number; rank: number }[] = [];
  lines.forEach((line, index) => {
    if (
      !/\bTOTALE\b|\bTOTAL\b|\b[id]mporto\s+pagat[oa]?\b/i.test(line) ||
      /SUB\s*TOTALE|TOTALE\s+(?:IVA|IMPOST|ARTICOL|PEZZ|PUNT|SCONT|REST)|-[\s€]*\d/i.test(
        line,
      )
    )
      return;
    const values =
      line.match(moneyPattern) ||
      (/^[\s€EUR\d.,]+$/i.test(lines[index + 1] || "")
        ? lines[index + 1]?.match(moneyPattern)
        : null);
    if (!values || values.length !== 1) return;
    const cents = amountValue(values[0]);
    if (Number.isSafeInteger(cents) && cents > 0)
      candidates.push({
        cents,
        rank: /[id]mporto\s+pagat[oa]?/i.test(line)
          ? 3
          : /COMPLESSIVO|DA PAGARE|PAGATO|DOCUMENTO/i.test(line)
            ? 2
            : 1,
      });
  });
  const bestRank = Math.max(0, ...candidates.map((item) => item.rank));
  const totals = [
    ...new Set(
      candidates
        .filter((item) => item.rank === bestRank)
        .map((item) => item.cents),
    ),
  ];
  const dates = new Set<string>();
  for (const match of text.matchAll(
    /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4}|\d{2})\b/g,
  )) {
    const year = Number(match[3]) + (match[3].length === 2 ? 2000 : 0);
    const date = validDate(year, Number(match[2]), Number(match[1]));
    if (date) dates.add(date);
  }
  for (const match of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const date = validDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    );
    if (date) dates.add(date);
  }
  let title =
    lines
      .slice(0, 6)
      .find(
        (line) =>
          line.length >= 3 &&
          line.length <= 80 &&
          (line.match(/[A-Za-zÀ-ÿ]/g) || []).length >= 3 &&
          !/DOCUMENTO|COMMERCIALE|SCONTRINO|FISCALE|PARTITA|P\.?\s*IVA|\b(?:VIA|VIALE|PIAZZA|TEL|CASSA|DATA|TOTALE)\b/i.test(
            line,
          ),
      ) || "";
  if (/\beurospin\s*\.\s*it\b/i.test(text)) title = "Eurospin";
  const category = /farmaci|parafarmaci/i.test(title)
    ? "Salute"
    : /supermercat|eurospin|esselunga|carrefour|conad|coop\b|lidl|aldi|ristorant|pizzer|bar\b|caff/i.test(
          title,
        )
      ? "Cibo"
      : /benzina|carburant|\b(?:eni|q8|ip)\b|parking|parcheggio/i.test(title)
        ? "Trasporti"
        : "Altro";
  return {
    title,
    amount:
      totals.length === 1 ? (totals[0] / 100).toFixed(2).replace(".", ",") : "",
    date: dates.size === 1 ? [...dates][0] : "",
    category,
  };
}
