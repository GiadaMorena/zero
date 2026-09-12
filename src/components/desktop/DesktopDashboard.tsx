"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, Plus, Eye, EyeOff } from "lucide-react";
import { AreaChart, MultiLineChart, DonutChart, Sparkline } from "./DesktopCharts";
import {
  BALANCE, INCOME, SPENDING, SAVINGS,
  MONTHLY_TREND, TRANSACTIONS, CATEGORIES_ANALYSIS, money,
} from "./desktopData";

const SPARKLINE_DATA = [480, 540, 620, 710, 480, 590, 554];

interface DesktopDashboardProps {
  onNavigate: (s: string) => void;
  onAddExpense: () => void;
}

export function DesktopDashboard({ onNavigate, onAddExpense }: DesktopDashboardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const statCards = [
    {
      label:   "Saldo disponibile",
      value:   showBalance ? money(BALANCE) : "••••••",
      change:  "-12% vs mese scorso",
      trend:   "down",
      spark:   [1280, 1310, 1260, 1290, 1245],
      accent:  true,
      toggle:  true,
    },
    {
      label:   "Entrate",
      value:   money(INCOME),
      change:  "+0% vs mese scorso",
      trend:   "flat",
      spark:   [1800, 1800, 1900, 1800, 1800],
      accent:  false,
    },
    {
      label:   "Uscite",
      value:   money(SPENDING),
      change:  "-8% vs mese scorso",
      trend:   "up-good",
      spark:   SPARKLINE_DATA,
      accent:  false,
    },
    {
      label:   "Risparmio",
      value:   money(SAVINGS),
      change:  "+3% vs mese scorso",
      trend:   "up",
      spark:   [1180, 1260, 1190, 1320, 1210, 1246],
      accent:  false,
    },
  ];

  const recent = TRANSACTIONS.slice(0, 5);

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-6">

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between gap-4 border transition-all duration-200 group cursor-default ${
              card.accent
                ? "bg-[#F5E050]/[0.04] border-[#F5E050]/20 hover:border-[#F5E050]/40"
                : "bg-[#141414] border-white/[0.05] hover:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#777772] mb-1.5">{card.label}</p>
                <p className={`text-2xl font-extrabold tracking-tight ${card.accent ? "text-[#F5E050]" : "text-white"}`}>
                  {card.value}
                </p>
              </div>
              {card.toggle && (
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#555550] hover:text-white transition-colors"
                >
                  {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            <div className="flex items-end justify-between">
              <span className={`text-[11px] font-medium flex items-center gap-1 ${
                card.trend === "up"      ? "text-[#F5E050]" :
                card.trend === "up-good" ? "text-emerald-400" :
                card.trend === "down"    ? "text-red-400/80" :
                "text-[#555550]"
              }`}>
                {card.trend === "up" && <TrendingUp className="h-3 w-3" />}
                {card.trend === "down" && <TrendingDown className="h-3 w-3" />}
                {card.change}
              </span>
              <Sparkline
                data={card.spark}
                color={card.accent ? "#F5E050" : card.trend === "up-good" ? "#4ade80" : "#ffffff"}
                w={64}
                h={28}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Spending Trend — 2/3 width */}
        <div className="col-span-2 bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[13px] font-bold text-white">Andamento spese</h2>
              <p className="text-[11px] text-[#555550] mt-0.5">Entrate vs uscite — ultimi 6 mesi</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#F5E050]">
                <div className="h-1.5 w-4 rounded-full bg-[#F5E050]" /> Entrate
              </span>
              <span className="flex items-center gap-1.5 text-[#777772]">
                <div className="h-1.5 w-4 rounded-full bg-white/25" /> Uscite
              </span>
            </div>
          </div>
          <MultiLineChart data={MONTHLY_TREND} height={180} />
        </div>

        {/* Donut Category — 1/3 width */}
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-[13px] font-bold text-white">Per categoria</h2>
            <p className="text-[11px] text-[#555550] mt-0.5">Settembre 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              segments={CATEGORIES_ANALYSIS}
              centerLabel="€554"
              centerSub="totale uscite"
              size={120}
            />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {CATEGORIES_ANALYSIS.slice(0, 5).map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-[11px] text-[#A3A39E] truncate">{c.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-white shrink-0">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Transactions — 2/3 */}
        <div className="col-span-2 bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-white">Movimenti recenti</h2>
            <button
              onClick={() => onNavigate("movimenti")}
              className="text-[11px] font-medium text-[#F5E050] hover:text-[#EAD900] flex items-center gap-1 transition-colors"
            >
              Vedi tutti <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col">
            {recent.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between py-2.5 ${i < recent.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors cursor-default`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-[13px]">
                    {t.amount > 0 ? "↑" : "↓"}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white">{t.desc}</p>
                    <p className="text-[10px] text-[#555550]">{t.cat} · {t.date}</p>
                  </div>
                </div>
                <span className={`text-[13px] font-extrabold ${t.amount > 0 ? "text-emerald-400" : "text-white"}`}>
                  {t.amount > 0 ? "+" : ""}{money(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions — 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Quick add */}
          <div className="bg-[#F5E050]/[0.04] border border-[#F5E050]/20 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-[13px] font-bold text-white">Azione rapida</h2>
            <button
              onClick={onAddExpense}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F5E050] text-[#0A0A0A] font-bold text-[13px] hover:bg-[#EAD900] transition-all hover:scale-[1.02] active:scale-100 shadow-lg shadow-[#F5E050]/10"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Aggiungi spesa
            </button>
            <div className="grid grid-cols-2 gap-2">
              {["Entrata", "Abbonamento", "Obiettivo", "Carta"].map((label) => (
                <button
                  key={label}
                  className="py-2 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-[#777772] hover:text-white hover:bg-white/[0.07] hover:border-white/10 transition-all text-left"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly summary card */}
          <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5 flex-1">
            <h2 className="text-[13px] font-bold text-white mb-3">Riepilogo mese</h2>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Entrate", v: INCOME,   color: "bg-[#F5E050]" },
                { label: "Uscite",  v: SPENDING, color: "bg-white/20"  },
                { label: "Saldo",   v: BALANCE,  color: "bg-emerald-500/60" },
              ].map(({ label, v, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#777772]">{label}</span>
                    <span className="font-bold text-white">{money(v)}</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${(v / INCOME) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
