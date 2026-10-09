"use client";
import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { financialAnalysis, type AnalysisPeriod } from "@/lib/financialAnalysis";
import { AnalysisPeriodControls } from "./AnalysisPeriodControls";
const money = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
export function StatisticheScreen() {
  const { transactions } = useApp();
  const [tab, setTab] = useState<"Uscite" | "Entrate" | "Risparmio">("Uscite");
  const [period, setPeriod] = useState<AnalysisPeriod>("Mese");
  const [anchor, setAnchor] = useState(() => new Date());
  const data = financialAnalysis(transactions, period, anchor);
  const incomeBreakdown = tab === "Entrate" ? financialAnalysis(data.transactions.filter(tx => tx.type === "income").map(tx => ({ ...tx, type: "expense" as const })), period, anchor).categories : [];
  const categories = tab === "Entrate" ? incomeBreakdown : data.categories;
  const amount = tab === "Uscite" ? data.spent : tab === "Entrate" ? data.income : data.net;
  return <div style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }} className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] min-h-screen max-w-md mx-auto">
    <h1 className="px-1 text-2xl font-black tracking-tight">Statistiche</h1>
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-black/10 bg-white p-1.5">{(["Uscite", "Entrate", "Risparmio"] as const).map(item => <button key={item} type="button" aria-pressed={tab === item} onClick={() => setTab(item)} className={`py-2 rounded-xl text-xs font-bold ${tab === item ? "bg-[#FDC909]" : "text-[#73736E]"}`}>{item}</button>)}</div>
    <AnalysisPeriodControls period={period} anchor={anchor} onPeriod={setPeriod} onAnchor={setAnchor} />
    <div className="px-1"><p className={`text-3xl font-black tracking-tight ${tab === "Risparmio" && amount < 0 ? "text-red-700" : ""}`}>{money(amount)}</p><p className="mt-1 text-xs text-[#73736E]">{tab === "Risparmio" ? "Differenza tra entrate e uscite del periodo" : `${tab} del periodo`}</p></div>
    <section className="rounded-[24px] border border-black/10 bg-white p-4 flex flex-col gap-3 shadow-xs">
      <h2 className="text-xs font-bold">{tab === "Risparmio" ? "Come si calcola" : "Dettaglio categorie"}</h2>
      {tab === "Risparmio" ? <><div className="flex justify-between text-sm"><span>Entrate</span><strong>{money(data.income)}</strong></div><div className="flex justify-between text-sm"><span>Uscite</span><strong>− {money(data.spent)}</strong></div><p className="border-t border-black/5 pt-3 text-xs text-[#73736E]">{data.net < 0 ? "Le uscite superano le entrate nel periodo selezionato." : "Il saldo del periodo considera i movimenti registrati su tutte le carte."}</p></>
        : categories.length ? categories.map(item => <div key={item.name} className="flex justify-between gap-3 text-xs"><span className="font-bold">{item.name}</span><div className="text-right"><strong>{money(item.amount)}</strong><p className="mt-0.5 text-[#73736E]">{item.percent}%</p></div></div>) : <div className="py-5 text-xs text-[#73736E] flex flex-col items-center gap-2"><BarChart2 className="h-6 w-6" />Nessun dato per questo periodo.</div>}
    </section>
    {data.undated > 0 && <p className="px-1 text-xs text-[#73736E]">{data.undated} movimenti senza data valida esclusi dai totali.</p>}
  </div>;
}
