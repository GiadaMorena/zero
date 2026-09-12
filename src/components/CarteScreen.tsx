import React, { useState } from "react";
import { Plus, Lock, Settings, Info, ChevronRight, ShoppingCart, Music, Utensils } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function CarteScreen() {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="flex flex-col gap-5 p-5 pb-20 bg-[#F8F8F5]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#121212]">
          Carte
        </h1>
        <button className="p-2.5 rounded-full bg-[#121212] text-white hover:bg-black shadow-md transition-transform">
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Credit Card Stack Carousel */}
      <div className="relative pt-4 pb-2">
        {/* Background Card Effect */}
        <div className="absolute top-0 left-4 right-4 h-44 rounded-[28px] bg-gradient-to-tr from-[#F5E050] to-[#EAB308] opacity-50 transform -translate-y-2 scale-95 shadow-md" />

        {/* Main Obsidian Zero VISA Card */}
        <div className="relative h-48 rounded-[28px] bg-[#121212] border border-[#262626] p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Card Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F5E050]/25 blur-2xl pointer-events-none" />

          {/* Top Row: Brand & VISA */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="font-extrabold text-lg tracking-tight">Zero</span>
            </div>
            <span className="font-black italic text-xl tracking-wider bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              VISA
            </span>
          </div>

          {/* Middle Chip / Wireless symbol */}
          <div className="flex items-center gap-3 z-10 my-auto">
            <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-[#FEF08A] to-[#EAB308] opacity-80" />
            <div className="text-xs text-[#A3A39E] font-mono tracking-widest">
              •••• 3377
            </div>
          </div>

          {/* Bottom Cardholder & Expiry */}
          <div className="flex items-center justify-between text-xs z-10">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#A3A39E]">Intestatario</p>
              <p className="font-bold tracking-wide">GIADA MORENA</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#A3A39E]">Scadenza</p>
              <p className="font-bold tracking-wide">09/29</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons (3 grid) */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
            isLocked
              ? "bg-[#FEF9C3] border-[#F5E050] text-[#854D0E]"
              : "bg-white border-[#EBEBE5] text-[#121212] hover:border-[#F5E050]"
          }`}
        >
          <Lock className="h-5 w-5 mb-1 stroke-[1.8]" />
          <span className="text-xs font-semibold">
            {isLocked ? "Sblocca" : "Blocca"}
          </span>
        </button>

        <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] text-[#121212] hover:border-[#F5E050] transition-all">
          <Settings className="h-5 w-5 mb-1 stroke-[1.8]" />
          <span className="text-xs font-semibold">Impostazioni</span>
        </button>

        <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#EBEBE5] text-[#121212] hover:border-[#F5E050] transition-all">
          <Info className="h-5 w-5 mb-1 stroke-[1.8]" />
          <span className="text-xs font-semibold">Dettagli</span>
        </button>
      </div>

      {/* Ultimi Movimenti */}
      <div className="rounded-[28px] bg-white border border-[#EBEBE5] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#121212]">Ultimi movimenti</h3>
          <button className="flex items-center gap-1 text-xs text-[#73736E] font-medium hover:text-[#121212]">
            <span>Vedi tutti</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Supermercato</p>
                <p className="text-[10px] text-[#73736E]">12 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#121212]">- € 42,30</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <Music className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Spotify</p>
                <p className="text-[10px] text-[#73736E]">10 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#121212]">- € 3,49</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Ristorante</p>
                <p className="text-[10px] text-[#73736E]">9 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#121212]">- € 28,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
