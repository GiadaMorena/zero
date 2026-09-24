"use client";

import React, { useRef } from "react";
import { Plus, CreditCard } from "lucide-react";
import { useApp, CardItem } from "@/context/AppContext";

export type { CardItem };

interface WalletCarouselProps {
  onCardSelect?: (card: CardItem, index: number) => void;
  onAddCardClick?: () => void;
}

export function WalletCarousel({ onCardSelect, onAddCardClick }: WalletCarouselProps) {
  const { cards, activeCardIndex, setActiveCardIndex } = useApp();
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || cards.length <= 1) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        rotateCard(1);
      } else {
        rotateCard(-1);
      }
    }
    touchStartX.current = null;
  };

  const rotateCard = (direction: number) => {
    if (cards.length === 0) return;
    let nextIndex = activeCardIndex + direction;
    if (nextIndex < 0) nextIndex = cards.length - 1;
    if (nextIndex >= cards.length) nextIndex = 0;
    setActiveCardIndex(nextIndex);
    if (cards[nextIndex]) {
      onCardSelect?.(cards[nextIndex], nextIndex);
    }
  };

  const selectCardIndex = (index: number) => {
    setActiveCardIndex(index);
    if (cards[index]) {
      onCardSelect?.(cards[index], index);
    }
  };

  // ── EMPTY STATE (No cards) ──
  if (cards.length === 0) {
    return (
      <div className="w-full flex flex-col items-center select-none py-2 px-4">
        <div
          onClick={onAddCardClick}
          className="w-full max-w-[320px] h-[168px] rounded-[24px] bg-[#0B0B0B] border border-[#FDC909]/40 text-[#F7F7F5] p-5 shadow-xl flex flex-col justify-between items-center text-center cursor-pointer hover:border-[#FDC909] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FDC909]/10 border border-[#FDC909]/30 flex items-center justify-center text-[#FDC909] group-hover:scale-110 transition-transform">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#F7F7F5]">Nessuna carta attiva</p>
            <p className="text-[11px] text-[#A7A7A7] mt-1">
              Aggiungi la tua prima carta per visualizzarla qui
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FDC909]">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Collega una carta</span>
          </div>
        </div>
      </div>
    );
  }

  // ── SINGLE CARD (Only 1 card) ──
  if (cards.length === 1) {
    const card = cards[0];
    const isZero = card.bankName.toLowerCase().includes("zero") || card.type === "zero";
    return (
      <div className="w-full flex flex-col items-center select-none py-1">
        <div
          className="w-[275px] h-[168px] rounded-[24px] p-5 shadow-2xl flex flex-col justify-between overflow-hidden relative"
          style={{
            background: "#0B0B0B",
            border: isZero ? "1px solid #FDC909" : "1px solid #A7A7A7/40",
            color: "#F7F7F5",
          }}
        >
          {isZero && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              viewBox="0 0 275 168"
              fill="none"
            >
              <path d="M-30 110 C70 50, 160 170, 320 30" stroke="#FDC909" strokeWidth="1.5" />
              <path d="M-10 150 C90 90, 180 190, 330 70" stroke="#FDC909" strokeWidth="1" />
            </svg>
          )}

          <div className="relative z-10 flex items-center justify-between">
            <span className="font-extrabold text-base tracking-wider">{card.bankName}</span>
            <span className="italic font-black text-[#FDC909] text-base tracking-tighter">
              {card.type === "revolut" ? "Revolut" : "ZERO"}
            </span>
          </div>

          <div className="relative z-10 w-9 h-6.5 rounded-md bg-[#FDC909] p-0.5 border border-black/10 shadow-xs my-auto" />

          <div className="relative z-10 flex items-end justify-between font-mono">
            <span className="text-xs tracking-widest font-medium opacity-90">{card.number}</span>
            <span className="text-[10px] font-sans font-medium opacity-70">{card.expiry}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── MULTIPLE CARDS (2 or more) ──
  return (
    <div className="w-full flex flex-col items-center select-none overflow-hidden py-1">
      {/* 3D Layered Cards Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[185px] flex items-center justify-center cursor-pointer"
      >
        {cards.map((card, idx) => {
          let pos: "left" | "center" | "right" = "center";
          if (idx === activeCardIndex) {
            pos = "center";
          } else if (idx === (activeCardIndex - 1 + cards.length) % cards.length) {
            pos = "left";
          } else {
            pos = "right";
          }

          const isZero = card.bankName.toLowerCase().includes("zero") || card.type === "zero";

          if (pos === "center") {
            return (
              <div
                key={card.id}
                onClick={() => selectCardIndex(idx)}
                className="absolute left-1/2 top-1 -translate-x-1/2 w-[275px] h-[168px] rounded-[24px] p-5 z-20 transition-all duration-400 ease-out shadow-2xl shadow-black/40 flex flex-col justify-between overflow-hidden"
                style={{
                  background: card.type === "revolut" ? "#F7F7F5" : "#0B0B0B",
                  border: isZero
                    ? "1px solid #FDC909"
                    : card.type === "revolut"
                    ? "1px solid #A7A7A7"
                    : "1px solid #A7A7A7/40",
                  color: card.type === "revolut" ? "#0B0B0B" : "#F7F7F5",
                }}
              >
                {isZero && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                    viewBox="0 0 275 168"
                    fill="none"
                  >
                    <path
                      d="M-30 110 C70 50, 160 170, 320 30"
                      stroke="#FDC909"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M-10 150 C90 90, 180 190, 330 70"
                      stroke="#FDC909"
                      strokeWidth="1"
                    />
                  </svg>
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-extrabold text-base tracking-wider">
                    {card.bankName}
                  </span>
                  {isZero && (
                    <span className="italic font-black text-[#FDC909] text-base tracking-tighter">
                      VISA
                    </span>
                  )}
                </div>

                <div className="relative z-10 w-9 h-6.5 rounded-md bg-[#FDC909] p-0.5 border border-black/10 shadow-xs my-auto" />

                <div className="relative z-10 flex items-end justify-between font-mono">
                  <span className="text-xs tracking-widest font-medium opacity-90">
                    {card.number}
                  </span>
                  <span className="text-[10px] font-sans font-medium opacity-70">
                    {card.expiry}
                  </span>
                </div>
              </div>
            );
          }

          if (pos === "left") {
            return (
              <div
                key={card.id}
                onClick={() => selectCardIndex(idx)}
                className="absolute left-[calc(50%-185px)] top-3 w-[235px] h-[152px] rounded-[20px] p-4 z-10 transition-all duration-400 ease-out shadow-lg opacity-85 scale-95 flex flex-col justify-between overflow-hidden"
                style={{
                  background: card.type === "revolut" ? "#F7F7F5" : "#0B0B0B",
                  border: isZero ? "1px solid #FDC909" : "1px solid #A7A7A7",
                  color: card.type === "revolut" ? "#0B0B0B" : "#FFFFFF",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs tracking-tight">
                    {card.bankName}
                  </span>
                </div>

                <div className="w-7 h-5 rounded-md bg-[#FDC909] p-0.5 border border-black/10 shadow-xs my-auto" />

                <div className="font-mono text-[10px] tracking-wider opacity-80">
                  {card.number}
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              onClick={() => selectCardIndex(idx)}
              className="absolute left-[calc(50%-50px)] top-3 w-[235px] h-[152px] rounded-[20px] p-4 z-10 transition-all duration-400 ease-out shadow-lg opacity-85 scale-95 flex flex-col justify-between overflow-hidden"
              style={{
                background: card.type === "revolut" ? "#F7F7F5" : "#0B0B0B",
                border: isZero ? "1px solid #FDC909" : "1px solid #A7A7A7",
                color: card.type === "revolut" ? "#0B0B0B" : "#FFFFFF",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs tracking-tight">
                  {card.bankName}
                </span>
              </div>

              <div className="w-7 h-5 rounded-md bg-[#A7A7A7] p-0.5 border border-white/10 shadow-xs my-auto" />

              <div className="font-mono text-[10px] tracking-wider opacity-80 text-right">
                {card.number}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => selectCardIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeCardIndex
                ? "w-4 bg-[#0B0B0B]"
                : "w-1.5 bg-[#A7A7A7] hover:bg-[#0B0B0B]"
            }`}
            aria-label={`Carta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
