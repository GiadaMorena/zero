"use client";

import React, { useState } from "react";
import {
  Plus,
  ArrowUpRight,
  Scan,
  MoreHorizontal,
  Info,
  ChevronRight,
  ShoppingCart,
  Car,
  Briefcase,
  Laptop,
  Layers,
  Lightbulb,
  TrendingUp,
  ArrowDownLeft,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { WalletCarousel } from "./WalletCarousel";
import { HomeTrendChart } from "./HomeTrendChart";
import { useApp } from "@/context/AppContext";
import { ReceiptScanModal } from "./ReceiptScanModal";
import { AltroMenuSheet } from "./AltroMenuSheet";

interface HomeScreenProps {
  onOpenAddModal: () => void;
  onNavigate: (tab: any) => void;
}

export function HomeScreen({ onOpenAddModal, onNavigate }: HomeScreenProps) {
  const {
    activeCard,
    setActiveCardIndex,
    transactions,
    goals,
    subscriptions,
    totalActiveSubscriptionsCost,
  } = useApp();

  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isAltroOpen, setIsAltroOpen] = useState(false);

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const nextGoal = goals[0] || { title: "MacBook", current: 1240, target: 2000, percent: 62 };
  const activeSubsCount = subscriptions.filter((s) => s.active).length;

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* ── 1. HEADER ── */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#121212] flex items-center gap-2">
            Ciao Giada <span className="inline-block text-xl">👋</span>
          </h1>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Un passo alla volta, grandi obiettivi.
          </p>
        </div>
        <button
          onClick={() => onNavigate("profilo")}
          className="relative h-10 w-10 rounded-full bg-[#121212] flex items-center justify-center text-white font-extrabold text-sm shadow-md hover:scale-105 transition-transform"
        >
          G
          <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#F5E050] ring-2 ring-[#F8F8F5]" />
        </button>
      </div>

      {/* ── 2. WALLET CAROUSEL ── */}
      <div className="-mx-4">
        <WalletCarousel onCardSelect={(_, idx) => setActiveCardIndex(idx)} />
      </div>

      {/* ── 3. DISPONIBILITÀ (Card Bianca Compatta) ── */}
      <div className="rounded-[22px] bg-white border border-[#EBEBE5] p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-[#73736E] font-semibold mb-0.5">
            <span>Disponibili su {activeCard.bankName}</span>
            <Info className="h-3 w-3 text-[#A3A39E]" />
          </div>
          <div className="text-2xl font-black text-[#121212] tracking-tight">
            {money(activeCard.balance)}
          </div>
        </div>

        {/* Badge a Destra */}
        <div className="px-3 py-1.5 rounded-2xl bg-[#FEF9C3] border border-[#F5E050]/60 flex flex-col items-end">
          <div className="flex items-center gap-0.5 text-xs font-black text-[#121212]">
            <TrendingUp className="h-3.5 w-3.5 text-[#121212]" />
            <span>-12%</span>
          </div>
          <span className="text-[9px] text-[#73736E] font-medium leading-tight">
            rispetto al mese scorso
          </span>
        </div>
      </div>

      {/* ── 4. AZIONI RAPIDE (4 Card Grid) ── */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Card 1: Aggiungi Spesa */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-[#FEF9C3] border border-[#F5E050]/80 shadow-xs hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center mb-1.5 shadow-xs">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Aggiungi spesa
          </span>
        </button>

        {/* Card 2: Nuova Entrata */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white border border-[#EBEBE5] shadow-xs hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5]">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Nuova entrata
          </span>
        </button>

        {/* Card 3: Scansiona Scontrino */}
        <button
          onClick={() => setIsScanOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white border border-[#EBEBE5] shadow-xs hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5]">
            <Scan className="h-4.5 w-4.5" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Scansiona scontrino
          </span>
        </button>

        {/* Card 4: Altro */}
        <button
          onClick={() => setIsAltroOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white border border-[#EBEBE5] shadow-xs hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5]">
            <MoreHorizontal className="h-4.5 w-4.5" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Altro
          </span>
        </button>
      </div>

      {/* ── 5. ULTIMI MOVIMENTI ── */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-extrabold text-[#121212]">I tuoi ultimi movimenti</h3>
          <button
            onClick={() => onNavigate("spese")}
            className="flex items-center gap-0.5 text-xs text-[#73736E] font-semibold hover:text-[#121212]"
          >
            <span>Vedi tutti</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Single White Card containing top 3 transactions */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-3.5 shadow-xs flex flex-col divide-y divide-[#F4F4F0]">
          {transactions.slice(0, 3).map((tx) => {
            const isIncome = tx.amount > 0;
            return (
              <div
                key={tx.id}
                onClick={() => onNavigate("spese")}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212] shrink-0">
                    {tx.category === "Cibo" ? (
                      <ShoppingCart className="h-4 w-4 text-[#555]" />
                    ) : tx.category === "Trasporti" ? (
                      <Car className="h-4 w-4 text-[#555]" />
                    ) : tx.category === "Entrata" ? (
                      <DollarSign className="h-4 w-4 text-[#555]" />
                    ) : (
                      <ShoppingBag className="h-4 w-4 text-[#555]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#121212] leading-tight">
                      {tx.title}
                    </h4>
                    <p className="text-[10px] text-[#73736E] font-medium mt-0.5">
                      {tx.category} · {tx.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-black ${
                      isIncome ? "text-[#166534]" : "text-[#121212]"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {money(Math.abs(tx.amount))}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#C4C4BE]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. PANORAMICA FINANZIARIA ── */}
      <HomeTrendChart />

      {/* ── 7. OBIETTIVO + ABBONAMENTI (2 Card Affiancate) ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card Sinistra: Obiettivo */}
        <div
          onClick={() => onNavigate("obiettivi")}
          className="rounded-[24px] bg-white border border-[#EBEBE5] p-3.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#121212] transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#73736E]">
                Il tuo prossimo obiettivo
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#A3A39E]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212] shrink-0">
                <Laptop className="h-4 w-4 text-[#555]" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#121212] leading-tight">
                  {nextGoal.title}
                </h4>
                <p className="text-[10px] text-[#73736E] font-medium">
                  {money(nextGoal.current)} / {money(nextGoal.target)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="w-full h-2 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] overflow-hidden mb-1">
              <div
                className="h-full bg-[#F5E050] rounded-full transition-all duration-500"
                style={{ width: `${nextGoal.percent}%` }}
              />
            </div>
            <div className="text-right text-[10px] font-black text-[#73736E]">
              {nextGoal.percent}%
            </div>
          </div>
        </div>

        {/* Card Destra: Abbonamenti */}
        <div
          onClick={() => onNavigate("abbonamenti")}
          className="rounded-[24px] bg-white border border-[#EBEBE5] p-3.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#121212] transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#73736E]">
                I tuoi abbonamenti
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#A3A39E]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212] shrink-0">
                <Layers className="h-4 w-4 text-[#555]" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#121212] leading-tight">
                  {activeSubsCount} attivi
                </h4>
                <p className="text-[10px] text-[#73736E] font-medium">
                  {money(totalActiveSubscriptionsCost)} / mese
                </p>
              </div>
            </div>

            {/* App Icons */}
            <div className="flex items-center -space-x-1.5 my-1.5">
              <div className="h-5 w-5 rounded-full bg-[#1DB954] text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                S
              </div>
              <div className="h-5 w-5 rounded-full bg-[#E50914] text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                N
              </div>
              <div className="h-5 w-5 rounded-full bg-[#38BDF8] text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                ☁
              </div>
              <div className="h-5 w-5 rounded-full bg-[#EBEBE5] text-[#73736E] text-[8px] font-extrabold flex items-center justify-center ring-2 ring-white">
                +{Math.max(0, activeSubsCount - 3)}
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#73736E] font-medium pt-1 border-t border-[#F4F4F0] truncate">
            Prossimo: <span className="font-bold text-[#121212]">Spotify · 15 Set</span>
          </div>
        </div>
      </div>

      {/* ── 8. BANNER MOTIVAZIONALE ── */}
      <div className="rounded-[20px] bg-white border border-[#EBEBE5] p-3 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center shrink-0 border border-[#F5E050]/50">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#121212] leading-tight">
              Piccoli passi, grandi risultati.
            </p>
            <p className="text-[10px] text-[#73736E] font-medium mt-0.5">
              Sei sulla strada giusta!
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#A3A39E] shrink-0" />
      </div>

      {/* Modals */}
      <ReceiptScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
      <AltroMenuSheet isOpen={isAltroOpen} onClose={() => setIsAltroOpen(false)} />
    </div>
  );
}
