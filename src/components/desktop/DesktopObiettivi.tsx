"use client";

import React, { useState } from "react";
import { Plus, Target, Laptop, Plane, Camera, Shield, CheckCircle2, Trash2, X, DollarSign } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DesktopObiettivi() {
  const { goals, addGoal, addMoneyToGoal, deleteGoal } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("50");

  // Form state for new goal
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newTarget.replace(",", ".")) || 0;
    if (newTitle.trim() && targetVal > 0) {
      addGoal({ title: newTitle, target: targetVal });
      setNewTitle("");
      setNewTarget("");
      setIsAddModalOpen(false);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(depositAmount.replace(",", ".")) || 0;
    if (selectedGoalId && amountVal > 0) {
      addMoneyToGoal(selectedGoalId, amountVal);
      setSelectedGoalId(null);
      setDepositAmount("50");
    }
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#121212] tracking-tight">
            Obiettivi di Risparmio
          </h2>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Pianifica e raggiungi i tuoi traguardi finanziari
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-bold shadow-md hover:bg-black transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nuovo Obiettivo</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => (
          <div
            key={g.id}
            className="rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col justify-between hover:border-[#121212] transition-colors relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-2xl bg-[#FEF9C3] border border-[#F5E050]/60 flex items-center justify-center text-[#121212]">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#F8F8F5] text-[#121212] border border-[#EBEBE5]">
                    {g.percent}%
                  </span>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 text-[#A3A39E] hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina obiettivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#121212] mb-1">{g.title}</h3>
              <p className="text-xs text-[#73736E] font-semibold mb-4">
                {money(g.current)} / <span className="text-[#121212] font-extrabold">{money(g.target)}</span>
              </p>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[#F8F8F5] border border-[#EBEBE5] overflow-hidden mb-4">
                <div
                  className="h-full bg-[#F5E050] rounded-full transition-all duration-500"
                  style={{ width: `${g.percent}%` }}
                />
              </div>
            </div>

            {/* Quick Deposit Action */}
            <button
              onClick={() => setSelectedGoalId(g.id)}
              className="w-full py-2.5 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-[#121212] text-xs font-bold hover:bg-[#FEF9C3] hover:border-[#F5E050] transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Risparmia ORA</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal: New Goal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#121212]">Crea Nuovo Obiettivo</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full bg-[#F8F8F5]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">Titolo Obiettivo</label>
                <input
                  type="text"
                  placeholder="Es. Viaggio, Computer, Auto..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">Target finale (€)</label>
                <input
                  type="text"
                  placeholder="1000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all"
              >
                Salva Obiettivo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit Money */}
      {selectedGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#121212]">Aggiungi Risparmi all'Obiettivo</h3>
              <button onClick={() => setSelectedGoalId(null)} className="p-2 rounded-full bg-[#F8F8F5]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">Importo da versare (€)</label>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-base font-black text-[#121212] text-center focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[10, 50, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDepositAmount(String(v))}
                    className="py-2 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] hover:bg-[#FEF9C3]"
                  >
                    + {v} €
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#F5E050] text-[#121212] font-black text-sm shadow-xl hover:bg-[#EAD900] transition-all"
              >
                Conferma Versamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
