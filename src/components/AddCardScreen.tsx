"use client";

import React, { useState } from "react";
import { ArrowRight, CreditCard, X, Loader2 } from "lucide-react";
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
  enterKeyHint,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
  enterKeyHint?: "done" | "go" | "next" | "search" | "send";
  required?: boolean;
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
        enterKeyHint={enterKeyHint}
        required={required}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      setError("Inserisci il nome della banca o istituto");
      return;
    }
    if (!last4.trim() || last4.length < 4) {
      setError("Inserisci le ultime 4 cifre della carta");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await initializeProfile({
        name: userName,
        email: userEmail,
        card: {
          bankName: bankName.trim(),
          number: `•••• ${last4.trim()}`,
          expiry: expiry.trim() || "00/00",
          balance: parseFloat(balance.replace(",", ".")) || 0,
        },
      });
      onAdd();
    } catch (err) {
      console.error(err);
      onAdd();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await initializeProfile({ name: userName, email: userEmail });
    } finally {
      onSkip();
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#F7F7F5] flex flex-col select-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 24px)",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="h-8 w-8" /> {/* spacer */}
        <button
          type="button"
          onClick={handleSkip}
          className="h-8 w-8 rounded-full bg-white border border-[#A7A7A7]/30 flex items-center justify-center text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors cursor-pointer"
          aria-label="Salta"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pt-2 pb-6 max-w-md mx-auto w-full justify-between gap-6"
      >
        <div className="flex flex-col gap-6">
          {/* Icon + Title */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-3xl bg-[#0B0B0B] flex items-center justify-center shadow-sm">
              <CreditCard className="h-7 w-7 text-[#FDC909]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B] leading-tight">
                Aggiungi la tua prima carta
              </h1>
              <p className="text-xs text-[#A7A7A7] font-semibold mt-1 max-w-xs mx-auto leading-relaxed">
                Puoi aggiungerne altre in seguito.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-3.5">
            <CardInput
              label="Banca / Istituto *"
              placeholder="Es: Revolut, Intesa, Fineco..."
              value={bankName}
              onChange={(v) => { setError(""); setBankName(v); }}
              autoFocus
              enterKeyHint="next"
              required
            />
            <CardInput
              label="Ultime 4 cifre *"
              placeholder="1234"
              value={last4}
              onChange={(v) => { setError(""); setLast4(v.replace(/\D/g, "").slice(0, 4)); }}
              type="tel"
              maxLength={4}
              enterKeyHint="next"
              required
            />
            <CardInput
              label="Scadenza (opzionale)"
              placeholder="MM/AA"
              value={expiry}
              onChange={(v) => {
                setError("");
                const raw = v.replace(/\D/g, "").slice(0, 4);
                if (raw.length > 2) {
                  setExpiry(raw.slice(0, 2) + "/" + raw.slice(2));
                } else {
                  setExpiry(raw);
                }
              }}
              type="tel"
              maxLength={5}
              enterKeyHint="next"
            />
            <CardInput
              label="Saldo iniziale (opzionale)"
              placeholder="0,00"
              value={balance}
              onChange={(v) => { setError(""); setBalance(v); }}
              type="number"
              enterKeyHint="done"
            />

            {error && (
              <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center animate-in fade-in">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer group shadow-md"
          >
            <div className="w-11 h-11 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              )}
            </div>
            <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
              {isLoading ? "Aggiunta in corso..." : "Aggiungi carta"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors text-center py-2 cursor-pointer"
          >
            Salta per ora →
          </button>
        </div>
      </form>
    </div>
  );
}
