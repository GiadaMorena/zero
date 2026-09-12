import React from "react";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-[640px] h-full flex flex-col justify-between p-6 bg-[#F8F8F5] overflow-hidden">
      {/* Liquid Yellow Glow Background */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#F5E050]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-[#FDE047]/30 blur-3xl pointer-events-none" />

      {/* Top Header Label */}
      <div className="pt-4 z-10">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#73736E] uppercase">
          FINANCE A BRIGHTER TOMORROW
        </p>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
        {/* Large 3D Gold Z Logo Badge */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#F5E050] to-[#EAB308] rounded-[40px] blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
          <div className="relative w-32 h-32 rounded-[36px] bg-[#121212] border-2 border-[#F5E050]/30 shadow-2xl flex items-center justify-center">
            <span className="text-7xl font-black tracking-tighter bg-gradient-to-b from-[#FEF08A] via-[#F5E050] to-[#CA8A04] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Z
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[#121212] mb-3">
          Zero
        </h1>
        <p className="text-lg text-[#73736E] font-medium max-w-[240px]">
          Le tue finanze, senza caos.
        </p>
      </div>

      {/* Bottom Start Action Button */}
      <div className="pb-6 z-10 flex items-center gap-4">
        <button
          onClick={onStart}
          className="group relative flex-1 flex items-center justify-between pl-6 pr-3 py-4 bg-[#121212] text-white rounded-full font-bold shadow-lg hover:bg-black transition-all duration-300"
        >
          <span className="text-base font-semibold">Inizia</span>
          <div className="h-10 w-10 rounded-full bg-white text-[#121212] flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>
      </div>
    </div>
  );
}
