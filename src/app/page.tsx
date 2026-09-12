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
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, CreditCard, Target } from "lucide-react";

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


// ─── Desktop Landing Page ───────────────────────────────────────────────────
function DesktopLanding({ onLaunchApp }: { onLaunchApp: () => void }) {
  const features = [
    { icon: TrendingUp, title: "Panoramica finanziaria", desc: "Vedi entrate, uscite e risparmio in tempo reale." },
    { icon: BarChart3, title: "Analisi intelligente", desc: "Grafici e statistiche mensili per capire dove vai." },
    { icon: CreditCard, title: "Gestione carte", desc: "Tutte le tue carte in un solo posto, sempre sotto controllo." },
    { icon: Target, title: "Obiettivi di risparmio", desc: "Imposta traguardi e traccia i progressi giorno per giorno." },
    { icon: Shield, title: "Privacy first", desc: "I dati restano sul tuo dispositivo. Nessun cloud, nessun tracciamento." },
    { icon: Zap, title: "Zero attrito", desc: "Aggiungi una spesa in 3 secondi. Disegnato per la vita reale." },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#F5E050] flex items-center justify-center shadow-lg shadow-[#F5E050]/30">
            <span className="font-black text-[#121212] text-sm">Z</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight">Zero</span>
        </div>
        <button
          onClick={onLaunchApp}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5E050] text-[#121212] font-bold text-sm hover:bg-[#EAD900] transition-all hover:scale-105 shadow-lg shadow-[#F5E050]/20"
        >
          Apri l&apos;app
          <ArrowRight className="h-4 w-4" />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[#F5E050]/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#EAB308]/6 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-10 grid grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5E050]/10 border border-[#F5E050]/20 text-[#F5E050] text-xs font-bold mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-[#F5E050] animate-pulse" />
              Ora disponibile in Beta
            </div>

            <h1 className="text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Le tue finanze,{" "}
              <span className="text-[#F5E050]">senza caos.</span>
            </h1>

            <p className="text-lg text-[#A3A39E] leading-relaxed mb-10 max-w-md">
              Zero ti aiuta a tracciare spese, abbonamenti, carte e obiettivi di risparmio — in modo semplice, veloce e senza distrazioni.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={onLaunchApp}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#F5E050] text-[#121212] font-extrabold text-base hover:bg-[#EAD900] transition-all hover:scale-105 shadow-xl shadow-[#F5E050]/25"
              >
                Inizia gratis
                <ArrowRight className="h-5 w-5" />
              </button>
              <span className="text-sm text-[#73736E]">Nessuna carta richiesta</span>
            </div>

            <div className="mt-12 flex items-center gap-8">
              {[
                { num: "100%", label: "Privacy" },
                { num: "0€", label: "Costo" },
                { num: "3s", label: "Per aggiungere una spesa" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">{s.num}</div>
                  <div className="text-xs text-[#73736E] font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-[50px] bg-[#F5E050]/15 blur-2xl scale-110 pointer-events-none" />

              {/* iPhone shell */}
              <div className="relative w-[300px] h-[640px] bg-[#121212] rounded-[46px] border-[8px] border-[#2A2A2A] shadow-[0_40px_80px_rgba(0,0,0,0.7)] overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1">
                  <span className="text-[11px] font-extrabold text-white/80">9:41</span>
                  <div className="h-3.5 w-20 bg-black rounded-full" />
                  <div className="flex gap-1 items-center text-white/80">
                    <div className="flex gap-[2px] items-end">
                      <div className="w-[3px] h-[5px] bg-current rounded-sm opacity-40" />
                      <div className="w-[3px] h-[7px] bg-current rounded-sm opacity-60" />
                      <div className="w-[3px] h-[9px] bg-current rounded-sm opacity-80" />
                      <div className="w-[3px] h-[11px] bg-current rounded-sm" />
                    </div>
                    <div className="w-4 h-3 border border-current rounded-[3px] relative ml-1">
                      <div className="absolute right-0 top-[3px] bottom-[3px] -mr-[3px] w-[3px] bg-current rounded-r-sm" />
                      <div className="absolute inset-[2px] bg-current rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Mock welcome screen inside phone */}
                <div className="flex-1 bg-[#121212] px-5 flex flex-col justify-between pb-8 pt-2 overflow-hidden h-[calc(100%-44px)]">
                  {/* Card preview */}
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      style={{
                        background:
                          "radial-gradient(circle at 85% 15%, rgba(245, 224, 80, 0.4) 0%, rgba(0,0,0,0) 60%), linear-gradient(135deg, #1C1C1C 0%, #2A261B 50%, #3D3712 100%)",
                      }}
                      className="w-[220px] h-[130px] rounded-2xl border border-[#F5E050]/40 p-4 shadow-xl flex flex-col justify-between"
                    >
                      <div className="flex justify-between">
                        <span className="text-[9px] font-extrabold text-white/80 tracking-widest">ZERO</span>
                        <span className="text-sm font-black italic text-[#F5E050]">VISA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-6 rounded bg-gradient-to-tr from-[#FEF08A] to-[#EAB308]" />
                        <div className="h-1 w-8 rounded-full bg-white/20" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[8px] font-mono text-[#FEF08A] tracking-wider">•••• 3377</span>
                        <span className="text-[8px] font-mono text-white/40">09/29</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock text */}
                  <div className="space-y-3">
                    <div>
                      <div className="h-3 w-48 bg-white/80 rounded-full mb-1.5" />
                      <div className="h-3 w-36 bg-white/80 rounded-full mb-1.5" />
                      <div className="h-3 w-24 bg-white/80 rounded-full" />
                    </div>
                    <div className="h-11 w-full bg-white/10 border border-white/15 rounded-full flex items-center px-1.5 gap-2">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0">
                        <ArrowRight className="h-3.5 w-3.5 text-[#121212]" />
                      </div>
                      <div className="h-2 w-24 bg-white/30 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -left-16 top-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-[10px] text-[#73736E] font-medium mb-0.5">Risparmio mese</div>
                <div className="text-lg font-black text-[#F5E050]">+€340</div>
              </div>
              <div className="absolute -right-14 bottom-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-[10px] text-[#73736E] font-medium mb-0.5">Spese oggi</div>
                <div className="text-lg font-black text-white">€28,50</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Tutto quello che ti serve,{" "}
              <span className="text-[#F5E050]">niente di più.</span>
            </h2>
            <p className="text-[#73736E] text-lg max-w-xl mx-auto">
              Zero è pensato per essere usato ogni giorno, senza fatica.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-3xl bg-white/3 border border-white/8 hover:border-[#F5E050]/30 hover:bg-white/5 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-2xl bg-[#F5E050]/10 border border-[#F5E050]/20 flex items-center justify-center mb-4 group-hover:bg-[#F5E050]/20 transition-colors">
                  <Icon className="h-5 w-5 text-[#F5E050]" />
                </div>
                <h3 className="font-bold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-[#73736E] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-10 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Pronto a fare chiarezza?
          </h2>
          <p className="text-[#73736E] mb-8">Inizia subito. Gratis, per sempre.</p>
          <button
            onClick={onLaunchApp}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#F5E050] text-[#121212] font-extrabold text-lg hover:bg-[#EAD900] transition-all hover:scale-105 shadow-2xl shadow-[#F5E050]/30"
          >
            Inizia con Zero
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-10 flex items-center justify-between text-[#73736E] text-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-lg bg-[#F5E050] flex items-center justify-center">
            <span className="font-black text-[#121212] text-[9px]">Z</span>
          </div>
          <span className="font-bold text-white/60">Zero</span>
        </div>
        <span>© 2026 Zero. Fatto con ♥</span>
      </footer>
    </div>
  );
}

// ─── Mobile App Shell ────────────────────────────────────────────────────────
function MobileApp() {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("welcome");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [balance, setBalance] = useState(1245.8);
  const [income] = useState(1800.0);
  const [spending, setSpending] = useState(554.2);

  const handleSaveSpesa = (data: { amount: string }) => {
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

  const bgColor = TAB_BACKGROUNDS[activeTab];

  return (
    <>
      {/*
        ThemeSync — the single global fix.
        Syncs html background, body background, and <meta name="theme-color"> with
        the active screen's color so the status bar area is never a different shade.
        No individual screen needs to be touched.
      */}
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
            />
          )}
        </div>

        <AddSpesaModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveSpesa}
        />
      </main>
    </>
  );
}


// ─── Root: responsive switch ─────────────────────────────────────────────────
export default function Home() {
  const [desktopLaunched, setDesktopLaunched] = useState(false);

  return (
    <>
      {/* Mobile: always show the app */}
      <div className="md:hidden">
        <MobileApp />
      </div>

      {/* Desktop: show landing or app */}
      <div className="hidden md:block">
        {desktopLaunched ? (
          <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="w-[390px] h-[844px] bg-[#F8F8F5] rounded-[52px] border-[10px] border-[#1A1A1A] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
              {/* iOS Status Bar */}
              <div className="bg-[#121212] text-white px-7 pt-3 pb-1 flex items-center justify-between z-40 select-none shrink-0">
                <span className="text-[13px] font-extrabold tracking-tight">9:41</span>
                <div className="h-4 w-24 bg-black rounded-full shadow-inner" />
                <div className="flex items-center gap-1 text-white text-[11px]">
                  <span>▶▶▶</span>
                </div>
              </div>
              {/* App inside phone */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <DesktopAppFrame />
              </div>
              {/* Home Bar */}
              <div className="bg-[#F8F8F5] pt-1 pb-3 flex justify-center shrink-0">
                <div className="w-32 h-1 bg-[#121212]/30 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <DesktopLanding onLaunchApp={() => setDesktopLaunched(true)} />
        )}
      </div>
    </>
  );
}

// Mini app for desktop phone mockup
function DesktopAppFrame() {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("welcome");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [balance, setBalance] = useState(1245.8);
  const [income] = useState(1800.0);
  const [spending, setSpending] = useState(554.2);

  const handleSaveSpesa = (data: { amount: string }) => {
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
        return <HomeScreen balance={balance} income={income} spending={spending} onOpenAddModal={() => setIsAddModalOpen(true)} onNavigate={(tab) => setActiveTab(tab)} />;
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
        return <HomeScreen balance={balance} income={income} spending={spending} onOpenAddModal={() => setIsAddModalOpen(true)} onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: activeTab === "welcome" ? "#121212" : "#F8F8F5" }}
    >
      <div key={activeTab} className="flex-1 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
        {renderActiveScreen()}
      </div>
      {activeTab !== "welcome" && (
        <BottomNavBar currentTab={activeTab as NavTab} onSelectTab={(tab) => setActiveTab(tab)} />
      )}
      <AddSpesaModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveSpesa} />
    </div>
  );
}
