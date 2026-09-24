"use client";

import React, { useState } from "react";
import { ArrowRight, CreditCard, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface AddCardScreenProps {
  userName: string;
  userEmail: string;
  onSkip: () => void;
  onAdd: () => void;
}

function CardInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
  autoFocus,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
        style={{ height: "52px" }}
      />
    </div>
  );
}

export function AddCardScreen({ userName, userEmail, onSkip, onAdd }: AddCardScreenProps) {
  const { initializeProfile } = useApp();

  const [bankName, setBankName] = useState("");
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = () => {
    if (!bankName.trim()) {
      setError("Inserisci il nome della banca");
      return;
    }
    if (!last4.trim() || last4.length < 4) {
      setError("Inserisci le ultime 4 cifre della carta");
      return;
    }
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      initializeProfile({
        name: userName,
        email: userEmail,
        card: {
          bankName: bankName.trim(),
          number: `•••• ${last4}`,
          expiry: expiry || "00/00",
          balance: parseFloat(balance) || 0,
        },
      });
      setIsLoading(false);
      onAdd();
    }, 400);
  };

  const handleSkip = () => {
    initializeProfile({ name: userName, email: userEmail });
    onSkip();
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#F7F7F5] flex flex-col select-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="h-8 w-8" /> {/* spacer */}
        <button
          onClick={handleSkip}
          className="h-8 w-8 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors"
          aria-label="Salta"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 gap-8 overflow-y-auto">
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-3xl bg-[#0B0B0B] flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-[#FDC909]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B] leading-tight">
              Aggiungi la tua prima carta
            </h1>
            <p className="text-xs text-[#A7A7A7] font-semibold mt-2 max-w-xs mx-auto leading-relaxed">
              Puoi aggiungerne altre in seguito. Non memorizzano dati bancari reali.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <CardInput
            label="Banca / Istituto"
            placeholder="Es: Revolut, Intesa, Fineco..."
            value={bankName}
            onChange={(v) => { setError(""); setBankName(v); }}
            autoFocus
          />
          <CardInput
            label="Ultime 4 cifre"
            placeholder="1234"
            value={last4}
            onChange={(v) => { setError(""); setLast4(v.replace(/\D/g, "").slice(0, 4)); }}
            type="tel"
            maxLength={4}
          />
          <CardInput
            label="Scadenza (opzionale)"
            placeholder="MM/AA"
            value={expiry}
            onChange={(v) => {
              setError("");
              // Auto-format MM/AA
              const raw = v.replace(/\D/g, "").slice(0, 4);
              if (raw.length > 2) {
                setExpiry(raw.slice(0, 2) + "/" + raw.slice(2));
              } else {
                setExpiry(raw);
              }
            }}
            type="tel"
            maxLength={5}
          />
          <CardInput
            label="Saldo iniziale (opzionale)"
            placeholder="0,00"
            value={balance}
            onChange={(v) => { setError(""); setBalance(v); }}
            type="number"
          />

          {error && (
            <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center">
              {error}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
              {isLoading ? "Aggiungo..." : "Aggiungi carta"}
            </span>
          </button>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors text-center py-2 cursor-pointer"
          >
            Salta per ora →
          </button>
        </div>
      </div>
    </div>
  );
}
