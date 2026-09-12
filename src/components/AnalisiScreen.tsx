"use client";

import React, { useState } from "react";
import { SlidersHorizontal, TrendingDown } from "lucide-react";

export function AnalisiScreen() {
  const [period, setPeriod] = useState<"Mese" | "Trimestre" | "Anno">("Mese");

  const categories = [
    { name: "Casa", percent: 28, color: "#F5E050", amount: 155.1 },
    { name: "Cibo", percent: 18, color: "#EAB308", amount: 99.8 },
    { name: "Trasporti", percent: 15, color: "#121212", amount: 83.1 },
    { name: "Shopping", percent: 14, color: "#404040", amount: 77.6 },
    { name: "Abbonamenti", percent: 12, color: "#73736E", amount: 66.5 },
    { name: "Svago", percent: 9, color: "#A3A39E", amount: 49.8 },
    { name: "Altro", percent: 4, color: "#D4D4D0", amount: 22.3 },
  ];

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Analisi
        </h1>
        <button className="h-9 w-9 rounded-full bg-white border border-[#EBEBE5] text-[#121212] flex items-center justify-center hover:bg-[#F8F8F5] shadow-xs transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Time Segmented Pills */}
      <div className="grid grid-cols-3 gap-2 bg-[#EBEBE5]/60 p-1.5 rounded-2xl">
        {(["Mese", "Trimestre", "Anno"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? "bg-[#F5E050] text-[#121212] shadow-xs"
                : "text-[#73736E] hover:text-[#121212]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Donut Chart Visual Container */}
      <div className="rounded-[26px] bg-white border border-[#EBEBE5] p-6 flex flex-col items-center justify-center shadow-xs relative overflow-hidden">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Base Circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#F8F8F5"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Segment 1: Casa (28%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#F5E050"
              strokeWidth="12"
              strokeDasharray="66.9 171.9"
              strokeDashoffset="0"
              fill="transparent"
            />
            {/* Segment 2: Cibo (18%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#EAB308"
              strokeWidth="12"
              strokeDasharray="43.0 195.8"
              strokeDashoffset="-66.9"
              fill="transparent"
            />
            {/* Segment 3: Trasporti (15%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#121212"
              strokeWidth="12"
              strokeDasharray="35.8 203.0"
              strokeDashoffset="-109.9"
              fill="transparent"
            />
            {/* Segment 4: Rest (39%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#73736E"
              strokeWidth="12"
              strokeDasharray="93.1 145.7"
              strokeDashoffset="-145.7"
              fill="transparent"
            />
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-[#121212]">
              554,20 €
            </span>
            <span className="text-[10px] text-[#73736E] font-medium">
              Totale spese
            </span>
            <div className="mt-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[9px] font-extrabold text-[#166534]">
              <TrendingDown className="h-3 w-3" />
              <span>-18%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Percentage List */}
      <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-4 shadow-xs flex flex-col gap-2.5">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs font-bold text-[#121212]">{c.name}</span>
            </div>
            <span className="text-xs font-black text-[#121212]">
              {c.percent}%
            </span>
          </div>
        ))}
      </div>

      {/* Insight Banner */}
      <div className="rounded-[20px] bg-[#FEF9C3]/80 border border-[#F5E050] p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#121212] text-[#F5E050] flex items-center justify-center shrink-0">
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
