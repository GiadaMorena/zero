import React from "react";
import { Home, Receipt, Target, RefreshCw, MoreHorizontal } from "lucide-react";

export type NavTab = "home" | "spese" | "analisi" | "carte" | "obiettivi" | "abbonamenti" | "statistiche" | "profilo";

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function BottomNavBar({ currentTab, onSelectTab }: BottomNavBarProps) {
  const tabs = [
    { id: "home" as NavTab, label: "Home", icon: Home },
    { id: "spese" as NavTab, label: "Spese", icon: Receipt },
    { id: "obiettivi" as NavTab, label: "Obiettivi", icon: Target },
    { id: "abbonamenti" as NavTab, label: "Abbonamenti", icon: RefreshCw },
    { id: "profilo" as NavTab, label: "Altro", icon: MoreHorizontal },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-[#EBEBE5] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive =
            currentTab === t.id ||
            (t.id === "spese" && (currentTab === "analisi" || currentTab === "carte" || currentTab === "statistiche")) ||
            (t.id === "profilo" && currentTab === "profilo");

          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-[#F5E050] text-[#121212] font-semibold scale-105 shadow-sm"
                  : "text-[#73736E] hover:text-[#121212]"
              }`}
            >
              <Icon className={`h-4 w-4 mb-0.5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
