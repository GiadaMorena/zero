"use client";

import React from "react";
import {
  Plus,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Laptop,
  Layers,
  Lightbulb,
  ShoppingCart,
  Car,
  DollarSign,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HomeTrendChart } from "../HomeTrendChart";
import { SubscriptionToggle } from "../AbbonamentiScreen";

interface DesktopDashboardProps {
  onNavigate: (section: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export function DesktopDashboard({
  onNavigate,
  onOpenAddExpense,
  onOpenAddIncome,
}: DesktopDashboardProps) {
  const {
    cards,
    activeCard,
    setActiveCardIndex,
    transactions,
    deleteTransaction,
    subscriptions,
    toggleSubscription,
    totalActiveSubscriptionsCost,
    goals,
    totalMonthlySpending,
    totalMonthlyIncome,
  } = useApp();

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const nextGoal = goals[0] || { title: "MacBook Pro", current: 1240, target: 2000, percent: 62 };
  const activeSubsCount = subscriptions.filter((s) => s.active).length;

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* ── 1. Top Summary Banner ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Disponibile su {activeCard.bankName}</span>
            <CreditCard className="h-4 w-4 text-[#121212]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black tracking-tight text-[#121212]">
              {money(activeCard.balance)}
            </span>
          </div>
          <p className="text-[10px] text-[#73736E] font-medium">Carta attiva nel wallet</p>
        </div>

        {/* Card 2: Uscite Mese */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Uscite Mese</span>
            <div className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black tracking-tight text-[#121212]">
              - {money(totalMonthlySpending)}
            </span>
          </div>
          <p className="text-[10px] text-rose-600 font-semibold">
            Calcolato su {transactions.filter((t) => t.amount < 0).length} uscite
          </p>
        </div>

        {/* Card 3: Entrate Mese */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Entrate Mese</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black tracking-tight text-[#166534]">
              + {money(totalMonthlyIncome)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            Accrediti registrati
          </p>
        </div>

        {/* Card 4: Quick Actions */}
        <div className="rounded-[24px] bg-[#FEF9C3] border border-[#F5E050]/80 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-[#121212]">Azioni Rapide</span>
          <div className="flex gap-2 my-2">
            <button
              onClick={onOpenAddExpense}
              className="flex-1 py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-1 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Spesa
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex-1 py-2.5 rounded-2xl bg-white border border-[#EBEBE5] text-[#121212] text-xs font-bold hover:border-[#121212] transition-all flex items-center justify-center gap-1 shadow-xs"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-[#166534]" /> Entrata
            </button>
          </div>
          <p className="text-[10px] text-[#73736E] font-medium text-center">Registrazione istantanea</p>
        </div>
      </div>

      {/* ── 2. Wallet Cards Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-black text-[#121212]">Le tue Carte & Wallet</h2>
          <button
            onClick={() => onNavigate("carte")}
            className="flex items-center gap-1 text-xs font-bold text-[#73736E] hover:text-[#121212]"
          >
            <span>Gestisci carte</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, idx) => {
            const isSelected = activeCard.id === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveCardIndex(idx)}
                className={`p-5 rounded-[28px] cursor-pointer transition-all duration-300 border relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                  card.type === "zero"
                    ? "bg-[#121212] text-white border-[#121212] shadow-xl"
                    : card.type === "revolut"
                    ? "bg-white text-[#121212] border-[#EBEBE5] shadow-xs"
                    : "bg-[#1E1E1E] text-white border-[#1E1E1E] shadow-md"
                } ${isSelected ? "ring-4 ring-[#F5E050]/50 scale-[1.01]" : "opacity-80 hover:opacity-100"}`}
              >
                {/* Header card */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider opacity-80">{card.bankName}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F5E050] text-[#121212]">
                      Principale
                    </span>
                  )}
                </div>

                {/* Balance */}
                <div className="my-2">
                  <p className="text-[10px] opacity-70 font-semibold">Disponibilità</p>
                  <p className="text-2xl font-black tracking-tight">{money(card.balance)}</p>
                </div>

                {/* Footer card */}
                <div className="flex items-center justify-between text-xs font-mono opacity-80 pt-2 border-t border-white/10">
                  <span>{card.number}</span>
                  <span>{card.expiry}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Panoramica Finanziaria & Movimenti Recenti (Side by Side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <HomeTrendChart />
        </div>

        {/* Recent Transactions Table (5 columns) */}
        <div className="lg:col-span-5 rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#121212]">Ultimi Movimenti</h3>
              <button
                onClick={() => onNavigate("movimenti")}
                className="text-xs text-[#73736E] font-bold hover:text-[#121212] flex items-center gap-0.5"
              >
                Vedi tutti <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#F4F4F0]">
              {transactions.slice(0, 5).map((tx) => {
                const isIncome = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between first:pt-0 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center shrink-0">
                        {tx.category === "Cibo" ? (
                          <ShoppingCart className="h-4 w-4 text-[#555]" />
                        ) : tx.category === "Trasporti" ? (
                          <Car className="h-4 w-4 text-[#555]" />
                        ) : isIncome ? (
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ShoppingBag className="h-4 w-4 text-[#555]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#121212] leading-tight">{tx.title}</p>
                        <p className="text-[10px] text-[#73736E] font-medium mt-0.5">
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${isIncome ? "text-[#166534]" : "text-[#121212]"}`}>
                        {isIncome ? "+" : "-"} {money(Math.abs(tx.amount))}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-[#A3A39E] hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Obiettivi & Abbonamenti (2 Equal Columns) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Obiettivo Card */}
        <div
          onClick={() => onNavigate("obiettivi")}
          className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-xs cursor-pointer hover:border-[#121212] transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#73736E]">Obiettivo Principale</span>
              <ChevronRight className="h-4 w-4 text-[#A3A39E]" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center shrink-0">
                <Laptop className="h-5 w-5 text-[#121212]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#121212]">{nextGoal.title}</h4>
                <p className="text-xs text-[#73736E] font-semibold">
                  {money(nextGoal.current)} / {money(nextGoal.target)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full h-2.5 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#F5E050] rounded-full transition-all duration-500"
                style={{ width: `${nextGoal.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-[#73736E]">
              <span>Progresso</span>
              <span className="text-[#121212]">{nextGoal.percent}%</span>
            </div>
          </div>
        </div>

        {/* Abbonamenti Card */}
        <div
          onClick={() => onNavigate("abbonamenti")}
          className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-xs cursor-pointer hover:border-[#121212] transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#73736E]">Abbonamenti Attivi</span>
              <ChevronRight className="h-4 w-4 text-[#A3A39E]" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-[#121212]">
                  {activeSubsCount} attivi su ZERO
                </h4>
                <p className="text-xs text-[#73736E] font-semibold">
                  Totale: <span className="text-[#121212] font-black">{money(totalActiveSubscriptionsCost)} / mese</span>
                </p>
              </div>

              {/* Subscriptions list preview toggle */}
              <div className="flex items-center gap-1">
                {subscriptions.slice(0, 3).map((sub) => (
                  <SubscriptionToggle
                    key={sub.id}
                    checked={sub.active}
                    onChange={() => toggleSubscription(sub.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F4F4F0] text-xs text-[#73736E] font-medium flex justify-between">
            <span>Controllo abbonamenti e scadenze</span>
            <span className="font-bold text-[#121212]">Gestisci →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
