"use client";

import React, { useState, useRef } from "react";

export interface CardItem {
  id: string;
  name: string;
  bankName: string;
  number: string;
  expiry: string;
  colorScheme: "zero-black" | "silver-dark" | "gold-accent";
  balance: number;
}

const CARDS: CardItem[] = [
  {
    id: "card-1",
    name: "Giada Morena",
    bankName: "ZERO Black",
    number: "•••• •••• •••• 4829",
    expiry: "12/28",
    colorScheme: "zero-black",
    balance: 1245.8,
  },
  {
    id: "card-2",
    name: "Giada Morena",
    bankName: "ZERO Platinum",
    number: "•••• •••• •••• 8102",
    expiry: "09/27",
    colorScheme: "silver-dark",
    balance: 3410.0,
  },
  {
    id: "card-3",
    name: "Giada Morena",
    bankName: "ZERO Saver",
    number: "•••• •••• •••• 1194",
    expiry: "03/29",
    colorScheme: "gold-accent",
    balance: 890.5,
  },
];

interface WalletCarouselProps {
  onCardSelect?: (card: CardItem) => void;
}

export function WalletCarousel({ onCardSelect }: WalletCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.clientWidth * 0.82;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < CARDS.length) {
      setActiveIndex(newIndex);
      onCardSelect?.(CARDS[newIndex]);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth * 0.82;
    containerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
    onCardSelect?.(CARDS[index]);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Scrollable Cards Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar px-5 py-2 select-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {CARDS.map((card, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={card.id}
              onClick={() => scrollToIndex(idx)}
              className={`snap-center shrink-0 w-[84vw] max-w-[340px] h-[190px] rounded-[24px] p-5 relative overflow-hidden transition-all duration-300 transform cursor-pointer ${
                isActive
                  ? "scale-100 shadow-xl shadow-black/20 z-10"
                  : "scale-95 opacity-80 z-0"
              }`}
              style={{
                background:
                  card.colorScheme === "zero-black"
                    ? "linear-gradient(135deg, #121212 0%, #1C1C1E 100%)"
                    : card.colorScheme === "silver-dark"
                    ? "linear-gradient(135deg, #1E2022 0%, #2A2D32 100%)"
                    : "linear-gradient(135deg, #242116 0%, #17150E 100%)",
                border:
                  card.colorScheme === "zero-black"
                    ? "1px solid rgba(245, 224, 80, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {/* Yellow glow effect on main card */}
              {card.colorScheme === "zero-black" && (
                <>
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#F5E050]/15 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#F5E050]/10 blur-xl pointer-events-none" />
                </>
              )}

              {/* Card Header: Brand & Bank Name */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-[#F5E050] flex items-center justify-center shadow-sm">
                    <span className="font-black text-[#121212] text-xs">Z</span>
                  </div>
                  <span className="font-bold text-white tracking-wider text-sm">
                    {card.bankName}
                  </span>
                </div>
                {/* Chip Icon */}
                <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#E2D58B] to-[#998944] p-0.5 flex flex-col justify-between border border-white/20 opacity-90 shadow-sm">
                  <div className="w-full h-[1px] bg-[#5C4F1B]" />
                  <div className="w-full h-[1px] bg-[#5C4F1B]" />
                  <div className="w-full h-[1px] bg-[#5C4F1B]" />
                </div>
              </div>

              {/* Card Number */}
              <div className="relative z-10 mt-6 font-mono text-base tracking-widest text-white/90 font-medium">
                {card.number}
              </div>

              {/* Card Footer: Expiry, Holder Name, Visa Logo */}
              <div className="relative z-10 mt-5 flex items-end justify-between">
                <div>
                  <div className="text-[9px] text-[#A3A39E] uppercase tracking-wider font-semibold">
                    Scadenza
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {card.expiry}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-[#A3A39E] uppercase tracking-wider font-semibold">
                    Intestatario
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {card.name}
                  </div>
                </div>

                {/* VISA Logo */}
                <div className="italic font-black text-white text-base tracking-tighter pr-1">
                  VISA
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-6 bg-[#F5E050]"
                : "w-1.5 bg-[#D4D4CE] hover:bg-[#A3A39E]"
            }`}
            aria-label={`Vai alla carta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
