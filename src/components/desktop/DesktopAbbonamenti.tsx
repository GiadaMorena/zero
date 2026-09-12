"use client";

import React from "react";
import { Plus, Calendar, Film } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SubscriptionToggle } from "../AbbonamentiScreen";

export function DesktopAbbonamenti() {
  const { subscriptions, toggleSubscription, totalActiveSubscriptionsCost } = useApp();

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const activeSubs = subscriptions.filter((s) => s.active);
  const monthlyTotal = totalActiveSubscriptionsCost;
  const annualTotal = monthlyTotal * 12;

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <p className="text-[11px] text-[#555550] font-medium mb-1.5">Totale mensile</p>
          <p className="text-2xl font-extrabold text-[#F5E050]">{money(monthlyTotal)}</p>
          <p className="text-[11px] text-[#555550] mt-1">{activeSubs.length} abbonamenti attivi</p>
        </div>
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5">
          <p className="text-[11px] text-[#555550] font-medium mb-1.5">Totale annuale</p>
          <p className="text-2xl font-extrabold text-white">{money(annualTotal)}</p>
          <p className="text-[11px] text-[#555550] mt-1">€{(annualTotal / 12).toFixed(0)}/mese in media</p>
        </div>
        <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#555550] font-medium mb-1.5">Prossima scadenza</p>
            <p className="text-[13px] font-bold text-white">Uno Bravo</p>
            <p className="text-[11px] text-[#F5E050] mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> 1 ott 2026
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-xl">🧠</div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            onClick={() => toggleSubscription(sub.id)}
            className={`bg-[#141414] border rounded-2xl p-5 flex flex-col gap-4 transition-all cursor-pointer hover:border-white/10 ${
              sub.active ? "border-white/[0.08]" : "border-white/[0.03] opacity-40"
            }`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shrink-0">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">{sub.name}</p>
                  <p className="text-[10px] text-[#555550] font-medium capitalize">{sub.frequency}</p>
                </div>
              </div>

              {/* Custom Sleek ZERO Subscription Toggle */}
              <SubscriptionToggle
                checked={sub.active}
                onChange={() => toggleSubscription(sub.id)}
              />
            </div>

            {/* Cost */}
            <div className="flex items-end justify-between pt-2 border-t border-white/[0.04]">
              <div>
                <p className="text-[20px] font-extrabold text-white leading-tight">{money(sub.cost)}</p>
                <p className="text-[10px] text-[#555550]">/ {sub.frequency}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#555550]">Prossimo rinnovo</p>
                <p className="text-[11px] font-semibold text-white mt-0.5">{sub.date}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button className="bg-[#141414] border border-dashed border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-[#555550] hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all group min-h-[140px]">
          <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="text-[12px] font-medium">Aggiungi abbonamento</span>
        </button>
      </div>
    </div>
  );
}
