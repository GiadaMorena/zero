"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import ZeroLogo from "@/assets/Zero-logo.png";

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
    <div className="flex h-screen bg-[#F7F7F5] text-[#0B0B0B] overflow-hidden font-sans antialiased selection:bg-[#FDC909]/40 select-none">
      {/* ── Fixed Left Sidebar ────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-[#A7A7A7]/20 h-full shadow-xs">
        {/* Official ZERO Logo Header */}
        <div className="px-6 py-5 border-b border-[#A7A7A7]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#0B0B0B] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-md">
              <Image
                src={ZeroLogo}
                alt="ZERO Logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <p className="font-black text-base tracking-tight text-[#0B0B0B] leading-tight">
                ZERO
              </p>
              <p className="text-[10px] text-[#A7A7A7] font-semibold leading-none mt-0.5">
                Finanze personali
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest px-3 mb-1">
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
                    ? "bg-[#FDC909] text-[#0B0B0B] shadow-xs"
                    : "text-[#A7A7A7] hover:text-[#0B0B0B] hover:bg-[#F7F7F5]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0B0B0B] rounded-r-full" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-[#0B0B0B]" : "text-[#A7A7A7] group-hover:text-[#0B0B0B]"
                  }`}
                />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-[#0B0B0B]" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom User & Profile */}
        <div className="px-3 pb-4 border-t border-[#A7A7A7]/20 pt-3 flex flex-col gap-1">
          <button
            onClick={() => onNavigate("profilo")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 ${
              activeSection === "profilo"
                ? "bg-[#FDC909] text-[#0B0B0B] font-black shadow-xs"
                : "hover:bg-[#F7F7F5]"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] font-black text-xs flex items-center justify-center shrink-0">
              {profile.avatarText}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#0B0B0B] truncate">{profile.name}</p>
              <p className="text-[10px] text-[#A7A7A7] font-medium truncate">{profile.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#A7A7A7]/20 bg-white px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-[#0B0B0B] tracking-tight">
              {PAGE_TITLES[activeSection]}
            </h1>
            <div className="h-4 w-px bg-[#A7A7A7]/30" />
            <span className="text-xs text-[#A7A7A7] font-semibold">Settembre 2026</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A7A7A7]" />
              <input
                type="text"
                placeholder="Cerca transazioni, carte..."
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/30 text-xs font-medium text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] w-48 focus:w-64 transition-all"
              />
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenAddExpense}
              className="px-3.5 py-2 rounded-2xl bg-[#FDC909] text-[#0B0B0B] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#FDC909]/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Aggiungi spesa</span>
            </button>

            <button
              onClick={onOpenAddIncome}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] text-xs font-bold flex items-center gap-1.5 hover:border-[#0B0B0B] transition-colors shadow-xs"
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-[#0B0B0B]" />
              <span>Nuova entrata</span>
            </button>

            <button
              onClick={onOpenScan}
              className="p-2 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#A7A7A7]/10 transition-colors"
              title="Scansiona scontrino"
            >
              <Scan className="h-4 w-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#A7A7A7]/10 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FDC909] ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#A7A7A7]/30 rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#A7A7A7]/20 mb-2">
                    <h3 className="text-xs font-black text-[#0B0B0B]">Notifiche ZERO</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FDC909] text-[#0B0B0B]">
                      2 nuove
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/20">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B0B0B]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0B0B0B]" />
                        <span>Stipendio accreditato</span>
                      </div>
                      <p className="text-[10px] text-[#A7A7A7] mt-0.5">
                        + 1.800,00 € aggiunti a ZERO Black
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/20">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B0B0B]">
                        <Bell className="h-3.5 w-3.5 text-[#0B0B0B]" />
                        <span>Rinnovo Netflix in vista</span>
                      </div>
                      <p className="text-[10px] text-[#A7A7A7] mt-0.5">
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
              className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] font-black text-xs flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
            >
              {profile.avatarText}
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto bg-[#F7F7F5] no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
