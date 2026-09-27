"use client";

import React, { useState } from "react";
import { ChevronDown, Home, Utensils, Fuel, ShoppingBag, BarChart2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function StatisticheScreen() {
  const { transactions, totalMonthlySpending, totalMonthlyIncome, totalMonthlySavings } = useApp();
  const [tab, setTab] = useState<"Uscite" | "Entrate" | "Risparmio">("Uscite");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  // Filter transactions according to selected tab
  const filteredTx = transactions.filter((t) => {
    if (tab === "Uscite") return t.amount < 0;
    if (tab === "Entrate") return t.amount > 0;
    return true;
  });

  const displayAmount =
    tab === "Uscite"
      ? totalMonthlySpending
      : tab === "Entrate"
      ? totalMonthlyIncome
      : totalMonthlySavings;

  // Breakdown categories
  const categoryMap: Record<string, number> = {};
  filteredTx.forEach((t) => {
    const cat = t.category || "Altro";
    categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
  });

  const totalCat = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;

  const categories = Object.keys(categoryMap).map((catName) => {
    const amt = categoryMap[catName];
    const percent = Math.round((amt / totalCat) * 100);
    return {
      name: catName,
      amount: amt,
      percent: `${percent}%`,
    };
  });

  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case "Casa":
        return Home;
      case "Cibo":
        return Utensils;
      case "Trasporti":
        return Fuel;
      default:
        return ShoppingBag;
    }
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
          Statistiche
        </h1>
      </div>

      {/* Segmented Pills */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["Uscite", "Entrate", "Risparmio"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t
                ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Display & Month */}
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-3xl font-black tracking-tight text-[#0B0B0B]">
            {money(displayAmount)}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#A7A7A7] font-medium mt-0.5">
            <span>Mese in corso</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4 shadow-xs flex flex-col gap-2.5">
        <h3 className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
          Dettaglio categorie
        </h3>
        {categories.length === 0 ? (
          <div className="text-center py-6 text-[#A7A7A7] text-xs font-medium flex flex-col items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#A7A7A7]/60" />
            <span>Nessun dato disponibile per questo periodo.</span>
          </div>
        ) : (
          categories.map((item) => {
            const Icon = getCategoryIcon(item.name);
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center text-[#0B0B0B]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-[#0B0B0B]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#0B0B0B] block">
                    {money(item.amount)}
                  </span>
                  <span className="text-[10px] text-[#A7A7A7] font-semibold">
                    {item.percent}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
