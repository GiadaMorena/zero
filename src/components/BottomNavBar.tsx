"use client";

import React from "react";
import { Home, PieChart, Scan, ArrowRightLeft, User } from "lucide-react";

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
    <div className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none select-none flex justify-center">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-[#EBEBE5] rounded-full shadow-2xl shadow-black/15 px-3 py-2 flex items-center justify-between gap-1 max-w-[360px] w-full relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-all duration-200 ${
            currentTab === "home"
              ? "bg-[#121212] text-white shadow-md font-bold scale-105"
              : "text-[#A3A39E] hover:text-[#121212]"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* Tab 2: Analisi */}
        <button
          onClick={() => onSelectTab("analisi")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-all duration-200 ${
            currentTab === "analisi" || currentTab === "statistiche"
              ? "bg-[#121212] text-white shadow-md font-bold scale-105"
              : "text-[#A3A39E] hover:text-[#121212]"
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Analisi</span>
        </button>

        {/* Central Floating elevated button: SCANSIONE */}
        <div className="relative -top-5 px-1 shrink-0">
          <button
            onClick={handleCenterAction}
            className="h-14 w-14 rounded-full bg-[#F5E050] text-[#121212] flex items-center justify-center shadow-lg shadow-[#F5E050]/40 border-4 border-[#F8F8F5] active:scale-95 hover:scale-105 transition-all group"
            title="Scansiona scontrino"
          >
            <Scan className="h-6 w-6 stroke-[2.5] text-[#121212] group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Tab 3: Movimenti (spese) */}
        <button
          onClick={() => onSelectTab("spese")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-all duration-200 ${
            currentTab === "spese"
              ? "bg-[#121212] text-white shadow-md font-bold scale-105"
              : "text-[#A3A39E] hover:text-[#121212]"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Movimenti</span>
        </button>

        {/* Tab 4: Profilo */}
        <button
          onClick={() => onSelectTab("profilo")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-full transition-all duration-200 ${
            currentTab === "profilo"
              ? "bg-[#121212] text-white shadow-md font-bold scale-105"
              : "text-[#A3A39E] hover:text-[#121212]"
          }`}
        >
          <User className="h-4 w-4" />
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">Profilo</span>
        </button>
      </div>
    </div>
  );
}
