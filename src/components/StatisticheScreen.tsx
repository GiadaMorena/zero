import React, { useState } from "react";
import { ChevronDown, Home, Utensils, Fuel, ShoppingBag } from "lucide-react";

export function StatisticheScreen() {
  const [tab, setTab] = useState<"Entrate" | "Uscite" | "Risparmio">("Uscite");

  const monthlyBars = [
    { month: "Gen", height: 45, current: false },
    { month: "Feb", height: 60, current: false },
    { month: "Mar", height: 35, current: false },
    { month: "Apr", height: 50, current: false },
    { month: "Mag", height: 75, current: false },
    { month: "Giu", height: 65, current: false },
    { month: "Lug", height: 80, current: false },
    { month: "Ago", height: 70, current: false },
    { month: "Set", height: 95, current: true },
  ];

  const breakdown = [
    { name: "Casa", amount: "€ 155,10", percent: "28%", icon: Home },
    { name: "Cibo", amount: "€ 99,80", percent: "18%", icon: Utensils },
    { name: "Trasporti", amount: "€ 83,10", percent: "15%", icon: Fuel },
    { name: "Shopping", amount: "€ 77,60", percent: "14%", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 pt-safe pb-24 bg-[#F8F8F5] select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#121212]">
          Statistiche
        </h1>
      </div>

      {/* Segmented Pills */}
      <div className="grid grid-cols-3 gap-2 bg-[#EBEBE5]/60 p-1.5 rounded-2xl">
        {(["Entrate", "Uscite", "Risparmio"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t
                ? "bg-[#F5E050] text-[#121212] shadow-sm"
                : "text-[#73736E]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Display & Month Dropdown */}
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-3xl font-extrabold tracking-tight text-[#121212]">
            € 554,20
          </span>
          <div className="flex items-center gap-1 text-xs text-[#73736E] font-medium mt-1">
            <span>Settembre 2026</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart Container */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm">
        <div className="flex items-end justify-between h-44 gap-1.5 pt-4">
          {monthlyBars.map((b) => (
            <div key={b.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full bg-[#F8F8F5] rounded-t-full h-full flex items-end">
                <div
                  className={`w-full rounded-t-full transition-all duration-500 ${
                    b.current ? "bg-[#F5E050]" : "bg-[#121212]"
                  }`}
                  style={{ height: `${b.height}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${b.current ? "text-[#121212]" : "text-[#A3A39E]"}`}>
                {b.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[#73736E] uppercase tracking-wider mb-1">
          Categorie
        </h3>
        {breakdown.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-[#121212]">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-[#121212] block">
                  {item.amount}
                </span>
                <span className="text-[10px] text-[#73736E] font-semibold">
                  {item.percent}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
