import { receiptFields } from "./receiptFields";
type Word = {
  text: string;
  bbox: { x0: number; x1: number; y0: number; y1: number };
  symbols: { text: string; confidence: number }[];
};
const reliableDigits = (word: Word) => {
  const digits = word.symbols.filter((symbol) => /\d/.test(symbol.text));
  return (
    digits.length > 0 &&
    digits.length >= word.text.replace(/\D/g, "").length &&
    digits.every((symbol) => symbol.confidence >= 80)
  );
};
export function receiptDateFromWords(words: Word[]): string {
  const candidates = new Set<string>();
  for (const yearWord of words) {
    // A leading non-digit before months 03–09 can only represent the missing zero.
    const match = yearWord.text
      .trim()
      .match(/^(?:[A-Za-z]([3-9])|(\d{1,2}))\/((?:19|20)\d{2})$/);
    if (!match || !reliableDigits(yearWord)) continue;
    const month = Number(match[1] || match[2]),
      year = match[3];
    if (month < 1 || month > 12) continue;
    const width = yearWord.bbox.x1 - yearWord.bbox.x0;
    for (const dayWord of words) {
      const day = dayWord.text.trim().match(/^[‘’'`]*(\d{1,2})\/?$/)?.[1];
      if (
        !day ||
        !reliableDigits(dayWord) ||
        dayWord.bbox.x1 > yearWord.bbox.x0 ||
        yearWord.bbox.x0 - dayWord.bbox.x1 > width * 1.5
      )
        continue;
      const overlap =
        Math.min(dayWord.bbox.y1, yearWord.bbox.y1) -
        Math.max(dayWord.bbox.y0, yearWord.bbox.y0);
      if (
        overlap <
        Math.min(
          dayWord.bbox.y1 - dayWord.bbox.y0,
          yearWord.bbox.y1 - yearWord.bbox.y0,
        ) *
          0.2
      )
        continue;
      const date = receiptFields(`${day}/${month}/${year}`).date;
      if (date) candidates.add(date);
    }
  }
  return candidates.size === 1 ? [...candidates][0] : "";
}
