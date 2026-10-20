"use client";
import { useRef, useState } from "react";
export function SubscriptionToggle({
  checked,
  onChange,
  label = "Includi abbonamento nel riepilogo",
}: {
  checked: boolean;
  onChange: () => void | Promise<{ error?: string }>;
  label?: string;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const guard = useRef(false);
  const change = async () => {
    if (guard.current) return;
    guard.current = true;
    setPending(true);
    setError("");
    try {
      const result = await onChange();
      if (result?.error) setError(result.error);
    } catch {
      setError("Modifica non riuscita. Riprova.");
    } finally {
      guard.current = false;
      setPending(false);
    }
  };
  return (
    <span data-app-update-block={pending ? "" : undefined} className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        aria-busy={pending}
        disabled={pending}
        onClick={(event) => {
          event.stopPropagation();
          void change();
        }}
        className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#FDC909] disabled:opacity-50"
      >
        <span
          aria-hidden="true"
          className={`flex h-6 w-10 shrink-0 items-center rounded-full px-[3px] transition-colors motion-reduce:transition-none ${checked ? "bg-[#FDC909]" : "bg-[#A7A7A7]/40"}`}
        >
          <span
            className={`block h-[18px] w-[18px] shrink-0 rounded-full bg-white shadow-xs transition-transform duration-200 motion-reduce:transition-none ${checked ? "translate-x-4" : "translate-x-0"}`}
          />
        </span>
      </button>
      {error && (
        <span role="alert" className="max-w-56 text-[10px] text-red-700">
          {error}
        </span>
      )}
    </span>
  );
}
