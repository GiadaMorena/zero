"use client";
import { useState } from "react";
import type { SubscriptionItem } from "@/context/AppContext";
import { useSubscriptionTracking } from "@/components/SubscriptionTrackingProvider";
import { subscriptionCycle } from "@/lib/subscriptionTracking";

export function SubscriptionPaymentStatus({sub}:{sub:SubscriptionItem}) {
  const {tracking,ready,now,confirm}=useSubscriptionTracking();
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const cycle=subscriptionCycle(sub,tracking,now);
  if(!ready || !cycle?.status) return null;
  const answer=async(paid:boolean)=>{if(busy)return;setBusy(true);setError("");const result=await confirm(sub.id,cycle.recentKey,paid);if(result.error)setError(result.error);setBusy(false);};
  const date=cycle.recent.toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"});
  return <div className="mt-3 rounded-2xl border border-black/10 bg-[#FFF9DE] p-3" data-app-update-block={busy?"":undefined}>
    <p className="text-xs font-bold">{cycle.status==="paid"?`Pagamento confermato · ${date}`:cycle.status==="unpaid"?`Non ancora pagato · ${date}`:`Rinnovo del ${date}: hai pagato?`}</p>
    <p className="mt-1 text-[11px] text-[#666]">Conferma di monitoraggio: non crea automaticamente una spesa.</p>
    <div className="mt-2 flex gap-2"><button type="button" disabled={busy} aria-pressed={cycle.status==="paid"} onClick={()=>void answer(true)} className={`min-h-10 flex-1 rounded-full px-3 text-xs font-bold disabled:opacity-50 ${cycle.status==="paid"?"bg-[#0B0B0B] text-white":"bg-white"}`}>{busy?"Salvataggio…":"Sì, pagato"}</button><button type="button" disabled={busy} aria-pressed={cycle.status==="unpaid"} onClick={()=>void answer(false)} className={`min-h-10 flex-1 rounded-full px-3 text-xs font-bold disabled:opacity-50 ${cycle.status==="unpaid"?"bg-[#0B0B0B] text-white":"bg-white"}`}>No, non pagato</button></div>
    {error&&<p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </div>;
}
