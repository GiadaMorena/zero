"use client";

import React from "react";
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
      {/* Main Responsive iPhone Frame */}
      <main className="relative w-full max-w-[390px] h-[100dvh] max-h-[850px] overflow-hidden bg-[#F7F7F5] flex flex-col justify-between px-6 sm:px-7">
        
        {/* ── 1. BACKGROUND YELLOW GRAPHIC PATH (#FDC909) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox="0 0 390 844"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top arch coming from top edge / notch */}
          <path
            d="M 160 -10 C 230 10, 360 30, 380 120 C 400 200, 350 280, 270 345 L 140 450 C 40 530, 20 660, 45 740 C 70 810, 160 845, 240 840 C 330 835, 385 770, 385 680"
            stroke="#FDC909"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Under-logo connection line: starts under O, steps right & up, curves into large upper loop */}
          <path
            d="M 165 142 L 195 142 L 195 125 C 195 60, 270 30, 340 30 C 400 30, 430 85, 415 160 C 400 240, 310 320, 230 380"
            stroke="#FDC909"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom subtle secondary curve behind buttons */}
          <path
            d="M 25 610 C 20 680, 50 760, 110 800"
            stroke="#FDC909"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        {/* ── 2. TOP SECTION: LOGO & PAYOFF ── */}
        <div
          className="relative z-10 flex flex-col items-start"
          style={{ paddingTop: "max(1.75rem, env(safe-area-inset-top, 24px))" }}
        >
          {/* ZERO Logo */}
          <div className="flex items-center gap-1.5 h-9">
            {/* Z */}
            <span className="text-[34px] font-black text-[#0B0B0B] tracking-tighter leading-none font-sans">
              Z
            </span>

            {/* E (3 clean parallel horizontal lines) */}
            <div className="flex flex-col justify-between h-[23px] w-[17px] py-[2px] ml-0.5">
              <div className="h-[3.2px] bg-[#0B0B0B] rounded-xs w-full" />
              <div className="h-[3.2px] bg-[#0B0B0B] rounded-xs w-[80%]" />
              <div className="h-[3.2px] bg-[#0B0B0B] rounded-xs w-full" />
            </div>

            {/* R */}
            <span className="text-[34px] font-black text-[#0B0B0B] tracking-tighter leading-none ml-0.5 font-sans">
              R
            </span>

            {/* O (Yellow ring with dual horizontal split slits) */}
            <div className="relative h-[27px] w-[27px] rounded-full border-[3.8px] border-[#FDC909] flex items-center justify-center ml-0.5">
              <div className="absolute inset-x-[-4px] h-[3px] bg-[#F7F7F5]" />
            </div>
          </div>

          {/* Payoff */}
          <div className="mt-2 text-left">
            <h2 className="text-[12px] sm:text-[13px] font-normal tracking-[0.26em] text-[#0B0B0B] leading-[1.38] uppercase font-sans">
              ZERO ANSIA<br />
              DA FINE MESE.
            </h2>
          </div>
        </div>

        {/* ── 3. CENTER: CARD STACK (TILTED -19°, SCALED DOWN & PROPORTIONED) ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center -mt-2 mb-2">
          <div className="relative w-[252px] sm:w-[264px] aspect-[1.586/1]">
            
            {/* Layer 1: Bottom White Card */}
            <div
              className="absolute inset-0 rounded-[18px] bg-white border border-[#E5E5E5] shadow-[0_16px_35px_rgba(0,0,0,0.08)]"
              style={{
                transform: "rotate(-19deg) translate(-14px, 24px)",
              }}
            />

            {/* Layer 2: Middle Yellow Card */}
            <div
              className="absolute inset-0 rounded-[18px] bg-[#FDC909] shadow-[0_12px_28px_rgba(253,201,9,0.32)]"
              style={{
                transform: "rotate(-19deg) translate(-7px, 12px)",
              }}
            />

            {/* Layer 3: Top Black ZERO Card */}
            <div
              className="absolute inset-0 rounded-[18px] bg-[#0C0C0D] border border-[#FDC909]/35 p-4 sm:p-4.5 flex flex-col justify-between text-white shadow-[0_20px_45px_rgba(0,0,0,0.42)] overflow-hidden"
              style={{
                transform: "rotate(-19deg)",
              }}
            >
              {/* Subtle dark stylized brand watermark on the right half */}
              <div className="absolute right-[-10px] bottom-[-15px] pointer-events-none opacity-25">
                <span className="text-[125px] font-black text-[#2A2A2E] leading-none tracking-tighter select-none font-sans">
                  Z
                </span>
              </div>

              {/* Card Top Row: ZERO Yellow Logo */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[13px] font-black tracking-wider text-[#FDC909] font-sans">
                  ZERO
                </span>
              </div>

              {/* Metallic Silver EMV Chip */}
              <div className="relative z-10 w-[34px] h-[25px] rounded-[5px] bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] border border-[#64748B]/40 shadow-inner flex flex-col justify-center items-center overflow-hidden my-auto">
                <div className="w-full h-[1px] bg-[#64748B]/40 my-[2.5px]" />
                <div className="w-[16px] h-[12px] rounded-[2.5px] border border-[#64748B]/40 flex items-center justify-center">
                  <div className="w-[1px] h-full bg-[#64748B]/40" />
                </div>
                <div className="w-full h-[1px] bg-[#64748B]/40 my-[2.5px]" />
              </div>

              {/* Card Bottom Row: Masked Number & Expiry */}
              <div className="relative z-10 flex items-end justify-between pt-0.5">
                <div className="flex items-center gap-1.5 font-mono text-[11.5px] tracking-[0.18em] font-medium text-white/95">
                  <span>••••</span>
                  <span>••••</span>
                  <span className="font-semibold">3377</span>
                </div>
                <span className="text-[10.5px] font-medium text-white/75 font-mono tracking-wider">
                  09/29
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. BOTTOM SECTION: DUAL CTA BUTTONS ── */}
        <div
          className="relative z-10 flex flex-col gap-2.5 pb-2"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 20px))" }}
        >
          {/* Primary CTA: Accedi (Solid Black #0B0B0B) */}
          <button
            onClick={handleLoginClick}
            className="w-full h-[50px] sm:h-[52px] rounded-full bg-[#0B0B0B] text-white flex items-center justify-between px-6 hover:bg-black active:scale-[0.98] transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-4" />
            <span className="font-semibold text-[15px] tracking-wide text-white">
              Accedi
            </span>
            <ArrowRight className="h-4 w-4 text-white stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Secondary CTA: Registrati (Outlined) */}
          <button
            onClick={handleRegisterClick}
            className="w-full h-[50px] sm:h-[52px] rounded-full bg-[#F7F7F5] border border-[#0B0B0B] text-[#0B0B0B] flex items-center justify-between px-6 hover:bg-[#0B0B0B]/5 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-4" />
            <span className="font-semibold text-[15px] tracking-wide text-[#0B0B0B]">
              Registrati
            </span>
            <ArrowRight className="h-4 w-4 text-[#0B0B0B] stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </main>
    </div>
  );
}
