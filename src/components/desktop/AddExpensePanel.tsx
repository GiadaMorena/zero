"use client";

import React, { useState } from "react";
import { X, Plus, ChevronRight } from "lucide-react";

interface AddExpensePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: string; desc: string; cat: string }) => void;
}

const CATS = ["Cibo", "Trasporti", "Shopping", "Casa", "Sport", "Salute", "Abbonamenti", "Svago", "Altro"];

export function AddExpensePanel({ isOpen, onClose, onSave }: AddExpensePanelProps) {
  const [amount, setAmount] = useState("");
  const [desc,   setDesc]   = useState("");
  const [cat,    setCat]    = useState("Cibo");
  const [type,   setType]   = useState<"uscita" | "entrata">("uscita");

  const handleSave = () => {
    if (!amount) return;
    onSave({ amount, desc: desc || cat, cat });
    setAmount(""); setDesc(""); setCat("Cibo");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-[#111111] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-bold text-white">Nuovo movimento</h2>
            <p className="text-[11px] text-[#555550] mt-0.5">Registra una spesa o un'entrata</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-[#555550] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
            {(["uscita", "entrata"] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-[12px] font-semibold transition-all capitalize ${
                  type === t
                    ? t === "uscita"
                      ? "bg-white/10 text-white"
                      : "bg-[#F5E050]/10 text-[#F5E050]"
                    : "text-[#555550] hover:text-white"
                }`}
              >{t}</button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-semibold text-[#555550] uppercase tracking-wider mb-2">Importo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-extrabold text-[#555550]">€</span>
              <input
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[24px] font-extrabold text-white placeholder:text-[#333330] focus:outline-none focus:border-[#F5E050]/40 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold text-[#555550] uppercase tracking-wider mb-2">Descrizione</label>
            <input
              type="text"
              placeholder="Es. Supermercato, Benzina..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[13px] text-white placeholder:text-[#444440] focus:outline-none focus:border-[#F5E050]/40 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-[#555550] uppercase tracking-wider mb-2">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    cat === c
                      ? "bg-[#F5E050]/[0.12] text-[#F5E050] border border-[#F5E050]/30"
                      : "bg-white/[0.04] border border-white/[0.06] text-[#777772] hover:text-white hover:bg-white/[0.07]"
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Quick amounts */}
          <div>
            <label className="block text-[10px] font-semibold text-[#555550] uppercase tracking-wider mb-2">Rapidi</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] font-semibold text-[#777772] hover:text-white hover:bg-white/[0.07] transition-all"
                >€{v}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-[13px] font-semibold text-[#777772] hover:text-white hover:bg-white/[0.07] transition-all"
          >Annulla</button>
          <button
            onClick={handleSave}
            disabled={!amount}
            className="flex-1 py-3 rounded-xl bg-[#F5E050] text-[#0A0A0A] text-[13px] font-bold hover:bg-[#EAD900] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F5E050]/10"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Salva
          </button>
        </div>
      </div>
    </>
  );
}
