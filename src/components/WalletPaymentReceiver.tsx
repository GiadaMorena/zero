"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { AddSpesaModal } from "@/components/AddSpesaModal";
import { supabase } from "@/lib/supabase";
import { parseWalletPayment, walletMarker, type WalletPaymentDraft } from "@/lib/walletPayment";

const KEY = "zero_pending_wallet_v1";
const INBOX = "#zero-wallet-inbox";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
interface Pending { draft: WalletPaymentDraft; expires: number; owner: string; serverId?: string }

function checkedDraft(value: unknown): WalletPaymentDraft | null {
  if (!value || typeof value !== "object") return null;
  const draft = value as WalletPaymentDraft;
  if (typeof draft.ref !== "string" || typeof draft.cardId !== "string" || typeof draft.date !== "string" || typeof draft.title !== "string" || typeof draft.amount !== "number") return null;
  return parseWalletPayment("#zero-pay?" + new URLSearchParams({
    ref: draft.ref, cardId: draft.cardId, date: draft.date, merchant: draft.title,
    amount: String(draft.amount), currency: "EUR", ...(draft.preview === true ? { preview: "1" } : {}),
  }).toString());
}

export function WalletPaymentReceiver({ unlocked, accountEmail }: { unlocked: boolean; accountEmail: string }) {
  const { isHydrated, transactions } = useApp();
  const [pending, setPending] = useState<Pending | null>(null);
  const [queue, setQueue] = useState<Pending[]>([]);
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const dismissed = useRef(new Set<string>());
  const inboxRequested = useRef(false);
  const requestedId = useRef("");
  const owner = accountEmail.trim().toLowerCase();
  const savedKey = `zero_wallet_saved_v1:${owner}`;
  let savedRefs: string[] = [];
  try {
    const stored: unknown = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(savedKey) || "[]") : [];
    if (Array.isArray(stored)) savedRefs = stored.filter((item): item is string => typeof item === "string").slice(-200);
  } catch { /* Transaction notes also provide duplicate detection. */ }

  // Keep direct links working across a same-tab OAuth navigation. Server drafts stay on
  // the server and are never stored in this unbound, pre-login cache.
  useEffect(() => {
    const receive = () => {
      if (window.location.hash === INBOX) {
        inboxRequested.current = true;
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        setRefresh(value => value + 1);
        return;
      }
      if (!window.location.hash.startsWith("#zero-pay?")) return;
      let draft: WalletPaymentDraft | null = null;
      try { draft = parseWalletPayment(window.location.hash); } catch { /* Invalid date or payload. */ }
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (!draft) { setMessage("Dati del pagamento incompleti. Controlla l’automazione: importo in euro, esercente, data e riferimento del pagamento."); return; }
      const next = { draft, expires: Date.now() + 30 * 60 * 1000, owner: unlocked ? owner : "" };
      try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the current draft in memory. */ }
      setPending(next);
    };
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEY) || "null") as Pending | null;
      const restored = stored && stored.expires > Date.now() && !stored.serverId ? checkedDraft(stored.draft) : null;
      if (stored && restored && typeof stored.owner === "string") setPending({ draft: restored, expires: stored.expires, owner: stored.owner });
      else sessionStorage.removeItem(KEY);
    } catch { /* Ignore unavailable or invalid session cache. */ }
    receive();
    window.addEventListener("hashchange", receive);
    return () => window.removeEventListener("hashchange", receive);
  }, [owner, unlocked]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.data?.type !== "zero-wallet-payment" || !uuid.test(event.data.id || "")) return;
      // Only accept a message sent by this app's own push service worker.
      const source = event.source as ServiceWorker | null;
      try {
        const url = new URL(source?.scriptURL || "");
        if (url.origin !== window.location.origin || url.pathname !== "/zero-push-sw.js") return;
      } catch { return; }
      inboxRequested.current = true;
      requestedId.current = event.data.id;
      setRefresh(value => value + 1);
    };
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", receive);
    return () => navigator.serviceWorker.removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (!unlocked || !owner || !isHydrated) return;
    let live = true;
    let loading = false;
    const load = async () => {
      if (loading) return;
      loading = true;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!live) return;
        if (!session || session.user.email?.trim().toLowerCase() !== owner) {
          if (inboxRequested.current) setMessage("Accedi all’account collegato ad Apple Pay per aprire il pagamento.");
          return;
        }
        const response = await fetch("/api/wallet/pending", { cache: "no-store", headers: { authorization: `Bearer ${session.access_token}` } });
        if (!live) return;
        if (!response.ok) {
          if (inboxRequested.current) setMessage(response.status === 401 ? "Accedi di nuovo per recuperare il pagamento." : "Non riesco a recuperare il pagamento. Controlla la connessione e riapri ZERO.");
          return;
        }
        const body = await response.json();
        if (!live) return;
        const items: Pending[] = [];
        const ids = new Set<string>();
        if (Array.isArray(body.drafts)) for (const item of body.drafts.slice(0, 50)) {
          if (typeof item?.id !== "string" || !uuid.test(item.id) || ids.has(item.id) || dismissed.current.has(`${owner}:${item.id}`)) continue;
          const draft = checkedDraft(item.draft);
          if (!draft) continue;
          ids.add(item.id);
          items.push({ serverId: item.id, draft, expires: Date.now() + 24 * 60 * 60 * 1000, owner });
        }
        const requested = items.find(item => item.serverId === requestedId.current);
        setQueue(requested ? [requested, ...items.filter(item => item !== requested)] : items);
        if (inboxRequested.current) {
          setMessage(items.length ? "" : "Non ci sono pagamenti Apple Pay da controllare. Le bozze restano disponibili per 24 ore.");
          inboxRequested.current = false;
        }
      } catch {
        if (live && inboxRequested.current) setMessage("Connessione non disponibile. Il pagamento resta da controllare: riapri ZERO quando torna la connessione.");
      } finally { loading = false; }
    };
    // A cold iPhone web-app launch may discard the notification's hash. Recover the
    // authenticated inbox on every unlock and foreground, as well as notification taps.
    void load();
    const focus = () => { void load(); };
    const visible = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => { live = false; window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", visible); };
  }, [unlocked, owner, isHydrated, refresh]);

  useEffect(() => {
    if (!unlocked || !owner || !pending || pending.owner) return;
    const bound = { ...pending, owner };
    setPending(bound);
    try { sessionStorage.setItem(KEY, JSON.stringify(bound)); } catch { /* In-memory ownership remains. */ }
  }, [unlocked, owner, pending]);

  const active = (pending && pending.expires > Date.now() ? pending : null) || queue.find(item => item.owner === owner && item.expires > Date.now()) || null;
  const close = () => {
    if (active?.serverId) {
      const id = active.serverId, activeOwner = active.owner;
      dismissed.current.add(`${activeOwner}:${id}`);
      setQueue(items => items.filter(item => item.serverId !== id || item.owner !== activeOwner));
      void (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || session.user.email?.trim().toLowerCase() !== activeOwner) return;
          await fetch("/api/wallet/pending", { method: "DELETE", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id }) });
        } catch { /* A later load can safely recover an unacknowledged server draft. */ }
      })();
      return;
    }
    setPending(null);
    try { sessionStorage.removeItem(KEY); } catch { /* Memory state still clears. */ }
  };
  // Ignore optimistic rows: a failed insert must leave the form open for retry.
  const duplicate = active && !active.draft.preview && (savedRefs.includes(active.draft.ref) || transactions.some(tx => !tx.id.startsWith("tx-") && tx.note?.includes(walletMarker(active.draft.ref))));
  const wrongAccount = active?.owner && active.owner !== owner;
  return <>
    {unlocked && (message || wrongAccount || duplicate) && <div role="alert" className="fixed inset-x-4 top-6 z-[100] mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-xl"><p className="text-sm">{message || (wrongAccount ? "Questo pagamento appartiene a un altro account. Riapri il collegamento con l’account corretto." : "Questo pagamento è già stato registrato.")}</p><button onClick={() => { if (!message) close(); setMessage(""); }} className="mt-3 font-bold underline">Chiudi</button></div>}
    {unlocked && isHydrated && active && !wrongAccount && !duplicate && active.expires > Date.now() && <AddSpesaModal key={`${active.owner}:${active.serverId || active.draft.ref}`} isOpen onClose={close} draft={active.draft} onSaved={() => {
      try { localStorage.setItem(savedKey, JSON.stringify([...savedRefs, active.draft.ref].slice(-200))); } catch { /* The persisted transaction retains its marker. */ }
    }} />}
  </>;
}
