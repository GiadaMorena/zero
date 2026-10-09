export function notifySaved(title: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("zero-saved", { detail: { title } }));
}
