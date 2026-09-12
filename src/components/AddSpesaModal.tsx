"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Home,
  Utensils,
  Fuel,
  ShoppingBag,
  Smile,
  Heart,
  RefreshCw,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  CreditCard,
  Briefcase,
  Gift,
  Award,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface AddSpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "expense" | "income";
}

export function AddSpesaModal({ isOpen, onClose, defaultType = "expense" }: AddSpesaModalProps) {
  const { addTransaction, cards, activeCard } = useApp();
  const [type, setType] = useState<"expense" | "income">(defaultType);
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");
  const [selectedCategory, setSelectedCategory] = useState<string>("Cibo");
  const [selectedCardId, setSelectedCardId] = useState<string>(activeCard?.id || "card-zero");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("Oggi");

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setTitle("");
      setAmount("0");
      setSelectedCategory(defaultType === "income" ? "Entrata" : "Cibo");
      setNote("");
      if (activeCard?.id) {
        setSelectedCardId(activeCard.id);
      }
    }
  }, [isOpen, defaultType, activeCard?.id]);

  if (!isOpen) return null;

  const expenseCategories = [
    { name: "Casa", icon: Home },
    { name: "Cibo", icon: Utensils },
    { name: "Trasporti", icon: Fuel },
    { name: "Shopping", icon: ShoppingBag },
    { name: "Svago", icon: Smile },
    { name: "Salute", icon: Heart },
    { name: "Abbonamenti", icon: RefreshCw },
    { name: "Altro", icon: MoreHorizontal },
  ];

  const incomeCategories = [
    { name: "Entrata", icon: DollarSign },
    { name: "Stipendio", icon: Briefcase },
    { name: "Rimborso", icon: TrendingUp },
    { name: "Regalo", icon: Gift },
    { name: "Bonus", icon: Award },
    { name: "Altro", icon: MoreHorizontal },
  ];

  const currentCategories = type === "expense" ? expenseCategories : incomeCategories;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(",", ".")) || 0;
    if (numAmount > 0) {
      addTransaction({
        title: title.trim() || (type === "expense" ? "Nuova Spesa" : "Nuova Entrata"),
        category: selectedCategory,
        amount: numAmount,
        type,
        note,
        date: date === "Oggi" ? "Oggi, " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : date,
        cardId: selectedCardId,
      });
    }
    setTitle("");
    setAmount("0");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0B0B]/60 backdrop-blur-md p-0 sm:p-4 select-none">
      <div className="w-full max-w-md bg-[#F7F7F5] rounded-t-[32px] sm:rounded-[32px] border border-[#A7A7A7]/30 p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] hover:bg-[#A7A7A7]/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black text-[#0B0B0B] tracking-tight">
              {type === "expense" ? "Aggiungi spesa" : "Nuova entrata"}
            </h2>
            <p className="text-[10px] text-[#A7A7A7] font-medium">
              {type === "expense" ? "Registra un'uscita nel tuo bilancio" : "Registra un accredito nel tuo bilancio"}
            </p>
          </div>
          <div className="w-8" />
        </div>

        {/* Type Toggle (Uscita / Entrata) */}
        <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl mb-4 border border-[#A7A7A7]/20">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setSelectedCategory("Cibo");
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === "expense"
                ? "bg-[#0B0B0B] text-white shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            − Uscita / Spesa
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setSelectedCategory("Entrata");
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === "income"
                ? "bg-[#FDC909] text-[#0B0B0B] font-black shadow-xs"
                : "text-[#A7A7A7] hover:text-[#0B0B0B]"
            }`}
          >
            + Nuova Entrata
          </button>
        </div>

        {/* Amount Input */}
        <div className="text-center my-3 py-3 rounded-2xl bg-white border border-[#A7A7A7]/30 flex flex-col items-center justify-center">
          <label className="text-[10px] font-bold text-[#A7A7A7] uppercase tracking-wider mb-1">
            Importo in Euro (€)
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black text-[#0B0B0B]">
              {type === "income" ? "+" : "-"}
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-40 text-center text-3xl font-black tracking-tight text-[#0B0B0B] focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
            Descrizione / Esercente
          </label>
          <input
            type="text"
            placeholder={type === "expense" ? "Es. Esselunga, Bar, Amazon..." : "Es. Stipendio, Rimborso, Transfer..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-bold text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
          />
        </div>

        {/* Card Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
            Carta / Conto Utilizzato
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 border transition-all ${
                  selectedCardId === card.id
                    ? "bg-[#0B0B0B] text-white border-[#0B0B0B]"
                    : "bg-white text-[#A7A7A7] border-[#A7A7A7]/30"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>{card.bankName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#A7A7A7] mb-2">
            Categoria
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {currentCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? type === "income"
                        ? "bg-[#FDC909] border-[#FDC909] text-[#0B0B0B] font-black shadow-xs scale-105"
                        : "bg-[#0B0B0B] border-[#0B0B0B] text-white font-bold shadow-xs scale-105"
                      : "bg-white border-[#A7A7A7]/30 text-[#A7A7A7] hover:border-[#0B0B0B]"
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Field */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-[#A7A7A7] mb-1">
            Nota (opzionale)
          </label>
          <input
            type="text"
            placeholder="Aggiungi una nota..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-[#A7A7A7]/30 text-xs font-medium text-[#0B0B0B] focus:outline-none focus:border-[#FDC909]"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-full font-black text-sm shadow-xl transition-all active:scale-[0.98] ${
            type === "income"
              ? "bg-[#FDC909] text-[#0B0B0B] hover:bg-[#FDC909]/90"
              : "bg-[#0B0B0B] text-white hover:bg-black"
          }`}
        >
          {type === "expense" ? "Salva Spesa" : "Salva Entrata"}
        </button>
      </div>
    </div>
  );
}
