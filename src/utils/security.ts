/**
 * Security helper to hash user's 6-digit PIN before saving to state/localStorage.
 * Never stores or logs plain text PINs.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`zero_secure_salt_${pin}_2026`);

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      // Fall through to fallback hash if Web Crypto API fails
    }
  }

  // Fallback hash implementation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0;
  }
  return `zero_pin_hash_${Math.abs(hash).toString(16)}`;
}
