export interface WalletPaymentDraft {
  ref: string;
  title: string;
  amount: number;
  date: string;
  cardId: string;
}

export function parseWalletPayment(hash: string): WalletPaymentDraft | null {
  if (!hash.startsWith("#zero-pay?")) return null;
  const params = new URLSearchParams(hash.slice(10));
  const amountText = (params.get("amount") || "").trim().replace(",", ".");
  const amount = Number(amountText);
  const ref = params.get("ref") || "";
  const date = params.get("date") || "";
  const title = (params.get("merchant") || "").trim();
  const cardId = params.get("cardId") || "";
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (params.get("currency") !== "EUR" || !/^\d+(\.\d{1,2})?$/.test(amountText) || !Number.isSafeInteger(Math.round(amount * 100)) || amount <= 0 || !uuid.test(ref) || !uuid.test(cardId) || !title || title.length > 160 || /[\[\]<>\x00-\x1f]/.test(title)) return null;
  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) return null;
  return { ref: ref.toLowerCase(), title, amount, date, cardId };
}

export const walletMarker = (ref: string) => `[zero-pay:${ref}]`;
