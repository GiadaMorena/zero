"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TransferModal } from "./TransferModal";

export function CardTransfers({ selectedCardIds = [] }: { selectedCardIds?: string[] }) {
  const { transfers, transfersLoading, transferLoadError } = useApp();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const filtered = selectedCardIds.length ? transfers.filter(item => selectedCardIds.includes(item.fromCardId || "") || selectedCardIds.includes(item.toCardId || "")) : transfers;
  const ordered = [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const visible = showAll ? ordered : ordered.slice(0, 5);

  return <section aria-labelledby="card-transfers-title" className="rounded-[24px] border border-black/10 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 id="card-transfers-title" className="text-sm font-extrabold text-[#121212]">Trasferimenti tra carte</h3><p className="mt-1 text-xs leading-relaxed text-[#73736E]">Sposti il saldo, senza cambiare spese o entrate.</p></div>
      <button type="button" onClick={() => setOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#FDC909] px-4 py-2.5 text-xs font-bold text-[#121212]"><Plus aria-hidden="true" className="h-4 w-4" />Nuovo trasferimento</button>
    </div>
    {transfersLoading ? <p role="status" className="pt-5 text-xs text-[#73736E]">Caricamento trasferimenti…</p> : transferLoadError ? <p role="status" className="mt-4 rounded-xl bg-[#F7F7F5] p-3 text-xs leading-relaxed text-[#73736E]">{transferLoadError}</p> : !visible.length ? <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F7F7F5] p-4"><ArrowLeftRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#73736E]" /><p className="text-xs leading-relaxed text-[#73736E]">{selectedCardIds.length ? "Nessun trasferimento per le carte selezionate." : "I trasferimenti che registri saranno visibili qui, separati dagli altri movimenti."}</p></div> : null}
    {visible.length > 0 && <ul className="mt-4 divide-y divide-black/5">{visible.map(item => <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1"><div className="flex items-start gap-2"><span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF8D5]"><ArrowLeftRight className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="break-words text-xs font-bold leading-relaxed text-[#121212]">{item.fromLabel}</p><p className="mt-0.5 flex items-center gap-1.5 break-words text-xs leading-relaxed text-[#73736E]"><ArrowRight aria-label="verso" className="h-3 w-3 shrink-0" />{item.toLabel}</p></div></div></div>
        <div className="shrink-0 text-right"><p className="text-sm font-extrabold text-[#121212]">{item.amount.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</p><time dateTime={item.date} className="mt-1 block text-[10px] text-[#73736E]">{new Date(`${item.date}T12:00:00`).toLocaleDateString("it-IT")}</time></div>
      </div>
      {item.note && <p className="ml-9 mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-[#73736E]">{item.note}</p>}
    </li>)}</ul>}
    {ordered.length > 5 && <button type="button" aria-expanded={showAll} onClick={() => setShowAll(value => !value)} className="mt-4 py-2 text-xs font-bold underline underline-offset-4">{showAll ? "Mostra gli ultimi 5" : `Mostra tutti (${ordered.length})`}</button>}
    <TransferModal isOpen={open} onClose={() => setOpen(false)} />
  </section>;
}
