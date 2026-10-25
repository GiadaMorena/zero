/* Uses the real SimpleWebAuthn verifier with synthetic P-256 credentials.
 * Supabase auth/storage are in-memory: no account, biometric or network access. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");

const projectRoot = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const dependencyRoot = path.resolve(process.argv[3] || projectRoot);
const requireDependency = createRequire(path.join(dependencyRoot, "package.json"));
const ts = requireDependency("typescript");
const webauthn = requireDependency("@simplewebauthn/server");
const ORIGIN = "https://zero-henna-one.vercel.app";
const RP = "zero-henna-one.vercel.app";
const USER = "01234567-89ab-4cde-8fab-0123456789ab";
const OTHER = "11234567-89ab-4cde-8fab-0123456789ab";
const realNow = Date.now;
let now = realNow(), objects = new Map(), isPublic = false, verifyCalls = [];
Date.now = () => now;
process.env.NODE_ENV = "production";

function storageError(statusCode, message) { return { statusCode, message }; }
const fileStorage = {
  async upload(key, value, options) {
    assert.equal(options.upsert, false, "every write must be atomic create-only");
    if (objects.has(key)) return { error: storageError(409, "already exists") };
    objects.set(key, { text: String(value), created_at: new Date(now).toISOString() });
    return { data: { path: key }, error: null };
  },
  async download(key) {
    const value = objects.get(key);
    return value ? { data: new Blob([value.text]), error: null } : { data: null, error: storageError(404, "not found") };
  },
  async list(prefix, options) {
    let data = [...objects].filter(([key]) => key.startsWith(prefix + "/") && !key.slice(prefix.length + 1).includes("/"))
      .map(([key, value]) => ({ name: key.slice(prefix.length + 1), created_at: value.created_at }));
    const order = options?.sortBy?.order === "desc" ? -1 : 1;
    const column = options?.sortBy?.column || "name";
    data.sort((a, b) => a[column].localeCompare(b[column]) * order);
    return { data: data.slice(0, options?.limit || 100), error: null };
  },
  async remove(keys) { for (const key of keys) objects.delete(key); return { error: null }; },
};
const admin = { storage: {
  async getBucket() { return { data: { public: isPublic }, error: null }; },
  async createBucket(_, options) { assert.equal(options.public, false); return { error: null }; },
  from(name) { assert.equal(name, "zero-notification-service"); return fileStorage; },
} };
const services = {
  adminClient: () => admin,
  noCache: { "Cache-Control": "private, no-store" },
  async authenticatedUser(request) {
    const token = request.headers.get("authorization");
    if (token !== "Bearer owner" && token !== "Bearer other") return null;
    return { admin, user: { id: token === "Bearer owner" ? USER : OTHER, email: "test@example.invalid", is_anonymous: false } };
  },
};
const realVerifier = { ...webauthn };
for (const name of ["verifyRegistrationResponse", "verifyAuthenticationResponse"]) {
  realVerifier[name] = async options => {
    verifyCalls.push({ name, options });
    return webauthn[name](options);
  };
}
const loaded = new Map();
function load(relative) {
  if (loaded.has(relative)) return loaded.get(relative);
  const module = { exports: {} };
  loaded.set(relative, module.exports);
  const source = fs.readFileSync(path.join(projectRoot, relative), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const localRequire = id => {
    if (id === "server-only") return {};
    if (id === "@simplewebauthn/server") return realVerifier;
    if (id === "@/lib/subscriptionReminderServer") return services;
    if (id === "@/lib/biometricServer") return load("src/lib/biometricServer.ts");
    return requireDependency(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: relative })(localRequire, module, module.exports);
  loaded.set(relative, module.exports);
  return module.exports;
}
const route = load("src/app/api/biometric/route.ts");
const lib = load("src/lib/biometricServer.ts");
function reset() { objects = new Map(); now = realNow(); isPublic = false; verifyCalls = []; process.env.NODE_ENV = "production"; }
async function request(action, body = {}, options = {}) {
  const method = options.method || "POST";
  const headers = { authorization: options.authorization === undefined ? "Bearer owner" : options.authorization };
  if (options.origin !== null) headers.origin = options.origin || ORIGIN;
  if (options.headers) Object.assign(headers, options.headers);
  const request = new Request(options.url || ORIGIN + "/api/biometric", { method, headers, ...(method === "POST" ? { body: JSON.stringify({ action, ...body }) } : {}) });
  const response = await route[method](request);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  return { status: response.status, body: await response.json() };
}
function intHeader(major, value) {
  if (value < 24) return Buffer.from([(major << 5) | value]);
  if (value < 256) return Buffer.from([(major << 5) | 24, value]);
  if (value < 65536) { const b = Buffer.alloc(3); b[0] = (major << 5) | 25; b.writeUInt16BE(value, 1); return b; }
  throw Error("test fixture too long");
}
function cbor(value) {
  if (Number.isInteger(value)) return value >= 0 ? intHeader(0, value) : intHeader(1, -1 - value);
  if (typeof value === "string") { const b = Buffer.from(value); return Buffer.concat([intHeader(3, b.length), b]); }
  if (Buffer.isBuffer(value)) return Buffer.concat([intHeader(2, value.length), value]);
  if (value instanceof Map) return Buffer.concat([intHeader(5, value.size), ...[...value].flatMap(([key, item]) => [cbor(key), cbor(item)])]);
  throw Error("unsupported CBOR fixture value");
}
const hash = value => crypto.createHash("sha256").update(value).digest();
const b64 = value => Buffer.from(value).toString("base64url");
function credential(id = crypto.randomBytes(32)) {
  const keys = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = keys.publicKey.export({ format: "jwk" });
  const cose = cbor(new Map([[1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, "base64url")], [-3, Buffer.from(jwk.y, "base64url")]]));
  return { ...keys, id: b64(id), rawId: id, cose };
}
function clientData(type, challenge, origin = ORIGIN) { return Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false })); }
function regResponse(options, cred, overrides = {}) {
  const client = clientData("webauthn.create", options.challenge, overrides.origin);
  const counter = Buffer.alloc(4); counter.writeUInt32BE(overrides.counter || 0);
  const length = Buffer.alloc(2); length.writeUInt16BE(cred.rawId.length);
  const authData = Buffer.concat([hash(overrides.rpID || RP), Buffer.from([overrides.flags === undefined ? 0x45 : overrides.flags]), counter, Buffer.alloc(16), length, cred.rawId, cred.cose]);
  const attestation = cbor(new Map([["fmt", "none"], ["attStmt", new Map()], ["authData", authData]]));
  return { id: cred.id, rawId: cred.id, type: "public-key", authenticatorAttachment: "platform", clientExtensionResults: {}, response: { clientDataJSON: b64(client), attestationObject: b64(attestation), transports: ["internal"] } };
}
function authResponse(options, cred, overrides = {}) {
  const client = clientData("webauthn.get", options.challenge, overrides.origin);
  const counter = Buffer.alloc(4); counter.writeUInt32BE(overrides.counter || 0);
  const authData = Buffer.concat([hash(overrides.rpID || RP), Buffer.from([overrides.flags === undefined ? 0x05 : overrides.flags]), counter]);
  const signature = crypto.sign("SHA256", Buffer.concat([authData, hash(client)]), overrides.privateKey || cred.privateKey);
  if (overrides.tamper) signature[signature.length - 1] ^= 0x01;
  return { id: cred.id, rawId: cred.id, type: "public-key", authenticatorAttachment: "platform", clientExtensionResults: {}, response: { clientDataJSON: b64(client), authenticatorData: b64(authData), signature: b64(signature), userHandle: b64(overrides.userId || USER) } };
}
async function enroll(cred = credential(), options = {}) {
  const start = await request("register-options", {}, options); assert.equal(start.status, 200, JSON.stringify(start));
  const response = regResponse(start.body.options, cred);
  const finish = await request("register-verify", { challengeId: start.body.challengeId, response }, options);
  assert.equal(finish.status, 200, JSON.stringify(finish));
  return cred;
}
async function assertion(cred, overrides = {}, options = {}) {
  const start = await request("auth-options", { credentialId: cred.id }, options); assert.equal(start.status, 200, JSON.stringify(start));
  const response = authResponse(start.body.options, cred, overrides);
  return { start, response, finish: await request("auth-verify", { challengeId: start.body.challengeId, response }, options) };
}
let passed = 0;
async function test(name, run) { reset(); await run(); passed++; console.log("PASS", name); }
(async () => {
  await test("Supabase authentication is mandatory; rejected requests do not write", async () => {
    assert.equal((await request("register-options", {}, { authorization: "Bearer invalid" })).status, 401);
    assert.equal((await request(null, {}, { method: "GET", authorization: "" })).status, 401);
    assert.equal(objects.size, 0);
  });
  await test("canonical Origin is mandatory and Host cannot override it", async () => {
    for (const origin of [null, "https://evil.example", "https://zero-henna-one.vercel.app.evil.example", "http://localhost:3000"]) assert.equal((await request("register-options", {}, { origin, headers: { host: RP, "x-forwarded-host": RP } })).status, 403);
    assert.equal(objects.size, 0);
  });
  await test("development loopback requires exact request origin", async () => {
    process.env.NODE_ENV = "development";
    assert.deepEqual(lib.biometricOrigin(new Request("http://localhost:3000/api/biometric", { headers: { origin: "http://localhost:3000" } })), { origin: "http://localhost:3000", rpID: "localhost" });
    assert.throws(() => lib.biometricOrigin(new Request("http://localhost:3000/api/biometric", { headers: { origin: "http://localhost:4000" } })), /sito principale/);
    assert.throws(() => lib.biometricOrigin(new Request("https://preview.example/api/biometric", { headers: { origin: "https://preview.example" } })), /sito principale/);
  });
  await test("JSON body has an enforced byte limit and must be an object", async () => {
    await assert.rejects(lib.biometricBody(new Request(ORIGIN, { method: "POST", body: "x".repeat(30001) })), error => error.status === 413);
    await assert.rejects(lib.biometricBody(new Request(ORIGIN, { method: "POST", body: "[]" })), error => error.status === 400);
    await assert.rejects(lib.biometricBody(new Request(ORIGIN, { method: "POST", body: "{invalid" })), error => error.status === 400);
  });
  await test("registration mandates platform, resident credential, UV, canonical RP and owner handle", async () => {
    const start = await request("register-options"); assert.equal(start.status, 200);
    assert.equal(start.body.options.rp.id, RP);
    assert.equal(start.body.options.attestation, "none");
    assert.equal(start.body.options.user.id, b64(USER));
    assert.deepEqual(start.body.options.authenticatorSelection, { authenticatorAttachment: "platform", residentKey: "required", userVerification: "required", requireResidentKey: true });
    assert.match(start.body.challengeId, /^[\da-f-]{36}$/);
  });
  await test("real P-256 attestation-none registration stores only public material and returns IDs", async () => {
    const cred = await enroll();
    const status = await request(null, {}, { method: "GET", origin: null });
    assert.deepEqual(status.body, { available: true, credentialIds: [cred.id] });
    const record = JSON.parse([...objects].find(([key]) => key.includes("/credentials/"))[1].text);
    assert.equal(record.publicKey, b64(cred.cose));
    assert.equal(record.userId, USER);
    assert(!JSON.stringify(record).includes("PRIVATE"));
    const call = verifyCalls.find(call => call.name === "verifyRegistrationResponse").options;
    assert.equal(call.requireUserPresence, true); assert.equal(call.requireUserVerification, true);
    assert.equal(call.expectedOrigin, ORIGIN); assert.equal(call.expectedRPID, RP);
  });
  await test("repeated synced-passkey counter zero succeeds with fresh challenges; replay fails", async () => {
    const cred = await enroll();
    for (let i = 0; i < 3; i++) {
      const a = await assertion(cred); assert.equal(a.finish.status, 200);
      assert.deepEqual(a.finish.body, { verified: true, credentialId: cred.id, userId: USER });
      assert.equal((await request("auth-verify", { challengeId: a.start.body.challengeId, response: a.response })).status, 409);
    }
    assert([...objects.keys()].every(key => !key.includes("/counters/")));
    assert(verifyCalls.filter(call => call.name === "verifyAuthenticationResponse").every(call => call.options.requireUserVerification === true));
  });
  await test("real signature, authenticator UV, RP hash and client origin are verified", async () => {
    const cred = await enroll();
    for (const override of [{ tamper: true }, { flags: 0x01 }, { rpID: "evil.example" }, { origin: "https://evil.example" }, { privateKey: credential().privateKey }, { userId: OTHER }]) {
      const a = await assertion(cred, override); assert.equal(a.finish.status, 400, JSON.stringify(override));
    }
  });
  await test("registration also rejects missing UV, wrong RP and wrong origin", async () => {
    for (const overrides of [{ flags: 0x41 }, { rpID: "evil.example" }, { origin: "https://evil.example" }]) {
      const start = await request("register-options");
      assert.equal((await request("register-verify", { challengeId: start.body.challengeId, response: regResponse(start.body.options, credential(), overrides) })).status, 400);
    }
    assert.equal((await request(null, {}, { method: "GET" })).body.credentialIds.length, 0);
  });
  await test("challenges cannot cross account or ceremony and expire after five minutes", async () => {
    const cred = await enroll();
    const start = await request("auth-options");
    const response = authResponse(start.body.options, cred);
    assert.equal((await request("auth-verify", { challengeId: start.body.challengeId, response }, { authorization: "Bearer other" })).status, 400);
    assert.equal((await request("register-verify", { challengeId: start.body.challengeId, response })).status, 400);
    now += 5 * 60000 + 1;
    assert.equal((await request("auth-verify", { challengeId: start.body.challengeId, response })).status, 400);
  });
  await test("registration challenge is one-use, including failed verification", async () => {
    const start = await request("register-options"), cred = credential();
    const response = regResponse(start.body.options, cred, { flags: 0x41 });
    assert.equal((await request("register-verify", { challengeId: start.body.challengeId, response })).status, 400);
    assert.equal((await request("register-verify", { challengeId: start.body.challengeId, response: regResponse(start.body.options, cred) })).status, 409);
  });
  await test("positive counters cannot be reused or rolled back", async () => {
    const cred = await enroll();
    assert.equal((await assertion(cred, { counter: 1 })).finish.status, 200);
    assert.equal((await assertion(cred, { counter: 1 })).finish.status, 400);
    assert.equal((await assertion(cred, { counter: 2 })).finish.status, 200);
    assert.equal((await assertion(cred, { counter: 1 })).finish.status, 400);
    assert.equal((await assertion(cred, { counter: 0 })).finish.status, 400);
  });
  await test("parallel consumption allows a challenge only once", async () => {
    const cred = await enroll();
    const start = await request("auth-options"), response = authResponse(start.body.options, cred);
    const results = await Promise.all([request("auth-verify", { challengeId: start.body.challengeId, response }), request("auth-verify", { challengeId: start.body.challengeId, response })]);
    assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  });
  await test("foreign credential IDs are not selectable and registration cannot rebind ownership", async () => {
    const cred = await enroll();
    assert.equal((await request("auth-options", { credentialId: cred.id }, { authorization: "Bearer other" })).status, 404);
    const start = await request("register-options", {}, { authorization: "Bearer other" });
    assert.equal((await request("register-verify", { challengeId: start.body.challengeId, response: regResponse(start.body.options, cred) }, { authorization: "Bearer other" })).status, 409);
    assert.deepEqual((await request(null, {}, { method: "GET", authorization: "Bearer other" })).body.credentialIds, []);
  });
  await test("option generation is limited to twenty per user per minute", async () => {
    for (let i = 0; i < 20; i++) assert.equal((await request("register-options")).status, 200);
    assert.equal((await request("register-options")).status, 429);
    assert.equal((await request("register-options", {}, { authorization: "Bearer other" })).status, 200);
    now += 60000;
    assert.equal((await request("register-options")).status, 200);
  });
  await test("atomic credential slots enforce max ten under concurrent registration", async () => {
    const starts = await Promise.all(Array.from({ length: 11 }, () => request("register-options")));
    const results = await Promise.all(starts.map(start => request("register-verify", { challengeId: start.body.challengeId, response: regResponse(start.body.options, credential()) })));
    assert.equal(results.filter(result => result.status === 200).length, 10);
    assert.equal(results.filter(result => result.status === 409).length, 1);
    assert.equal((await request(null, {}, { method: "GET" })).body.credentialIds.length, 10);
  });
  await test("public storage bucket fails closed without returning credential material", async () => {
    isPublic = true;
    const originalWarn = console.warn; console.warn = () => {};
    try { assert.equal((await request(null, {}, { method: "GET" })).status, 503); }
    finally { console.warn = originalWarn; }
  });
  console.log(`Verified ${passed} biometric server checks with real cryptography.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { Date.now = realNow; });
