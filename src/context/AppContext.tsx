"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CardItem {
  id: string;
  name: string;
  bankName: string;
  number: string;
  expiry: string;
  type: "revolut" | "zero" | "mastercard";
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
}

interface AppContextType {
  cards: CardItem[];
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
  activeCard: CardItem;
  transactions: TransactionItem[];
  subscriptions: SubscriptionItem[];
  goals: GoalItem[];
  profile: UserProfile;
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
  addMoneyToGoal: (id: string, amount: number) => void;
  addGoal: (data: { title: string; target: number }) => void;
  totalMonthlySpending: number;
  totalMonthlyIncome: number;
  totalMonthlySavings: number;
  totalActiveSubscriptionsCost: number;
}

const DEFAULT_CARDS: CardItem[] = [
  {
    id: "card-revolut",
    name: "Giada Morena",
    bankName: "Revolut",
    number: "•••• 8842",
    expiry: "04/27",
    type: "revolut",
    balance: 450.0,
  },
  {
    id: "card-zero",
    name: "Giada Morena",
    bankName: "ZERO",
    number: "•••• •••• 3377",
    expiry: "09/29",
    type: "zero",
    balance: 1245.8,
  },
  {
    id: "card-mastercard",
    name: "Giada Morena",
    bankName: "Mastercard",
    number: "•••• 1290",
    expiry: "11/28",
    type: "mastercard",
    balance: 890.0,
  },
];

const DEFAULT_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx-1",
    title: "Esselunga",
    category: "Cibo",
    amount: -42.8,
    date: "Oggi, 14:32",
    cardId: "card-zero",
    type: "expense",
  },
  {
    id: "tx-2",
    title: "Benzina Eni",
    category: "Trasporti",
    amount: -55.0,
    date: "Ieri, 18:11",
    cardId: "card-zero",
    type: "expense",
  },
  {
    id: "tx-3",
    title: "Stipendio Mensile",
    category: "Entrata",
    amount: 1800.0,
    date: "2 Settembre",
    cardId: "card-zero",
    type: "income",
  },
  {
    id: "tx-4",
    title: "Zara",
    category: "Shopping",
    amount: -49.95,
    date: "3 Settembre",
    cardId: "card-zero",
    type: "expense",
  },
  {
    id: "tx-5",
    title: "Farmacia",
    category: "Casa",
    amount: -12.5,
    date: "1 Settembre",
    cardId: "card-zero",
    type: "expense",
  },
];

const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: "1", name: "Netflix", cost: 6.99, frequency: "mese", date: "5 ott 2026", active: true, category: "Svago", color: "bg-red-500/10 text-red-600" },
  { id: "2", name: "Spotify", cost: 3.49, frequency: "mese", date: "10 ott 2026", active: true, category: "Musica", color: "bg-emerald-500/10 text-emerald-600" },
  { id: "3", name: "iCloud", cost: 0.99, frequency: "mese", date: "12 ott 2026", active: true, category: "Cloud", color: "bg-sky-500/10 text-sky-600" },
  { id: "4", name: "Google One", cost: 29.99, frequency: "anno", date: "20 nov 2026", active: true, category: "Cloud", color: "bg-amber-500/10 text-amber-600" },
  { id: "5", name: "Uno Bravo", cost: 49.0, frequency: "mese", date: "1 ott 2026", active: true, category: "Salute", color: "bg-indigo-500/10 text-indigo-600" },
  { id: "6", name: "Ho.", cost: 8.95, frequency: "mese", date: "3 ott 2026", active: true, category: "Telefono", color: "bg-purple-500/10 text-purple-600" },
];

const DEFAULT_GOALS: GoalItem[] = [
  { id: "g-1", title: "MacBook", current: 1240, target: 2000, percent: 62, completed: false },
  { id: "g-2", title: "Fondo viaggio", current: 900, target: 1500, percent: 60, completed: false },
  { id: "g-3", title: "Nuova fotocamera", current: 350, target: 800, percent: 44, completed: false },
  { id: "g-4", title: "Fondo emergenza", current: 1200, target: 3000, percent: 40, completed: false },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Giada Morena",
  email: "giada@zero.app",
  avatarText: "G",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardItem[]>(DEFAULT_CARDS);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(1); // Default ZERO card
  const [transactions, setTransactions] = useState<TransactionItem[]>(DEFAULT_TRANSACTIONS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(DEFAULT_SUBSCRIPTIONS);
  const [goals, setGoals] = useState<GoalItem[]>(DEFAULT_GOALS);
  const [profile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zero_app_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cards) setCards(parsed.cards);
        if (parsed.activeCardIndex !== undefined) setActiveCardIndex(parsed.activeCardIndex);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.goals) setGoals(parsed.goals);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "zero_app_state_v2",
        JSON.stringify({
          cards,
          activeCardIndex,
          transactions,
          subscriptions,
          goals,
        })
      );
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [cards, activeCardIndex, transactions, subscriptions, goals]);

  const activeCard = cards[activeCardIndex] || cards[0];

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
    const targetCardId = data.cardId || activeCard.id;
    const finalAmount = data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount);

    const newTx: TransactionItem = {
      id: "tx-" + Date.now(),
      title: data.title,
      category: data.category,
      amount: finalAmount,
      date: data.date || "Oggi, " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      cardId: targetCardId,
      type: data.type,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update target card balance
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

    // Revert card balance
    setCards((prevCards) =>
      prevCards.map((c) =>
        c.id === targetTx.cardId ? { ...c, balance: c.balance - targetTx.amount } : c
      )
    );
  };

  // Toggle Subscription
  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Add Subscription
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
      color: "bg-[#F5E050]/20 text-[#121212]",
    };
    setSubscriptions((prev) => [...prev, newSub]);
  };

  // Add Money to Goal
  const addMoneyToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newCurrent = g.current + amount;
        const newPercent = Math.min(100, Math.round((newCurrent / g.target) * 100));
        return {
          ...g,
          current: newCurrent,
          percent: newPercent,
          completed: newCurrent >= g.target,
        };
      })
    );
  };

  // Add Goal
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

  // Computed Totals
  const totalMonthlySpending = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalMonthlyIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalMonthlySavings = activeCard.balance;

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
        addTransaction,
        deleteTransaction,
        toggleSubscription,
        addSubscription,
        addMoneyToGoal,
        addGoal,
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
