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

type ExtendedTab = NavTab | "welcome";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("welcome");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Financial state
  const [balance, setBalance] = useState(1245.8);
  const [income] = useState(1800.0);
  const [spending, setSpending] = useState(554.2);

  const handleSaveSpesa = (data: any) => {
    const numericAmount = parseFloat(data.amount.replace(",", ".")) || 0;
    if (numericAmount > 0) {
      setSpending((prev) => prev + numericAmount);
      setBalance((prev) => prev - numericAmount);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "welcome":
        return <WelcomeScreen onStart={() => setActiveTab("home")} />;
      case "home":
        return (
          <HomeScreen
            balance={balance}
            income={income}
            spending={spending}
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
            balance={balance}
            income={income}
            spending={spending}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <main
      className={`min-h-screen w-full flex justify-center selection:bg-[#F5E050]/50 transition-colors duration-500 ${
        activeTab === "welcome" ? "bg-[#121212]" : "bg-[#F8F8F5]"
      }`}
    >
      <div
        className={`w-full max-w-md min-h-screen flex flex-col justify-between relative transition-colors duration-500 ${
          activeTab === "welcome" ? "bg-[#121212]" : "bg-[#F8F8F5]"
        }`}
      >
        <div key={activeTab} className="flex-1 overflow-y-auto no-scrollbar relative animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderActiveScreen()}
        </div>

        {activeTab !== "welcome" && (
          <BottomNavBar
            currentTab={activeTab as NavTab}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        )}
      </div>

      {/* Add Spesa Modal */}
      <AddSpesaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSpesa}
      />
    </main>
  );
}
