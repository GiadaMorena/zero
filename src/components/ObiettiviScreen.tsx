"use client";

import React, { useState } from "react";
import { Plus, Plane, Camera, ShieldCheck, ArrowRight, Laptop, X, PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ObiettiviScreen() {
  const { goals, addMoneyToGoal, addGoal } = useApp();
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
      addGoal({ title: newTitle, target: numTarget });
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
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Obiettivi
        </h1>
        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
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
        {filteredGoals.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-[22px] bg-white border border-[#EBEBE5] shadow-xs flex flex-col gap-3 hover:border-[#121212]/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                  {g.title.toLowerCase().includes("macbook") ? (
                    <Laptop className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : g.title.toLowerCase().includes("viaggio") ? (
                    <Plane className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : g.title.toLowerCase().includes("fotocamera") ? (
                    <Camera className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : (
                    <ShieldCheck className="h-4.5 w-4.5 stroke-[1.8]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212]">{g.title}</h4>
                  <p className="text-[11px] text-[#73736E] font-medium mt-0.5">
                    {money(g.current)} / {money(g.target)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#854D0E]">
                  {g.percent}%
                </span>
                <button
                  onClick={() => setActiveGoalId(g.id)}
                  className="px-2.5 py-1 rounded-full bg-[#FEF9C3] text-[#121212] border border-[#F5E050]/80 text-[10px] font-extrabold flex items-center gap-1 hover:bg-[#F5E050] transition-colors"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>Risparmia</span>
                </button>
              </div>
            </div>

            {/* Add Money Input Row if Active */}
            {activeGoalId === g.id && (
              <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-[#73736E]">Aggiungi fondi (€):</span>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-20 p-1 text-center rounded-lg bg-white border border-[#EBEBE5] text-xs font-black text-[#121212]"
                />
                <button
                  onClick={() => handleExecuteAddMoney(g.id)}
                  className="px-3 py-1 rounded-full bg-[#121212] text-white text-[10px] font-bold"
                >
                  Conferma
                </button>
              </div>
            )}

            {/* Progress Bar Container */}
            <div className="h-2 w-full rounded-full bg-[#F8F8F5] overflow-hidden border border-[#EBEBE5]">
              <div
                className="h-full rounded-full bg-[#F5E050] transition-all duration-500"
                style={{ width: `${g.percent}%` }}
              />
            </div>
          </div>
        ))}

        {filteredGoals.length === 0 && (
          <div className="text-center py-10 text-[#73736E] text-xs font-medium">
            Nessun obiettivo trovato.
          </div>
        )}
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

      {/* Add Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#F8F8F5] rounded-t-[32px] sm:rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsAddGoalOpen(false)}
                className="p-2 rounded-full bg-white border border-[#EBEBE5] text-[#121212]"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-black text-[#121212]">
                Nuovo Traguardo di Risparmio
              </h2>
              <div className="w-8" />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">
                  Titolo Obiettivo
                </label>
                <input
                  type="text"
                  placeholder="Es. Vacanza in Giappone, Moto..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">
                  Importo Target (€)
                </label>
                <input
                  type="text"
                  placeholder="1500"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <button
                onClick={handleSaveGoal}
                className="w-full py-3.5 mt-2 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all"
              >
                Salva Obiettivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
