"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Tag, X, Check, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface AltroMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function AltroMenuSheet({ isOpen, onClose, onNavigate }: AltroMenuSheetProps) {
  const { cards, addTransaction, protections } = useApp();
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || cards.length < 2) return;

    // Deduct from card 0
    addTransaction({
      title: `Giroconto verso ${cards[1].bankName}`,
      category: "Altro",
      amount: -amt,
      type: "expense",
      cardId: cards[0].id,
    });

    // Add to card 1
    addTransaction({
      title: `Giroconto da ${cards[0].bankName}`,
      category: "Altro",
      amount: amt,
      type: "income",
      cardId: cards[1].id,
    });

    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setShowTransfer(false);
      setTransferAmount("");
      onClose();
    }, 1500);
  };

  const hasMultipleCards = cards.length >= 2;
  const activeProtectionsCount = protections.filter((p) => p.active).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-xs p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/20 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (showTransfer) setShowTransfer(false);
              else onClose();
            }}
            className="p-2 rounded-full bg-white border border-[#A7A7A7]/20 text-[#0B0B0B] hover:bg-[#F7F7F5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-black text-[#0B0B0B]">
            {showTransfer ? "Giroconto" : "Altre opzioni"}
          </h2>
          <div className="w-8" />
        </div>

        {/* Transfer Modal View */}
        {showTransfer ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#A7A7A7] uppercase tracking-wider">
              Trasferisci tra le tue carte
            </h3>

            {!hasMultipleCards ? (
              <div className="p-4 rounded-2xl bg-white border border-[#A7A7A7]/20 text-center py-6">
                <p className="text-xs font-bold text-[#0B0B0B]">Carte insufficienti</p>
                <p className="text-[11px] text-[#A7A7A7] mt-1">
                  Aggiungi almeno due carte nella sezione Carte per poter trasferire fondi tra di esse.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-white border border-[#A7A7A7]/20 flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] text-[#A7A7A7] font-semibold">Da Carta</p>
                    <p className="text-xs font-extrabold text-[#0B0B0B]">
                      {cards[0].bankName} ({cards[0].number})
                    </p>
                  </div>
                  <ArrowLeftRight className="h-4 w-4 text-[#A7A7A7]" />
                  <div>
                    <p className="text-[10px] text-[#A7A7A7] font-semibold">A Carta</p>
                    <p className="text-xs font-extrabold text-[#0B0B0B]">
                      {cards[1].bankName} ({cards[1].number})
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
                    Importo da trasferire (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white border border-[#A7A7A7]/30 text-base font-black text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
                  />
                </div>

                <button
                  onClick={handleExecuteTransfer}
                  disabled={transferSuccess}
                  className="w-full py-3.5 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm shadow-md hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{transferSuccess ? "Trasferito con successo!" : "Conferma trasferimento"}</span>
                </button>
              </>
            )}
          </div>
        ) : (
          /* Main Menu Options */
          <div className="flex flex-col gap-2.5">
            {/* Option 1: Assicurazioni, Pensione & PAC */}
            <button
              onClick={() => {
                onClose();
                onNavigate?.("assicurazioni");
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#A7A7A7]/20 shadow-xs hover:border-[#0B0B0B] transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#0B0B0B] text-[#FDC909] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-[#0B0B0B]">
                      Assicurazioni, Pensione & PAC
                    </h4>
                    {activeProtectionsCount > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FDC909] text-[#0B0B0B]">
                        {activeProtectionsCount} attive
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#A7A7A7] font-medium mt-0.5">
                    Monitora polizze, fondi e PAC (senza intaccare i totali)
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Trasferimento tra carte */}
            <button
              onClick={() => setShowTransfer(true)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#A7A7A7]/20 shadow-xs hover:border-[#0B0B0B] transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center font-bold">
                  <ArrowLeftRight className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B0B0B]">
                    Trasferimento tra carte
                  </h4>
                  <p className="text-[10px] text-[#A7A7A7] font-medium">
                    Sposta fondi istantaneamente tra le tue carte
                  </p>
                </div>
              </div>
            </button>

            {/* Option 3: Gestione categorie */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#A7A7A7]/20 opacity-60 text-left">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F7F7F5] text-[#A7A7A7] flex items-center justify-center font-bold border border-[#A7A7A7]/20">
                  <Tag className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#0B0B0B]">
                    Gestione categorie
                  </h4>
                  <p className="text-[10px] text-[#A7A7A7] font-medium">
                    Personalizza i tag di spesa
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#A7A7A7]/10 text-[#A7A7A7]">
                In arrivo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
