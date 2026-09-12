"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Movement = { id: string; title: string; category: string; amount: number; date: string };
type Subscription = { id: string; name: string; amount: number; frequency: "Mensile" | "Annuale"; nextDate: string };
type View = "Panoramica" | "Spese" | "Abbonamenti";

const initialMovements: Movement[] = [
  { id: "1", title: "Stipendio", category: "Lavoro", amount: 2450, date: "01 set" },
  { id: "2", title: "Spesa alimentare", category: "Cibo", amount: -72.4, date: "10 set" },
  { id: "3", title: "Treno per Milano", category: "Trasporti", amount: -38.9, date: "08 set" },
  { id: "4", title: "Cena con amici", category: "Tempo libero", amount: -46, date: "06 set" },
];
const initialSubscriptions: Subscription[] = [
  { id: "1", name: "Netflix", amount: 12.99, frequency: "Mensile", nextDate: "18 set 2026" },
  { id: "2", name: "Notion", amount: 96, frequency: "Annuale", nextDate: "03 dic 2026" },
  { id: "3", name: "Spotify", amount: 10.99, frequency: "Mensile", nextDate: "25 set 2026" },
];
const categories = ["Cibo", "Casa", "Trasporti", "Tempo libero", "Salute", "Lavoro", "Altro"];
const money = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

export default function Home() {
  const [view, setView] = useState<View>("Panoramica");
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [ready, setReady] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    const savedMovements = localStorage.getItem("zero:movements");
    const savedSubscriptions = localStorage.getItem("zero:subscriptions");
    if (savedMovements) setMovements(JSON.parse(savedMovements));
    if (savedSubscriptions) setSubscriptions(JSON.parse(savedSubscriptions));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("zero:movements", JSON.stringify(movements)); }, [movements, ready]);
  useEffect(() => { if (ready) localStorage.setItem("zero:subscriptions", JSON.stringify(subscriptions)); }, [subscriptions, ready]);

  const income = useMemo(() => movements.filter(x => x.amount > 0).reduce((a, x) => a + x.amount, 0), [movements]);
  const spending = useMemo(() => movements.filter(x => x.amount < 0).reduce((a, x) => a + Math.abs(x.amount), 0), [movements]);
  const balance = 3240.8 + income - spending;
  const monthlySubs = subscriptions.reduce((sum, x) => sum + (x.frequency === "Mensile" ? x.amount : x.amount / 12), 0);
  const yearlySubs = monthlySubs * 12;
  const categoryTotals = categories.map(category => ({ category, total: movements.filter(x => x.category === category && x.amount < 0).reduce((a, x) => a + Math.abs(x.amount), 0) })).filter(x => x.total > 0);

  function addMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const amount = Number(data.get("amount")) * (data.get("kind") === "Uscita" ? -1 : 1);
    setMovements([{ id: crypto.randomUUID(), title: String(data.get("title")), category: String(data.get("category")), amount, date: "Oggi" }, ...movements]);
    setShowMovement(false); event.currentTarget.reset();
  }
  function addSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setSubscriptions([...subscriptions, { id: crypto.randomUUID(), name: String(data.get("name")), amount: Number(data.get("amount")), frequency: data.get("frequency") as Subscription["frequency"], nextDate: String(data.get("nextDate")) }]);
    setShowSubscription(false); event.currentTarget.reset();
  }

  return <main className="min-h-screen px-5 py-5 md:px-10 md:py-8">
    <div className="mx-auto max-w-7xl">
      <header className="flex items-center justify-between border-b border-[#e9e9e5] pb-5">
        <button className="flex items-center gap-2 text-xl font-black tracking-[-0.09em]" onClick={() => setView("Panoramica")}>ZERO <span className="h-2.5 w-2.5 rounded-full bg-[#c49a18]" /></button>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-[#777772] sm:block">Settembre 2026</span><div className="grid h-9 w-9 place-items-center rounded-full bg-[#171716] text-sm font-bold text-white">G</div></div>
      </header>
      <div className="grid gap-10 pt-8 md:grid-cols-[190px_1fr]">
        <nav className="flex gap-2 overflow-auto md:flex-col">{(["Panoramica", "Spese", "Abbonamenti"] as View[]).map(item => <button key={item} onClick={() => setView(item)} className={`rounded-full px-4 py-2 text-left text-sm transition ${view === item ? "bg-[#171716] text-white" : "text-[#777772] hover:bg-[#efefeb] hover:text-[#171716]"}`}>{item}</button>)}</nav>
        <section>
          {view === "Panoramica" && <Dashboard balance={balance} income={income} spending={spending} movements={movements} onAdd={() => setShowMovement(true)} />}
          {view === "Spese" && <Expenses totals={categoryTotals} spending={spending} movements={movements} onAdd={() => setShowMovement(true)} />}
          {view === "Abbonamenti" && <Subscriptions subscriptions={subscriptions} monthly={monthlySubs} yearly={yearlySubs} onAdd={() => setShowSubscription(true)} />}
        </section>
      </div>
    </div>
    {showMovement && <Modal title="Nuovo movimento" close={() => setShowMovement(false)}><form onSubmit={addMovement} className="grid gap-4"><Field label="Descrizione" name="title" placeholder="Es. Spesa alimentare" /><div className="grid grid-cols-2 gap-3"><Select label="Tipo" name="kind" values={["Uscita", "Entrata"]}/><Field label="Importo" name="amount" type="number" step="0.01" placeholder="0,00"/></div><Select label="Categoria" name="category" values={categories}/><button className="mt-2 rounded-full bg-[#c49a18] px-5 py-3 font-bold text-[#171716]">Salva movimento</button></form></Modal>}
    {showSubscription && <Modal title="Nuovo abbonamento" close={() => setShowSubscription(false)}><form onSubmit={addSubscription} className="grid gap-4"><Field label="Nome" name="name" placeholder="Es. Spotify"/><div className="grid grid-cols-2 gap-3"><Field label="Importo" name="amount" type="number" step="0.01" placeholder="0,00"/><Select label="Frequenza" name="frequency" values={["Mensile", "Annuale"]}/></div><Field label="Prossima scadenza" name="nextDate" placeholder="Es. 25 set 2026"/><button className="mt-2 rounded-full bg-[#c49a18] px-5 py-3 font-bold text-[#171716]">Aggiungi abbonamento</button></form></Modal>}
  </main>;
}

function Dashboard({ balance, income, spending, movements, onAdd }: { balance: number; income: number; spending: number; movements: Movement[]; onAdd: () => void }) { return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-[#777772]">Ciao, Giada</p><h1 className="mt-1 text-4xl font-bold tracking-[-.06em] md:text-5xl">Un mese alla volta.</h1></div><button onClick={onAdd} className="rounded-full bg-[#171716] px-5 py-3 text-sm font-bold text-white">+ Aggiungi movimento</button></div><div className="mt-9 grid gap-3 md:grid-cols-3"><Metric label="Disponibile" value={money(balance)} primary/><Metric label="Entrate del mese" value={money(income)} note="+12% rispetto ad agosto"/><Metric label="Uscite del mese" value={money(spending)} note="Nella tua media"/></div><div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-3xl border border-[#e9e9e5] bg-white p-6"><div className="flex justify-between"><div><p className="text-sm text-[#777772]">Andamento di settembre</p><p className="mt-2 text-3xl font-bold tracking-[-.06em]">+{money(income - spending)}</p></div><span className="rounded-full bg-[#f4e9b2] px-3 py-1 text-xs font-bold">in crescita</span></div><div className="mt-8 flex h-32 items-end gap-2">{[38, 45, 38, 62, 54, 72, 68, 90, 83, 100, 92, 112].map((h, i) => <div key={i} className="flex-1 rounded-t-full bg-[#e9e9e5]" style={{ height: `${h / 1.25}%` }}><div className="h-1/4 rounded-t-full bg-[#c49a18]" /></div>)}</div><div className="mt-3 flex justify-between text-xs text-[#777772]"><span>1 set</span><span>15 set</span><span>30 set</span></div></div><div className="rounded-3xl bg-[#171716] p-6 text-white"><p className="text-sm text-[#a9a9a4]">Piccola osservazione</p><p className="mt-4 text-2xl font-bold leading-tight tracking-[-.05em]">Stai spendendo meno di quanto entra. Bene così.</p><p className="mt-6 text-sm text-[#c5c5bf]">Hai ancora il 71% del tuo budget mensile.</p></div></div><MovementList movements={movements.slice(0, 5)} /></> }
function Expenses({ totals, spending, movements, onAdd }: { totals: { category: string; total: number }[]; spending: number; movements: Movement[]; onAdd: () => void }) { return <><div className="flex items-end justify-between"><div><p className="text-sm text-[#777772]">Settembre 2026</p><h1 className="mt-1 text-4xl font-bold tracking-[-.06em]">Le tue spese</h1></div><button onClick={onAdd} className="rounded-full bg-[#171716] px-5 py-3 text-sm font-bold text-white">+ Nuova spesa</button></div><div className="mt-8 rounded-3xl bg-[#f4e9b2] p-7"><p className="text-sm">Speso finora</p><p className="mt-2 text-5xl font-bold tracking-[-.07em]">{money(spending)}</p></div><div className="mt-8 grid gap-3 md:grid-cols-2">{totals.map(({ category, total }) => <div key={category} className="rounded-2xl border border-[#e9e9e5] bg-white p-5"><div className="flex items-center justify-between"><span className="font-bold">{category}</span><span>{money(total)}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efefeb]"><div className="h-full rounded-full bg-[#c49a18]" style={{ width: `${Math.min(100, total / Math.max(spending, 1) * 180)}%` }}/></div></div>)}</div><MovementList movements={movements.filter(x => x.amount < 0)} /></> }
function Subscriptions({ subscriptions, monthly, yearly, onAdd }: { subscriptions: Subscription[]; monthly: number; yearly: number; onAdd: () => void }) { return <><div className="flex items-end justify-between"><div><p className="text-sm text-[#777772]">Ricorrenti, sotto controllo</p><h1 className="mt-1 text-4xl font-bold tracking-[-.06em]">Abbonamenti</h1></div><button onClick={onAdd} className="rounded-full bg-[#171716] px-5 py-3 text-sm font-bold text-white">+ Aggiungi</button></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><Metric label="Ogni mese" value={money(monthly)} primary/><Metric label="Equivalente annuale" value={money(yearly)} note="Tutti gli abbonamenti inclusi"/></div><div className="mt-8 overflow-hidden rounded-3xl border border-[#e9e9e5] bg-white">{subscriptions.map((s, i) => <div key={s.id} className={`flex items-center justify-between gap-4 p-5 ${i ? "border-t border-[#e9e9e5]" : ""}`}><div className="flex items-center gap-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9b2] font-black">{s.name[0]}</div><div><p className="font-bold">{s.name}</p><p className="text-sm text-[#777772]">{s.frequency} · Prossima: {s.nextDate}</p></div></div><p className="font-bold">{money(s.amount)}</p></div>)}</div></> }
function Metric({ label, value, note, primary }: { label: string; value: string; note?: string; primary?: boolean }) { return <div className={`rounded-3xl p-6 ${primary ? "bg-[#171716] text-white" : "border border-[#e9e9e5] bg-white"}`}><p className={`text-sm ${primary ? "text-[#bdbdb7]" : "text-[#777772]"}`}>{label}</p><p className="mt-3 text-3xl font-bold tracking-[-.06em]">{value}</p>{note && <p className="mt-4 text-xs text-[#777772]">{note}</p>}</div> }
function MovementList({ movements }: { movements: Movement[] }) { return <div className="mt-8"><div className="mb-4 flex justify-between"><h2 className="text-xl font-bold tracking-[-.04em]">Movimenti recenti</h2><span className="text-sm text-[#777772]">{movements.length} movimenti</span></div><div className="overflow-hidden rounded-3xl border border-[#e9e9e5] bg-white">{movements.map((m, i) => <div className={`flex items-center justify-between gap-4 p-5 ${i ? "border-t border-[#e9e9e5]" : ""}`} key={m.id}><div><p className="font-bold">{m.title}</p><p className="mt-1 text-sm text-[#777772]">{m.category} · {m.date}</p></div><p className={`font-bold ${m.amount > 0 ? "text-[#76952a]" : ""}`}>{m.amount > 0 ? "+" : ""}{money(m.amount)}</p></div>)}</div></div> }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-10 grid place-items-center bg-black/30 p-5"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-6 flex justify-between"><h2 className="text-2xl font-bold tracking-[-.05em]">{title}</h2><button onClick={close} className="grid h-8 w-8 place-items-center rounded-full bg-[#efefeb]">×</button></div>{children}</div></div> }
function Field({ label, name, ...props }: { label: string; name: string; type?: string; step?: string; placeholder?: string }) { return <label className="grid gap-2 text-sm font-bold">{label}<input required name={name} {...props} className="rounded-xl border border-[#deded9] px-4 py-3 font-normal outline-none focus:border-[#c49a18]"/></label> }
function Select({ label, name, values }: { label: string; name: string; values: string[] }) { return <label className="grid gap-2 text-sm font-bold">{label}<select name={name} className="rounded-xl border border-[#deded9] bg-white px-4 py-3 font-normal outline-none focus:border-[#c49a18]">{values.map(x => <option key={x}>{x}</option>)}</select></label> }
