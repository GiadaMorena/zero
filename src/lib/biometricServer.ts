import "server-only";
import { createHash, randomUUID } from "node:crypto";
import {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse,
  type RegistrationResponseJSON, type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { adminClient, authenticatedUser, noCache } from "@/lib/subscriptionReminderServer";

const BUCKET = "zero-notification-service";
const RP_ID = "zero-henna-one.vercel.app";
const ORIGIN = `https://${RP_ID}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID = /^[A-Za-z0-9_-]{1,2048}$/;
const FIVE_MINUTES = 5 * 60_000;
type Admin = ReturnType<typeof adminClient>;
type Auth = NonNullable<Awaited<ReturnType<typeof authenticatedUser>>>;
type Ceremony = "register" | "auth";
interface Credential {
  id: string; publicKey: string; counter: number; userId: string;
  transports?: string[]; created: number;
}
interface Challenge {
  userId: string; kind: Ceremony; challenge: string; origin: string; rpID: string;
  allowedIds: string[]; expires: number; created: number;
}
export class BiometricError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function biometricError(error: unknown) {
  if (!(error instanceof BiometricError)) console.warn("ZERO passkey service unavailable");
  return Response.json({ error: error instanceof BiometricError ? error.message : "Sblocco con passkey non disponibile. Puoi usare il codice ZERO." }, {
    status: error instanceof BiometricError ? error.status : 503, headers: noCache,
  });
}
export function biometricOrigin(request: Request) {
  const actual = request.headers.get("origin");
  if (actual === ORIGIN) return { origin: ORIGIN, rpID: RP_ID };
  if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && actual === url.origin) return { origin: url.origin, rpID: url.hostname };
  }
  throw new BiometricError(403, "Apri ZERO dal sito principale per usare Face ID e le passkey.");
}
export async function biometricUser(request: Request): Promise<Auth> {
  if (!request.headers.get("authorization")?.startsWith("Bearer ")) throw new BiometricError(401, "Accedi a ZERO per continuare.");
  const auth = await authenticatedUser(request);
  if (!auth || !UUID.test(auth.user.id) || auth.user.is_anonymous) throw new BiometricError(401, "Accedi a ZERO per continuare.");
  return auth;
}
export async function biometricBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length") || 0) > 30000) throw new BiometricError(413, "Risposta della passkey troppo lunga.");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 30000) { await reader.cancel(); throw new BiometricError(413, "Risposta della passkey troppo lunga."); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try { const body = JSON.parse(text); if (body && typeof body === "object" && !Array.isArray(body)) return body; } catch { /* Use the same bounded validation error. */ }
  throw new BiometricError(400, "Richiesta della passkey non valida.");
}
function missing(error: { statusCode?: string | number; message?: string }) {
  return String(error.statusCode) === "404" || /not found|does not exist/i.test(error.message || "");
}
function conflict(error: { statusCode?: string | number; message?: string }) {
  return String(error.statusCode) === "409" || /already exists|duplicate/i.test(error.message || "");
}
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const prefix = (userId: string) => `biometric/${userId}`;
const storage = (admin: Admin) => admin.storage.from(BUCKET);
async function ensureBucket(admin: Admin) {
  const bucket = await admin.storage.getBucket(BUCKET);
  if (!bucket.error) { if (bucket.data?.public) throw Error("Passkey bucket must be private"); return; }
  if (!missing(bucket.error)) throw bucket.error;
  const created = await admin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 500000, allowedMimeTypes: ["application/json"] });
  if (created.error && !conflict(created.error)) throw created.error;
}
async function read<T>(admin: Admin, path: string): Promise<T | null> {
  const { data, error } = await storage(admin).download(path);
  if (error) { if (missing(error)) return null; throw error; }
  return JSON.parse(await data.text()) as T;
}
async function create(admin: Admin, path: string, value: unknown) {
  const { error } = await storage(admin).upload(path, JSON.stringify(value), { upsert: false, contentType: "application/json", cacheControl: "0" });
  if (error) { if (conflict(error)) return false; throw error; }
  return true;
}
async function list(admin: Admin, path: string, options: { limit: number; sortBy?: { column: string; order: string } }) {
  const { data, error } = await storage(admin).list(path, options);
  if (error) throw error;
  return data || [];
}
function validCredential(value: Credential | null, userId: string): value is Credential {
  return !!value && value.userId === userId && ID.test(value.id) && /^[A-Za-z0-9_-]+$/.test(value.publicKey)
    && Buffer.from(value.publicKey, "base64url").length > 0 && Buffer.from(value.publicKey, "base64url").length <= 8192
    && Number.isSafeInteger(value.counter) && value.counter >= 0;
}
async function credentials(admin: Admin, userId: string) {
  await ensureBucket(admin);
  const rows = await list(admin, `${prefix(userId)}/credentials`, { limit: 11 });
  const records = await Promise.all(rows.filter(row => /^slot-[0-9]\.json$/.test(row.name)).map(row => read<Credential>(admin, `${prefix(userId)}/credentials/${row.name}`)));
  return records.filter((record): record is Credential => validCredential(record, userId));
}
export async function biometricStatus(auth: Auth) {
  return { available: true, credentialIds: (await credentials(auth.admin, auth.user.id)).map(item => item.id) };
}
async function rateLimit(admin: Admin, userId: string) {
  const minute = Math.floor(Date.now() / 60000);
  for (let slot = 0; slot < 20; slot++) if (await create(admin, `${prefix(userId)}/limits/${minute}-${slot}.json`, { created: Date.now() })) return;
  throw new BiometricError(429, "Attendi un minuto prima di riprovare con la passkey.");
}
async function cleanup(admin: Admin, userId: string) {
  for (const folder of ["challenges", "used", "limits"]) {
    const path = `${prefix(userId)}/${folder}`;
    const rows = await list(admin, path, { limit: 50, sortBy: { column: "created_at", order: "asc" } });
    const cutoff = Date.now() - (folder === "limits" ? 24 * 60 * 60_000 : 2 * FIVE_MINUTES);
    const expired = rows.filter(row => row.created_at && new Date(row.created_at).getTime() < cutoff && /^[\w-]+\.json$/.test(row.name)).map(row => `${path}/${row.name}`);
    if (expired.length) { const removed = await storage(admin).remove(expired); if (removed.error) throw removed.error; }
  }
}
async function remember(auth: Auth, party: ReturnType<typeof biometricOrigin>, kind: Ceremony, challenge: string, allowedIds: string[]) {
  const challengeId = randomUUID(), now = Date.now();
  const created = await create(auth.admin, `${prefix(auth.user.id)}/challenges/${challengeId}.json`, {
    userId: auth.user.id, kind, challenge, ...party, allowedIds, created: now, expires: now + FIVE_MINUTES,
  } satisfies Challenge);
  if (!created) throw Error("Unable to create passkey challenge");
  await cleanup(auth.admin, auth.user.id).catch(() => { console.warn("ZERO passkey cleanup deferred"); });
  return challengeId;
}
async function consume(auth: Auth, party: ReturnType<typeof biometricOrigin>, kind: Ceremony, id: unknown) {
  if (typeof id !== "string" || !UUID.test(id)) throw new BiometricError(400, "Richiesta della passkey non valida. Riprova.");
  const challenge = await read<Challenge>(auth.admin, `${prefix(auth.user.id)}/challenges/${id}.json`);
  if (!challenge || challenge.userId !== auth.user.id || challenge.kind !== kind || challenge.origin !== party.origin || challenge.rpID !== party.rpID || challenge.expires <= Date.now()) throw new BiometricError(400, "La richiesta della passkey è scaduta o non è valida. Riprova.");
  if (!await create(auth.admin, `${prefix(auth.user.id)}/used/${id}.json`, { created: Date.now() })) throw new BiometricError(409, "Questa richiesta della passkey è già stata usata. Riprova.");
  return challenge;
}
function responseFrom(body: Record<string, unknown>) {
  const value = body.response;
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof (value as { id?: unknown }).id !== "string" || !ID.test((value as { id: string }).id)) throw new BiometricError(400, "Risposta della passkey non valida.");
  return value as RegistrationResponseJSON | AuthenticationResponseJSON;
}
async function options(auth: Auth, party: ReturnType<typeof biometricOrigin>, body: Record<string, unknown>, kind: Ceremony) {
  const current = await credentials(auth.admin, auth.user.id);
  await rateLimit(auth.admin, auth.user.id);
  if (kind === "register") {
    if (current.length >= 10) throw new BiometricError(409, "Hai già registrato il numero massimo di passkey per ZERO.");
    const generated = await generateRegistrationOptions({
      rpName: "ZERO", rpID: party.rpID, userName: auth.user.email || auth.user.id,
      userDisplayName: "ZERO", userID: new TextEncoder().encode(auth.user.id),
      timeout: 60000, attestationType: "none", supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: current.map(item => ({ id: item.id, transports: item.transports })),
      authenticatorSelection: { authenticatorAttachment: "platform", residentKey: "required", userVerification: "required" },
    });
    return { challengeId: await remember(auth, party, kind, generated.challenge, []), options: generated };
  }
  if (body.credentialId !== undefined && (typeof body.credentialId !== "string" || !ID.test(body.credentialId))) throw new BiometricError(400, "Passkey non valida.");
  const allowed = body.credentialId ? current.filter(item => item.id === body.credentialId) : current;
  if (!allowed.length) throw new BiometricError(404, "Nessuna passkey disponibile per questo account. Usa il codice ZERO.");
  const generated = await generateAuthenticationOptions({ rpID: party.rpID, userVerification: "required", timeout: 60000, allowCredentials: allowed.map(item => ({ id: item.id, transports: item.transports })) });
  return { challengeId: await remember(auth, party, kind, generated.challenge, allowed.map(item => item.id)), options: generated };
}
async function register(auth: Auth, party: ReturnType<typeof biometricOrigin>, body: Record<string, unknown>) {
  const response = responseFrom(body) as RegistrationResponseJSON;
  const challenge = await consume(auth, party, "register", body.challengeId);
  let result;
  try { result = await verifyRegistrationResponse({ response, expectedChallenge: challenge.challenge, expectedOrigin: party.origin, expectedRPID: party.rpID, requireUserVerification: true, requireUserPresence: true, supportedAlgorithmIDs: [-7, -257] }); }
  catch { throw new BiometricError(400, "Non riesco a verificare la passkey. Riprova oppure usa il codice ZERO."); }
  if (!result.verified || !result.registrationInfo || !result.registrationInfo.userVerified) throw new BiometricError(400, "Verifica del dispositivo non completata.");
  const credential = result.registrationInfo.credential;
  if (!ID.test(credential.id) || credential.id !== response.id || !Number.isSafeInteger(credential.counter) || credential.counter < 0) throw new BiometricError(400, "Passkey non valida.");
  const keyHash = digest(credential.id), ownerPath = `biometric/credential-owners/${keyHash}.json`;
  if (!await create(auth.admin, ownerPath, { userId: auth.user.id })) {
    const owner = await read<{ userId: string }>(auth.admin, ownerPath);
    if (owner?.userId !== auth.user.id) throw new BiometricError(409, "Questa passkey non è disponibile per l’account.");
  }
  const current = await credentials(auth.admin, auth.user.id);
  if (current.some(item => item.id === credential.id)) throw new BiometricError(409, "La passkey è già registrata. Puoi usarla per sbloccare ZERO.");
  const record: Credential = { id: credential.id, userId: auth.user.id, publicKey: Buffer.from(credential.publicKey).toString("base64url"), counter: credential.counter, transports: credential.transports, created: Date.now() };
  for (let slot = 0; slot < 10; slot++) if (await create(auth.admin, `${prefix(auth.user.id)}/credentials/slot-${slot}.json`, record)) return { verified: true, credentialId: record.id, userId: auth.user.id };
  throw new BiometricError(409, "Hai già registrato il numero massimo di passkey per ZERO.");
}
async function effectiveCounter(admin: Admin, userId: string, credential: Credential) {
  const rows = await list(admin, `${prefix(userId)}/counters/${digest(credential.id)}`, { limit: 1, sortBy: { column: "name", order: "desc" } });
  const latest = rows[0]?.name;
  return latest && /^\d{20}\.json$/.test(latest) ? Math.max(credential.counter, Number(latest.slice(0, -5))) : credential.counter;
}
async function authenticate(auth: Auth, party: ReturnType<typeof biometricOrigin>, body: Record<string, unknown>) {
  const response = responseFrom(body) as AuthenticationResponseJSON;
  const challenge = await consume(auth, party, "auth", body.challengeId);
  if (!challenge.allowedIds.includes(response.id)) throw new BiometricError(400, "La passkey non corrisponde alla richiesta di questo account.");
  const credential = (await credentials(auth.admin, auth.user.id)).find(item => item.id === response.id);
  if (!credential) throw new BiometricError(404, "Passkey non disponibile. Usa il codice ZERO.");
  const userHandle = response.response?.userHandle;
  if (userHandle && userHandle !== Buffer.from(auth.user.id).toString("base64url")) throw new BiometricError(400, "La passkey non corrisponde a questo account.");
  let result;
  try {
    result = await verifyAuthenticationResponse({
      response, expectedChallenge: challenge.challenge, expectedOrigin: party.origin, expectedRPID: party.rpID,
      requireUserVerification: true,
      credential: { id: credential.id, publicKey: new Uint8Array(Buffer.from(credential.publicKey, "base64url")), counter: await effectiveCounter(auth.admin, auth.user.id, credential), transports: credential.transports },
    });
  } catch { throw new BiometricError(400, "Non riesco a verificare lo sblocco. Puoi riprovare o usare il codice ZERO."); }
  if (!result.verified || !result.authenticationInfo.userVerified) throw new BiometricError(400, "Verifica del dispositivo non completata.");
  const counter = result.authenticationInfo.newCounter;
  if (!Number.isSafeInteger(counter) || counter < 0) throw new BiometricError(400, "Risposta della passkey non valida.");
  // Synced Apple passkeys normally keep counter zero. Their unique, single-use
  // challenge provides replay protection. Positive counters use immutable claims,
  // so concurrent assertions can never roll the stored counter backwards.
  if (counter > 0) {
    const path = `${prefix(auth.user.id)}/counters/${digest(credential.id)}/${String(counter).padStart(20, "0")}.json`;
    if (!await create(auth.admin, path, { created: Date.now() })) throw new BiometricError(409, "Questa verifica è già stata usata. Riprova.");
  }
  return { verified: true, credentialId: credential.id, userId: auth.user.id };
}
export async function biometricAction(request: Request, auth: Auth, body: Record<string, unknown>) {
  const party = biometricOrigin(request);
  switch (body.action) {
    case "register-options": return options(auth, party, body, "register");
    case "auth-options": return options(auth, party, body, "auth");
    case "register-verify": return register(auth, party, body);
    case "auth-verify": return authenticate(auth, party, body);
    default: throw new BiometricError(400, "Operazione della passkey non valida.");
  }
}
