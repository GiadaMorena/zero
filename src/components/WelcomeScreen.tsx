"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, Calendar, Target, Plus, ArrowRight } from "lucide-react";
import Logo from "@/assets/logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <div className="w-full min-h-[100dvh] flex justify-center items-center bg-[#F7F7F5] overflow-hidden select-none">
      
      {/* 430 x 932 Standard Mobile Canvas Container */}
      <main className="relative w-full max-w-[430px] h-[100dvh] max-h-[932px] min-h-[720px] overflow-hidden bg-[#F7F7F5]">
        
        {/* Warm Ambient Yellow Radial Glow */}
        <div
          className="absolute top-[120px] right-[20px] w-[280px] h-[280px] rounded-full bg-[#FDC909]/20 blur-3xl pointer-events-none z-0"
        />

        {/* ── 1. TILTED ZERO CREDIT CARD (Hero Foreground Layer) ───────────────── */}
        <div
          className="absolute left-[24px] top-[140px] w-[310px] h-[195px] z-20 rounded-[22px] border-2 border-[#FDC909] bg-[#0B0B0B] overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
          style={{
            transform: "rotate(-11deg)",
            background: "linear-gradient(135deg, #171717 0%, #080808 65%, #111 100%)",
          }}
        >
          {/* Watermark 0 / Z */}
          <div className="absolute right-[8px] -top-[30px] text-[230px] font-black italic text-white/[0.08] leading-none select-none pointer-events-none">
            0
          </div>

          {/* Top Left Yellow Logo */}
          <div className="absolute top-[20px] left-[24px] text-[#FDC909] text-[20px] font-black tracking-wider z-10">
            ZERO
          </div>

          {/* Silver Metallic Chip */}
          <div
            className="absolute left-[24px] bottom-[56px] w-[40px] h-[30px] rounded-[6px] z-10 overflow-hidden shadow-inner"
            style={{
              background: "linear-gradient(90deg, #E5E7EB, #9CA3AF)",
              boxShadow: "inset 0 0 0 1px #6B7280",
            }}
          >
            <div className="absolute w-full h-[9px] top-[10px] left-0 border-t border-b border-[#4B5563]" />
            <div className="absolute w-[9px] h-full top-0 left-[15px] border-l border-r border-[#4B5563]" />
          </div>

          {/* Card Number */}
          <div className="absolute left-[24px] bottom-[20px] text-[#D1D5DB] text-[13px] tracking-[4px] font-mono z-10">
            •••• •••• <strong className="text-white text-[17px] tracking-[2px] font-mono font-bold">3377</strong>
          </div>

          {/* Expiry */}
          <div className="absolute right-[22px] bottom-[20px] text-[#9CA3AF] text-[13px] font-mono z-10">
            09/29
          </div>
        </div>

        {/* ── 2. TILTED SMARTPHONE MOCKUP (Background Layer) ─────────────────── */}
        <div
          className="absolute -right-[30px] top-[240px] w-[290px] h-[550px] z-10 rounded-[44px] bg-[#171717] border border-[#262626] p-[8px] shadow-[-15px_30px_50px_rgba(0,0,0,0.22)]"
          style={{ transform: "rotate(8deg)" }}
        >
          {/* Phone Display Screen */}
          <div className="w-full h-full rounded-[36px] bg-[#F7F7F5] overflow-hidden relative">
            
            {/* Dynamic Island Pill */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[88px] h-[24px] rounded-full bg-[#0B0B0B] z-10" />

            {/* Dashboard Content (Counter-rotated -8deg) */}
            <div
              className="pt-[54px] px-[20px] pb-[20px] w-[112%] -ml-[6%] flex flex-col gap-3.5"
              style={{ transform: "rotate(-8deg)" }}
            >
              {/* Header inside Phone */}
              <div className="text-[26px] font-black tracking-tighter text-[#0B0B0B] flex items-baseline">
                ZERO<span className="inline-block w-2 h-2 rounded-full bg-[#FDC909] ml-0.5" />
              </div>

              {/* Saldo disponibile Card */}
              <div className="bg-white rounded-[20px] p-[20px_18px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#0B0B0B]/5 relative">
                <div className="text-[11px] font-medium text-[#73736E] mb-1">
                  Saldo disponibile
                </div>
                <div className="text-[28px] font-black tracking-tight text-[#0B0B0B] mb-3">
                  € 1.245,80
                </div>

                <Eye className="absolute top-[20px] right-[18px] w-4 h-4 text-[#A7A7A7]" />

                {/* Vertical Bar Chart */}
                <div className="flex items-end justify-between h-[48px] gap-1 pt-1">
                  {[30, 42, 28, 55, 38, 48, 100, 60, 45, 35, 50].map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-full rounded-t-full transition-all ${
                        idx === 6 ? "bg-[#FDC909]" : "bg-[#0B0B0B]/10"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Shortcuts Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-[16px] p-2.5 text-center shadow-2xs border border-[#0B0B0B]/5 flex flex-col items-center gap-1.5">
                  <div className="w-[34px] h-[34px] rounded-xl bg-[#0B0B0B] text-white flex items-center justify-center font-bold text-sm">
                    →
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Spese</span>
                </div>

                <div className="bg-white rounded-[16px] p-2.5 text-center shadow-2xs border border-[#0B0B0B]/5 flex flex-col items-center gap-1.5">
                  <div className="w-[34px] h-[34px] rounded-xl bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#0B0B0B]/10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Abbonamenti</span>
                </div>

                <div className="bg-white rounded-[16px] p-2.5 text-center shadow-2xs border border-[#0B0B0B]/5 flex flex-col items-center gap-1.5">
                  <div className="w-[34px] h-[34px] rounded-xl bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#0B0B0B]/10">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Obiettivi</span>
                </div>
              </div>

              {/* Floating Yellow Plus Button */}
              <div className="flex justify-center -mt-2">
                <div className="w-[34px] h-[34px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md shadow-[#FDC909]/40">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              {/* Spese Recenti */}
              <div className="bg-white rounded-[18px] p-3.5 shadow-2xs border border-[#0B0B0B]/5">
                <div className="text-[12px] font-black text-[#0B0B0B] mb-2">
                  Spese recenti
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#0B0B0B]/5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#0B0B0B]/5 flex items-center justify-center font-bold">●</div>
                    <div>
                      <p className="font-bold text-[#0B0B0B]">Spotify</p>
                      <p className="text-[8px] text-[#A7A7A7]">Abbonamenti</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B0B0B]">- € 3,49</span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#0B0B0B]/5 flex items-center justify-center font-bold">🛍</div>
                    <div>
                      <p className="font-bold text-[#0B0B0B]">Zalando</p>
                      <p className="text-[8px] text-[#A7A7A7]">Shopping</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B0B0B]">- € 68,00</span>
                </div>
              </div>

            </div>
          </div>

          {/* Smooth Fade-to-White Mask on Bottom of Smartphone */}
          <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-b from-transparent via-[#F7F7F5]/90 to-[#F7F7F5] pointer-events-none z-20" />
        </div>

        {/* ── 3. BOTTOM BRANDING (YELLOW DASH + ZERO LOGO) ────────────────────── */}
        <div className="absolute left-[36px] bottom-[185px] z-30 flex flex-col items-start gap-3">
          {/* Yellow Line Accent */}
          <div className="w-[36px] h-[6px] rounded-full bg-[#FDC909]" />

          {/* Official ZERO Logo */}
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="ZERO"
              width={140}
              height={44}
              className="object-contain h-11 w-auto"
              priority
            />
          </div>
        </div>

        {/* ── 4. PRIMARY CTA BUTTON ("Inizia ora") ────────────────────────────── */}
        <button
          onClick={onStart}
          className="absolute left-[24px] right-[24px] bottom-[95px] h-[72px] rounded-[40px] bg-[#0B0B0B] text-white flex items-center justify-center text-[19px] font-bold z-30 shadow-[0_12px_35px_rgba(0,0,0,0.18)] cursor-pointer hover:bg-black active:scale-[0.98] transition-all group"
        >
          {/* Yellow Circle Button on Left */}
          <div className="absolute left-[7px] w-[58px] h-[58px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center text-[26px] font-extrabold shadow-md group-hover:scale-105 transition-transform">
            →
          </div>

          {/* Centered White Text */}
          <span className="flex-1 text-center pr-6 tracking-wide text-[#F7F7F5] font-extrabold">
            Inizia ora
          </span>
        </button>

        {/* ── 5. PAGINATION DOTS ──────────────────────────────────────────────── */}
        <div className="absolute bottom-[65px] left-1/2 -translate-x-1/2 flex items-center gap-[8px] z-30">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveDot(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                idx === activeDot
                  ? "w-[28px] h-[7px] rounded-full bg-[#0B0B0B]"
                  : "w-[7px] h-[7px] rounded-full bg-[#A7A7A7]/40 hover:bg-[#A7A7A7]"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* ── 6. HOME INDICATOR BAR ────────────────────────────────────────────── */}
        <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-full bg-[#0B0B0B] z-40" />

      </main>
    </div>
  );
}
