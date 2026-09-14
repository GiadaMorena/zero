"use client";

import React, { useState } from "react";
import { Eye, Calendar, Target, Plus, Settings } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F7F7F5] flex justify-center items-center overflow-hidden select-none z-50">
      
      {/* 430 x 932 Art-Directed Viewport Container */}
      <main className="relative w-full max-w-[430px] h-[100dvh] max-h-[932px] overflow-hidden bg-[#F7F7F5] flex-shrink-0">
        
        {/* Warm Ambient Yellow Radial Glow */}
        <div
          className="absolute top-[140px] right-[10px] w-[280px] h-[280px] rounded-full bg-[#FDC909]/20 blur-3xl pointer-events-none z-0"
        />

        {/* ── 1. LOGO SUPERIORE (ZERO. at top: 45px, left: 45px) ──────────────── */}
        <div className="absolute top-[45px] left-[45px] z-[20] text-[50px] font-light tracking-[-4px] text-[#0B0B0B] leading-none">
          ZERO<span className="text-[#FDC909] text-[22px] relative -left-[4px] -top-[1px]">.</span>
        </div>

        {/* ── 2. CARTA ZERO (315 x 198 px, left: 25px, top: 175px, -10deg) ────── */}
        <div
          className="absolute w-[315px] h-[198px] left-[25px] top-[175px] z-[10] rounded-[22px] border-2 border-[#FDC909] overflow-hidden shadow-[0_30px_45px_rgba(0,0,0,0.22),0_10px_20px_rgba(0,0,0,0.12)]"
          style={{
            background: "linear-gradient(135deg, #171717 0%, #080808 65%, #111 100%)",
            transform: "rotate(-10deg)",
          }}
        >
          {/* Watermark "0" */}
          <div className="absolute right-[10px] -top-[30px] text-[250px] leading-none font-bold text-white/[0.08] select-none pointer-events-none">
            0
          </div>

          {/* Top-left Brand */}
          <div className="absolute top-[22px] left-[25px] text-[#FDC909] text-[22px] font-normal z-[2] tracking-wider">
            ZERO
          </div>

          {/* Metallic Chip */}
          <div
            className="absolute left-[27px] bottom-[58px] w-[42px] h-[31px] rounded-[7px] z-[2] overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #ddd, #aaa)",
              boxShadow: "inset 0 0 0 1px #777",
            }}
          >
            <div className="absolute w-full h-[10px] top-[9px] left-0 border-t border-b border-[#777]" />
            <div className="absolute w-[10px] h-full top-0 left-[15px] border-l border-r border-[#777]" />
          </div>

          {/* Card Number */}
          <div className="absolute left-[28px] bottom-[23px] text-[#ddd] tracking-[4px] text-[13px] z-[2] font-mono">
            •••• •••• <strong className="text-white text-[17px] tracking-[2px] font-mono font-bold">3377</strong>
          </div>

          {/* Expiry */}
          <div className="absolute right-[25px] bottom-[23px] text-[#bbb] text-[13px] z-[2] font-mono">
            09/29
          </div>
        </div>

        {/* ── 3. SMARTPHONE (285 x 560 px, right: -35px, top: 285px, +9deg) ──── */}
        <div
          className="absolute w-[285px] h-[560px] -right-[35px] top-[285px] z-[5] rounded-[43px] bg-[#0a0a0a] p-[7px] shadow-[-15px_25px_40px_rgba(0,0,0,0.18)]"
          style={{ transform: "rotate(9deg)" }}
        >
          {/* Screen Container */}
          <div className="w-full h-full rounded-[37px] bg-[#fafaf8] overflow-hidden relative">
            
            {/* Dynamic Island */}
            <div className="absolute w-[92px] h-[25px] top-[13px] left-1/2 -translate-x-1/2 rounded-[20px] bg-[#050505] z-[5]" />

            {/* Phone Content (counter rotated -9deg) */}
            <div
              className="pt-[54px] px-[20px] pb-[20px] w-[112%] -ml-[6%] flex flex-col gap-3"
              style={{ transform: "rotate(-9deg)" }}
            >
              {/* Header inside Phone */}
              <div className="flex items-center justify-between mb-1">
                <div className="text-[24px] tracking-[-2px] font-light text-[#0B0B0B]">
                  ZERO<span className="text-[#FDC909]">.</span>
                </div>
                <Settings className="w-4 h-4 text-[#0B0B0B]" />
              </div>

              {/* Saldo Disponibile Card */}
              <div className="bg-white rounded-[19px] p-[18px_16px] shadow-[0_5px_18px_rgba(0,0,0,0.05)] relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[26px] font-bold tracking-[-1.5px] text-[#0B0B0B]">
                    € 1.245,80
                  </span>
                  <Eye className="w-4 h-4 text-[#777]" />
                </div>

                {/* Chart */}
                <div className="flex items-end justify-between h-[45px] gap-1 pt-2">
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#ededeb] h-[22px]" />
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#ededeb] h-[30px]" />
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#ededeb] h-[38px]" />
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#ededeb] h-[26px]" />
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#FDC909] h-[45px]" />
                  <div className="w-[14px] rounded-[6px_6px_3px_3px] bg-[#ededeb] h-[32px]" />
                </div>
              </div>

              {/* Shortcuts Row */}
              <div className="grid grid-cols-3 gap-[8px] mt-0.5">
                <div className="bg-white rounded-[15px] p-[14px_4px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[34px] h-[34px] mx-auto mb-1.5 rounded-[12px] bg-[#0B0B0B] text-white flex items-center justify-center text-[18px]">
                    →
                  </div>
                  Spese
                </div>

                <div className="bg-white rounded-[15px] p-[14px_4px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[34px] h-[34px] mx-auto mb-1.5 rounded-[12px] bg-[#f4f4f2] text-[#0B0B0B] flex items-center justify-center text-[18px]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  Abbonamenti
                </div>

                <div className="bg-white rounded-[15px] p-[14px_4px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[34px] h-[34px] mx-auto mb-1.5 rounded-[12px] bg-[#f4f4f2] text-[#0B0B0B] flex items-center justify-center text-[18px]">
                    <Target className="w-4 h-4" />
                  </div>
                  Obiettivi
                </div>
              </div>

              {/* Floating Yellow Plus Button */}
              <div className="flex justify-center -mt-2">
                <div className="w-[32px] h-[32px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-[18px] p-[14px] shadow-[0_4px_15px_rgba(0,0,0,0.04)]">
                <div className="text-[12px] font-bold mb-2 text-[#0B0B0B]">
                  Spese recenti
                </div>

                <div className="flex items-center py-[7px] border-b border-[#eee]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#f1f1ef] flex items-center justify-center mr-[8px] text-[10px] text-[#0B0B0B]">
                    ●
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-[#0B0B0B]">Spotify</div>
                    <div className="text-[8px] text-[#999]">Abbonamenti</div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#0B0B0B]">- € 3,49</div>
                </div>

                <div className="flex items-center py-[7px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#f1f1ef] flex items-center justify-center mr-[8px] text-[10px] text-[#0B0B0B]">
                    🛍
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-[#0B0B0B]">Zalando</div>
                    <div className="text-[8px] text-[#999]">Shopping</div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#0B0B0B]">- € 68,00</div>
                </div>
              </div>

            </div>
          </div>

          {/* Smooth Fade-to-White Mask on Bottom of Smartphone */}
          <div className="absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-b from-transparent via-[#F7F7F5]/90 to-[#F7F7F5] pointer-events-none z-[15]" />
        </div>

        {/* ── 4. LOGO INFERIORE (left: 40px, bottom: 195px) ──────────────────── */}
        <div className="absolute left-[40px] bottom-[195px] z-[20]">
          <div className="w-[33px] h-[6px] rounded-[10px] bg-[#FDC909] mb-[32px]" />
          <div className="text-[57px] font-light tracking-[-5px] text-[#0B0B0B] leading-none">
            ZERO<span className="text-[#FDC909] text-[25px] relative -left-[4px] -top-[2px]">.</span>
          </div>
        </div>

        {/* ── 5. CTA ("Inizia ora", left: 25px, right: 25px, bottom: 105px, h: 72px) ── */}
        <button
          onClick={onStart}
          className="absolute left-[25px] right-[25px] bottom-[105px] h-[72px] rounded-[40px] bg-[#0B0B0B] text-white flex items-center justify-center text-[19px] font-semibold z-[30] shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-black active:scale-[0.98] transition-all group"
        >
          <div className="absolute left-[7px] w-[58px] h-[58px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center text-[27px] font-bold group-hover:scale-105 transition-transform">
            →
          </div>
          Inizia ora
        </button>

        {/* ── 6. PAGINAZIONE (bottom: 73px) ──────────────────────────────────── */}
        <div className="absolute bottom-[73px] left-1/2 -translate-x-1/2 flex gap-[9px] z-[30]">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveDot(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                idx === activeDot
                  ? "w-[29px] h-[7px] rounded-[10px] bg-[#0B0B0B]"
                  : "w-[7px] h-[7px] rounded-full bg-[#c8c8c8]"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* ── 7. HOME INDICATOR (bottom: 17px) ───────────────────────────────── */}
        <div className="absolute bottom-[17px] left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-[10px] bg-[#0B0B0B] z-[40]" />

      </main>
    </div>
  );
}
