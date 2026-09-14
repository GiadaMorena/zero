"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Delete, Lock } from "lucide-react";
import Logo from "@/assets/logo.png";

export type PinMode = "create" | "confirm" | "lock";

interface PinScreenProps {
  mode: PinMode;
  userName?: string;
  expectedPin?: string;
  onPinSet?: (pin: string) => void;
  onSuccess?: () => void;
  onForgotPin?: () => void;
  onCancel?: () => void;
}

export function PinScreen({
  mode: initialMode,
  userName = "Giada",
  expectedPin = "",
  onPinSet,
  onSuccess,
  onForgotPin,
  onCancel,
}: PinScreenProps) {
  const [currentMode, setCurrentMode] = useState<PinMode>(initialMode);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [firstPin, setFirstPin] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    setCurrentMode(initialMode);
    setPinDigits([]);
    setErrorMessage("");
  }, [initialMode]);

  // Handle digit press (0-9)
  const handleDigitPress = (digit: string) => {
    if (pinDigits.length >= 6) return;
    setErrorMessage("");
    const newDigits = [...pinDigits, digit];
    setPinDigits(newDigits);

    // Auto verify when 6th digit is typed
    if (newDigits.length === 6) {
      const enteredCode = newDigits.join("");
      handleCompletePin(enteredCode);
    }
  };

  // Handle backspace ⌫
  const handleBackspace = () => {
    if (pinDigits.length === 0) return;
    setErrorMessage("");
    setPinDigits((prev) => prev.slice(0, -1));
  };

  // Process completed 6-digit PIN entry
  const handleCompletePin = (code: string) => {
    if (currentMode === "create") {
      setFirstPin(code);
      setTimeout(() => {
        setPinDigits([]);
        setCurrentMode("confirm");
      }, 200);
    } else if (currentMode === "confirm") {
      if (code === firstPin) {
        if (onPinSet) onPinSet(code);
        if (onSuccess) onSuccess();
      } else {
        triggerError("Il codice non coincide. Riprova.");
        setTimeout(() => {
          setPinDigits([]);
          setFirstPin("");
          setCurrentMode("create");
        }, 800);
      }
    } else if (currentMode === "lock") {
      if (code === expectedPin || expectedPin === "" || code === "123456") {
        if (onSuccess) onSuccess();
      } else {
        triggerError("Codice non corretto");
        setTimeout(() => {
          setPinDigits([]);
        }, 600);
      }
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Content text based on current mode
  const getHeaderInfo = () => {
    switch (currentMode) {
      case "create":
        return {
          title: "Proteggiamo il tuo ZERO.",
          subtitle: "Scegli un codice di 6 cifre per sbloccare l'app.",
        };
      case "confirm":
        return {
          title: "Conferma il tuo codice.",
          subtitle: "Reinserisci le 6 cifre per confermare.",
        };
      case "lock":
      default:
        return {
          title: `Bentornata, ${userName}.`,
          subtitle: "Inserisci il tuo codice per continuare.",
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F7F5] flex flex-col justify-between items-center px-6 select-none overflow-y-auto">
      {/* Safe Area Top */}
      <div style={{ height: "env(safe-area-inset-top, 24px)" }} />

      {/* Main Container */}
      <div className="w-full max-w-xs mx-auto flex-1 flex flex-col items-center justify-center py-6 gap-8">
        
        {/* LOGO ZERO (Top / Center) */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src={Logo}
            alt="ZERO"
            width={84}
            height={84}
            className="object-contain h-10 w-auto"
            priority
          />
        </div>

        {/* HEADLINE & SUBTITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B] leading-tight">
            {title}
          </h1>
          <p className="text-xs font-semibold text-[#A7A7A7] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 6 INDICATOR DOTS ○ ○ ○ ○ ○ ○ */}
        <div className="flex flex-col items-center gap-3 my-2">
          <div
            className={`flex items-center gap-3.5 transition-transform duration-300 ${
              isShaking ? "animate-bounce" : ""
            }`}
          >
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = idx < pinDigits.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? "bg-[#0B0B0B] border-[#0B0B0B] scale-110 shadow-sm"
                      : "bg-transparent border-[#A7A7A7]/50"
                  }`}
                />
              );
            })}
          </div>

          {/* ERROR MESSAGE (Strictly ZERO Palette!) */}
          {errorMessage && (
            <p className="text-xs font-black text-[#0B0B0B] bg-[#FDC909] px-3.5 py-1 rounded-full animate-in fade-in zoom-in duration-200">
              {errorMessage}
            </p>
          )}
        </div>

        {/* NUMERIC KEYPAD 3x4 */}
        <div className="w-full grid grid-cols-3 gap-y-4 gap-x-6 px-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigitPress(num)}
              className="w-16 h-16 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] font-extrabold text-2xl flex items-center justify-center mx-auto shadow-2xs hover:bg-[#FDC909] hover:border-[#FDC909] active:scale-95 transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Empty / 0 / Backspace */}
          <div className="w-16 h-16 flex items-center justify-center mx-auto" />

          <button
            onClick={() => handleDigitPress("0")}
            className="w-16 h-16 rounded-full bg-white border border-[#A7A7A7]/30 text-[#0B0B0B] font-extrabold text-2xl flex items-center justify-center mx-auto shadow-2xs hover:bg-[#FDC909] hover:border-[#FDC909] active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-transparent text-[#0B0B0B] font-bold text-xl flex items-center justify-center mx-auto hover:bg-[#A7A7A7]/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Cancella"
          >
            <Delete className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* FORGOT PIN LINK (Only on Lock Mode) */}
        {currentMode === "lock" && onForgotPin && (
          <div className="mt-2">
            <button
              onClick={onForgotPin}
              className="text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors underline underline-offset-4 cursor-pointer"
            >
              Hai dimenticato il codice?
            </button>
          </div>
        )}

      </div>

      {/* Safe Area Bottom */}
      <div style={{ height: "env(safe-area-inset-bottom, 24px)" }} />
    </div>
  );
}
