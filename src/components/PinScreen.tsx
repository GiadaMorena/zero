"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Delete, Lock, ScanFace } from "lucide-react";
import Logo from "@/assets/logo.png";
import { biometricUnlockStatus, unlockWithBiometric, cancelBiometricPrompt } from "@/lib/biometricUnlock";

export type PinMode = "create" | "confirm" | "lock";

interface PinScreenProps {
  mode: PinMode;
  userName?: string;
  accountEmail?: string;
  expectedPin?: string;
  onPinSet?: (pin: string) => void;
  onSuccess?: () => void;
  onForgotPin?: () => void;
  onCancel?: () => void;
}

export function PinScreen({
  mode: initialMode,
  userName = "",
  accountEmail = "",
  expectedPin = "",
  onPinSet,
  onSuccess,
  onForgotPin,
  onCancel,
}: PinScreenProps) {
  const [currentMode, setCurrentMode] = useState<PinMode>(initialMode);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const digitsRef = useRef<string[]>([]);
  const [biometricReady, setBiometricReady] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const biometricAttempt = useRef(0);
  const biometricController = useRef<AbortController | null>(null);
  const biometricBusyRef = useRef(false);
  const completed = useRef(false);

  const cancelBiometric = () => {
    biometricAttempt.current++;
    biometricBusyRef.current = false;
    if (biometricController.current) {
      biometricController.current.abort();
      biometricController.current = null;
      void cancelBiometricPrompt();
    }
    setBiometricBusy(false);
  };

  useEffect(() => {
    let live = true;
    completed.current = false;
    setBiometricBusy(false);
    setBiometricReady(false);
    if (initialMode === "lock" && accountEmail) {
      void biometricUnlockStatus(accountEmail).then(result => {
        if (live) setBiometricReady(result.available && result.enabled);
      }).catch(() => { /* The PIN remains available if verification is unavailable. */ });
    }
    return () => {
      live = false;
      biometricAttempt.current++;
      biometricBusyRef.current = false;
      if (biometricController.current) {
        biometricController.current.abort();
        biometricController.current = null;
        void cancelBiometricPrompt();
      }
    };
  }, [initialMode, accountEmail]);

  const handleBiometric = async () => {
    if (!biometricReady || biometricBusyRef.current || completed.current || currentMode !== "lock") return;
    const attempt = ++biometricAttempt.current;
    const controller = new AbortController();
    biometricController.current = controller;
    biometricBusyRef.current = true;
    setBiometricBusy(true);
    setErrorMessage("");
    digitsRef.current = [];
    setPinDigits([]);
    try {
      const result = await unlockWithBiometric(accountEmail, controller.signal);
      if (attempt !== biometricAttempt.current || controller.signal.aborted || completed.current || result.verified !== true) return;
      completed.current = true;
      onSuccess?.();
    } catch (error) {
      if (attempt === biometricAttempt.current && !controller.signal.aborted) {
        setErrorMessage(error instanceof Error ? error.message : "Verifica non riuscita. Puoi usare il codice.");
      }
    } finally {
      if (attempt === biometricAttempt.current) {
        biometricController.current = null;
        biometricBusyRef.current = false;
        setBiometricBusy(false);
      }
    }
  };

  useEffect(() => {
    setCurrentMode(initialMode);
    digitsRef.current = [];
    setPinDigits([]);
    setErrorMessage("");
  }, [initialMode, accountEmail]);

  // Handle digit press (0-9)
  const handleDigitPress = (digit: string) => {
    if (digitsRef.current.length >= 6 || biometricBusyRef.current || completed.current) return;
    setErrorMessage("");
    const newDigits = [...digitsRef.current, digit];
    digitsRef.current = newDigits;
    setPinDigits(newDigits);

    // Auto verify when 6th digit is typed
    if (newDigits.length === 6) {
      const enteredCode = newDigits.join("");
      handleCompletePin(enteredCode);
    }
  };

  // Handle backspace ⌫
  const handleBackspace = () => {
    if (digitsRef.current.length === 0 || digitsRef.current.length >= 6) return;
    setErrorMessage("");
    digitsRef.current = digitsRef.current.slice(0, -1);
    setPinDigits(digitsRef.current);
  };

  // Process completed 6-digit PIN entry
  const handleCompletePin = (code: string) => {
    if (currentMode === "create") {
      onPinSet?.(code);
    } else if (currentMode === "confirm") {
      // The parent switches flow steps after the first entry, which remounts
      // this screen. Compare against the PIN passed back as expectedPin.
      if (code === expectedPin) {
        completed.current = true;
        cancelBiometric();
        if (onPinSet) onPinSet(code);
        if (onSuccess) onSuccess();
      } else {
        triggerError("Il codice non coincide. Riprova.");
        setTimeout(() => {
          digitsRef.current = [];
          setPinDigits([]);
        }, 800);
      }
    } else if (currentMode === "lock") {
      if (/^\d{6}$/.test(expectedPin) && code === expectedPin) {
        completed.current = true;
        cancelBiometric();
        if (onSuccess) onSuccess();
      } else {
        triggerError("Codice non corretto");
        setTimeout(() => {
          digitsRef.current = [];
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleDigitPress(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        handleBackspace();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

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
          title: userName ? `Ciao, ${userName.split(" ")[0]}.` : "Ciao!",
          subtitle: "Inserisci il tuo codice per continuare.",
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div data-app-update-block={currentMode !== "lock" || pinDigits.length > 0 || biometricBusy ? "true" : undefined} className="fixed inset-0 z-50 bg-[#F7F7F5] flex flex-col justify-between items-center px-6 select-none overflow-y-auto">
      {/* Safe Area Top */}
      <div style={{ height: "env(safe-area-inset-top, 24px)" }} />

      {/* Main Container */}
      <div className={`w-full max-w-xs mx-auto flex-1 flex flex-col items-center justify-center ${biometricReady && currentMode === "lock" ? "py-4 gap-5" : "py-6 gap-8"}`}>
        
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

        {currentMode === "lock" && biometricReady && <div className="flex w-full flex-col items-center gap-2">
          <button type="button" onClick={() => void handleBiometric()} disabled={biometricBusy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FDC909] px-5 py-3.5 text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#F3BF00] disabled:opacity-60">
            <ScanFace className="h-5 w-5" aria-hidden="true" />
            {biometricBusy ? "Verifica in corso…" : "Sblocca con Face ID / passkey"}
          </button>
          {biometricBusy ? <button type="button" onClick={() => { cancelBiometric(); setErrorMessage(""); }} className="p-2 text-xs font-bold underline underline-offset-4">Usa il codice</button> : <p className="text-center text-[11px] leading-relaxed text-[#777]">Oppure inserisci il codice qui sotto.</p>}
        </div>}

        {/* 6 INDICATOR DOTS ○ ○ ○ ○ ○ ○ */}
        <div className="flex flex-col items-center gap-3 my-2">
          <div role="group" aria-label={`${pinDigits.length} di 6 cifre inserite`}
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

        <p className="hidden md:block text-xs font-semibold text-[#777] text-center">Puoi usare anche la tastiera. Backspace per correggere.</p>

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
