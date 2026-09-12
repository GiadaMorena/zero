"use client";

import React, { useState } from "react";
import { Plus, Plane, Camera, ShieldCheck, ArrowRight } from "lucide-react";

export function ObiettiviScreen() {
  const [filter, setFilter] = useState<"In corso" | "Completati">("In corso");

  const goals = [
    {
      id: "1",
      title: "Fondo viaggio",
      current: 900,
      target: 1500,
      percent: 60,
      icon: Plane,
      completed: false,
    },
    {
      id: "2",
      title: "Nuova fotocamera",
      current: 350,
      target: 800,
      percent: 44,
      icon: Camera,
      completed: false,
    },
    {
      id: "3",
      title: "Fondo emergenza",
      current: 1200,
      target: 3000,
      percent: 40,
      icon: ShieldCheck,
      completed: false,
    },
  ];

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Obiettivi
        </h1>
        <button className="h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform">
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#EBEBE5]/60 p-1.5 rounded-2xl">
        {(["In corso", "Completati"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-[#F5E050] text-[#121212] shadow-xs"
                : "text-[#73736E] hover:text-[#121212]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals Progress Cards */}
      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              className="p-4 rounded-[22px] bg-white border border-[#EBEBE5] shadow-xs flex flex-col gap-3 hover:border-[#121212]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                    <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#121212]">{g.title}</h4>
                    <p className="text-[11px] text-[#73736E] font-medium mt-0.5">
                      € {g.current} / {g.target}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#854D0E]">
                  {g.percent}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2 w-full rounded-full bg-[#F8F8F5] overflow-hidden border border-[#EBEBE5]">
                <div
                  className="h-full rounded-full bg-[#F5E050] transition-all duration-500"
                  style={{ width: `${g.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Dark Motivational Card */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#121212] text-white p-5 shadow-xl border border-[#262626] flex items-end justify-between min-h-[130px]">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#F5E050]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-[200px]">
          <h3 className="text-lg font-black tracking-tight text-white leading-tight">
            Sogni oggi.
          </h3>
          <p className="text-sm font-bold text-[#A3A39E]">
            Possibilità domani.
          </p>
        </div>

        <button className="h-10 w-10 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10 font-bold">
          <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
