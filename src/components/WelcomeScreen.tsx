"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import Logo from "@/assets/logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const trackWidthRef = useRef<number>(280);

  const triggerUnlock = useCallback(() => {
    setSliderPos(100);
    setIsLeaving(true);
    setTimeout(() => {
      onStart();
    }, 350);
  }, [onStart]);

  const handleStartDrag = (clientX: number) => {
    if (sliderRef.current) {
      trackWidthRef.current = sliderRef.current.getBoundingClientRect().width - 52;
    }
    setIsDragging(true);
    updatePos(clientX);
  };

  const updatePos = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const currentOffset = clientX - rect.left - 26;
    const maxDrag = trackWidthRef.current || 240;

    let percentage = (currentOffset / maxDrag) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    setSliderPos(percentage);

    if (percentage >= 82) {
      setIsDragging(false);
      triggerUnlock();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updatePos(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePos(e.clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderPos < 82) {
      setSliderPos(0);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      className={`fixed inset-0 flex flex-col bg-[#0B0B0B] text-white overflow-y-auto overflow-x-hidden select-none transition-all duration-500 ease-in-out ${
        isLeaving ? "opacity-0 -translate-y-6 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
      style={{ zIndex: 50 }}
    >
      {/* Background ambient glow in ZERO yellow */}
      <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-[#FDC909]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-[#FDC909]/10 blur-3xl pointer-events-none" />

      {/* Safe area spacer */}
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* Top Header */}
      <div className="z-10 flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#0B0B0B] flex items-center justify-center p-1 border border-[#A7A7A7]/30 shadow-sm overflow-hidden">
            <Image
              src={Logo}
              alt="ZERO Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="text-base font-black tracking-tight text-white">ZERO</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDC909] text-[11px] font-black text-[#0B0B0B] shadow-xs">
          Official
        </div>
      </div>

      {/* Center: Hero Card */}
      <div className="relative flex-1 flex flex-col items-center justify-center z-10 py-6">
        <div
          className="relative w-full max-w-[280px] h-44 rounded-2xl border border-[#FDC909]/50 bg-[#0B0B0B] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between z-10">
            <span className="font-extrabold text-xs tracking-wider text-white/90">ZERO</span>
            <span className="font-black italic text-lg text-[#FDC909]">CARD</span>
          </div>
          <div className="z-10 my-auto flex items-center gap-3">
            <div className="h-6 w-8 rounded-md bg-[#FDC909] shadow-sm" />
            <div className="h-1.5 w-12 rounded-full bg-[#A7A7A7]/30" />
          </div>
          <div className="z-10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FDC909]">
              •••• •••• 3377
            </span>
            <span className="text-[10px] font-mono text-[#A7A7A7]">09/29</span>
          </div>
        </div>
      </div>

      {/* Bottom: text + slider */}
      <div
        className="z-10 flex flex-col gap-6 px-5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 20px), 28px)" }}
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-[1.15]">
            Gestire il tuo denaro sta per diventare molto più semplice.
          </h1>
          <p className="text-xs text-[#A7A7A7] font-medium mt-2 leading-relaxed">
            Tieni traccia di spese, abbonamenti e obiettivi senza confusione.
          </p>
        </div>

        {/* Swipe Slider */}
        <div
          ref={sliderRef}
          onClick={() => {
            if (sliderPos < 50) triggerUnlock();
          }}
          className="relative w-full h-14 bg-white/10 border border-[#A7A7A7]/30 rounded-full p-1 flex items-center overflow-hidden cursor-pointer shadow-lg"
        >
          <div
            className="absolute left-1 top-1 bottom-1 bg-[#FDC909] rounded-full"
            style={{
              width: `${sliderPos}%`,
              transition: isDragging ? "none" : "all 0.3s ease-out",
            }}
          />
          <div className="w-full text-center text-xs font-extrabold tracking-wider uppercase text-white/90 pointer-events-none flex items-center justify-center gap-1 pl-6 z-10">
            <span>Scorri per iniziare</span>
            <ChevronRight className="h-4 w-4 text-[#FDC909] animate-pulse" />
          </div>
          <div
            onMouseDown={(e) => handleStartDrag(e.clientX)}
            onTouchStart={(e) => handleStartDrag(e.touches[0].clientX)}
            style={{
              transform: `translate3d(${(sliderPos / 100) * (trackWidthRef.current || 240)}px, 0, 0)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
              willChange: "transform",
            }}
            className="absolute left-1 h-12 w-12 rounded-full bg-white text-[#0B0B0B] flex items-center justify-center shadow-xl z-20 touch-none"
          >
            <ArrowRight className="h-5 w-5 stroke-[2.5] text-[#0B0B0B]" />
          </div>
        </div>
      </div>
    </div>
  );
}
