"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { AddSpesaModal } from "@/components/AddSpesaModal";
import { parseWalletPayment, walletMarker, type WalletPaymentDraft } from "@/lib/walletPayment";

const KEY = "zero_pending_wallet_v1";
interface Pending { draft: WalletPaymentDraft; expires: number; owner: string }

export function WalletPaymentReceiver({ unlocked, accountEmail }: { unlocked: boolean; accountEmail: string }) {
  const { isHydrated, transactions } = useApp();
  const [pending, setPending] = useState<Pending | null>(null);
  const [message, setMessage] = useState("");
  const owner = accountEmail.trim().toLowerCase();
  const savedKey = `zero_wallet_saved_v1:${owner}`;
  let savedRefs: string[] = [];
  try {
    const stored: unknown = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(savedKey) || "[]") : [];
    if (Array.isArray(stored)) savedRefs = stored.filter((item): item is string => typeof item === "string").slice(-200);
  } catch { /* Transaction notes also provide duplicate detection. */ }
  useEffect(() => {
    const receive = () => {
      if (!window.location.hash.startsWith("#zero-pay?")) return;
      let draft: WalletPaymentDraft | null = null;
      try { draft = parseWalletPayment(window.location.hash); } catch { /* Invalid date or payload. */ }
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (!draft) { setMessage("Dati del pagamento incompleti. Controlla l’automazione: importo in euro, esercente, data e riferimento del pagamento."); return; }
      // An email cached before login is not proof that this is the current account.
      const next = { draft, expires: Date.now() + 30 * 60 * 1000, owner: unlocked ? owner : "" };
      try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep the current draft in memory. */ }
      setPending(next);
    };
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEY) || "null") as Pending | null;
      const restored = stored && stored.expires > Date.now() ? parseWalletPayment("#zero-pay?" + new URLSearchParams({
        ref: stored.draft.ref,
        cardId: stored.draft.cardId,
        date: stored.draft.date,
        merchant: stored.draft.title,
        amount: String(stored.draft.amount),
        currency: "EUR",
        ...(stored.draft.preview ? { preview: "1" } : {}),
      }).toString()) : null;
      if (stored && restored) setPending({ ...stored, draft: restored });
      else sessionStorage.removeItem(KEY);
    } catch { /* Ignore unavailable or invalid session cache. */ }
    receive();
    window.addEventListener("hashchange", receive);
    return () => window.removeEventListener("hashchange", receive);
  }, [owner, unlocked]);
  useEffect(() => {
    if (!unlocked || !owner || !pending || pending.owner) return;
    const bound = { ...pending, owner };
    setPending(bound);
    try { sessionStorage.setItem(KEY, JSON.stringify(bound)); } catch { /* In-memory ownership remains. */ }
  }, [unlocked, owner, pending]);
  const close = () => {
    setPending(null);
    try { sessionStorage.removeItem(KEY); } catch { /* Memory state still clears. */ }
  };
  // Ignore optimistic rows: a failed insert must leave the form open for retry.
  const duplicate = pending && (savedRefs.includes(pending.draft.ref) || transactions.some(tx => !tx.id.startsWith("tx-") && tx.note?.includes(walletMarker(pending.draft.ref))));
  const wrongAccount = pending?.owner && pending.owner !== owner;
  return <>
    {unlocked && (message || wrongAccount || duplicate) && <div role="alert" className="fixed inset-x-4 top-6 z-[100] mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-xl"><p className="text-sm">{message || (wrongAccount ? "Questo pagamento appartiene a un altro account. Riapri il collegamento con l’account corretto." : "Questo pagamento è già stato registrato.")}</p><button onClick={() => { setMessage(""); close(); }} className="mt-3 font-bold underline">Chiudi</button></div>}
    {unlocked && isHydrated && pending && !wrongAccount && !duplicate && pending.expires > Date.now() && <AddSpesaModal isOpen onClose={close} draft={pending.draft} onSaved={() => {
      try { localStorage.setItem(savedKey, JSON.stringify([...savedRefs, pending.draft.ref].slice(-200))); } catch { /* The persisted transaction retains its marker. */ }
    }} />}
  </>;
}
