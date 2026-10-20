"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { upcomingPayments } from "@/lib/upcomingPayments";

export function NotificationBell({ onManage }: { onManage: () => void }) {
  const { subscriptions, profile } = useApp();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { window.removeEventListener("focus", refresh); window.clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);
  const reminders = upcomingPayments(subscriptions, now);
  const due = profile.notificationsEnabled ? reminders.payments.filter(payment => payment.days <= 7) : [];
  return <div ref={root} className="relative">
    <button ref={trigger} type="button" aria-label={`Avvisi${due.length ? `: ${due.length} ${due.length === 1 ? "scadenza" : "scadenze"} nei prossimi 7 giorni` : ""}`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative rounded-2xl border border-black/15 bg-[#F7F7F5] p-2.5 text-[#0B0B0B] transition-colors hover:bg-black/5"><Bell className="h-4 w-4" />{due.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FDC909] px-1 text-[10px] font-black">{due.length}</span>}</button>
    {open && <section aria-label="Avvisi sulle scadenze" className="fixed inset-x-4 top-24 z-50 max-w-[calc(100vw-2rem)] rounded-3xl border border-black/10 bg-white p-4 text-[#0B0B0B] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-sm font-black">Le prossime scadenze</h2><p className="mt-1 text-xs text-[#666]">Promemoria nell’app · prossimi 7 giorni</p></div><button ref={closeButton} type="button" aria-label="Chiudi avvisi" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-full p-2 hover:bg-black/5"><X className="h-4 w-4" /></button></div>
      {!profile.notificationsEnabled ? <p className="py-4 text-sm text-[#666]">Hai disattivato i promemoria nelle impostazioni.</p> : due.length ? <ul className="max-h-64 space-y-2 overflow-y-auto">{due.map(({ sub, date, days }) => <li key={sub.id} className="rounded-2xl bg-[#F7F7F5] p-3"><div className="flex justify-between gap-3 text-sm font-bold"><span className="break-words">{sub.name}</span><span className="shrink-0 tabular-nums">{sub.cost.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</span></div><p className="mt-1 text-xs text-[#666]">{days === 0 ? "Oggi" : days === 1 ? "Domani" : `Tra ${days} giorni`} · {date.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}</p></li>)}</ul> : <p className="py-4 text-sm text-[#666]">Nessun rinnovo previsto nei prossimi 7 giorni.</p>}
      {profile.notificationsEnabled && reminders.undated > 0 && <p className="mt-3 text-xs text-[#666]">{reminders.undated} abbonamenti senza una data valida: completala per ricevere il promemoria.</p>}
      <button type="button" onClick={() => { setOpen(false); onManage(); }} className="mt-4 w-full rounded-full bg-[#FDC909] py-3 text-xs font-black">Gestisci abbonamenti</button>
    </section>}
  </div>;
}
