"use client";

import React, { useState } from "react";
import Image from "next/image";
import SfondoApp from "@/assets/sfondo-app.jpg";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F7F7F5] flex justify-center items-center overflow-hidden select-none z-50">
      
      {/* Art-Directed 430 x 932 Viewport Container */}
      <main className="relative w-full max-w-[430px] h-[100dvh] max-h-[932px] overflow-hidden bg-[#F7F7F5] flex-shrink-0 flex flex-col justify-between">
        
        {/* Background Image: sfondo-app.jpg */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <Image
            src={SfondoApp}
            alt="ZERO Initial Screen Background"
            fill
            className="object-cover object-top pointer-events-none"
            priority
          />
        </div>

        {/* Overlay Layer: Interactive UI Controls */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end pointer-events-none">
          
          {/* Bottom Interactive UI Controls */}
          <div className="w-full px-[25px] pb-[16px] flex flex-col items-center gap-[18px] pointer-events-auto">
            
            {/* CTA "Inizia ora" Button */}
            <button
              onClick={onStart}
              className="w-full h-[72px] rounded-[40px] bg-[#0B0B0B] text-white flex items-center justify-center text-[19px] font-bold shadow-[0_12px_35px_rgba(0,0,0,0.18)] cursor-pointer hover:bg-black active:scale-[0.98] transition-all group relative"
            >
              <div className="absolute left-[7px] w-[58px] h-[58px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center text-[27px] font-extrabold shadow-md group-hover:scale-105 transition-transform">
                →
              </div>
              <span className="flex-1 text-center pr-6 tracking-wide text-[#F7F7F5] font-extrabold">
                Inizia ora
              </span>
            </button>

            {/* Pagination Indicators */}
            <div className="flex items-center justify-center gap-[9px]">
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

            {/* Home Indicator Bar */}
            <div className="w-[135px] h-[5px] rounded-[10px] bg-[#0B0B0B] mt-0.5" />

          </div>
        </div>

      </main>
    </div>
  );
}
