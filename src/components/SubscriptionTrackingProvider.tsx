"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import { readTracking, romeDay, subscriptionCycle, TRACKING_KEY, type SubscriptionTracking } from "@/lib/subscriptionTracking";

interface TrackingContextValue {
  tracking: SubscriptionTracking; ready: boolean; now: Date; error: string; retry: () => void;
  setCard: (id:string,cardId:string) => Promise<{error?:string}>;
  confirm: (id:string,date:string,paid:boolean) => Promise<{error?:string}>;
}
export const SubscriptionTrackingContext = createContext<TrackingContextValue | null>(null);
export function SubscriptionTrackingProvider({ children }: { children: React.ReactNode }) {
  const { cards, subscriptions } = useApp();
  const [tracking,setTracking] = useState<SubscriptionTracking>(() => readTracking(null));
  const [ready,setReady] = useState(false), [now,setNow] = useState(() => new Date());
  const [problem,setProblem] = useState("");
  const retry = useRef<() => void>(() => {});
  const busy = useRef(false), mounted = useRef(true), owner = useRef<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted.current) return;
        if(error && error.name!=="AuthSessionMissingError"){setProblem("Non riesco a caricare carte e conferme. Controlla la connessione e riprova.");setReady(false);return;}
        setProblem("");
        owner.current = user?.id || null;
        if (!user) { setTracking(readTracking(null)); setReady(true); return; }
        const value = readTracking(user.user_metadata?.[TRACKING_KEY]);
        setTracking(value); setReady(true);
        if (!user.user_metadata?.[TRACKING_KEY]) await supabase.auth.updateUser({ data: { [TRACKING_KEY]: value } });
      } catch { if (mounted.current) {setReady(false);setProblem("Non riesco a caricare le conferme. Riprova.");} }
    };
    retry.current = () => { void load(); };
    void load();
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event,session) => {
      if (event === "SIGNED_OUT") { owner.current=null; setTracking(readTracking(null)); setReady(false); }
      else if (session?.user) { owner.current=session.user.id; setTracking(readTracking(session.user.user_metadata?.[TRACKING_KEY])); setReady(true); }
    });
    const refresh = () => setNow(new Date());
    window.addEventListener("focus",refresh); const timer=window.setInterval(refresh,60_000);
    return () => { mounted.current=false; subscription.unsubscribe(); window.removeEventListener("focus",refresh); window.clearInterval(timer); };
  },[]);
  const save = useCallback(async (id:string,change:{cardId?:string;date?:string;paid?:boolean}) => {
    if (busy.current) return {error:"Attendi il salvataggio in corso e riprova."};
    if (change.cardId && !cards.some(card=>card.id===change.cardId)) return {error:"Questa carta non è più disponibile. Scegline un’altra o Nessuna carta."};
    busy.current=true;
    try {
      const {data:{user},error}=await supabase.auth.getUser();
      if(error || !user || (owner.current && owner.current!==user.id)) return {error:"Accedi al tuo account per salvare questa scelta."};
      const next=readTracking(user.user_metadata?.[TRACKING_KEY]);
      const entry=next.subscriptions[id] || {cardId:"",payments:{}};
      if(change.date !== undefined){
        const sub=subscriptions.find(item=>item.id===id), cycle=sub?subscriptionCycle(sub,next):null;
        if(!cycle || cycle.recentKey!==change.date || !cycle.status) return {error:"La scadenza è cambiata. Aggiorna la schermata e riprova."};
        entry.payments={...entry.payments,[change.date]:change.paid!};
      }
      if(change.cardId !== undefined) entry.cardId=change.cardId;
      next.subscriptions[id]=entry;
      const result=await supabase.auth.updateUser({data:{[TRACKING_KEY]:readTracking(next)}});
      if(result.error) return {error:"Non è stato possibile salvare. La scelta precedente è ancora disponibile: riprova."};
      if(mounted.current && owner.current===user.id) setTracking(readTracking(next));
      return {};
    } catch {return {error:"Connessione non disponibile. Riprova senza chiudere questa schermata."};}
    finally {busy.current=false;}
  },[cards,subscriptions]);
  return <SubscriptionTrackingContext.Provider value={{tracking,ready,now,error:problem,retry:()=>retry.current(),setCard:(id,cardId)=>save(id,{cardId}),confirm:(id,date,paid)=>save(id,{date,paid})}}>{children}</SubscriptionTrackingContext.Provider>;
}
export function useSubscriptionTracking(){const value=useContext(SubscriptionTrackingContext);if(!value)throw Error("SubscriptionTrackingProvider missing");return value;}
