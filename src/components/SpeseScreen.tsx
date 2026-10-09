"use client";

import React, { useState } from "react";
import { Search, Plus, ShoppingCart, Utensils, Fuel, ShoppingBag, Trash2, DollarSign } from "lucide-react";
import { useApp, type TransactionItem } from "@/context/AppContext";
import { AddSpesaModal } from "./AddSpesaModal";
import { Pencil } from "lucide-react";
import { filterMovements, sortMovements, movementDateLabel, type MovementFilters } from "@/lib/movementLedger";
import { MovementTools } from "./MovementTools";

interface SpeseScreenProps {
  onOpenAddModal: (type?: "expense" | "income") => void;
}

export function SpeseScreen({ onOpenAddModal }: SpeseScreenProps) {
  const { transactions, deleteTransaction, cards } = useApp();
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tutte");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [extraFilters, setExtraFilters] = useState<Pick<MovementFilters,"period"|"type"|"cardId">>({period:"all",type:"all",cardId:"Tutte"});

  const categories = ["Tutte", ...new Set(["Casa", "Cibo", "Trasporti", "Shopping", "Abbonamenti", "Svago", "Salute", "Tecnologia", ...transactions.map(item=>item.category), "Altro"])];

  const filters:MovementFilters = {...extraFilters,query:searchQuery,category:activeCategory};
  const filtered = sortMovements(filterMovements(transactions,cards,filters));
  const changeFilters=(data:Partial<MovementFilters>)=>setExtraFilters(previous=>({...previous,...data}));
  const resetFilters=()=>{setExtraFilters({period:"all",type:"all",cardId:"Tutte"});setActiveCategory("Tutte");setSearchQuery("");};

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
            onClick={() => {if(showSearch)setSearchQuery("");setShowSearch(!showSearch);}}
            aria-label={showSearch ? "Nascondi ricerca" : "Cerca movimenti"}
            aria-expanded={showSearch}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/20 text-[#0B0B0B] flex items-center justify-center hover:bg-[#F7F7F5] shadow-xs transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpenAddModal("expense")}
            aria-label="Aggiungi spesa"
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
            placeholder="Cerca nome, nota o banca…"
            aria-label="Cerca movimenti"
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
              aria-pressed={isActive}
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

      <MovementTools filters={filters} onChange={changeFilters} onReset={resetFilters} cards={cards} results={filtered}/>

      {/* Total Month Card Header */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="text-xs font-semibold text-[#A7A7A7]">Movimenti dal più recente</span>
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
              <div className="flex min-w-0 flex-1 items-center gap-3">
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
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-bold text-[#0B0B0B] leading-tight">
                    {item.title}
                  </h4>
                  <p className="truncate text-[10px] text-[#A7A7A7] font-medium mt-0.5">
                    {item.category} · {movementDateLabel(item)}
                  </p>
                  {item.note && <p title={item.note} className="mt-0.5 truncate text-[10px] text-[#73736E]">{item.note}</p>}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-black text-[#0B0B0B]">
                  {isIncome ? "+ " : "- "} {money(Math.abs(item.amount))}
                </span>
                <div className="flex items-center">
                <button type="button" onClick={() => setEditing(item)} aria-label={`Modifica ${item.title}`} className="flex h-11 w-11 items-center justify-center text-[#73736E]"><Pencil className="h-4 w-4" /></button>
                <button
                  onClick={() => deleteTransaction(item.id)}
                  className="flex h-11 w-11 items-center justify-center text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors"
                  title="Elimina"
                  aria-label={`Elimina ${item.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                </div>
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
      <AddSpesaModal isOpen={!!editing} transaction={editing || undefined} onClose={() => setEditing(null)} />
    </div>
  );
}
