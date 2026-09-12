import React from "react";
import { User, CreditCard, Download, Bell, Shield, HelpCircle, ChevronRight, Settings } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface ProfiloScreenProps {
  onNavigate: (tab: any) => void;
}

export function ProfiloScreen({ onNavigate }: ProfiloScreenProps) {
  const menuItems = [
    { title: "Profilo", icon: User },
    { title: "Metodi di pagamento", icon: CreditCard, action: () => onNavigate("carte") },
    { title: "Esporta dati", icon: Download },
    { title: "Notifiche", icon: Bell },
    { title: "Sicurezza", icon: Shield },
    { title: "Aiuto e feedback", icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 pb-20 bg-[#F8F8F5]">
      {/* Header with Logo & Tagline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#121212]">
              Zero
            </h1>
            <p className="text-[11px] text-[#73736E] font-medium">
              Più consapevolezza. Meno caos.
            </p>
          </div>
        </div>
        <button className="p-2.5 rounded-full bg-white border border-[#EBEBE5] text-[#121212] hover:bg-[#F8F8F5] shadow-sm transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Menu List */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-3 shadow-sm flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.action}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#F8F8F5] transition-colors text-left group"
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
      <div className="relative overflow-hidden rounded-[28px] bg-[#121212] text-white p-6 shadow-xl border border-[#262626]">
        {/* Yellow ambient glow gradient */}
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#F5E050]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-[220px]">
          <p className="text-sm font-bold text-white leading-relaxed">
            Le scelte di oggi costruiscono la libertà di domani.
          </p>
        </div>
      </div>
    </div>
  );
}
