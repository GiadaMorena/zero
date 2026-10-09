"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, PiggyBank, PieChart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { financialAnalysis, type AnalysisPeriod } from "@/lib/financialAnalysis";
import { AnalysisPeriodControls } from "../AnalysisPeriodControls";

export function DesktopAnalisi() {
  const { transactions } = useApp();
  const [period, setPeriod] = useState<AnalysisPeriod>("Mese");

  const [anchor, setAnchor] = useState(() => new Date());
  const data = financialAnalysis(transactions, period, anchor);
  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const totalIncome = data.income;
  const totalExpense = data.spent;
  const netSavings = data.net;
  const savingsRate = totalIncome > 0 ? Math.round(netSavings / totalIncome * 100) : null;
  const categoryList = data.categories;
  const chartMax = Math.max(1, ...data.buckets.flatMap(bucket => [bucket.expense, bucket.income]));

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

        <div className="w-full sm:max-w-md"><AnalysisPeriodControls period={period} anchor={anchor} onPeriod={setPeriod} onAnchor={setAnchor} includeWeek /></div>
      </div>
      {data.undated > 0 && <p className="text-xs text-[#73736E]">{data.undated} movimenti senza data valida esclusi dai totali. Correggi la data nei movimenti.</p>}

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
              {savingsRate === null ? "—" : `${savingsRate}%`}
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
              Uscite del periodo selezionato
            </p>

            <div className="flex flex-col gap-3">
              {categoryList.length === 0 && <p className="py-6 text-xs text-[#73736E]">Nessuna spesa nel periodo selezionato.</p>}
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
              Entrate e uscite registrate nel periodo selezionato
            </p>

            <div role="img" aria-label={`Grafico ${data.label}: uscite ${money(totalExpense)}, entrate ${money(totalIncome)}`} className="h-64 flex items-end justify-between gap-1 pt-6 pb-2 border-b border-[#EBEBE5]">
              {data.buckets.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1 h-full">
                    {/* Expense bar */}
                    <div
                      className="w-2.5 sm:w-3 bg-[#121212] rounded-t-lg transition-all duration-500 motion-reduce:transition-none hover:opacity-80"
                      style={{ height: `${(bar.expense / chartMax) * 100}%` }}
                      title={`Spesa: ${money(bar.expense)}`}
                    />
                    {/* Income bar */}
                    <div
                      className="w-2.5 sm:w-3 bg-[#F5E050] rounded-t-lg transition-all duration-500 motion-reduce:transition-none hover:opacity-80"
                      style={{ height: `${(bar.income / chartMax) * 100}%` }}
                      title={`Entrata: ${money(bar.income)}`}
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
