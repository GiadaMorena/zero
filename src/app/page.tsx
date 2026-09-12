"use client";

import React, { useState } from "react";
import { MobileFrame } from "@/components/MobileFrame";
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
  const [activeTab, setActiveTab] = useState<ExtendedTab>("home");
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
    <>
      <MobileFrame
        activeScreenTitle={activeTab.toUpperCase()}
        allScreensGrid={
          <MockupGridPreview
            balance={balance}
            income={income}
            spending={spending}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        }
      >
        <div className="min-h-full flex flex-col justify-between bg-[#F8F8F5]">
          {renderActiveScreen()}

          {activeTab !== "welcome" && (
            <BottomNavBar
              currentTab={activeTab as NavTab}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
          )}
        </div>
      </MobileFrame>

      {/* Add Spesa Modal */}
      <AddSpesaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSpesa}
      />
    </>
  );
}

{/* Component to render all 10 screens side-by-side like the user's mockup image */}
function MockupGridPreview({
  balance,
  income,
  spending,
  onOpenAddModal,
}: {
  balance: number;
  income: number;
  spending: number;
  onOpenAddModal: () => void;
}) {
  const screens = [
    { title: "1. Welcome", component: <WelcomeScreen onStart={() => {}} /> },
    {
      title: "2. Home",
      component: (
        <HomeScreen
          balance={balance}
          income={income}
          spending={spending}
          onOpenAddModal={onOpenAddModal}
          onNavigate={() => {}}
        />
      ),
    },
    { title: "3. Spese", component: <SpeseScreen onOpenAddModal={onOpenAddModal} /> },
    { title: "4. Analisi", component: <AnalisiScreen /> },
    { title: "5. Carte", component: <CarteScreen /> },
    { title: "6. Obiettivi", component: <ObiettiviScreen /> },
    { title: "7. Abbonamenti", component: <AbbonamentiScreen /> },
    {
      title: "8. Aggiungi Spesa Modal",
      component: (
        <div className="relative min-h-[640px] bg-[#F8F8F5] p-4 flex items-center justify-center">
          <div className="w-full bg-[#F8F8F5] rounded-[28px] border border-[#EBEBE5] p-5 shadow-lg">
            <h3 className="text-center font-extrabold text-sm mb-2">Aggiungi spesa</h3>
            <div className="text-center my-3 py-3 rounded-2xl bg-white border border-[#EBEBE5]">
              <span className="text-3xl font-black">€ 0,00</span>
            </div>
            <div className="py-3 rounded-full bg-[#121212] text-white text-center font-bold text-xs">
              Salva
            </div>
          </div>
        </div>
      ),
    },
    { title: "9. Statistiche", component: <StatisticheScreen /> },
    { title: "10. Profilo & Impostazioni", component: <ProfiloScreen onNavigate={() => {}} /> },
  ];

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight text-[#121212]">
          Zero — Design System & Screen Gallery
        </h2>
        <p className="text-sm text-[#73736E] mt-1">
          Riproduzione fedele di tutti i 10 schermi dell'applicazione
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {screens.map((s, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#73736E] mb-2">{s.title}</span>
            <div className="w-full h-[640px] bg-[#F8F8F5] rounded-[40px] border-[6px] border-[#121212] shadow-xl overflow-y-auto no-scrollbar relative flex flex-col justify-between">
              {s.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
