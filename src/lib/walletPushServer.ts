import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual, createECDH } from "node:crypto";
import webpush from "web-push";
import { adminClient, authenticatedUser, noCache, readPushState, type StoredPush } from "@/lib/subscriptionReminderServer";
import { parseWalletPayment, type WalletPaymentDraft } from "@/lib/walletPayment";

type Admin = ReturnType<typeof adminClient>;
export const WALLET_BUCKET = "zero-notification-service";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = 86400000;
interface Pairing { hash: string; cardId: string; endpoint: string; expires: number }
interface QueuedDraft { id: string; draft: WalletPaymentDraft; created: number; expires: number; consumed?: number; notificationAccepted?: boolean }
export class WalletError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function walletError(error: unknown) {
  if (!(error instanceof WalletError)) console.warn("ZERO wallet service unavailable");
  return Response.json({ error: error instanceof WalletError ? error.message : "Servizio Apple Pay non disponibile. Riprova." }, { status: error instanceof WalletError ? error.status : 503, headers: noCache });
}
export function walletConfigured() {
  const env = process.env;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  try {
    const pair = createECDH("prime256v1");
    pair.setPrivateKey(Buffer.from(env.VAPID_PRIVATE_KEY, "base64url"));
    return pair.getPublicKey().equals(Buffer.from(env.VAPID_PUBLIC_KEY, "base64url"));
  } catch { return false; }
}
export async function walletUser(request: Request) {
  const auth = await authenticatedUser(request);
  if (!auth) throw new WalletError(401, "Accedi a ZERO per continuare.");
  return auth;
}
export async function walletBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length") || 0) > 5000) throw new WalletError(413, "Dati troppo lunghi.");
  const text = await request.text();
  if (text.length > 5000) throw new WalletError(413, "Dati troppo lunghi.");
  try {
    const value = JSON.parse(text);
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  } catch { /* Return the same validation error for invalid JSON and shape. */ }
  throw new WalletError(400, "Usa un corpo JSON con i dati del pagamento.");
}
function missing(error: { statusCode?: string | number; message?: string }) {
  return String(error.statusCode) === "404" || /not found|does not exist/i.test(error.message || "");
}
function conflict(error: { statusCode?: string | number; message?: string }) {
  return String(error.statusCode) === "409" || /already exists|duplicate/i.test(error.message || "");
}
function storage(admin: Admin) { return admin.storage.from(WALLET_BUCKET); }
async function read<T>(admin: Admin, path: string): Promise<T | null> {
  const { data, error } = await storage(admin).download(path);
  if (error) { if (missing(error)) return null; throw error; }
  return JSON.parse(await data.text()) as T;
}
async function put(admin: Admin, path: string, value: unknown, upsert: boolean) {
  const { error } = await storage(admin).upload(path, JSON.stringify(value), { upsert, contentType: "application/json", cacheControl: "0" });
  if (error) { if (!upsert && conflict(error)) return false; throw error; }
  return true;
}
const pairingPath = (userId: string) => `wallet/${userId}/pairing.json`;
const draftPath = (userId: string, id: string) => `wallet/${userId}/drafts/${id}.json`;
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
export function walletDraftId(userId: string, ref: string) {
  const bytes = createHash("sha256").update(`${userId}\0${ref}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80; bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export async function ownedCard(admin: Admin, userId: string, value: unknown) {
  if (typeof value !== "string" || !UUID.test(value)) throw new WalletError(400, "Scegli una carta valida.");
  const result = await admin.from("cards").select("id").eq("id", value).eq("user_id", userId).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) throw new WalletError(404, "La carta non è disponibile in questo account.");
  return value;
}
async function ownDevice(admin: Admin, userId: string, endpoint: unknown): Promise<StoredPush> {
  const state = await readPushState(admin, userId); // Also initializes the existing private bucket.
  const device = state.devices.find(item => item.endpoint === endpoint);
  if (!device) throw new WalletError(409, "Attiva prima le notifiche su questo dispositivo.");
  const profile = await admin.from("profiles").select("notifications_enabled").eq("id", userId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data || profile.data.notifications_enabled === false) throw new WalletError(409, "Attiva gli avvisi nelle preferenze di ZERO.");
  return device;
}
export async function walletSetup(admin: Admin, userId: string) {
  await readPushState(admin, userId);
  const pairing = await read<Pairing>(admin, pairingPath(userId));
  if (!pairing || pairing.expires <= Date.now() || !pairing.hash) return null;
  return { cardId: pairing.cardId, expires: new Date(pairing.expires).toISOString() };
}
export async function createWalletPairing(admin: Admin, userId: string, body: Record<string, unknown>) {
  if (!walletConfigured()) throw new WalletError(503, "Invio notifiche in attesa di configurazione sul server.");
  const cardId = await ownedCard(admin, userId, body.cardId);
  const device = await ownDevice(admin, userId, body.endpoint);
  const secret = randomBytes(32).toString("hex");
  const expires = Date.now() + 90 * DAY;
  await put(admin, pairingPath(userId), { hash: digest(secret), cardId, endpoint: device.endpoint, expires } satisfies Pairing, true);
  return { token: `${userId}.${secret}`, expires: new Date(expires).toISOString() };
}
export async function revokeWalletPairing(admin: Admin, userId: string) {
  await readPushState(admin, userId);
  // A tombstone avoids races with an outstanding write and never exposes the secret.
  await put(admin, pairingPath(userId), { hash: "", cardId: "", endpoint: "", expires: 0 }, true);
}
export async function walletCapability(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer ([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(header);
  if (!match || !UUID.test(match[1])) throw new WalletError(401, "Collegamento Apple Pay non valido. Generane uno nuovo in ZERO.");
  if (!walletConfigured()) throw new WalletError(503, "Invio notifiche in attesa di configurazione sul server.");
  const admin = adminClient(), userId = match[1];
  const pairing = await read<Pairing>(admin, pairingPath(userId));
  const supplied = Buffer.from(digest(match[2]), "hex");
  const expected = Buffer.from(pairing?.hash || "", "hex");
  if (!pairing || expected.length !== supplied.length || !timingSafeEqual(expected, supplied) || pairing.expires <= Date.now()) throw new WalletError(401, "Collegamento Apple Pay scaduto o revocato. Generane uno nuovo in ZERO.");
  await ownedCard(admin, userId, pairing.cardId);
  const device = await ownDevice(admin, userId, pairing.endpoint);
  return { admin, userId, pairing, device };
}
export function walletDraft(body: Record<string, unknown>, cardId: string): WalletPaymentDraft {
  if ((typeof body.amount !== "string" && typeof body.amount !== "number") || typeof body.merchant !== "string" || typeof body.date !== "string" || typeof body.ref !== "string" || body.currency !== "EUR") throw new WalletError(400, "Controlla importo in euro, esercente, data e riferimento nell’automazione.");
  const draft = parseWalletPayment("#zero-pay?" + new URLSearchParams({ amount: String(body.amount), merchant: body.merchant, date: body.date, ref: body.ref, cardId, currency: "EUR" }).toString());
  if (!draft || Math.abs(Date.parse(draft.date + "T12:00:00Z") - Date.now()) > 2 * DAY) throw new WalletError(400, "Dati del pagamento incompleti o data troppo lontana. Controlla l’automazione.");
  return draft;
}
async function limitNewDraft(admin: Admin, userId: string) {
  const minute = Math.floor(Date.now() / 60000);
  for (let slot = 0; slot < 5; slot++) if (await put(admin, `wallet/${userId}/limits/${minute}-${slot}.json`, { expires: Date.now() + DAY }, false)) return;
  throw new WalletError(429, "Sono arrivate troppe richieste. Attendi un minuto prima di riprovare.");
}
async function cleanup(admin: Admin, userId: string) {
  // Keep deduplication tombstones longer than the accepted two-day replay window.
  for (const folder of ["drafts", "receipts", "limits"]) {
    const prefix = `wallet/${userId}/${folder}`;
    const { data, error } = await storage(admin).list(prefix, { limit: 100, sortBy: { column: "created_at", order: "asc" } });
    if (error) throw error;
    const cutoff = Date.now() - (folder === "drafts" ? 7 : 2) * DAY;
    const old = (data || []).filter(item => item.created_at && new Date(item.created_at).getTime() < cutoff && /^[\w-]+\.json$/.test(item.name)).map(item => `${prefix}/${item.name}`);
    if (old.length) { const removed = await storage(admin).remove(old); if (removed.error) throw removed.error; }
    if (folder === "drafts") for (const item of (data || []).slice(0, 20)) {
      if (!UUID.test(item.name.replace(/\.json$/, "")) || old.includes(`${prefix}/${item.name}`)) continue;
      const record = await read<QueuedDraft>(admin, `${prefix}/${item.name}`);
      if (record && !record.consumed && record.expires <= Date.now()) await consumeWalletDraft(admin, userId, record.id);
    }
  }
}
export async function queueWalletDraft(admin: Admin, userId: string, draft: WalletPaymentDraft, device: StoredPush) {
  const id = walletDraftId(userId, draft.ref), path = draftPath(userId, id);
  const receiptPath = `wallet/${userId}/receipts/${id}.json`;
  const existing = await read<QueuedDraft>(admin, path);
  if (existing) return { id, duplicate: true, notificationAccepted: !!await read(admin, receiptPath) };
  await limitNewDraft(admin, userId);
  const record: QueuedDraft = { id, draft, created: Date.now(), expires: Date.now() + DAY };
  const created = await put(admin, path, record, false);
  if (!created) {
    return { id, duplicate: true, notificationAccepted: !!await read(admin, receiptPath) };
  }
  webpush.setVapidDetails("https://zero-henna-one.vercel.app", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  try {
    await webpush.sendNotification(device, JSON.stringify({
      title: draft.preview ? "Prova Apple Pay ZERO" : "Vuoi segnare questa spesa?",
      body: draft.preview ? "Tocca per aprire la prova in ZERO. Il salvataggio è disattivato." : "Apri ZERO, scegli la categoria e conferma. La spesa è già precompilata.",
      tag: `zero-wallet-${id}`, type: "zero-wallet-payment", id,
    }), { TTL: 24 * 60 * 60, timeout: 8000 });
    // A separate immutable receipt cannot resurrect a draft consumed during delivery.
    await put(admin, receiptPath, { accepted: Date.now() }, false);
  } catch {
    throw new WalletError(503, "Bozza ricevuta, ma notifica non accettata. Apri ZERO dalla Home per recuperarla; verifica poi le notifiche.");
  }
  await cleanup(admin, userId).catch(() => { console.warn("ZERO wallet cleanup deferred"); });
  return { id, duplicate: false, notificationAccepted: true };
}
export async function pendingWalletDrafts(admin: Admin, userId: string) {
  await readPushState(admin, userId);
  const cards = await admin.from("cards").select("id").eq("user_id", userId);
  if (cards.error) throw cards.error;
  const owned = new Set((cards.data || []).map(card => card.id));
  const drafts: Array<{ id: string; draft: WalletPaymentDraft }> = [];
  // Five new drafts/minute bounds one day to 7,200 rows. Page past consumed
  // records so dismissing many receipts cannot hide another pending payment.
  for (let offset = 0; offset < 8000 && drafts.length < 50; offset += 100) {
    const { data, error } = await storage(admin).list(`wallet/${userId}/drafts`, { limit: 100, offset, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;
    const rows = (data || []).filter(item => item.name.endsWith(".json") && UUID.test(item.name.slice(0, -5)));
    for (let start = 0; start < rows.length; start += 20) {
      const records = await Promise.all(rows.slice(start, start + 20).map(item => read<QueuedDraft>(admin, `wallet/${userId}/drafts/${item.name}`)));
      for (const record of records) {
        if (!record || record.consumed) continue;
        if (record.expires <= Date.now()) { await consumeWalletDraft(admin, userId, record.id); continue; }
        if (owned.has(record.draft.cardId)) drafts.push({ id: record.id, draft: record.draft });
      }
    }
    const oldest = data?.at(-1)?.created_at;
    if (!data || data.length < 100 || oldest && new Date(oldest).getTime() < Date.now() - DAY) break;
  }
  return drafts.slice(0, 50);
}
export async function consumeWalletDraft(admin: Admin, userId: string, id: unknown) {
  if (typeof id !== "string" || !UUID.test(id)) throw new WalletError(400, "Bozza non valida.");
  const path = draftPath(userId, id), record = await read<QueuedDraft>(admin, path);
  if (!record) throw new WalletError(404, "Bozza non disponibile in questo account.");
  // Retain only the deduplication marker after dismiss/save; remove financial details.
  await put(admin, path, { id: record.id, created: record.created, expires: 0, consumed: Date.now(), notificationAccepted: record.notificationAccepted === true }, true);
}
export async function testWalletPush(admin: Admin, userId: string, body: Record<string, unknown>) {
  if (!walletConfigured()) throw new WalletError(503, "Invio notifiche in attesa di configurazione sul server.");
  const cardId = await ownedCard(admin, userId, body.cardId);
  const device = await ownDevice(admin, userId, body.endpoint);
  return queueWalletDraft(admin, userId, { ref: randomUUID(), title: "Pagamento di prova", amount: 1, date: new Date().toISOString().slice(0, 10), cardId, preview: true }, device);
}
