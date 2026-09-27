"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

// ── Helper: map DB row → CardItem ────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToCard(row: any): CardItem {
  return {
    id: row.id,
    name: row.name,
    bankName: row.bank_name,
    number: row.number,
    expiry: row.expiry,
    type: row.type as CardItem["type"],
    balance: Number(row.balance),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToTransaction(row: any): TransactionItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    date: row.date,
    cardId: row.card_id || "",
    type: row.type as TransactionItem["type"],
    note: row.note,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToSubscription(row: any): SubscriptionItem {
  return {
    id: row.id,
    name: row.name,
    cost: Number(row.cost),
    frequency: row.frequency as SubscriptionItem["frequency"],
    date: row.date,
    active: row.active,
    category: row.category,
    color: row.color,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToGoal(row: any): GoalItem {
  return {
    id: row.id,
    title: row.title,
    current: Number(row.current),
    target: Number(row.target),
    percent: Number(row.percent),
    completed: row.completed,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Load data from Supabase when user session is available ────────
  useEffect(() => {
    const loadFromDB = async (uid: string) => {
      try {
        const [
          { data: cardsData },
          { data: txData },
          { data: subData },
          { data: goalsData },
          { data: profileData },
        ] = await Promise.all([
          supabase.from("cards").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("goals").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("profiles").select("*").eq("id", uid).single(),
        ]);

        if (cardsData) setCards(cardsData.map(dbToCard));
        if (txData) setTransactions(txData.map(dbToTransaction));
        if (subData) setSubscriptions(subData.map(dbToSubscription));
        if (goalsData) setGoals(goalsData.map(dbToGoal));
        if (profileData) {
          setProfile({
            name: profileData.name || "",
            email: profileData.email || "",
            avatarText: profileData.avatar_text || "",
            currency: profileData.currency || "EUR (€)",
            notificationsEnabled: profileData.notifications_enabled ?? true,
            theme: profileData.theme || "light",
          });
        }
      } catch (e) {
        console.error("Failed to load from Supabase, falling back to localStorage:", e);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      try {
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
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadFromDB(session.user.id);
      } else {
        loadFromLocalStorage();
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadFromDB(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => authSub.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage as cache ──────────────────────────────
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

  // ── Initialize profile after registration ─────────────────────────
  const initializeProfile = async (data: {
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

    // Update profile in Supabase if logged in
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        name: data.name,
        email: data.email,
        avatar_text: data.name.charAt(0).toUpperCase(),
      });
    }

    if (data.card) {
      const last4 = data.card.number.replace(/\s/g, "").slice(-4);
      const newCard: CardItem = {
        id: "card-" + Date.now(),
        name: data.name,
        bankName: data.card.bankName,
        number: `•••• ${last4}`,
        expiry: data.card.expiry || "00/00",
        type: "generic",
        balance: data.card.balance || 0,
      };

      // Save to Supabase if logged in
      if (userId) {
        const { data: inserted } = await supabase.from("cards").insert({
          user_id: userId,
          name: newCard.name,
          bank_name: newCard.bankName,
          number: newCard.number,
          expiry: newCard.expiry,
          type: newCard.type,
          balance: newCard.balance,
        }).select().single();
        if (inserted) {
          setCards([dbToCard(inserted)]);
        } else {
          setCards([newCard]);
        }
      } else {
        setCards([newCard]);
      }
      setActiveCardIndex(0);
    } else {
      setCards([]);
      setActiveCardIndex(0);
    }
    setTransactions([]);
    setSubscriptions([]);
    setGoals([]);
  };

  // ── Add Transaction ────────────────────────────────────────────────
  const addTransaction = async (data: {
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
    const dateStr =
      data.date ||
      "Oggi, " +
        new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

    // Optimistic update
    const tempId = "tx-" + Date.now();
    const newTx: TransactionItem = {
      id: tempId,
      title: data.title,
      category: data.category,
      amount: finalAmount,
      date: dateStr,
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

    // Persist to Supabase
    if (userId) {
      const { data: inserted } = await supabase.from("transactions").insert({
        user_id: userId,
        title: data.title,
        category: data.category,
        amount: finalAmount,
        date: dateStr,
        card_id: targetCardId || null,
        type: data.type,
        note: data.note || null,
      }).select().single();

      // Replace temp ID with real UUID
      if (inserted) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === tempId ? dbToTransaction(inserted) : t))
        );
      }

      // Update card balance in DB
      if (targetCardId) {
        const card = cards.find((c) => c.id === targetCardId);
        if (card) {
          await supabase.from("cards").update({
            balance: Math.max(0, card.balance + finalAmount),
          }).eq("id", targetCardId).eq("user_id", userId);
        }
      }
    }
  };

  // ── Delete Transaction ─────────────────────────────────────────────
  const deleteTransaction = async (id: string) => {
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

    if (userId) {
      await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
      if (targetTx.cardId) {
        const card = cards.find((c) => c.id === targetTx.cardId);
        if (card) {
          await supabase.from("cards").update({
            balance: Math.max(0, card.balance - targetTx.amount),
          }).eq("id", targetTx.cardId).eq("user_id", userId);
        }
      }
    }
  };

  // ── Subscriptions ──────────────────────────────────────────────────
  const toggleSubscription = async (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    if (userId) {
      const sub = subscriptions.find((s) => s.id === id);
      if (sub) {
        await supabase.from("subscriptions").update({ active: !sub.active }).eq("id", id).eq("user_id", userId);
      }
    }
  };

  const addSubscription = async (data: {
    name: string;
    cost: number;
    frequency: "mese" | "anno";
    date: string;
    category: string;
  }) => {
    const tempId = "sub-" + Date.now();
    const newSub: SubscriptionItem = {
      id: tempId,
      name: data.name,
      cost: data.cost,
      frequency: data.frequency,
      date: data.date,
      active: true,
      category: data.category,
      color: "#FDC909",
    };
    setSubscriptions((prev) => [...prev, newSub]);

    if (userId) {
      const { data: inserted } = await supabase.from("subscriptions").insert({
        user_id: userId,
        name: data.name,
        cost: data.cost,
        frequency: data.frequency,
        date: data.date,
        active: true,
        category: data.category,
        color: "#FDC909",
      }).select().single();
      if (inserted) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === tempId ? dbToSubscription(inserted) : s))
        );
      }
    }
  };

  const deleteSubscription = async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    if (userId) {
      await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", userId);
    }
  };

  // ── Goals ──────────────────────────────────────────────────────────
  const addMoneyToGoal = async (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newCurrent = g.current + amount;
        const newPercent = Math.min(100, Math.round((newCurrent / g.target) * 100));
        return { ...g, current: newCurrent, percent: newPercent, completed: newCurrent >= g.target };
      })
    );
    if (userId) {
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        const newCurrent = goal.current + amount;
        const newPercent = Math.min(100, Math.round((newCurrent / goal.target) * 100));
        await supabase.from("goals").update({
          current: newCurrent,
          percent: newPercent,
          completed: newCurrent >= goal.target,
        }).eq("id", id).eq("user_id", userId);
      }
    }
  };

  const addGoal = async (data: { title: string; target: number }) => {
    const tempId = "g-" + Date.now();
    const newGoal: GoalItem = {
      id: tempId,
      title: data.title,
      current: 0,
      target: data.target,
      percent: 0,
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);

    if (userId) {
      const { data: inserted } = await supabase.from("goals").insert({
        user_id: userId,
        title: data.title,
        current: 0,
        target: data.target,
        percent: 0,
        completed: false,
      }).select().single();
      if (inserted) {
        setGoals((prev) =>
          prev.map((g) => (g.id === tempId ? dbToGoal(inserted) : g))
        );
      }
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (userId) {
      await supabase.from("goals").delete().eq("id", id).eq("user_id", userId);
    }
  };

  // ── Cards ──────────────────────────────────────────────────────────
  const addCard = async (data: {
    bankName: string;
    name: string;
    number: string;
    expiry: string;
    balance: number;
    type?: "zero" | "revolut" | "mastercard" | "generic";
  }) => {
    const last4 = data.number.replace(/\s/g, "").slice(-4);
    const formattedNumber = data.number.startsWith("••••") ? data.number : `•••• ${last4}`;
    const tempId = "card-" + Date.now();

    const newCard: CardItem = {
      id: tempId,
      bankName: data.bankName,
      name: data.name || profile.name,
      number: formattedNumber,
      expiry: data.expiry || "12/28",
      type: data.type || "generic",
      balance: data.balance || 0,
    };
    setCards((prev) => [...prev, newCard]);

    if (userId) {
      const { data: inserted } = await supabase.from("cards").insert({
        user_id: userId,
        name: newCard.name,
        bank_name: newCard.bankName,
        number: newCard.number,
        expiry: newCard.expiry,
        type: newCard.type,
        balance: newCard.balance,
      }).select().single();
      if (inserted) {
        setCards((prev) =>
          prev.map((c) => (c.id === tempId ? dbToCard(inserted) : c))
        );
      }
    }
  };

  const deleteCard = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setActiveCardIndex(0);
    if (userId) {
      await supabase.from("cards").delete().eq("id", id).eq("user_id", userId);
    }
  };

  // ── Profile ────────────────────────────────────────────────────────
  const updateProfile = async (data: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      if (data.name) updated.avatarText = data.name.charAt(0).toUpperCase();
      return updated;
    });

    if (userId) {
      await supabase.from("profiles").update({
        ...(data.name !== undefined && { name: data.name, avatar_text: data.name.charAt(0).toUpperCase() }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.notificationsEnabled !== undefined && { notifications_enabled: data.notificationsEnabled }),
        ...(data.theme !== undefined && { theme: data.theme }),
      }).eq("id", userId);
    }
  };

  // ── Reset all data ─────────────────────────────────────────────────
  const resetAllData = async () => {
    setCards([]);
    setActiveCardIndex(0);
    setTransactions([]);
    setSubscriptions([]);
    setGoals([]);
    setProfile(EMPTY_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("zero_auth_state_v5");
    localStorage.removeItem("zero_auth_state_v6");

    // Sign out from Supabase
    if (userId) {
      await supabase.auth.signOut();
      setUserId(null);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────
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
    link.setAttribute("download", `ZERO_Movimenti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Computed values ────────────────────────────────────────────────
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
