"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, PiggyBank, PieChart, Calendar, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DesktopAnalisi() {
  const { transactions, activeCard } = useApp();
  const [period, setPeriod] = useState<"Settimana" | "Mese" | "3 Mesi" | "Anno">("Mese");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  // Compute metrics from AppContext transactions
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Category Breakdown Calculation
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

  const categoryList = Object.entries(categoryTotals)
    .map(([cat, val]) => ({
      name: cat,
      amount: val,
      percent: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* Header & Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#121212] tracking-tight">
            Analisi & Report Finanziario
          </h2>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Analisi dettagliata di entrate, uscite e risparmi
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="grid grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border border-[#EBEBE5] shadow-xs">
          {(["Settimana", "Mese", "3 Mesi", "Anno"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? "bg-[#121212] text-white shadow-xs"
                  : "text-[#73736E] hover:text-[#121212]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Entrate */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Totale Entrate</span>
            <div className="h-8 w-8 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-[#166534] tracking-tight">
              + {money(totalIncome)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">Accrediti periodo selezionato</p>
        </div>

        {/* Card 2: Uscite */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Totale Spese</span>
            <div className="h-8 w-8 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-[#121212] tracking-tight">
              - {money(totalExpense)}
            </span>
          </div>
          <p className="text-[10px] text-rose-600 font-semibold">Uscite periodo selezionato</p>
        </div>

        {/* Card 3: Risparmio Netto */}
        <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#73736E]">
            <span className="text-xs font-bold">Risparmio Netto</span>
            <div className="h-8 w-8 rounded-2xl bg-[#FEF9C3] text-[#121212] flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-[#121212] tracking-tight">
              {money(netSavings)}
            </span>
          </div>
          <p className="text-[10px] text-[#73736E] font-semibold">Differenza entrate/uscite</p>
        </div>

        {/* Card 4: Tasso di Risparmio */}
        <div className="rounded-[24px] bg-[#FEF9C3] border border-[#F5E050]/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#121212]">
            <span className="text-xs font-bold">Tasso di Risparmio</span>
            <PieChart className="h-4 w-4" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-[#121212] tracking-tight">
              {savingsRate}%
            </span>
          </div>
          <p className="text-[10px] text-[#121212] font-semibold">Delle tue entrate risparmiate</p>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (6 columns) */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#121212] mb-1">
              Ripartizione per Categoria
            </h3>
            <p className="text-xs text-[#73736E] font-medium mb-4">
              Dove sono finiti i tuoi soldi questo {period.toLowerCase()}
            </p>

            <div className="flex flex-col gap-3">
              {categoryList.map((c) => (
                <div key={c.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#121212]">
                    <span>{c.name}</span>
                    <span>
                      {money(c.amount)} ({c.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F8F8F5] overflow-hidden border border-[#EBEBE5]">
                    <div
                      className="h-full bg-[#121212] rounded-full transition-all duration-500"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Trend Chart (6 columns) */}
        <div className="lg:col-span-6 rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#121212] mb-1">
              Trend Temporale Entrate vs Spese
            </h3>
            <p className="text-xs text-[#73736E] font-medium mb-4">
              Confronto bilanciato su scala temporale
            </p>

            <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#EBEBE5]">
              {[
                { label: "Sett 1", exp: 420, inc: 1800 },
                { label: "Sett 2", exp: 280, inc: 200 },
                { label: "Sett 3", exp: 510, inc: 150 },
                { label: "Sett 4", exp: 350, inc: 400 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1.5 h-full">
                    {/* Expense bar */}
                    <div
                      className="w-5 bg-[#121212] rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(bar.exp / 1800) * 100}%` }}
                      title={`Spesa: €${bar.exp}`}
                    />
                    {/* Income bar */}
                    <div
                      className="w-5 bg-[#F5E050] rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(bar.inc / 1800) * 100}%` }}
                      title={`Entrata: €${bar.inc}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#73736E]">{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-[#121212]">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-md bg-[#121212]" />
                <span>Uscite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-md bg-[#F5E050]" />
                <span>Entrate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
