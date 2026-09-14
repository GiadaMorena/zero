"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/assets/logo.png";

type AuthView = "login" | "register";

interface AuthScreenProps {
  onAuth: (userData?: { name: string; email: string }) => void;
  defaultView?: AuthView;
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
      <label className="text-[11px] font-extrabold text-[#A7A7A7] uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="w-full px-4 rounded-2xl bg-white border border-[#A7A7A7]/40 text-sm font-semibold text-[#0B0B0B] placeholder:text-[#A7A7A7] focus:outline-none focus:border-[#FDC909] focus:ring-2 focus:ring-[#FDC909] transition-all"
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
export function AuthScreen({ onAuth, defaultView = "register" }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("Giada Morena");
  const [regEmail, setRegEmail] = useState("giada@zero.app");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const switchView = (to: AuthView) => {
    setError("");
    setIsTransitioning(true);
    setTimeout(() => {
      setView(to);
      setIsTransitioning(false);
    }, 200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Inserisci email e password per continuare");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth({ name: "Giada Morena", email: loginEmail });
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Compila tutti i campi richiesti");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Le password non coincidono");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuth({ name: regName, email: regEmail });
    }, 600);
  };

  /* ─── Login Form ──────────────────────────────────────── */
  const loginForm = (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <AuthInput
        label="Email"
        type="email"
        placeholder="la.tua@email.it"
        value={loginEmail}
        onChange={(v) => { setError(""); setLoginEmail(v); }}
        autoFocus
      />
      <AuthInput
        label="Password"
        type="password"
        placeholder="La tua password"
        value={loginPassword}
        onChange={(v) => { setError(""); setLoginPassword(v); }}
      />

      {error && (
        <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center animate-in fade-in">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 mt-1 cursor-pointer group"
      >
        <div className="w-11 h-11 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          )}
        </div>
        <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
          Accedi
        </span>
      </button>

      {/* Switch to register */}
      <p className="text-center text-xs text-[#A7A7A7] font-medium mt-2">
        Non hai ancora un account?{" "}
        <button
          type="button"
          onClick={() => switchView("register")}
          className="font-black text-[#0B0B0B] hover:text-[#FDC909] transition-colors inline-flex items-center gap-0.5 cursor-pointer"
        >
          Registrati <ArrowRight className="h-3 w-3 inline" />
        </button>
      </p>
    </form>
  );

  /* ─── Register Form ───────────────────────────────────── */
  const registerForm = (
    <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
      <AuthInput
        label="Nome"
        placeholder="Il tuo nome"
        value={regName}
        onChange={(v) => { setError(""); setRegName(v); }}
        autoFocus
      />
      <AuthInput
        label="Email"
        type="email"
        placeholder="la.tua@email.it"
        value={regEmail}
        onChange={(v) => { setError(""); setRegEmail(v); }}
      />
      <AuthInput
        label="Password"
        type="password"
        placeholder="Crea una password"
        value={regPassword}
        onChange={(v) => { setError(""); setRegPassword(v); }}
      />
      <AuthInput
        label="Conferma password"
        type="password"
        placeholder="Ripeti la password"
        value={regConfirm}
        onChange={(v) => { setError(""); setRegConfirm(v); }}
      />

      {error && (
        <p className="text-xs font-bold text-[#0B0B0B] bg-[#FDC909] px-3 py-1.5 rounded-xl text-center animate-in fade-in">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F7F7F5] font-black text-sm flex items-center justify-between p-1.5 hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 mt-1 cursor-pointer group"
      >
        <div className="w-11 h-11 rounded-full bg-[#FDC909] text-[#0B0B0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          )}
        </div>
        <span className="flex-1 text-center pr-6 tracking-wide font-extrabold text-[#F7F7F5]">
          Crea il mio account
        </span>
      </button>

      {/* Switch to login */}
      <p className="text-center text-xs text-[#A7A7A7] font-medium mt-1">
        Hai già un account?{" "}
        <button
          type="button"
          onClick={() => switchView("login")}
          className="font-black text-[#0B0B0B] hover:text-[#FDC909] transition-colors inline-flex items-center gap-0.5 cursor-pointer"
        >
          Accedi <ArrowRight className="h-3 w-3 inline" />
        </button>
      </p>
    </form>
  );

  /* ─── Hero Content ────────────────────────────────────── */
  const heroContent = (
    <div className="flex flex-col items-center gap-3">
      <Image
        src={Logo}
        alt="ZERO"
        width={72}
        height={72}
        className="object-contain h-10 w-auto"
        priority
      />
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0B] leading-tight">
          {view === "login" ? "Bentornata." : "Creiamo il tuo ZERO."}
        </h1>
        <p className="text-xs text-[#A7A7A7] font-semibold mt-1">
          {view === "login"
            ? "Inserisci le tue credenziali per accedere."
            : "Compila i tuoi dati per iniziare."}
        </p>
      </div>
    </div>
  );

  /* ─── Desktop Left Panel ──────────────────────────────── */
  const desktopLeftPanel = (
    <div className="hidden lg:flex flex-col items-start justify-center gap-8 p-12 xl:p-20 max-w-lg">
      <Image
        src={Logo}
        alt="ZERO"
        width={96}
        height={96}
        className="object-contain h-12 w-auto"
        priority
      />
      <div>
        <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[#0B0B0B] leading-[1.1]">
          Zero ansia{" "}
          <span className="relative inline-block">
            da fine mese
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[#FDC909] rounded-full" />
          </span>
          .
        </h1>
        <p className="text-sm text-[#A7A7A7] font-semibold mt-4 leading-relaxed max-w-sm">
          Gestisci spese, abbonamenti e obiettivi. Tutto in un unico posto con un'esperienza minimal e sicura.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B0B0B]">
        <div className="h-2 w-2 rounded-full bg-[#FDC909]" />
        <span className="text-xs font-bold text-[#F7F7F5]">
          Sicurezza avanzata con PIN a 6 cifre
        </span>
      </div>
    </div>
  );

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-[#F7F7F5] flex justify-center items-center select-none"
         style={{ paddingTop: "env(safe-area-inset-top, 16px)", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
      
      {/* Desktop side panel */}
      {desktopLeftPanel}

      {/* Main form area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 lg:px-12 w-full max-w-md">
        <div className="w-full">
          
          {/* Header info */}
          <div className="mb-6">
            {heroContent}
          </div>

          {/* Animated form container */}
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

          {/* Bottom Accent Dots */}
          <div className="flex justify-center mt-6">
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
