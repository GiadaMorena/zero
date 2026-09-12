"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, BarChart2, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

const BARS_DATA = [
  { label: "1-7", black: 45, yellow: 28 },
  { label: "8-14", black: 38, yellow: 22 },
  { label: "15-21", black: 75, yellow: 48, hasTooltip: true, tooltipText: "420 €" },
  { label: "22-28", black: 35, yellow: 20 },
  { label: "29-30", black: 42, yellow: 25 },
];

export function HomeTrendChart() {
  const { totalMonthlySpending, totalMonthlyIncome, totalMonthlySavings } = useApp();
  const [selectedMonth] = useState("Settembre 2026");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div className="rounded-[26px] bg-white border border-[#EBEBE5] p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#121212] tracking-tight">
          Come stanno andando le cose?
        </h3>
        <button
          className="flex items-center gap-1 text-xs text-[#73736E] font-medium hover:text-[#121212] transition-colors"
        >
          <span>{selectedMonth}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Grid: Left Metrics (3 items) | Right Dual Bar Chart */}
      <div className="grid grid-cols-12 gap-3 items-end pt-1">
        {/* Left 3 Metrics Column */}
        <div className="col-span-5 flex flex-col gap-3">
          {/* Spend */}
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-red-50 text-[#991B1B] flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
              <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#73736E] font-semibold">Hai speso</p>
              <p className="text-sm font-black text-[#121212] leading-tight">
                {money(totalMonthlySpending)}
              </p>
            </div>
          </div>

          {/* Receive */}
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-emerald-50 text-[#166534] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
              <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#73736E] font-semibold">Hai ricevuto</p>
              <p className="text-sm font-black text-[#166534] leading-tight">
                {money(totalMonthlyIncome)}
              </p>
            </div>
          </div>

          {/* Savings */}
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center shrink-0 mt-0.5 border border-[#F5E050]/60">
              <BarChart2 className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#73736E] font-semibold">Messo da parte</p>
              <p className="text-sm font-black text-[#121212] leading-tight">
                {money(totalMonthlySavings)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Dual Bar Chart */}
        <div className="col-span-7 flex flex-col justify-end">
          <div className="h-28 w-full flex items-end justify-between px-1 relative pb-1">
            {BARS_DATA.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 relative">
                {/* Tooltip Badge over 15-21 */}
                {bar.hasTooltip && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#121212] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-10 flex flex-col items-center">
                    <span>{bar.tooltipText}</span>
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#121212] absolute -bottom-1" />
                  </div>
                )}

                {/* Dual Vertical Bars */}
                <div className="flex items-end gap-1">
                  {/* Black Bar */}
                  <div
                    className="w-2.5 bg-[#121212] rounded-t-full transition-all duration-300"
                    style={{ height: `${bar.black}px` }}
                  />
                  {/* Yellow Bar */}
                  <div
                    className="w-2.5 bg-[#F5E050] rounded-t-full transition-all duration-300"
                    style={{ height: `${bar.yellow}px` }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-[9px] text-[#A3A39E] font-medium">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
