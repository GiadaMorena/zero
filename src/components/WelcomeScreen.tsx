"use client";

import React, { useState } from "react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <div className="w-full min-h-[100dvh] flex justify-center bg-[#F7F7F5] overflow-hidden select-none">
      <main className="relative w-full max-w-[430px] h-[100dvh] min-h-[700px] overflow-hidden bg-[#F7F7F5]">
        
        {/* Background Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle at 35% 50%, rgba(253, 201, 9, 0.12), transparent 25%)",
          }}
        />

        {/* LOGO ALTO */}
        <div className="absolute top-[46px] left-[43px] z-20 text-[50px] font-light tracking-[-4px] text-[#0B0B0B] leading-none">
          ZERO<span className="text-[#FDC909] text-[22px] relative -left-[4px] -top-[1px]">.</span>
        </div>

        {/* CARTA ZERO */}
        <div
          className="absolute w-[315px] h-[198px] left-[22px] top-[170px] z-10 rounded-[22px] border-2 border-[#FDC909] transform -rotate-10 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #171717 0%, #080808 65%, #111 100%)",
            boxShadow: "0 30px 45px rgba(0, 0, 0, 0.20), 0 8px 15px rgba(0, 0, 0, 0.10)",
          }}
        >
          {/* Watermark 0 */}
          <div className="absolute right-[13px] -top-[25px] text-[240px] leading-none font-bold text-white/5 select-none pointer-events-none">
            0
          </div>

          <div className="absolute top-[22px] left-[25px] text-[#FDC909] text-[22px] font-normal z-10 tracking-wider">
            ZERO
          </div>

          {/* Chip */}
          <div
            className="absolute left-[27px] bottom-[58px] w-[42px] h-[31px] rounded-[7px] z-10 overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #ddd, #aaa)",
              boxShadow: "inset 0 0 0 1px #777",
            }}
          >
            <div className="absolute w-full h-[10px] top-[9px] left-0 border-t border-b border-[#777]" />
            <div className="absolute w-[10px] h-full top-0 left-[15px] border-l border-r border-[#777]" />
          </div>

          <div className="absolute left-[28px] bottom-[23px] text-[#ddd] tracking-[4px] text-[13px] z-10 font-mono">
            •••• •••• <strong className="text-white text-[17px] tracking-[2px] font-mono font-bold">3377</strong>
          </div>

          <div className="absolute right-[25px] bottom-[23px] text-[#bbb] text-[13px] z-10 font-mono">
            09/29
          </div>
        </div>

        {/* SMARTPHONE ZERO */}
        <div
          className="absolute w-[285px] h-[560px] -right-[35px] top-[270px] z-5 rounded-[43px] bg-[#0a0a0a] transform rotate-9 p-[7px]"
          style={{
            boxShadow: "-15px 25px 40px rgba(0,0,0,0.18)",
          }}
        >
          <div className="w-full h-full rounded-[37px] bg-[#fafaf8] overflow-hidden relative">
            
            {/* Dynamic Island */}
            <div className="absolute w-[92px] h-[25px] top-[13px] left-1/2 -translate-x-1/2 rounded-[20px] bg-[#050505] z-10" />

            {/* Phone Content (counter rotated -9deg) */}
            <div className="pt-[60px] px-[23px] pb-[20px] transform -rotate-9 w-[112%] -ml-[6%] flex flex-col gap-3">
              
              <div className="text-[27px] tracking-[-2px] mb-2 font-light text-[#0B0B0B]">
                ZERO<span className="text-[#FDC909]">.</span>
              </div>

              {/* Balance Card */}
              <div className="bg-white rounded-[19px] p-[22px_20px] shadow-[0_5px_18px_rgba(0,0,0,0.05)]">
                <div className="text-[12px] text-[#777] mb-2 font-medium">
                  Saldo disponibile
                </div>
                <div className="text-[30px] font-bold tracking-[-1.5px] mb-6 text-[#0B0B0B]">
                  € 1.245,80
                </div>

                {/* Chart */}
                <div className="flex items-end justify-between h-[55px] gap-1">
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#ededeb] h-[25px]" />
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#ededeb] h-[34px]" />
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#ededeb] h-[43px]" />
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#ededeb] h-[30px]" />
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#FDC909] h-[52px]" />
                  <div className="w-[16px] rounded-[8px_8px_4px_4px] bg-[#ededeb] h-[38px]" />
                </div>
              </div>

              {/* Shortcuts */}
              <div className="grid grid-cols-3 gap-[10px] mt-1">
                <div className="bg-white rounded-[15px] p-[16px_5px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[38px] h-[38px] mx-auto mb-2 rounded-[12px] bg-[#0B0B0B] text-white flex items-center justify-center text-[20px]">
                    →
                  </div>
                  Spese
                </div>

                <div className="bg-white rounded-[15px] p-[16px_5px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[38px] h-[38px] mx-auto mb-2 rounded-[12px] bg-[#f4f4f2] text-[#0B0B0B] flex items-center justify-center text-[20px]">
                    ▣
                  </div>
                  Abbonamenti
                </div>

                <div className="bg-white rounded-[15px] p-[16px_5px] text-center text-[10px] font-bold text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="w-[38px] h-[38px] mx-auto mb-2 rounded-[12px] bg-[#f4f4f2] text-[#0B0B0B] flex items-center justify-center text-[20px]">
                    ◎
                  </div>
                  Obiettivi
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="mt-1 bg-white rounded-[18px] p-[17px] shadow-[0_4px_15px_rgba(0,0,0,0.04)]">
                <div className="text-[13px] font-bold mb-3 text-[#0B0B0B]">
                  Spese recenti
                </div>

                <div className="flex items-center py-[9px] border-b border-[#eee]">
                  <div className="w-[28px] h-[28px] rounded-full bg-[#f1f1ef] flex items-center justify-center mr-[9px] text-[11px] text-[#0B0B0B]">
                    ●
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-[#0B0B0B]">Spotify</div>
                    <div className="text-[8px] text-[#999]">Abbonamenti</div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#0B0B0B]">- € 3,49</div>
                </div>

                <div className="flex items-center py-[9px]">
                  <div className="w-[28px] h-[28px] rounded-full bg-[#f1f1ef] flex items-center justify-center mr-[9px] text-[11px] text-[#0B0B0B]">
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
        </div>

        {/* LOGO ZERO BASSO */}
        <div className="absolute left-[38px] bottom-[195px] z-20">
          <div className="w-[33px] h-[6px] rounded-[10px] bg-[#FDC909] mb-[32px]" />
          <div className="text-[57px] font-light tracking-[-5px] text-[#0B0B0B] leading-none">
            ZERO<span className="text-[#FDC909] text-[25px] relative -left-[4px] -top-[2px]">.</span>
          </div>
        </div>

        {/* CTA "Inizia ora" */}
        <button
          onClick={onStart}
          className="absolute left-[26px] right-[26px] bottom-[105px] h-[72px] rounded-[38px] bg-[#0B0B0B] text-white flex items-center justify-center text-[19px] font-semibold z-30 shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-black active:scale-[0.98] transition-all group"
        >
          <div className="absolute left-[7px] w-[58px] h-[58px] rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center text-[27px] group-hover:scale-105 transition-transform">
            →
          </div>
          Inizia ora
        </button>

        {/* PAGINATION */}
        <div className="absolute bottom-[73px] left-1/2 -translate-x-1/2 flex gap-[9px] z-30">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveDot(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                idx === activeDot
                  ? "w-[29px] h-[7px] rounded-[10px] bg-[#0B0B0B]"
                  : "w-[7px] h-[7px] rounded-full bg-[#c8c8c8]"
              }`}
            />
          ))}
        </div>

        {/* HOME INDICATOR */}
        <div className="absolute bottom-[17px] left-1/2 -translate-x-1/2 w-[135px] h-[5px] rounded-[10px] bg-[#0B0B0B] z-40" />

      </main>
    </div>
  );
}
