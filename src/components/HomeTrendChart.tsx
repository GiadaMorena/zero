"use client";

import React, { useState } from "react";
import { TrendingDown, ArrowUpRight, PiggyBank } from "lucide-react";

type Period = "Settimana" | "Mese" | "3 Mesi" | "Anno";

interface DataPoint {
  label: string;
  spending: number;
  income: number;
}

const PERIOD_DATA: Record<Period, DataPoint[]> = {
  Settimana: [
    { label: "Lun", spending: 42, income: 0 },
    { label: "Mar", spending: 18, income: 0 },
    { label: "Mer", spending: 65, income: 0 },
    { label: "Gio", spending: 120, income: 1800 },
    { label: "Ven", spending: 85, income: 0 },
    { label: "Sab", spending: 154, income: 0 },
    { label: "Dom", spending: 70, income: 0 },
  ],
  Mese: [
    { label: "Sett 1", spending: 120, income: 0 },
    { label: "Sett 2", spending: 145, income: 0 },
    { label: "Sett 3", spending: 210, income: 1800 },
    { label: "Sett 4", spending: 79, income: 0 },
  ],
  "3 Mesi": [
    { label: "Lug", spending: 620, income: 1800 },
    { label: "Ago", spending: 710, income: 1800 },
    { label: "Set", spending: 554, income: 1800 },
  ],
  Anno: [
    { label: "Gen", spending: 480, income: 1800 },
    { label: "Mar", spending: 510, income: 1800 },
    { label: "Mag", spending: 630, income: 1800 },
    { label: "Lug", spending: 620, income: 1800 },
    { label: "Set", spending: 554, income: 1800 },
  ],
};

const PERIOD_TOTALS: Record<Period, { spending: number; income: number; savings: number }> = {
  Settimana: { spending: 554.2, income: 1800.0, savings: 1245.8 },
  Mese: { spending: 554.2, income: 1800.0, savings: 1245.8 },
  "3 Mesi": { spending: 1884.0, income: 5400.0, savings: 3516.0 },
  Anno: { spending: 7120.0, income: 21600.0, savings: 14480.0 },
};

export function HomeTrendChart() {
  const [period, setPeriod] = useState<Period>("Mese");

  const data = PERIOD_DATA[period];
  const totals = PERIOD_TOTALS[period];

  const maxVal = Math.max(...data.flatMap((d) => [d.spending, d.income]), 1);

  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const ySpend = 100 - (d.spending / maxVal) * 75 - 10;
    const yInc = 100 - (d.income / maxVal) * 75 - 10;
    return { x, ySpend, yInc, label: d.label };
  });

  const spendingPath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x},${p.ySpend}` : `${acc} L ${p.x},${p.ySpend}`),
    ""
  );

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm flex flex-col gap-4">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#121212] tracking-tight">
            Come stanno andando le cose?
          </h3>
          <p className="text-xs text-[#73736E] mt-0.5">Riepilogo umano delle tue finanze</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#F8F8F5] p-1 rounded-full border border-[#EBEBE5] self-start sm:self-auto">
          {(["Settimana", "Mese", "3 Mesi", "Anno"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                period === p
                  ? "bg-[#121212] text-[#F5E050] shadow-sm"
                  : "text-[#73736E] hover:text-[#121212]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Humanized 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] text-[#73736E] font-semibold uppercase tracking-wider mb-1">
            <TrendingDown className="h-3 w-3 text-[#991B1B]" />
            <span>Hai speso</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-[#121212]">
            {money(totals.spending)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] text-[#73736E] font-semibold uppercase tracking-wider mb-1">
            <ArrowUpRight className="h-3 w-3 text-[#166534]" />
            <span>Hai ricevuto</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-[#166534]">
            {money(totals.income)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FEF9C3]/70 border border-[#F5E050]/80 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] text-[#854D0E] font-semibold uppercase tracking-wider mb-1">
            <PiggyBank className="h-3 w-3 text-[#854D0E]" />
            <span>Messo da parte</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-[#121212]">
            {money(totals.savings)}
          </div>
        </div>
      </div>

      {/* Modern SVG Trend Graph */}
      <div className="w-full pt-2">
        <div className="h-32 w-full relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Background Grid Lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#EBEBE5" strokeDasharray="3 3" strokeWidth="0.5" />
            <line x1="0" y1="65" x2="100" y2="65" stroke="#EBEBE5" strokeDasharray="3 3" strokeWidth="0.5" />

            {/* Gradient Area under Spending Curve */}
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#121212" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#121212" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path
              d={`${spendingPath} L 100,90 L 0,90 Z`}
              fill="url(#spendGrad)"
            />

            {/* Spending Path Line */}
            <path
              d={spendingPath}
              fill="none"
              stroke="#121212"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Dots */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.ySpend}
                  r="3.5"
                  fill="#F5E050"
                  stroke="#121212"
                  strokeWidth="2"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between items-center text-[10px] text-[#A3A39E] font-semibold px-1 mt-2">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
