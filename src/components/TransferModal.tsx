"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeftRight, ChevronDown, CreditCard, LoaderCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { parseTransactionAmount } from "@/lib/quickTransaction";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isFinite(parsed.getTime()) && `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}` === value;
}

const money = (value: number) => value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  return isOpen ? <TransferForm onClose={onClose} /> : null;
}

function TransferForm({ onClose }: Pick<TransferModalProps, "onClose">) {
  const { cards, activeCard, addTransfer } = useApp();
  const [fromCardId, setFromCardId] = useState(() => cards.find(card => card.id === activeCard?.id)?.id || cards[0]?.id || "");
  const [toCardId, setToCardId] = useState(() => cards.find(card => card.id !== (cards.find(item => item.id === activeCard?.id)?.id || cards[0]?.id))?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saveGuard = useRef(false);
  const requestId = useRef<string | null>(null);
  const requestPayload = useRef<{ fromCardId: string; toCardId: string; amount: number; date: string; note?: string } | null>(null);
  const live = useRef(false);
  const operation = useRef(0);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const dialogRef = useRef<HTMLFormElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const numericAmount = parseTransactionAmount(amount);
  const fromCard = cards.find(card => card.id === fromCardId);
  const toCard = cards.find(card => card.id === toCardId);
  const hasTwoCards = cards.length >= 2;

  useEffect(() => {
    live.current = true;
    const previousFocus = document.activeElement;
    amountRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saveGuard.current) { event.preventDefault(); closeCallback.current(); }
      if (event.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])") ?? []).filter(item => !item.closest("fieldset:disabled") && item.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      live.current = false;
      operation.current++;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  const chooseFrom = (id: string) => {
    if (id === toCardId) setToCardId(fromCardId);
    setFromCardId(id); setError("");
  };
  const chooseTo = (id: string) => {
    if (id === fromCardId) setFromCardId(toCardId);
    setToCardId(id); setError("");
  };
  const swapCards = () => { setFromCardId(toCardId); setToCardId(fromCardId); setError(""); };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (saveGuard.current) return;
    if (!requestPayload.current) {
      if (!hasTwoCards || !fromCard || !toCard) { setError("Scegli due carte disponibili per registrare il trasferimento."); return; }
      if (fromCardId === toCardId) { setError("La carta di partenza e quella di arrivo devono essere diverse."); return; }
      if (numericAmount === null || !Number.isSafeInteger(Math.round(numericAmount * 100))) { setError("Inserisci un importo maggiore di zero, con al massimo due decimali."); return; }
      if (!Number.isFinite(fromCard.balance) || Math.round(numericAmount * 100) > Math.round(fromCard.balance * 100)) { setError("Il saldo della carta di partenza non è sufficiente."); return; }
      if (!validDate(date)) { setError("Scegli una data valida per il trasferimento."); return; }
      requestPayload.current = { fromCardId, toCardId, amount: numericAmount, date, ...(note.trim() ? { note: note.trim() } : {}) };
    }
    saveGuard.current = true;
    const attempt = ++operation.current;
    setSaving(true); setError("");
    setSubmitted(true);
    try {
      requestId.current ??= crypto.randomUUID();
      const result = await addTransfer(requestPayload.current, requestId.current);
      if (!live.current || operation.current !== attempt) return;
      if (result?.error) { setError(result.error); return; }
      closeCallback.current();
    } catch {
      if (!live.current || operation.current !== attempt) return;
      setError("Non è stato possibile confermare il trasferimento. Riprova: i dati inseriti sono ancora qui.");
    } finally {
      if (live.current && operation.current === attempt) { saveGuard.current = false; setSaving(false); }
    }
  };

  return <div className="zero-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0B0B0B]/60 p-0 backdrop-blur-md sm:items-center sm:p-4">
    <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="transfer-title" aria-describedby="transfer-description" data-app-update-block="true" onSubmit={handleSave} className="zero-panel flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-[#A7A7A7]/30 bg-[#F7F7F5] shadow-2xl sm:rounded-[32px]">
      <header className="flex shrink-0 items-center justify-between px-6 pb-4 pt-5">
        <div className="flex items-center gap-2.5"><ArrowLeftRight aria-hidden="true" className="h-5 w-5" /><h2 id="transfer-title" className="text-lg font-black tracking-tight">Trasferisci tra carte</h2></div>
        <button type="button" onClick={() => { if (!saveGuard.current) onClose(); }} disabled={saving} aria-label="Chiudi" className="rounded-full bg-white p-2.5 disabled:opacity-40"><X className="h-4 w-4" /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto"><fieldset disabled={saving || submitted || !hasTwoCards} className="min-w-0 px-6 pb-4">
        <p id="transfer-description" className="mb-5 text-xs leading-relaxed text-[#666]">Aggiorna i saldi su ZERO. Non esegue un bonifico.</p>
        {!hasTwoCards && <p role="status" className="mb-4 rounded-2xl bg-[#FFF8D5] p-4 text-sm">Aggiungi almeno due carte nella sezione Carte per registrare un trasferimento.</p>}
        <label htmlFor="transfer-amount" className="block text-center text-xs font-bold text-[#777]">Importo da trasferire</label>
        <div className="mb-5 mt-1 flex items-center justify-center gap-2">
          <input ref={amountRef} id="transfer-amount" inputMode="decimal" autoComplete="off" value={amount} onFocus={event => event.currentTarget.select()} onChange={event => { setAmount(event.target.value); setError(""); }} placeholder="0,00" aria-invalid={!!error && numericAmount === null} aria-describedby={error ? "transfer-error" : undefined} className="w-48 min-w-0 bg-transparent py-1 text-center text-5xl font-black tracking-tight outline-none" />
          <span className="text-3xl font-bold text-[#888]">€</span>
        </div>
        <div className="rounded-[24px] border border-black/10 bg-white p-4">
          <label htmlFor="transfer-from" className="mb-1.5 block text-xs font-bold text-[#777]">Da quale carta</label>
          <div className="relative"><CreditCard aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#777]" /><select id="transfer-from" value={fromCardId} onChange={event => chooseFrom(event.target.value)} className="w-full appearance-none rounded-2xl border border-black/10 bg-[#F7F7F5] py-3 pl-10 pr-8 text-sm font-bold"><option value="" disabled>Scegli la carta di partenza</option>{fromCardId && !fromCard && <option value={fromCardId}>Carta non più disponibile</option>}{cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-3.5 h-4 w-4" /></div>
          {fromCard && <p className="mt-2 text-xs text-[#666]">Disponibili: <span className="font-bold text-[#121212]">{money(fromCard.balance)}</span></p>}
          <div className="my-2 flex items-center justify-center"><span className="flex-1 border-t border-black/5" /><button type="button" onClick={swapCards} disabled={!fromCard || !toCard} aria-label="Inverti carte" className="mx-3 rounded-full bg-[#FFF8D5] p-2.5 disabled:opacity-40"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button><span className="flex-1 border-t border-black/5" /></div>
          <label htmlFor="transfer-to" className="mb-1.5 block text-xs font-bold text-[#777]">A quale carta</label>
          <div className="relative"><CreditCard aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#777]" /><select id="transfer-to" value={toCardId} onChange={event => chooseTo(event.target.value)} className="w-full appearance-none rounded-2xl border border-black/10 bg-[#F7F7F5] py-3 pl-10 pr-8 text-sm font-bold"><option value="" disabled>Scegli la carta di arrivo</option>{toCardId && !toCard && <option value={toCardId}>Carta non più disponibile</option>}{cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-3.5 h-4 w-4" /></div>
          {toCard && <p className="mt-2 text-xs text-[#666]">Saldo attuale: <span className="font-bold text-[#121212]">{money(toCard.balance)}</span></p>}
        </div>
        <p className="mb-5 mt-3 text-center text-xs leading-relaxed text-[#666]">Non modifica spese, entrate o budget.</p>
        <label htmlFor="transfer-date" className="mb-1.5 block text-xs font-bold text-[#777]">Data del trasferimento</label>
        <input id="transfer-date" type="date" required value={date} onChange={event => { setDate(event.currentTarget.value); setError(""); }} onInput={event => setDate(event.currentTarget.value)} className="mb-4 w-full min-w-0 rounded-2xl border border-black/10 bg-white p-3.5 text-sm" />
        <label htmlFor="transfer-note" className="mb-1.5 block text-xs font-bold text-[#777]">Nota <span className="font-normal">(facoltativa)</span></label>
        <textarea id="transfer-note" value={note} maxLength={500} onChange={event => setNote(event.target.value)} placeholder="Es. Ricarica della carta" rows={2} className="w-full resize-none rounded-2xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#FDC909]" />
      </fieldset></div>
      <footer className="shrink-0 border-t border-black/5 px-6 pt-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}>
        {error && <p id="transfer-error" role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        {submitted && !saving && error && <p className="mb-3 text-xs leading-relaxed text-[#666]">Riprova con gli stessi dati. Prima di registrarne uno diverso, controlla lo storico nelle Carte.</p>}
        <button type="submit" disabled={saving || (!hasTwoCards && !submitted)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FDC909] py-4 text-sm font-black text-[#0B0B0B] transition-transform active:scale-[0.98] disabled:opacity-60">{saving ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />Salvataggio…</> : `${submitted ? "Riprova trasferimento" : "Registra trasferimento"}${numericAmount !== null ? ` · ${money(numericAmount)}` : ""}`}</button>
      </footer>
    </form>
  </div>;
}
