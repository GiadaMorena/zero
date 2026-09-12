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
        checked ? "bg-[#FDC909]" : "bg-[#A7A7A7]/40"
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
  const [renewDay, setRenewDay] = useState("1");
  const [renewMonth, setRenewMonth] = useState("gennaio");

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
      const dateLabel = `${renewDay} ${renewMonth}`;
      addSubscription({
        name,
        cost: numCost,
        frequency,
        date: dateLabel,
        category,
      });
      setName("");
      setCost("");
      setRenewDay("1");
      setRenewMonth("gennaio");
      setIsAddModalOpen(false);
    }
  };

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
            Abbonamenti
          </h1>
          <p className="text-xs text-[#A7A7A7] font-medium mt-0.5">
            Totale attivo: <span className="font-extrabold text-[#0B0B0B]">{money(totalActiveSubscriptionsCost)} / mese</span>
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Filter Segment Pills */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["Tutti", "Attivi", "In scadenza"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
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
                ? "border-[#A7A7A7]/30 shadow-xs opacity-100"
                : "border-[#A7A7A7]/20 opacity-50 bg-[#F7F7F5]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center font-bold text-sm shrink-0 text-[#0B0B0B]">
                <Film className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#0B0B0B] leading-tight">
                  {sub.name}
                </h4>
                <p className="text-[11px] text-[#A7A7A7] font-medium mt-0.5">
                  {money(sub.cost)} / {sub.frequency} · <span className="text-[#A7A7A7]">{sub.date}</span>
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
          <div className="text-center py-10 text-[#A7A7A7] text-xs font-medium">
            Nessun abbonamento trovato.
          </div>
        )}
      </div>

      {/* Reminder Banner */}
      <div className="rounded-[20px] bg-white border border-[#A7A7A7]/20 p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B0B0B] leading-tight">
              Tieni tutto sotto controllo.
            </p>
            <p className="text-[10px] text-[#A7A7A7] font-medium mt-0.5">
              Niente sorprese in estratto conto.
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#A7A7A7]" />
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/30 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B]"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-black text-[#0B0B0B]">
                Nuovo abbonamento
              </h2>
              <div className="w-8" />
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                  Nome servizio
                </label>
                <input
                  type="text"
                  placeholder="Es. Disney+, ChatGPT, Gym..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    Costo (€)
                  </label>
                  <input
                    type="text"
                    placeholder="9,99"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7] text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    Frequenza
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7] text-xs font-bold text-[#0B0B0B] focus:outline-none"
                  >
                    <option value="mese">Mensile</option>
                    <option value="anno">Annuale</option>
                  </select>
                </div>
              </div>

              {/* Data di rinnovo */}
              <div>
                <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                  Data di rinnovo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={renewDay}
                    onChange={(e) => setRenewDay(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7] text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={renewMonth}
                    onChange={(e) => setRenewMonth(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7] text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  >
                    {["gennaio","febbraio","marzo","aprile","maggio","giugno",
                      "luglio","agosto","settembre","ottobre","novembre","dicembre"
                    ].map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveSub}
                className="w-full py-3.5 mt-2 rounded-full bg-[#0B0B0B] text-white font-black text-sm hover:bg-black transition-all"
              >
                Salva abbonamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
