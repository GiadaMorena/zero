"use client";

import React, { useState } from "react";
import { SlidersHorizontal, TrendingDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function AnalisiScreen() {
  const { transactions, totalMonthlySpending } = useApp();
  const [period, setPeriod] = useState<"Mese" | "Trimestre" | "Anno">("Mese");

  // Dynamic Category Breakdown Calculation
  const expenses = transactions.filter((t) => t.amount < 0);
  const categoryMap: Record<string, number> = {};

  expenses.forEach((t) => {
    const cat = t.category || "Altro";
    const val = Math.abs(t.amount);
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  });

  const totalCalc = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;

  const colorPalette: Record<string, string> = {
    Casa: "#F5E050",
    Cibo: "#EAB308",
    Trasporti: "#121212",
    Shopping: "#404040",
    Abbonamenti: "#73736E",
    Svago: "#A3A39E",
    Altro: "#D4D4D0",
  };

  const categories = Object.keys(categoryMap).map((catName) => {
    const amt = categoryMap[catName];
    const percent = Math.round((amt / totalCalc) * 100);
    return {
      name: catName,
      percent,
      amount: amt,
      color: colorPalette[catName] || "#A3A39E",
    };
  });

  if (categories.length === 0) {
    categories.push(
      { name: "Casa", percent: 35, amount: 150, color: "#F5E050" },
      { name: "Cibo", percent: 30, amount: 120, color: "#EAB308" },
      { name: "Trasporti", percent: 20, amount: 80, color: "#121212" },
      { name: "Svago", percent: 15, amount: 60, color: "#A3A39E" }
    );
  }

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Analisi Spese
        </h1>
        <button className="h-9 w-9 rounded-full bg-white border border-[#EBEBE5] text-[#121212] flex items-center justify-center hover:bg-[#F8F8F5] shadow-xs transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Time Segmented Pills */}
      <div className="grid grid-cols-3 gap-2 bg-[#A7A7A7] p-1.5 rounded-2xl">
        {(["Mese", "Trimestre", "Anno"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? "bg-[#FDC909] text-[#0B0B0B]"
                : "text-[#F7F7F5] hover:text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Donut Chart Visual Container */}
      <div className="rounded-[26px] bg-white border border-[#A7A7A7] p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#A7A7A7"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#FDC909"
              strokeWidth="12"
              strokeDasharray="66.9 171.9"
              strokeDashoffset="0"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#0B0B0B"
              strokeWidth="12"
              strokeDasharray="43.0 195.8"
              strokeDashoffset="-66.9"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#A7A7A7"
              strokeWidth="12"
              strokeDasharray="35.8 203.0"
              strokeDashoffset="-109.9"
              fill="transparent"
            />
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-black text-[#0B0B0B]">
              {money(totalMonthlySpending)}
            </span>
            <span className="text-[10px] text-[#A7A7A7] font-medium">
              Totale Uscite
            </span>
            <div className="mt-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FDC909] text-[9px] font-extrabold text-[#0B0B0B]">
              <TrendingDown className="h-3 w-3" />
              <span>-18%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Percentage List */}
      <div className="rounded-[24px] bg-white border border-[#A7A7A7] p-4 flex flex-col gap-2.5">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs font-bold text-[#0B0B0B]">{c.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-[#0B0B0B] block">
                {money(c.amount)}
              </span>
              <span className="text-[10px] text-[#A7A7A7] font-semibold">
                {c.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Banner */}
      <div className="rounded-[20px] bg-[#FDC909] border border-[#FDC909] p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center shrink-0">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#121212] leading-snug">
              Stai spendendo meno rispetto al mese scorso!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
