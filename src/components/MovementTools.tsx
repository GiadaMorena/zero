"use client";
import { Download } from "lucide-react";
import type { CardItem, TransactionItem } from "@/context/AppContext";
import { movementsCsv, movementTotals, type MovementFilters } from "@/lib/movementLedger";
const money=(value:number)=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(value);
interface Props { filters: MovementFilters; onChange: (data: Partial<MovementFilters>) => void; onReset: () => void; cards: CardItem[]; results: TransactionItem[] }
export function MovementTools({filters,onChange,onReset,cards,results}:Props){
  const totals=movementTotals(results), active=filters.query || filters.category!=="Tutte" || filters.cardId!=="Tutte" || filters.period!=="all" || filters.type!=="all";
  const download=()=>{
    const url=URL.createObjectURL(new Blob([movementsCsv(results,cards)],{type:"text/csv;charset=utf-8"}));
    const date=new Date(),day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const link=document.createElement("a");link.href=url;link.download=`zero-movimenti-${day}.csv`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  };
  const style="mt-1.5 w-full min-w-0 rounded-xl border border-black/10 bg-[#F7F7F5] px-3 py-2.5 text-xs font-bold outline-none focus:border-[#FDC909]";
  return <section aria-label="Filtri e riepilogo movimenti" className="rounded-[24px] border border-black/10 bg-white p-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <label className="text-[10px] font-bold text-[#73736E]">Periodo<select value={filters.period} onChange={e=>onChange({period:e.target.value as MovementFilters["period"]})} className={style}><option value="all">Tutti i periodi</option><option value="month">Questo mese</option><option value="previous-month">Mese scorso</option><option value="year">Quest’anno</option></select></label>
      <label className="text-[10px] font-bold text-[#73736E]">Tipo<select value={filters.type} onChange={e=>onChange({type:e.target.value as MovementFilters["type"]})} className={style}><option value="all">Entrate e uscite</option><option value="expense">Solo uscite</option><option value="income">Solo entrate</option></select></label>
      <label className="text-[10px] font-bold text-[#73736E]">Carta<select value={filters.cardId} onChange={e=>onChange({cardId:e.target.value})} className={style}><option value="Tutte">Tutte le carte</option><option value="none">Nessuna carta</option>{cards.map(card=><option key={card.id} value={card.id}>{card.bankName} · {card.number}</option>)}</select></label>
      <button type="button" disabled={!results.length} onClick={download} className="self-end flex justify-center items-center gap-1.5 rounded-xl bg-[#0B0B0B] px-3 py-3 text-xs font-bold text-white disabled:opacity-40"><Download className="h-3.5 w-3.5"/>Scarica CSV</button>
    </div>
    <div className="grid grid-cols-3 gap-2 border-t border-black/10 pt-3 mt-4">{([["Uscite",totals.expense],["Entrate",totals.income],["Saldo",totals.net]] as const).map(([label,value])=><div key={label} className="min-w-0"><p className="text-[10px] text-[#73736E]">{label}</p><p className="text-xs sm:text-sm font-extrabold mt-1 break-words">{money(value)}</p></div>)}</div>
    <div className="flex justify-between items-center gap-2 mt-3"><p className="text-[10px] text-[#73736E]">{results.length} {results.length===1?"movimento":"movimenti"} · riepilogo dei risultati</p>{active && <button type="button" onClick={onReset} className="py-1 text-[11px] font-bold underline underline-offset-4">Azzera filtri</button>}</div>
  </section>;
}
