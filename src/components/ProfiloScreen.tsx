"use client";

import React from "react";
import { User, CreditCard, Download, Bell, Shield, HelpCircle, ChevronRight, Settings, Sparkles, LogOut } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface ProfiloScreenProps {
  onNavigate: (tab: any) => void;
  onLogout?: () => void;
}

export function ProfiloScreen({ onNavigate, onLogout }: ProfiloScreenProps) {
  const menuItems = [
    { title: "Profilo personale", icon: User },
    { title: "Metodi di pagamento", icon: CreditCard, action: () => onNavigate("carte") },
    { title: "Rivedi benvenuto", icon: Sparkles, action: () => onNavigate("welcome") },
    { title: "Esporta dati", icon: Download },
    { title: "Notifiche", icon: Bell },
    { title: "Sicurezza", icon: Shield },
    { title: "Aiuto e supporto", icon: HelpCircle },
    { title: "Esci", icon: LogOut, action: onLogout },
  ];

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header with Logo & Tagline */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#121212]">
              Zero
            </h1>
            <p className="text-[11px] text-[#73736E] font-medium">
              Più consapevolezza. Meno caos.
            </p>
          </div>
        </div>
        <button className="h-9 w-9 rounded-full bg-white border border-[#EBEBE5] text-[#121212] flex items-center justify-center hover:bg-[#F8F8F5] shadow-xs transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Menu List */}
      <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-2.5 shadow-xs flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.action}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8F8F5] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-[#73736E] group-hover:text-[#121212] transition-colors" />
                <span className="text-xs font-bold text-[#121212]">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#A3A39E] group-hover:text-[#121212] transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Inspirational Bottom Banner Card */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#121212] text-white p-5 shadow-xl border border-[#262626]">
        {/* Yellow ambient glow gradient */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#F5E050]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-[220px]">
          <p className="text-xs font-bold text-white leading-relaxed">
            Le scelte di oggi costruiscono la libertà di domani.
          </p>
        </div>
      </div>
    </div>
  );
}
