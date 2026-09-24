"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "zero_app_state_v6";

export interface CardItem {
  id: string;
  name: string;
  bankName: string;
  number: string;
  expiry: string;
  type: "revolut" | "zero" | "mastercard" | "generic";
  balance: number;
}

export interface TransactionItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  cardId: string;
  type: "expense" | "income";
  note?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  cost: number;
  frequency: "mese" | "anno";
  date: string;
  active: boolean;
  category: string;
  color: string;
}

export interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  percent: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarText: string;
  currency: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark";
}

interface AppContextType {
  cards: CardItem[];
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
  activeCard: CardItem | null;
  transactions: TransactionItem[];
  subscriptions: SubscriptionItem[];
  goals: GoalItem[];
  profile: UserProfile;
  initializeProfile: (data: {
    name: string;
    email: string;
    card?: {
      bankName: string;
      number: string;
      expiry: string;
      balance: number;
    };
  }) => void;
  addTransaction: (data: {
    title: string;
    category: string;
    amount: number;
    type: "expense" | "income";
    note?: string;
    date?: string;
    cardId?: string;
  }) => void;
  deleteTransaction: (id: string) => void;
  toggleSubscription: (id: string) => void;
  addSubscription: (data: {
    name: string;
    cost: number;
    frequency: "mese" | "anno";
    date: string;
    category: string;
  }) => void;
  deleteSubscription: (id: string) => void;
  addMoneyToGoal: (id: string, amount: number) => void;
  addGoal: (data: { title: string; target: number }) => void;
  deleteGoal: (id: string) => void;
  addCard: (data: {
    bankName: string;
    name: string;
    number: string;
    expiry: string;
    balance: number;
    type?: "zero" | "revolut" | "mastercard" | "generic";
  }) => void;
  deleteCard: (id: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  resetAllData: () => void;
  exportCSV: () => void;
  totalMonthlySpending: number;
  totalMonthlyIncome: number;
  totalMonthlySavings: number;
  totalActiveSubscriptionsCost: number;
}

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  avatarText: "",
  currency: "EUR (€)",
  notificationsEnabled: true,
  theme: "light",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      // Migrate: remove old keys
      localStorage.removeItem("zero_app_state_v3");
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cards) setCards(parsed.cards);
        if (parsed.activeCardIndex !== undefined) setActiveCardIndex(parsed.activeCardIndex);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.profile) setProfile(parsed.profile);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cards, activeCardIndex, transactions, subscriptions, goals, profile })
      );
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [cards, activeCardIndex, transactions, subscriptions, goals, profile]);

  const activeCard = cards[activeCardIndex] ?? null;

  // Initialize profile after registration (with optional first card)
  const initializeProfile = (data: {
    name: string;
    email: string;
    card?: { bankName: string; number: string; expiry: string; balance: number };
  }) => {
    const newProfile: UserProfile = {
      name: data.name,
      email: data.email,
      avatarText: data.name.charAt(0).toUpperCase(),
      currency: "EUR (€)",
      notificationsEnabled: true,
      theme: "light",
    };
    setProfile(newProfile);

    if (data.card) {
      const newCard: CardItem = {
        id: "card-" + Date.now(),
        name: data.name,
        bankName: data.card.bankName,
        number: data.card.number,
        expiry: data.card.expiry || "00/00",
        type: "generic",
        balance: data.card.balance || 0,
      };
      setCards([newCard]);
      setActiveCardIndex(0);
    } else {
      setCards([]);
      setActiveCardIndex(0);
    }
    setTransactions([]);
    setSubscriptions([]);
    setGoals([]);
  };

  // Add Transaction
  const addTransaction = (data: {
    title: string;
    category: string;
    amount: number;
    type: "expense" | "income";
    note?: string;
    date?: string;
    cardId?: string;
  }) => {
    const targetCardId = data.cardId || activeCard?.id || "";
    const finalAmount = data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount);

    const newTx: TransactionItem = {
      id: "tx-" + Date.now(),
      title: data.title,
      category: data.category,
      amount: finalAmount,
      date:
        data.date ||
        "Oggi, " +
          new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      cardId: targetCardId,
      type: data.type,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setCards((prevCards) =>
      prevCards.map((c) =>
        c.id === targetCardId ? { ...c, balance: Math.max(0, c.balance + finalAmount) } : c
      )
    );
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setCards((prevCards) =>
      prevCards.map((c) =>
        c.id === targetTx.cardId
          ? { ...c, balance: Math.max(0, c.balance - targetTx.amount) }
          : c
      )
    );
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const addSubscription = (data: {
    name: string;
    cost: number;
    frequency: "mese" | "anno";
    date: string;
    category: string;
  }) => {
    const newSub: SubscriptionItem = {
      id: "sub-" + Date.now(),
      name: data.name,
      cost: data.cost,
      frequency: data.frequency,
      date: data.date,
      active: true,
      category: data.category,
      color: "bg-[#FDC909]/20 text-[#0B0B0B]",
    };
    setSubscriptions((prev) => [...prev, newSub]);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const addMoneyToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newCurrent = g.current + amount;
        const newPercent = Math.min(100, Math.round((newCurrent / g.target) * 100));
        return { ...g, current: newCurrent, percent: newPercent, completed: newCurrent >= g.target };
      })
    );
  };

  const addGoal = (data: { title: string; target: number }) => {
    const newGoal: GoalItem = {
      id: "g-" + Date.now(),
      title: data.title,
      current: 0,
      target: data.target,
      percent: 0,
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addCard = (data: {
    bankName: string;
    name: string;
    number: string;
    expiry: string;
    balance: number;
    type?: "zero" | "revolut" | "mastercard" | "generic";
  }) => {
    const newCard: CardItem = {
      id: "card-" + Date.now(),
      bankName: data.bankName,
      name: data.name || profile.name,
      number: data.number.startsWith("••••") ? data.number : `•••• ${data.number.slice(-4)}`,
      expiry: data.expiry || "12/28",
      type: data.type || "generic",
      balance: data.balance || 0,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setActiveCardIndex(0);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      if (data.name) {
        updated.avatarText = data.name.charAt(0).toUpperCase();
      }
      return updated;
    });
  };

  const resetAllData = () => {
    setCards([]);
    setActiveCardIndex(0);
    setTransactions([]);
    setSubscriptions([]);
    setGoals([]);
    setProfile(EMPTY_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("zero_auth_state_v5");
    localStorage.removeItem("zero_auth_state_v6");
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("Nessun movimento da esportare.");
      return;
    }
    const headers = ["ID", "Titolo", "Categoria", "Importo", "Tipo", "Data", "ID Carta"];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title}"`,
      `"${t.category}"`,
      t.amount,
      t.type,
      `"${t.date}"`,
      t.cardId,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ZERO_Movimenti_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMonthlySpending = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalMonthlyIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalMonthlySavings = activeCard?.balance ?? 0;

  const totalActiveSubscriptionsCost = subscriptions
    .filter((s) => s.active)
    .reduce((acc, s) => acc + (s.frequency === "anno" ? s.cost / 12 : s.cost), 0);

  return (
    <AppContext.Provider
      value={{
        cards,
        activeCardIndex,
        setActiveCardIndex,
        activeCard,
        transactions,
        subscriptions,
        goals,
        profile,
        initializeProfile,
        addTransaction,
        deleteTransaction,
        toggleSubscription,
        addSubscription,
        deleteSubscription,
        addMoneyToGoal,
        addGoal,
        deleteGoal,
        addCard,
        deleteCard,
        updateProfile,
        resetAllData,
        exportCSV,
        totalMonthlySpending,
        totalMonthlyIncome,
        totalMonthlySavings,
        totalActiveSubscriptionsCost,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
