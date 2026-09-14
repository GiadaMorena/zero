"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Delete } from "lucide-react";
import ZeroLogo from "@/assets/Zero-logo.png";
import Logo from "@/assets/logo.png";
import { useApp } from "@/context/AppContext";

interface PinLockScreenProps {
  onUnlock: () => void;
  onForgotPin: () => void;
}

export function PinLockScreen({ onUnlock, onForgotPin }: PinLockScreenProps) {
  const { profile, verifyPin } = useApp();
  const [pin, setPinState] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeDigit, setActiveDigit] = useState<string | null>(null);

  // Extract first name (default to Giada)
  const firstName = profile.name ? profile.name.split(" ")[0] : "Giada";

  // Handle keypress
  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6 || isSuccess) return;
    setErrorMsg("");
    setActiveDigit(digit);
    setTimeout(() => setActiveDigit(null), 150);

    const newPin = pin + digit;
    setPinState(newPin);

    // Auto-verify when 6th digit is reached
    if (newPin.length === 6) {
      checkCode(newPin);
    }
  };

  const handleDelete = () => {
    if (pin.length === 0 || isSuccess) return;
    setErrorMsg("");
    setPinState((prev) => prev.slice(0, -1));
  };

  const checkCode = async (codeToCheck: string) => {
    const isValid = await verifyPin(codeToCheck);
    if (isValid) {
      setIsSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 300);
    } else {
      setIsShaking(true);
      setErrorMsg("Codice non corretto");
      setTimeout(() => {
        setPinState("");
        setIsShaking(false);
      }, 400);
    }
  };

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, isSuccess]);

  return (
    <div
      className="min-h-[100dvh] bg-[#F7F7F5] flex flex-col justify-between items-center px-6 py-10 select-none w-full"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 20px) + 2rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 2rem)",
      }}
    >
      {/* ── Top Header & Branding ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 text-center mt-2 sm:mt-6">
        {/* Official ZERO Logo */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
          <Image
            src={ZeroLogo}
            alt="ZERO"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Greeting */}
        <div className="flex flex-col gap-1.5 max-w-sm">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0B0B]">
            Bentornata, {firstName}.
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#A7A7A7]">
            Inserisci il tuo codice per continuare.
          </p>
        </div>
      </div>

      {/* ── Center: 6 Circle Indicators & Error Message ───────────── */}
      <div className="flex flex-col items-center gap-4 my-auto py-6">
        <div
          className={`flex items-center justify-center gap-4 sm:gap-5 transition-transform ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          {Array.from({ length: 6 }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? "bg-[#FDC909] ring-4 ring-[#FDC909]/30 scale-110"
                    : isFilled
                    ? "bg-[#0B0B0B] ring-2 ring-[#0B0B0B] scale-110"
                    : "border-2 border-[#A7A7A7] bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Error / Subtle feedback text */}
        <div className="h-6 flex items-center justify-center">
          {errorMsg && (
            <p className="text-xs font-black text-[#0B0B0B] animate-in fade-in duration-200">
              {errorMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom: Custom Numpad & Forgot Link ──────────────────── */}
      <div className="w-full max-w-[320px] flex flex-col items-center gap-6 mb-2">
        {/* Modern Numpad Grid */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full place-items-center">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => {
            const isActive = activeDigit === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                className={`h-16 w-16 sm:h-18 sm:w-18 rounded-full text-2xl font-black text-[#0B0B0B] flex items-center justify-center transition-all duration-150 active:scale-90 border border-transparent ${
                  isActive
                    ? "bg-[#FDC909] text-[#0B0B0B] scale-95 shadow-md"
                    : "bg-[#F7F7F5] hover:bg-[#0B0B0B]/5"
                }`}
              >
                {num}
              </button>
            );
          })}

          {/* Empty spacer */}
          <div className="h-16 w-16 sm:h-18 sm:w-18" />

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handleDigitPress("0")}
            className={`h-16 w-16 sm:h-18 sm:w-18 rounded-full text-2xl font-black text-[#0B0B0B] flex items-center justify-center transition-all duration-150 active:scale-90 border border-transparent ${
              activeDigit === "0"
                ? "bg-[#FDC909] text-[#0B0B0B] scale-95 shadow-md"
                : "bg-[#F7F7F5] hover:bg-[#0B0B0B]/5"
            }`}
          >
            0
          </button>

          {/* Delete Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 w-16 sm:h-18 sm:w-18 rounded-full text-[#0B0B0B] flex items-center justify-center transition-all duration-150 active:scale-90 hover:bg-[#0B0B0B]/5"
            aria-label="Cancella"
          >
            <Delete className="h-6 w-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Forgot PIN link */}
        <button
          type="button"
          onClick={onForgotPin}
          className="text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors py-1 px-3"
        >
          Hai dimenticato il codice?
        </button>
      </div>

      {/* Inline styles for shake animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
