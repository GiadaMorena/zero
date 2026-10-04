"use client";

import React, { useRef } from "react";
import { Plus, CreditCard } from "lucide-react";
import { useApp, CardItem } from "@/context/AppContext";
import { BankCardDetails } from "./BankCardDetails";
import { getCardAppearance } from "@/lib/cardAppearance";

export type { CardItem };
interface WalletCarouselProps {
  onCardSelect?: (card: CardItem, index: number) => void;
  onAddCardClick?: () => void;
}

export function WalletCarousel({ onCardSelect, onAddCardClick }: WalletCarouselProps) {
  const { cards, activeCardIndex, setActiveCardIndex } = useApp();
  const touchStartX = useRef<number | null>(null);
  const selectCard = (index: number) => {
    setActiveCardIndex(index);
    onCardSelect?.(cards[index], index);
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null || cards.length <= 1) return;
    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) > 40) selectCard((activeCardIndex + (distance < 0 ? 1 : -1) + cards.length) % cards.length);
  };

  if (!cards.length) return (
    <div className="flex w-full justify-center px-4 py-2">
      <button onClick={onAddCardClick} className="flex h-[168px] w-full max-w-[320px] flex-col items-center justify-between rounded-[24px] border border-[#FDC909]/40 bg-[#0B0B0B] p-5 text-center text-white shadow-xl">
        <Plus className="h-6 w-6 text-[#FDC909]" />
        <div><p className="text-sm font-black">Nessuna carta attiva</p><p className="mt-1 text-[11px] text-[#A7A7A7]">Aggiungi la tua prima carta per visualizzarla qui</p></div>
        <span className="flex items-center gap-2 text-[11px] font-bold text-[#FDC909]"><CreditCard className="h-4 w-4" />Collega una carta</span>
      </button>
    </div>
  );

  return (
    <div className="flex w-full select-none flex-col items-center overflow-hidden py-1">
      <div className="relative flex h-[190px] w-full items-center justify-center" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
        {cards.map((card, index) => {
          const selected = index === activeCardIndex;
          const previous = index === (activeCardIndex - 1 + cards.length) % cards.length;
          // Show only the two adjacent cards; larger wallets never pile up on one side.
          const next = index === (activeCardIndex + 1) % cards.length;
          if (!selected && !previous && !next) return null;
          return (
            <button key={card.id} onClick={() => selectCard(index)} aria-label={`Seleziona carta ${card.bankName}, ${card.number}`} aria-pressed={selected}
              className={`absolute top-1 flex h-[176px] w-[280px] flex-col justify-between overflow-hidden rounded-[22px] p-5 text-left shadow-xl transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FDC909] ${selected ? "left-1/2 z-20 -translate-x-1/2" : previous ? "left-[calc(50%-205px)] z-10 scale-90 opacity-80" : "left-[calc(50%-75px)] z-10 scale-90 opacity-80"}`}
              style={getCardAppearance(card.bankName)}>
              <BankCardDetails bankName={card.bankName} number={card.number} expiry={card.expiry} holder={card.name} />
            </button>
          );
        })}
      </div>
      {cards.length > 1 && <div className="mt-2 flex items-center gap-1.5">{cards.map((card, index) => (
        <button key={card.id} onClick={() => selectCard(index)} aria-label={`Carta ${index + 1}`} aria-pressed={index === activeCardIndex} className={`h-1.5 rounded-full transition-all ${index === activeCardIndex ? "w-4 bg-[#0B0B0B]" : "w-1.5 bg-[#A7A7A7]"}`} />
      ))}</div>}
    </div>
  );
}
