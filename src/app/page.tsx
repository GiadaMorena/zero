"use client";

import React, { useState, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AuthScreen } from "@/components/AuthScreen";
import { PinScreen } from "@/components/PinScreen";
import { AddCardScreen } from "@/components/AddCardScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { SpeseScreen } from "@/components/SpeseScreen";
import { AnalisiScreen } from "@/components/AnalisiScreen";
import { CarteScreen } from "@/components/CarteScreen";
import { ObiettiviScreen } from "@/components/ObiettiviScreen";
import { AbbonamentiScreen } from "@/components/AbbonamentiScreen";
import { AssicurazioniScreen } from "@/components/AssicurazioniScreen";
import { StatisticheScreen } from "@/components/StatisticheScreen";
import { ProfiloScreen } from "@/components/ProfiloScreen";
import { AddSpesaModal } from "@/components/AddSpesaModal";
import { BottomNavBar, NavTab } from "@/components/BottomNavBar";
import { ThemeSync } from "@/components/ThemeSync";
import { DesktopApp } from "@/components/desktop/DesktopApp";
import { AppProvider } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { OnboardingProfile } from "@/components/OnboardingProfile";
import { nextLoginStep, sameLoginAccount } from "@/lib/pinFlow";

export type FlowStep =
  | "welcome"
  | "register"
  | "login"
  | "profile_setup"
  | "add_card"
  | "create_pin"
  | "confirm_pin"
  | "lock"
  | "app";

export interface AuthState {
  isRegistered: boolean;
  hasPin: boolean;
  pinCode: string;
  userName: string;
  userEmail: string;
}

const STORAGE_KEY = "zero_auth_state_v6";

const DEFAULT_AUTH_STATE: AuthState = {
  isRegistered: false,
  hasPin: false,
  pinCode: "",
  userName: "",
  userEmail: "",
};

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const [flowStep, setFlowStep] = useState<FlowStep>("welcome");
  const [tempPin, setTempPin] = useState<string>("");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"expense" | "income">("expense");
  const [setupError, setSetupError] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isResettingPin, setIsResettingPin] = useState(false);

  // 1. Initial Load — check Supabase session first, then localStorage PIN data
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const query = new URLSearchParams(window.location.search);
        if (params.has("error") || query.has("error")) {
          setSetupError("Accesso Google non completato. Riprova oppure accedi con email e password.");
          window.history.replaceState(null, "", window.location.pathname);
          setFlowStep("login");
          return;
        }
        // Migrate old auth key
        localStorage.removeItem("zero_auth_state_v5");

        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed: AuthState | null = saved ? JSON.parse(saved) : null;

        if (session?.user) {
          const sameAccount = sameLoginAccount(parsed?.userEmail, session.user.email);
          // User is authenticated with Supabase - fetch fresh profile name
          const { data: prof } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", session.user.id)
            .single();
          if (cancelled) return;

          const name =
            prof?.name ||
            (sameAccount ? parsed?.userName : "") ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "";
          const email = session.user.email || "";
          const updatedState: AuthState = {
            isRegistered: true,
            hasPin: sameAccount ? parsed?.hasPin || false : false,
            pinCode: sameAccount ? parsed?.pinCode || "" : "",
            userName: name,
            userEmail: email,
          };
          setAuthState(updatedState);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
          } catch { /* ignore */ }

          setFlowStep(nextLoginStep(session.user.user_metadata, updatedState));
        } else {
          // Restore device PIN settings even after an explicit sign-out.
          if (parsed) setAuthState(parsed);
          setFlowStep(parsed?.isRegistered ? "login" : "welcome");
        }
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to initialize auth:", e);
        setFlowStep("welcome");
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const saveAuthState = (newState: AuthState) => {
    setAuthState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }
  };

  // 2. Background Re-Lock Handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && flowStep === "app" && authState.isRegistered && authState.hasPin) {
        setFlowStep("lock");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [flowStep, authState.isRegistered, authState.hasPin]);

  // Registration success → add_card step
  const handleRegisterSuccess = (data?: { name: string; email: string }) => {
    const updated: AuthState = {
      ...DEFAULT_AUTH_STATE,
      userName: data?.name || "",
      userEmail: data?.email || "",
    };
    saveAuthState(updated);
    setFlowStep("profile_setup");
  };

  // Login success → verify the saved PIN once; creation is only for a new PIN.
  const handleLoginSuccess = async (data?: { name: string; email: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const sameAccount = sameLoginAccount(authState.userEmail, user?.email || data?.email);
    const updated: AuthState = {
      ...authState,
      userName: data?.name || authState.userName,
      userEmail: user?.email || data?.email || authState.userEmail,
      isRegistered: true,
      hasPin: sameAccount && authState.hasPin,
      pinCode: sameAccount ? authState.pinCode : "",
    };
    saveAuthState(updated);
    const metadata = user?.user_metadata ?? {};
    setFlowStep(nextLoginStep(metadata, updated, isResettingPin));
  };

  // Keep the new PIN temporary until the second entry confirms it.
  const handlePinCreated = (pin: string) => {
    setTempPin(pin);
    setFlowStep("confirm_pin");
  };

  // PIN confirmed → save and unlock
  const handlePinConfirmed = () => {
    const updated: AuthState = {
      ...authState,
      isRegistered: true,
      hasPin: true,
      pinCode: tempPin,
    };
    saveAuthState(updated);
    setIsResettingPin(false);
    setFlowStep("app");
  };

  const handleUnlockSuccess = () => setFlowStep("app");
  const handleForgotPin = () => { setIsResettingPin(true); setFlowStep("login"); };
  const finishCard = async () => {
    setSetupError("");
    const { error } = await supabase.auth.updateUser({ data: { zero_onboarding_completed: true } });
    if (error) { setSetupError("Non riesco a completare il benvenuto. Riprova."); return; }
    setFlowStep(authState.hasPin ? "lock" : "create_pin");
  };
  const profileSetup = <OnboardingProfile name={authState.userName} onComplete={name => { saveAuthState({ ...authState, userName: name }); setFlowStep("add_card"); }} />;

  // Sign out while retaining this account's device PIN for its next login.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    saveAuthState({ ...authState, isRegistered: false });
    setIsResettingPin(false);
    setFlowStep("welcome");
  };

  const handleOpenAddModal = (type: "expense" | "income" = "expense") => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Mobile screens
  const renderMobileScreen = () => {
    switch (flowStep) {
      case "welcome":
        return (
          <WelcomeScreen
            onLogin={() => setFlowStep("login")}
            onRegister={() => setFlowStep("register")}
          />
        );

      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;
      case "profile_setup":
        return profileSetup;

      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;

      case "add_card":
        return (
          <AddCardScreen
            userName={authState.userName}
            userEmail={authState.userEmail}
            onSkip={finishCard}
            onAdd={finishCard}
          />
        );

      case "create_pin":
        return (
          <PinScreen
            mode="create"
            userName={authState.userName}
            onPinSet={handlePinCreated}
          />
        );

      case "confirm_pin":
        return (
          <PinScreen
            mode="confirm"
            userName={authState.userName}
            expectedPin={tempPin}
            onSuccess={handlePinConfirmed}
          />
        );

      case "lock":
        return (
          <PinScreen
            mode="lock"
            userName={authState.userName}
            expectedPin={authState.pinCode}
            onSuccess={handleUnlockSuccess}
            onForgotPin={handleForgotPin}
          />
        );

      case "app":
      default:
        switch (activeTab) {
          case "home":
            return (
              <HomeScreen
                onOpenAddModal={handleOpenAddModal}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            );
          case "spese":
            return <SpeseScreen onOpenAddModal={(type) => handleOpenAddModal(type || "expense")} />;
          case "analisi":
            return <AnalisiScreen />;
          case "carte":
            return <CarteScreen />;
          case "obiettivi":
            return <ObiettiviScreen />;
          case "abbonamenti":
            return <AbbonamentiScreen />;
          case "assicurazioni":
            return <AssicurazioniScreen onBack={() => setActiveTab("profilo")} />;
          case "statistiche":
            return <StatisticheScreen />;
          case "profilo":
            return (
              <ProfiloScreen
                onNavigate={(tab) => setActiveTab(tab as NavTab)}
                onLogout={handleLogout}
              />
            );
          default:
            return (
              <HomeScreen
                onOpenAddModal={handleOpenAddModal}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            );
        }
    }
  };

  // Desktop screens
  const renderDesktopScreen = () => {
    switch (flowStep) {
      case "welcome":
        return (
          <WelcomeScreen
            onLogin={() => setFlowStep("login")}
            onRegister={() => setFlowStep("register")}
          />
        );
      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;
      case "profile_setup":
        return profileSetup;
      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;
      case "add_card":
        return (
          <AddCardScreen
            userName={authState.userName}
            userEmail={authState.userEmail}
            onSkip={finishCard}
            onAdd={finishCard}
          />
        );
      case "create_pin":
        return (
          <PinScreen
            mode="create"
            userName={authState.userName}
            onPinSet={handlePinCreated}
          />
        );
      case "confirm_pin":
        return (
          <PinScreen
            mode="confirm"
            userName={authState.userName}
            expectedPin={tempPin}
            onSuccess={handlePinConfirmed}
          />
        );
      case "lock":
        return (
          <PinScreen
            mode="lock"
            userName={authState.userName}
            expectedPin={authState.pinCode}
            onSuccess={handleUnlockSuccess}
            onForgotPin={handleForgotPin}
          />
        );
      case "app":
      default:
        return <DesktopApp />;
    }
  };

  const isAppUnlocked = flowStep === "app";

  if (isInitializing) return <main role="status" className="flex min-h-dvh items-center justify-center bg-[#F7F7F5] text-sm font-semibold text-[#777]">Apertura di ZERO…</main>;

  return (
    <AppProvider>
      <ThemeSync screenBackground="#F7F7F5" />
      {setupError && <p role="alert" className="p-4 text-red-700">{setupError}</p>}

      {/* Mobile Experience (< 768px) */}
      <div className="md:hidden">
        <main className={`w-full min-h-[100dvh] flex flex-col bg-[#F7F7F5] selection:bg-[#FDC909] ${isAppUnlocked ? "zero-motion" : ""}`}>
          <div className="flex-1 flex flex-col w-full bg-[#F7F7F5]">
            <div
              key={flowStep + (isAppUnlocked ? activeTab : "")}
              className={`flex-1 overflow-y-auto no-scrollbar relative ${isAppUnlocked ? "zero-screen" : "animate-in fade-in duration-300"}`}
            >
              {renderMobileScreen()}
            </div>

            {isAppUnlocked && (
              <BottomNavBar
                currentTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                onOpenScan={() => handleOpenAddModal("expense")}
              />
            )}
          </div>

          <AddSpesaModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            defaultType={addModalType}
          />
        </main>
      </div>

      {/* Desktop Experience (≥ 768px) */}
      <div className="hidden md:block">
        {renderDesktopScreen()}
      </div>
    </AppProvider>
  );
}


