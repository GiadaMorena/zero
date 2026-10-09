import type { SubscriptionInput } from "@/context/AppContext";
import { renewalParts } from "./upcomingPayments";
export function validSubscription(data: SubscriptionInput): boolean {
  return (
    !!data.name.trim() &&
    !!data.category.trim() &&
    Number.isFinite(data.cost) &&
    data.cost >= 0.01 &&
    Number.isSafeInteger(Math.round(data.cost * 100)) &&
    (data.frequency === "mese" || data.frequency === "anno") &&
    renewalParts(data.date) !== null
  );
}
