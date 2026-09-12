"use client";

import React, { useState, useMemo } from "react";
import { Search, Plus, ChevronDown, ChevronUp, Filter, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { TRANSACTIONS, money } from "./desktopData";

const CATEGORIES = ["Tutte", "Cibo", "Trasporti", "Shopping", "Abbonamenti", "Casa", "Sport", "Salute", "Entrate"];
const PERIODS    = ["Tutto", "Questo mese", "Ultimo mese", "3 mesi", "6 mesi"];

type SortKey = "date" | "desc" | "cat" | "amount";
type SortDir = "asc" | "desc";

interface DesktopMovimentiProps {
  onAddExpense: () => void;
  searchQuery?: string;
}

export function DesktopMovimenti({ onAddExpense, searchQuery = "" }: DesktopMovimentiProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [activeCat, setActiveCat]     = useState("Tutte");
  const [period, setPeriod]           = useState("Questo mese");
  const [sortKey, setSortKey]         = useState<SortKey>("date");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let rows = [...TRANSACTIONS];
    const q = (localSearch || searchQuery).toLowerCase();
    if (q) rows = rows.filter(r => r.desc.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q));
    if (activeCat !== "Tutte") rows = rows.filter(r => r.cat === activeCat);
    rows.sort((a, b) => {
      let va: string | number = a[sortKey as keyof typeof a] as string | number;
      let vb: string | number = b[sortKey as keyof typeof b] as string | number;
      if (sortKey === "amount") { va = Math.abs(a.amount); vb = Math.abs(b.amount); }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [localSearch, searchQuery, activeCat, sortKey, sortDir]);

  const totalIncome  = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  return (
    <div className="p-7 max-w-[1600px] mx-auto w-full flex flex-col gap-5">

      {/* ── Summary pills ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span className="text-[12px] font-bold">{money(totalIncome)}</span>
          <span className="text-[11px] text-emerald-500/60">entrate</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-red-400/80">
          <ArrowDownLeft className="h-3.5 w-3.5" />
          <span className="text-[12px] font-bold">{money(totalExpense)}</span>
          <span className="text-[11px] text-red-500/60">uscite</span>
        </div>
        <div className="text-[11px] text-[#555550] ml-1">
          {filtered.length} moviment{filtered.length === 1 ? "o" : "i"}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
              showFilters
                ? "bg-[#F5E050]/[0.08] border-[#F5E050]/30 text-[#F5E050]"
                : "bg-white/[0.03] border-white/[0.07] text-[#777772] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Filter className="h-3 w-3" /> Filtri
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#F5E050] text-[#0A0A0A] text-[12px] font-bold hover:bg-[#EAD900] transition-all hover:scale-[1.02] active:scale-100 shadow-md shadow-[#F5E050]/10"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Aggiungi
          </button>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="flex items-center gap-3 p-4 bg-[#141414] border border-white/[0.05] rounded-xl animate-in fade-in duration-150">
          {/* Period */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#555550] font-medium uppercase tracking-wider">Periodo</label>
            <div className="flex gap-1.5">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    period === p
                      ? "bg-white/10 text-white"
                      : "text-[#555550] hover:text-white"
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>

          <div className="w-px h-8 bg-white/[0.06] mx-2" />

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] text-[#555550] font-medium uppercase tracking-wider">Cerca</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#555550]" />
              <input
                type="text"
                placeholder="Descrizione..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="pl-7 pr-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[12px] text-white placeholder:text-[#555550] focus:outline-none focus:border-[#F5E050]/25 w-full"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="h-3 w-3 text-[#555550]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Category pills ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
              activeCat === cat
                ? "bg-[#F5E050]/[0.12] text-[#F5E050] border border-[#F5E050]/30"
                : "bg-white/[0.03] border border-white/[0.05] text-[#777772] hover:text-white hover:bg-white/[0.06]"
            }`}
          >{cat}</button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#141414] border border-white/[0.05] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.2fr_2.5fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-[#555550] uppercase tracking-wider">
          {(["date","desc","cat","method","amount"] as const).map(k => (
            <button
              key={k}
              onClick={() => handleSort(k === "method" ? "cat" : k as SortKey)}
              className={`flex items-center gap-1 hover:text-white transition-colors ${k === "amount" ? "justify-end" : ""}`}
            >
              {{ date:"Data", desc:"Descrizione", cat:"Categoria", method:"Metodo", amount:"Importo" }[k]}
              <SortIcon k={k === "method" ? "cat" : k as SortKey} />
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#555550] text-[12px]">Nessun movimento trovato.</div>
          )}
          {filtered.map((t, i) => (
            <div
              key={t.id}
              onClick={() => setSelectedRow(selectedRow === t.id ? null : t.id)}
              className={`grid grid-cols-[1.2fr_2.5fr_1.5fr_1.5fr_1fr] gap-4 px-5 py-3.5 items-center cursor-pointer transition-all ${
                selectedRow === t.id
                  ? "bg-[#F5E050]/[0.04] border-l-2 border-l-[#F5E050]"
                  : "hover:bg-white/[0.025]"
              } ${i < filtered.length - 1 ? "border-b border-white/[0.03]" : ""}`}
            >
              <span className="text-[11px] text-[#555550]">{t.date}</span>
              <span className="text-[12px] font-medium text-white">{t.desc}</span>
              <span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] font-medium text-[#A3A39E]">
                  {t.cat}
                </span>
              </span>
              <span className="text-[11px] text-[#555550]">{t.method}</span>
              <span className={`text-[13px] font-extrabold text-right ${t.amount > 0 ? "text-emerald-400" : "text-white"}`}>
                {t.amount > 0 ? "+" : ""}{money(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
