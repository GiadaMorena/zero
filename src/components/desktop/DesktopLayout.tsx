"use client";

import { NotificationBell } from "@/components/NotificationBell";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  LogOut,
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
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import Logo from "@/assets/logo.png";

export type DesktopSection =
  | "dashboard"
  | "movimenti"
  | "carte"
  | "abbonamenti"
  | "assicurazioni"
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
  { id: "assicurazioni", label: "Assicurazioni & PAC", icon: ShieldCheck },
  { id: "carte", label: "Carte", icon: CreditCard },
  { id: "impostazioni", label: "Impostazioni", icon: Settings },
];

const PAGE_TITLES: Record<DesktopSection, string> = {
  dashboard:     "Home",
  movimenti:     "Spese e movimenti",
  analisi:       "Analisi finanziaria",
  obiettivi:     "Obiettivi di risparmio",
  abbonamenti:   "Abbonamenti attivi",
  assicurazioni: "Assicurazioni, Pensione & PAC",
  carte:         "Le tue carte e conti",
  impostazioni:  "Impostazioni",
  profilo:       "Profilo utente",
};

interface DesktopLayoutProps {
  onLogout: () => void;
  isSigningOut?: boolean;
  activeSection: DesktopSection;
  onNavigate: (s: DesktopSection) => void;
  children: React.ReactNode;
  onSearch?: (q: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenScan: () => void;
}

export function DesktopLayout({
  onLogout,
  isSigningOut = false,
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
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setToday(new Date());
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { window.removeEventListener("focus", refresh); window.clearInterval(timer); };
  }, []);

  const handleSearch = (v: string) => {
    setSearchVal(v);
    onSearch?.(v);
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5] text-[#0B0B0B] overflow-hidden font-sans antialiased select-none">
      <a href="#desktop-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[#FDC909] focus:p-3">Vai al contenuto</a>
      {/* ── Fixed Left Sidebar ────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-[#A7A7A7]/20 h-full shadow-xs">
        {/* Official ZERO Logo Header */}
        <div className="px-6 py-5 border-b border-[#A7A7A7]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#FDC909] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-sm">
              <Image
                src={Logo}
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
        <nav aria-label="Menu principale" className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-extrabold text-[#A7A7A7] uppercase tracking-widest px-3 mb-1">
            Menu principale
          </p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                aria-current={active ? "page" : undefined}
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

        <button type="button" onClick={onLogout} disabled={isSigningOut} className="mx-3 mb-3 flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"><LogOut aria-hidden="true" className="h-4 w-4" />{isSigningOut ? "Disconnessione…" : "Disconnetti"}</button>
        {/* Bottom User & Profile */}
        <div className="px-3 pb-4 border-t border-[#A7A7A7]/20 pt-3 flex flex-col gap-1">
          <button
            aria-label="Apri il profilo"
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
            <span className="text-xs text-[#A7A7A7] font-semibold">{today.toLocaleDateString("it-IT", { month: "long", year: "numeric", timeZone: "Europe/Rome" })}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A7A7A7]" />
              <input
                type="text"
                aria-label="Cerca movimenti"
                placeholder="Cerca movimenti..."
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/30 text-xs font-medium text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] w-48 focus:w-64 transition-all"
              />
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenAddExpense}
              className="px-3.5 py-2 rounded-2xl bg-[#FDC909] text-[#0B0B0B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#0B0B0B] hover:text-[#FDC909] transition-colors"
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

            <NotificationBell onManage={() => onNavigate("abbonamenti")} />

            {/* Profile Avatar Button */}
            <button
              aria-label="Apri il profilo"
              onClick={() => onNavigate("profilo")}
              className="h-8 w-8 rounded-full bg-[#0B0B0B] text-[#FDC909] font-black text-xs flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
            >
              {profile.avatarText}
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main id="desktop-content" tabIndex={-1} className="flex-1 overflow-y-auto bg-[#F7F7F5] no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
