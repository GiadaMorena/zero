"use client";

import React, { useState } from "react";
import { DesktopLayout, DesktopSection } from "./DesktopLayout";
import { DesktopDashboard } from "./DesktopDashboard";
import { DesktopMovimenti } from "./DesktopMovimenti";
import { DesktopBudget } from "./DesktopBudget";
import { DesktopAbbonamenti } from "./DesktopAbbonamenti";
import { DesktopObiettivi } from "./DesktopObiettivi";
import { DesktopAnalisi } from "./DesktopAnalisi";
import { AddExpensePanel } from "./AddExpensePanel";
import { Settings, Bell, User, Palette, Shield, CreditCard, ChevronRight } from "lucide-react";

// ─── Impostazioni placeholder ─────────────────────────────────────────────────
function DesktopImpostazioni() {
  return (
    <div className="p-7 max-w-[900px] flex flex-col gap-6">
      {[
        { icon: User,      label: "Profilo",       items: ["Modifica nome", "Cambia email", "Foto profilo"] },
        { icon: Bell,      label: "Notifiche",     items: ["Notifiche budget", "Scadenze abbonamenti", "Riepilogo settimanale"] },
        { icon: Palette,   label: "Aspetto",       items: ["Tema scuro", "Lingua: Italiano", "Valuta: EUR"] },
        { icon: Shield,    label: "Privacy",       items: ["Cancella dati", "Esporta CSV", "Informativa privacy"] },
        { icon: CreditCard,label: "Piano",         items: ["Piano Free", "Passa a Pro", "Fatturazione"] },
      ].map(({ icon: Icon, label, items }) => (
        <div key={label} className="bg-[#141414] border border-white/[0.05] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
            <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center">
              <Icon className="h-4 w-4 text-[#F5E050]" />
            </div>
            <h2 className="text-[13px] font-bold text-white">{label}</h2>
          </div>
          {items.map(item => (
            <button key={item} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0 text-left">
              <span className="text-[12px] text-[#A3A39E]">{item}</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#555550]" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Root Desktop App ─────────────────────────────────────────────────────────
export function DesktopApp() {
  const [activeSection, setActiveSection] = useState<DesktopSection>("dashboard");
  const [isPanelOpen,   setIsPanelOpen]   = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");

  const handleNavigate = (s: string) => {
    setActiveSection(s as DesktopSection);
  };

  const handleSaveExpense = (data: { amount: string; desc: string; cat: string }) => {
    // In a real app: update global state/DB
    console.log("Saved:", data);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DesktopDashboard
            onNavigate={handleNavigate}
            onAddExpense={() => setIsPanelOpen(true)}
          />
        );
      case "movimenti":
        return (
          <DesktopMovimenti
            onAddExpense={() => setIsPanelOpen(true)}
            searchQuery={searchQuery}
          />
        );
      case "budget":
        return <DesktopBudget />;
      case "abbonamenti":
        return <DesktopAbbonamenti />;
      case "obiettivi":
        return <DesktopObiettivi />;
      case "analisi":
        return <DesktopAnalisi />;
      case "impostazioni":
        return <DesktopImpostazioni />;
      default:
        return <DesktopDashboard onNavigate={handleNavigate} onAddExpense={() => setIsPanelOpen(true)} />;
    }
  };

  return (
    <>
      <DesktopLayout
        activeSection={activeSection}
        onNavigate={s => setActiveSection(s)}
        onSearch={setSearchQuery}
      >
        {renderContent()}
      </DesktopLayout>

      <AddExpensePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSaveExpense}
      />
    </>
  );
}
