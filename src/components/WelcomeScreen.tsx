"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Eye, Calendar, Target, Settings, Plus } from "lucide-react";
import Logo from "@/assets/logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      headline: "Zero ansia da fine mese.",
      subtitle: "Gestisci spese, abbonamenti e obiettivi. Tutto in un unico posto.",
    },
    {
      headline: "Ogni euro sotto controllo.",
      subtitle: "Monitora entrate ed uscite senza complicanze o calcoli manuali.",
    },
    {
      headline: "Raggiungi i tuoi traguardi.",
      subtitle: "Pianifica i tuoi risparmi e metti da parte quello che desideri.",
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#F7F7F5] flex flex-col justify-between overflow-hidden select-none relative">
      
      {/* Top Safe Area Spacer */}
      <div style={{ height: "env(safe-area-inset-top, 12px)" }} />

      {/* ── TOP HERO VISUAL COMPOSITION ──────────────────────────────────────── */}
      <div className="relative w-full flex-1 max-h-[52vh] sm:max-h-[58vh] flex items-center justify-center overflow-visible">
        
        {/* Warm Ambient Yellow Glow Background */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-[#FDC909]/20 blur-3xl pointer-events-none" />

        {/* PHONE MOCKUP (Angled Right/Center, Bottom Faded) */}
        <div className="absolute -right-4 top-2 sm:top-6 w-[280px] sm:w-[310px] transform -rotate-[7deg] translate-x-4 sm:translate-x-2 transition-transform duration-700 hover:-rotate-[5deg]">
          
          {/* Phone Titanium Outer Shell */}
          <div className="w-full rounded-[48px] bg-[#1E1E1E] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#333333] relative overflow-hidden">
            
            {/* Phone Screen Container */}
            <div className="w-full bg-[#F7F7F5] rounded-[38px] pt-3 px-3 pb-8 text-[#0B0B0B] relative flex flex-col gap-3 min-h-[360px]">
              
              {/* Dynamic Island Pill */}
              <div className="w-20 h-4 bg-[#0B0B0B] rounded-full mx-auto mb-1 flex items-center justify-end px-1.5">
                <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
              </div>

              {/* App Internal Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-black text-sm tracking-tight text-[#0B0B0B]">
                  ZERO
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FDC909] ml-0.5" />
                </span>
                <Settings className="w-4 h-4 text-[#0B0B0B]" />
              </div>

              {/* Main Balance Card Preview */}
              <div className="bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#0B0B0B]/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-black text-[#0B0B0B]">€ 1.245,80</span>
                  <Eye className="w-3.5 h-3.5 text-[#0B0B0B]" />
                </div>

                {/* 11 Vertical Bars Chart */}
                <div className="flex items-end justify-between h-10 gap-1 pt-1">
                  {[35, 45, 30, 50, 40, 60, 100, 55, 70, 40, 50].map((h, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t-full transition-all ${
                        i === 6 ? "bg-[#FDC909]" : "bg-[#0B0B0B]/10"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* 3 Quick Action Cards Row */}
              <div className="grid grid-cols-3 gap-2">
                {/* Spese */}
                <div className="bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#0B0B0B]/5 shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#0B0B0B] text-white flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Spese</span>
                </div>

                {/* Abbonamenti */}
                <div className="bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#0B0B0B]/5 shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#0B0B0B]/10">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Abbonamenti</span>
                </div>

                {/* Obiettivi */}
                <div className="bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#0B0B0B]/5 shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#0B0B0B]/10">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0B0B]">Obiettivi</span>
                </div>
              </div>

              {/* Floating Yellow Plus Circle Button */}
              <div className="flex justify-center -mt-1">
                <div className="w-8 h-8 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

            </div>

            {/* SMOOTH BOTTOM FADE GRADIENT (Fades Phone bottom into #F7F7F5) */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-[#F7F7F5]/80 to-[#F7F7F5] pointer-events-none z-10" />
          </div>
        </div>

        {/* ZERO TILTED CREDIT CARD (Hero Floating Foreground Layer) */}
        <div className="absolute left-3 sm:left-8 top-3 sm:top-8 w-[250px] sm:w-[280px] h-[155px] sm:h-[175px] rounded-2xl bg-[#0B0B0B] p-4 sm:p-5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-2 border-[#FDC909] transform -rotate-[12deg] z-20 transition-transform duration-500 hover:-rotate-[9deg] hover:scale-[1.02]">
          
          {/* Huge Translucent Watermark "Z" */}
          <div className="absolute right-1 top-0 bottom-0 text-[120px] font-black italic text-white/5 select-none pointer-events-none leading-none flex items-center pr-2">
            Z
          </div>

          {/* Top row: ZERO Yellow Logo + Expiry */}
          <div className="flex items-center justify-between z-10">
            <span className="font-black text-base sm:text-lg tracking-wider text-[#FDC909]">
              ZERO
            </span>
            <span className="text-[11px] font-mono font-bold text-[#A7A7A7]">09/29</span>
          </div>

          {/* Middle row: Metallic Chip */}
          <div className="z-10 my-auto flex items-center gap-2">
            <div className="h-7 w-9 rounded-md bg-[#D1D5DB]/30 border border-[#FDC909]/60 shadow-inner relative overflow-hidden flex items-center justify-center">
              <div className="w-full h-0.5 bg-[#FDC909]/80" />
            </div>
          </div>

          {/* Bottom row: Card Number */}
          <div className="z-10 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] text-white">
              •••• •••• 3377
            </span>
          </div>
        </div>

      </div>

      {/* ── BOTTOM BRANDING & CTA SECTION ───────────────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-6 pb-4 flex flex-col gap-4 z-30">
        
        {/* Yellow Horizontal Accent Dash */}
        <div className="w-10 h-2 rounded-full bg-[#FDC909]" />

        {/* Official ZERO Logo */}
        <div className="flex items-center">
          <Image
            src={Logo}
            alt="ZERO"
            width={120}
            height={40}
            className="object-contain h-9 sm:h-10 w-auto"
            priority
          />
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B0B0B] tracking-tight leading-tight">
            {slides[activeSlide].headline}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#A7A7A7] leading-relaxed max-w-xs">
            {slides[activeSlide].subtitle}
          </p>
        </div>

        {/* Primary CTA Button: Black Pill with Left Yellow Circle Arrow */}
        <button
          onClick={onStart}
          className="w-full h-16 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-lg flex items-center justify-between p-1.5 shadow-xl hover:bg-black active:scale-[0.98] transition-all cursor-pointer group mt-1"
        >
          {/* Yellow Circle Button on Left */}
          <div className="w-13 h-13 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Button Text */}
          <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
            Inizia ora
          </span>
        </button>

        {/* Onboarding Page Indicators */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeSlide
                  ? "w-6 h-2 bg-[#0B0B0B]"
                  : "w-2 h-2 bg-[#A7A7A7]/40 hover:bg-[#A7A7A7]"
              }`}
              aria-label={`Vai a slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Bottom Safe Area Spacer */}
      <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
    </div>
  );
}
