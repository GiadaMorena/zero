"use client";
import { useId, useState } from "react";
import { supabase } from "@/lib/supabase";
export function OnboardingProfile({ name, onComplete }: { name: string; onComplete: (name: string) => void }) {
  const id = useId();
  const [value, setValue] = useState(name);
  const [gender, setGender] = useState("neutral");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className="min-h-[100dvh] bg-[#F7F7F5] flex items-center justify-center p-6"><form className="w-full max-w-md space-y-6" onSubmit={async e => {
    e.preventDefault(); if (busy) return; setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: value.trim(), language_gender: gender, zero_profile_completed: true } });
      if (error) throw error;
      onComplete(value.trim());
    } catch { setError("Non riesco a salvare il profilo. Riprova."); } finally { setBusy(false); }
  }}><h1 className="text-3xl font-bold">Iniziamo da te.</h1><p>Conferma il tuo nome e scegli come preferisci che ZERO si rivolga a te.</p>
  <div><label htmlFor={`${id}-name`} className="block mb-2 font-semibold">Nome</label><input id={`${id}-name`} required maxLength={80} value={value} onChange={e => setValue(e.target.value)} autoComplete="given-name" className="w-full rounded-xl border border-gray-300 bg-white p-4" /></div>
  <div><label htmlFor={`${id}-gender`} className="block mb-2 font-semibold">Come vuoi che ti parliamo?</label><select id={`${id}-gender`} value={gender} onChange={e => setGender(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white p-4"><option value="neutral">Neutro</option><option value="female">Femminile</option><option value="male">Maschile</option></select></div>
  {error && <p role="alert">{error}</p>}<button disabled={busy || !value.trim()} className="w-full rounded-xl bg-black text-white p-4 font-semibold disabled:opacity-50">{busy ? "Salvataggio…" : "Continua"}</button></form></main>;
}
