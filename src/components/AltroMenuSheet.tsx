"use client";

import React, { useState } from "react";
import { X, ArrowLeftRight, Tag, Download, Settings, ChevronRight, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface AltroMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AltroMenuSheet({ isOpen, onClose }: AltroMenuSheetProps) {
  const { cards, addTransaction } = useApp();
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState("50");

  if (!isOpen) return null;

  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferAmount) || 0;
    if (amt > 0) {
      // Transfer: deduct from card 1, add to card 2
      addTransaction({
        title: "Trasferimento a Revolut",
        category: "Altro",
        amount: amt,
        type: "expense",
        cardId: "card-zero",
      });
      addTransaction({
        title: "Trasferimento da ZERO",
        category: "Altro",
        amount: amt,
        type: "income",
        cardId: "card-revolut",
      });
    }
    setShowTransfer(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-[#F8F8F5] rounded-t-[32px] sm:rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setShowTransfer(false);
              onClose();
            }}
            className="p-2 rounded-full bg-white border border-[#EBEBE5] text-[#121212] hover:bg-[#EBEBE5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-black text-[#121212] tracking-tight">
            Azioni Rapide & Strumenti
          </h2>
          <div className="w-8" />
        </div>

        {/* Transfer Modal View */}
        {showTransfer ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#73736E] uppercase tracking-wider">
              Trasferisci tra le tue carte
            </h3>

            <div className="p-4 rounded-2xl bg-white border border-[#EBEBE5] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#73736E] font-medium">Da Carta</p>
                <p className="text-xs font-extrabold text-[#121212]">ZERO Black (•••• 3377)</p>
              </div>
              <ArrowLeftRight className="h-4 w-4 text-[#73736E]" />
              <div>
                <p className="text-[10px] text-[#73736E] font-medium">A Carta</p>
                <p className="text-xs font-extrabold text-[#121212]">Revolut (•••• 8842)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#73736E] mb-1">
                Importo da trasferire (€)
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-base font-black text-[#121212] focus:outline-none focus:border-[#F5E050]"
              />
            </div>

            <button
              onClick={handleExecuteTransfer}
              className="w-full py-3.5 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Conferma Trasferimento</span>
            </button>
          </div>
        ) : (
          /* Main Menu Options */
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setShowTransfer(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] shadow-xs hover:border-[#121212] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F5E050]/20 text-[#121212] flex items-center justify-center font-bold">
                  <ArrowLeftRight className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212]">
                    Trasferimento tra carte
                  </h4>
                  <p className="text-[10px] text-[#73736E] font-medium">
                    Sposta fondi da ZERO a Revolut
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#A3A39E] group-hover:text-[#121212]" />
            </button>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] opacity-60 text-left">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] text-[#73736E] flex items-center justify-center font-bold">
                  <Tag className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212]">
                    Gestione categorie
                  </h4>
                  <p className="text-[10px] text-[#73736E] font-medium">
                    Personalizza i tag di spesa
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EBEBE5] text-[#73736E]">
                In arrivo
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] opacity-60 text-left">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] text-[#73736E] flex items-center justify-center font-bold">
                  <Download className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212]">
                    Esporta report CSV / PDF
                  </h4>
                  <p className="text-[10px] text-[#73736E] font-medium">
                    Scarica resoconto contabile
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EBEBE5] text-[#73736E]">
                In arrivo
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EBEBE5] opacity-60 text-left">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F8F8F5] text-[#73736E] flex items-center justify-center font-bold">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#121212]">
                    Impostazioni veloci
                  </h4>
                  <p className="text-[10px] text-[#73736E] font-medium">
                    Preferenze notifiche e valuta
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EBEBE5] text-[#73736E]">
                In arrivo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
