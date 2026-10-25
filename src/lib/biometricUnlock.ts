import { supabase } from "@/lib/supabase";

const PREFIX = "zero_biometric_v1";
const CREDENTIAL = /^[A-Za-z0-9_-]{8,2048}$/;
const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CANONICAL_ORIGIN = "https://zero-henna-one.vercel.app";
type BrowserModule = typeof import("@simplewebauthn/browser");
let browserPromise: Promise<BrowserModule> | null = null;
let activeBrowser: BrowserModule | null = null;
let operationSequence = 0;

export class BiometricUnlockError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = "BiometricUnlockError"; }
}
export interface BiometricStatus {
  available: boolean;
  enabled: boolean;
  userId: string;
  credentialId?: string;
  hasCredentials: boolean;
  reason?: string;
}
export interface VerifiedBiometric {
  verified: true;
  userId: string;
  credentialId: string;
}
const normalizedEmail = (value: string) => value.trim().toLowerCase();

function trustedContext() {
  if (typeof window === "undefined" || !window.isSecureContext) return false;
  if (window.location.origin === CANONICAL_ORIGIN) return true;
  return process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export async function platformBiometricAvailable(): Promise<boolean> {
  if (!trustedContext() || !("PublicKeyCredential" in window) || !navigator.credentials) return false;
  try { return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  catch { return false; }
}

function localKey(userId: string) {
  if (typeof window === "undefined" || !USER_ID.test(userId)) return null;
  return `${PREFIX}:${window.location.origin}:${userId}`;
}

export function readLocalBiometric(userId: string): string | null {
  const key = localKey(userId);
  if (!key) return null;
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) || "null");
    if (!stored || typeof stored !== "object") return null;
    const value = stored as Record<string, unknown>;
    return value.version === 1 && value.userId === userId && value.origin === window.location.origin
      && typeof value.credentialId === "string" && CREDENTIAL.test(value.credentialId) ? value.credentialId : null;
  } catch { return null; }
}

function announcePreference() {
  try { window.dispatchEvent(new Event("zero-biometric-change")); } catch { /* The next lock also reloads preferences. */ }
}

export function disableLocalBiometric(userId: string) {
  const key = localKey(userId);
  if (!key) return;
  window.localStorage.removeItem(key);
  announcePreference();
}

function saveLocalBiometric(userId: string, credentialId: string) {
  const key = localKey(userId);
  if (!key || !CREDENTIAL.test(credentialId)) throw new BiometricUnlockError("storage", "Non riesco a salvare l’attivazione su questo dispositivo.");
  try {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, userId, origin: window.location.origin, credentialId }));
    if (readLocalBiometric(userId) !== credentialId) throw Error("Preference unavailable");
    announcePreference();
  } catch {
    throw new BiometricUnlockError("storage", "La passkey è stata verificata, ma non riesco a salvare l’attivazione su questo dispositivo. Puoi usare il codice e riprovare.");
  }
}

async function account(expectedEmail: string) {
  const expected = normalizedEmail(expectedEmail);
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !USER_ID.test(session.user.id) || !expected || normalizedEmail(session.user.email || "") !== expected) {
    throw new BiometricUnlockError("account", "Accedi all’account corretto per usare lo sblocco con passkey.");
  }
  return session;
}

function assertSignal(signal?: AbortSignal) {
  if (signal?.aborted) throw new BiometricUnlockError("cancelled", "Verifica annullata. Puoi usare il codice.");
}

async function readJSON(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  const body = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  if (!response.ok) throw new BiometricUnlockError(response.status === 401 ? "account" : "server", typeof body.error === "string" ? body.error : "La verifica non è disponibile. Puoi usare il codice e riprovare.");
  return body;
}

export async function biometricUnlockStatus(expectedEmail: string, signal?: AbortSignal): Promise<BiometricStatus> {
  assertSignal(signal);
  const session = await account(expectedEmail);
  assertSignal(signal);
  const platform = await platformBiometricAvailable();
  assertSignal(signal);
  if (!platform) return { available: false, enabled: false, userId: session.user.id, hasCredentials: false,
    reason: trustedContext() ? "Lo sblocco del dispositivo non è disponibile in questo browser. Il codice ZERO resta disponibile." : "Apri ZERO dal collegamento ufficiale per usare Face ID e passkey." };
  const body = await readJSON(await fetch("/api/biometric", {
    cache: "no-store", signal, headers: { authorization: `Bearer ${session.access_token}` },
  }));
  assertSignal(signal);
  const current = await account(expectedEmail);
  if (current.user.id !== session.user.id) throw new BiometricUnlockError("account", "L’account è cambiato. Riapri lo sblocco con l’account corretto.");
  assertSignal(signal);
  const ids = Array.isArray(body.credentialIds) ? body.credentialIds.filter((id): id is string => typeof id === "string" && CREDENTIAL.test(id)) : [];
  const credentialId = readLocalBiometric(session.user.id);
  return { available: body.available === true, enabled: body.available === true && !!credentialId && ids.includes(credentialId),
    userId: session.user.id, ...(credentialId && ids.includes(credentialId) ? { credentialId } : {}), hasCredentials: ids.length > 0,
    ...(body.available !== true ? { reason: "Lo sblocco con passkey non è ancora disponibile sul server. Puoi usare il codice." } : {}) };
}

function loadBrowser() {
  if (!browserPromise) browserPromise = import("@simplewebauthn/browser").then(module => { activeBrowser = module; return module; }).catch(error => { browserPromise = null; throw error; });
  return browserPromise;
}

export function cancelBiometricPrompt() {
  operationSequence += 1;
  activeBrowser?.WebAuthnAbortService.cancelCeremony();
}

function readableError(error: unknown, cancelled: boolean, accountChanged: boolean): Error {
  if (accountChanged) return new BiometricUnlockError("account", "L’account è cambiato durante la verifica. Usa il codice dell’account corrente.");
  if (error instanceof BiometricUnlockError) return error;
  const value = error as { name?: string; code?: string } | null;
  if (cancelled || value?.name === "AbortError" || value?.code === "ERROR_CEREMONY_ABORTED") return new BiometricUnlockError("cancelled", "Verifica annullata. Puoi usare il codice.");
  if (value?.name === "NotAllowedError") return new BiometricUnlockError("cancelled", "Verifica non completata. Puoi riprovare oppure usare il codice.");
  if (value?.name === "InvalidStateError") return new BiometricUnlockError("existing", "Questa passkey è già presente. Riprova usando la passkey esistente.");
  if (value?.name === "SecurityError") return new BiometricUnlockError("unsupported", "Apri ZERO dal collegamento ufficiale per usare la passkey.");
  return new BiometricUnlockError("unavailable", "Non riesco a completare la verifica. Controlla la connessione oppure usa il codice.");
}

async function ceremony(expectedEmail: string, enable: boolean, options: { newCredential?: boolean; signal?: AbortSignal } = {}): Promise<VerifiedBiometric> {
  cancelBiometricPrompt();
  const sequence = operationSequence;
  const controller = new AbortController();
  let changed = false;
  const abort = () => { controller.abort(); if (sequence === operationSequence) cancelBiometricPrompt(); };
  options.signal?.addEventListener("abort", abort, { once: true });
  let subscription: { unsubscribe: () => void } | undefined;
  try {
    assertSignal(options.signal);
    if (!await platformBiometricAvailable()) throw new BiometricUnlockError("unsupported", "Lo sblocco del dispositivo non è disponibile qui. Puoi usare il codice ZERO.");
    assertSignal(options.signal);
    const first = await account(expectedEmail);
    const id = first.user.id;
    const ensure = () => {
      assertSignal(options.signal); assertSignal(controller.signal);
      if (sequence !== operationSequence) throw new BiometricUnlockError("cancelled", "Verifica annullata. Puoi usare il codice.");
      if (changed) throw new BiometricUnlockError("account", "L’account è cambiato durante la verifica.");
    };
    subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.id !== id || normalizedEmail(session.user.email || "") !== normalizedEmail(expectedEmail)) {
        changed = true; abort();
      }
    }).data.subscription;
    const currentAccount = async () => {
      ensure();
      const session = await account(expectedEmail);
      if (session.user.id !== id) { changed = true; throw new BiometricUnlockError("account", "L’account è cambiato durante la verifica."); }
      ensure();
      return session;
    };
    const post = async (payload: Record<string, unknown>) => {
      const session = await currentAccount();
      const result = await readJSON(await fetch("/api/biometric", { method: "POST", cache: "no-store", signal: controller.signal,
        headers: { authorization: `Bearer ${session.access_token}`, "content-type": "application/json" }, body: JSON.stringify(payload) }));
      await currentAccount();
      return result;
    };
    let credentialId: string | null = null;
    let register = false;
    if (enable) {
      const session = await currentAccount();
      const status = await readJSON(await fetch("/api/biometric", { cache: "no-store", signal: controller.signal, headers: { authorization: `Bearer ${session.access_token}` } }));
      await currentAccount();
      if (status.available !== true) throw new BiometricUnlockError("server", "Lo sblocco con passkey non è ancora disponibile sul server. Puoi usare il codice.");
      register = options.newCredential === true || !Array.isArray(status.credentialIds) || status.credentialIds.length === 0;
    } else {
      credentialId = readLocalBiometric(id);
      if (!credentialId) throw new BiometricUnlockError("disabled", "Attiva prima Face ID e passkey dal profilo. Per ora usa il codice.");
    }
    const action = register ? "register" : "auth";
    const [browser, challenge] = await Promise.all([loadBrowser(), post({ action: `${action}-options`, ...(credentialId ? { credentialId } : {}) })]);
    ensure();
    if (typeof challenge.challengeId !== "string" || !USER_ID.test(challenge.challengeId) || !challenge.options || typeof challenge.options !== "object") throw new BiometricUnlockError("server", "Non riesco a preparare la verifica. Puoi usare il codice.");
    const response = register
      ? await browser.startRegistration({ optionsJSON: challenge.options as Parameters<BrowserModule["startRegistration"]>[0]["optionsJSON"] })
      : await browser.startAuthentication({ optionsJSON: challenge.options as Parameters<BrowserModule["startAuthentication"]>[0]["optionsJSON"] });
    await currentAccount();
    const result = await post({ action: `${action}-verify`, challengeId: challenge.challengeId, response });
    await currentAccount();
    const verifiedId = result.credentialId;
    if (result.verified !== true || result.userId !== id || typeof verifiedId !== "string" || !CREDENTIAL.test(verifiedId)
      || verifiedId !== response.id || (credentialId && verifiedId !== credentialId)) {
      throw new BiometricUnlockError("not-verified", "La passkey non è stata verificata per questo account. Puoi usare il codice.");
    }
    ensure();
    if (enable) saveLocalBiometric(id, verifiedId);
    return { verified: true, userId: id, credentialId: verifiedId };
  } catch (error) {
    throw readableError(error, controller.signal.aborted || options.signal?.aborted === true || sequence !== operationSequence, changed);
  } finally {
    subscription?.unsubscribe();
    options.signal?.removeEventListener("abort", abort);
  }
}

export function enableBiometricUnlock(expectedEmail: string, options: { newCredential?: boolean; signal?: AbortSignal } = {}) {
  return ceremony(expectedEmail, true, options);
}

export function unlockWithBiometric(expectedEmail: string, signal?: AbortSignal) {
  return ceremony(expectedEmail, false, { signal });
}
