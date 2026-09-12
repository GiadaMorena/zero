"use client";

import React, { useState } from "react";
import {
  LayoutDashboard, ArrowUpDown, PiggyBank, CreditCard,
  Target, BarChart2, Settings, Bell, Search, ChevronRight,
} from "lucide-react";

export type DesktopSection =
  | "dashboard" | "movimenti" | "budget"
  | "abbonamenti" | "obiettivi" | "analisi" | "impostazioni";

const NAV_ITEMS: { id: DesktopSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { id: "movimenti",   label: "Movimenti",    icon: ArrowUpDown     },
  { id: "budget",      label: "Budget",       icon: PiggyBank       },
  { id: "abbonamenti", label: "Abbonamenti",  icon: CreditCard      },
  { id: "obiettivi",   label: "Obiettivi",    icon: Target          },
  { id: "analisi",     label: "Analisi",      icon: BarChart2       },
];

const PAGE_TITLES: Record<DesktopSection, string> = {
  dashboard:   "Dashboard",
  movimenti:   "Movimenti",
  budget:      "Budget",
  abbonamenti: "Abbonamenti",
  obiettivi:   "Obiettivi",
  analisi:     "Analisi",
  impostazioni:"Impostazioni",
};

interface DesktopLayoutProps {
  activeSection: DesktopSection;
  onNavigate: (s: DesktopSection) => void;
  children: React.ReactNode;
  onSearch?: (q: string) => void;
}

export function DesktopLayout({ activeSection, onNavigate, children, onSearch }: DesktopLayoutProps) {
  const [searchVal, setSearchVal] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (v: string) => {
    setSearchVal(v);
    onSearch?.(v);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans antialiased">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 flex flex-col bg-[#111111] border-r border-white/[0.05] h-full select-none">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#F5E050] flex items-center justify-center shadow-lg shadow-[#F5E050]/20 shrink-0">
              <span className="font-black text-[#0A0A0A] text-sm leading-none">Z</span>
            </div>
            <div>
              <p className="font-extrabold text-[15px] tracking-tight text-white leading-tight">Zero</p>
              <p className="text-[10px] text-[#555550] font-medium leading-none mt-0.5">Le tue finanze</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-semibold text-[#444440] uppercase tracking-widest px-3 mb-2">Menu</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#F5E050]/[0.08] text-[#F5E050]"
                    : "text-[#777772] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#F5E050] rounded-r-full" />
                )}
                <Icon className={`h-[15px] w-[15px] shrink-0 transition-colors ${active ? "text-[#F5E050]" : "text-[#555550] group-hover:text-white"}`} />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto text-[#F5E050]/50" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom: settings + user */}
        <div className="px-3 pb-4 border-t border-white/[0.05] pt-3 flex flex-col gap-0.5">
          <button
            onClick={() => onNavigate("impostazioni")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              activeSection === "impostazioni"
                ? "bg-[#F5E050]/[0.08] text-[#F5E050]"
                : "text-[#777772] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Settings className="h-[15px] w-[15px] shrink-0" />
            Impostazioni
          </button>

          {/* User */}
          <div className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all">
            <div className="h-7 w-7 rounded-full bg-[#F5E050] flex items-center justify-center text-[#0A0A0A] font-black text-[11px] shrink-0">
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate">Giada Morena</p>
              <p className="text-[10px] text-[#555550] font-medium">Piano Free · Beta</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.05] bg-[#0A0A0A] px-7 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-bold text-white">{PAGE_TITLES[activeSection]}</h1>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[11px] text-[#555550] font-medium">Settembre 2026</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555550]" />
              <input
                type="text"
                placeholder="Cerca movimenti..."
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[12px] text-white placeholder:text-[#555550] focus:outline-none focus:border-[#F5E050]/30 w-44 focus:w-56 transition-all"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-[#777772] hover:text-white"
              >
                <Bell className="h-[15px] w-[15px]" />
                <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#F5E050]" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl shadow-2xl z-50 p-3">
                  <p className="text-[11px] font-bold text-white px-2 pb-2 border-b border-white/[0.06] mb-2">Notifiche</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { t: "Abbonamento in scadenza", d: "Uno Bravo rinnova il 1 ott" },
                      { t: "Budget quasi esaurito", d: "Casa: 99% del budget usato" },
                    ].map((n, i) => (
                      <div key={i} className="px-2 py-2 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
                        <p className="text-[11px] font-semibold text-white">{n.t}</p>
                        <p className="text-[10px] text-[#555550] mt-0.5">{n.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-[#F5E050] flex items-center justify-center text-[#0A0A0A] font-black text-[11px] cursor-pointer hover:opacity-90 transition-opacity">
              G
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
