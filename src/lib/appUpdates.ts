import { UPDATE_RESUME_KEY } from "./updateResume";
const ATTEMPT_KEY = "zero_update_attempt_v1";
const UPDATE_QUERY = "zero_update";

export interface UpdateEnvironment {
  window: Window;
  document: Document;
  navigator: Pick<Navigator, "onLine">;
  fetch: typeof fetch;
  storage: Pick<Storage, "getItem" | "setItem">;
  currentVersion: string;
  onPending: (pending: boolean) => void;
}

// Exported separately so offline, draft and reload-loop behavior can be verified.
export function startAppUpdates(env: UpdateEnvironment) {
  const { window, document, navigator, storage, currentVersion, onPending } = env;
  if (!currentVersion || currentVersion === "development") return () => {};
  let stopped = false, checking = false, reloading = false;
  let pendingVersion = "", firstAttemptAt = 0;
  const dirtyFields = new Set<Element>();
  const visible = (element: Element) => element.getClientRects().length > 0;
  const busy = () => {
    const blockers = document.querySelectorAll('form, [role="dialog"], [data-app-update-block="true"]');
    if (Array.from(blockers).some(visible)) return true;
    for (const field of dirtyFields) {
      if (!document.contains(field) || !visible(field)) dirtyFields.delete(field);
      else return true;
    }
    const focused = document.activeElement;
    return !!focused && visible(focused) && focused.matches("input, textarea, select, [contenteditable=true]");
  };
  const applyUpdate = () => {
    if (stopped || reloading || !pendingVersion || document.hidden || navigator.onLine === false || busy()) return;
    // Leave enough time for a just-opened screen to mount its input fields.
    if (Date.now() - firstAttemptAt < 1500) return;
    // Also prevent loops when storage is disabled and stale HTML survives a reload.
    const url = new URL(window.location.href);
    if (url.searchParams.get(UPDATE_QUERY) === pendingVersion) return;
    try {
      const previous = JSON.parse(storage.getItem(ATTEMPT_KEY) || "null");
      if (previous?.from === currentVersion && previous?.to === pendingVersion && Date.now() - previous.at < 300_000) return;
      storage.setItem(ATTEMPT_KEY, JSON.stringify({ from: currentVersion, to: pendingVersion, at: Date.now() }));
    } catch { /* Updating also works when session storage is unavailable. */ }
    reloading = true;
    const unlocked = Array.from(document.querySelectorAll('[data-app-session-unlocked="true"]')).find(visible);
    const email = unlocked?.getAttribute("data-account-email");
    if (email) {
      try { storage.setItem(UPDATE_RESUME_KEY, JSON.stringify({ email, version: pendingVersion, at: Date.now() })); }
      catch { /* Without storage the normal PIN screen remains in place. */ }
    }
    url.searchParams.set(UPDATE_QUERY, pendingVersion);
    window.location.replace(url.toString());
  };
  const check = async () => {
    if (stopped || checking || reloading || document.hidden || navigator.onLine === false) return;
    checking = true;
    try {
      const response = await env.fetch(`/api/app-version?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
      if (!response.ok) return;
      const data: unknown = await response.json();
      const version = typeof data === "object" && data !== null && "version" in data ? (data as { version: unknown }).version : null;
      if (stopped || typeof version !== "string" || !version || version === "development") return;
      if (version === currentVersion) {
        pendingVersion = "";
        onPending(false);
        cleanUpdateQuery();
        return;
      }
      if (pendingVersion !== version) firstAttemptAt = Date.now();
      pendingVersion = version;
      onPending(true);
    } catch { /* A timeout/offline response is not an update. Keep the current app open. */ }
    finally { checking = false; }
  };
  const onInput = (event: Event) => {
    const field = event.target as HTMLInputElement | null;
    if (!field?.matches?.("input, textarea, select, [contenteditable=true]")) return;
    if (field.matches('input[type="search"], [data-update-ignore="true"]')) return;
    if (field.value === "") dirtyFields.delete(field);
    else dirtyFields.add(field);
  };
  const onResume = () => { void check(); };
  // Remove the cache-busting query after a successful switch to this version.
  const cleanUpdateQuery = () => {
    // Let authentication consume the one-use continuation before removing its URL marker.
    try { if (storage.getItem(UPDATE_RESUME_KEY)) return; } catch { /* ignore */ }
    const url = new URL(window.location.href);
    if (url.searchParams.get(UPDATE_QUERY) === currentVersion) {
      url.searchParams.delete(UPDATE_QUERY);
      window.history.replaceState(null, "", url.toString());
    }
  };
  cleanUpdateQuery();
  document.addEventListener("input", onInput, true);
  document.addEventListener("change", onInput, true);
  document.addEventListener("visibilitychange", onResume);
  window.addEventListener("focus", onResume);
  window.addEventListener("pageshow", onResume);
  window.addEventListener("online", onResume);
  const checkTimer = window.setInterval(() => { void check(); }, 60_000);
  const applyTimer = window.setInterval(applyUpdate, 2000);
  void check();
  return () => {
    stopped = true;
    window.clearInterval(checkTimer);
    window.clearInterval(applyTimer);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onInput, true);
    document.removeEventListener("visibilitychange", onResume);
    window.removeEventListener("focus", onResume);
    window.removeEventListener("pageshow", onResume);
    window.removeEventListener("online", onResume);
  };
}
