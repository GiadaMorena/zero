"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bankBrands } from "@/lib/bankBrands";
import { getCardAppearance } from "@/lib/cardAppearance";
import { BankCardDetails } from "@/components/BankCardDetails";

const cards = bankBrands.map((brand, index) => ({
  id: `logo-test-${index + 1}`,
  bankName: brand.label,
  number: `•••• ${1001 + index}`,
  expiry: "12/30",
  holder: "ZERO TEST",
}));

export default function BankTestAccount() {
  const [active, setActive] = useState(0);
  const [view, setView] = useState<"wallet" | "all">("wallet");
  const card = cards[active];
  return (
    <main className="mx-auto min-h-dvh max-w-5xl bg-[#F7F7F5] px-6 py-8 text-[#0B0B0B]">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#777]">Account demo</p><h1 className="mt-2 text-3xl font-black tracking-tight">Ciao, Zero Test</h1></div>
        <Link href="/" className="text-sm font-bold underline underline-offset-4">Vai all’app</Link>
      </header>
      <p className="mb-6 max-w-xl text-sm text-[#666]">{cards.length} carte fittizie, una per ogni marchio. Saldo zero. Questo profilo di prova non richiede registrazione.</p>
      <div className="mb-8 flex gap-2" aria-label="Vista carte">
        <button onClick={() => setView("wallet")} aria-pressed={view === "wallet"} className={`rounded-full px-5 py-3 text-sm font-bold ${view === "wallet" ? "bg-[#0B0B0B] text-white" : "bg-white"}`}>Portafoglio</button>
        <button onClick={() => setView("all")} aria-pressed={view === "all"} className={`rounded-full px-5 py-3 text-sm font-bold ${view === "all" ? "bg-[#0B0B0B] text-white" : "bg-white"}`}>Tutte le {cards.length} carte</button>
      </div>
      {view === "wallet" ? <section aria-label="Portafoglio di prova" className="mx-auto max-w-sm">
        <article key={card.id} data-bank={card.bankName} style={getCardAppearance(card.bankName)} className="flex h-[210px] flex-col justify-between overflow-hidden rounded-[24px] p-6 shadow-lg">
          <BankCardDetails bankName={card.bankName} number={card.number} expiry={card.expiry} holder={card.holder} />
        </article>
        <div className="mt-6 flex items-center justify-between gap-4">
          <button aria-label="Carta precedente" onClick={() => setActive((active - 1 + cards.length) % cards.length)} className="rounded-full bg-white p-3"><ChevronLeft /></button>
          <div aria-live="polite" className="text-center"><p className="text-sm font-bold">{card.bankName}</p><p className="mt-1 text-xs text-[#777]">{active + 1} di {cards.length} · 0,00 €</p></div>
          <button aria-label="Carta successiva" onClick={() => setActive((active + 1) % cards.length)} className="rounded-full bg-[#FDC909] p-3"><ChevronRight /></button>
        </div>
        <label className="mt-7 block text-xs font-bold" htmlFor="test-bank">Scegli una banca</label>
        <select id="test-bank" value={active} onChange={(event) => setActive(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm">
          {cards.map((item, index) => <option key={item.id} value={index}>{item.bankName}</option>)}
        </select>
      </section> : <section aria-label="Tutte le carte di prova" className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => <div key={item.id}>
          <article data-bank={item.bankName} style={getCardAppearance(item.bankName)} className="flex h-[190px] flex-col justify-between overflow-hidden rounded-[22px] p-5 shadow-md">
            <BankCardDetails bankName={item.bankName} number={item.number} expiry={item.expiry} holder={item.holder} />
          </article>
          <p className="mt-3 text-sm font-bold">{item.bankName}<span className="float-right font-normal text-[#777]">0,00 €</span></p>
        </div>)}
      </section>}
    </main>
  );
}
