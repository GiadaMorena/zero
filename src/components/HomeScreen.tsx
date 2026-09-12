import React, { useState } from "react";
import { Plus, ArrowUpRight, Scan, MoreHorizontal, Eye, EyeOff, ChevronRight, TrendingUp } from "lucide-react";

interface HomeScreenProps {
  balance: number;
  income: number;
  spending: number;
  onOpenAddModal: () => void;
  onNavigate: (tab: any) => void;
}

export function HomeScreen({
  balance = 1245.8,
  income = 1800.0,
  spending = 554.2,
  onOpenAddModal,
  onNavigate,
}: HomeScreenProps) {
  const [showBalance, setShowBalance] = useState(true);

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const formatBalance = (val: number) => {
    if (!showBalance) return "••••••••";
    return money(val);
  };

  return (
    <div className="flex flex-col gap-5 p-5 pt-safe pb-24 bg-[#F8F8F5] select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#121212] flex items-center gap-2">
            Ciao Giada <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Un passo alla volta, grandi obiettivi.
          </p>
        </div>
        <div
          onClick={() => onNavigate("profilo")}
          className="relative cursor-pointer h-10 w-10 rounded-full bg-[#121212] border-2 border-[#F5E050] flex items-center justify-center text-white font-bold text-sm shadow-md"
        >
          G
          <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#F5E050] ring-2 ring-white" />
        </div>
      </div>

      {/* Dark Hero Card: Disponibilità attuale */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#121212] text-white p-6 shadow-xl border border-[#262626]">
        {/* Yellow ambient glow gradient inside dark card */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F5E050]/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F5E050] to-transparent opacity-40" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-[#A3A39E] text-xs font-medium mb-2">
            <span>Disponibilità attuale</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 transition-colors"
              title={showBalance ? "Nascondi saldo" : "Mostra saldo"}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          <div className="text-3xl font-extrabold tracking-tight mb-4 text-white">
            {formatBalance(balance)}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-[#F5E050] border border-white/10">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>-12% rispetto al mese scorso</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (4 grid) */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050] transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-[#121212] text-center leading-tight">
            Aggiungi spesa
          </span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050] transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-[#121212] text-center leading-tight">
            Nuova entrata
          </span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050] transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <Scan className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-[#121212] text-center leading-tight">
            Scansione scontrino
          </span>
        </button>

        <button
          onClick={() => onNavigate("profilo")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050] transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-[#121212] text-center leading-tight">
            Altro
          </span>
        </button>
      </div>

      {/* Banner Card: Disciplina oggi, libertà domani. */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#EBEBE5]/60 border border-[#EBEBE5] p-5 flex items-center justify-between">
        <div className="pr-4 z-10 max-w-[200px]">
          <h3 className="text-base font-bold tracking-tight text-[#121212] leading-snug">
            Disciplina oggi, libertà domani.
          </h3>
        </div>

        {/* Abstract metallic graphic icon button */}
        <button
          onClick={() => onNavigate("obiettivi")}
          className="h-11 w-11 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform shrink-0"
        >
          <ArrowUpRight className="h-5 w-5" />
        </button>
      </div>

      {/* Panoramica mensile Card */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#121212]">Panoramica mensile</h3>
          <button
            onClick={() => onNavigate("statistiche")}
            className="flex items-center gap-1 text-xs text-[#73736E] font-medium hover:text-[#121212]"
          >
            <span>Settembre 2026</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <p className="text-[11px] text-[#73736E] font-medium mb-1">Entrate</p>
            <p className="text-xs sm:text-sm font-extrabold text-[#166534]">
              {money(income)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <p className="text-[11px] text-[#73736E] font-medium mb-1">Uscite</p>
            <p className="text-xs sm:text-sm font-extrabold text-[#991B1B]">
              {money(spending)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FEF9C3]/70 border border-[#F5E050]">
            <p className="text-[11px] text-[#73736E] font-medium mb-1">Risparmio</p>
            <p className="text-xs sm:text-sm font-extrabold text-[#854D0E]">
              {money(balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
