"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  ArrowUpRight,
  Filter,
  ArrowUpDown,
  Trash2,
  CreditCard,
  ShoppingCart,
  Car,
  DollarSign,
  ShoppingBag,
  Home,
  Utensils,
  Fuel,
  Smile,
  Heart,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DesktopMovimentiProps {
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  searchQuery?: string;
}

export function DesktopMovimenti({
  onOpenAddExpense,
  onOpenAddIncome,
  searchQuery = "",
}: DesktopMovimentiProps) {
  const { transactions, deleteTransaction, cards } = useApp();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutte");
  const [selectedCardId, setSelectedCardId] = useState<string>("Tutte");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const categories = [
    "Tutte",
    "Casa",
    "Cibo",
    "Trasporti",
    "Shopping",
    "Svago",
    "Salute",
    "Abbonamenti",
    "Entrata",
    "Altro",
  ];

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  // Filtering
  const filtered = transactions.filter((t) => {
    const q = (localSearch || searchQuery).toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "Tutte" || t.category === selectedCategory;
    const matchesCard = selectedCardId === "Tutte" || t.cardId === selectedCardId;
    return matchesSearch && matchesCategory && matchesCard;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "amount") {
      return sortOrder === "desc" ? Math.abs(b.amount) - Math.abs(a.amount) : Math.abs(a.amount) - Math.abs(b.amount);
    }
    return sortOrder === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
  });

  const getCardName = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    return card ? card.bankName : "ZERO";
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#121212] tracking-tight">
            Tutte le Spese & Movimenti
          </h2>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Trovate {sorted.length} transazioni registrate
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2.5 rounded-2xl bg-[#FEF9C3] border border-[#F5E050]/80 text-[#121212] text-xs font-bold shadow-xs hover:bg-[#F5E050] transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Aggiungi spesa</span>
          </button>
          <button
            onClick={onOpenAddIncome}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#EBEBE5] text-[#121212] text-xs font-bold shadow-xs hover:border-[#121212] transition-colors flex items-center gap-1.5"
          >
            <ArrowUpRight className="h-4 w-4 text-[#166534]" />
            <span>Nuova entrata</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73736E]" />
          <input
            type="text"
            placeholder="Filtra per descrizione o nota..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#121212] text-white shadow-xs"
                  : "bg-[#F8F8F5] text-[#73736E] border border-[#EBEBE5] hover:text-[#121212]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#73736E]">Carta:</span>
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none"
          >
            <option value="Tutte">Tutte le carte</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bankName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBEBE5] bg-[#F8F8F5]/80 text-[11px] font-black text-[#73736E] uppercase tracking-wider">
                <th className="py-4 px-6">Movimento / Descrizione</th>
                <th className="py-4 px-6">Categoria</th>
                <th className="py-4 px-6">Carta / Conto</th>
                <th className="py-4 px-6">Data</th>
                <th
                  className="py-4 px-6 cursor-pointer hover:text-[#121212] text-right"
                  onClick={() => {
                    setSortField("amount");
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Importo</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-4 px-6 text-center">Azioni</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F4F4F0] text-xs font-semibold text-[#121212]">
              {sorted.map((tx) => {
                const isIncome = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#F8F8F5]/50 transition-colors group">
                    {/* Descrizione */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center shrink-0">
                          {tx.category === "Cibo" ? (
                            <Utensils className="h-4 w-4 text-[#555]" />
                          ) : tx.category === "Trasporti" ? (
                            <Fuel className="h-4 w-4 text-[#555]" />
                          ) : isIncome ? (
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-[#555]" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#121212]">{tx.title}</p>
                          {tx.note && <p className="text-[10px] text-[#73736E] font-medium">{tx.note}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] text-[11px] font-bold text-[#73736E]">
                        {tx.category}
                      </span>
                    </td>

                    {/* Carta */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                        <CreditCard className="h-3.5 w-3.5 text-[#73736E]" />
                        <span>{getCardName(tx.cardId)}</span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-6 text-[#73736E] font-medium">{tx.date}</td>

                    {/* Importo */}
                    <td className="py-4 px-6 text-right">
                      <span className={`text-sm font-black ${isIncome ? "text-[#166534]" : "text-[#121212]"}`}>
                        {isIncome ? "+" : "-"} {money(Math.abs(tx.amount))}
                      </span>
                    </td>

                    {/* Azioni */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-2 rounded-xl text-[#A3A39E] hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Elimina movimento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-[#73736E]">
            <p className="text-sm font-bold">Nessun movimento trovato</p>
            <p className="text-xs mt-1">Prova a cambiare i filtri o la ricerca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
