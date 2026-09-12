// ─── Shared data for all desktop screens ─────────────────────────────────────

export const BALANCE   = 1245.80;
export const INCOME    = 1800.00;
export const SPENDING  =  554.20;
export const SAVINGS   = INCOME - SPENDING;

export const MONTHLY_TREND = [
  { month: "Apr", income: 1800, expense: 620, savings: 1180 },
  { month: "Mag", income: 1800, expense: 540, savings: 1260 },
  { month: "Giu", income: 1900, expense: 710, savings: 1190 },
  { month: "Lug", income: 1800, expense: 480, savings: 1320 },
  { month: "Ago", income: 1800, expense: 590, savings: 1210 },
  { month: "Set", income: 1800, expense: 554, savings: 1246 },
];

export const TRANSACTIONS = [
  { id: "1",  date: "12 set 2026", desc: "Supermercato",   cat: "Cibo",          amount: -42.30,  method: "Carta"     },
  { id: "2",  date: "10 set 2026", desc: "Spotify",        cat: "Abbonamenti",   amount:  -3.49,  method: "Carta"     },
  { id: "3",  date: "9 set 2026",  desc: "Ristorante",     cat: "Cibo",          amount: -28.00,  method: "Contanti"  },
  { id: "4",  date: "6 set 2026",  desc: "Benzina",        cat: "Trasporti",     amount: -55.00,  method: "Carta"     },
  { id: "5",  date: "5 set 2026",  desc: "Netflix",        cat: "Abbonamenti",   amount:  -6.99,  method: "Carta"     },
  { id: "6",  date: "3 set 2026",  desc: "Zara",           cat: "Shopping",      amount: -49.95,  method: "Carta"     },
  { id: "7",  date: "1 set 2026",  desc: "Farmacia",       cat: "Salute",        amount: -12.50,  method: "Contanti"  },
  { id: "8",  date: "31 ago 2026", desc: "Affitto",        cat: "Casa",          amount: -650.00, method: "Bonifico"  },
  { id: "9",  date: "28 ago 2026", desc: "Bolletta luce",  cat: "Casa",          amount: -48.20,  method: "Addebito"  },
  { id: "10", date: "25 ago 2026", desc: "Palestra",       cat: "Sport",         amount: -25.00,  method: "Carta"     },
  { id: "11", date: "20 ago 2026", desc: "Stipendio",      cat: "Entrate",       amount: 1800.00, method: "Bonifico"  },
  { id: "12", date: "18 ago 2026", desc: "Amazon",         cat: "Shopping",      amount: -34.90,  method: "Carta"     },
];

export const SUBSCRIPTIONS = [
  { id: "1", name: "Netflix",    amount: 6.99,  freq: "Mensile",  nextDate: "5 ott 2026",  active: true,  emoji: "🎬", color: "#EF4444" },
  { id: "2", name: "Spotify",   amount: 3.49,  freq: "Mensile",  nextDate: "10 ott 2026", active: true,  emoji: "🎵", color: "#22C55E" },
  { id: "3", name: "iCloud",    amount: 0.99,  freq: "Mensile",  nextDate: "12 ott 2026", active: true,  emoji: "☁️", color: "#3B82F6" },
  { id: "4", name: "Google One",amount: 29.99, freq: "Annuale",  nextDate: "20 nov 2026", active: true,  emoji: "🔍", color: "#F59E0B" },
  { id: "5", name: "Uno Bravo", amount: 49.00, freq: "Mensile",  nextDate: "1 ott 2026",  active: true,  emoji: "🧠", color: "#6366F1" },
  { id: "6", name: "Ho.",       amount: 8.95,  freq: "Mensile",  nextDate: "3 ott 2026",  active: true,  emoji: "📱", color: "#A855F7" },
];

export const GOALS = [
  { id: "1", title: "Fondo viaggio",    current: 900,  target: 1500, deadline: "Giu 2027", emoji: "✈️" },
  { id: "2", title: "Nuova fotocamera", current: 350,  target: 800,  deadline: "Mar 2027", emoji: "📷" },
  { id: "3", title: "Fondo emergenza",  current: 1200, target: 3000, deadline: "Dic 2026", emoji: "🛡️" },
];

export const BUDGET_CATEGORIES = [
  { name: "Casa",         budget: 700, spent: 698, color: "#F5E050" },
  { name: "Cibo",         budget: 150, spent: 99,  color: "#EAB308" },
  { name: "Trasporti",    budget: 100, spent: 83,  color: "#73736E" },
  { name: "Shopping",     budget: 100, spent: 84,  color: "#A3A39E" },
  { name: "Abbonamenti",  budget:  80, spent: 69,  color: "#D4D4D0" },
  { name: "Sport",        budget:  50, spent: 25,  color: "#F5E050" },
  { name: "Salute",       budget:  60, spent: 12,  color: "#EAB308" },
];

export const CATEGORIES_ANALYSIS = [
  { name: "Casa",        percent: 28, amount: 155.1, color: "#F5E050" },
  { name: "Cibo",        percent: 18, amount:  99.8, color: "#EAB308" },
  { name: "Trasporti",   percent: 15, amount:  83.1, color: "#737373" },
  { name: "Shopping",    percent: 14, amount:  77.6, color: "#A3A39E" },
  { name: "Abbonamenti", percent: 12, amount:  66.5, color: "#525252" },
  { name: "Sport",       percent:  9, amount:  49.8, color: "#D4D4D0" },
  { name: "Altro",       percent:  4, amount:  22.3, color: "#404040" },
];

export const money = (v: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(v);
