import type { SubscriptionItem } from "@/context/AppContext";

const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const dayNumber = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;

// Renewals on the 29th–31st use the last available day in shorter months.
function renewal(year: number, month: number, day: number) {
  return new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()), 12);
}

export function renewalParts(value: string): { day: number; month: number } | null {
  const text = value.trim().toLowerCase();
  let day: number, month: number;
  const italian = text.match(/^(\d{1,2})\s+([a-z]+)(?:\s+\d{4})?$/);
  const numeric = text.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{4})?$/);
  const iso = text.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (italian) { day = Number(italian[1]); month = months.indexOf(italian[2]); }
  else if (numeric) { day = Number(numeric[1]); month = Number(numeric[2]) - 1; }
  else if (iso) { day = Number(iso[2]); month = Number(iso[1]) - 1; }
  else return null;
  if (day < 1 || day > 31 || month < 0 || month > 11) return null;
  return { day, month };
}

export function nextRenewal(sub: Pick<SubscriptionItem, "date" | "frequency">, now = new Date()): Date | null {
  const parts = renewalParts(sub.date); if (!parts) return null;
  const { day, month } = parts;
  let result = renewal(now.getFullYear(), sub.frequency === "mese" ? now.getMonth() : month, day);
  if (dayNumber(result) < dayNumber(now)) {
    result = sub.frequency === "mese"
      ? renewal(now.getFullYear(), now.getMonth() + 1, day)
      : renewal(now.getFullYear() + 1, month, day);
  }
  return result;
}

export function upcomingPayments(subscriptions: SubscriptionItem[], now = new Date()) {
  let undated = 0;
  const payments = subscriptions.filter(sub => sub.active).flatMap(sub => {
    const date = nextRenewal(sub, now);
    if (!date) { undated++; return []; }
    if (!Number.isFinite(sub.cost) || sub.cost < 0) return [];
    return [{ sub, date, days: dayNumber(date) - dayNumber(now) }];
  }).sort((a, b) => a.days - b.days || a.sub.name.localeCompare(b.sub.name, "it"));
  const within30 = payments.flatMap(item => {
    if (item.days >= 30) return [];
    const occurrences = [item];
    if (item.sub.frequency === "mese") {
      const after = new Date(item.date);
      after.setDate(after.getDate() + 1);
      const following = nextRenewal(item.sub, after);
      if (following && dayNumber(following) - dayNumber(now) < 30) {
        occurrences.push({ ...item, date: following, days: dayNumber(following) - dayNumber(now) });
      }
    }
    return occurrences;
  }).sort((a, b) => a.days - b.days || a.sub.name.localeCompare(b.sub.name, "it"));
  return { payments, within30, undated, total: within30.reduce((sum, item) => sum + Math.round(item.sub.cost * 100), 0) / 100 };
}
