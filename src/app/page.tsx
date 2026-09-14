"use client";

import React, { useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AuthScreen } from "@/components/AuthScreen";
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

type ExtendedTab = NavTab | "welcome" | "auth";

/**
 * Global background map.
 * ThemeSync uses this to sync html/body/theme-color with each screen,
 * so the status bar area is always the same color as the active screen.
 */
const TAB_BACKGROUNDS: Record<ExtendedTab, string> = {
  welcome:      "#0B0B0B",
  auth:         "#F7F7F5",
  home:         "#F7F7F5",
  spese:        "#F7F7F5",
  analisi:      "#F7F7F5",
  carte:        "#F7F7F5",
  obiettivi:    "#F7F7F5",
  abbonamenti:  "#F7F7F5",
  statistiche:  "#F7F7F5",
  profilo:      "#F7F7F5",
};

// ─── Mobile App Shell ────────────────────────────────────────────────────────
function MobileApp() {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("welcome");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"expense" | "income">("expense");

  const handleOpenAddModal = (type: "expense" | "income" = "expense") => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "welcome":
        return <WelcomeScreen onStart={() => setActiveTab("auth")} />;
      case "auth":
        return <AuthScreen onAuth={() => setActiveTab("home")} />;
      case "home":
        return (
          <HomeScreen
            onOpenAddModal={handleOpenAddModal}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case "spese":
        return <SpeseScreen onOpenAddModal={(type) => handleOpenAddModal(type || "expense")} />;
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
            onOpenAddModal={handleOpenAddModal}
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
        className="w-full min-h-[100dvh] flex flex-col selection:bg-[#FDC909] transition-colors duration-500"
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

          {activeTab !== "welcome" && activeTab !== "auth" && (
            <BottomNavBar
              currentTab={activeTab as NavTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenScan={() => handleOpenAddModal("expense")}
            />
          )}
        </div>

        <AddSpesaModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultType={addModalType}
        />
      </main>
    </>
  );
}

function DesktopWithAuth() {
  const [isAuthed, setIsAuthed] = useState(false);

  if (!isAuthed) {
    return <AuthScreen onAuth={() => setIsAuthed(true)} />;
  }

  return <DesktopApp />;
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
        <DesktopWithAuth />
      </div>
    </AppProvider>
  );
}
