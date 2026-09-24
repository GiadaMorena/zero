"use client";

import React, { useState } from "react";
import {
  User,
  CreditCard,
  Download,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ProfiloScreenProps {
  onNavigate: (tab: string) => void;
  onLogout?: () => void;
}

type ActiveSection = null | "profilo" | "notifiche" | "sicurezza" | "aiuto";

export function ProfiloScreen({ onNavigate, onLogout }: ProfiloScreenProps) {
  const { profile, updateProfile, exportCSV } = useApp();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  // Profilo personale edit state
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    updateProfile({ name: editName.trim(), email: editEmail.trim() });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const openSection = (section: ActiveSection) => {
    if (section === "profilo") {
      setEditName(profile.name);
      setEditEmail(profile.email);
    }
    setActiveSection(section);
  };

  const menuItems = [
    {
      title: "Profilo personale",
      icon: User,
      action: () => openSection("profilo"),
    },
    {
      title: "Metodi di pagamento",
      icon: CreditCard,
      action: () => onNavigate("carte"),
    },
    {
      title: "Esporta dati",
      icon: Download,
      action: () => exportCSV(),
    },
    {
      title: "Notifiche",
      icon: Bell,
      action: () => openSection("notifiche"),
      badge: profile.notificationsEnabled ? "Attive" : "Disattivate",
    },
    {
      title: "Sicurezza",
      icon: Shield,
      action: () => openSection("sicurezza"),
    },
    {
      title: "Aiuto e supporto",
      icon: HelpCircle,
      action: () => openSection("aiuto"),
    },
    {
      title: "Disconnetti",
      icon: LogOut,
      action: onLogout,
      danger: true,
    },
  ];

  // ── Sub-section: Profilo personale ──────────────────────────────
  if (activeSection === "profilo") {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
        className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 pt-1 px-1">
          <button
            onClick={() => setActiveSection(null)}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#0B0B0B]">Profilo personale</h1>
        </div>

        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              Nome
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "52px" }}
              placeholder="Il tuo nome"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
              Email
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-4 rounded-2xl bg-[#F7F7F5] border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
              style={{ height: "52px" }}
              placeholder="la.tua@email.it"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full h-12 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all cursor-pointer mt-1"
          >
            {savedFeedback ? (
              <>
                <Check className="h-4 w-4 text-[#FDC909]" />
                Salvato
              </>
            ) : (
              "Salva modifiche"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Sub-section: Notifiche ───────────────────────────────────────
  if (activeSection === "notifiche") {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
        className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 pt-1 px-1">
          <button
            onClick={() => setActiveSection(null)}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#0B0B0B]">Notifiche</h1>
        </div>

        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-2.5 flex flex-col gap-1">
          <div className="flex items-center justify-between p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-[#A7A7A7]" />
              <span className="text-xs font-bold text-[#0B0B0B]">Notifiche push</span>
            </div>
            {/* Toggle */}
            <button
              onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                profile.notificationsEnabled ? "bg-[#FDC909]" : "bg-[#A7A7A7]/40"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  profile.notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#A7A7A7] font-medium px-1 leading-relaxed">
          Attiva le notifiche per ricevere aggiornamenti su movimenti, scadenze abbonamenti e obiettivi raggiunti.
        </p>
      </div>
    );
  }

  // ── Sub-section: Sicurezza ───────────────────────────────────────
  if (activeSection === "sicurezza") {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
        className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 pt-1 px-1">
          <button
            onClick={() => setActiveSection(null)}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#0B0B0B]">Sicurezza</h1>
        </div>

        <div className="rounded-[24px] bg-[#0B0B0B] p-5 text-[#F7F7F5]">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-[#FDC909]" />
            <span className="text-sm font-black">PIN a 6 cifre attivo</span>
          </div>
          <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
            Il tuo account è protetto da un PIN a 6 cifre. L'app si blocca automaticamente quando vai in background. Per cambiare il PIN, effettua il logout e registrati di nuovo.
          </p>
        </div>
      </div>
    );
  }

  // ── Sub-section: Aiuto e supporto ───────────────────────────────
  if (activeSection === "aiuto") {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
        className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 pt-1 px-1">
          <button
            onClick={() => setActiveSection(null)}
            className="h-9 w-9 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-black tracking-tight text-[#0B0B0B]">Aiuto e supporto</h1>
        </div>

        <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-[#0B0B0B]">Hai bisogno di aiuto?</p>
          <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
            Per assistenza tecnica o domande sull'app, scrivici a:
          </p>
          <div className="px-4 py-3 bg-[#F7F7F5] rounded-2xl border border-[#A7A7A7]/20">
            <p className="text-sm font-black text-[#0B0B0B]">supporto@zero.app</p>
          </div>
          <p className="text-[11px] text-[#A7A7A7] leading-relaxed mt-1">
            Risponderemo entro 24 ore nei giorni lavorativi.
          </p>
        </div>
      </div>
    );
  }

  // ── Main menu ────────────────────────────────────────────────────
  const avatarText = profile.avatarText || profile.name?.charAt(0)?.toUpperCase() || "Z";
  const displayName = profile.name || "Utente ZERO";
  const displayEmail = profile.email || "";

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F7F7F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* User header */}
      <div className="flex items-center gap-4 pt-1 px-1">
        <div className="h-14 w-14 rounded-full bg-[#0B0B0B] flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-[#FDC909]">{avatarText}</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-[#0B0B0B]">{displayName}</h1>
          {displayEmail ? (
            <p className="text-[11px] text-[#A7A7A7] font-medium">{displayEmail}</p>
          ) : null}
        </div>
      </div>

      {/* Menu List */}
      <div className="rounded-[24px] bg-white border border-[#A7A7A7]/20 p-2.5 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.action}
              className={`flex items-center justify-between p-3 rounded-2xl transition-colors text-left group cursor-pointer ${
                item.danger
                  ? "hover:bg-red-50"
                  : "hover:bg-[#F7F7F5]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    item.danger
                      ? "text-red-400 group-hover:text-red-500"
                      : "text-[#A7A7A7] group-hover:text-[#0B0B0B]"
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    item.danger ? "text-red-500" : "text-[#0B0B0B]"
                  }`}
                >
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-[10px] font-bold text-[#A7A7A7] bg-[#F7F7F5] px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {!item.danger && (
                  <ChevronRight className="h-4 w-4 text-[#A7A7A7] group-hover:text-[#0B0B0B] transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Inspirational Bottom Banner Card */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0B0B0B] text-white p-5">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#FDC909]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-[220px]">
          <p className="text-xs font-bold text-white leading-relaxed">
            Le scelte di oggi costruiscono la libertà di domani.
          </p>
        </div>
      </div>
    </div>
  );
}
