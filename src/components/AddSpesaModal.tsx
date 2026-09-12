import React, { useState } from "react";
import { X, Home, Utensils, Fuel, ShoppingBag, Smile, Heart, RefreshCw, MoreHorizontal, Calendar } from "lucide-react";

interface AddSpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function AddSpesaModal({ isOpen, onClose, onSave }: AddSpesaModalProps) {
  const [mode, setMode] = useState<"Manuale" | "Da scontrino">("Manuale");
  const [amount, setAmount] = useState<string>("0,00");
  const [selectedCategory, setSelectedCategory] = useState<string>("Cibo");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("12 set 2026");

  if (!isOpen) return null;

  const categories = [
    { name: "Casa", icon: Home },
    { name: "Cibo", icon: Utensils },
    { name: "Trasporti", icon: Fuel },
    { name: "Shopping", icon: ShoppingBag },
    { name: "Svago", icon: Smile },
    { name: "Salute", icon: Heart },
    { name: "Abbonamenti", icon: RefreshCw },
    { name: "Altro", icon: MoreHorizontal },
  ];

  const handleKeyClick = (val: string) => {
    if (val === "DEL") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0,00"));
      return;
    }
    if (amount === "0,00" || amount === "0") {
      setAmount(val);
    } else {
      setAmount((prev) => prev + val);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({ amount, category: selectedCategory, note, date });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#F8F8F5] rounded-t-[32px] sm:rounded-[32px] border border-[#EBEBE5] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#EBEBE5] text-[#121212] hover:bg-[#EBEBE5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-extrabold text-[#121212]">
              Aggiungi spesa
            </h2>
            <p className="text-[10px] text-[#73736E]">Meno caos.</p>
          </div>
          <div className="w-8" />
        </div>

        {/* Mode Toggle (Manuale / Da scontrino) */}
        <div className="grid grid-cols-2 gap-2 bg-[#EBEBE5]/60 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setMode("Manuale")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "Manuale"
                ? "bg-[#F5E050] text-[#121212] shadow-sm"
                : "text-[#73736E]"
            }`}
          >
            Manuale
          </button>
          <button
            type="button"
            onClick={() => setMode("Da scontrino")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "Da scontrino"
                ? "bg-[#F5E050] text-[#121212] shadow-sm"
                : "text-[#73736E]"
            }`}
          >
            Da scontrino
          </button>
        </div>

        {/* Big Amount Display */}
        <div className="text-center my-4 py-4 rounded-2xl bg-white border border-[#EBEBE5]">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#121212]">
            € {amount}
          </span>
        </div>

        {/* Category Grid Selection */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-[#73736E] mb-2">
            Categoria
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-[#F5E050] border-[#F5E050] text-[#121212] font-bold shadow-sm scale-105"
                      : "bg-white border-[#EBEBE5] text-[#73736E] hover:border-[#F5E050]"
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Field */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#73736E] mb-1">
            Data
          </label>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs font-semibold text-[#121212]">
            <span>{date}</span>
            <Calendar className="h-4 w-4 text-[#73736E]" />
          </div>
        </div>

        {/* Note Field */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#73736E] mb-1">
            Nota (opzionale)
          </label>
          <input
            type="text"
            placeholder="Aggiungi una nota..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-[#EBEBE5] text-xs text-[#121212] focus:outline-none focus:border-[#F5E050]"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-full bg-[#121212] text-white font-extrabold text-sm shadow-xl hover:bg-black transition-all active:scale-[0.98]"
        >
          Salva
        </button>
      </div>
    </div>
  );
}
