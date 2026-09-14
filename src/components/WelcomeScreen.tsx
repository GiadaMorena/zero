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
      title: "Zero ansia da fine mese.",
      subtitle: "Gestisci spese, abbonamenti e obiettivi. Tutto in un unico posto.",
    },
    {
      title: "Ogni euro al suo posto.",
      subtitle: "Monitora le tue abitudini finanziarie in modo semplice e chiaro.",
    },
    {
      title: "Raggiungi i tuoi obiettivi.",
      subtitle: "Metti da parte denaro per ciò che conta davvero per te.",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F7F7F5] flex flex-col justify-between overflow-x-hidden select-none relative">
      {/* Safe area spacer top */}
      <div style={{ height: "env(safe-area-inset-top, 16px)" }} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-5 py-4">
        
        {/* TOP / CENTER VISUAL COMPOSITION (Card + App Mockup) */}
        <div className="relative w-full flex-1 min-h-[380px] max-h-[440px] flex items-center justify-center my-2">
          
          {/* Subtle yellow ambient glow */}
          <div className="absolute w-64 h-64 rounded-full bg-[#FDC909]/15 blur-3xl pointer-events-none -top-4" />

          {/* APP MOCKUP (Background Layer) */}
          <div className="absolute top-4 right-2 w-[230px] h-[340px] rounded-[36px] bg-[#0B0B0B] p-2.5 shadow-2xl border border-[#0B0B0B] transform rotate-[6deg] translate-x-3 transition-transform duration-500 hover:rotate-[4deg]">
            
            {/* Phone Screen Preview */}
            <div className="w-full h-full bg-[#F7F7F5] rounded-[28px] overflow-hidden flex flex-col p-3 text-[#0B0B0B] relative">
              
              {/* Dynamic Island pill */}
              <div className="w-16 h-3 bg-[#0B0B0B] rounded-full mx-auto mb-2 flex items-center justify-end px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#121212]" />
              </div>

              {/* App Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-extrabold text-xs tracking-tighter text-[#0B0B0B]">
                  ZERO
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FDC909] ml-0.5" />
                </span>
                <Settings className="w-3.5 h-3.5 text-[#0B0B0B]" />
              </div>

              {/* Balance Card Preview */}
              <div className="bg-white rounded-2xl p-3 shadow-xs border border-[#A7A7A7]/20 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black text-[#0B0B0B]">€ 1.245,80</span>
                  <Eye className="w-3 h-3 text-[#A7A7A7]" />
                </div>
                
                {/* Mini Bar Chart Preview */}
                <div className="flex items-end justify-between h-8 gap-1 pt-2">
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[40%]" />
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[60%]" />
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[30%]" />
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[50%]" />
                  <div className="w-full bg-[#FDC909] rounded-t h-[90%]" />
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[45%]" />
                  <div className="w-full bg-[#A7A7A7]/30 rounded-t h-[65%]" />
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white rounded-xl p-2 flex flex-col items-center justify-center gap-1 border border-[#A7A7A7]/20 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#0B0B0B] text-white flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-[#0B0B0B]">Spese</span>
                </div>

                <div className="bg-white rounded-xl p-2 flex flex-col items-center justify-center gap-1 border border-[#A7A7A7]/20 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#A7A7A7]/30">
                    <Calendar className="w-3 h-3 text-[#0B0B0B]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#0B0B0B]">Abbonamenti</span>
                </div>

                <div className="bg-white rounded-xl p-2 flex flex-col items-center justify-center gap-1 border border-[#A7A7A7]/20 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#F7F7F5] text-[#0B0B0B] flex items-center justify-center border border-[#A7A7A7]/30">
                    <Target className="w-3 h-3 text-[#0B0B0B]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#0B0B0B]">Obiettivi</span>
                </div>
              </div>

              {/* Bottom Yellow Plus Floating Button */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <div className="w-7 h-7 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

            </div>
          </div>

          {/* ZERO CREDIT CARD (Tilted Foreground Hero Layer) */}
          <div className="absolute top-2 left-2 w-[240px] h-[145px] rounded-2xl bg-[#0B0B0B] p-4 flex flex-col justify-between shadow-2xl border border-[#FDC909]/60 transform -rotate-[12deg] z-20 transition-transform duration-500 hover:-rotate-[9deg] hover:scale-[1.02]">
            
            {/* Card Watermark Background */}
            <div className="absolute right-0 top-0 bottom-0 text-[100px] font-black italic text-white/5 select-none pointer-events-none leading-none flex items-center pr-2">
              Z
            </div>

            {/* Top row: ZERO logo + Expiry */}
            <div className="flex items-center justify-between z-10">
              <span className="font-extrabold text-sm tracking-wider text-[#FDC909]">
                ZERO
              </span>
              <span className="text-[10px] font-mono font-bold text-[#A7A7A7]">09/29</span>
            </div>

            {/* Middle row: Metallic Chip */}
            <div className="z-10 my-auto flex items-center gap-2">
              <div className="h-6 w-8 rounded-md bg-[#A7A7A7]/40 border border-[#FDC909]/50 shadow-inner relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#FDC909]/60" />
              </div>
            </div>

            {/* Bottom row: Card Number */}
            <div className="z-10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-white">
                •••• •••• 3377
              </span>
            </div>
          </div>

        </div>

        {/* BRANDING LOGO & TEXT SECTION */}
        <div className="flex flex-col gap-3 my-2 z-10">
          
          {/* Yellow Dash */}
          <div className="w-8 h-1.5 rounded-full bg-[#FDC909]" />

          {/* Official ZERO Logo */}
          <div className="flex items-center gap-2 my-1">
            <Image
              src={Logo}
              alt="ZERO Logo"
              width={110}
              height={36}
              className="object-contain h-9 w-auto"
              priority
            />
          </div>

          {/* Headline & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B0B0B] tracking-tight leading-tight">
              {slides[activeSlide].title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#A7A7A7] mt-1.5 leading-relaxed max-w-sm">
              {slides[activeSlide].subtitle}
            </p>
          </div>
        </div>

        {/* BOTTOM CTA & ONBOARDING INDICATORS */}
        <div className="flex flex-col gap-4 mt-4 z-10">
          
          {/* CTA Button: Pill with Yellow Circle Arrow */}
          <button
            onClick={onStart}
            className="w-full h-15 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-base flex items-center justify-between p-1.5 shadow-xl hover:bg-black active:scale-[0.98] transition-all cursor-pointer group"
          >
            {/* Yellow Circle Button on Left */}
            <div className="w-12 h-12 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Button Text */}
            <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
              Inizia ora
            </span>
          </button>

          {/* Onboarding Indicators */}
          <div className="flex items-center justify-center gap-2 py-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeSlide
                    ? "w-6 h-2 bg-[#0B0B0B]"
                    : "w-2 h-2 bg-[#A7A7A7]/40 hover:bg-[#A7A7A7]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Safe area spacer bottom */}
      <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
    </div>
  );
}
