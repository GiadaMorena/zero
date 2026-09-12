import React, { useState } from "react";
import { Search, Plus, ShoppingCart, Music, Utensils, Fuel, Film, ShoppingBag, Pill, Filter } from "lucide-react";

export type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  icon: any;
};

const initialTransactions: Transaction[] = [
  { id: "1", title: "Supermercato", category: "Cibo", amount: -42.3, date: "12 set 2026", icon: ShoppingCart },
  { id: "2", title: "Spotify", category: "Abbonamenti", amount: -3.49, date: "10 set 2026", icon: Music },
  { id: "3", title: "Ristorante", category: "Cibo", amount: -28.0, date: "9 set 2026", icon: Utensils },
  { id: "4", title: "Benzina", category: "Trasporti", amount: -55.0, date: "6 set 2026", icon: Fuel },
  { id: "5", title: "Netflix", category: "Abbonamenti", amount: -6.99, date: "5 set 2026", icon: Film },
  { id: "6", title: "Zara", category: "Shopping", amount: -49.95, date: "3 set 2026", icon: ShoppingBag },
  { id: "7", title: "Farmacia", category: "Casa", amount: -12.5, date: "1 set 2026", icon: Pill },
];

interface SpeseScreenProps {
  onOpenAddModal: () => void;
}

export function SpeseScreen({ onOpenAddModal }: SpeseScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Tutte");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const categories = ["Tutte", "Casa", "Cibo", "Trasporti", "Shopping", "Abbonamenti", "Svago", "Altro"];

  const filtered = initialTransactions.filter((item) => {
    const matchesCat = activeCategory === "Tutte" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalSpending = filtered.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  return (
    <div className="flex flex-col gap-5 p-5 pt-safe pb-24 bg-[#F8F8F5] select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#121212]">
          Spese
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-full bg-white border border-[#EBEBE5] text-[#121212] hover:bg-[#F8F8F5] shadow-sm transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="p-2.5 rounded-full bg-[#121212] text-white hover:bg-black shadow-md transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#73736E]" />
          <input
            type="text"
            placeholder="Cerca spesa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#EBEBE5] text-sm focus:outline-none focus:border-[#F5E050]"
          />
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-[#F5E050] text-[#121212] shadow-sm"
                  : "bg-white text-[#73736E] border border-[#EBEBE5] hover:text-[#121212]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Total Month Card Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-xs font-semibold text-[#73736E]">Settembre 2026</span>
        <span className="text-sm font-extrabold text-[#121212]">
          - {money(totalSpending)}
        </span>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((t) => {
          const IconComponent = t.icon;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] shadow-sm hover:border-[#F5E050]/60 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212] shrink-0">
                  <IconComponent className="h-5 w-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#121212] leading-tight">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-[#73736E] font-medium mt-0.5">
                    {t.date}
                  </p>
                </div>
              </div>
              <div className="text-sm font-extrabold text-[#121212]">
                - {money(Math.abs(t.amount))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#73736E] text-xs">
            Nessuna spesa trovata.
          </div>
        )}
      </div>
    </div>
  );
}
