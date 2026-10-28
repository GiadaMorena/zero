"use client";

import { useEffect, useRef, useState } from "react";
import { useApp, type SubscriptionItem, type TransactionItem } from "@/context/AppContext";
import { useSubscriptionTracking } from "@/components/SubscriptionTrackingProvider";
import { subscriptionCycle } from "@/lib/subscriptionTracking";

export function SubscriptionPaymentStatus({ sub }: { sub: SubscriptionItem }) {
  const { tracking, ready, now, confirm } = useSubscriptionTracking();
  const { cards } = useApp();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [candidates, setCandidates] = useState<TransactionItem[]>([]);
  const [saved, setSaved] = useState(false);
  const guard = useRef(false), live = useRef(false), operation = useRef(0);
  const cycle = subscriptionCycle(sub, tracking, now);
  const cycleKey = cycle?.recentKey || "";
  useEffect(() => {
    live.current = true;
    operation.current++;
    guard.current = false;
    setBusy(false); setError(""); setCandidates([]); setSaved(false);
    return () => { live.current = false; operation.current++; };
  }, [sub.id, cycleKey]);
  if (!ready || !cycle?.status) return null;

  const answer = async (paid: boolean, options: { existingTransactionId?: string; allowNew?: boolean } = {}) => {
    if (guard.current) return;
    guard.current = true;
    const attempt = ++operation.current;
    setBusy(true); setError("");
    try {
      const result = await confirm(sub.id, cycle.recentKey, paid, options);
      if (!live.current || operation.current !== attempt) return;
      if ("error" in result) { setError(result.error); return; }
      if ("needsChoice" in result) { setCandidates(result.candidates); setSaved(false); return; }
      setCandidates([]); setSaved(paid && !!result.transaction);
    } catch {
      if (live.current && operation.current === attempt) setError("Verifica non riuscita. Controlla la connessione e riprova senza registrare una seconda spesa.");
    } finally {
      if (live.current && operation.current === attempt) { guard.current = false; setBusy(false); }
    }
  };
  const date = cycle.recent.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  return <div className="mt-3 rounded-2xl border border-black/10 bg-[#FFF9DE] p-3" data-app-update-block={busy || candidates.length > 0 ? "true" : undefined}>
    <p className="text-xs font-bold">{cycle.status === "paid" ? `Pagamento confermato · ${date}` : cycle.status === "unpaid" ? `Non ancora pagato · ${date}` : `Rinnovo del ${date}: hai pagato?`}</p>
    <p className="mt-1 text-[11px] leading-relaxed text-[#666]">Con “Sì, pagato” registri la spesa sulla carta associata. La stessa scadenza viene registrata una sola volta.</p>
    <div className="mt-2 flex gap-2">
      <button type="button" disabled={busy} aria-pressed={cycle.status === "paid"} onClick={() => void answer(true)} className={`min-h-10 flex-1 rounded-full px-3 text-xs font-bold disabled:opacity-50 ${cycle.status === "paid" ? "bg-[#0B0B0B] text-white" : "bg-white"}`}>{busy ? "Salvataggio…" : "Sì, pagato"}</button>
      <button type="button" disabled={busy} aria-pressed={cycle.status === "unpaid"} onClick={() => void answer(false)} className={`min-h-10 flex-1 rounded-full px-3 text-xs font-bold disabled:opacity-50 ${cycle.status === "unpaid" ? "bg-[#0B0B0B] text-white" : "bg-white"}`}>No, non pagato</button>
    </div>
    {candidates.length > 0 && <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
      <p className="text-xs font-bold">Questa spesa è già nei movimenti?</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#666]">Collega un movimento esistente per confermare il rinnovo senza addebitare di nuovo il saldo.</p>
      <div className="mt-2 space-y-2">{candidates.map(item => {
        const card = cards.find(value => value.id === item.cardId);
        return <button key={item.id} type="button" disabled={busy} onClick={() => void answer(true, { existingTransactionId: item.id })} className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-left disabled:opacity-50">
          <span className="flex items-start justify-between gap-2 text-xs font-bold"><span className="min-w-0 break-words">{item.title}</span><span className="shrink-0">{Math.abs(item.amount).toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</span></span>
          <span className="mt-1 block text-[10px] leading-relaxed text-[#666]">{item.date}{card ? ` · ${card.bankName} · ${card.number}` : ""}</span>
          <span className="mt-1 block text-[11px] font-bold underline underline-offset-2">Collega questo movimento</span>
        </button>;
      })}</div>
      <button type="button" disabled={busy} onClick={() => void answer(true, { allowNew: true })} className="mt-2 min-h-10 w-full rounded-full bg-[#FDC909] px-3 text-xs font-bold disabled:opacity-50">Registra una spesa diversa</button>
    </div>}
    {saved && <p role="status" className="mt-2 text-xs font-bold">Spesa registrata nei movimenti.</p>}
    {error && <p role="alert" className="mt-2 text-xs leading-relaxed text-red-700">{error}</p>}
  </div>;
}
