"use client";

import React from "react";
import { Plus } from "lucide-react";
import { GOALS, money } from "./desktopData";

export function DesktopObiettivi() {
  const totalTarget  = GOALS.reduce((s, g) => s + g.target, 0);
  const totalCurrent = GOALS.reduce((s, g) => s + g.current, 0);
  const globalPct    = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <p className="text-[11px] text-[#555550] font-medium mb-1.5">Totale accumulato</p>
          <p className="text-2xl font-extrabold text-[#F5E050]">{money(totalCurrent)}</p>
          <p className="text-[11px] text-[#555550] mt-1">su {money(totalTarget)} di obiettivi</p>
        </div>
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <p className="text-[11px] text-[#555550] font-medium mb-1.5">Progresso globale</p>
          <p className="text-2xl font-extrabold text-white">{globalPct}%</p>
          <div className="mt-2 h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-[#F5E050] rounded-full" style={{ width: `${globalPct}%` }} />
          </div>
        </div>
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <p className="text-[11px] text-[#555550] font-medium mb-1.5">Obiettivi attivi</p>
          <p className="text-2xl font-extrabold text-white">{GOALS.length}</p>
          <p className="text-[11px] text-[#555550] mt-1">in corso</p>
        </div>
      </div>

      {/* ── Goals grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {GOALS.map(goal => {
          const pct = Math.round((goal.current / goal.target) * 100);
          const remaining = goal.target - goal.current;

          return (
            <div
              key={goal.id}
              className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/[0.04] flex items-center justify-center text-xl shrink-0">
                  {goal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white">{goal.title}</p>
                  <p className="text-[10px] text-[#555550] font-medium mt-0.5">Entro {goal.deadline}</p>
                </div>
                <span className="text-[18px] font-black text-[#F5E050]">{pct}%</span>
              </div>

              {/* Amounts */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[22px] font-extrabold text-white leading-tight">{money(goal.current)}</p>
                  <p className="text-[10px] text-[#555550]">su {money(goal.target)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#555550]">mancano</p>
                  <p className="text-[14px] font-bold text-white mt-0.5">{money(remaining)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F5E050] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              <button className="w-full py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-[#777772] hover:text-white hover:bg-white/[0.06] hover:border-white/10 transition-all">
                + Aggiungi risparmio
              </button>
            </div>
          );
        })}

        {/* Add goal */}
        <button className="bg-[#141414] border border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-[#555550] hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all group min-h-[200px]">
          <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-[12px] font-medium">Nuovo obiettivo</span>
        </button>
      </div>
    </div>
  );
}
