"use client";

import React, { useState } from "react";
import { Plus, CreditCard, Check, Trash2, X, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DesktopCarte() {
  const { cards, activeCardIndex, setActiveCardIndex, addCard, deleteCard } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for new card
  const [bankName, setBankName] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("12/28");
  const [balance, setBalance] = useState("500");
  const [type, setType] = useState<"zero" | "revolut" | "mastercard">("zero");

  const money = (val: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(val);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(balance.replace(",", ".")) || 0;
    if (bankName.trim()) {
      addCard({
        bankName,
        name: name.trim() || "Giada Morena",
        number,
        expiry,
        balance: balNum,
        type,
      });
      setBankName("");
      setName("");
      setNumber("");
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#121212] tracking-tight">
            Le tue Carte & Conti Bancari
          </h2>
          <p className="text-xs text-[#73736E] font-medium mt-0.5">
            Gestisci le tue carte di credito, debito e conti correnti
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-bold shadow-md hover:bg-black transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Aggiungi Carta</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const isSelected = activeCardIndex === idx;
          return (
            <div
              key={card.id}
              className={`p-6 rounded-[32px] border transition-all duration-300 relative flex flex-col justify-between min-h-[220px] shadow-sm ${
                card.type === "zero"
                  ? "bg-[#121212] text-white border-[#121212]"
                  : card.type === "revolut"
                  ? "bg-white text-[#121212] border-[#EBEBE5]"
                  : "bg-[#1E1E1E] text-white border-[#1E1E1E]"
              } ${isSelected ? "ring-4 ring-[#F5E050]/60 scale-[1.01]" : ""}`}
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 opacity-80" />
                  <span className="text-sm font-extrabold tracking-wider">{card.bankName}</span>
                </div>
                {isSelected ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#F5E050] text-[#121212] flex items-center gap-1">
                    <Check className="h-3 w-3 stroke-[3]" /> Attiva
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveCardIndex(idx)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F8F8F5] text-[#121212] border border-[#EBEBE5] hover:bg-[#FEF9C3]"
                  >
                    Imposta Principale
                  </button>
                )}
              </div>

              {/* Balance */}
              <div className="my-4">
                <p className="text-[11px] opacity-70 font-semibold uppercase tracking-wider">Saldo Disponibile</p>
                <p className="text-3xl font-black tracking-tight mt-0.5">{money(card.balance)}</p>
              </div>

              {/* Footer details */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono opacity-80">
                <div>
                  <p className="text-[9px] font-sans opacity-60">TITOLARE</p>
                  <p className="font-sans font-bold">{card.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-sans opacity-60">NUMERO CARTA</p>
                  <p>{card.number}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#121212]">Aggiungi Nuova Carta / Conto</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full bg-[#F8F8F5]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#73736E] mb-1">Nome Banca / Circuito</label>
                <input
                  type="text"
                  placeholder="Es. Intesa Sanpaolo, N26, Fineco..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#73736E] mb-1">Ultime 4 Cifre</label>
                  <input
                    type="text"
                    placeholder="4499"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#73736E] mb-1">Saldo Iniziale (€)</label>
                  <input
                    type="text"
                    placeholder="500"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F8F8F5] border border-[#EBEBE5] text-xs font-bold text-[#121212] focus:outline-none focus:border-[#F5E050]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#121212] text-white font-black text-sm shadow-xl hover:bg-black transition-all"
              >
                Salva Carta nel Wallet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
