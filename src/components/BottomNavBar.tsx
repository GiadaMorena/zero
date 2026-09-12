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
      <div className="pointer-events-auto bg-white/98 backdrop-blur-2xl border border-[#EBEBE5] rounded-full shadow-2xl shadow-black/15 px-3 py-2 flex items-center justify-between gap-1 w-full relative">
        {/* Tab 1: Home (Active) */}
        <button
          onClick={() => onSelectTab("home")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <Home
            className={`h-5 w-5 ${
              currentTab === "home" ? "text-[#121212] stroke-[2.5]" : "text-[#A3A39E] stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[9px] mt-0.5 tracking-tight font-extrabold ${
              currentTab === "home" ? "text-[#121212]" : "text-[#A3A39E]"
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
                ? "text-[#121212] stroke-[2.5]"
                : "text-[#A3A39E] stroke-[1.8]"
            }`}
          />
        </button>

        {/* Central Floating Elevated Button: SCANSIONE */}
        <div className="relative -top-5 px-1 shrink-0">
          <button
            onClick={handleCenterAction}
            className="h-14 w-14 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center shadow-lg shadow-[#F5E050]/50 border-4 border-[#F8F8F5] active:scale-95 hover:scale-105 transition-all group"
            title="Scansiona scontrino"
          >
            <Scan className="h-6 w-6 stroke-[2.5] text-[#121212]" />
          </button>
        </div>

        {/* Tab 3: Movimenti (spese) */}
        <button
          onClick={() => onSelectTab("spese")}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all"
        >
          <FileText
            className={`h-5 w-5 ${
              currentTab === "spese" ? "text-[#121212] stroke-[2.5]" : "text-[#A3A39E] stroke-[1.8]"
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
              currentTab === "profilo" ? "text-[#121212] stroke-[2.5]" : "text-[#A3A39E] stroke-[1.8]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
