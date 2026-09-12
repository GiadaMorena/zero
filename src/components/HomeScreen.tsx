"use client";

import React, { useState } from "react";
import {
  Plus,
  ArrowUpRight,
  Scan,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronRight,
  ShoppingBag,
  Car,
  DollarSign,
  Laptop,
  Tv,
  Sparkles,
  ArrowDownLeft,
} from "lucide-react";
import { WalletCarousel, CardItem } from "./WalletCarousel";
import { HomeTrendChart } from "./HomeTrendChart";

interface HomeScreenProps {
  balance: number;
  income: number;
  spending: number;
  onOpenAddModal: () => void;
  onNavigate: (tab: any) => void;
}

const RECENT_TRANSACTIONS = [
  {
    id: "tx-1",
    title: "Esselunga",
    category: "Alimentari",
    date: "Oggi, 14:32",
    amount: -42.8,
    icon: ShoppingBag,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "tx-2",
    title: "Benzina Eni",
    category: "Trasporti",
    date: "Ieri, 18:11",
    amount: -55.0,
    icon: Car,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "tx-3",
    title: "Stipendio Mensile",
    category: "Entrata",
    date: "2 settembre",
    amount: 1800.0,
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export function HomeScreen({
  balance = 1245.8,
  spending = 554.2,
  onOpenAddModal,
  onNavigate,
}: HomeScreenProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);

  const currentCardBalance = activeCard ? activeCard.balance : balance;

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-6 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen"
    >
      {/* ── 2. HEADER ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#121212] flex items-center gap-2">
            Ciao Giada <span className="animate-bounce inline-block text-xl">👋</span>
          </h1>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Un passo alla volta, grandi obiettivi.
          </p>
        </div>
        <button
          onClick={() => onNavigate("profilo")}
          className="relative h-10 w-10 rounded-full bg-[#121212] border-2 border-[#F5E050] flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
        >
          G
          <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#F5E050] ring-2 ring-white" />
        </button>
      </div>

      {/* ── 3. WALLET CAROUSEL (PROTAGONISTA) ── */}
      <div className="w-full">
        <WalletCarousel onCardSelect={(card) => setActiveCard(card)} />
      </div>

      {/* ── 4. SALDO PULITO SU QUESTA CARTA ── */}
      <div className="flex flex-col items-center justify-center text-center -mt-1 px-4">
        <div className="flex items-center gap-1.5 text-xs text-[#73736E] font-semibold tracking-wide">
          <span>Disponibili su questa carta</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 text-[#73736E] hover:text-[#121212] transition-colors"
            title={showBalance ? "Nascondi saldo" : "Mostra saldo"}
          >
            {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="text-3xl font-black text-[#121212] tracking-tight mt-1">
          {showBalance ? money(currentCardBalance) : "••••••••"}
        </div>

        <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#EBEBE5] text-[11px] font-semibold text-[#73736E]">
          <span className="text-[#991B1B] font-bold">−12%</span>
          <span>rispetto al mese scorso</span>
        </div>
      </div>

      {/* ── 5. AZIONI RAPIDE ── */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F5E050] text-[#121212] shadow-sm hover:bg-[#EAD900] active:scale-95 transition-all group border border-[#F5E050]"
        >
          <div className="h-9 w-9 rounded-full bg-[#121212] text-[#F5E050] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Aggiungi spesa
          </span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Nuova entrata
          </span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <Scan className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Scansiona
          </span>
        </button>

        <button
          onClick={() => onNavigate("profilo")}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#121212] active:scale-95 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-[#F8F8F5] text-[#121212] flex items-center justify-center mb-1.5 border border-[#EBEBE5] group-hover:scale-105 transition-transform">
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-[#121212] text-center leading-tight">
            Altro
          </span>
        </button>
      </div>

      {/* ── 6. ULTIMI MOVIMENTI ── */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-[#121212]">I tuoi ultimi movimenti</h3>
          <button
            onClick={() => onNavigate("spese")}
            className="flex items-center gap-1 text-xs text-[#73736E] font-bold hover:text-[#121212] transition-colors"
          >
            <span>Vedi tutti</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {RECENT_TRANSACTIONS.map((tx) => {
            const Icon = tx.icon;
            const isIncome = tx.amount > 0;

            return (
              <div
                key={tx.id}
                onClick={() => onNavigate("spese")}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] hover:border-[#121212]/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-2xl ${tx.color} flex items-center justify-center shrink-0 font-bold`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#121212] leading-tight">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-[#73736E] mt-0.5 font-medium">
                      {tx.category} · {tx.date}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-sm font-extrabold flex items-center gap-0.5 ${
                    isIncome ? "text-[#166534]" : "text-[#121212]"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : null}
                  <span>{money(tx.amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. RIEPILOGO FINANZIARIO ("COME STANNO ANDANDO LE COSE?") ── */}
      <HomeTrendChart />

      {/* ── 8. OBIETTIVI & 9. ABBONAMENTI ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Obiettivo */}
        <div
          onClick={() => onNavigate("obiettivi")}
          className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm hover:border-[#F5E050] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#73736E] uppercase tracking-wider">
                Prossimo obiettivo
              </span>
              <div className="h-7 w-7 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4 text-[#121212]" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-[#F5E050]/20 text-[#121212] flex items-center justify-center font-bold">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#121212]">MacBook Pro</h4>
                <p className="text-xs text-[#73736E] font-medium">1.240 € / 2.000 €</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#121212] mb-1.5">
              <span>Avanzamento</span>
              <span className="text-[#854D0E] font-black">62%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] overflow-hidden">
              <div className="h-full bg-[#F5E050] rounded-full w-[62%] transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Card Abbonamenti */}
        <div
          onClick={() => onNavigate("abbonamenti")}
          className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm hover:border-[#121212] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#73736E] uppercase tracking-wider">
                I tuoi abbonamenti
              </span>
              <div className="h-7 w-7 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4 text-[#121212]" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-[#121212] text-[#F5E050] flex items-center justify-center font-bold">
                <Tv className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#121212]">6 Attivi</h4>
                <p className="text-xs text-[#73736E] font-medium">74,42 € / mese</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#EBEBE5] flex items-center justify-between text-xs">
            <span className="text-[#73736E] font-medium">Prossimo rinnovo:</span>
            <span className="font-bold text-[#121212]">Spotify · 15 set</span>
          </div>
        </div>
      </div>

      {/* ── 10. ELEMENTO MOTIVAZIONALE DISCRETO ── */}
      <div className="rounded-[24px] bg-[#121212] text-white p-4 flex items-center gap-3 shadow-md border border-[#262626]">
        <div className="h-8 w-8 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 fill-current" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-white block">Piccoli passi, grandi risultati.</span>
          <span className="text-[#A3A39E]">Sei sulla strada giusta per raggiungere i tuoi traguardi.</span>
        </div>
      </div>
    </div>
  );
}
