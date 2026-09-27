"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onStart?: () => void; // fallback for backwards compatibility
}

export function WelcomeScreen({ onLogin, onRegister, onStart }: WelcomeScreenProps) {
  const handleLoginClick = () => {
    if (onLogin) onLogin();
    else if (onStart) onStart();
  };

  const handleRegisterClick = () => {
    if (onRegister) onRegister();
    else if (onStart) onStart();
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F7F7F5] flex justify-center items-center overflow-hidden select-none z-50">
      {/* Responsive Container (max-w-md for mobile/desktop preview) */}
      <main className="relative w-full max-w-[430px] h-[100dvh] max-h-[932px] overflow-hidden bg-[#F7F7F5] flex flex-col justify-between px-7 py-6">
        
        {/* ── 1. BACKGROUND GIANT YELLOW VECTOR LINE GRAPHIC (#FDC909) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox="0 0 430 932"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top connection line from O down and curving to top-right loop */}
          <path
            d="M 190 262 L 225 262 L 225 240 C 225 100, 360 40, 410 50 C 470 65, 420 180, 330 250 L 100 460 C 20 540, 30 700, 110 780 C 180 850, 350 880, 420 760 C 460 690, 420 630, 400 630 C 370 630, 360 700, 390 730"
            stroke="#FDC909"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Secondary concentric subtle background loops */}
          <path
            d="M 330 50 C 240 70, 150 140, 150 250"
            stroke="#FDC909"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          <path
            d="M 30 650 C 20 730, 70 820, 160 860"
            stroke="#FDC909"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {/* ── 2. TOP SECTION: LOGO + PAYOFF ── */}
        <div
          className="relative z-10 pt-4 sm:pt-6 flex flex-col items-start animate-in fade-in duration-700"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 24px) + 0.5rem)" }}
        >
          {/* ZERO Logo (Custom Geometric SVG matching brand) */}
          <div className="flex items-center gap-1.5 h-10">
            {/* Z */}
            <span className="text-[38px] font-black text-[#0B0B0B] tracking-tighter leading-none">
              Z
            </span>

            {/* E (3 clean parallel horizontal lines) */}
            <div className="flex flex-col justify-between h-[27px] w-[19px] py-[2.5px] ml-0.5">
              <div className="h-[3.5px] bg-[#0B0B0B] rounded-xs w-full" />
              <div className="h-[3.5px] bg-[#0B0B0B] rounded-xs w-[82%]" />
              <div className="h-[3.5px] bg-[#0B0B0B] rounded-xs w-full" />
            </div>

            {/* R */}
            <span className="text-[38px] font-black text-[#0B0B0B] tracking-tighter leading-none ml-0.5">
              R
            </span>

            {/* O (Yellow ring with dual horizontal split slits) */}
            <div className="relative h-[30px] w-[30px] rounded-full border-[4px] border-[#FDC909] flex items-center justify-center ml-0.5">
              <div className="absolute inset-x-[-4px] h-[3px] bg-[#F7F7F5]" />
            </div>
          </div>

          {/* Payoff */}
          <div className="mt-4 text-left">
            <h2 className="text-[13px] sm:text-[14px] font-medium tracking-[0.22em] text-[#0B0B0B] leading-[1.35] uppercase font-sans">
              ZERO ANSIA<br />
              DA FINE MESE.
            </h2>
          </div>
        </div>

        {/* ── 3. CENTER: 3D ROTATED CARD STACK ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center my-2 sm:my-4">
          <div className="relative w-[285px] sm:w-[310px] aspect-[1.586/1] animate-in zoom-in-95 duration-700">
            
            {/* Layer 1: Bottom White Card */}
            <div
              className="absolute inset-0 rounded-[22px] bg-white border border-[#A7A7A7]/25 shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
              style={{
                transform: "rotate(-21deg) translate(6px, 16px)",
                transition: "transform 0.4s ease",
              }}
            />

            {/* Layer 2: Middle Yellow Card */}
            <div
              className="absolute inset-0 rounded-[22px] bg-[#FDC909] shadow-[0_14px_30px_rgba(253,201,9,0.3)]"
              style={{
                transform: "rotate(-18.5deg) translate(3px, 8px)",
                transition: "transform 0.4s ease",
              }}
            />

            {/* Layer 3: Top Black ZERO Card */}
            <div
              className="absolute inset-0 rounded-[22px] bg-[#0B0B0B] border border-[#FDC909]/45 p-5 flex flex-col justify-between text-white shadow-[0_24px_50px_rgba(0,0,0,0.45)] overflow-hidden"
              style={{
                transform: "rotate(-15.5deg)",
                transition: "transform 0.4s ease",
              }}
            >
              {/* Subtle tone-on-tone background stylized ZERO watermark on the card */}
              <div className="absolute right-[-15px] bottom-[-20px] pointer-events-none opacity-20">
                <span className="text-[140px] font-black text-[#FFFFFF] leading-none tracking-tighter select-none font-sans">
                  Z
                </span>
              </div>

              {/* Card Top Row: ZERO Yellow Logo */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[15px] font-black tracking-wider text-[#FDC909] font-sans">
                  ZERO
                </span>
              </div>

              {/* Metallic Silver EMV Chip */}
              <div className="relative z-10 w-[38px] h-[28px] rounded-[6px] bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] border border-[#64748B]/40 shadow-inner flex flex-col justify-center items-center overflow-hidden my-auto">
                <div className="w-full h-[1px] bg-[#64748B]/40 my-[3px]" />
                <div className="w-[18px] h-[14px] rounded-[3px] border border-[#64748B]/40 flex items-center justify-center">
                  <div className="w-[1px] h-full bg-[#64748B]/40" />
                </div>
                <div className="w-full h-[1px] bg-[#64748B]/40 my-[3px]" />
              </div>

              {/* Card Bottom Row: Masked Number & Expiry */}
              <div className="relative z-10 flex items-end justify-between pt-1">
                <div className="flex items-center gap-1.5 font-mono text-xs sm:text-[13px] tracking-[0.2em] font-medium text-white/90">
                  <span>••••</span>
                  <span>••••</span>
                  <span className="font-bold">3377</span>
                </div>
                <span className="text-[11px] font-semibold text-[#A7A7A7] font-mono tracking-wider">
                  09/29
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. BOTTOM SECTION: DUAL CTA BUTTONS ── */}
        <div
          className="relative z-10 flex flex-col gap-3 pt-2"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 0.5rem)" }}
        >
          {/* Primary CTA: Accedi (Solid Black #0B0B0B) */}
          <button
            onClick={handleLoginClick}
            className="w-full h-[54px] sm:h-[56px] rounded-full bg-[#0B0B0B] text-white flex items-center justify-between px-7 font-bold text-[15px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:bg-black active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-4" />
            <span className="font-extrabold tracking-wide text-white">
              Accedi
            </span>
            <ArrowRight className="h-4.5 w-4.5 text-white stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Secondary CTA: Registrati (Outlined) */}
          <button
            onClick={handleRegisterClick}
            className="w-full h-[54px] sm:h-[56px] rounded-full bg-transparent border border-[#0B0B0B] text-[#0B0B0B] flex items-center justify-between px-7 font-bold text-[15px] hover:bg-[#0B0B0B]/5 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-4" />
            <span className="font-extrabold tracking-wide text-[#0B0B0B]">
              Registrati
            </span>
            <ArrowRight className="h-4.5 w-4.5 text-[#0B0B0B] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </main>
    </div>
  );
}
