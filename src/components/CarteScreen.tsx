"use client";

import React, { useState } from "react";
import { Plus, Lock, Settings, Info, ChevronRight, ShoppingCart, Music, Utensils } from "lucide-react";
import { WalletCarousel, CardItem } from "./WalletCarousel";

export function CarteScreen() {
  const [isLocked, setIsLocked] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }}
      className="flex flex-col gap-4 px-4 pb-32 bg-[#F8F8F5] select-none min-h-screen max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <h1 className="text-2xl font-black tracking-tight text-[#121212]">
          Carte
        </h1>
        <button className="h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform">
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Interactive 3D Credit Card Stack Carousel */}
      <div className="-mx-4">
        <WalletCarousel onCardSelect={(card) => setSelectedCard(card)} />
      </div>

      {/* Card Action Buttons (3 grid) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex flex-col items-center justify-center p-3 rounded-[20px] border transition-all ${
            isLocked
              ? "bg-[#FEF9C3] border-[#F5E050] text-[#854D0E]"
              : "bg-white border-[#EBEBE5] text-[#121212] hover:border-[#121212]"
          }`}
        >
          <Lock className="h-4.5 w-4.5 mb-1 stroke-[2]" />
          <span className="text-[11px] font-bold">
            {isLocked ? "Sblocca" : "Blocca"}
          </span>
        </button>

        <button className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white border border-[#EBEBE5] text-[#121212] hover:border-[#121212] transition-all">
          <Settings className="h-4.5 w-4.5 mb-1 stroke-[2]" />
          <span className="text-[11px] font-bold">Impostazioni</span>
        </button>

        <button className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white border border-[#EBEBE5] text-[#121212] hover:border-[#121212] transition-all">
          <Info className="h-4.5 w-4.5 mb-1 stroke-[2]" />
          <span className="text-[11px] font-bold">Dettagli</span>
        </button>
      </div>

      {/* Ultimi Movimenti su Questa Carta */}
      <div className="rounded-[24px] bg-white border border-[#EBEBE5] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-[#121212]">
            Movimenti {selectedCard ? selectedCard.bankName : "ZERO"}
          </h3>
          <button className="flex items-center gap-0.5 text-xs text-[#73736E] font-semibold hover:text-[#121212]">
            <span>Vedi tutti</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Supermercato</p>
                <p className="text-[10px] text-[#73736E]">12 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#121212]">- 42,30 €</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <Music className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Spotify</p>
                <p className="text-[10px] text-[#73736E]">10 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#121212]">- 3,49 €</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] border border-[#EBEBE5]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white border border-[#EBEBE5] flex items-center justify-center text-[#121212]">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#121212]">Ristorante</p>
                <p className="text-[10px] text-[#73736E]">9 set 2026</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#121212]">- 28,00 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
