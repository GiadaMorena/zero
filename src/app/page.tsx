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
import { StatisticheScreen } from "@/components/StatisticheScreen";
import { ProfiloScreen } from "@/components/ProfiloScreen";
import { AddSpesaModal } from "@/components/AddSpesaModal";
import { BottomNavBar, NavTab } from "@/components/BottomNavBar";
import { ThemeSync } from "@/components/ThemeSync";
import { DesktopApp } from "@/components/desktop/DesktopApp";
import { AppProvider } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export type FlowStep =
  | "welcome"
  | "register"
  | "login"
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

  // 1. Initial Load — check Supabase session first, then localStorage PIN data
  useEffect(() => {
    const init = async () => {
      try {
        // Migrate old auth key
        localStorage.removeItem("zero_auth_state_v5");

        const { data: { session } } = await supabase.auth.getSession();
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed: AuthState | null = saved ? JSON.parse(saved) : null;

        if (session?.user) {
          // User is authenticated with Supabase
          const name = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "";
          const email = session.user.email || "";
          const updatedState: AuthState = {
            isRegistered: true,
            hasPin: parsed?.hasPin || false,
            pinCode: parsed?.pinCode || "",
            userName: name,
            userEmail: email,
          };
          setAuthState(updatedState);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
          } catch { /* ignore */ }

          if (updatedState.hasPin && updatedState.pinCode) {
            setFlowStep("lock");
          } else {
            setFlowStep("app");
          }
        } else if (parsed?.isRegistered) {
          // Has local data but no Supabase session — ask to log in again
          setAuthState(parsed);
          setFlowStep("login");
        } else {
          setFlowStep("welcome");
        }
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        setFlowStep("welcome");
      }
    };
    init();
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
      if (document.hidden && authState.isRegistered && authState.hasPin) {
        setFlowStep("lock");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [authState.isRegistered, authState.hasPin]);

  // Registration success → add_card step
  const handleRegisterSuccess = (data?: { name: string; email: string }) => {
    const updated: AuthState = {
      ...authState,
      userName: data?.name || "",
      userEmail: data?.email || "",
    };
    saveAuthState(updated);
    setFlowStep("add_card");
  };

  // Login success → lock or create_pin
  const handleLoginSuccess = (data?: { name: string; email: string }) => {
    const updated: AuthState = {
      ...authState,
      userName: data?.name || authState.userName,
      userEmail: data?.email || authState.userEmail,
      isRegistered: true,
    };
    saveAuthState(updated);
    if (updated.hasPin && updated.pinCode) {
      setFlowStep("lock");
    } else {
      setFlowStep("create_pin");
    }
  };

  // PIN creation → confirm step
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
    setFlowStep("app");
  };

  const handleUnlockSuccess = () => setFlowStep("app");
  const handleForgotPin = () => setFlowStep("login");

  // Logout → sign out from Supabase + full local reset
  const handleLogout = async () => {
    await supabase.auth.signOut();
    saveAuthState(DEFAULT_AUTH_STATE);
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
        return <WelcomeScreen onStart={() => setFlowStep("register")} />;

      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;

      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;

      case "add_card":
        return (
          <AddCardScreen
            userName={authState.userName}
            userEmail={authState.userEmail}
            onSkip={() => setFlowStep("create_pin")}
            onAdd={() => setFlowStep("create_pin")}
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
        return <WelcomeScreen onStart={() => setFlowStep("register")} />;
      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;
      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;
      case "add_card":
        return (
          <AddCardScreen
            userName={authState.userName}
            userEmail={authState.userEmail}
            onSkip={() => setFlowStep("create_pin")}
            onAdd={() => setFlowStep("create_pin")}
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

  return (
    <AppProvider>
      <ThemeSync screenBackground="#F7F7F5" />

      {/* Mobile Experience (< 768px) */}
      <div className="md:hidden">
        <main className="w-full min-h-[100dvh] flex flex-col bg-[#F7F7F5] selection:bg-[#FDC909]">
          <div className="flex-1 flex flex-col w-full bg-[#F7F7F5]">
            <div
              key={flowStep + (isAppUnlocked ? activeTab : "")}
              className="flex-1 overflow-y-auto no-scrollbar relative animate-in fade-in duration-300"
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
