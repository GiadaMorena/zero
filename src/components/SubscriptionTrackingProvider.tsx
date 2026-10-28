"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import { readTracking, subscriptionCycle, TRACKING_KEY, type SubscriptionTracking } from "@/lib/subscriptionTracking";
import type { SubscriptionPaymentInput, SubscriptionPaymentResult } from "@/lib/subscriptionPayment";

type ConfirmationOptions = Pick<SubscriptionPaymentInput, "existingTransactionId" | "allowNew">;
interface TrackingContextValue {
  tracking: SubscriptionTracking;
  ready: boolean;
  now: Date;
  error: string;
  retry: () => void;
  setCard: (id: string, cardId: string) => Promise<{ error?: string }>;
  confirm: (id: string, date: string, paid: boolean, options?: ConfirmationOptions) => Promise<SubscriptionPaymentResult>;
}

export const SubscriptionTrackingContext = createContext<TrackingContextValue | null>(null);

export function SubscriptionTrackingProvider({ children }: { children: React.ReactNode }) {
  const { cards, subscriptions, recordSubscriptionPayment } = useApp();
  const [tracking, setTracking] = useState<SubscriptionTracking>(() => readTracking(null));
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [problem, setProblem] = useState("");
  const retry = useRef<() => void>(() => {});
  const busy = useRef(false);
  const mounted = useRef(true);
  const owner = useRef<string | null>(null);
  const epoch = useRef(0);
  const loadSequence = useRef(0);
  const latestTracking = useRef(tracking);
  const commit = (value: SubscriptionTracking) => {
    latestTracking.current = value;
    setTracking(value);
  };

  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      if (busy.current) return;
      const sequence = ++loadSequence.current;
      const accountEpoch = epoch.current;
      const live = () => mounted.current && sequence === loadSequence.current && accountEpoch === epoch.current;
      setReady(false);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!live()) return;
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (owner.current && owner.current !== user?.id) return;
        if (!user) {
          owner.current = null;
          commit(readTracking(null));
          setProblem("");
          setReady(true);
          return;
        }
        owner.current = user.id;
        let value = readTracking(user.user_metadata?.[TRACKING_KEY]);
        if (!user.user_metadata?.[TRACKING_KEY]) {
          const saved = await supabase.auth.updateUser({ data: { [TRACKING_KEY]: value } });
          if (!live() || owner.current !== user.id) return;
          if (saved.error) throw saved.error;
          value = readTracking(saved.data?.user?.user_metadata?.[TRACKING_KEY] || value);
        }
        if (!live() || owner.current !== user.id) return;
        commit(value);
        setProblem("");
        setReady(true);
      } catch {
        if (live()) { setProblem("Non riesco a caricare carte e conferme. Controlla la connessione e riprova."); setReady(false); }
      }
    };
    retry.current = () => { void load(); };
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextOwner = session?.user?.id || null;
      if (event === "SIGNED_OUT" || nextOwner !== owner.current) {
        epoch.current++;
        loadSequence.current++;
        busy.current = false;
        owner.current = nextOwner;
        commit(readTracking(null));
        setReady(false);
        setProblem("");
        // SDK calls run outside the authentication callback's internal lock.
        if (nextOwner) window.setTimeout(() => { void load(); }, 0);
      }
      // A refreshed session can still contain metadata from before the RPC.
      // Same-account events never replace a server-confirmed payment locally.
    });
    const refresh = () => { setNow(new Date()); if (!busy.current) void load(); };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      mounted.current = false;
      epoch.current++;
      loadSequence.current++;
      owner.current = null;
      subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const currentAccount = async (id: string, accountEpoch: number) => {
    if (!mounted.current || owner.current !== id || epoch.current !== accountEpoch) return false;
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && session?.user.id === id && mounted.current && owner.current === id && epoch.current === accountEpoch;
  };

  const setCard = useCallback(async (id: string, cardId: string): Promise<{ error?: string }> => {
    if (!ready || !owner.current) return { error: "Accedi al tuo account e attendi il caricamento delle conferme." };
    if (busy.current) return { error: "Attendi il salvataggio in corso e riprova." };
    if (cardId && !cards.some(card => card.id === cardId)) return { error: "Questa carta non è più disponibile. Scegline un’altra o Nessuna carta." };
    busy.current = true;
    loadSequence.current++;
    const accountId = owner.current, accountEpoch = epoch.current;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || user?.id !== accountId || !await currentAccount(accountId, accountEpoch)) return { error: "Accedi al tuo account per salvare questa scelta." };
      // The creation dialog can still hold the callback from before addSubscription
      // completed. Verify that new ID on the server before associating its card.
      if (!subscriptions.some(sub => sub.id === id)) {
        const { data: existing, error: lookupError } = await supabase.from("subscriptions").select("id").eq("id", id).eq("user_id", accountId).maybeSingle();
        if (!await currentAccount(accountId, accountEpoch)) return { error: "L’account è cambiato durante il salvataggio. Riapri l’abbonamento." };
        if (lookupError || existing?.id !== id) return { error: "Questo abbonamento non è più disponibile. Riapri l’elenco e riprova." };
      }
      const next = readTracking(user.user_metadata?.[TRACKING_KEY]);
      const entry = next.subscriptions[id] || { cardId: "", payments: {} };
      next.subscriptions[id] = { ...entry, cardId };
      const result = await supabase.auth.updateUser({ data: { [TRACKING_KEY]: readTracking(next) } });
      if (!await currentAccount(accountId, accountEpoch)) return { error: "L’account è cambiato durante il salvataggio. Riapri l’abbonamento." };
      if (result.error) return { error: "Non è stato possibile salvare. La scelta precedente è ancora disponibile: riprova." };
      commit(readTracking(result.data?.user?.user_metadata?.[TRACKING_KEY] || next));
      return {};
    } catch { return { error: "Connessione non disponibile. Riprova senza chiudere questa schermata." }; }
    finally { if (owner.current === accountId && epoch.current === accountEpoch) busy.current = false; }
  }, [cards, subscriptions, ready]);

  const confirm = useCallback(async (id: string, date: string, paid: boolean, options: ConfirmationOptions = {}): Promise<SubscriptionPaymentResult> => {
    if (!ready || !owner.current) return { error: "Accedi al tuo account e attendi il caricamento delle conferme." };
    if (busy.current) return { error: "Attendi il salvataggio in corso e riprova." };
    const sub = subscriptions.find(item => item.id === id);
    const cycle = sub ? subscriptionCycle(sub, latestTracking.current) : null;
    if (!cycle || cycle.recentKey !== date || !cycle.status) return { error: "La scadenza è cambiata. Aggiorna la schermata e riprova." };
    const linkedCard = latestTracking.current.subscriptions[id]?.cardId;
    if (paid && (!linkedCard || !cards.some(card => card.id === linkedCard))) return { error: "Scegli prima la carta dell’abbonamento in Abbonamenti → Modifica, poi conferma il pagamento.", code: "missing-card" };
    busy.current = true;
    loadSequence.current++;
    const accountId = owner.current, accountEpoch = epoch.current;
    try {
      if (!await currentAccount(accountId, accountEpoch)) return { error: "Accedi al tuo account per confermare il pagamento." };
      const result = await recordSubscriptionPayment({ subscriptionId: id, cycleDate: date, paid, ...options });
      if (!await currentAccount(accountId, accountEpoch)) return { error: "L’account è cambiato durante il salvataggio. Riapri l’account di partenza per verificare il movimento." };
      if ("tracking" in result) { commit(readTracking(result.tracking)); setProblem(""); }
      return result;
    } catch { return { error: "Non riesco a confermare il pagamento. Controlla la connessione e riprova: la stessa scadenza non viene registrata due volte." }; }
    finally { if (owner.current === accountId && epoch.current === accountEpoch) busy.current = false; }
  }, [cards, subscriptions, recordSubscriptionPayment, ready]);

  return <SubscriptionTrackingContext.Provider value={{ tracking, ready, now, error: problem, retry: () => retry.current(), setCard, confirm }}>{children}</SubscriptionTrackingContext.Provider>;
}

export function useSubscriptionTracking() {
  const value = useContext(SubscriptionTrackingContext);
  if (!value) throw Error("SubscriptionTrackingProvider missing");
  return value;
}
