"use client";

import React, { useState } from "react";
import { AreaChart, DonutChart, BarChart } from "./DesktopCharts";
import { MONTHLY_TREND, CATEGORIES_ANALYSIS, INCOME, SPENDING, SAVINGS, money } from "./desktopData";

type Period = "Settimana" | "Mese" | "3 mesi" | "Anno";

const PERIODS: Period[] = ["Settimana", "Mese", "3 mesi", "Anno"];

export function DesktopAnalisi() {
  const [period, setPeriod] = useState<Period>("Mese");

  const expenseData = MONTHLY_TREND.map(d => ({ month: d.month, value: d.expense }));
  const savingsData = MONTHLY_TREND.map(d => ({ month: d.month, value: d.savings }));

  const incomeVsExp = [
    { label: "Entrate",  val: INCOME,   pct: 100,                          color: "#F5E050"  },
    { label: "Uscite",   val: SPENDING, pct: (SPENDING / INCOME) * 100,    color: "#404040"  },
    { label: "Risparmio",val: SAVINGS,  pct: (SAVINGS  / INCOME) * 100,    color: "#22c55e"  },
  ];

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

      {/* ── Period filter ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[#141414] border border-white/[0.05] rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                period === p
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-[#555550] hover:text-white"
              }`}
            >{p}</button>
          ))}
        </div>
        <p className="text-[11px] text-[#555550]">Mostrando dati per: <span className="text-white font-medium">{period}</span></p>
      </div>

      {/* ── Key metrics ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {incomeVsExp.map(({ label, val, pct, color }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
            <p className="text-[11px] text-[#555550] font-medium mb-1.5">{label}</p>
            <p className="text-2xl font-extrabold text-white">{money(val)}</p>
            <div className="mt-3">
              <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <p className="text-[10px] text-[#555550] mt-1">{pct.toFixed(0)}% del reddito</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Spending trend */}
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-[13px] font-bold text-white">Andamento uscite</h2>
            <p className="text-[11px] text-[#555550] mt-0.5">Spese mensili — {period}</p>
          </div>
          <AreaChart data={expenseData} color="#F5E050" height={160} />
        </div>

        {/* Savings trend */}
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-[13px] font-bold text-white">Risparmio mensile</h2>
            <p className="text-[11px] text-[#555550] mt-0.5">Andamento — {period}</p>
          </div>
          <AreaChart data={savingsData} color="#4ade80" height={160} />
        </div>
      </div>

      {/* ── Bottom charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Bar chart income vs expense */}
        <div className="col-span-2 bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13px] font-bold text-white">Entrate vs Uscite</h2>
              <p className="text-[11px] text-[#555550] mt-0.5">Confronto mensile</p>
            </div>
            <div className="flex gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#F5E050]"><div className="h-2 w-2 rounded-sm bg-[#F5E050]" /> Entrate</span>
              <span className="flex items-center gap-1.5 text-[#777772]"><div className="h-2 w-2 rounded-sm bg-white/25" /> Uscite</span>
            </div>
          </div>
          <BarChart data={MONTHLY_TREND} height={150} />
        </div>

        {/* Category donut */}
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-[13px] font-bold text-white">Categorie</h2>
            <p className="text-[11px] text-[#555550] mt-0.5">Distribuzione spese</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <DonutChart
              segments={CATEGORIES_ANALYSIS}
              centerLabel="€554"
              centerSub="totale"
              size={130}
            />
            <div className="w-full flex flex-col gap-1.5">
              {CATEGORIES_ANALYSIS.map(c => (
                <div key={c.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-[#A3A39E] truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#555550]">{money(c.amount)}</span>
                    <span className="text-[10px] font-bold text-white">{c.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
