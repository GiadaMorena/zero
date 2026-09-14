"use client";

import React, { useState, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AuthScreen } from "@/components/AuthScreen";
import { PinScreen } from "@/components/PinScreen";
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

export type FlowStep =
  | "welcome"
  | "register"
  | "login"
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

const STORAGE_KEY = "zero_auth_state_v5";

const DEFAULT_AUTH_STATE: AuthState = {
  isRegistered: false,
  hasPin: false,
  pinCode: "",
  userName: "Giada Morena",
  userEmail: "giada@zero.app",
};

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const [flowStep, setFlowStep] = useState<FlowStep>("welcome");
  const [tempPin, setTempPin] = useState<string>("");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"expense" | "income">("expense");

  // 1. Initial Load & Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AuthState = JSON.parse(saved);
        setAuthState(parsed);

        if (!parsed.isRegistered) {
          setFlowStep("welcome");
        } else if (!parsed.hasPin) {
          setFlowStep("create_pin");
        } else {
          // Returning registered user with PIN -> MUST SHOW LOCK SCREEN!
          setFlowStep("lock");
        }
      }
    } catch (e) {
      console.error("Failed to load auth state:", e);
    }
  }, []);

  const saveAuthState = (newState: AuthState) => {
    setAuthState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save auth state:", e);
    }
  };

  // 2. Background Re-Lock Handler (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App passed to background
        if (authState.isRegistered && authState.hasPin) {
          setFlowStep("lock");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authState.isRegistered, authState.hasPin]);

  // Handle registration success -> move to PIN creation
  const handleRegisterSuccess = (data?: { name: string; email: string }) => {
    const updated = {
      ...authState,
      userName: data?.name || authState.userName,
      userEmail: data?.email || authState.userEmail,
    };
    saveAuthState(updated);
    setFlowStep("create_pin");
  };

  // Handle login success -> if PIN configured go to lock, else create PIN
  const handleLoginSuccess = (data?: { name: string; email: string }) => {
    const updated = {
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

  // Handle PIN creation -> store temp PIN and move to confirmation
  const handlePinCreated = (pin: string) => {
    setTempPin(pin);
    setFlowStep("confirm_pin");
  };

  // Handle PIN confirmation match -> save PIN and unlock app
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

  // Handle PIN Unlock success
  const handleUnlockSuccess = () => {
    setFlowStep("app");
  };

  // Handle Forgot PIN click
  const handleForgotPin = () => {
    setFlowStep("login");
  };

  // Handle Logout
  const handleLogout = () => {
    const resetState: AuthState = {
      ...DEFAULT_AUTH_STATE,
      isRegistered: false,
      hasPin: false,
      pinCode: "",
    };
    saveAuthState(resetState);
    setFlowStep("welcome");
  };

  const handleOpenAddModal = (type: "expense" | "income" = "expense") => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Active Screen Switcher for Mobile
  const renderMobileScreen = () => {
    switch (flowStep) {
      case "welcome":
        return <WelcomeScreen onStart={() => setFlowStep("register")} />;

      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;

      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;

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
                onNavigate={(tab) => setActiveTab(tab)}
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

  // Render Desktop Gate: when locked/authenticating, shows PIN or Auth Screen
  const renderDesktopScreen = () => {
    switch (flowStep) {
      case "welcome":
        return <WelcomeScreen onStart={() => setFlowStep("register")} />;
      case "register":
        return <AuthScreen onAuth={handleRegisterSuccess} defaultView="register" />;
      case "login":
        return <AuthScreen onAuth={handleLoginSuccess} defaultView="login" />;
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

            {/* Bottom Nav Bar is ONLY shown when fully unlocked in the App */}
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
