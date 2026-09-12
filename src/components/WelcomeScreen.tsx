import React, { useState, useRef, useCallback } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

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
      className={`relative min-h-[780px] h-full flex flex-col justify-between p-7 bg-[#121212] text-white overflow-hidden select-none transition-all duration-500 ease-in-out ${
        isLeaving ? "opacity-0 -translate-y-6 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {/* Organic Topographic Waves Background SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none stroke-white/40"
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
      <div className="absolute top-10 -right-20 w-80 h-80 rounded-full bg-[#F5E050]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />

      {/* Clean Top Header Tag (No Stars) */}
      <div className="pt-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="text-sm font-extrabold tracking-tight">Zero</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-[#F5E050]">
          Zero App
        </div>
      </div>

      {/* Center Floating Clean Minimal Card */}
      <div className="relative my-auto py-8 z-10 flex flex-col items-center justify-center">
        <div
          style={{
            background:
              "radial-gradient(circle at 85% 15%, rgba(245, 224, 80, 0.35) 0%, rgba(0,0,0,0) 60%), linear-gradient(135deg, #1C1C1C 0%, #2A261B 50%, #3D3712 100%)",
            WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          }}
          className="relative w-full max-w-[280px] h-44 rounded-2xl border border-[#F5E050]/40 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col justify-between animate-float-card overflow-hidden"
        >
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

          {/* Bottom Card Number */}
          <div className="z-10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FEF08A]">
              •••• •••• 3377
            </span>
            <span className="text-[10px] font-mono text-white/50">09/29</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Text & Ultra-Smooth Swipe Slider */}
      <div className="pb-4 z-10 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
            Gestire il tuo denaro sta per diventare molto più semplice.
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A39E] font-medium mt-2 leading-relaxed">
            Tieni traccia di spese, abbonamenti e obiettivi senza confusione.
          </p>
        </div>

        {/* Ultra-Smooth Swipe Slider */}
        <div
          ref={sliderRef}
          onClick={() => {
            if (sliderPos < 50) triggerUnlock();
          }}
          className="relative w-full h-14 bg-white/10 border border-white/15 rounded-full p-1 flex items-center overflow-hidden cursor-pointer shadow-lg"
        >
          {/* Active Yellow Track Fill */}
          <div
            className="absolute left-1 top-1 bottom-1 bg-[#F5E050] rounded-full"
            style={{
              width: `${sliderPos}%`,
              transition: isDragging ? "none" : "all 0.3s ease-out",
            }}
          />

          {/* Text Prompt */}
          <div className="w-full text-center text-xs font-extrabold tracking-wider uppercase text-white/90 pointer-events-none flex items-center justify-center gap-1 pl-6 z-10">
            <span>Scorri per iniziare</span>
            <ChevronRight className="h-4 w-4 text-[#F5E050] animate-pulse" />
          </div>

          {/* Slider Drag Knob */}
          <div
            onMouseDown={(e) => handleStartDrag(e.clientX)}
            onTouchStart={(e) => handleStartDrag(e.touches[0].clientX)}
            style={{
              transform: `translate3d(${(sliderPos / 100) * (trackWidthRef.current || 240)}px, 0, 0)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
              willChange: "transform",
            }}
            className="absolute left-1 h-12 w-12 rounded-full bg-white text-[#121212] flex items-center justify-center shadow-xl z-20 touch-none"
          >
            <ArrowRight className="h-5 w-5 stroke-[2.5] text-[#121212]" />
          </div>
        </div>
      </div>
    </div>
  );
}
