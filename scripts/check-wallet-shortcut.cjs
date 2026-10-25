const { fixture, request, OWNER, OTHER, CARD, FOREIGN_CARD, ENDPOINT, assert } = require('./check-wallet-push.cjs');

async function pair(f) {
  const response = await f.load('src/app/api/wallet/setup/route.ts').POST(request('/api/wallet/setup', {
    method: 'POST', payload: { cardId: CARD, endpoint: ENDPOINT },
  }));
  assert.equal(response.status, 200);
  return (await response.json()).token;
}
function check(f, token, payload = {}, extra = {}) {
  return f.load('src/app/api/wallet/check/route.ts').POST(request('/api/wallet/check', {
    method: 'POST', authorization: token == null ? null : 'Bearer ' + token, payload, ...extra,
  }));
}
async function drafts(f, session = 'owner-session') {
  const response = await f.load('src/app/api/wallet/pending/route.ts').GET(request('/api/wallet/pending', { session }));
  assert.equal(response.status, 200);
  return (await response.json()).drafts;
}

(async () => {
  const oldInfo = console.info, oldWarn = console.warn;
  console.info = () => {}; console.warn = () => {};
  try {
    for (const token of [null, 'broken', 'owner-session']) {
      const f = fixture();
      assert.equal((await check(f, token)).status, 401);
      assert.equal(f.deliveries.length, 0);
      assert.equal(f.writes.length, 0);
    }
    {
      const f = fixture(), token = await pair(f);
      // Empty transaction values are normal in a manual Shortcuts run.
      const response = await check(f, token, { amount: '', merchant: '', date: '', ref: '' });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.ok, true); assert.equal(result.preview, true); assert.equal(result.notificationAccepted, true);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      const pending = await drafts(f);
      assert.equal(pending.length, 1);
      assert.equal(pending[0].draft.preview, true);
      assert.equal(pending[0].draft.cardId, CARD);
      assert.equal(pending[0].draft.amount, 1);
      assert.equal(pending[0].draft.title, 'Prova Comandi Rapidi');
      assert.equal((await drafts(f, 'other-session')).length, 0);
      assert.equal(f.deliveries[0].target.endpoint, ENDPOINT);
      assert.equal(f.deliveries[0].payload.type, 'zero-wallet-payment');
      assert.equal(f.ledgerWrites.length, 0);
      assert.ok(!JSON.stringify(f.deliveries[0].payload).includes(token));
    }
    {
      const f = fixture(), token = await pair(f);
      assert.equal((await check(f, token, { preview: false, cardId: FOREIGN_CARD, userId: OTHER, amount: 9999, merchant: 'Injected merchant' })).status, 200);
      const draft = (await drafts(f))[0].draft;
      assert.equal(draft.preview, true); assert.equal(draft.cardId, CARD); assert.equal(draft.amount, 1);
      assert.notEqual(draft.title, 'Injected merchant'); assert.equal(f.ledgerWrites.length, 0);
      assert.equal((await check(f, token, {}, { rawBody: 'x'.repeat(5001) })).status, 413);
      assert.equal(f.deliveries.length, 1);
    }
    {
      const f = fixture(), token = await pair(f);
      await f.load('src/app/api/wallet/setup/route.ts').DELETE(request('/api/wallet/setup', { method: 'DELETE' }));
      assert.equal((await check(f, token)).status, 401); assert.equal(f.deliveries.length, 0);
    }
    {
      const f = fixture(), token = await pair(f);
      f.devices.set(OWNER, []);
      assert.equal((await check(f, token)).status, 409); assert.equal(f.deliveries.length, 0);
    }
    {
      const f = fixture(), token = await pair(f);
      f.cards.delete(CARD);
      assert.equal((await check(f, token)).status, 404); assert.equal(f.deliveries.length, 0);
    }
    {
      const f = fixture(), token = await pair(f);
      f.setPushFailure(true);
      assert.equal((await check(f, token)).status, 503);
      const pending = await drafts(f); assert.equal(pending.length, 1); assert.equal(pending[0].draft.preview, true);
      assert.equal(f.ledgerWrites.length, 0);
    }
    {
      const f = fixture(), token = await pair(f);
      for (let i = 0; i < 5; i++) assert.equal((await check(f, token)).status, 200);
      assert.equal((await check(f, token)).status, 429);
      assert.equal(f.deliveries.length, 5); assert.equal(f.ledgerWrites.length, 0);
    }
  } finally { console.info = oldInfo; console.warn = oldWarn; }
  console.log('PASS: manual Shortcuts check requires scoped authorization; empty or injected payment values produce only an owned unsavable preview; device revocation, card ownership, private delivery, size limits, recovery and throttling remain enforced.');
})().catch(error => { console.error(error); process.exitCode = 1; });
