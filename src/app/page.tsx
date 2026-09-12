"use client";

import React, { useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { SpeseScreen } from "@/components/SpeseScreen";
import { AnalisiScreen } from "@/components/AnalisiScreen";
import { CarteScreen } from "@/components/CarteScreen";
import { ObiettiviScreen } from "@/components/ObiettiviScreen";
import { AbbonamentiScreen } from "@/components/AbbonamentiScreen";
import { StatisticheScreen } from "@/components/StatisticheScreen";
import { ProfiloScreen } from "@/components/ProfiloScreen";
import { AddSpesaModal } from "@/components/AddSpesaModal";
import { BottomNavBar, NavTab } from "@/components/BottomNavBar";
import { ThemeSync } from "@/components/ThemeSync";
import { DesktopApp } from "@/components/desktop/DesktopApp";
import { AppProvider } from "@/context/AppContext";

type ExtendedTab = NavTab | "welcome";

/**
 * Global background map.
 * ThemeSync uses this to sync html/body/theme-color with each screen,
 * so the status bar area is always the same color as the active screen.
 */
const TAB_BACKGROUNDS: Record<ExtendedTab, string> = {
  welcome:      "#121212",
  home:         "#F8F8F5",
  spese:        "#F8F8F5",
  analisi:      "#F8F8F5",
  carte:        "#F8F8F5",
  obiettivi:    "#F8F8F5",
  abbonamenti:  "#F8F8F5",
  statistiche:  "#F8F8F5",
  profilo:      "#F8F8F5",
};

// ─── Mobile App Shell ────────────────────────────────────────────────────────
function MobileApp() {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("welcome");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "welcome":
        return <WelcomeScreen onStart={() => setActiveTab("home")} />;
      case "home":
        return (
          <HomeScreen
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case "spese":
        return <SpeseScreen onOpenAddModal={() => setIsAddModalOpen(true)} />;
      case "analisi":
        return <AnalisiScreen />;
      case "carte":
        return <CarteScreen />;
      case "obiettivi":
        return <ObiettiviScreen />;
      case "abbonamenti":
        return <AbbonamentiScreen />;
      case "statistiche":
        return <StatisticheScreen />;
      case "profilo":
        return <ProfiloScreen onNavigate={(tab) => setActiveTab(tab)} />;
      default:
        return (
          <HomeScreen
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  const bgColor = TAB_BACKGROUNDS[activeTab];

  return (
    <>
      <ThemeSync screenBackground={bgColor} />

      <main
        className="w-full min-h-[100dvh] flex flex-col selection:bg-[#F5E050]/50 transition-colors duration-500"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="flex-1 flex flex-col w-full transition-colors duration-500"
          style={{ backgroundColor: bgColor }}
        >
          <div
            key={activeTab}
            className="flex-1 overflow-y-auto no-scrollbar relative animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {renderActiveScreen()}
          </div>

          {activeTab !== "welcome" && (
            <BottomNavBar
              currentTab={activeTab as NavTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenScan={() => setIsAddModalOpen(true)}
            />
          )}
        </div>

        <AddSpesaModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </main>
    </>
  );
}

// ─── Root: responsive switch ─────────────────────────────────────────────────
export default function Home() {
  return (
    <AppProvider>
      {/* Mobile (< 768px): full-screen app experience */}
      <div className="md:hidden">
        <MobileApp />
      </div>

      {/* Desktop (≥ 768px): native desktop app with sidebar */}
      <div className="hidden md:block">
        <DesktopApp />
      </div>
    </AppProvider>
  );
}
