"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/assets/logo.png";

type AuthView = "login" | "register";

interface AuthScreenProps {
  onAuth: () => void;
}

/* ─── Reusable input field ─────────────────────────────── */
function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[#A7A7A7] uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="w-full h-13 px-4 rounded-2xl bg-white border border-[#A7A7A7] text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
          style={{ height: "52px" }}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main AuthScreen ──────────────────────────────────── */
export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>("login");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const switchView = (to: AuthView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(to);
      setIsTransitioning(false);
    }, 200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth();
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) return;
    if (regPassword !== regConfirm) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth();
    }, 800);
  };

  /* ═══════════════════════════════════════════════════════ */
  /* ─── Login form ─────────────────────────────────────── */
  const loginForm = (
    <form onSubmit={handleLogin} className="flex flex-col gap-5">
      <AuthInput
        label="Email"
        type="email"
        placeholder="la.tua@email.it"
        value={loginEmail}
        onChange={setLoginEmail}
        autoFocus
      />
      <AuthInput
        label="Password"
        type="password"
        placeholder="La tua password"
        value={loginPassword}
        onChange={setLoginPassword}
      />

      {/* Forgot password */}
      <div className="flex justify-end -mt-1">
        <button
          type="button"
          className="text-xs font-bold text-[#A7A7A7] hover:text-[#0B0B0B] transition-colors"
        >
          Password dimenticata?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>Accedi</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </>
        )}
      </button>

      {/* Switch to register */}
      <p className="text-center text-xs text-[#A7A7A7] font-medium">
        Non hai ancora un account?{" "}
        <button
          type="button"
          onClick={() => switchView("register")}
          className="font-black text-[#0B0B0B] hover:text-[#FDC909] transition-colors inline-flex items-center gap-0.5"
        >
          Registrati <ArrowRight className="h-3 w-3 inline" />
        </button>
      </p>
    </form>
  );

  /* ─── Register form ──────────────────────────────────── */
  const registerForm = (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
      <AuthInput
        label="Nome"
        placeholder="Il tuo nome"
        value={regName}
        onChange={setRegName}
        autoFocus
      />
      <AuthInput
        label="Email"
        type="email"
        placeholder="la.tua@email.it"
        value={regEmail}
        onChange={setRegEmail}
      />
      <AuthInput
        label="Password"
        type="password"
        placeholder="Crea una password"
        value={regPassword}
        onChange={setRegPassword}
      />
      <AuthInput
        label="Conferma password"
        type="password"
        placeholder="Ripeti la password"
        value={regConfirm}
        onChange={setRegConfirm}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>Crea il mio account</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </>
        )}
      </button>

      {/* Switch to login */}
      <p className="text-center text-xs text-[#A7A7A7] font-medium">
        Hai già un account?{" "}
        <button
          type="button"
          onClick={() => switchView("login")}
          className="font-black text-[#0B0B0B] hover:text-[#FDC909] transition-colors inline-flex items-center gap-0.5"
        >
          Accedi <ArrowRight className="h-3 w-3 inline" />
        </button>
      </p>
    </form>
  );

  /* ─── Shared hero content (logo + heading) ─────────── */
  const heroContent = (
    <div className="flex flex-col items-center gap-3">
      <Image
        src={Logo}
        alt="ZERO"
        width={64}
        height={64}
        className="object-contain"
        priority
      />
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B] leading-tight">
          {view === "login" ? "Bentornata." : "Creiamo il tuo ZERO."}
        </h1>
        <p className="text-sm text-[#A7A7A7] font-medium mt-1.5">
          {view === "login"
            ? "Riprendi il controllo dei tuoi soldi."
            : "Un passo alla volta, grandi obiettivi."}
        </p>
      </div>
    </div>
  );

  /* ─── Desktop left panel ─────────────────────────────── */
  const desktopLeftPanel = (
    <div className="hidden lg:flex flex-col items-start justify-center gap-8 p-12 xl:p-20 max-w-lg">
      <Image
        src={Logo}
        alt="ZERO"
        width={80}
        height={80}
        className="object-contain"
        priority
      />
      <div>
        <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[#0B0B0B] leading-[1.1]">
          Zero ansia{" "}
          <span className="relative">
            da fine mese
            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#FDC909] rounded-full" />
          </span>
          .
        </h1>
        <p className="text-base text-[#A7A7A7] font-medium mt-4 leading-relaxed max-w-sm">
          Gestire i tuoi soldi può essere semplice. Tieni traccia di spese,
          abbonamenti e obiettivi senza confusione.
        </p>
      </div>
      {/* Decorative pill */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B0B0B]">
        <div className="h-2 w-2 rounded-full bg-[#FDC909]" />
        <span className="text-xs font-bold text-[#F7F7F5]">
          Le tue finanze, senza caos
        </span>
      </div>
    </div>
  );

  /* ═══════════ RENDER ══════════════════════════════════ */
  return (
    <div className="min-h-[100dvh] bg-[#F7F7F5] flex"
         style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>

      {/* ── Desktop: left panel ─────────────────────────── */}
      {desktopLeftPanel}

      {/* ── Main form area (mobile full / desktop right) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile hero (hidden on desktop, desktop has left panel) */}
          <div className="lg:hidden mb-8">
            {heroContent}
          </div>

          {/* Desktop card header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-xl font-black text-[#0B0B0B] tracking-tight">
              {view === "login" ? "Bentornata." : "Creiamo il tuo ZERO."}
            </h2>
            <p className="text-sm text-[#A7A7A7] font-medium mt-1">
              {view === "login"
                ? "Riprendi il controllo dei tuoi soldi."
                : "Un passo alla volta, grandi obiettivi."}
            </p>
          </div>

          {/* Form wrapper with transition */}
          <div
            ref={formRef}
            className={`transition-all duration-200 ${
              isTransitioning
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {view === "login" ? loginForm : registerForm}
          </div>

          {/* Bottom accent */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-6 rounded-full bg-[#FDC909]" />
              <div className="h-1 w-1 rounded-full bg-[#A7A7A7]" />
              <div className="h-1 w-1 rounded-full bg-[#A7A7A7]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
