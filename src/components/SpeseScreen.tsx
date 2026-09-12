"use client";

import React, { useState } from "react";
import { Search, Plus, ShoppingCart, Music, Utensils, Fuel, Film, ShoppingBag, Pill, Trash2, DollarSign } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SpeseScreenProps {
  onOpenAddModal: (type?: "expense" | "income") => void;
}

export function SpeseScreen({ onOpenAddModal }: SpeseScreenProps) {
  const { transactions, deleteTransaction } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>("Tutte");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const categories = ["Tutte", "Casa", "Cibo", "Trasporti", "Shopping", "Abbonamenti", "Svago", "Altro"];

  const filtered = transactions.filter((item) => {
    const matchesCat = activeCategory === "Tutte" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalSpending = filtered
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Spese & Movimenti
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="h-9 w-9 rounded-full bg-white border border-[#EBEBE5] text-[#121212] flex items-center justify-center hover:bg-[#F8F8F5] shadow-xs transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpenAddModal("expense")}
            className="h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      {showSearch && (
        <div className="relative animate-in fade-in duration-200">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#73736E]" />
          <input
            type="text"
            placeholder="Cerca spesa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[20px] bg-white border border-[#EBEBE5] text-xs focus:outline-none focus:border-[#F5E050]"
          />
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-[#F5E050] text-[#121212] shadow-xs"
                  : "bg-white text-[#73736E] border border-[#EBEBE5] hover:text-[#121212]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Total Month Card Header */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="text-xs font-semibold text-[#73736E]">Settembre 2026</span>
        <span className="text-xs font-extrabold text-[#121212]">
          - {money(totalSpending)}
        </span>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((t) => {
          const isIncome = t.amount > 0;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-[#EBEBE5] shadow-xs hover:border-[#121212]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212] shrink-0">
                  {t.category === "Cibo" ? (
                    <ShoppingCart className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : t.category === "Trasporti" ? (
                    <Fuel className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : isIncome ? (
                    <DollarSign className="h-4.5 w-4.5 stroke-[1.8]" />
                  ) : (
                    <ShoppingBag className="h-4.5 w-4.5 stroke-[1.8]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212] leading-tight">
                    {t.title}
                  </h4>
                  <p className="text-[10px] text-[#73736E] font-medium mt-0.5">
                    {t.category} · {t.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black ${
                    isIncome ? "text-[#166534]" : "text-[#121212]"
                  }`}
                >
                  {isIncome ? "+" : "-"} {money(Math.abs(t.amount))}
                </span>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-1 text-[#A3A39E] hover:text-[#991B1B] transition-colors"
                  title="Elimina transazione"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#73736E] text-xs font-medium">
            Nessuna spesa trovata.
          </div>
        )}
      </div>
    </div>
  );
}
