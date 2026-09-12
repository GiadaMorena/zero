"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { BUDGET_CATEGORIES, money } from "./desktopData";

export function DesktopBudget() {
  const totalBudget = BUDGET_CATEGORIES.reduce((s, c) => s + c.budget, 0);
  const totalSpent  = BUDGET_CATEGORIES.reduce((s, c) => s + c.spent, 0);
  const totalLeft   = totalBudget - totalSpent;

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

      {/* ── Header summary ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Budget totale",   val: totalBudget, sub: "impostato per il mese" },
          { label: "Speso finora",    val: totalSpent,  sub: `${Math.round((totalSpent/totalBudget)*100)}% del budget` },
          { label: "Rimanente",       val: totalLeft,   sub: "ancora disponibile" },
        ].map(({ label, val, sub }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
            <p className="text-[11px] text-[#555550] font-medium mb-1.5">{label}</p>
            <p className="text-2xl font-extrabold text-white mb-1">{money(val)}</p>
            <p className="text-[11px] text-[#555550]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Global progress bar ─────────────────────────────────────────────── */}
      <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
        <div className="flex justify-between text-[12px] font-medium mb-3">
          <span className="text-white">Utilizzo complessivo budget</span>
          <span className="text-[#F5E050] font-bold">{Math.round((totalSpent/totalBudget)*100)}%</span>
        </div>
        <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#F5E050] transition-all duration-700"
            style={{ width: `${(totalSpent/totalBudget)*100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#555550] mt-2">
          <span>{money(totalSpent)} spesi</span>
          <span>{money(totalLeft)} rimanenti</span>
        </div>
      </div>

      {/* ── Category grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {BUDGET_CATEGORIES.map((cat) => {
          const pct   = Math.round((cat.spent / cat.budget) * 100);
          const over  = pct >= 100;
          const warn  = pct >= 80 && !over;
          const left  = cat.budget - cat.spent;

          return (
            <div
              key={cat.name}
              className={`bg-[#141414] border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:border-white/10 group ${
                over ? "border-red-500/30" : warn ? "border-[#F5E050]/20" : "border-white/[0.05]"
              }`}
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-bold text-white">{cat.name}</p>
                  <p className="text-[11px] text-[#555550] mt-0.5">Budget: {money(cat.budget)}</p>
                </div>
                {(over || warn) && (
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${over ? "text-red-400" : "text-[#F5E050]"}`} />
                )}
              </div>

              {/* Progress */}
              <div>
                <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: over ? "#f87171" : warn ? "#F5E050" : cat.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#555550]">{money(cat.spent)} spesi</span>
                  <span className={`font-bold ${over ? "text-red-400" : "text-white"}`}>{pct}%</span>
                </div>
              </div>

              {/* Bottom detail */}
              <div className="flex justify-between items-center pt-1 border-t border-white/[0.04]">
                <span className="text-[11px] text-[#555550]">Residuo</span>
                <span className={`text-[12px] font-extrabold ${over ? "text-red-400" : left < 20 ? "text-[#F5E050]" : "text-white"}`}>
                  {over ? `+${money(Math.abs(left))} sforato` : money(left)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
