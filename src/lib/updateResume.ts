export const UPDATE_RESUME_KEY = "zero_update_resume_v1";

// A one-use continuation of an already unlocked session during an automatic update.
// Ordinary reloads, another account, onboarding and expired markers still require the PIN.
export function consumeUpdateResume(
  storage: Pick<Storage, "getItem" | "removeItem">,
  email: string,
  version: string,
  requestedVersion: string | null,
): boolean {
  try {
    const saved = JSON.parse(storage.getItem(UPDATE_RESUME_KEY) || "null");
    storage.removeItem(UPDATE_RESUME_KEY);
    return !!email && requestedVersion === version && saved?.version === version
      && typeof saved.email === "string" && saved.email.toLowerCase() === email.toLowerCase()
      && typeof saved.at === "number" && Date.now() >= saved.at && Date.now() - saved.at < 60_000;
  } catch { return false; }
}
