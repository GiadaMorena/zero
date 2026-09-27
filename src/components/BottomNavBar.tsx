"use client";

import React from "react";
import { Home, BarChart2, Scan, FileText, User } from "lucide-react";

export type NavTab = "home" | "spese" | "analisi" | "carte" | "obiettivi" | "abbonamenti" | "statistiche" | "profilo" | "assicurazioni";

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenScan?: () => void;
}

export function BottomNavBar({ currentTab, onSelectTab, onOpenScan }: BottomNavBarProps) {
  const handleCenterAction = () => {
    if (onOpenScan) {
      onOpenScan();
    } else {
      onSelectTab("spese");
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none select-none flex justify-center max-w-md mx-auto">
      <div className="pointer-events-auto bg-white border border-[#A7A7A7] rounded-full px-3 py-2 flex items-center justify-between gap-1 w-full relative">
        {/* Tab 1: Home (Active) */}
        <button
          onClick={() => onSelectTab("home")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <Home
            className={`h-5 w-5 ${
              currentTab === "home" ? "text-[#0B0B0B] stroke-[2.5]" : "text-[#A7A7A7] stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[9px] mt-0.5 tracking-tight font-extrabold ${
              currentTab === "home" ? "text-[#0B0B0B]" : "text-[#A7A7A7]"
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Analisi */}
        <button
          onClick={() => onSelectTab("analisi")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <BarChart2
            className={`h-5 w-5 ${
              currentTab === "analisi" || currentTab === "statistiche"
                ? "text-[#0B0B0B] stroke-[2.5]"
                : "text-[#A7A7A7] stroke-[1.8]"
            }`}
          />
        </button>

        {/* Central Floating Elevated Button: ENTRATE / USCITE (+ / -) (#FDC909) */}
        <div className="relative -top-5 px-1 shrink-0">
          <button
            onClick={handleCenterAction}
            className="h-14 w-14 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center border-4 border-[#F7F7F5] shadow-lg active:scale-95 hover:scale-105 transition-all group"
            title="Registra entrata o uscita"
          >
            {/* Perfectly balanced, bold mathematical ± (Plus-Minus) icon representing income and expenses */}
            <svg
              className="h-6 w-6 text-[#0B0B0B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Plus on top (centered at x=12, y=8) */}
              <line x1="6.5" y1="8" x2="17.5" y2="8" />
              <line x1="12" y1="2.5" x2="12" y2="13.5" />
              {/* Minus on bottom (centered at x=12, y=18.5) */}
              <line x1="6.5" y1="18.5" x2="17.5" y2="18.5" />
            </svg>
          </button>
        </div>

        {/* Tab 3: Movimenti (spese) */}
        <button
          onClick={() => onSelectTab("spese")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <FileText
            className={`h-5 w-5 ${
              currentTab === "spese" ? "text-[#0B0B0B] stroke-[2.5]" : "text-[#A7A7A7] stroke-[1.8]"
            }`}
          />
        </button>

        {/* Tab 4: Profilo */}
        <button
          onClick={() => onSelectTab("profilo")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <User
            className={`h-5 w-5 ${
              currentTab === "profilo" ? "text-[#0B0B0B] stroke-[2.5]" : "text-[#A7A7A7] stroke-[1.8]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
