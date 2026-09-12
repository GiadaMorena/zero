import React, { useState } from "react";
import { Smartphone, LayoutGrid, Monitor, Wifi, Battery, Signal } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  allScreensGrid?: React.ReactNode;
}

export function MobileFrame({ children, activeScreenTitle = "Zero", allScreensGrid }: MobileFrameProps) {
  const [viewMode, setViewMode] = useState<"phone" | "full" | "grid">("phone");

  return (
    <div className="min-h-screen bg-[#EFEFEB] flex flex-col items-center justify-start py-6 px-4 font-sans antialiased selection:bg-[#F5E050]/50">
      {/* Top Floating Control Bar */}
      <div className="mb-6 z-40 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#EBEBE5] shadow-lg flex items-center gap-2">
        <span className="text-xs font-extrabold text-[#121212] pr-2 border-r border-[#EBEBE5]">
          Zero App
        </span>
        
        <button
          onClick={() => setViewMode("phone")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === "phone"
              ? "bg-[#121212] text-white shadow-sm"
              : "text-[#73736E] hover:text-[#121212] hover:bg-[#F8F8F5]"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>iPhone Frame</span>
        </button>

        <button
          onClick={() => setViewMode("full")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === "full"
              ? "bg-[#121212] text-white shadow-sm"
              : "text-[#73736E] hover:text-[#121212] hover:bg-[#F8F8F5]"
          }`}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>Full App</span>
        </button>

        {allScreensGrid && (
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-[#F5E050] text-[#121212] shadow-sm"
                : "text-[#73736E] hover:text-[#121212] hover:bg-[#F8F8F5]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Tutti gli schermi (Mockup)</span>
          </button>
        )}
      </div>

      {/* Mode 1: Phone Frame Container */}
      {viewMode === "phone" && (
        <div className="relative w-full max-w-[390px] h-[844px] bg-[#F8F8F5] rounded-[52px] border-[10px] border-[#121212] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-all duration-300">
          {/* iOS Status Bar */}
          <div className="bg-[#F8F8F5] text-[#121212] px-7 pt-3 pb-1 flex items-center justify-between z-40 select-none">
            <span className="text-[13px] font-extrabold tracking-tight">9:41</span>
            {/* Dynamic Island */}
            <div className="h-4 w-24 bg-black rounded-full shadow-inner flex items-center justify-end px-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-[#121212]">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            {children}
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="bg-white/80 backdrop-blur-md pt-1 pb-2 flex justify-center z-40 select-none">
            <div className="w-32 h-1 bg-[#121212] rounded-full" />
          </div>
        </div>
      )}

      {/* Mode 2: Full Responsive Container */}
      {viewMode === "full" && (
        <div className="w-full max-w-2xl bg-[#F8F8F5] rounded-[36px] border border-[#EBEBE5] shadow-xl overflow-hidden my-auto">
          {children}
        </div>
      )}

      {/* Mode 3: All Screens Mockup Grid View */}
      {viewMode === "grid" && allScreensGrid && (
        <div className="w-full max-w-7xl animate-in fade-in duration-300">
          {allScreensGrid}
        </div>
      )}
    </div>
  );
}
