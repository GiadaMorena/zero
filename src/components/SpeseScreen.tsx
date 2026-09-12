"use client";

import React, { useState } from "react";
import { Search, Plus, ShoppingCart, Utensils, Fuel, ShoppingBag, Trash2, DollarSign } from "lucide-react";
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
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B]">
          Spese & Movimenti
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/20 text-[#0B0B0B] flex items-center justify-center hover:bg-[#F7F7F5] shadow-xs transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpenAddModal("expense")}
            className="h-9 w-9 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      {showSearch && (
        <div className="relative animate-in fade-in duration-200">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#A7A7A7]" />
          <input
            type="text"
            placeholder="Cerca spesa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[20px] bg-white border border-[#A7A7A7]/30 text-xs focus:outline-none focus:border-[#FDC909]"
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
                  ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                  : "bg-white text-[#A7A7A7] border border-[#A7A7A7]/20 hover:text-[#0B0B0B]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Total Month Card Header */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="text-xs font-semibold text-[#A7A7A7]">Settembre 2026</span>
        <span className="text-xs font-extrabold text-[#0B0B0B]">
          - {money(totalSpending)}
        </span>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((item) => {
          const isIncome = item.amount > 0;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-[#A7A7A7]/20 shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#F7F7F5] border border-[#A7A7A7]/20 flex items-center justify-center text-[#0B0B0B] shrink-0">
                  {item.category === "Cibo" ? (
                    <ShoppingCart className="h-4 w-4" />
                  ) : item.category === "Trasporti" ? (
                    <Fuel className="h-4 w-4" />
                  ) : isIncome ? (
                    <DollarSign className="h-4 w-4" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B0B0B] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[#A7A7A7] font-medium mt-0.5">
                    {item.category} · {item.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0B0B0B]">
                  {isIncome ? "+ " : "- "} {money(Math.abs(item.amount))}
                </span>
                <button
                  onClick={() => deleteTransaction(item.id)}
                  className="p-1 text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#A7A7A7] text-xs font-medium">
            Nessun movimento trovato.
          </div>
        )}
      </div>
    </div>
  );
}
