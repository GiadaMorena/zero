const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const root = process.argv[2] || path.resolve(__dirname, '..');
const staged = process.argv[3] || '';
const ts = require(path.join(root, 'node_modules/typescript'));
const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const CARD = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FOREIGN_CARD = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ENDPOINT = 'https://web.push.apple.com/owner-device';
const FOREIGN_ENDPOINT = 'https://web.push.apple.com/other-device';
const now = new Date();
const today = now.toISOString().slice(0, 10);
const pair = crypto.createECDH('prime256v1');
pair.generateKeys();

function fixture() {
  const fixedNow = Date.now();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [fixedNow])); }
    static now() { return fixedNow; }
  }
  const files = new Map();
  const deliveries = [];
  const writes = [];
  const ledgerWrites = [];
  const cards = new Map([[CARD, OWNER], [FOREIGN_CARD, OTHER]]);
  const devices = new Map([
    [OWNER, [{ endpoint: ENDPOINT, keys: { auth: 'test-auth', p256dh: 'test-public' } }]],
    [OTHER, [{ endpoint: FOREIGN_ENDPOINT, keys: { auth: 'other-auth', p256dh: 'other-public' } }]],
  ]);
  const storage = {
    getBucket: async () => ({ data: { public: false }, error: null }),
    createBucket: async () => ({ data: {}, error: null }),
    from(bucket) {
      return {
        async download(key) {
          const item = files.get(bucket + '/' + key);
          return item
            ? { data: new Blob([item.body], { type: 'application/json' }), error: null }
            : { data: null, error: { statusCode: '404', message: 'Object not found' } };
        },
        async upload(key, body, options = {}) {
          const name = bucket + '/' + key;
          if (files.has(name) && !options.upsert) return { data: null, error: { statusCode: '409', message: 'The resource already exists' } };
          const serialized = typeof body === 'string' ? body : await body.text();
          const timestamp = new Date().toISOString();
          files.set(name, { body: serialized, created: files.get(name)?.created || timestamp, updated: timestamp });
          writes.push({ key: name, body: JSON.parse(serialized), options });
          return { data: { path: key }, error: null };
        },
        async list(prefix = '', options = {}) {
          const prefixPath = bucket + '/' + prefix.replace(/\/$/, '') + '/';
          let rows = [...files.entries()]
            .filter(([key]) => key.startsWith(prefixPath) && !key.slice(prefixPath.length).includes('/'))
            .map(([key, value]) => ({ name: key.slice(prefixPath.length), id: crypto.randomUUID(), created_at: value.created || value.updated, updated_at: value.updated }));
          const sort = options.sortBy;
          if (sort) rows.sort((a, b) => String(a[sort.column]).localeCompare(String(b[sort.column])) * (sort.order === 'desc' ? -1 : 1));
          const offset = options.offset || 0;
          rows = rows.slice(offset, offset + (options.limit || 100));
          return { data: rows, error: null };
        },
        async remove(keys) {
          for (const key of keys) files.delete(bucket + '/' + key);
          return { data: keys.map(name => ({ name })), error: null };
        },
      };
    },
  };
  const admin = {
    storage,
    auth: { admin: { listUsers: async () => ({ data: { users: [] }, error: null }) } },
    from(table) {
      const filters = {};
      const query = {
        select() { return query; },
        eq(key, value) { filters[key] = value; return query; },
        in(key, value) { filters[key] = value; return query; },
        limit() { return query; },
        order() { return query; },
        then(resolve, reject) { return Promise.resolve(result(false)).then(resolve, reject); },
        single: async () => result(true),
        maybeSingle: async () => result(true),
        insert() { ledgerWrites.push(table); throw Error('Unexpected ledger insert'); },
        update() { ledgerWrites.push(table); throw Error('Unexpected ledger update'); },
        delete() { ledgerWrites.push(table); throw Error('Unexpected ledger delete'); },
      };
      function result(single) {
        if (table === 'cards') {
          const rows = [...cards.entries()].map(([id, user_id]) => ({ id, user_id }))
            .filter(row => Object.entries(filters).every(([key, value]) => Array.isArray(value) ? value.includes(row[key]) : row[key] === value));
          return { data: single ? rows[0] || null : rows, error: null };
        }
        if (table === 'profiles') return { data: single ? { notifications_enabled: true } : [{ notifications_enabled: true }], error: null };
        throw Error('Unexpected table read: ' + table);
      }
      return query;
    },
  };
  const env = {
    VAPID_PUBLIC_KEY: pair.getPublicKey().toString('base64url'),
    VAPID_PRIVATE_KEY: pair.getPrivateKey().toString('base64url'),
    CRON_SECRET: 'test-cron',
    SUPABASE_SERVICE_ROLE_KEY: 'test-admin',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon',
  };
  let pushFailure = false, pushHook = null;
  const helpers = {
    noCache: { 'Cache-Control': 'private, no-store' },
    adminClient: () => admin,
    authenticatedUser: async request => {
      const header = request.headers.get('authorization');
      const id = header === 'Bearer owner-session' ? OWNER : header === 'Bearer other-session' ? OTHER : null;
      return id ? { admin, user: { id } } : null;
    },
    readPushState: async (_admin, id) => ({ devices: structuredClone(devices.get(id) || []), sent: [] }),
    writePushState: async (_admin, id, state) => devices.set(id, structuredClone(state.devices)),
  };
  const sender = {
    setVapidDetails() {},
    async sendNotification(target, payload) {
      deliveries.push({ target, payload: JSON.parse(payload) });
      if (pushHook) await pushHook({ target, payload: JSON.parse(payload) });
      if (pushFailure) throw Object.assign(Error('Push provider unavailable'), { statusCode: 503 });
      return { statusCode: 201 };
    },
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const stageFile = staged && path.join(staged, file);
    const input = stageFile && fs.existsSync(stageFile) ? stageFile : path.join(root, file);
    const output = ts.transpileModule(fs.readFileSync(input, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const exports = {};
    cache.set(file, exports);
    const requireMock = name => {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === 'web-push') return { __esModule: true, default: sender };
      if (name === '@/lib/subscriptionReminderServer') return helpers;
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      throw Error('Unexpected module: ' + name);
    };
    vm.runInNewContext(output, {
      exports, require: requireMock, process: { env }, Request, Response, Headers, Buffer,
      URL, URLSearchParams, Date: Clock, JSON, Map, Set, console, Blob, AbortSignal,
      fetch: () => { throw Error('Network is forbidden in wallet integration tests'); },
    }, { filename: file });
    return exports;
  }
  return { load, files, writes, deliveries, ledgerWrites, devices, cards, env, setPushFailure(value) { pushFailure = value; }, setPushHook(callback) { pushHook = callback; } };
}

function request(route, { method = 'GET', session = 'owner-session', payload, rawBody, authorization } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (authorization !== null) headers.authorization = authorization === undefined ? 'Bearer ' + session : authorization;
  return new Request('https://example.invalid' + route, { method, headers, ...(method !== 'GET' ? { body: rawBody === undefined ? JSON.stringify(payload || {}) : rawBody } : {}) });
}

// Tests below exercise the production modules with entirely in-memory persistence,
// fake authenticated accounts and a fake push provider. No real sessions or data.

module.exports = { fixture, request, OWNER, OTHER, CARD, FOREIGN_CARD, ENDPOINT, FOREIGN_ENDPOINT, today, assert, crypto };

const paymentBody = (extra = {}) => ({
  amount: '12,50', merchant: 'Caffè R&D + Spesa', currency: 'EUR', date: today,
  ref: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', ...extra,
});
async function createPair(f) {
  const setup = f.load('src/app/api/wallet/setup/route.ts');
  const response = await setup.POST(request('/api/wallet/setup', { method: 'POST', payload: { cardId: CARD, endpoint: ENDPOINT } }));
  assert.equal(response.status, 200, 'Owner can pair their own card and subscribed device');
  const result = await response.json();
  assert.match(result.token, new RegExp('^' + OWNER + '\\.[0-9a-f]{64}$'));
  return result.token;
}
async function pay(f, token, extra = {}, options = {}) {
  return f.load('src/app/api/wallet/payment/route.ts').POST(request('/api/wallet/payment', {
    method: 'POST', authorization: 'Bearer ' + token, payload: paymentBody(extra), ...options,
  }));
}
async function pending(f, session = 'owner-session') {
  const response = await f.load('src/app/api/wallet/pending/route.ts').GET(request('/api/wallet/pending', { session }));
  assert.equal(response.status, 200);
  return (await response.json()).drafts;
}
async function run() {
  // Setup cannot be used anonymously, with a foreign card, or with a foreign endpoint.
  for (const method of ['GET', 'POST', 'DELETE']) {
    const f = fixture();
    const response = await f.load('src/app/api/wallet/setup/route.ts')[method](request('/api/wallet/setup', { method, authorization: null }));
    assert.equal(response.status, 401, method + ' setup requires an authenticated user');
    assert.equal(f.writes.length, 0);
  }
  {
    const f = fixture(); const setup = f.load('src/app/api/wallet/setup/route.ts');
    assert.equal((await setup.POST(request('/api/wallet/setup', { method: 'POST', payload: { cardId: FOREIGN_CARD, endpoint: ENDPOINT } }))).status, 404);
    assert.equal((await setup.POST(request('/api/wallet/setup', { method: 'POST', payload: { cardId: CARD, endpoint: FOREIGN_ENDPOINT } }))).status, 409);
    assert.equal((await setup.POST(request('/api/wallet/setup', { method: 'POST', rawBody: '{broken' }))).status, 400);
    assert.equal(f.writes.length, 0);
  }

  // Pairing stores a digest only; status cannot reveal the secret; rotating revokes the old token.
  {
    const f = fixture(); const token = await createPair(f);
    const secret = token.split('.')[1];
    const storedPair = [...f.files.values()].map(item => JSON.parse(item.body)).find(item => item.hash);
    assert.equal(storedPair.hash, crypto.createHash('sha256').update(secret).digest('hex'));
    assert.ok(!JSON.stringify([...f.files.values()]).includes(secret), 'Plain token is not persisted');
    const status = await (await f.load('src/app/api/wallet/setup/route.ts').GET(request('/api/wallet/setup'))).json();
    assert.equal(status.configured, true); assert.equal(status.linked.cardId, CARD);
    assert.ok(!JSON.stringify(status).includes(secret)); assert.equal(status.token, undefined);
    const second = await createPair(f); assert.notEqual(token, second);
    assert.equal((await pay(f, token)).status, 401, 'Rotated token is invalid');
    assert.equal((await pay(f, second)).status, 200);
    assert.equal(f.deliveries.length, 1);
  }

  // Forged capability values never choose an arbitrary storage path or another account.
  for (const authorization of [null, 'Bearer owner-session', 'Bearer ../../pairing.123', 'Bearer ' + OWNER + '.' + 'a'.repeat(64), 'Bearer ' + OWNER + '.' + 'a'.repeat(64) + 'x']) {
    const f = fixture(); await createPair(f);
    const response = await f.load('src/app/api/wallet/payment/route.ts').POST(request('/api/wallet/payment', { method: 'POST', authorization, payload: paymentBody() }));
    assert.equal(response.status, 401); assert.equal(f.deliveries.length, 0);
  }

  // Strict validation happens before a draft is queued, including currency and calendar validity.
  for (const invalid of [
    { amount: '€12,50' }, { amount: '-1' }, { amount: '12,50.00' }, { amount: 0 },
    { currency: 'USD' }, { merchant: '[ESERCENTE]' }, { merchant: '' },
    { date: '2026-02-30' }, { date: '2000-01-01' }, { ref: '00000000-0000-4000-8941-' },
  ]) {
    const f = fixture(); const token = await createPair(f);
    assert.equal((await pay(f, token, invalid)).status, 400, 'Invalid wallet data is rejected: ' + JSON.stringify(invalid));
    assert.equal(f.deliveries.length, 0); assert.equal((await pending(f)).length, 0);
  }
  {
    const f = fixture(); const token = await createPair(f);
    assert.equal((await pay(f, token, {}, { rawBody: 'x'.repeat(5001) })).status, 413);
    assert.equal((await pay(f, token, {}, { rawBody: '{broken' })).status, 400);
  }

  // Real flow stores only an authenticated owner's draft, sends a generic notification, and never touches the ledger.
  {
    const f = fixture(); const token = await createPair(f);
    const response = await pay(f, token, { cardId: FOREIGN_CARD, preview: true });
    assert.equal(response.status, 200); const result = await response.json();
    assert.equal(result.notificationAccepted, true);
    assert.match(result.id, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(f.deliveries.length, 1); assert.equal(f.deliveries[0].target.endpoint, ENDPOINT);
    const message = f.deliveries[0].payload;
    assert.equal(message.type, 'zero-wallet-payment'); assert.equal(message.id, result.id);
    for (const privateValue of [CARD, '12,50', '12.5', 'Caffè', token]) assert.ok(!JSON.stringify(message).includes(privateValue), 'Notification excludes private payment details');
    const rows = await pending(f); assert.equal(rows.length, 1);
    assert.equal(rows[0].id, result.id); assert.equal(rows[0].draft.amount, 12.5);
    assert.equal(rows[0].draft.title, 'Caffè R&D + Spesa'); assert.equal(rows[0].draft.cardId, CARD);
    assert.equal(rows[0].draft.preview, undefined, 'Caller cannot turn a real request into a server preview');
    assert.equal((await pending(f, 'other-session')).length, 0, 'Another account cannot read this draft');
    assert.equal((await f.load('src/app/api/wallet/pending/route.ts').DELETE(request('/api/wallet/pending', { method: 'DELETE', session: 'other-session', payload: { id: result.id } }))).status, 404);
    assert.equal((await pay(f, token)).status, 200); assert.equal(f.deliveries.length, 1, 'Retry does not send a duplicate notification');
    assert.equal((await f.load('src/app/api/wallet/pending/route.ts').DELETE(request('/api/wallet/pending', { method: 'DELETE', payload: { id: result.id } }))).status, 200);
    assert.equal((await pending(f)).length, 0);
    assert.equal((await pay(f, token)).status, 200, 'Consumed marker still deduplicates a replay');
    assert.equal((await pending(f)).length, 0); assert.equal(f.deliveries.length, 1);
    const consumed = [...f.files.entries()].filter(([key]) => key.includes('/drafts/')).map(([, item]) => JSON.parse(item.body))[0];
    assert.ok(consumed.consumed); assert.equal(consumed.draft, undefined, 'Consumed tombstone drops financial details');
    assert.deepEqual(f.ledgerWrites, []);
  }

  // Parallel deliveries cannot overwrite each other or issue duplicate notifications.
  {
    const f = fixture(); const token = await createPair(f);
    const responses = await Promise.all([pay(f, token), pay(f, token), pay(f, token)]);
    assert.ok(responses.some(response => response.status === 200));
    assert.equal(f.deliveries.length, 1); assert.equal((await pending(f)).length, 1);
    assert.equal((await pay(f, token)).status, 200, 'Retry after original finishes is acknowledged');
    assert.equal(f.deliveries.length, 1);
  }
  {
    const f = fixture(); const token = await createPair(f);
    const refs = Array.from({ length: 3 }, () => crypto.randomUUID());
    const responses = await Promise.all(refs.map(ref => pay(f, token, { ref })));
    assert.ok(responses.every(response => response.status === 200));
    assert.equal((await pending(f)).length, 3, 'Separate concurrent drafts are not lost');
  }

  // A consumed draft cannot be resurrected when the push provider acknowledges late.
  {
    const f = fixture(); const token = await createPair(f);
    const lib = f.load('src/lib/walletPushServer.ts');
    const { admin, user } = await lib.walletUser(request('/api/wallet/setup'));
    const id = lib.walletDraftId(user.id, paymentBody().ref);
    // A tap/save in the PWA may finish while the provider request is still in flight.
    f.setPushHook(async () => { await lib.consumeWalletDraft(admin, user.id, id); });
    const payment = await pay(f, token);
    assert.equal(payment.status, 200);
    assert.equal((await lib.pendingWalletDrafts(admin, user.id)).length, 0);
    assert.equal(f.deliveries.length, 1);
    assert.equal((await pay(f, token)).status, 200);
    assert.equal((await pending(f)).length, 0);
  }

  // Push provider failure retains the draft and does not falsely report delivery success.
  {
    const f = fixture(); const token = await createPair(f); f.setPushFailure(true);
    const response = await pay(f, token); assert.equal(response.status, 503);
    assert.match((await response.json()).error, /Bozza ricevuta/);
    assert.equal((await pending(f)).length, 1);
    assert.equal((await pay(f, token)).status, 503); assert.equal(f.deliveries.length, 1, 'Failed original does not cause repeat sends on every retry');
  }

  // Pagination must cross a whole page of consumed rows to recover an earlier valid draft.
  {
    const f = fixture(); const token = await createPair(f);
    const result = await (await pay(f, token)).json();
    const draftFile = [...f.files.entries()].find(([key]) => key.includes('/drafts/'));
    draftFile[1].created = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    for (let index = 0; index < 105; index++) {
      const id = crypto.randomUUID(), timestamp = Date.now() - index * 1000;
      f.files.set('zero-notification-service/wallet/' + OWNER + '/drafts/' + id + '.json', {
        body: JSON.stringify({ id, created: timestamp, consumed: timestamp, expires: 0 }),
        created: new Date(timestamp).toISOString(), updated: new Date(timestamp).toISOString(),
      });
    }
    const rows = await pending(f);
    assert.equal(rows.length, 1, 'Consumed first page must not hide an older payment');
    assert.equal(rows[0].id, result.id);
    assert.equal(f.deliveries.length, 1);
  }

  // Reading an expired draft redacts financial details but keeps its deduplication identity.
  {
    const f = fixture();
    const id = crypto.randomUUID(), timestamp = Date.now() - 25 * 60 * 60 * 1000;
    const key = 'zero-notification-service/wallet/' + OWNER + '/drafts/' + id + '.json';
    f.files.set(key, {
      body: JSON.stringify({ id, created: timestamp, expires: 1, draft: { ref: crypto.randomUUID(), title: 'Private expired merchant', amount: 12.5, date: today, cardId: CARD } }),
      created: new Date(timestamp).toISOString(), updated: new Date(timestamp).toISOString(),
    });
    assert.equal((await pending(f)).length, 0);
    const redacted = JSON.parse(f.files.get(key).body);
    assert.equal(redacted.id, id); assert.ok(redacted.consumed); assert.equal(redacted.draft, undefined);
    assert.ok(!f.files.get(key).body.includes('Private expired merchant'));
    assert.equal(f.deliveries.length, 0); assert.deepEqual(f.ledgerWrites, []);
  }

  // New incoming payments also opportunistically redact expired details without losing the new draft.
  {
    const f = fixture(); const token = await createPair(f);
    const id = crypto.randomUUID(), timestamp = Date.now() - 25 * 60 * 60 * 1000;
    const key = 'zero-notification-service/wallet/' + OWNER + '/drafts/' + id + '.json';
    f.files.set(key, {
      body: JSON.stringify({ id, created: timestamp, expires: 1, draft: { ref: crypto.randomUUID(), title: 'Old private merchant', amount: 45.67, date: today, cardId: CARD } }),
      created: new Date(timestamp).toISOString(), updated: new Date(timestamp).toISOString(),
    });
    assert.equal((await pay(f, token)).status, 200);
    const redacted = JSON.parse(f.files.get(key).body);
    assert.equal(redacted.id, id); assert.ok(redacted.consumed); assert.equal(redacted.draft, undefined);
    const rows = await pending(f); assert.equal(rows.length, 1); assert.notEqual(rows[0].id, id);
    assert.deepEqual(f.ledgerWrites, []);
  }

  // Revoke, expiry, deleted card and logout/unregistered device all block future capability requests.
  {
    const f = fixture(); const token = await createPair(f);
    assert.equal((await f.load('src/app/api/wallet/setup/route.ts').DELETE(request('/api/wallet/setup', { method: 'DELETE' }))).status, 200);
    assert.equal((await pay(f, token)).status, 401); assert.equal(f.deliveries.length, 0);
  }
  {
    const f = fixture(); const token = await createPair(f);
    const entry = [...f.files.entries()].find(([key]) => key.endsWith('/pairing.json'));
    const record = JSON.parse(entry[1].body); record.expires = 1; entry[1].body = JSON.stringify(record);
    assert.equal((await pay(f, token)).status, 401); assert.equal(f.deliveries.length, 0);
  }
  {
    const f = fixture(); const token = await createPair(f); f.cards.delete(CARD);
    assert.equal((await pay(f, token)).status, 404); assert.equal(f.deliveries.length, 0);
  }
  {
    const f = fixture(); const token = await createPair(f); f.devices.set(OWNER, []);
    assert.equal((await pay(f, token)).status, 409); assert.equal(f.deliveries.length, 0);
  }

  // The proof notification has a server-controlled, persistently non-savable preview flag.
  {
    const f = fixture(); const route = f.load('src/app/api/wallet/test/route.ts');
    assert.equal((await route.POST(request('/api/wallet/test', { method: 'POST', authorization: null, payload: { cardId: CARD, endpoint: ENDPOINT } }))).status, 401);
    assert.equal((await route.POST(request('/api/wallet/test', { method: 'POST', payload: { cardId: FOREIGN_CARD, endpoint: ENDPOINT } }))).status, 404);
    const response = await route.POST(request('/api/wallet/test', { method: 'POST', payload: { cardId: CARD, endpoint: ENDPOINT } }));
    assert.equal(response.status, 200); assert.equal((await response.json()).notificationAccepted, true);
    const rows = await pending(f); assert.equal(rows.length, 1); assert.equal(rows[0].draft.preview, true); assert.equal(rows[0].draft.amount, 1);
    assert.deepEqual(f.ledgerWrites, []);
  }

  // Durable rate slots bound bursts even across stateless invocations.
  {
    const f = fixture(); const token = await createPair(f);
    const firstFive = await Promise.all(Array.from({ length: 5 }, () => pay(f, token, { ref: crypto.randomUUID() })));
    assert.ok(firstFive.every(response => response.status === 200));
    assert.equal((await pay(f, token, { ref: crypto.randomUUID() })).status, 429);
    assert.equal(f.deliveries.length, 5); assert.equal((await pending(f)).length, 5);
  }

  // Unconfigured push credentials fail closed and status never claims readiness.
  {
    const f = fixture(); delete f.env.VAPID_PRIVATE_KEY;
    const setup = f.load('src/app/api/wallet/setup/route.ts');
    assert.equal((await (await setup.GET(request('/api/wallet/setup'))).json()).configured, false);
    assert.equal((await setup.POST(request('/api/wallet/setup', { method: 'POST', payload: { cardId: CARD, endpoint: ENDPOINT } }))).status, 503);
    assert.equal(f.deliveries.length, 0);
  }

  console.log('PASS: wallet push pairing/authentication, card/device isolation, revocation/expiry, strict validation, private notifications, persistent previews, concurrent atomic deduplication, consumed tombstones, pagination past 100 consumed rows, expired financial detail redaction, recoverable failures and durable throttling.');
}

if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
