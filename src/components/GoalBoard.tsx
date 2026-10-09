"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Star,
  Plus,
  Pencil,
  Target,
  X,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import { useApp, type GoalItem } from "@/context/AppContext";
import { goalProgress, mainGoal } from "@/lib/goalProgress";
import { parseTransactionAmount } from "@/lib/quickTransaction";

const money = (value: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    value,
  );
type GoalDialog =
  { kind: "new" } | { kind: "edit" | "add" | "delete"; goal: GoalItem };
export function GoalBoard({ desktop = false }: { desktop?: boolean }) {
  const app = useApp();
  const [filter, setFilter] = useState<"In corso" | "Completati">("In corso");
  const [dialog, setDialog] = useState<GoalDialog | null>(null);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState(false);
  const primary = mainGoal(app.goals, app.primaryGoalId);
  const goals = app.goals.filter(
    (goal) => goalProgress(goal).completed === (filter === "Completati"),
  );
  const choose = async (goal: GoalItem) => {
    if (selecting) return;
    setSelecting(true);
    setError("");
    try {
      const result = await app.setPrimaryGoal(goal.id);
      if (result.error) setError(result.error);
    } finally {
      setSelecting(false);
    }
  };
  return (
    <div
      style={
        desktop
          ? undefined
          : { paddingTop: "calc(env(safe-area-inset-top, 44px) + 1.25rem)" }
      }
      className={
        desktop
          ? "p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-5"
          : "flex min-h-screen max-w-md flex-col gap-4 bg-[#F7F7F5] px-4 pb-32 mx-auto"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Obiettivi</h1>
          <p className="text-xs text-[#73736E] mt-1">
            Un traguardo alla volta.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ kind: "new" })}
          aria-label="Nuovo obiettivo"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B0B0B] text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-black/10 bg-white p-1.5 max-w-md">
        {(["In corso", "Completati"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className={`rounded-xl py-2.5 text-xs font-bold ${filter === item ? "bg-[#FDC909]" : "text-[#73736E]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div
        className={
          desktop
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        }
      >
        {goals.map((goal) => {
          const progress = goalProgress(goal),
            selected = primary?.id === goal.id;
          return (
            <section
              key={goal.id}
              className={`rounded-[24px] bg-white p-4 border shadow-xs ${selected ? "border-[#FDC909]" : "border-black/10"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F7F5]">
                  <Target className="h-4 w-4" />
                </span>
                {!progress.completed && (
                  <button
                    type="button"
                    disabled={selecting}
                    aria-pressed={selected}
                    aria-label={`Imposta ${goal.title} come principale`}
                    onClick={() => choose(goal)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold ${selected ? "bg-[#FDC909]" : "bg-[#F7F7F5]"}`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${selected ? "fill-current" : ""}`}
                    />
                    {selected ? "Principale" : "Metti in primo piano"}
                  </button>
                )}
                {progress.completed && (
                  <span className="flex items-center gap-1 text-[11px] font-bold">
                    <Check className="h-4 w-4" />
                    Raggiunto
                  </span>
                )}
              </div>
              <h2 className="text-sm font-extrabold break-words">
                {goal.title}
              </h2>
              <p className="text-xs text-[#73736E] mt-1">
                {money(goal.current)} di {money(goal.target)}
              </p>
              <div
                role="progressbar"
                aria-label={goal.title}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                className="h-2.5 overflow-hidden rounded-full bg-[#F7F7F5] mt-4"
              >
                <div
                  className="h-full rounded-full bg-[#FDC909] transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between gap-2 mt-2 text-[11px]">
                <strong>{progress.percent}%</strong>
                <span>
                  {progress.completed
                    ? "Traguardo raggiunto"
                    : `Mancano ${money(progress.remaining)}`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setDialog({ kind: "add", goal })}
                  className="flex flex-1 justify-center items-center gap-1 rounded-full bg-[#0B0B0B] py-3 text-xs font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Registra risparmio
                </button>
                <button
                  type="button"
                  aria-label={`Modifica ${goal.title}`}
                  onClick={() => setDialog({ kind: "edit", goal })}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F5]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Elimina ${goal.title}`}
                  onClick={() => setDialog({ kind: "delete", goal })}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F5] text-[#73736E]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
      {!goals.length && (
        <div className="rounded-[24px] border border-black/10 bg-white p-8 text-center">
          <Target className="h-6 w-6 mx-auto mb-3 text-[#73736E]" />
          <h2 className="text-sm font-bold">
            {filter === "Completati"
              ? "Nessun obiettivo completato"
              : "Il tuo prossimo traguardo"}
          </h2>
          <p className="text-xs text-[#73736E] mt-2">
            {filter === "Completati"
              ? "Qui troverai gli obiettivi raggiunti."
              : "Crea un obiettivo e scegli quale mostrare nella home."}
          </p>
          {filter === "In corso" && (
            <button
              type="button"
              onClick={() => setDialog({ kind: "new" })}
              className="rounded-full bg-[#FDC909] px-5 py-3 mt-4 text-xs font-bold"
            >
              Crea un obiettivo
            </button>
          )}
        </div>
      )}
      {dialog && (
        <GoalEditor
          key={dialog.kind + ("goal" in dialog ? dialog.goal.id : "new")}
          dialog={dialog}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function GoalEditor({
  dialog,
  onClose,
}: {
  dialog: GoalDialog;
  onClose: () => void;
}) {
  const app = useApp(),
    goal = "goal" in dialog ? dialog.goal : null;
  const [title, setTitle] = useState(goal?.title || "");
  const [target, setTarget] = useState(
    goal ? goal.target.toFixed(2).replace(".", ",") : "",
  );
  const [current, setCurrent] = useState(
    goal ? goal.current.toFixed(2).replace(".", ",") : "0",
  );
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const guard = useRef(false),
    form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guard.current) onClose();
      if (event.key !== "Tab") return;
      const items = Array.from(
        form.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled)",
        ) || [],
      );
      const first = items[0],
        last = items[items.length - 1];
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
    const parsedTarget = parseTransactionAmount(target),
      parsedAmount = parseTransactionAmount(amount);
    const parsedCurrent =
      current.trim() === "0" || /^0[.,]0{1,2}$/.test(current.trim())
        ? 0
        : parseTransactionAmount(current);
    if (
      (dialog.kind === "new" || dialog.kind === "edit") &&
      (!title.trim() || parsedTarget === null || parsedCurrent === null)
    ) {
      setError(
        "Inserisci un titolo, un obiettivo maggiore di zero e un risparmio valido.",
      );
      return;
    }
    if (dialog.kind === "add" && parsedAmount === null) {
      setError(
        "Inserisci un importo maggiore di zero, con al massimo due decimali.",
      );
      return;
    }
    guard.current = true;
    setSaving(true);
    try {
      const result =
        dialog.kind === "new"
          ? await app.addGoal({ title, target: parsedTarget! })
          : dialog.kind === "edit"
            ? await app.updateGoal(goal!.id, {
                title,
                target: parsedTarget!,
                current: parsedCurrent!,
              })
            : dialog.kind === "add"
              ? await app.addMoneyToGoal(goal!.id, parsedAmount!)
              : await app.deleteGoal(goal!.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
    } catch {
      setError("Connessione non disponibile. I dati inseriti sono ancora qui.");
    } finally {
      guard.current = false;
      setSaving(false);
    }
  };
  const heading =
    dialog.kind === "new"
      ? "Nuovo obiettivo"
      : dialog.kind === "edit"
        ? "Modifica obiettivo"
        : dialog.kind === "add"
          ? "Registra risparmio"
          : "Elimina obiettivo";
  const inputStyle =
    "w-full rounded-2xl border border-black/10 bg-white p-3.5 text-sm mt-1.5 outline-none focus:border-[#FDC909]";
  return (
    <div className="zero-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
      <form
        ref={form}
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-editor-title"
        onSubmit={submit}
        className="zero-panel w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#F7F7F5] p-6 max-h-[92dvh] overflow-y-auto"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 1.5rem)",
        }}
      >
        <header className="flex items-center justify-between mb-5">
          <h2 id="goal-editor-title" className="text-lg font-black">
            {heading}
          </h2>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Chiudi"
            className="p-3 rounded-full bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <fieldset disabled={saving} className="flex flex-col gap-4 min-w-0">
          {(dialog.kind === "new" || dialog.kind === "edit") && (
            <>
              <label className="text-xs font-bold">
                Titolo obiettivo
                <input
                  autoFocus
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Es. Viaggio in Giappone"
                  className={inputStyle}
                />
              </label>
              <label className="text-xs font-bold">
                Importo da raggiungere (€)
                <input
                  required
                  inputMode="decimal"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="1500,00"
                  className={inputStyle}
                />
              </label>
              {dialog.kind === "edit" && (
                <label className="text-xs font-bold">
                  Già messo da parte (€)
                  <input
                    inputMode="decimal"
                    value={current}
                    onChange={(event) => setCurrent(event.target.value)}
                    className={inputStyle}
                  />
                </label>
              )}
            </>
          )}
          {dialog.kind === "add" && (
            <>
              <p className="text-sm font-bold">{goal!.title}</p>
              <label className="text-xs font-bold">
                Quanto hai messo da parte? (€)
                <input
                  autoFocus
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  className={inputStyle}
                />
              </label>
              <p className="text-xs text-[#73736E]">
                Aggiorna il progresso dell’obiettivo. Il saldo delle carte resta
                invariato.
              </p>
            </>
          )}
          {dialog.kind === "delete" && (
            <p className="text-sm">
              Vuoi eliminare “{goal!.title}” e il suo progresso? Questa azione
              non modifica i saldi delle carte.
            </p>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className={`mt-5 w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-black disabled:opacity-50 ${dialog.kind === "delete" ? "bg-[#0B0B0B] text-white" : "bg-[#FDC909]"}`}
        >
          {saving ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Salvataggio…
            </>
          ) : dialog.kind === "delete" ? (
            "Elimina obiettivo"
          ) : dialog.kind === "add" ? (
            "Conferma risparmio"
          ) : (
            "Salva obiettivo"
          )}
        </button>
      </form>
    </div>
  );
}
