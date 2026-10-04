"use client";

import React, { useState } from "react";
import { Plus, Bell, Film, Music, Cloud, Sparkles, Bot, Dumbbell, Smartphone, Trash2, X, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SubscriptionLogo } from "./SubscriptionLogo";

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

const PRESET_SUBSCRIPTIONS = [
  { name: "Netflix", cost: 6.99, freq: "mese" as const, cat: "Svago", icon: Film },
  { name: "Spotify", cost: 10.99, freq: "mese" as const, cat: "Musica", icon: Music },
  { name: "iCloud+", cost: 0.99, freq: "mese" as const, cat: "Cloud", icon: Cloud },
  { name: "Disney+", cost: 8.99, freq: "mese" as const, cat: "Svago", icon: Sparkles },
  { name: "ChatGPT Plus", cost: 22.99, freq: "mese" as const, cat: "Produttività", icon: Bot },
  { name: "Amazon Prime", cost: 4.99, freq: "mese" as const, cat: "Shopping", icon: Film },
  { name: "Palestra", cost: 45.00, freq: "mese" as const, cat: "Salute", icon: Dumbbell },
  { name: "Offerta Mobile", cost: 9.99, freq: "mese" as const, cat: "Utenze", icon: Smartphone },
];

export function AbbonamentiScreen() {
  const {
    subscriptions,
    toggleSubscription,
    addSubscription,
    deleteSubscription,
    totalActiveSubscriptionsCost,
  } = useApp();

  const [filter, setFilter] = useState<"Tutti" | "Attivi" | "Disattivati">("Attivi");
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
    if (filter === "Disattivati") return !s.active;
    return true;
  });

  const handleApplyPreset = (preset: typeof PRESET_SUBSCRIPTIONS[0]) => {
    setName(preset.name);
    setCost(String(preset.cost).replace(".", ","));
    setFrequency(preset.freq);
    setCategory(preset.cat);
    setIsAddModalOpen(true);
  };

  const handleQuickAddPreset = (preset: typeof PRESET_SUBSCRIPTIONS[0]) => {
    addSubscription({
      name: preset.name,
      cost: preset.cost,
      frequency: preset.freq,
      date: `1 ${new Date().toLocaleDateString("it-IT", { month: "long" })}`,
      category: preset.cat,
    });
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    const numCost = parseFloat(cost.replace(",", ".")) || 0;
    if (name.trim() && numCost > 0) {
      const dateLabel = `${renewDay} ${renewMonth}`;
      addSubscription({
        name: name.trim(),
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

  const getSubIcon = (subName: string) => {
    const lower = subName.toLowerCase();
    if (lower.includes("netflix") || lower.includes("disney") || lower.includes("prime")) return Film;
    if (lower.includes("spotify") || lower.includes("apple music")) return Music;
    if (lower.includes("icloud") || lower.includes("google") || lower.includes("drive")) return Cloud;
    if (lower.includes("chatgpt") || lower.includes("ai")) return Bot;
    if (lower.includes("palestra") || lower.includes("gym")) return Dumbbell;
    if (lower.includes("iliad") || lower.includes("vodafone") || lower.includes("tim") || lower.includes("ho")) return Smartphone;
    return Sparkles;
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
            Totale attivo:{" "}
            <span className="font-extrabold text-[#0B0B0B]">
              {money(totalActiveSubscriptionsCost)} / mese
            </span>
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setCost("");
            setIsAddModalOpen(true);
          }}
          className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Preset Fast Selection Slider */}
      <div>
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-bold text-[#A7A7A7] uppercase tracking-wider">
            Aggiunta rapida
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRESET_SUBSCRIPTIONS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border border-[#A7A7A7]/20 shadow-2xs shrink-0 hover:border-[#0B0B0B] active:scale-95 transition-all text-left cursor-pointer group"
              >
                <div className="h-6 w-6 rounded-lg bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center group-hover:bg-[#FDC909] transition-colors">
                  <SubscriptionLogo name={preset.name} size={22} fallback={<Icon className="h-3.5 w-3.5 text-[#111]" />} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B0B0B] leading-tight">{preset.name}</p>
                  <p className="text-[10px] text-[#A7A7A7] font-medium">{money(preset.cost)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Segment Pills */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#A7A7A7]/20 p-1.5 rounded-2xl">
        {(["Tutti", "Attivi", "Disattivati"] as const).map((f) => (
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

      {/* Subscription List */}
      <div className="flex flex-col gap-2.5">
        {filteredSubs.map((sub) => {
          const Icon = getSubIcon(sub.name);
          return (
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
                  <SubscriptionLogo name={sub.name} size={28} fallback={<Icon className="h-4.5 w-4.5 text-[#111]" />} />
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

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Vuoi rimuovere l'abbonamento ${sub.name}?`)) {
                      deleteSubscription(sub.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#A7A7A7] hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Custom Sleek ZERO Subscription Toggle */}
                <SubscriptionToggle
                  checked={sub.active}
                  onChange={() => toggleSubscription(sub.id)}
                />
              </div>
            </div>
          );
        })}

        {filteredSubs.length === 0 && (
          <div className="text-center py-10 text-[#A7A7A7] text-xs font-medium bg-white rounded-[24px] border border-[#A7A7A7]/20 p-6 flex flex-col items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#A7A7A7]/60" />
            <p className="font-bold text-[#0B0B0B]">Nessun abbonamento presente</p>
            <p className="text-[11px] max-w-xs">
              Usa i pulsanti in alto per aggiungere rapidamente i tuoi servizi preferiti (Netflix, Spotify, iCloud...) o creane uno nuovo.
            </p>
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
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-xs p-0 sm:p-4 select-none">
          <div
            className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/30 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 min-h-[68dvh] max-h-[92dvh] overflow-y-auto no-scrollbar flex flex-col justify-between"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 2.5rem)" }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#A7A7A7]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#F7F7F5]"
                >
                  <X className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-black text-[#0B0B0B]">
                  Nuovo abbonamento
                </h2>
                <button
                  type="submit"
                  form="add-sub-form"
                  className="px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-black hover:bg-black active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Aggiungi
                </button>
              </div>

            {/* Quick Chips in modal */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1.5">
                Scegli servizio comune
              </label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {PRESET_SUBSCRIPTIONS.slice(0, 5).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setName(p.name);
                      setCost(String(p.cost).replace(".", ","));
                      setFrequency(p.freq);
                      setCategory(p.cat);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                      name === p.name
                        ? "bg-[#FDC909] text-[#0B0B0B]"
                        : "bg-white border border-[#A7A7A7]/20 text-[#A7A7A7] hover:text-[#0B0B0B]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><SubscriptionLogo name={p.name} size={18} />{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form id="add-sub-form" onSubmit={handleSaveSub} className="flex flex-col gap-3">
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
                  required
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
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    Frequenza
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as "mese" | "anno")}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none"
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
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={renewMonth}
                    onChange={(e) => setRenewMonth(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
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
                type="submit"
                className="w-full py-3.5 mt-4 rounded-full bg-[#0B0B0B] text-white font-black text-sm hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Salva abbonamento
              </button>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
