"use client";
import { useState } from "react";
import { PieChart, TrendingDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { financialAnalysis, type AnalysisPeriod } from "@/lib/financialAnalysis";
import { AnalysisPeriodControls } from "./AnalysisPeriodControls";

const money = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
export function AnalisiScreen() {
  const { transactions } = useApp();
  const [period, setPeriod] = useState<AnalysisPeriod>("Mese");
  const [anchor, setAnchor] = useState(() => new Date());
  const data = financialAnalysis(transactions, period, anchor);
  let offset = 0;
  const segments = data.categories.map(category => { const item = { ...category, offset }; offset += category.share * 100; return item; });
  return <div style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }} className="flex min-h-screen max-w-md flex-col gap-4 bg-[#F7F7F5] px-4 pb-32 mx-auto">
    <h1 className="px-1 text-2xl font-black tracking-tight">Analisi spese</h1>
    <AnalysisPeriodControls period={period} anchor={anchor} onPeriod={setPeriod} onAnchor={setAnchor} />
    <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-xs flex flex-col items-center gap-5">
      <div className="relative h-44 w-44">
        <svg role="img" aria-label={`Uscite del periodo: ${money(data.spent)}. Dettaglio per categoria sotto il grafico.`} className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#EBEBE5" strokeWidth="12" />
          {segments.map(item => <circle key={item.name} cx="50" cy="50" r="38" pathLength="100" fill="none" stroke={item.color} strokeWidth="12" strokeDasharray={`${item.share * 100} ${100 - item.share * 100}`} strokeDashoffset={-item.offset} />)}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-lg font-black">{money(data.spent)}</span><span className="text-[11px] text-[#73736E]">Totale uscite</span></div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full border-t border-black/5 pt-4 text-center">
        <div><p className="text-[11px] text-[#73736E]">Entrate</p><p className="text-sm font-black mt-1">{money(data.income)}</p></div>
        <div><p className="text-[11px] text-[#73736E]">Saldo del periodo</p><p className={`text-sm font-black mt-1 ${data.net < 0 ? "text-red-700" : ""}`}>{money(data.net)}</p></div>
      </div>
    </div>
    <div className="flex flex-col gap-3 rounded-[24px] border border-black/10 bg-white p-4 shadow-xs">
      <h2 className="text-xs font-bold">Dove hai speso</h2>
      {data.categories.length ? data.categories.map(item => <div key={item.name} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="text-xs font-bold truncate">{item.name}</span></div><div className="text-right shrink-0"><p className="text-xs font-black">{money(item.amount)}</p><p className="text-[11px] text-[#73736E]">{item.percent}%</p></div></div>) : <div className="flex flex-col items-center gap-2 py-5 text-xs text-[#73736E]"><PieChart className="h-6 w-6" />Nessuna spesa nel periodo selezionato.</div>}
    </div>
    {data.undated > 0 && <p className="px-1 text-xs text-[#73736E]">{data.undated} {data.undated === 1 ? "movimento senza data valida, escluso" : "movimenti senza data valida, esclusi"} dai totali. Puoi correggere la data in Spese & Movimenti.</p>}
    {data.categories[0] && <div className="flex items-center gap-3 rounded-[20px] bg-[#FDC909] p-4"><TrendingDown className="h-5 w-5 shrink-0" /><p className="text-xs font-semibold">{data.categories[0].name} è la categoria principale: {money(data.categories[0].amount)}, il {data.categories[0].percent}% delle uscite.</p></div>}
  </div>;
}
