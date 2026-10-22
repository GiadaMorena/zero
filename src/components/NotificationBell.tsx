"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSubscriptionTracking } from "@/components/SubscriptionTrackingProvider";
import { subscriptionCycle } from "@/lib/subscriptionTracking";
import { SubscriptionPaymentStatus } from "@/components/SubscriptionPaymentStatus";
export function NotificationBell({onManage}:{onManage:()=>void}){
 const {subscriptions,profile}=useApp(),{tracking,ready,now}=useSubscriptionTracking();
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;close.current?.focus();
  const dismiss=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);trigger.current?.focus();}};
  document.addEventListener("pointerdown",dismiss);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",dismiss);document.removeEventListener("keydown",escape);};
 },[open]);
 const due=profile.notificationsEnabled&&ready?subscriptions.flatMap(sub=>{const cycle=subscriptionCycle(sub,tracking,now);return cycle&&(cycle.phase==="tomorrow"||cycle.status==="pending"||cycle.status==="unpaid")?[{sub,cycle}]:[];}):[];
 return <div ref={root} className="relative"><button ref={trigger} type="button" aria-label={`Avvisi${due.length?`: ${due.length} rinnovi da controllare`:""}`} aria-expanded={open} onClick={()=>setOpen(!open)} className="relative rounded-2xl border border-black/15 bg-[#F7F7F5] p-2.5 text-[#0B0B0B]"><Bell className="h-4 w-4"/>{due.length>0&&<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FDC909] px-1 text-[10px] font-black">{due.length}</span>}</button>
 {open&&<section aria-label="Avvisi sulle scadenze" className="fixed inset-x-4 top-24 z-50 max-w-[calc(100vw-2rem)] rounded-3xl border border-black/10 bg-white p-4 text-[#0B0B0B] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80"><div className="mb-3 flex justify-between gap-3"><div><h2 className="text-sm font-black">Rinnovi e pagamenti</h2><p className="mt-1 text-xs text-[#666]">Il giorno prima · il giorno stesso</p></div><button ref={close} aria-label="Chiudi avvisi" onClick={()=>{setOpen(false);trigger.current?.focus();}} className="rounded-full p-2"><X className="h-4 w-4"/></button></div>
 {!profile.notificationsEnabled?<p className="py-4 text-sm text-[#666]">Hai disattivato i promemoria nelle impostazioni.</p>:!ready?<p role="status" className="py-4 text-sm">Caricamento delle conferme…</p>:due.length?<ul className="max-h-[60dvh] space-y-3 overflow-y-auto">{due.map(({sub,cycle})=><li key={sub.id} className="rounded-2xl bg-[#F7F7F5] p-3"><div className="flex justify-between gap-3 text-sm font-bold"><span>{sub.name}</span><span>{sub.cost.toLocaleString("it-IT",{style:"currency",currency:"EUR"})}</span></div><p className="mt-1 text-xs text-[#666]">{cycle.phase==="tomorrow"?"Rinnovo domani":cycle.phase==="today"?"Rinnovo oggi":"Pagamento da confermare"}</p><SubscriptionPaymentStatus sub={sub}/></li>)}</ul>:<p className="py-4 text-sm text-[#666]">Nessun rinnovo domani e nessun pagamento da confermare.</p>}
 <button onClick={()=>{setOpen(false);onManage();}} className="mt-4 w-full rounded-full bg-[#FDC909] py-3 text-xs font-black">Gestisci abbonamenti</button></section>}</div>;
}
