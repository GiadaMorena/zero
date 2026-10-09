"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { periodRange, shiftPeriod, type AnalysisPeriod } from "@/lib/financialAnalysis";

export function AnalysisPeriodControls({ period, anchor, onPeriod, onAnchor, includeWeek = false }: { period: AnalysisPeriod; anchor: Date; onPeriod: (period: AnalysisPeriod) => void; onAnchor: (date: Date) => void; includeWeek?: boolean }) {
  const periods: AnalysisPeriod[] = includeWeek ? ["Settimana", "Mese", "Trimestre", "Anno"] : ["Mese", "Trimestre", "Anno"];
  const range = periodRange(period, anchor);
  const current = periodRange(period, new Date());
  const atCurrent = range.start.getTime() === current.start.getTime();
  return <div className="flex flex-col gap-2">
    <div aria-label="Durata del periodo" className={`grid ${includeWeek ? "grid-cols-4" : "grid-cols-3"} gap-1 rounded-2xl border border-black/10 bg-white p-1.5`}>
      {periods.map(item => <button key={item} type="button" aria-pressed={period === item} onClick={() => onPeriod(item)} className={`rounded-xl px-2 py-2 text-xs font-bold transition-colors ${period === item ? "bg-[#FDC909] text-[#0B0B0B]" : "text-[#73736E]"}`}>{item}</button>)}
    </div>
    <div className="flex items-center justify-between gap-2">
      <button type="button" aria-label="Periodo precedente" onClick={() => onAnchor(shiftPeriod(period, anchor, -1))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-black/10"><ChevronLeft className="h-4 w-4" /></button>
      <span aria-live="polite" className="text-center text-xs font-bold capitalize">{range.label}</span>
      <button type="button" aria-label="Periodo successivo" disabled={range.start >= current.start} onClick={() => onAnchor(shiftPeriod(period, anchor, 1))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-black/10 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
    </div>
    {!atCurrent && <button type="button" onClick={() => onAnchor(new Date())} className="self-center py-1 text-xs font-bold underline underline-offset-2">Torna al periodo attuale</button>}
  </div>;
}
