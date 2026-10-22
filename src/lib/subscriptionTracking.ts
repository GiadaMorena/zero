import type { SubscriptionItem } from "@/context/AppContext";
import { nextRenewal, renewalParts } from "./upcomingPayments";

export interface SubscriptionTrackingEntry { cardId: string; payments: Record<string, boolean> }
export interface SubscriptionTracking { startedOn: string; subscriptions: Record<string, SubscriptionTrackingEntry> }
export const TRACKING_KEY = "zero_subscription_tracking_v1";
export function romeDay(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)!.value).join("-");
}
export const calendarKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function readTracking(value: unknown, today = romeDay()): SubscriptionTracking {
  const raw = value && typeof value === "object" ? value as Partial<SubscriptionTracking> : {};
  const subscriptions: Record<string, SubscriptionTrackingEntry> = Object.create(null);
  if (raw.subscriptions && typeof raw.subscriptions === "object") {
    for (const [id, entry] of Object.entries(raw.subscriptions).slice(0,1000)) {
      if (!/^[a-zA-Z0-9-]{1,100}$/.test(id) || ["__proto__","constructor","prototype"].includes(id) || !entry || typeof entry !== "object") continue;
      const payments: Record<string,boolean> = Object.create(null);
      for (const [date, paid] of Object.entries(entry.payments || {}).filter(([date]) => validDay(date)).sort(([a],[b]) => a.localeCompare(b)).slice(-3)) if (typeof paid === "boolean") payments[date] = paid;
      subscriptions[id] = { cardId: typeof entry.cardId === "string" && /^[a-zA-Z0-9-]{0,100}$/.test(entry.cardId) ? entry.cardId : "", payments };
    }
  }
  return { startedOn: validDay(raw.startedOn) ? raw.startedOn : today, subscriptions };
}
export function subscriptionCycle(sub: SubscriptionItem, tracking: SubscriptionTracking, now = new Date()) {
  const today = romeDay(now), base = new Date(`${today}T12:00:00`);
  const next = nextRenewal(sub, base), parts = renewalParts(sub.date);
  if (!sub.active || !next || !parts) return null;
  let recent = next;
  if (calendarKey(next) > today) {
    const month = new Date(next.getFullYear() - (sub.frequency === "anno" ? 1 : 0), next.getMonth() - (sub.frequency === "mese" ? 1 : 0), 1, 12);
    recent = new Date(month.getFullYear(), month.getMonth(), Math.min(parts.day,new Date(month.getFullYear(),month.getMonth()+1,0).getDate()),12);
  }
  const recentKey = calendarKey(recent);
  const createdDay = sub.createdAt ? romeDay(new Date(sub.createdAt)) : tracking.startedOn;
  const needsTracking = recentKey >= tracking.startedOn && recentKey >= createdDay;
  const decision = tracking.subscriptions[sub.id]?.payments[recentKey];
  const status = !needsTracking ? null : decision === true ? "paid" : decision === false ? "unpaid" : "pending";
  const tomorrow = new Date(base); tomorrow.setDate(tomorrow.getDate()+1);
  const phase = calendarKey(next) === today ? "today" : calendarKey(next) === calendarKey(tomorrow) ? "tomorrow" : null;
  return { next, recent, recentKey, status, phase };
}
