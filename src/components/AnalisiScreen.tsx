"use client";

import React, { useState } from "react";
import { SlidersHorizontal, TrendingDown, PieChart } from "lucide-react";
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
    Casa: "#FDC909",
    Cibo: "#0B0B0B",
    Trasporti: "#73736E",
    Shopping: "#A7A7A7",
    Abbonamenti: "#FDC909",
    Svago: "#262626",
    Altro: "#D4D4D0",
  };

  const categories = Object.keys(categoryMap).map((catName) => {
    const amt = categoryMap[catName];
    const percent = Math.round((amt / totalCalc) * 100);
    return {
      name: catName,
      percent,
      amount: amt,
      color: colorPalette[catName] || "#A7A7A7",
    };
  });

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
          Analisi spese
        </h1>
        <button className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/20 text-[#0B0B0B] flex items-center justify-center hover:bg-[#F7F7F5] shadow-xs transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Time Segmented Pills */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["Mese", "Trimestre", "Anno"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Donut Chart Visual Container */}
      <div className="rounded-[26px] bg-white border border-[#A7A7A7]/20 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#A7A7A7"
              strokeOpacity={0.2}
              strokeWidth="12"
              fill="transparent"
            />
            {categories.length > 0 && (
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#FDC909"
                strokeWidth="12"
                strokeDasharray="238.76"
                strokeDashoffset="0"
                fill="transparent"
              />
            )}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-black text-[#0B0B0B]">
              {money(totalMonthlySpending)}
            </span>
            <span className="text-[10px] text-[#A7A7A7] font-semibold">
              Totale uscite
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Percentage List or Empty State */}
      <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4 flex flex-col gap-2.5 shadow-xs">
        {categories.length === 0 ? (
          <div className="text-center py-6 text-[#A7A7A7] text-xs font-medium flex flex-col items-center gap-2">
            <PieChart className="h-6 w-6 text-[#A7A7A7]/60" />
            <span>Nessun movimento registrato.</span>
          </div>
        ) : (
          categories.map((c) => (
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
          ))
        )}
      </div>

      {/* Insight Banner */}
      <div className="rounded-[20px] bg-[#FDC909] border border-[#FDC909] p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center shrink-0">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B0B0B] leading-snug">
              {expenses.length === 0
                ? "Inizia ad aggiungere le tue spese per monitorarle."
                : "Tieni sempre sotto controllo le tue categorie principali."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
