"use client";

import React, { useState } from "react";
import { X, Camera, Scan, CheckCircle2, Loader2, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptScanModal({ isOpen, onClose }: ReceiptScanModalProps) {
  const { addTransaction } = useApp();
  const [step, setStep] = useState<"camera" | "analyzing" | "confirm">("camera");

  // Extracted/editable fields
  const [title, setTitle] = useState("Esselunga Supermercato");
  const [amount, setAmount] = useState("34.50");
  const [category, setCategory] = useState("Cibo");

  if (!isOpen) return null;

  const handleStartScan = () => {
    setStep("analyzing");
    setTimeout(() => {
      setStep("confirm");
    }, 1800);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (numAmount > 0) {
      addTransaction({
        title,
        category,
        amount: numAmount,
        type: "expense",
        note: "Scansionato da scontrino OCR",
      });
    }
    // Reset state & close
    setStep("camera");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-[#F8F8F5] rounded-t-[32px] sm:rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setStep("camera");
              onClose();
            }}
            className="p-2 rounded-full bg-white border border-[#EBEBE5] text-[#121212] hover:bg-[#EBEBE5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-black text-[#121212] tracking-tight">
            Scasione Scontrino Smart
          </h2>
          <div className="w-8" />
        </div>

        {/* STEP 1: CAMERA VIEWFINDER SIMULATION */}
        {step === "camera" && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full h-56 rounded-[24px] bg-[#121212] flex flex-col items-center justify-center overflow-hidden border border-[#262626] p-4 text-white shadow-inner">
              {/* Animated Scan Line */}
              <div className="absolute inset-x-4 top-1/4 h-0.5 bg-[#F5E050] shadow-[0_0_15px_#F5E050] animate-pulse" />

              {/* Target Box Overlay */}
              <div className="w-48 h-36 border-2 border-dashed border-[#F5E050]/80 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
                <Scan className="h-8 w-8 text-[#F5E050] mb-2 animate-bounce" />
                <p className="text-[11px] text-[#A3A39E] font-medium leading-tight">
                  Inquadra lo scontrino all&apos;interno del riquadro
                </p>
              </div>
            </div>

            <button
              onClick={handleStartScan}
              className="w-full py-3.5 rounded-full bg-[#F5E050] text-[#121212] font-black text-sm shadow-md hover:bg-[#EAD900] transition-all flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5 stroke-[2.5]" />
              <span>Scatta & Analizza</span>
            </button>
          </div>
        )}

        {/* STEP 2: ANALYZING ANIMATION */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-16 w-16 rounded-full bg-[#121212] text-[#F5E050] flex items-center justify-center shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#121212]">
                Analisi scontrino in corso...
              </h3>
              <p className="text-xs text-[#73736E] mt-0.5">
                Estraggo totale, esercente e categoria
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM EXTRACTED DATA */}
        {step === "confirm" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Scontrino analizzato con successo!</span>
            </div>

            <div className="rounded-2xl bg-white border border-[#EBEBE5] p-4 flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#73736E] uppercase tracking-wider mb-1">
                  Esercente
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#73736E]" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs font-bold text-[#121212] focus:outline-none bg-transparent border-b border-gray-200 pb-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#73736E] uppercase tracking-wider mb-1">
                    Importo Totale (€)
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-base font-black text-[#121212] focus:outline-none bg-transparent border-b border-gray-200 pb-1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#73736E] uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-bold text-[#121212] focus:outline-none bg-transparent border-b border-gray-200 pb-1"
                  >
                    <option value="Cibo">Cibo</option>
                    <option value="Casa">Casa</option>
                    <option value="Trasporti">Trasporti</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Svago">Svago</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all"
            >
              Salva spesa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
