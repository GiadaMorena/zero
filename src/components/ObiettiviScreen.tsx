"use client";

import React, { useState } from "react";
import { Plus, Plane, Camera, ShieldCheck, ArrowRight, Laptop, X, PlusCircle, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ObiettiviScreen() {
  const { goals, addMoneyToGoal, addGoal, deleteGoal } = useApp();
  const [filter, setFilter] = useState<"In corso" | "Completati">("In corso");
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // Add goal form
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");

  // Add money amount
  const [addAmount, setAddAmount] = useState("100");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const filteredGoals = goals.filter((g) => {
    if (filter === "Completati") return g.completed;
    return !g.completed;
  });

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(newTarget.replace(",", ".")) || 0;
    if (newTitle.trim() && numTarget > 0) {
      addGoal({ title: newTitle.trim(), target: numTarget });
      setNewTitle("");
      setNewTarget("");
      setIsAddGoalOpen(false);
    }
  };

  const handleExecuteAddMoney = (goalId: string) => {
    const amt = parseFloat(addAmount.replace(",", ".")) || 0;
    if (amt > 0) {
      addMoneyToGoal(goalId, amt);
    }
    setActiveGoalId(null);
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
          Obiettivi
        </h1>
        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["In corso", "Completati"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === f
                ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals Progress Cards */}
      <div className="flex flex-col gap-3">
        {filteredGoals.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-[22px] bg-white border border-[#A7A7A7]/20 shadow-xs flex flex-col gap-3 hover:border-[#0B0B0B]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center text-[#0B0B0B]">
                  {g.title.toLowerCase().includes("macbook") || g.title.toLowerCase().includes("pc") ? (
                    <Laptop className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : g.title.toLowerCase().includes("viaggio") || g.title.toLowerCase().includes("vacanza") ? (
                    <Plane className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : g.title.toLowerCase().includes("fotocamera") ? (
                    <Camera className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : (
                    <ShieldCheck className="h-4.5 w-4.5 stroke-[1.8]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B0B0B] leading-tight">
                    {g.title}
                  </h4>
                  <p className="text-[10px] text-[#A7A7A7] font-medium mt-0.5">
                    {money(g.current)} di {money(g.target)}
                  </p>
                </div>
              </div>

              {/* Add Money Pill */}
              <button
                onClick={() => setActiveGoalId(g.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F7F7F5] border border-[#A7A7A7]/20 hover:bg-[#FDC909] text-[#0B0B0B] text-[10px] font-extrabold transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>

            {/* Progress Bar & Percentage */}
            <div>
              <div className="w-full bg-[#F7F7F5] rounded-full h-2.5 overflow-hidden border border-[#A7A7A7]/20">
                <div
                  className="bg-[#FDC909] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, g.percent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-[#A7A7A7] mt-1.5">
                <span>{g.percent}% completato</span>
                <span>Mancano {money(Math.max(0, g.target - g.current))}</span>
              </div>
            </div>

            {/* Inline Add Money Input */}
            {activeGoalId === g.id && (
              <div className="pt-2 border-t border-[#A7A7A7]/10 flex items-center gap-2 animate-in fade-in">
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="50"
                  className="w-24 px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                />
                <button
                  onClick={() => handleExecuteAddMoney(g.id)}
                  className="px-4 py-1.5 rounded-xl bg-[#0B0B0B] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
                >
                  Conferma +{addAmount} €
                </button>
                <button
                  onClick={() => setActiveGoalId(null)}
                  className="p-1.5 text-[#A7A7A7] hover:text-[#0B0B0B] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredGoals.length === 0 && (
          <div className="text-center py-12 text-[#A7A7A7] text-xs font-medium bg-white rounded-[24px] border border-[#A7A7A7]/20 p-6 flex flex-col items-center gap-2">
            <Target className="h-6 w-6 text-[#A7A7A7]/60" />
            <p className="font-bold text-[#0B0B0B]">Nessun obiettivo attivo</p>
            <p className="text-[11px] max-w-xs">
              Crea il tuo primo traguardo di risparmio premendo il tasto + in alto.
            </p>
          </div>
        )}
      </div>

      {/* Add Goal Modal (Identical to Abbonamenti layout, raised & spacious) */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-xs p-0 sm:p-4 select-none">
          <div
            className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/30 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 min-h-[68dvh] max-h-[92dvh] overflow-y-auto no-scrollbar flex flex-col justify-between"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 2.5rem)" }}
          >
            <div>
              {/* Header with Dual Actions (Aggiungi on top right) */}
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#A7A7A7]/15">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="p-2 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-black text-[#0B0B0B]">
                  Nuovo obiettivo
                </h2>
                <button
                  type="submit"
                  form="add-goal-form"
                  className="px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-black hover:bg-black active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Aggiungi
                </button>
              </div>

              {/* Form Fields */}
              <form id="add-goal-form" onSubmit={handleSaveGoal} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
                    Titolo obiettivo
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Vacanza in Giappone, Nuovo MacBook..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    required
                    className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] transition-all"
                    style={{ height: "48px" }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
                    Importo target (€)
                  </label>
                  <input
                    type="text"
                    placeholder="1500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                    className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] transition-all"
                    style={{ height: "48px" }}
                  />
                </div>

                {/* Bottom CTA Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-full bg-[#0B0B0B] text-white font-black text-sm hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Salva obiettivo
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
