"use client";

import React, { useState } from "react";
import { DesktopLayout, DesktopSection } from "./DesktopLayout";
import { DesktopDashboard } from "./DesktopDashboard";
import { DesktopMovimenti } from "./DesktopMovimenti";
import { DesktopAnalisi } from "./DesktopAnalisi";
import { DesktopObiettivi } from "./DesktopObiettivi";
import { DesktopAbbonamenti } from "./DesktopAbbonamenti";
import { DesktopCarte } from "./DesktopCarte";
import { DesktopImpostazioni } from "./DesktopImpostazioni";
import { AddSpesaModal } from "../AddSpesaModal";
import { ReceiptScanModal } from "../ReceiptScanModal";

interface DesktopAppProps {
  onLogout?: () => void;
}

export function DesktopApp({ onLogout }: DesktopAppProps) {
  const [activeSection, setActiveSection] = useState<DesktopSection>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"expense" | "income">("expense");
  const [isScanOpen, setIsScanOpen] = useState(false);

  const handleOpenAdd = (type: "expense" | "income" = "expense") => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DesktopDashboard
            onNavigate={(s) => setActiveSection(s as DesktopSection)}
            onOpenAddExpense={() => handleOpenAdd("expense")}
            onOpenAddIncome={() => handleOpenAdd("income")}
          />
        );
      case "movimenti":
        return (
          <DesktopMovimenti
            onOpenAddExpense={() => handleOpenAdd("expense")}
            onOpenAddIncome={() => handleOpenAdd("income")}
            searchQuery={searchQuery}
          />
        );
      case "carte":
        return <DesktopCarte />;
      case "abbonamenti":
        return <DesktopAbbonamenti />;
      case "obiettivi":
        return <DesktopObiettivi />;
      case "analisi":
        return <DesktopAnalisi />;
      case "impostazioni":
      case "profilo":
        return <DesktopImpostazioni onLogout={onLogout} />;
      default:
        return (
          <DesktopDashboard
            onNavigate={(s) => setActiveSection(s as DesktopSection)}
            onOpenAddExpense={() => handleOpenAdd("expense")}
            onOpenAddIncome={() => handleOpenAdd("income")}
          />
        );
    }
  };

  return (
    <>
      <DesktopLayout
        activeSection={activeSection}
        onNavigate={(s) => setActiveSection(s)}
        onSearch={setSearchQuery}
        onOpenAddExpense={() => handleOpenAdd("expense")}
        onOpenAddIncome={() => handleOpenAdd("income")}
        onOpenScan={() => setIsScanOpen(true)}
      >
        {renderContent()}
      </DesktopLayout>

      {/* Add Expense / Income Modal */}
      <AddSpesaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType={addModalType}
      />

      {/* Receipt Scan Modal */}
      <ReceiptScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />
    </>
  );
}
