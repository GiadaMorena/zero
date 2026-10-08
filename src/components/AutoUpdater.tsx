"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { startAppUpdates } from "@/lib/appUpdates";

export function AutoUpdater() {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    // Access storage inside try: Safari may disable it in some browsing modes.
    let storage: Pick<Storage, "getItem" | "setItem">;
    try { storage = window.sessionStorage; }
    catch { storage = { getItem: () => null, setItem: () => {} }; }
    return startAppUpdates({ window, document, navigator, fetch: (input, init) => window.fetch(input, init), storage,
      currentVersion: process.env.NEXT_PUBLIC_APP_VERSION || "development", onPending: setPending });
  }, []);
  if (!pending) return null;
  return <aside role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#0B0B0B] px-4 py-3 text-white shadow-xl">
    <RefreshCw aria-hidden="true" className="h-4 w-4 shrink-0 text-[#FDC909]" />
    <p className="text-xs leading-relaxed">Nuova versione pronta. Si aggiornerà appena termini questa schermata.</p>
  </aside>;
}
