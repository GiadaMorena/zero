"use client";

import React from "react";
import { Home, BarChart2, Scan, FileText, User } from "lucide-react";

export type NavTab = "home" | "spese" | "analisi" | "carte" | "obiettivi" | "abbonamenti" | "statistiche" | "profilo";

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
            {/* Custom + / - icon with slash in between for income & expenses */}
            <svg
              className="h-6 w-6 stroke-current text-[#0B0B0B]"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Plus on top left */}
              <line x1="5" y1="7" x2="11" y2="7" />
              <line x1="8" y1="4" x2="8" y2="10" />
              {/* Diagonal divider slash */}
              <line x1="15" y1="4" x2="9" y2="20" strokeWidth="2.2" />
              {/* Minus on bottom right */}
              <line x1="13" y1="16" x2="19" y2="16" />
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
