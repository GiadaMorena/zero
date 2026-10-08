"use client";
import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, X, LoaderCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { monthlySummary } from "@/lib/monthlyBudget";
import { parseTransactionAmount } from "@/lib/quickTransaction";
const euro = (value: number) => value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export function MonthlyBudgetCard() {
  const { transactions, monthlyBudget, updateMonthlyBudget } = useApp();
  const summary = monthlySummary(transactions);
  const [editing, setEditing] = useState(false), [input, setInput] = useState(""), [error, setError] = useState(""), [saving, setSaving] = useState(false);
  const guard = useRef(false);
  const dialogRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!editing) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) { event.preventDefault(); setEditing(false); }
      if (event.key !== "Tab") return;
      const fields = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])") ?? []).filter(field => field.getClientRects().length > 0);
      if (!fields.length) return;
      const first = fields[0], last = fields[fields.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [editing, saving]);
  const month = new Date().toLocaleDateString("it-IT", { month: "long" });
  const remaining = monthlyBudget === null ? 0 : Math.round((monthlyBudget - summary.spent) * 100) / 100;
  const percent = monthlyBudget === null ? 0 : Math.round(summary.spent / monthlyBudget * 100);
  const open = () => { setInput(monthlyBudget?.toFixed(2).replace(".", ",") || ""); setError(""); setEditing(true); };
  const save = async (value: number | null) => {
    if (guard.current) return;
    guard.current = true; setSaving(true); setError("");
    try { const result = await updateMonthlyBudget(value); if (result.error) setError(result.error); else setEditing(false); }
    catch { setError("Non è stato possibile salvare. Riprova."); }
    finally { guard.current = false; setSaving(false); }
  };
  return <>
    <section aria-label="Budget mensile" className="rounded-[22px] border border-[#A7A7A7]/20 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-extrabold tracking-tight">Budget di {month}</h2><p className="mt-1 text-[11px] text-[#777]">Spese di tutte le carte</p></div>
        <button type="button" onClick={open} aria-label={monthlyBudget === null ? "Imposta budget mensile" : "Modifica budget mensile"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F7F5]">{monthlyBudget === null ? <Plus className="h-4 w-4" /> : <Pencil className="h-3.5 w-3.5" />}</button>
      </div>
      {monthlyBudget === null ? <>
        <p className="text-2xl font-black tracking-tight">{euro(summary.spent)} <span className="text-xs font-medium text-[#777]">spesi questo mese</span></p>
        <p className="mb-4 mt-2 text-xs leading-relaxed text-[#777]">Scegli un limite per vedere quanto resta nel tuo budget.</p>
        <button type="button" onClick={open} className="rounded-full bg-[#FDC909] px-5 py-2.5 text-xs font-black">Imposta il budget</button>
      </> : <>
        <p className={`text-[11px] font-bold ${remaining < 0 ? "text-[#A63B29]" : "text-[#777]"}`}>{remaining < 0 ? "Oltre il budget" : "Ti restano"}</p>
        <p className={`mt-1 text-3xl font-black tracking-tight ${remaining < 0 ? "text-[#A63B29]" : "text-[#0B0B0B]"}`}>{euro(Math.abs(remaining))}</p>
        <div role="progressbar" aria-label="Budget utilizzato" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(percent,100)} aria-valuetext={`${percent}% del budget utilizzato`} className="my-4 h-2 overflow-hidden rounded-full bg-[#F0F0EB]"><div className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${remaining < 0 ? "bg-[#A63B29]" : "bg-[#FDC909]"}`} style={{width:`${Math.min(percent,100)}%`}} /></div>
        <div className="flex justify-between gap-3 text-[11px]"><span className="text-[#777]">Speso <strong className="text-[#0B0B0B]">{euro(summary.spent)}</strong></span><span className="text-[#777]">Limite <strong className="text-[#0B0B0B]">{euro(monthlyBudget)}</strong></span></div>
        {percent >= 80 && remaining >= 0 && <p className="mt-3 text-[11px] font-semibold text-[#777]">Hai utilizzato il {percent}% del budget.</p>}
      </>}
      {summary.undated > 0 && <p className="mt-3 text-[10px] leading-relaxed text-[#777]">{summary.undated} {summary.undated === 1 ? "movimento senza data non conteggiato" : "movimenti senza data non conteggiati"}.</p>}
    </section>
    {editing && <div className="zero-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title" onSubmit={event => {event.preventDefault();const value = parseTransactionAmount(input);if(value === null) setError("Inserisci un limite maggiore di zero, con al massimo due decimali.");else void save(value);}} className="zero-panel w-full max-w-sm rounded-t-[28px] bg-[#F7F7F5] p-6 sm:rounded-[28px]" style={{paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 1.5rem)"}}>
        <div className="mb-3 flex items-center justify-between"><h2 id="budget-dialog-title" className="text-lg font-black">Il tuo budget mensile</h2><button type="button" aria-label="Chiudi budget" disabled={saving} onClick={() => setEditing(false)} className="rounded-full bg-white p-2"><X className="h-4 w-4" /></button></div>
        <p className="mb-5 text-xs leading-relaxed text-[#777]">Il limite vale per tutte le spese e si rinnova ogni mese. Puoi modificarlo quando vuoi.</p>
        <label htmlFor="monthly-budget" className="mb-2 block text-xs font-bold">Limite in euro</label><input id="monthly-budget" autoFocus inputMode="decimal" disabled={saving} value={input} onChange={event => {setInput(event.target.value);setError("");}} placeholder="Es. 500,00" className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-2xl font-black outline-none focus:border-[#FDC909]" />
        {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#FDC909] py-3.5 text-sm font-black disabled:opacity-50">{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" />Salvataggio…</> : "Salva budget"}</button>
        {monthlyBudget !== null && <button type="button" disabled={saving} onClick={() => void save(null)} className="mt-3 w-full py-2 text-xs font-bold text-[#777]">Rimuovi il limite</button>}
      </form>
    </div>}
  </>;
}
