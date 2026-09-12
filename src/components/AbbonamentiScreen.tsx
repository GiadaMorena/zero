import React, { useState } from "react";
import { Plus, Bell, ChevronRight, Film, Music, Cloud, Search, Brain, Phone } from "lucide-react";

export function AbbonamentiScreen() {
  const [filter, setFilter] = useState<"Tutti" | "Attivi" | "In scadenza">("Attivi");

  const [subscriptions, setSubscriptions] = useState([
    { id: "1", name: "Netflix", cost: "€ 6,99 / mese", date: "5 ott 2026", active: true, icon: Film, color: "bg-red-500/10 text-red-600" },
    { id: "2", name: "Spotify", cost: "€ 3,49 / mese", date: "10 ott 2026", active: true, icon: Music, color: "bg-emerald-500/10 text-emerald-600" },
    { id: "3", name: "iCloud", cost: "€ 0,99 / mese", date: "12 ott 2026", active: true, icon: Cloud, color: "bg-sky-500/10 text-sky-600" },
    { id: "4", name: "Google One", cost: "€ 29,99 / anno", date: "20 nov 2026", active: true, icon: Search, color: "bg-amber-500/10 text-amber-600" },
    { id: "5", name: "Uno Bravo", cost: "€ 49,00 / mese", date: "1 ott 2026", active: true, icon: Brain, color: "bg-indigo-500/10 text-indigo-600" },
    { id: "6", name: "Ho.", cost: "€ 8,95 / mese", date: "3 ott 2026", active: true, icon: Phone, color: "bg-purple-500/10 text-purple-600" },
  ]);

  const toggleSub = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className="flex flex-col gap-5 p-5 pt-safe pb-24 bg-[#F8F8F5] select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#121212]">
          Abbonamenti
        </h1>
        <button className="p-2.5 rounded-full bg-[#121212] text-white hover:bg-black shadow-md transition-transform">
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
                ? "bg-[#F5E050] text-[#121212] shadow-sm"
                : "text-[#73736E] hover:text-[#121212]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Subscription List */}
      <div className="flex flex-col gap-2.5">
        {subscriptions.map((sub) => {
          const Icon = sub.icon;
          return (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050]/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${sub.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#121212] leading-tight">
                    {sub.name}
                  </h4>
                  <p className="text-[11px] text-[#73736E] font-medium mt-0.5">
                    {sub.cost} · <span className="text-[#A3A39E]">{sub.date}</span>
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleSub(sub.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  sub.active ? "bg-[#121212]" : "bg-[#EBEBE5]"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md transform ${
                    sub.active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Reminder Banner */}
      <div className="rounded-[24px] bg-[#F8F8F5] border border-[#EBEBE5] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#121212] text-[#F5E050] flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#121212]">
              Tieni tutto sotto controllo.
            </p>
            <p className="text-[11px] text-[#73736E]">Niente sorprese in estratto conto.</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[#73736E]" />
      </div>
    </div>
  );
}
