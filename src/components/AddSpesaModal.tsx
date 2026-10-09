"use client";

import { useEffect, useRef, useState } from "react";
import { X, Home, Utensils, Fuel, ShoppingBag, Smile, Heart, RefreshCw, MoreHorizontal, DollarSign, TrendingUp, CreditCard, Briefcase, Gift, Award, ChevronDown, LoaderCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { TransactionItem } from "@/context/AppContext";
import { transactionDate } from "@/lib/monthlyBudget";
import { parseTransactionAmount, preferredTransactionCard, recentTransactionCategories } from "@/lib/quickTransaction";

const expenseCategories = [
  { name: "Casa", icon: Home }, { name: "Cibo", icon: Utensils }, { name: "Trasporti", icon: Fuel }, { name: "Shopping", icon: ShoppingBag },
  { name: "Svago", icon: Smile }, { name: "Salute", icon: Heart }, { name: "Abbonamenti", icon: RefreshCw }, { name: "Altro", icon: MoreHorizontal },
];
const incomeCategories = [
  { name: "Entrata", icon: DollarSign }, { name: "Stipendio", icon: Briefcase }, { name: "Rimborso", icon: TrendingUp },
  { name: "Regalo", icon: Gift }, { name: "Bonus", icon: Award }, { name: "Altro", icon: MoreHorizontal },
];

interface AddSpesaModalProps { isOpen: boolean; onClose: () => void; defaultType?: "expense" | "income"; transaction?: TransactionItem }

export function AddSpesaModal({ isOpen, onClose, defaultType = "expense", transaction }: AddSpesaModalProps) {
  // A new form mounts on opening; account/card refreshes cannot erase a draft.
  return isOpen ? <TransactionForm key={transaction?.id || "new"} onClose={onClose} defaultType={transaction?.type || defaultType} transaction={transaction} /> : null;
}

function TransactionForm({ onClose, defaultType, transaction }: Omit<AddSpesaModalProps, "isOpen"> & { defaultType: "expense" | "income" }) {
  const { addTransaction, updateTransaction, cards, activeCard, transactions } = useApp();
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState(transaction?.title || "");
  const [amount, setAmount] = useState(transaction ? Math.abs(transaction.amount).toFixed(2).replace(".", ",") : "");
  const [category, setCategory] = useState(() => transaction?.category || recentTransactionCategories(transactions, defaultType, (defaultType === "expense" ? expenseCategories : incomeCategories).map(item => item.name))[0] || (defaultType === "expense" ? "Cibo" : "Entrata"));
  const [selectedCardId, setSelectedCardId] = useState(() => transaction ? transaction.cardId : preferredTransactionCard(cards, transactions, activeCard?.id));
  const [note, setNote] = useState(transaction?.note || "");
  const [date, setDate] = useState(() => {
    const parsed = transaction ? transactionDate(transaction) : null;
    return parsed ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}` : "";
  });
  const [allCategories, setAllCategories] = useState(!!transaction);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const saveGuard = useRef(false);
  const dialogRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary") ?? []).filter(item => item.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [saving, onClose]);
  const baseCategories = type === "expense" ? expenseCategories : incomeCategories;
  const currentCategories = transaction && !baseCategories.some(item => item.name === category) ? [...baseCategories, { name: category, icon: MoreHorizontal }] : baseCategories;
  const recentCategories = recentTransactionCategories(transactions, type, currentCategories.map(item => item.name));
  const visibleCategories = allCategories || !recentCategories.length ? currentCategories : currentCategories.filter(item => recentCategories.includes(item.name));
  const cardId = transaction ? selectedCardId : cards.some(card => card.id === selectedCardId) ? selectedCardId : preferredTransactionCard(cards, transactions, activeCard?.id);
  const numericAmount = parseTransactionAmount(amount);

  const switchType = (nextType: "expense" | "income") => {
    setType(nextType);
    const allowed = (nextType === "expense" ? expenseCategories : incomeCategories).map(item => item.name);
    setCategory(recentTransactionCategories(transactions, nextType, allowed)[0] ?? (nextType === "expense" ? "Cibo" : "Entrata"));
    setAllCategories(false);
    setError("");
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saveGuard.current) return;
    if (numericAmount === null) { setError("Inserisci un importo maggiore di zero, con al massimo due decimali."); return; }
    if (transaction && !/^\d{4}-\d{2}-\d{2}$/.test(date)) { setError("Scegli la data del movimento."); return; }
    if (transaction && cardId && !cards.some(card => card.id === cardId)) { setError("La carta originale non è più disponibile. Scegli una carta o Nessuna carta."); return; }
    saveGuard.current = true;
    setSaving(true);
    setError("");
    try {
      const data = { title: title.trim() || category, category, amount: numericAmount, type, note: note.trim(), cardId };
      const result = transaction ? await updateTransaction(transaction.id, { ...data, date }) : await addTransaction(data);
      if (result?.error) { setError(result.error); return; }
      onClose();
    } catch {
      setError("Non è stato possibile salvare. Riprova: i dati inseriti sono ancora qui.");
    } finally { saveGuard.current = false; setSaving(false); }
  };

  return <div className="zero-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0B0B0B]/60 p-0 backdrop-blur-md sm:items-center sm:p-4">
    <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="transaction-title" onSubmit={handleSave} className="zero-panel flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-[#A7A7A7]/30 bg-[#F7F7F5] shadow-2xl sm:rounded-[32px]">
      <header className="flex shrink-0 items-center justify-between px-6 pb-4 pt-5">
        <h2 id="transaction-title" className="text-lg font-black tracking-tight">{transaction ? "Modifica movimento" : type === "expense" ? "Aggiungi spesa" : "Nuova entrata"}</h2>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Chiudi" className="rounded-full bg-white p-2.5 disabled:opacity-40"><X className="h-4 w-4" /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto"><fieldset disabled={saving} className="min-w-0 px-6 pb-2">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-white p-1">
          {(["expense", "income"] as const).map(item => <button key={item} type="button" aria-pressed={type === item} onClick={() => switchType(item)} className={`rounded-full py-2.5 text-xs font-bold ${type === item ? "bg-[#0B0B0B] text-white" : "text-[#777]"}`}>{item === "expense" ? "− Spesa" : "+ Entrata"}</button>)}
        </div>
        <label htmlFor="transaction-amount" className="block text-center text-xs font-bold text-[#777]">Importo</label>
        <div className="mb-5 mt-1 flex items-center justify-center gap-2">
          <input id="transaction-amount" inputMode="decimal" autoComplete="off" autoFocus value={amount} onFocus={event => event.currentTarget.select()} onChange={event => {setAmount(event.target.value); setError("");}} placeholder="0,00" aria-invalid={!!error && numericAmount === null} aria-describedby={error ? "transaction-error" : undefined} className="w-48 min-w-0 bg-transparent py-1 text-center text-5xl font-black tracking-tight outline-none" />
          <span className="text-3xl font-bold text-[#888]">€</span>
        </div>
        <label htmlFor="transaction-description" className="mb-1.5 block text-xs font-bold text-[#777]">{type === "expense" ? "Per cosa?" : "Da dove?"} <span className="font-normal">(facoltativo)</span></label>
        <input id="transaction-description" value={title} onChange={event => setTitle(event.target.value)} placeholder={type === "expense" ? "Es. Spesa al supermercato" : "Es. Stipendio"} className="mb-5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-[#FDC909]" />
        <div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold text-[#777]">{recentCategories.length && !allCategories ? "Categorie recenti" : "Categoria"}</p>{recentCategories.length > 0 && <button type="button" onClick={() => setAllCategories(!allCategories)} className="text-xs font-bold underline underline-offset-2">{allCategories ? "Mostra recenti" : "Tutte le categorie"}</button>}</div>
        <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visibleCategories.map(item => {const Icon = item.icon; return <button type="button" key={item.name} aria-pressed={category === item.name} onClick={() => setCategory(item.name)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-[11px] font-semibold transition-colors ${category === item.name ? "border-[#0B0B0B] bg-[#0B0B0B] text-white" : "border-black/10 bg-white text-[#666]"}`}><Icon className="h-4 w-4" />{item.name}</button>;})}
        </div>
        {transaction && <><label htmlFor="transaction-date" className="mb-1.5 block text-xs font-bold text-[#777]">Data del movimento</label><input id="transaction-date" type="date" required value={date} onChange={event => setDate(event.currentTarget.value)} onInput={event => setDate(event.currentTarget.value)} className="mb-5 w-full min-w-0 rounded-2xl border border-black/10 bg-white p-3.5 text-sm" /></>}
        <label htmlFor="transaction-card" className="mb-1.5 block text-xs font-bold text-[#777]">Carta / conto</label>
        {cards.length ? <div className="relative mb-4"><CreditCard aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-[#777]" /><select id="transaction-card" value={cardId} onChange={event => setSelectedCardId(event.target.value)} className="w-full appearance-none rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-9 text-sm font-bold">{transaction && <option value="">Nessuna carta</option>}{transaction && cardId && !cards.some(card => card.id === cardId) && <option value={cardId}>Carta non più disponibile</option>}{cards.map(card => <option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-4 h-4 w-4" /></div> : transaction ? <select id="transaction-card" value={cardId} onChange={event => setSelectedCardId(event.target.value)} className="mb-4 w-full rounded-2xl bg-white p-3"><option value="">Nessuna carta</option>{cardId && <option value={cardId}>Carta non più disponibile</option>}</select> : <p className="mb-4 text-sm text-[#777]">Movimento senza carta associata</p>}
        <details className="mb-3"><summary className="cursor-pointer py-1 text-xs font-bold text-[#777]">Altri dettagli</summary><label htmlFor="transaction-note" className="mb-1 mt-3 block text-xs font-bold text-[#777]">Nota (facoltativa)</label><textarea id="transaction-note" value={note} onChange={event => setNote(event.target.value)} rows={2} className="w-full resize-none rounded-2xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#FDC909]" /></details>
      </fieldset></div>
      <footer className="shrink-0 border-t border-black/5 px-6 pt-4" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 1.25rem)"}}>
        {error && <p id="transaction-error" role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FDC909] py-4 text-sm font-black text-[#0B0B0B] transition-transform active:scale-[0.98] disabled:opacity-60">{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" />Salvataggio…</> : `Salva ${transaction ? "modifiche" : type === "expense" ? "spesa" : "entrata"}${numericAmount !== null ? ` · ${numericAmount.toLocaleString("it-IT", {style:"currency",currency:"EUR"})}` : ""}`}</button>
      </footer>
    </form>
  </div>;
}
