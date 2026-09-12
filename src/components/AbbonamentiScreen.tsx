"use client";

import React, { useState } from "react";
import { Plus, Bell, ChevronRight, Film, Music, Cloud, Search, Brain, Phone, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function SubscriptionToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-block h-6 w-10 shrink-0 cursor-pointer rounded-full border-0 p-0 m-0 outline-none transition-colors duration-200 ease-in-out select-none ${
        checked ? "bg-[#F5E050]" : "bg-[#E5E5E0]"
      }`}
    >
      <span
        style={{
          top: "50%",
          left: checked ? "19px" : "3px",
          transform: "translateY(-50%)",
        }}
        className="pointer-events-none absolute h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-all duration-200 ease-in-out"
      />
    </button>
  );
}

export function AbbonamentiScreen() {
  const { subscriptions, toggleSubscription, addSubscription, totalActiveSubscriptionsCost } = useApp();
  const [filter, setFilter] = useState<"Tutti" | "Attivi" | "In scadenza">("Attivi");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [frequency, setFrequency] = useState<"mese" | "anno">("mese");
  const [category, setCategory] = useState("Svago");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const filteredSubs = subscriptions.filter((s) => {
    if (filter === "Attivi") return s.active;
    if (filter === "In scadenza") return s.active && s.id === "1";
    return true;
  });

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    const numCost = parseFloat(cost.replace(",", ".")) || 0;
    if (name.trim() && numCost > 0) {
      addSubscription({
        name,
        cost: numCost,
        frequency,
        date: "Rinnovo mensile",
        category,
      });
      setName("");
      setCost("");
      setIsAddModalOpen(false);
    }
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#121212]">
            Abbonamenti
          </h1>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Totale attivo: <span className="font-extrabold text-[#121212]">{money(totalActiveSubscriptionsCost)} / mese</span>
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Segment Pills */}
      <div className="grid grid-cols-3 gap-2 bg-[#EBEBE5]/60 p-1.5 rounded-2xl">
        {(["Tutti", "Attivi", "In scadenza"] as const).map((f) => (
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

      {/* Subscription List */}
      <div className="flex flex-col gap-2.5">
        {filteredSubs.map((sub) => (
          <div
            key={sub.id}
            onClick={() => toggleSubscription(sub.id)}
            className={`flex items-center justify-between p-3.5 rounded-[22px] bg-white border cursor-pointer transition-all ${
              sub.active
                ? "border-[#EBEBE5] shadow-xs hover:border-[#121212]/30 opacity-100"
                : "border-[#EBEBE5] opacity-50 bg-[#F8F8F5]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center font-bold text-sm shrink-0 text-[#121212]">
                <Film className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#121212] leading-tight">
                  {sub.name}
                </h4>
                <p className="text-[11px] text-[#73736E] font-medium mt-0.5">
                  {money(sub.cost)} / {sub.frequency} · <span className="text-[#A3A39E]">{sub.date}</span>
                </p>
              </div>
            </div>

            {/* Custom Sleek ZERO Subscription Toggle */}
            <SubscriptionToggle
              checked={sub.active}
              onChange={() => toggleSubscription(sub.id)}
            />
          </div>
        ))}

        {filteredSubs.length === 0 && (
          <div className="text-center py-10 text-[#73736E] text-xs font-medium">
            Nessun abbonamento trovato.
          </div>
        )}
      </div>

      {/* Reminder Banner */}
      <div className="rounded-[20px] bg-white border border-[#EBEBE5] p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#121212] text-[#F5E050] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#121212] leading-tight">
              Tieni tutto sotto controllo.
            </p>
            <p className="text-[10px] text-[#73736E] font-medium mt-0.5">
              Niente sorprese in estratto conto.
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#A3A39E]" />
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#F8F8F5] rounded-t-[32px] sm:rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-white border border-[#EBEBE5] text-[#121212]"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-black text-[#121212]">
                Nuovo Abbonamento
              </h2>
              <div className="w-8" />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">
                  Nome Servizio
                </label>
                <input
                  type="text"
                  placeholder="Es. Disney+, ChatGPT, Gym..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#73736E] mb-1">
                    Costo (€)
                  </label>
                  <input
                    type="text"
                    placeholder="9,99"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#73736E] mb-1">
                    Frequenza
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none"
                  >
                    <option value="mese">Mensile</option>
                    <option value="anno">Annuale</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveSub}
                className="w-full py-3.5 mt-2 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all"
              >
                Salva Abbonamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
