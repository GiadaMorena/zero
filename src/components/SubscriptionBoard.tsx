"use client";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  LoaderCircle,
} from "lucide-react";
import { useApp, type SubscriptionItem } from "@/context/AppContext";
import {
  nextRenewal,
  renewalParts,
  upcomingPayments,
} from "@/lib/upcomingPayments";
import { parseTransactionAmount } from "@/lib/quickTransaction";
import { SubscriptionLogo } from "./SubscriptionLogo";
import { SubscriptionToggle } from "./SubscriptionToggle";
const months = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];
const money = (value: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    value,
  );
type Dialog =
  | { kind: "new"; name?: string }
  | { kind: "edit" | "delete"; sub: SubscriptionItem };
export function SubscriptionBoard({ desktop = false }: { desktop?: boolean }) {
  const app = useApp(),
    [filter, setFilter] = useState("Inclusi"),
    [dialog, setDialog] = useState<Dialog | null>(null);
  const active = app.subscriptions.filter((sub) => sub.active),
    annual =
      active.reduce(
        (sum, sub) =>
          sum +
          Math.round(sub.cost * 100) * (sub.frequency === "mese" ? 12 : 1),
        0,
      ) / 100;
  const upcoming = upcomingPayments(app.subscriptions);
  const next = upcoming.payments[0];
  const visible = app.subscriptions.filter(
    (sub) => filter === "Tutti" || sub.active === (filter === "Inclusi"),
  );
  return (
    <div
      style={
        desktop
          ? undefined
          : { paddingTop: "calc(env(safe-area-inset-top,44px) + 1.25rem)" }
      }
      className={
        desktop
          ? "p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-5"
          : "flex flex-col gap-4 min-h-screen max-w-md mx-auto px-4 pb-32 bg-[#F7F7F5]"
      }
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Abbonamenti</h1>
          <p className="mt-1 text-xs text-[#73736E]">
            Costi e rinnovi, sempre sotto controllo.
          </p>
        </div>
        <button
          type="button"
          aria-label="Nuovo abbonamento"
          onClick={() => setDialog({ kind: "new" })}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B0B0B] text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>
      <section className="rounded-[24px] border border-black/10 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-[#73736E]">Media mensile</p>
            <p className="mt-1 text-2xl font-black">{money(annual / 12)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#73736E]">Stima annuale</p>
            <p className="mt-1 text-2xl font-black">{money(annual)}</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[#73736E]">
          {active.length}{" "}
          {active.length === 1 ? "abbonamento incluso" : "abbonamenti inclusi"}{" "}
          · gli annuali sono ripartiti su 12 mesi
        </p>
        <div className="mt-4 border-t border-black/10 pt-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <p className="text-xs">
            <strong>
                {next ? next.sub.name : upcoming.undated ? "Completa le date dei rinnovi" : "Nessun rinnovo in programma"}
            </strong>
            {next && (
              <>
                {" "}
                ·{" "}
                {next.date.toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {money(next.sub.cost)}
              </>
            )}
          </p>
        </div>
      </section>
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-black/10 bg-white p-1.5 max-w-md">
        {["Inclusi", "Esclusi", "Tutti"].map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={item === filter}
            onClick={() => setFilter(item)}
            className={`rounded-xl py-2.5 text-xs font-bold ${item === filter ? "bg-[#FDC909]" : "text-[#73736E]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        className={
          desktop
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        }
      >
        {visible.map((sub) => {
          const renewal = nextRenewal(sub);
          return (
            <article
              key={sub.id}
              className="rounded-[24px] border border-black/10 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <SubscriptionLogo name={sub.name} size={36} />
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold break-words">
                      {sub.name}
                    </h2>
                    <p className="mt-1 text-[11px] text-[#73736E]">
                      {sub.category}
                    </p>
                  </div>
                </div>
                <SubscriptionToggle
                  checked={sub.active}
                  label={`Includi ${sub.name} nel riepilogo`}
                  onChange={() => app.toggleSubscription(sub.id)}
                />
              </div>
              <p className="mt-3 text-lg font-black">
                {money(sub.cost)}
                <span className="text-xs font-medium text-[#73736E]">
                  {" "}
                  / {sub.frequency}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-[#73736E]">
                {!sub.active
                  ? "Escluso dal riepilogo delle prossime scadenze"
                  : renewal
                    ? `Prossimo rinnovo: ${renewal.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}`
                    : "Data del rinnovo da completare"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  aria-label={`Modifica ${sub.name}`}
                  onClick={() => setDialog({ kind: "edit", sub })}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F7F7F5] py-3 text-xs font-bold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifica
                </button>
                <button
                  type="button"
                  aria-label={`Rimuovi ${sub.name}`}
                  onClick={() => setDialog({ kind: "delete", sub })}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F5] text-[#73736E]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <section className="rounded-[24px] border border-black/10 bg-white p-6 text-center">
          <h2 className="text-sm font-bold">
            Nessun abbonamento{" "}
            {filter === "Inclusi"
              ? "incluso"
              : filter === "Esclusi"
                ? "escluso"
                : "registrato"}
          </h2>
          <p className="mt-2 text-xs text-[#73736E]">
            Aggiungi un servizio e inserisci il costo del tuo piano.
          </p>
          <button
            type="button"
            onClick={() => setDialog({ kind: "new" })}
            className="mt-4 rounded-full bg-[#FDC909] px-5 py-3 text-xs font-bold"
          >
            Aggiungi abbonamento
          </button>
        </section>
      )}
      <div>
        <p className="text-xs font-bold mb-2">Aggiungi rapidamente</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Netflix",
            "Spotify",
            "iCloud+",
            "Disney+",
            "ChatGPT Plus",
            "Amazon Prime",
          ].map((name) => (
            <button
              type="button"
              key={name}
              aria-label={`Aggiungi ${name}`}
              onClick={() => setDialog({ kind: "new", name })}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold"
            >
              <SubscriptionLogo name={name} size={18} />
              {name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#73736E] mt-2">
          Inserisci il prezzo che paghi: nessun costo viene presunto.
        </p>
      </div>
      <p className="text-[11px] text-[#73736E] leading-relaxed">
        Questi controlli modificano il monitoraggio in ZERO. Per disdire un
        servizio, usa il sito del fornitore.
      </p>
      {dialog && (
        <SubscriptionEditor
          key={
            dialog.kind + ("sub" in dialog ? dialog.sub.id : dialog.name || "")
          }
          dialog={dialog}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
function SubscriptionEditor({
  dialog,
  onClose,
}: {
  dialog: Dialog;
  onClose: () => void;
}) {
  const app = useApp(),
    sub = "sub" in dialog ? dialog.sub : null,
    parts = sub ? renewalParts(sub.date) : null;
  const [name, setName] = useState(
      sub?.name || ("name" in dialog ? dialog.name : "") || "",
    ),
    [cost, setCost] = useState(
      sub ? sub.cost.toFixed(2).replace(".", ",") : "",
    ),
    [frequency, setFrequency] = useState<"mese" | "anno">(
      sub?.frequency || "mese",
    ),
    [category, setCategory] = useState(sub?.category || "Svago"),
    [day, setDay] = useState(
      parts?.day.toString() || (sub ? "" : String(new Date().getDate())),
    ),
    [month, setMonth] = useState(
      parts?.month.toString() || String(new Date().getMonth()),
    );
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const guard = useRef(false),
    form = useRef<HTMLFormElement>(null),
    [requestId] = useState(() => crypto.randomUUID());
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guard.current) onClose();
      if (event.key !== "Tab") return;
      const controls = Array.from(
          form.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select:not(:disabled)",
          ) || [],
        ),
        first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (guard.current) return;
    setError("");
    const amount = parseTransactionAmount(cost),
      date = `${day} ${months[Number(month)]}`;
    if (
      dialog.kind !== "delete" &&
      (!name.trim() || amount === null || !renewalParts(date))
    ) {
      setError("Inserisci nome, costo e giorno del rinnovo validi.");
      return;
    }
    guard.current = true;
    setPending(true);
    try {
      const data = { name, cost: amount!, frequency, date, category };
      const result =
        dialog.kind === "delete"
          ? await app.deleteSubscription(sub!.id)
          : dialog.kind === "edit"
            ? await app.updateSubscription(sub!.id, data)
            : await app.addSubscription(data, requestId);
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
    } catch {
      setError("Connessione non disponibile. I dati inseriti sono ancora qui.");
    } finally {
      guard.current = false;
      setPending(false);
    }
  };
  const style =
    "mt-1.5 w-full rounded-2xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-[#FDC909]";
  return (
    <div className="zero-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md sm:p-4">
      <form
        ref={form}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-editor-title"
        onSubmit={submit}
        className="zero-panel max-h-[92dvh] overflow-y-auto w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#F7F7F5] p-6"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 1.5rem)",
        }}
      >
        <header className="flex justify-between items-center gap-2 mb-5">
          <h2 id="subscription-editor-title" className="text-lg font-black">
            {dialog.kind === "delete"
              ? "Rimuovi da ZERO"
              : dialog.kind === "edit"
                ? "Modifica abbonamento"
                : "Nuovo abbonamento"}
          </h2>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-full bg-white p-3"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <fieldset disabled={pending} className="flex flex-col gap-4 min-w-0">
          {dialog.kind === "delete" ? (
            <p className="text-sm">
              Rimuovere “{sub!.name}” dal monitoraggio? Questa azione non
              disdice il servizio.
            </p>
          ) : (
            <>
              <label className="text-xs font-bold">
                Nome del servizio
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Netflix"
                  className={style}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold">
                  Costo del rinnovo (€)
                  <input
                    required
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0,00"
                    className={style}
                  />
                </label>
                <label className="text-xs font-bold">
                  Frequenza
                  <select
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as "mese" | "anno")
                    }
                    className={style}
                  >
                    <option value="mese">Mensile</option>
                    <option value="anno">Annuale</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold">
                  Giorno del rinnovo
                  <select
                    value={day}
                    required
                    onChange={(e) => setDay(e.target.value)}
                    className={style}
                  >
                    <option value="" disabled>
                      Scegli un giorno
                    </option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </label>
                {frequency === "anno" && (
                  <label className="text-xs font-bold">
                    Mese del rinnovo
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className={style}
                    >
                      {months.map((name, i) => (
                        <option key={name} value={i}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <p className="text-[11px] text-[#73736E]">
                Nei mesi più corti si usa l’ultimo giorno disponibile.
              </p>
              <label className="text-xs font-bold">
                Categoria
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={style}
                >
                  {[
                    ...new Set([
                      "Svago",
                      "Musica",
                      "Cloud",
                      "Produttività",
                      "Shopping",
                      "Salute",
                      "Utenze",
                      "Altro",
                      category,
                    ]),
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className={`mt-5 w-full rounded-full py-4 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 ${dialog.kind === "delete" ? "bg-[#0B0B0B] text-white" : "bg-[#FDC909]"}`}
        >
          {pending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Salvataggio…
            </>
          ) : dialog.kind === "delete" ? (
            "Rimuovi da ZERO"
          ) : (
            "Salva abbonamento"
          )}
        </button>
      </form>
    </div>
  );
}

