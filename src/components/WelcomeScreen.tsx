import React, { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleStartClick = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onStart();
    }, 400);
  };

  return (
    <div
      className={`relative min-h-[780px] h-full flex flex-col justify-between p-7 bg-[#121212] text-white overflow-hidden transition-opacity duration-500 ${
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

      {/* Center Animated Floating 3D Credit Card Area */}
      <div className="relative my-auto py-10 z-10 flex flex-col items-center justify-center">
        {/* Floating Sparkle Stars around Card */}
        <div className="absolute top-4 left-8 text-[#F5E050] animate-sparkle">
          ✦
        </div>
        <div className="absolute bottom-6 right-10 text-[#FEF08A] text-lg animate-sparkle delay-300">
          ★
        </div>

        {/* Floating Glassmorphic 3D Card */}
        <div className="relative w-full max-w-[290px] h-44 rounded-[26px] bg-gradient-to-tr from-[#1E1E1E] via-[#2D2B1C] to-[#453E17] border border-[#F5E050]/40 p-5 shadow-[0_20px_50px_rgba(245,224,80,0.15)] flex flex-col justify-between animate-float-card overflow-hidden">
          {/* Card internal gradient glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#F5E050]/30 blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <span className="font-extrabold text-xs tracking-wider text-white/90">ZERO CARD</span>
            <span className="font-black italic text-lg text-[#F5E050]">VISA</span>
          </div>

          <div className="z-10 my-auto">
            <p className="text-[10px] text-white/60 uppercase font-mono">Giada Morena</p>
            <p className="text-xs font-mono font-bold tracking-widest text-[#FEF08A] mt-0.5">
              •••• •••• 3377
            </p>
          </div>

          <div className="flex items-center justify-between text-[9px] text-white/70 z-10">
            <span>DISPONIBILITÀ ATTUALE</span>
            <span className="font-extrabold text-[#F5E050] text-xs">€ 1.245,80</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Animated Heading & Action Button */}
      <div className="pb-6 z-10 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.15]">
            Gestire il tuo denaro sta per diventare molto più semplice.
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A39E] font-medium mt-3 leading-relaxed">
            Tieni traccia di spese, abbonamenti e obiettivi senza confusione.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleStartClick}
            className="group relative flex items-center justify-between w-full max-w-[200px] pl-6 pr-3 py-3.5 bg-white text-[#121212] rounded-full font-bold shadow-2xl hover:bg-[#F5E050] transition-all duration-300"
          >
            <span className="text-sm font-extrabold">Inizia ora</span>
            <div className="relative flex items-center justify-center">
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-full bg-[#121212]/20 animate-ping" />
              <div className="relative h-9 w-9 rounded-full bg-[#121212] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
