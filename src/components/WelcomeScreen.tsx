import React, { useState, useRef } from "react";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const triggerUnlock = () => {
    setSliderPos(100);
    setIsLeaving(true);
    setTimeout(() => {
      onStart();
    }, 450);
  };

  // Mouse / Touch drag handlers for the Slider
  const handleDrag = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const handleWidth = 52;
    const maxDrag = rect.width - handleWidth;
    const currentOffset = clientX - rect.left - handleWidth / 2;
    
    let percentage = (currentOffset / maxDrag) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    setSliderPos(percentage);

    if (percentage >= 85) {
      setIsDragging(false);
      triggerUnlock();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleDrag(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleDrag(e.clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderPos < 85) {
      setSliderPos(0); // Snap back if not reached threshold
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      className={`relative min-h-[780px] h-full flex flex-col justify-between p-7 bg-[#121212] text-white overflow-hidden select-none transition-all duration-500 ${
        isLeaving ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Dynamic Background: Organic Topographic Waves SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none stroke-white/40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 800"
        fill="none"
      >
        <path d="M-50 100 Q 150 200 350 50 T 450 300" strokeWidth="1.5" />
        <path d="M-50 180 Q 120 320 380 180 T 450 420" strokeWidth="1.5" />
        <path d="M-50 260 Q 180 400 320 280 T 450 540" strokeWidth="1.5" />
        <path d="M-50 350 Q 100 500 400 380 T 450 650" strokeWidth="1.5" />
        <path d="M-50 440 Q 200 620 360 480 T 450 780" strokeWidth="1.5" />
      </svg>

      {/* Yellow Liquid Glow Background Blobs */}
      <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-[#F5E050]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-[#EAB308]/20 blur-3xl pointer-events-none" />

      {/* Top Header Tag */}
      <div className="pt-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-sm font-extrabold tracking-tight">Zero</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#FEF08A]">
          <Sparkles className="h-3.5 w-3.5 text-[#F5E050] animate-sparkle" />
          <span>Benvenuta in Zero</span>
        </div>
      </div>

      {/* Center Animated Floating Clean Card Area (No Name, No Balance) */}
      <div className="relative my-auto py-8 z-10 flex flex-col items-center justify-center">
        {/* Floating Sparkle Stars around Card */}
        <div className="absolute top-2 left-6 text-[#F5E050] animate-sparkle">
          ✦
        </div>
        <div className="absolute bottom-4 right-8 text-[#FEF08A] text-lg animate-sparkle delay-300">
          ★
        </div>

        {/* Floating Minimal Glassmorphic Card */}
        <div className="relative w-full max-w-[280px] h-44 rounded-[26px] bg-gradient-to-tr from-[#1E1E1E] via-[#2D2B1C] to-[#453E17] border border-[#F5E050]/40 p-5 shadow-[0_20px_50px_rgba(245,224,80,0.15)] flex flex-col justify-between animate-float-card overflow-hidden">
          {/* Card internal gradient glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#F5E050]/30 blur-xl pointer-events-none" />

          {/* Top Row: Brand & VISA */}
          <div className="flex items-center justify-between z-10">
            <span className="font-extrabold text-xs tracking-wider text-white/90">ZERO</span>
            <span className="font-black italic text-lg text-[#F5E050]">VISA</span>
          </div>

          {/* Middle Chip */}
          <div className="z-10 my-auto flex items-center gap-3">
            <div className="h-6 w-8 rounded-md bg-gradient-to-tr from-[#FEF08A] to-[#EAB308] opacity-90 shadow-sm" />
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>

          {/* Bottom Card Number (Clean & Minimal) */}
          <div className="z-10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FEF08A]">
              •••• •••• 3377
            </span>
            <span className="text-[10px] font-mono text-white/50">09/29</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Animated Heading & Interactive Swipe Slider */}
      <div className="pb-4 z-10 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
            Gestire il tuo denaro sta per diventare molto più semplice.
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A39E] font-medium mt-2 leading-relaxed">
            Tieni traccia di spese, abbonamenti e obiettivi senza confusione.
          </p>
        </div>

        {/* Interactive Slider Button to Open App */}
        <div
          ref={sliderRef}
          onClick={() => {
            // Also allow click to unlock for accessibility
            if (sliderPos < 50) triggerUnlock();
          }}
          className="relative w-full h-14 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-1 flex items-center overflow-hidden cursor-pointer shadow-xl group"
        >
          {/* Active Fill Track */}
          <div
            className="absolute left-1 top-1 bottom-1 bg-[#F5E050] rounded-full transition-all duration-75"
            style={{ width: `calc(${sliderPos}% + 48px - ${(sliderPos / 100) * 48}px)` }}
          />

          {/* Text Prompt */}
          <div className="w-full text-center text-xs font-extrabold tracking-wider uppercase text-white/80 pointer-events-none flex items-center justify-center gap-1.5 pl-6">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Scorri per iniziare
            </span>
            <ChevronRight className="h-4 w-4 text-[#F5E050] animate-pulse" />
            <ChevronRight className="h-4 w-4 text-white/40 -ml-2" />
          </div>

          {/* Sliding Knob Handle */}
          <div
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            style={{
              transform: `translateX(calc(${(sliderPos / 100) * (sliderRef.current ? sliderRef.current.getBoundingClientRect().width - 52 : 240)}px))`,
            }}
            className="absolute left-1 h-12 w-12 rounded-full bg-white text-[#121212] flex items-center justify-center shadow-lg transition-transform duration-75 group-hover:scale-105 active:scale-95"
          >
            <ArrowRight className="h-5 w-5 stroke-[2.5] text-[#121212]" />
          </div>
        </div>
      </div>
    </div>
  );
}
