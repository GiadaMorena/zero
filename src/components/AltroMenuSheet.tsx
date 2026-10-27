"use client";

import { useState } from "react";
import { ArrowLeftRight, Tag, X, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TransferModal } from "./TransferModal";

interface AltroMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function AltroMenuSheet({ isOpen, ...props }: AltroMenuSheetProps) {
  return isOpen ? <OptionsMenu {...props} /> : null;
}

function OptionsMenu({ onClose, onNavigate }: Omit<AltroMenuSheetProps, "isOpen">) {
  const { protections } = useApp();
  const [showTransfer, setShowTransfer] = useState(false);
  const activeProtectionsCount = protections.filter(item => item.active).length;

  if (showTransfer) return <TransferModal isOpen onClose={onClose} />;

  return <div className="zero-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0B0B0B]/60 p-0 backdrop-blur-xs sm:items-center sm:p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="other-options-title" className="zero-panel w-full max-w-md rounded-t-[32px] border border-[#A7A7A7]/20 bg-[#F7F7F5] p-6 shadow-2xl sm:rounded-[32px]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Chiudi altre opzioni" onClick={onClose} className="rounded-full border border-[#A7A7A7]/20 bg-white p-2 text-[#0B0B0B]"><X className="h-4 w-4" /></button>
        <h2 id="other-options-title" className="text-sm font-black text-[#0B0B0B]">Altre opzioni</h2>
        <div className="w-8" />
      </div>
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={() => { onClose(); onNavigate?.("assicurazioni"); }} className="flex items-center gap-3 rounded-2xl border border-[#A7A7A7]/20 bg-white p-4 text-left transition-colors hover:border-[#0B0B0B]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B0B0B] text-[#FDC909]"><ShieldCheck className="h-4.5 w-4.5" /></span>
          <span><span className="flex flex-wrap items-center gap-2"><span className="text-xs font-extrabold text-[#0B0B0B]">Assicurazioni, Pensione &amp; PAC</span>{activeProtectionsCount > 0 && <span className="rounded-full bg-[#FDC909] px-2 py-0.5 text-[9px] font-bold text-[#0B0B0B]">{activeProtectionsCount} attive</span>}</span><span className="mt-0.5 block text-[10px] font-medium text-[#777]">Monitora polizze, fondi e PAC</span></span>
        </button>
        <button type="button" onClick={() => setShowTransfer(true)} className="flex items-center gap-3 rounded-2xl border border-[#A7A7A7]/20 bg-white p-4 text-left transition-colors hover:border-[#0B0B0B]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDC909] text-[#0B0B0B]"><ArrowLeftRight className="h-4.5 w-4.5" /></span>
          <span><span className="block text-xs font-extrabold text-[#0B0B0B]">Trasferimento tra carte</span><span className="mt-0.5 block text-[10px] font-medium text-[#777]">Registra un giroconto senza modificare spese o entrate</span></span>
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-[#A7A7A7]/20 bg-white p-4 text-left opacity-60">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#A7A7A7]/20 bg-[#F7F7F5] text-[#777]"><Tag className="h-4.5 w-4.5" /></span>
          <span className="flex-1"><span className="block text-xs font-extrabold text-[#0B0B0B]">Gestione categorie</span><span className="block text-[10px] text-[#777]">Personalizza i tag di spesa</span></span>
          <span className="rounded-full bg-[#A7A7A7]/10 px-2 py-0.5 text-[9px] font-bold text-[#777]">In arrivo</span>
        </div>
      </div>
    </div>
  </div>;
}
