"use client";

import { ChevronRight, CalendarDays } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { upcomingPayments } from "@/lib/upcomingPayments";
import { SubscriptionLogo } from "./SubscriptionLogo";

const money = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

export function UpcomingPaymentsCard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { subscriptions } = useApp();
  const { within30, total, undated } = upcomingPayments(subscriptions);
  return (
    <section aria-label="Prossime scadenze" className="rounded-[22px] bg-white border border-[#A7A7A7]/20 p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#0B0B0B]">In arrivo</h3>
          <p className="text-[11px] text-[#73736E] mt-0.5">Abbonamenti · prossimi 30 giorni</p>
        </div>
        <span className="text-base font-black whitespace-nowrap">{money(total)}</span>
      </div>
      {within30.length ? (
        <div className="divide-y divide-[#A7A7A7]/10">
          {within30.slice(0, 3).map(({ sub, date, days }) => (
            <button key={`${sub.id}-${date.getTime()}`} type="button" onClick={() => onNavigate("abbonamenti")} className="flex items-center gap-3 w-full text-left py-3 focus-visible:outline-2 focus-visible:outline-[#FDC909]">
              <span className="h-9 w-9 shrink-0 rounded-xl overflow-hidden bg-[#F7F7F5] flex items-center justify-center"><SubscriptionLogo name={sub.name} size={28} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">{sub.name}</span>
                <span className="block text-[11px] text-[#73736E] mt-0.5">{days === 0 ? "Oggi" : days === 1 ? "Domani" : date.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} · {sub.frequency === "anno" ? "Annuale" : "Mensile"}</span>
              </span>
              <span className="text-xs font-extrabold whitespace-nowrap">{money(sub.cost)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2 text-xs text-[#73736E]"><CalendarDays className="h-4 w-4 shrink-0" />Nessun rinnovo previsto nei prossimi 30 giorni.</div>
      )}
      {undated > 0 && <p className="text-[11px] text-[#73736E] mt-2">{undated} {undated === 1 ? "abbonamento con data da completare" : "abbonamenti con date da completare"}.</p>}
      <button type="button" onClick={() => onNavigate("abbonamenti")} className="flex items-center justify-between w-full pt-3 mt-2 border-t border-[#A7A7A7]/10 text-xs font-bold focus-visible:outline-2 focus-visible:outline-[#FDC909]">
        {within30.length > 3 ? `Vedi tutti i ${within30.length} rinnovi` : subscriptions.length ? "Gestisci abbonamenti" : "Aggiungi un abbonamento"}<ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}

