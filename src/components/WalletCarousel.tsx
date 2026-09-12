"use client";

import React, { useState, useRef } from "react";

export interface CardItem {
  id: string;
  name: string;
  bankName: string;
  number: string;
  expiry: string;
  type: "revolut" | "zero" | "mastercard";
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
  const [activeIndex, setActiveIndex] = useState(1); // Default ZERO Center
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swipe Left -> Next Card
        rotateCard(1);
      } else {
        // Swipe Right -> Prev Card
        rotateCard(-1);
      }
    }
    touchStartX.current = null;
  };

  const rotateCard = (direction: number) => {
    let nextIndex = activeIndex + direction;
    if (nextIndex < 0) nextIndex = CARDS.length - 1;
    if (nextIndex >= CARDS.length) nextIndex = 0;
    setActiveIndex(nextIndex);
    onCardSelect?.(CARDS[nextIndex]);
  };

  const selectCardIndex = (index: number) => {
    setActiveIndex(index);
    onCardSelect?.(CARDS[index]);
  };

  return (
    <div className="w-full flex flex-col items-center select-none overflow-hidden py-1">
      {/* 3D Layered Cards Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[185px] flex items-center justify-center cursor-pointer"
      >
        {CARDS.map((card, idx) => {
          let pos: "left" | "center" | "right" = "center";
          if (idx === activeIndex) {
            pos = "center";
          } else if (idx === (activeIndex - 1 + CARDS.length) % CARDS.length) {
            pos = "left";
          } else {
            pos = "right";
          }

          if (pos === "center") {
            return (
              /* Center Active Card (ZERO / Selected Card) */
              <div
                key={card.id}
                onClick={() => selectCardIndex(idx)}
                className="absolute left-1/2 top-1 -translate-x-1/2 w-[275px] h-[168px] rounded-[24px] p-5 z-20 transition-all duration-400 ease-out shadow-2xl shadow-black/40 flex flex-col justify-between overflow-hidden"
                style={{
                  background:
                    card.type === "zero"
                      ? "#121212"
                      : card.type === "revolut"
                      ? "#F4F4F0"
                      : "#222224",
                  border:
                    card.type === "zero"
                      ? "1px solid #333333"
                      : card.type === "revolut"
                      ? "1px solid #E2E2DC"
                      : "1px solid #3A3A3C",
                  color: card.type === "revolut" ? "#121212" : "#FFFFFF",
                }}
              >
                {/* Gold Curves for ZERO Card */}
                {card.type === "zero" && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                    viewBox="0 0 275 168"
                    fill="none"
                  >
                    <path
                      d="M-30 110 C70 50, 160 170, 320 30"
                      stroke="url(#goldCurve1)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M-10 150 C90 90, 180 190, 330 70"
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
                )}

                {/* Card Top: Brand + VISA / Mastercard */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-extrabold text-base tracking-wider">
                    {card.bankName}
                  </span>
                  {card.type === "zero" ? (
                    <span className="italic font-black text-amber-300 text-base tracking-tighter">
                      VISA
                    </span>
                  ) : card.type === "mastercard" ? (
                    <div className="flex items-center -space-x-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#EB001B]/80" />
                      <div className="w-4 h-4 rounded-full bg-[#F79E1B]/80" />
                    </div>
                  ) : null}
                </div>

                {/* Chip */}
                <div className="relative z-10 w-9 h-6.5 rounded-md bg-gradient-to-br from-[#E6D785] to-[#99883B] p-0.5 border border-black/10 shadow-xs my-auto" />

                {/* Card Bottom: Number + Expiry */}
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
              /* Left Side Card (Peeking behind center) */
              <div
                key={card.id}
                onClick={() => selectCardIndex(idx)}
                className="absolute left-[calc(50%-185px)] top-3 w-[235px] h-[152px] rounded-[20px] p-4 z-10 transition-all duration-400 ease-out shadow-lg opacity-85 scale-95 flex flex-col justify-between overflow-hidden"
                style={{
                  background:
                    card.type === "zero"
                      ? "#121212"
                      : card.type === "revolut"
                      ? "#F4F4F0"
                      : "#222224",
                  border:
                    card.type === "zero"
                      ? "1px solid #333333"
                      : card.type === "revolut"
                      ? "1px solid #E2E2DC"
                      : "1px solid #3A3A3C",
                  color: card.type === "revolut" ? "#121212" : "#FFFFFF",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs tracking-tight">
                    {card.bankName}
                  </span>
                </div>

                <div className="w-7 h-5 rounded-md bg-gradient-to-br from-[#E2D58B] to-[#B3A252] p-0.5 border border-black/10 shadow-xs my-auto" />

                <div className="font-mono text-[10px] tracking-wider opacity-80">
                  {card.number}
                </div>
              </div>
            );
          }

          /* Right Side Card (Peeking behind center) */
          return (
            <div
              key={card.id}
              onClick={() => selectCardIndex(idx)}
              className="absolute left-[calc(50%-50px)] top-3 w-[235px] h-[152px] rounded-[20px] p-4 z-10 transition-all duration-400 ease-out shadow-lg opacity-85 scale-95 flex flex-col justify-between overflow-hidden"
              style={{
                background:
                  card.type === "zero"
                    ? "#121212"
                    : card.type === "revolut"
                    ? "#F4F4F0"
                    : "#222224",
                border:
                  card.type === "zero"
                    ? "1px solid #333333"
                    : card.type === "revolut"
                    ? "1px solid #E2E2DC"
                    : "1px solid #3A3A3C",
                color: card.type === "revolut" ? "#121212" : "#FFFFFF",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs tracking-tight">
                  {card.bankName}
                </span>
                {card.type === "mastercard" && (
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]/80" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/80" />
                  </div>
                )}
              </div>

              <div className="w-7 h-5 rounded-md bg-[#333336] p-0.5 border border-white/10 shadow-xs my-auto" />

              <div className="font-mono text-[10px] tracking-wider opacity-80 text-right">
                {card.number}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Pagination Dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => selectCardIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-4 bg-[#121212]"
                : "w-1.5 bg-[#D4D4CE] hover:bg-[#A3A39E]"
            }`}
            aria-label={`Carta ${i + 1}`}
          />
        ))}
        <button className="h-1.5 w-1.5 rounded-full bg-[#D4D4CE]" />
      </div>
    </div>
  );
}
