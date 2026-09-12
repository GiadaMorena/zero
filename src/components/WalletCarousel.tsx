"use client";

import React, { useState, useRef } from "react";

export interface CardItem {
  id: string;
  name: string;
  bankName: string;
  number: string;
  expiry: string;
  type: "zero" | "revolut" | "mastercard";
  balance: number;
}

const CARDS: CardItem[] = [
  {
    id: "card-revolut",
    name: "Giada Morena",
    bankName: "Revolut",
    number: "•••• 8842",
    expiry: "04/27",
    type: "revolut",
    balance: 450.0,
  },
  {
    id: "card-zero",
    name: "Giada Morena",
    bankName: "ZERO",
    number: "•••• •••• 3377",
    expiry: "09/29",
    type: "zero",
    balance: 1245.8,
  },
  {
    id: "card-mastercard",
    name: "Giada Morena",
    bankName: "Mastercard",
    number: "•••• 1290",
    expiry: "11/28",
    type: "mastercard",
    balance: 890.0,
  },
];

interface WalletCarouselProps {
  onCardSelect?: (card: CardItem) => void;
}

export function WalletCarousel({ onCardSelect }: WalletCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(1); // Default center card (ZERO)
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const cardWidth = containerRef.current.clientWidth * 0.72;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < CARDS.length) {
      setActiveIndex(newIndex);
      onCardSelect?.(CARDS[newIndex]);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth * 0.72;
    containerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
    onCardSelect?.(CARDS[index]);
  };

  return (
    <div className="w-full flex flex-col items-center select-none overflow-hidden">
      {/* Cards Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 py-3 items-center justify-start"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {/* Card 1: Revolut (White) */}
        <div
          onClick={() => scrollToIndex(0)}
          className={`snap-center shrink-0 w-[72vw] max-w-[270px] h-[165px] rounded-[22px] p-4.5 relative overflow-hidden transition-all duration-300 transform cursor-pointer border border-[#E2E2DC] bg-[#F4F4F0] text-[#121212] flex flex-col justify-between shadow-md ${
            activeIndex === 0 ? "scale-105 shadow-xl z-20" : "scale-95 opacity-85 z-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm tracking-tight text-[#121212]">
              Revolut
            </span>
          </div>

          <div className="w-8 h-6 rounded-md bg-gradient-to-br from-[#E2D58B] to-[#B3A252] p-0.5 border border-black/10 shadow-xs my-auto" />

          <div className="flex items-end justify-between">
            <span className="font-mono text-xs text-[#555] font-semibold tracking-wider">
              •••• 8842
            </span>
          </div>
        </div>

        {/* Card 2: ZERO (Black with Gold Curves - Center Hero) */}
        <div
          onClick={() => scrollToIndex(1)}
          className={`snap-center shrink-0 w-[78vw] max-w-[300px] h-[178px] rounded-[24px] p-5 relative overflow-hidden transition-all duration-300 transform cursor-pointer bg-[#121212] text-white flex flex-col justify-between shadow-2xl shadow-black/40 border border-[#333333] ${
            activeIndex === 1 ? "scale-105 shadow-2xl z-20" : "scale-95 opacity-85 z-0"
          }`}
        >
          {/* Subtle golden ambient waves background lines matching reference image */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            viewBox="0 0 300 178"
            fill="none"
          >
            <path
              d="M-50 120 C80 60, 180 180, 350 40"
              stroke="url(#goldCurve1)"
              strokeWidth="1.5"
            />
            <path
              d="M-30 160 C100 100, 200 200, 360 80"
              stroke="url(#goldCurve2)"
              strokeWidth="1"
            />
            <defs>
              <linearGradient id="goldCurve1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F5E050" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#B39E20" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="goldCurve2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F5E050" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Card Top: ZERO branding + VISA */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="font-extrabold text-base tracking-wider text-white">
              ZERO
            </span>
            <span className="italic font-black text-amber-300 text-base tracking-tighter">
              VISA
            </span>
          </div>

          {/* Chip */}
          <div className="relative z-10 w-9 h-7 rounded-md bg-gradient-to-br from-[#E6D785] to-[#99883B] p-0.5 border border-white/20 shadow-sm my-auto" />

          {/* Card Bottom: Number + Expiry */}
          <div className="relative z-10 flex items-end justify-between font-mono">
            <span className="text-sm tracking-widest text-white/90 font-medium">
              •••• •••• 3377
            </span>
            <span className="text-[11px] text-white/60 font-sans font-medium">
              09/29
            </span>
          </div>
        </div>

        {/* Card 3: Mastercard (Dark Grey) */}
        <div
          onClick={() => scrollToIndex(2)}
          className={`snap-center shrink-0 w-[72vw] max-w-[270px] h-[165px] rounded-[22px] p-4.5 relative overflow-hidden transition-all duration-300 transform cursor-pointer border border-[#3A3A3C] bg-[#222224] text-white flex flex-col justify-between shadow-md ${
            activeIndex === 2 ? "scale-105 shadow-xl z-20" : "scale-95 opacity-85 z-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white/40 tracking-wider">
              DEBIT
            </span>
            {/* Mastercard 2 overlapping circles logo */}
            <div className="flex items-center -space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#EB001B]/80" />
              <div className="w-5 h-5 rounded-full bg-[#F79E1B]/80" />
            </div>
          </div>

          <div className="w-8 h-6 rounded-md bg-[#333336] p-0.5 border border-white/10 shadow-xs my-auto" />

          <div className="flex items-end justify-end font-mono text-xs text-white/70">
            •••• 1290
          </div>
        </div>
      </div>

      {/* 4 Pagination Dots */}
      <div className="flex items-center gap-1.5 mt-1">
        <button
          onClick={() => scrollToIndex(0)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            activeIndex === 0 ? "w-4 bg-[#121212]" : "w-1.5 bg-[#D4D4CE]"
          }`}
        />
        <button
          onClick={() => scrollToIndex(1)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            activeIndex === 1 ? "w-4 bg-[#121212]" : "w-1.5 bg-[#D4D4CE]"
          }`}
        />
        <button
          onClick={() => scrollToIndex(2)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            activeIndex === 2 ? "w-4 bg-[#121212]" : "w-1.5 bg-[#D4D4CE]"
          }`}
        />
        <button
          className="h-1.5 w-1.5 rounded-full bg-[#D4D4CE]"
        />
      </div>
    </div>
  );
}
