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
        disabled={pending}
        onClick={(event) => {
          event.stopPropagation();
          void change();
        }}
        className="relative h-11 w-14 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#FDC909] disabled:opacity-50"
      >
        <span
          className={`absolute left-1/2 top-1/2 h-6 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors motion-reduce:transition-none ${checked ? "bg-[#FDC909]" : "bg-[#A7A7A7]/40"}`}
        >
          <span
            className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-[left] motion-reduce:transition-none ${checked ? "left-[19px]" : "left-[3px]"}`}
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
