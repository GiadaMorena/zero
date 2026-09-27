"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, BarChart2, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function HomeTrendChart() {
  const { transactions, totalMonthlySpending, totalMonthlyIncome, totalMonthlySavings } = useApp();
  const [selectedMonth] = useState("Mese in corso");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  // Compute dynamic 5-bucket distribution for the current month
  const buckets = [
    { label: "1-7", expense: 0, income: 0 },
    { label: "8-14", expense: 0, income: 0 },
    { label: "15-21", expense: 0, income: 0 },
    { label: "22-28", expense: 0, income: 0 },
    { label: "29-31", expense: 0, income: 0 },
  ];

  transactions.forEach((tx) => {
    // Distribute among buckets
    const amt = Math.abs(tx.amount);
    if (tx.amount < 0) {
      buckets[0].expense += amt;
    } else {
      buckets[0].income += amt;
    }
  });

  const maxVal = Math.max(
    ...buckets.map((b) => Math.max(b.expense, b.income)),
    100
  );

  const hasData = transactions.length > 0;

  return (
    <div className="rounded-[26px] bg-white border border-[#A7A7A7]/20 p-5 shadow-xs flex flex-col gap-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#0B0B0B] tracking-tight">
          Come stanno andando le cose?
        </h3>
        <button
          className="flex items-center gap-1 text-xs text-[#A7A7A7] font-medium hover:text-[#0B0B0B] transition-colors"
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
            <div className="h-7 w-7 rounded-full bg-[#0B0B0B] text-[#F7F7F5] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#A7A7A7] font-semibold">Hai speso</p>
              <p className="text-sm font-black text-[#0B0B0B] leading-tight">
                - {money(totalMonthlySpending)}
              </p>
            </div>
          </div>

          {/* Receive */}
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#A7A7A7] font-semibold">Hai ricevuto</p>
              <p className="text-sm font-black text-[#0B0B0B] leading-tight">
                + {money(totalMonthlyIncome)}
              </p>
            </div>
          </div>

          {/* Savings */}
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center shrink-0 mt-0.5 border border-[#A7A7A7]/30">
              <BarChart2 className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] text-[#A7A7A7] font-semibold">Messo da parte</p>
              <p className="text-sm font-black text-[#0B0B0B] leading-tight">
                {money(totalMonthlySavings)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Dual Bar Chart */}
        <div className="col-span-7 flex flex-col justify-end">
          <div className="h-28 w-full flex items-end justify-between px-1 relative pb-1">
            {buckets.map((bar, idx) => {
              const blackHeight = hasData
                ? Math.max(6, Math.round((bar.expense / maxVal) * 80))
                : 4;
              const yellowHeight = hasData
                ? Math.max(6, Math.round((bar.income / maxVal) * 80))
                : 4;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 relative">
                  {/* Dual Vertical Bars */}
                  <div className="flex items-end gap-1">
                    {/* Black Bar */}
                    <div
                      className={`w-2.5 rounded-t-full transition-all duration-300 ${
                        hasData ? "bg-[#0B0B0B]" : "bg-[#A7A7A7]/30"
                      }`}
                      style={{ height: `${blackHeight}px` }}
                    />
                    {/* Yellow Bar */}
                    <div
                      className={`w-2.5 rounded-t-full transition-all duration-300 ${
                        hasData ? "bg-[#FDC909]" : "bg-[#A7A7A7]/20"
                      }`}
                      style={{ height: `${yellowHeight}px` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span className="text-[9px] text-[#A7A7A7] font-medium">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
