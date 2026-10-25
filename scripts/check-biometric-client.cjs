const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const source = process.argv[3] || path.join(root, 'src/lib/biometricUnlock.ts');
const ts = require(path.join(root, 'node_modules/typescript'));
const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const CHALLENGE = '33333333-3333-4333-8333-333333333333';
const CREDENTIAL = 'valid_public_credential_id_123456789';
const ORIGIN = 'https://zero-henna-one.vercel.app';
const input = fs.readFileSync(source, 'utf8');
const compiled = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true }, reportDiagnostics: true });
assert.equal(compiled.diagnostics.length, 0);
function fixture({ registered = false, available = true, platform = true } = {}) {
  const storage = new Map(), listeners = new Set(), requests = [], browserCalls = [];
  const state = { session: { access_token: 'private-session-token', user: { id: OWNER, email: 'owner@example.test' } },
    registered, available, platform, verified: true, verifiedUser: OWNER, verifiedCredential: CREDENTIAL,
    imports: 0, cancelCalls: 0, storeFailure: false, browserError: null, browserHook: null, verifyHook: null };
  const window = { isSecureContext: true, location: { origin: ORIGIN, hostname: 'zero-henna-one.vercel.app' }, dispatchEvent() {},
    PublicKeyCredential: { isUserVerifyingPlatformAuthenticatorAvailable: async () => state.platform },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { if (state.storeFailure) throw Error('storage blocked'); storage.set(key, value); }, removeItem: key => storage.delete(key) } };
  const browser = { __esModule: true, WebAuthnAbortService: { cancelCeremony: () => { state.cancelCalls++; } },
    startRegistration: async options => perform('register', options), startAuthentication: async options => perform('auth', options) };
  async function perform(kind, options) {
    browserCalls.push({ kind, options });
    if (state.browserHook) await state.browserHook(browserCalls.length);
    if (state.browserError) throw state.browserError;
    return { id: CREDENTIAL, response: { mock: true } };
  }
  const supabase = { auth: { getSession: async () => ({ data: { session: state.session }, error: null }),
    onAuthStateChange(callback) { listeners.add(callback); return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } }; } } };
  const scope = { exports: {}, window, navigator: { credentials: {} }, Event, AbortController, Response, URL, console,
    process: { env: { NODE_ENV: 'test' } },
    require(name) {
      if (name === '@/lib/supabase') return { supabase };
      if (name === '@simplewebauthn/browser') { state.imports++; return browser; }
      throw Error('Unexpected module: ' + name);
    },
    fetch: async (url, options = {}) => {
      const body = options.body ? JSON.parse(options.body) : null;
      requests.push({ url, options, body });
      if (options.signal?.aborted) throw Object.assign(Error('aborted'), { name: 'AbortError' });
      if (!body) return Response.json({ available: state.available, credentialIds: state.registered ? [CREDENTIAL] : [] });
      if (body.action.endsWith('-options')) return Response.json({ challengeId: CHALLENGE, options: { challenge: 'challenge_for_test', userVerification: 'required' } });
      if (body.action.endsWith('-verify')) {
        if (state.verifyHook) await state.verifyHook();
        return Response.json({ verified: state.verified, userId: state.verifiedUser, credentialId: state.verifiedCredential });
      }
      throw Error('Unexpected action: ' + body.action);
    },
  };
  vm.runInNewContext(compiled.outputText, scope, { filename: source });
  return { api: scope.exports, state, window, storage, requests, browserCalls, listeners,
    setSession(session) { state.session = session; for (const callback of [...listeners]) callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session); } };
}
async function ticksUntil(predicate) { for (let i = 0; i < 100 && !predicate(); i++) await new Promise(resolve => setImmediate(resolve)); assert.ok(predicate(), 'Expected async test checkpoint'); }
const expectedError = (code) => error => { assert.equal(error.code, code); return true; };

(async () => {
  {
    const f = fixture();
    const status = await f.api.biometricUnlockStatus('OWNER@example.test');
    assert.equal(status.available, true); assert.equal(status.enabled, false);
    assert.equal(f.state.imports, 0); assert.equal(f.browserCalls.length, 0, 'Availability checks never prompt');
    assert.equal(f.storage.size, 0);
  }
  {
    const f = fixture();
    const result = await f.api.enableBiometricUnlock('owner@example.test');
    assert.equal(result.verified, true); assert.equal(result.userId, OWNER);
    assert.equal(f.browserCalls[0].kind, 'register');
    assert.equal(f.requests.filter(x => x.body).map(x => x.body.action).join(','), 'register-options,register-verify');
    assert.equal(f.api.readLocalBiometric(OWNER), CREDENTIAL);
    assert.equal(f.api.readLocalBiometric(OTHER), null);
    const stored = [...f.storage.values()].join('');
    assert.ok(!stored.includes('private-session-token') && !stored.includes('owner@example.test'), 'Storage contains only public preference data');
    f.state.registered = true;
    assert.equal((await f.api.biometricUnlockStatus('owner@example.test')).enabled, true);
    assert.equal(f.listeners.size, 0, 'Auth listeners are released');
    const unlocked = await f.api.unlockWithBiometric('owner@example.test');
    assert.equal(unlocked.verified, true);
    assert.equal(f.browserCalls[1].kind, 'auth');
    assert.equal(f.requests.find(x => x.body?.action === 'auth-options').body.credentialId, CREDENTIAL);
    f.api.disableLocalBiometric(OTHER); assert.equal(f.api.readLocalBiometric(OWNER), CREDENTIAL);
    f.api.disableLocalBiometric(OWNER); assert.equal(f.api.readLocalBiometric(OWNER), null);
    await assert.rejects(f.api.unlockWithBiometric('owner@example.test'), expectedError('disabled'));
  }
  {
    const f = fixture({ registered: true });
    await f.api.enableBiometricUnlock('owner@example.test');
    assert.equal(f.browserCalls[0].kind, 'auth', 'Existing passkeys are reused before creating another');
    await f.api.enableBiometricUnlock('owner@example.test', { newCredential: true });
    assert.equal(f.browserCalls[1].kind, 'register', 'New credential creation requires explicit option');
  }
  for (const problem of ['verified', 'user', 'credential']) {
    const f = fixture();
    if (problem === 'verified') f.state.verified = false;
    if (problem === 'user') f.state.verifiedUser = OTHER;
    if (problem === 'credential') f.state.verifiedCredential = 'different_credential_12345';
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('not-verified'));
    assert.equal(f.storage.size, 0, 'Unverified or mismatched assertions never enable');
  }
  {
    const f = fixture();
    await assert.rejects(f.api.enableBiometricUnlock('other@example.test'), expectedError('account'));
    assert.equal(f.browserCalls.length, 0);
    f.setSession(null);
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('account'));
    assert.equal(f.browserCalls.length, 0);
  }
  {
    const f = fixture();
    f.state.browserError = Object.assign(Error('cancel'), { name: 'NotAllowedError' });
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('cancelled'));
    assert.equal(f.requests.filter(x => x.body?.action.endsWith('-verify')).length, 0);
    assert.equal(f.storage.size, 0);
  }
  for (const stage of ['ceremony', 'verification']) {
    const f = fixture();
    const switchAccount = async () => f.setSession({ access_token: 'other-session', user: { id: OTHER, email: 'other@example.test' } });
    if (stage === 'ceremony') f.state.browserHook = switchAccount;
    else f.state.verifyHook = switchAccount;
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('account'));
    assert.equal(f.storage.size, 0, 'Late account switches never persist opt-in');
    assert.equal(f.listeners.size, 0);
  }
  {
    const f = fixture(); const controller = new AbortController(); controller.abort();
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test', { signal: controller.signal }), expectedError('cancelled'));
    assert.equal(f.browserCalls.length, 0);
  }
  {
    const f = fixture(); let release;
    f.state.browserHook = () => new Promise(resolve => { release = resolve; });
    const controller = new AbortController();
    const operation = f.api.enableBiometricUnlock('owner@example.test', { signal: controller.signal });
    await ticksUntil(() => !!release); controller.abort(); release();
    await assert.rejects(operation, expectedError('cancelled'));
    assert.equal(f.storage.size, 0); assert.ok(f.state.cancelCalls > 0);
    assert.equal(f.requests.filter(x => x.body?.action.endsWith('-verify')).length, 0);
  }
  {
    const f = fixture(); let release;
    f.state.browserHook = count => count === 1 ? new Promise(resolve => { release = resolve; }) : undefined;
    const first = f.api.enableBiometricUnlock('owner@example.test');
    await ticksUntil(() => !!release);
    const second = f.api.enableBiometricUnlock('owner@example.test');
    release();
    await assert.rejects(first, expectedError('cancelled'));
    assert.equal((await second).verified, true);
    assert.equal(f.requests.filter(x => x.body?.action.endsWith('-verify')).length, 1, 'Only the current operation can verify');
  }
  {
    const f = fixture(); f.state.storeFailure = true;
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('storage'));
    assert.equal(f.storage.size, 0);
  }
  {
    const f = fixture({ available: false });
    assert.equal((await f.api.biometricUnlockStatus('owner@example.test')).available, false);
    await assert.rejects(f.api.enableBiometricUnlock('owner@example.test'), expectedError('server'));
    assert.equal(f.browserCalls.length, 0);
  }
  {
    const f = fixture(); f.window.location.origin = 'https://preview.example.test';
    assert.equal((await f.api.biometricUnlockStatus('owner@example.test')).available, false);
    assert.equal(f.requests.length, 0);
    f.window.location.origin = ORIGIN; await f.api.enableBiometricUnlock('owner@example.test');
    const key = [...f.storage.keys()][0], record = JSON.parse(f.storage.get(key)); record.userId = OTHER; f.storage.set(key, JSON.stringify(record));
    assert.equal(f.api.readLocalBiometric(OWNER), null, 'Tampered owner preferences are ignored');
  }
  console.log('PASS: biometric client feature detection never prompts; verified-only account/origin-scoped opt-in, existing-key reuse, explicit creation, logout/account-switch/cancel/concurrent-operation safety, PIN fallback errors, no private data persistence and local disable.');
})().catch(error => { console.error(error); process.exitCode = 1; });
