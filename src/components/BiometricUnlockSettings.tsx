"use client";

import { useEffect, useRef, useState } from "react";
import { ScanFace, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  biometricUnlockStatus, cancelBiometricPrompt, disableLocalBiometric,
  enableBiometricUnlock, type BiometricStatus,
} from "@/lib/biometricUnlock";

export function BiometricUnlockSettings() {
  const { profile } = useApp();
  const email = profile.email || "";
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const live = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const epoch = useRef(0);

  useEffect(() => {
    live.current = true;
    const sequence = ++epoch.current;
    const check = new AbortController();
    setChecking(true); setBusy(false); setStatus(null); setMessage(""); controller.current = null;
    void biometricUnlockStatus(email, check.signal).then(value => {
      if (live.current && sequence === epoch.current) setStatus(value);
    }).catch(error => {
      if (live.current && sequence === epoch.current && !check.signal.aborted) setMessage(error instanceof Error ? error.message : "Non riesco a verificare la disponibilità. Puoi usare il codice.");
    }).finally(() => {
      if (live.current && sequence === epoch.current) setChecking(false);
    });
    return () => {
      live.current = false; epoch.current += 1;
      check.abort(); controller.current?.abort(); cancelBiometricPrompt();
    };
  }, [email, revision]);

  const enable = async (newCredential = false) => {
    if (busy || checking || !status?.available || !email) return;
    const sequence = epoch.current;
    const operation = new AbortController();
    controller.current = operation;
    setBusy(true); setMessage("");
    try {
      const result = await enableBiometricUnlock(email, { newCredential, signal: operation.signal });
      if (!live.current || sequence !== epoch.current || operation.signal.aborted) return;
      setStatus(current => current ? { ...current, enabled: true, hasCredentials: true, credentialId: result.credentialId, userId: result.userId } : current);
      setMessage("Sblocco con passkey attivo su questo dispositivo. Alla prossima schermata del codice potrai usarlo per entrare.");
    } catch (error) {
      if (live.current && sequence === epoch.current) setMessage(error instanceof Error ? error.message : "Attivazione non riuscita. Il codice ZERO resta disponibile.");
    } finally {
      if (live.current && sequence === epoch.current) setBusy(false);
      if (controller.current === operation) controller.current = null;
    }
  };

  const disable = () => {
    if (busy || !status?.userId) return;
    try {
      disableLocalBiometric(status.userId);
      setStatus(current => current ? { ...current, enabled: false, credentialId: undefined } : current);
      setMessage("Sblocco con passkey disattivato su questo dispositivo. Puoi continuare a usare il codice ZERO.");
    } catch {
      setMessage("Non riesco a salvare la disattivazione. Riprova.");
    }
  };

  const availability = checking ? "Controllo disponibilità…" : status?.enabled
    ? "Attivo su questo dispositivo. Il codice ZERO resta disponibile."
    : status?.available ? "Sblocca ZERO con la verifica del dispositivo, mantenendo il codice come alternativa."
      : status?.reason || "Lo sblocco con passkey non è disponibile in questo momento.";

  return <section aria-label="Face ID e passkey" data-app-update-block={busy ? "true" : undefined} className="rounded-[24px] border border-black/10 bg-white p-5 text-[#121212]">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8D5]" aria-hidden="true"><ScanFace className="h-5 w-5" /></div>
      <div>
        <h2 className="text-sm font-bold">Face ID e passkey</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#666]">{availability}</p>
      </div>
      {status?.enabled && <ShieldCheck aria-label="Attivo" className="ml-auto h-5 w-5 shrink-0 text-[#8A7100]" />}
    </div>
    <p className="mt-3 text-xs leading-relaxed text-[#666]">Il sistema può usare Face ID, Touch ID, Windows Hello o il codice del dispositivo. ZERO non riceve foto del viso né dati biometrici. La verifica richiede una connessione.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {status?.available && !status.enabled && <button type="button" disabled={busy || checking} onClick={() => void enable()} className="rounded-full bg-[#FDC909] px-5 py-3 text-xs font-bold disabled:opacity-50">{busy ? "Verifica in corso…" : "Attiva su questo dispositivo"}</button>}
      {status?.enabled && <button type="button" disabled={busy || checking} onClick={disable} className="rounded-full border border-black/15 px-5 py-3 text-xs font-bold disabled:opacity-50">Disattiva su questo dispositivo</button>}
      {status?.available && !status.enabled && status.hasCredentials && !busy && <button type="button" disabled={checking} onClick={() => void enable(true)} className="rounded-full border border-black/15 px-5 py-3 text-xs font-bold disabled:opacity-50">Crea nuova passkey</button>}
      {busy ? <button type="button" onClick={() => controller.current?.abort()} className="rounded-full border border-black/15 px-5 py-3 text-xs font-bold">Annulla verifica</button>
        : <button type="button" disabled={checking} onClick={() => setRevision(value => value + 1)} className="rounded-full border border-black/15 px-5 py-3 text-xs font-bold disabled:opacity-50">Controlla di nuovo</button>}
    </div>
    {message && <p role="status" className="mt-3 rounded-xl bg-[#F7F7F5] p-3 text-xs leading-relaxed">{message}</p>}
  </section>;
}
