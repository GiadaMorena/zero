"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { validMonthlyBudget, monthlySummary } from "@/lib/monthlyBudget";
import { changedBalances, persistTransactionChange, type TransactionEdit } from "@/lib/transactionChanges";
import { goalProgress, validGoal } from "@/lib/goalProgress";
import { notifySaved } from "@/lib/saveFeedback";
import { SaveFeedback } from "@/components/SaveFeedback";
import { validSubscription } from "@/lib/subscriptionFields";
import { persistCardTransfer, transferFromRow, validateCardTransfer, type CardTransferInput, type CardTransferItem } from "@/lib/cardTransfers";

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
  createdAt?: string;
}

export interface SubscriptionItem {
  createdAt?: string;
  id: string;
  name: string;
  cost: number;
  frequency: "mese" | "anno";
  date: string;
  active: boolean;
  category: string;
  color: string;
}
export type SubscriptionInput = Pick<SubscriptionItem,"name"|"cost"|"frequency"|"date"|"category">;

export interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  percent: number;
  completed: boolean;
}

export interface ProtectionItem {
  id: string;
  title: string;
  provider: string;
  type: "assicurazione" | "pensione" | "pac";
  category: string;
  amount: number;
  amountType: "premio_annuale" | "premio_mensile" | "valore_maturato" | "versamento_periodico";
  policyNumber?: string;
  renewalDate?: string;
  note?: string;
  active: boolean;
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
  isHydrated: boolean;
  monthlyBudget: number | null;
  updateMonthlyBudget: (value: number | null) => Promise<{ error?: string }>;
  cards: CardItem[];
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
  activeCard: CardItem | null;
  transactions: TransactionItem[];
  transfers: CardTransferItem[];
  transfersLoading: boolean;
  transferLoadError: string;
  addTransfer: (data: CardTransferInput, requestId: string) => Promise<{ error?: string }>;
  subscriptions: SubscriptionItem[];
  goals: GoalItem[];
  primaryGoalId: string | null;
  setPrimaryGoal: (id: string) => Promise<{ error?: string }>;
  updateGoal: (id: string, data: { title: string; target: number; current: number }) => Promise<{ error?: string }>;
  protections: ProtectionItem[];
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
  }) => Promise<{ error?: string }>;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, data: TransactionEdit) => Promise<{ error?: string }>;
  toggleSubscription: (id: string) => Promise<{ error?: string }>;
  addSubscription: (data: SubscriptionInput, requestId?: string) => Promise<{ error?: string }>;
  updateSubscription: (id: string, data: SubscriptionInput) => Promise<{ error?: string }>;
  deleteSubscription: (id: string) => Promise<{ error?: string }>;
  addMoneyToGoal: (id: string, amount: number) => Promise<{ error?: string }>;
  addGoal: (data: { title: string; target: number }) => Promise<{ error?: string }>;
  deleteGoal: (id: string) => Promise<{ error?: string }>;
  addProtection: (data: {
    title: string;
    provider: string;
    type: "assicurazione" | "pensione" | "pac";
    category: string;
    amount: number;
    amountType: "premio_annuale" | "premio_mensile" | "valore_maturato" | "versamento_periodico";
    policyNumber?: string;
    renewalDate?: string;
    note?: string;
  }) => void;
  deleteProtection: (id: string) => void;
  toggleProtection: (id: string) => void;
  addCard: (data: {
    bankName: string;
    name: string;
    number: string;
    expiry: string;
    balance: number;
    type?: "zero" | "revolut" | "mastercard" | "generic";
  }) => void;
  deleteCard: (id: string) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
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
    createdAt: row.created_at,
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
    createdAt: row.created_at,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToProtection(row: any): ProtectionItem {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider || "",
    type: (row.type || "assicurazione") as ProtectionItem["type"],
    category: row.category || "Altro",
    amount: Number(row.amount) || 0,
    amountType: (row.amount_type || row.amountType || "premio_annuale") as ProtectionItem["amountType"],
    policyNumber: row.policy_number || row.policyNumber,
    renewalDate: row.renewal_date || row.renewalDate,
    note: row.note,
    active: row.active ?? true,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [protections, setProtections] = useState<ProtectionItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [movementNotice, setMovementNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [primaryGoalId, setPrimaryGoalId] = useState<string | null>(null);
  const [transferState, setTransferState] = useState<{ owner: string | null; items: CardTransferItem[]; loading: boolean; error: string }>({ owner: null, items: [], loading: false, error: "" });
  const transferAccount = useRef<{ id: string | null; epoch: number }>({ id: null, epoch: 0 });
  const transferAlive = useRef(true);
  const goalBusy = useRef(false);
  const subscriptionBusy = useRef(false);
  const movementBusy = useRef(false);
  const deletionCommit = useRef<(id: string) => Promise<{ error?: string }>>(async () => ({}));
  useEffect(() => { setPendingDelete(null); setMovementNotice(""); }, [userId]);
  useEffect(() => {
    if (!pendingDelete) return;
    const timer = window.setTimeout(async () => {
      setDeleting(true);
      const result = await deletionCommit.current(pendingDelete);
      setPendingDelete(null);
      setDeleting(false);
      setMovementNotice(result.error || "Movimento eliminato.");
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [pendingDelete]);

  // ── Load data from Supabase when user session is available ────────
  useEffect(() => {
    let loadingUserId: string | null = null;
    let active = true;
    let authRevision = 0;
    transferAlive.current = true;
    const changeTransferAccount = (id: string | null) => {
      if (transferAccount.current.id === id) return;
      transferAccount.current = { id, epoch: transferAccount.current.epoch + 1 };
      setTransferState({ owner: id, items: [], loading: !!id, error: "" });
    };
    const loadFromDB = async (uid: string, accountEmail?: string) => {
      if (loadingUserId === uid) return;
      loadingUserId = uid;
      const accountEpoch = transferAccount.current.epoch;
      try {
        const [
          { data: cardsData },
          { data: txData },
          { data: subData },
          { data: goalsData },
          { data: protectionsData },
          { data: profileData },
        ] = await Promise.all([
          supabase.from("cards").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("goals").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("protections").select("*").eq("user_id", uid).order("created_at").then((r) => r, () => ({ data: null })),
          supabase.from("profiles").select("*").eq("id", uid).single(),
        ]);

        if (!active || transferAccount.current.id !== uid || transferAccount.current.epoch !== accountEpoch) return;
        if (cardsData) setCards(cardsData.map(dbToCard));
        if (txData) setTransactions(txData.map(dbToTransaction));
        if (subData) setSubscriptions(subData.map(dbToSubscription));
        if (goalsData) setGoals(goalsData.map(dbToGoal));
        if (protectionsData && Array.isArray(protectionsData)) {
          setProtections(protectionsData.map(dbToProtection));
        }
        if (profileData) {
          setProfile({
            name: profileData.name || "",
            email: accountEmail || profileData.email || "",
            avatarText: profileData.avatar_text || "",
            currency: profileData.currency || "EUR (€)",
            notificationsEnabled: profileData.notifications_enabled ?? true,
            theme: profileData.theme || "light",
          });
        }
      } catch (e) {
        if (!active || transferAccount.current.id !== uid || transferAccount.current.epoch !== accountEpoch) return;
        console.error("Failed to load from Supabase, falling back to localStorage:", e);
        loadFromLocalStorage(false);
      } finally {
        if (loadingUserId === uid) loadingUserId = null;
        if (active && transferAccount.current.id === uid && transferAccount.current.epoch === accountEpoch) setIsHydrated(true);
      }
    };

    const loadFromLocalStorage = (restoreBudget = true) => {
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
          if (parsed.protections) setProtections(parsed.protections);
          if (parsed.profile) setProfile(parsed.profile);
          if (restoreBudget) setMonthlyBudget(validMonthlyBudget(parsed.monthlyBudget));
          if (restoreBudget) setPrimaryGoalId(typeof parsed.primaryGoalId === "string" ? parsed.primaryGoalId : null);
        }
      } catch (e) {
        console.error("Failed to load state from localStorage:", e);
      } finally {
        setIsHydrated(true);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || authRevision !== 0) return;
      changeTransferAccount(session?.user?.id || null);
      if (session?.user) {
        setUserId(session.user.id);
        setMonthlyBudget(validMonthlyBudget(session.user.user_metadata?.zero_monthly_budget));
        setPrimaryGoalId(typeof session.user.user_metadata?.zero_primary_goal_id === "string" ? session.user.user_metadata.zero_primary_goal_id : null);
        loadFromDB(session.user.id, session.user.email);
      } else {
        loadFromLocalStorage();
      }
    }).catch(() => { if (active && authRevision === 0) loadFromLocalStorage(); });

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      authRevision += 1;
      changeTransferAccount(session?.user?.id || null);
      if (session?.user) {
        setUserId(session.user.id);
        setMonthlyBudget(validMonthlyBudget(session.user.user_metadata?.zero_monthly_budget));
        setPrimaryGoalId(typeof session.user.user_metadata?.zero_primary_goal_id === "string" ? session.user.user_metadata.zero_primary_goal_id : null);
        loadFromDB(session.user.id, session.user.email);
      } else {
        setUserId(null);
      }
    });

    return () => {
      active = false;
      transferAlive.current = false;
      transferAccount.current = { id: null, epoch: transferAccount.current.epoch + 1 };
      authSub.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Transfers are a separate ledger. Its cache and asynchronous reads always
  // belong to one authenticated account; they never enter expense/income totals.
  useEffect(() => {
    const uid = userId;
    const epoch = transferAccount.current.epoch;
    let live = true;
    const current = () => live && transferAlive.current && transferAccount.current.id === uid && transferAccount.current.epoch === epoch;
    if (!uid || transferAccount.current.id !== uid) {
      setTransferState({ owner: null, items: [], loading: false, error: "" });
      return () => { live = false; };
    }
    const key = `zero_card_transfers_v1:${uid}`;
    let cached: CardTransferItem[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved?.owner === uid && Array.isArray(saved.rows)) cached = saved.rows.map(transferFromRow).filter((item: CardTransferItem | null): item is CardTransferItem => !!item);
    } catch { /* A failed cache read does not prevent loading from the server. */ }
    setTransferState({ owner: uid, items: cached, loading: true, error: "" });
    void (async () => {
      try {
        const { data, error } = await supabase.from("card_transfers").select("*").eq("user_id", uid).order("created_at", { ascending: false });
        if (!current()) return;
        if (error || !Array.isArray(data)) throw Error("transfer-load");
        const items = data.map(transferFromRow).filter((item): item is CardTransferItem => !!item);
        setTransferState(previous => {
          if (!current()) return previous;
          const confirmed = previous.owner === uid ? previous.items : [];
          const merged = [...new Map([...confirmed, ...items].map(item => [item.id, item])).values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return { owner: uid, items: merged, loading: false, error: "" };
        });
      } catch {
        if (current()) setTransferState(previous => current() ? { owner: uid, items: previous.owner === uid ? previous.items : cached, loading: false, error: "Non riesco a caricare lo storico dei trasferimenti. Controlla la connessione e riapri l’app." } : previous);
      }
    })();
    return () => { live = false; };
  }, [userId]);

  useEffect(() => {
    if (!userId || transferState.owner !== userId || transferAccount.current.id !== userId || transferState.loading || transferState.error) return;
    try {
      const rows = transferState.items.map(item => ({ id: item.id, from_card_id: item.fromCardId, to_card_id: item.toCardId, from_label: item.fromLabel, to_label: item.toLabel, amount: item.amount, date: item.date, note: item.note || null, created_at: item.createdAt }));
      localStorage.setItem(`zero_card_transfers_v1:${userId}`, JSON.stringify({ owner: userId, rows }));
    } catch { /* The server is the source of truth when device storage is full. */ }
  }, [userId, transferState]);

  // ── Persist to localStorage as cache ──────────────────────────────
  useEffect(() => {
    // Do not replace the saved draft/account cache with initial empty state.
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cards, activeCardIndex, transactions, subscriptions, goals, protections, profile, monthlyBudget, primaryGoalId })
      );
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [isHydrated, cards, activeCardIndex, transactions, subscriptions, goals, protections, profile, monthlyBudget, primaryGoalId]);

  // ── Helper to always get valid user ID from Supabase session ──────
  const getEffectiveUserId = async (): Promise<string | null> => {
    if (userId) return userId;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
      return session.user.id;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      setUserId(user.id);
      return user.id;
    }
    return null;
  };

  const activeCard = cards[activeCardIndex] ?? null;

  // ── Initialize profile after registration ─────────────────────────
  const initializeProfile = async (data: {
    name: string;
    email: string;
    card?: { bankName: string; number: string; expiry: string; balance: number };
  }) => {
    setTransferState({ owner: userId, items: [], loading: false, error: "" });
    const newProfile: UserProfile = {
      name: data.name,
      email: data.email,
      avatarText: data.name.charAt(0).toUpperCase(),
      currency: "EUR (€)",
      notificationsEnabled: true,
      theme: "light",
    };
    setProfile(newProfile);

    const uid = await getEffectiveUserId();

    // Update profile in Supabase if logged in
    if (uid) {
      await supabase.from("profiles").upsert({
        id: uid,
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
      if (uid) {
        const { data: inserted } = await supabase.from("cards").insert({
          user_id: uid,
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
  const addTransfer = async (data: CardTransferInput, requestId: string): Promise<{ error?: string }> => {
    const invalid = validateCardTransfer(data);
    if (invalid) return { error: invalid };
    if (pendingDelete || movementBusy.current) return { error: "Attendi il salvataggio in corso oppure annulla l’eliminazione del movimento." };
    if (!cards.some(card => card.id === data.fromCardId) || !cards.some(card => card.id === data.toCardId)) return { error: "Scegli due carte disponibili per registrare il trasferimento." };
    movementBusy.current = true;
    const epoch = transferAccount.current.epoch;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (error || !uid || uid !== userId || transferAccount.current.id !== uid || transferAccount.current.epoch !== epoch) return { error: "Accedi a ZERO per registrare un trasferimento tra le tue carte." };
      const result = await persistCardTransfer(supabase, data, requestId);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !transferAlive.current || currentSession?.user?.id !== uid || transferAccount.current.id !== uid || transferAccount.current.epoch !== epoch) {
        return { error: "L’account è cambiato durante il salvataggio. Riapri l’account di partenza per verificare il trasferimento." };
      }
      if (!("transfer" in result)) return { error: result.error };
      if (!result.transfer || !result.balances) return { error: "Non riesco a confermare il salvataggio. Riprova senza cambiare i dati del trasferimento." };
      const transfer = result.transfer;
      const stillCurrent = () => transferAlive.current && transferAccount.current.id === uid && transferAccount.current.epoch === epoch;
      setCards(previous => !stillCurrent() ? previous : previous.map(card => {
        const changed = result.balances?.find(item => item.id === card.id);
        return changed ? { ...card, balance: changed.balance } : card;
      }));
      setTransferState(previous => stillCurrent() ? { owner: uid, items: [transfer, ...(previous.owner === uid ? previous.items.filter(item => item.id !== transfer.id) : [])], loading: false, error: "" } : previous);
      notifySaved("Trasferimento registrato");
      return {};
    } catch {
      return { error: "Non riesco a confermare il trasferimento. Controlla la connessione e riprova senza cambiare i dati: non verrà registrato due volte." };
    } finally { movementBusy.current = false; }
  };

  const addTransaction = async (data: {
    title: string;
    category: string;
    amount: number;
    type: "expense" | "income";
    note?: string;
    date?: string;
    cardId?: string;
  }) => {
    if (!data.title.trim() || !Number.isFinite(data.amount) || data.amount < .01 || !Number.isSafeInteger(Math.round(data.amount * 100))) {
      return { error: "Inserisci una descrizione e un importo valido maggiore di zero." };
    }
    const targetCardId = data.cardId ?? activeCard?.id ?? "";
    if (targetCardId && !cards.some(card => card.id === targetCardId)) {
      return { error: "La carta selezionata non è più disponibile. Scegline un’altra o Nessuna carta." };
    }
    if (movementBusy.current) return { error: "Attendi il salvataggio in corso, poi riprova." };
    movementBusy.current = true;
    const finalAmount = data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount);
    const originalBalance = cards.find(card => card.id === targetCardId)?.balance;
    const appliedBalance = originalBalance === undefined ? undefined : Math.max(0, originalBalance + finalAmount);
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
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setCards((prevCards) =>
      prevCards.map((c) =>
        c.id === targetCardId ? { ...c, balance: Math.max(0, c.balance + finalAmount) } : c
      )
    );

    const rollback = () => {
      setTransactions(prev => prev.filter(tx => tx.id !== tempId));
      if (originalBalance !== undefined && appliedBalance !== undefined) {
        setCards(prev => prev.map(card => card.id === targetCardId
          ? { ...card, balance: Math.max(0, originalBalance + card.balance - appliedBalance) } : card));
      }
    };
    // Persist to Supabase. A failed insert must not leave a phantom transaction.
    let persisted = false;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { data: inserted, error } = await supabase.from("transactions").insert({
          user_id: uid,
          title: data.title,
          category: data.category,
          amount: finalAmount,
          date: dateStr,
          card_id: targetCardId || null,
          type: data.type,
          note: data.note || null,
        }).select().single();

        if (error || !inserted) {
          rollback();
          return { error: "Non è stato possibile salvare. Riprova: i dati inseriti sono ancora qui." };
        }
        persisted = true;

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
            }).eq("id", targetCardId).eq("user_id", uid);
          }
        }
      }
      notifySaved(data.type === "expense" ? "Spesa salvata" : "Entrata salvata");
      return {};
    } catch {
      // The movement is already saved; do not prompt a duplicate retry if a later balance refresh fails.
      if (persisted) return {};
      rollback();
      return { error: "Connessione non disponibile. Riprova: i dati inseriti sono ancora qui." };
    } finally { movementBusy.current = false; }
  };

  const changeTransaction = async (id: string, data: TransactionEdit | null): Promise<{ error?: string }> => {
    if (movementBusy.current) return { error: "Attendi il salvataggio in corso, poi riprova." };
    const original = transactions.find(tx => tx.id === id);
    if (!original) return { error: "Questo movimento non è più disponibile." };
    if (data && (!Number.isFinite(data.amount) || data.amount <= 0 || !data.title.trim() || !data.category.trim() || !data.date.trim())) return { error: "Controlla importo, descrizione, categoria e data." };
    if (data?.cardId && data.cardId !== original.cardId && !cards.some(card => card.id === data.cardId)) return { error: "Scegli una carta disponibile." };
    const replacement: TransactionItem | null = data ? { ...original, ...data, amount: Math.round(Math.abs(data.amount) * 100) / 100 * (data.type === "expense" ? -1 : 1) } : null;
    movementBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const result = await persistTransactionChange(supabase, uid, original, replacement);
        if (result.error) return result;
        setCards(prev => prev.map(card => {
          const changed = result.balances?.find(item => item.id === card.id);
          return changed ? { ...card, balance: changed.balance } : card;
        }));
      } else setCards(prev => changedBalances(prev, original, replacement));
      setTransactions(prev => replacement ? prev.map(tx => tx.id === id ? replacement : tx) : prev.filter(tx => tx.id !== id));
      if (replacement) notifySaved("Movimento aggiornato");
      return {};
    } catch { return { error: "Connessione non disponibile. Il movimento è ancora qui." }; }
    finally { movementBusy.current = false; }
  };
  const updateTransaction = (id: string, data: TransactionEdit) => changeTransaction(id, data);
  deletionCommit.current = id => changeTransaction(id, null);
  const deleteTransaction = (id: string) => {
    if (pendingDelete || movementBusy.current) { setMovementNotice("Attendi l’eliminazione in corso oppure premi Annulla."); return; }
    if (!transactions.some(tx => tx.id === id)) return;
    setMovementNotice("");
    setPendingDelete(id);
  };

  // Subscription changes are confirmed by persistence before altering the local list.
  const subscriptionError = {
    error:
      "Salvataggio non riuscito. I dati inseriti sono ancora qui: puoi riprovare.",
  };
  const recoveredSubscription = async (
    uid: string,
    id: string,
    expected: Partial<SubscriptionItem>,
  ) => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq("user_id", uid)
        .maybeSingle();
      if (
        !error &&
        data &&
        Object.entries(expected).every(([key, value]) => data[key] === value)
      )
        return dbToSubscription(data);
    } catch {
      /* A failed read cannot establish that the write succeeded. */
    }
    return null;
  };
  const toggleSubscription = async (id: string): Promise<{ error?: string }> => {
    const original = subscriptions.find((item) => item.id === id);
    if (!original || subscriptionBusy.current)
      return { error: "Attendi il salvataggio in corso e riprova." };
    subscriptionBusy.current = true;
    try {
      const uid = await getEffectiveUserId(),
        active = !original.active;
      let next = { ...original, active };
      if (uid) {
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .update({ active })
            .eq("id", id)
            .eq("user_id", uid)
            .eq("active", original.active)
            .select("*")
            .single();
          if (error || !data) {
            const recovered = await recoveredSubscription(uid, id, { active });
            if (!recovered) return subscriptionError;
            next = recovered;
          } else next = dbToSubscription(data);
        } catch {
          const recovered = await recoveredSubscription(uid, id, { active });
          if (!recovered) return subscriptionError;
          next = recovered;
        }
      }
      setSubscriptions((previous) =>
        previous.map((item) => (item.id === id ? next : item)),
      );
      notifySaved(
        active
          ? "Abbonamento incluso nel riepilogo"
          : "Abbonamento escluso dal riepilogo",
      );
      return {};
    } catch {
      return subscriptionError;
    } finally {
      subscriptionBusy.current = false;
    }
  };
  const addSubscription = async (
    data: SubscriptionInput,
    requestId?: string,
  ): Promise<{ error?: string }> => {
    if (subscriptionBusy.current)
      return { error: "Attendi il salvataggio in corso." };
    if (!validSubscription(data))
      return { error: "Controlla nome, costo e giorno del rinnovo." };
    subscriptionBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      const id = requestId || (uid ? crypto.randomUUID() : "sub-" + Date.now());
      const payload = {
        name: data.name.trim(),
        cost: Math.round(data.cost * 100) / 100,
        frequency: data.frequency,
        date: data.date,
        category: data.category.trim(),
        active: true,
        color: "#FDC909",
      };
      let next: SubscriptionItem = { id, ...payload };
      if (uid) {
        try {
          const { data: saved, error } = await supabase
            .from("subscriptions")
            .insert({ id, user_id: uid, ...payload })
            .select("*")
            .single();
          if (error || !saved) {
            const recovered = await recoveredSubscription(uid, id, payload);
            if (!recovered) return subscriptionError;
            next = recovered;
          } else next = dbToSubscription(saved);
        } catch {
          const recovered = await recoveredSubscription(uid, id, payload);
          if (!recovered) return subscriptionError;
          next = recovered;
        }
      }
      setSubscriptions((previous) =>
        previous.some((item) => item.id === next.id)
          ? previous.map((item) => (item.id === next.id ? next : item))
          : [...previous, next],
      );
      notifySaved("Abbonamento salvato");
      return {};
    } catch {
      return subscriptionError;
    } finally {
      subscriptionBusy.current = false;
    }
  };
  const updateSubscription = async (
    id: string,
    data: SubscriptionInput,
  ): Promise<{ error?: string }> => {
    const original = subscriptions.find((item) => item.id === id);
    if (!original || !validSubscription(data))
      return { error: "Controlla nome, costo e giorno del rinnovo." };
    if (subscriptionBusy.current)
      return { error: "Attendi il salvataggio in corso." };
    const payload = {
      name: data.name.trim(),
      cost: Math.round(data.cost * 100) / 100,
      frequency: data.frequency,
      date: data.date,
      category: data.category.trim(),
    };
    subscriptionBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      let next = { ...original, ...payload };
      if (uid) {
        try {
          const { data: saved, error } = await supabase
            .from("subscriptions")
            .update(payload)
            .eq("id", id)
            .eq("user_id", uid)
            .eq("name", original.name)
            .eq("cost", original.cost)
            .eq("frequency", original.frequency)
            .eq("date", original.date)
            .eq("active", original.active)
            .select("*")
            .single();
          if (error || !saved) {
            const recovered = await recoveredSubscription(uid, id, payload);
            if (!recovered) return subscriptionError;
            next = recovered;
          } else next = dbToSubscription(saved);
        } catch {
          const recovered = await recoveredSubscription(uid, id, payload);
          if (!recovered) return subscriptionError;
          next = recovered;
        }
      }
      setSubscriptions((previous) =>
        previous.map((item) => (item.id === id ? next : item)),
      );
      notifySaved("Abbonamento aggiornato");
      return {};
    } catch {
      return subscriptionError;
    } finally {
      subscriptionBusy.current = false;
    }
  };
  const deleteSubscription = async (id: string): Promise<{ error?: string }> => {
    if (subscriptionBusy.current)
      return { error: "Attendi il salvataggio in corso." };
    if (!subscriptions.some((item) => item.id === id))
      return { error: "Questo abbonamento non è più presente." };
    subscriptionBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { data, error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("id", id)
          .eq("user_id", uid)
          .select("id")
          .single();
        if (error || !data) return subscriptionError;
      }
      setSubscriptions((previous) => previous.filter((item) => item.id !== id));
      notifySaved("Abbonamento rimosso da ZERO");
      return {};
    } catch {
      return subscriptionError;
    } finally {
      subscriptionBusy.current = false;
    }
  };

  // Goals are persisted before their progress changes on screen.
  const goalError = { error: "Non è stato possibile salvare l’obiettivo. Riprova: i dati inseriti sono ancora qui." };
  const setPrimaryGoal = async (id: string): Promise<{ error?: string }> => {
    const goal = goals.find(item => item.id === id);
    if (!goal || goalProgress(goal).completed) return { error: "Scegli un obiettivo ancora in corso." };
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { error } = await supabase.auth.updateUser({ data: { zero_primary_goal_id: id } });
        if (error) return goalError;
      }
      setPrimaryGoalId(id);
      notifySaved("Obiettivo principale aggiornato");
      return {};
    } catch { return goalError; }
  };
  const updateGoal = async (id: string, data: { title: string; target: number; current: number }): Promise<{ error?: string }> => {
    if (goalBusy.current) return { error: "Attendi il salvataggio in corso." };
    const original = goals.find(item => item.id === id);
    if (!original || !validGoal(data.title, data.target, data.current)) return { error: "Controlla titolo e importi dell’obiettivo." };
    const next = { ...original, title: data.title.trim(), target: Math.round(data.target * 100) / 100, current: Math.round(data.current * 100) / 100 };
    Object.assign(next, goalProgress(next));
    goalBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { data: saved, error } = await supabase.from("goals").update({ title: next.title, target: next.target, current: next.current, percent: next.percent, completed: next.completed }).eq("id", id).eq("user_id", uid).eq("current", original.current).eq("target", original.target).eq("title", original.title).select("*").single();
        if (error || !saved) return goalError;
      }
      setGoals(prev => prev.map(item => item.id === id ? next : item));
      notifySaved(next.completed && !goalProgress(original).completed ? "Obiettivo raggiunto!" : "Obiettivo aggiornato");
      return {};
    } catch { return goalError; }
    finally { goalBusy.current = false; }
  };
  const addMoneyToGoal = async (id: string, amount: number): Promise<{ error?: string }> => {
    const goal = goals.find(item => item.id === id);
    if (!goal || !Number.isFinite(amount) || amount < .01) return { error: "Inserisci un importo valido maggiore di zero." };
    return updateGoal(id, { title: goal.title, target: goal.target, current: (Math.round(goal.current * 100) + Math.round(amount * 100)) / 100 });
  };
  const addGoal = async (data: { title: string; target: number }): Promise<{ error?: string }> => {
    if (goalBusy.current) return { error: "Attendi il salvataggio in corso." };
    if (!validGoal(data.title, data.target, 0)) return { error: "Inserisci un titolo e un importo valido maggiore di zero." };
    const newGoal: GoalItem = { id: "g-" + Date.now(), title: data.title.trim(), target: Math.round(data.target * 100) / 100, current: 0, percent: 0, completed: false };
    goalBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { data: saved, error } = await supabase.from("goals").insert({ user_id: uid, title: newGoal.title, target: newGoal.target, current: 0, percent: 0, completed: false }).select("*").single();
        if (error || !saved) return goalError;
        Object.assign(newGoal, dbToGoal(saved));
      }
      setGoals(prev => [...prev, newGoal]);
      notifySaved("Obiettivo creato");
      return {};
    } catch { return goalError; }
    finally { goalBusy.current = false; }
  };
  const deleteGoal = async (id: string): Promise<{ error?: string }> => {
    if (goalBusy.current) return { error: "Attendi il salvataggio in corso." };
    goalBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { data: removed, error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", uid).select("id").single();
        if (error || !removed) return goalError;
      }
      setGoals(prev => prev.filter(item => item.id !== id));
      if (primaryGoalId === id) setPrimaryGoalId(null);
      return {};
    } catch { return goalError; }
    finally { goalBusy.current = false; }
  };
  // ── Assicurazioni, Previdenza & PAC (Non calcolate sul totale) ────
  const addProtection = async (data: {
    title: string;
    provider: string;
    type: "assicurazione" | "pensione" | "pac";
    category: string;
    amount: number;
    amountType: "premio_annuale" | "premio_mensile" | "valore_maturato" | "versamento_periodico";
    policyNumber?: string;
    renewalDate?: string;
    note?: string;
  }) => {
    const tempId = "prot-" + Date.now();
    const newProt: ProtectionItem = {
      id: tempId,
      title: data.title,
      provider: data.provider,
      type: data.type,
      category: data.category,
      amount: data.amount,
      amountType: data.amountType,
      policyNumber: data.policyNumber,
      renewalDate: data.renewalDate,
      note: data.note,
      active: true,
    };
    setProtections((prev) => [...prev, newProt]);

    const uid = await getEffectiveUserId();
    if (uid) {
      try {
        const { data: inserted } = await supabase.from("protections").insert({
          user_id: uid,
          title: newProt.title,
          provider: newProt.provider,
          type: newProt.type,
          category: newProt.category,
          amount: newProt.amount,
          amount_type: newProt.amountType,
          policy_number: newProt.policyNumber,
          renewal_date: newProt.renewalDate,
          note: newProt.note,
          active: true,
        }).select().single();
        if (inserted) {
          setProtections((prev) =>
            prev.map((p) => (p.id === tempId ? dbToProtection(inserted) : p))
          );
        }
      } catch (e) {
        console.error("Supabase protections sync (cached locally):", e);
      }
    }
  };

  const deleteProtection = async (id: string) => {
    setProtections((prev) => prev.filter((p) => p.id !== id));
    const uid = await getEffectiveUserId();
    if (uid) {
      try {
        await supabase.from("protections").delete().eq("id", id).eq("user_id", uid);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleProtection = async (id: string) => {
    let nextActive = true;
    setProtections((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          nextActive = !p.active;
          return { ...p, active: nextActive };
        }
        return p;
      })
    );
    const uid = await getEffectiveUserId();
    if (uid) {
      try {
        await supabase.from("protections").update({ active: nextActive }).eq("id", id).eq("user_id", uid);
      } catch (e) {
        console.error(e);
      }
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

    const uid = await getEffectiveUserId();
    if (uid) {
      const { data: inserted } = await supabase.from("cards").insert({
        user_id: uid,
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
    const uid = await getEffectiveUserId();
    if (uid) {
      await supabase.from("cards").delete().eq("id", id).eq("user_id", uid);
    }
  };

  // ── Profile ────────────────────────────────────────────────────────
  const profileBusy = useRef(false);
  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (profileBusy.current) return { error: "Un salvataggio è già in corso. Attendi un momento." };
    if (data.email !== undefined && data.email !== profile.email) return { error: "L’email di accesso non si modifica dal profilo." };
    const name = data.name?.trim();
    if (data.name !== undefined && (!name || name.length > 100)) return { error: "Inserisci un nome da 1 a 100 caratteri." };
    profileBusy.current = true;
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { error } = await supabase.from("profiles").update({
          ...(name !== undefined && { name, avatar_text: name.charAt(0).toUpperCase() }),
          ...(data.currency !== undefined && { currency: data.currency }),
          ...(data.notificationsEnabled !== undefined && { notifications_enabled: data.notificationsEnabled }),
          ...(data.theme !== undefined && { theme: data.theme }),
        }).eq("id", uid).select("id").single();
        if (error) return { error: "Non è stato possibile salvare il profilo. I dati precedenti sono ancora al sicuro. Riprova." };
      }
      setProfile(previous => ({ ...previous, ...data, ...(name !== undefined && { name, avatarText: name.charAt(0).toUpperCase() }) }));
      if (name !== undefined) {
        try {
          const saved = JSON.parse(localStorage.getItem("zero_auth_state_v6") || "null");
          if (saved) localStorage.setItem("zero_auth_state_v6", JSON.stringify({ ...saved, userName: name }));
        } catch { /* The persisted profile is the source of truth. */ }
      }
      return {};
    } catch { return { error: "Connessione non disponibile. Il profilo non è stato modificato. Riprova." }; }
    finally { profileBusy.current = false; }
  };

  // ── Reset all data ─────────────────────────────────────────────────
  const updateMonthlyBudget = async (value: number | null): Promise<{ error?: string }> => {
    const budget = validMonthlyBudget(value);
    if (value !== null && budget === null) return { error: "Inserisci un limite maggiore di zero." };
    try {
      const uid = await getEffectiveUserId();
      if (uid) {
        const { error } = await supabase.auth.updateUser({ data: { zero_monthly_budget: budget } });
        if (error) return { error: "Non è stato possibile salvare il budget. Riprova." };
      }
      setMonthlyBudget(budget);
      return {};
    } catch { return { error: "Connessione non disponibile. Il budget non è stato modificato." }; }
  };

  const resetAllData = async () => {
    transferAccount.current = { id: null, epoch: transferAccount.current.epoch + 1 };
    setTransferState({ owner: null, items: [], loading: false, error: "" });
    setCards([]);
    setActiveCardIndex(0);
    setTransactions([]);
    setSubscriptions([]);
    setGoals([]);
    setProtections([]);
    setProfile(EMPTY_PROFILE);
    setMonthlyBudget(null);
    setPrimaryGoalId(null);
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
  const currentMonth = monthlySummary(transactions.filter(tx => tx.id !== pendingDelete));
  const totalMonthlySpending = currentMonth.spent;
  const totalMonthlyIncome = currentMonth.income;
  const totalMonthlySavings = Math.round((currentMonth.income - currentMonth.spent) * 100) / 100;

  const totalActiveSubscriptionsCost = subscriptions
    .filter((s) => s.active)
    .reduce((acc, s) => acc + (s.frequency === "anno" ? s.cost / 12 : s.cost), 0);

  return (
    <AppContext.Provider
      value={{
        isHydrated,
        monthlyBudget,
        updateMonthlyBudget,
        cards,
        activeCardIndex,
        setActiveCardIndex,
        activeCard,
        transactions: transactions.filter(tx => tx.id !== pendingDelete),
        transfers: transferState.owner === userId ? transferState.items : [],
        transfersLoading: transferState.owner === userId && transferState.loading,
        transferLoadError: transferState.owner === userId ? transferState.error : "",
        addTransfer,
        subscriptions,
        goals,
        primaryGoalId,
        setPrimaryGoal,
        updateGoal,
        protections,
        profile,
        initializeProfile,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        toggleSubscription,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addMoneyToGoal,
        addGoal,
        deleteGoal,
        addProtection,
        deleteProtection,
        toggleProtection,
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
      <SaveFeedback hidden={!!pendingDelete} />
      {(pendingDelete || movementNotice) && <div role="status" aria-live="polite" data-app-update-block={pendingDelete ? "true" : undefined} className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+7rem)] left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl bg-[#0B0B0B] px-4 py-3 text-sm text-white shadow-lg">
        <span>{pendingDelete ? deleting ? "Eliminazione…" : "Movimento rimosso" : movementNotice}</span>
        {pendingDelete ? <button type="button" disabled={deleting} onClick={() => { setPendingDelete(null); setMovementNotice("Eliminazione annullata."); }} className="shrink-0 py-2 font-bold text-[#FDC909] disabled:opacity-40">Annulla</button> : <button type="button" onClick={() => setMovementNotice("")} className="shrink-0 py-2 font-bold text-[#FDC909]">Chiudi</button>}
      </div>}
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


