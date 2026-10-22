"use client";
import { useApp } from "@/context/AppContext";
import { useSubscriptionTracking } from "@/components/SubscriptionTrackingProvider";
import { subscriptionCycle } from "@/lib/subscriptionTracking";
import { SubscriptionPaymentStatus } from "@/components/SubscriptionPaymentStatus";
export function SubscriptionDueBanner({onManage}:{onManage:()=>void}){
 const {subscriptions,cards}=useApp(),{tracking,ready,now}=useSubscriptionTracking();
 const due=subscriptions.filter(sub=>{const cycle=subscriptionCycle(sub,tracking,now);return cycle?.status==="pending"||cycle?.status==="unpaid";});
 if(!ready||!due.length)return null;
 return <section aria-label="Pagamenti degli abbonamenti da confermare" className="rounded-3xl border border-[#D9B53D] bg-[#FFFBEB] p-4"><h2 className="text-sm font-black">Hai pagato questi rinnovi?</h2><p className="mt-1 text-xs text-[#666]">Conferma l’addebito dopo averlo controllato sulla carta.</p><div className="mt-3 space-y-4">{due.slice(0,3).map(sub=>{const cardId=tracking.subscriptions[sub.id]?.cardId,card=cards.find(item=>item.id===cardId);return <article key={sub.id}><div className="flex justify-between gap-3 text-sm font-bold"><span>{sub.name}</span><span>{sub.cost.toLocaleString("it-IT",{style:"currency",currency:"EUR"})}</span></div><p className="mt-1 text-xs text-[#666]">{card?`${card.bankName} · ${card.number}`:cardId?"Carta non più disponibile":"Nessuna carta associata"}</p><SubscriptionPaymentStatus sub={sub}/></article>;})}</div>{due.length>3&&<p className="mt-3 text-xs">Altri {due.length-3} rinnovi da controllare.</p>}<button type="button" onClick={onManage} className="mt-3 text-xs font-bold underline">Apri tutti gli abbonamenti</button></section>;
}
