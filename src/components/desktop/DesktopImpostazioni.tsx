"use client";

import React, { useState } from "react";
import { User, Bell, Palette, Shield, CreditCard, Download, Trash2, Check, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DesktopImpostazioni() {
  const { profile, updateProfile, exportCSV, resetAllData } = useApp();
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: nameInput, email: emailInput });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#121212] tracking-tight">
          Impostazioni & Preferenze ZERO
        </h2>
        <p className="text-xs text-[#73736E] font-medium mt-0.5">
          Personalizza le tue opzioni di sicurezza, esportazione e profilo
        </p>
      </div>

      {/* Profile Settings Card */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#EBEBE5]">
          <div className="h-9 w-9 rounded-2xl bg-[#FEF9C3] text-[#121212] flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#121212]">Profilo Utente</h3>
            <p className="text-[10px] text-[#73736E] font-medium">Modifica le tue informazioni di base</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#73736E] mb-1">Nome e Cognome</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#73736E] mb-1">Email Registrata</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Salvato con successo!
              </span>
            ) : (
              <span className="text-[10px] text-[#73736E] font-medium">I dati rimangono salvati in locale.</span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-black shadow-md hover:bg-black transition-all"
            >
              Salva Profilo
            </button>
          </div>
        </form>
      </div>

      {/* Preferenze App */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#EBEBE5]">
          <div className="h-9 w-9 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-[#121212] flex items-center justify-center font-bold">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#121212]">Preferenze & Valuta</h3>
            <p className="text-[10px] text-[#73736E] font-medium">Impostazioni generali del sistema</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <div>
              <p className="text-xs font-bold text-[#121212]">Notifiche di spesa</p>
              <p className="text-[10px] text-[#73736E] font-medium">Avvisi su scadenze abbonamenti e consigli</p>
            </div>
            <button
              onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profile.notificationsEnabled ? "bg-[#F5E050]" : "bg-[#EBEBE5]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <div>
              <p className="text-xs font-bold text-[#121212]">Valuta di Riferimento</p>
              <p className="text-[10px] text-[#73736E] font-medium">Impostata per tutti i calcoli</p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-white border border-[#EBEBE5] text-[#121212]">
              {profile.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Esportazione & Gestione Dati */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#EBEBE5]">
          <div className="h-9 w-9 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-[#121212] flex items-center justify-center font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#121212]">Esportazione & Backup Dati</h3>
            <p className="text-[10px] text-[#73736E] font-medium">Esporta report o ripristina lo stato iniziale</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportCSV}
            className="p-4 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] hover:border-[#121212] transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-[#121212]" />
              <div>
                <p className="text-xs font-extrabold text-[#121212]">Esporta CSV Movimenti</p>
                <p className="text-[10px] text-[#73736E] font-medium">Scarica file .csv contabile</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm("Vuoi ripristinare i dati di default dell'app ZERO?")) {
                resetAllData();
              }
            }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-rose-600" />
              <div>
                <p className="text-xs font-extrabold text-rose-700">Ripristina Dati Iniziali</p>
                <p className="text-[10px] text-rose-500 font-medium">Cancella modifiche locali</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
