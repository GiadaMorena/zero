"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ArrowUpDown,
  BarChart2,
  Target,
  CreditCard,
  Settings,
  User,
  Bell,
  Search,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Scan,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export type DesktopSection =
  | "dashboard"
  | "movimenti"
  | "carte"
  | "abbonamenti"
  | "obiettivi"
  | "analisi"
  | "impostazioni"
  | "profilo";

const NAV_ITEMS: { id: DesktopSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "movimenti", label: "Spese", icon: ArrowUpDown },
  { id: "analisi", label: "Analisi", icon: BarChart2 },
  { id: "obiettivi", label: "Obiettivi", icon: Target },
  { id: "abbonamenti", label: "Abbonamenti", icon: CreditCard },
  { id: "carte", label: "Carte", icon: CreditCard },
  { id: "impostazioni", label: "Impostazioni", icon: Settings },
];

const PAGE_TITLES: Record<DesktopSection, string> = {
  dashboard: "Home",
  movimenti: "Spese & Movimenti",
  analisi: "Analisi Finanziaria",
  obiettivi: "Obiettivi di Risparmio",
  abbonamenti: "Abbonamenti Attivi",
  carte: "Le tue Carte & Conti",
  impostazioni: "Impostazioni App",
  profilo: "Profilo Utente",
};

interface DesktopLayoutProps {
  activeSection: DesktopSection;
  onNavigate: (s: DesktopSection) => void;
  children: React.ReactNode;
  onSearch?: (q: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenScan: () => void;
}

export function DesktopLayout({
  activeSection,
  onNavigate,
  children,
  onSearch,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenScan,
}: DesktopLayoutProps) {
  const { profile } = useApp();
  const [searchVal, setSearchVal] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (v: string) => {
    setSearchVal(v);
    onSearch?.(v);
  };

  return (
    <div className="flex h-screen bg-[#F8F8F5] text-[#121212] overflow-hidden font-sans antialiased selection:bg-[#F5E050]/50 select-none">
      {/* ── Fixed Left Sidebar ────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-[#EBEBE5] h-full shadow-xs">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#EBEBE5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#F5E050] flex items-center justify-center shadow-md shadow-[#F5E050]/30 shrink-0">
              <span className="font-black text-[#121212] text-base leading-none">Z</span>
            </div>
            <div>
              <p className="font-black text-base tracking-tight text-[#121212] leading-tight">
                ZERO
              </p>
              <p className="text-[10px] text-[#73736E] font-semibold leading-none mt-0.5">
                Finanze personali
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-extrabold text-[#A3A39E] uppercase tracking-widest px-3 mb-1">
            Menu Principale
          </p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#FEF9C3] text-[#121212] shadow-xs border border-[#F5E050]/60"
                    : "text-[#73736E] hover:text-[#121212] hover:bg-[#F8F8F5]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#121212] rounded-r-full" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-[#121212]" : "text-[#73736E] group-hover:text-[#121212]"
                  }`}
                />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-[#121212]/50" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom User & Profile */}
        <div className="px-3 pb-4 border-t border-[#EBEBE5] pt-3 flex flex-col gap-1">
          <button
            onClick={() => onNavigate("profilo")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 ${
              activeSection === "profilo"
                ? "bg-[#FEF9C3] text-[#121212] font-black border border-[#F5E050]/60 shadow-xs"
                : "hover:bg-[#F8F8F5]"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-[#121212] text-[#F5E050] font-black text-xs flex items-center justify-center shrink-0">
              {profile.avatarText}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#121212] truncate">{profile.name}</p>
              <p className="text-[10px] text-[#73736E] font-medium truncate">{profile.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#EBEBE5] bg-white px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-[#121212] tracking-tight">
              {PAGE_TITLES[activeSection]}
            </h1>
            <div className="h-4 w-px bg-[#EBEBE5]" />
            <span className="text-xs text-[#73736E] font-semibold">Settembre 2026</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#73736E]" />
              <input
                type="text"
                placeholder="Cerca transazioni, carte..."
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-medium text-[#121212] placeholder:text-[#A3A39E] focus:outline-none focus:border-[#F5E050] w-48 focus:w-64 transition-all"
              />
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenAddExpense}
              className="px-3.5 py-2 rounded-2xl bg-[#FEF9C3] border border-[#F5E050]/80 text-[#121212] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#F5E050] transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Aggiungi spesa</span>
            </button>

            <button
              onClick={onOpenAddIncome}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#EBEBE5] text-[#121212] text-xs font-bold flex items-center gap-1.5 hover:border-[#121212] transition-colors shadow-xs"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-[#166534]" />
              <span>Nuova entrata</span>
            </button>

            <button
              onClick={onOpenScan}
              className="p-2 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-[#121212] hover:bg-[#EBEBE5] transition-colors"
              title="Scansiona scontrino"
            >
              <Scan className="h-4 w-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-[#121212] hover:bg-[#EBEBE5] transition-colors"
              >
                <Bell className="h-4 w-4" />
                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F5E050] ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#EBEBE5] rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EBEBE5] mb-2">
                    <h3 className="text-xs font-black text-[#121212]">Notifiche ZERO</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#121212]">
                      2 nuove
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Stipendio accreditato</span>
                      </div>
                      <p className="text-[10px] text-[#73736E] mt-0.5">
                        1.800,00 € aggiunti a ZERO Black
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                        <Bell className="h-3.5 w-3.5 text-[#121212]" />
                        <span>Rinnovo Netflix in vista</span>
                      </div>
                      <p className="text-[10px] text-[#73736E] mt-0.5">
                        6,99 € previsti il 5 ott 2026
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => onNavigate("profilo")}
              className="h-8 w-8 rounded-full bg-[#121212] text-[#F5E050] font-black text-xs flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
            >
              {profile.avatarText}
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto bg-[#F8F8F5] no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
