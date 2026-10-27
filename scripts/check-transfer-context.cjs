const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const source = process.argv[3] || path.join(root, 'src/context/AppContext.tsx');
const helper = process.argv[4] || path.join(root, 'src/lib/cardTransfers.ts');
const ts = require(path.join(root, 'node_modules/typescript'));
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
function lib(file, imports = {}) { const scope = { exports: {}, require: name => imports[name], console, Date }; vm.runInNewContext(compile(file), scope); return scope.exports; }
const monthly = lib(path.join(root, 'src/lib/monthlyBudget.ts'));
const transfers = lib(helper);
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const C1 = '11111111-1111-4111-8111-111111111111', C2 = '22222222-2222-4222-8222-222222222222';
const ID = '33333333-3333-4333-8333-333333333333';
const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const input = { fromCardId: C1, toCardId: C2, amount: 12.34, date, note: 'Spostamento di prova' };
const sessionFor = id => id ? { access_token: 'fake-session', user: { id, email: `${id}@example.test`, user_metadata: {} } } : null;
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const plain = value => JSON.parse(JSON.stringify(value));

function harness(options = {}) {
  let session = sessionFor(options.anonymous ? null : A), callback, dirty = true, app, disposed = false;
  let stateCursor = 0, refCursor = 0, effectCursor = 0;
  const states = [], refs = [], effects = [], pending = [], storage = options.storage || new Map(), events = [], calls = [];
  const cardRows = options.cardRows || [
    { id: C1, user_id: A, name: 'Test', bank_name: 'Banca Uno', number: '•••• 1111', expiry: '12/28', type: 'generic', balance: 100 },
    { id: C2, user_id: A, name: 'Test', bank_name: 'Banca Due', number: '•••• 2222', expiry: '12/28', type: 'generic', balance: 20 },
  ];
  const txRows = options.txRows || [
    { id: 'expense', user_id: A, title: 'Spesa', category: 'Cibo', amount: -8.5, date, card_id: C1, type: 'expense' },
    { id: 'income', user_id: A, title: 'Entrata', category: 'Entrata', amount: 50, date, card_id: C2, type: 'income' },
  ];
  const transferRows = options.transferRows || [];
  const react = {
    createContext: () => ({ Provider: 'provider' }), useContext: () => null,
    useState: initial => { const i = stateCursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => { const next = typeof value === 'function' ? value(states[i]) : value; if (!Object.is(states[i], next)) { states[i] = next; dirty = true; } }]; },
    useRef: initial => { const i = refCursor++; return refs[i] || (refs[i] = { current: initial }); },
    useEffect: (run, deps) => { const i = effectCursor++, old = effects[i]; if (!old || !deps || deps.some((v, n) => !Object.is(v, old.deps?.[n]))) { pending.push(() => { old?.cleanup?.(); const cleanup = run(); effects[i] = { deps, cleanup }; }); } },
    createElement: (tag, props) => ({ tag, props }),
  };
  const sdk = {
    auth: {
      getSession: async () => ({ data: { session }, error: options.sessionError ? {} : null }),
      getUser: async () => ({ data: { user: session?.user || null }, error: null }),
      onAuthStateChange: fn => { callback = fn; return { data: { subscription: { unsubscribe() { callback = null; } } } }; },
      signOut: async () => { session = null; callback?.('SIGNED_OUT', null); return { error: null }; },
    },
    from(table) {
      let filters = [], action = 'read';
      const read = async () => {
        calls.push({ table, action, filters: [...filters] });
        if (table === 'card_transfers' && options.historyWait) await options.historyWait.promise;
        if (table === 'card_transfers' && options.historyError) return { data: null, error: { message: 'missing migration or offline' } };
        const owner = filters.find(([key]) => key === 'user_id')?.[1] || filters.find(([key]) => key === 'id')?.[1];
        let rows = table === 'cards' ? cardRows : table === 'transactions' ? txRows : table === 'card_transfers' ? transferRows : [];
        if (table === 'profiles') return { data: { id: owner, name: 'Test', email: `${owner}@example.test`, avatar_text: 'T' }, error: null };
        rows = rows.filter(row => filters.every(([key, value]) => row[key] === value));
        return { data: plain(rows), error: null };
      };
      const q = { select: () => q, eq: (key, value) => { filters.push([key, value]); return q; }, order: () => q, single: read, then: (resolve, reject) => read().then(resolve, reject), insert: () => { action = 'insert'; return q; }, update: () => { action = 'update'; return q; }, delete: () => { action = 'delete'; return q; } };
      return q;
    },
    async rpc(name, args) {
      calls.push({ rpc: name, args: plain(args) });
      if (options.rpcWait) await options.rpcWait.promise;
      if (options.rpcThrow) throw Error('offline');
      if (options.rpcError) return { data: null, error: { message: 'ZERO_TRANSFER_INSUFFICIENT_FUNDS' } };
      let transfer = transferRows.find(row => row.id === args.p_request_id && row.user_id === A);
      if (!transfer) {
        const first = cardRows.find(row => row.id === args.p_from_card_id), second = cardRows.find(row => row.id === args.p_to_card_id);
        first.balance = Math.round((first.balance - args.p_amount) * 100) / 100;
        second.balance = Math.round((second.balance + args.p_amount) * 100) / 100;
        transfer = { id: args.p_request_id, user_id: A, from_card_id: first.id, to_card_id: second.id, from_label: `${first.bank_name} · ${first.number}`, to_label: `${second.bank_name} · ${second.number}`, amount: args.p_amount, date: args.p_date, note: args.p_note, created_at: new Date().toISOString() };
        transferRows.unshift(transfer);
      }
      return { error: null, data: { transfer: plain(transfer), balances: cardRows.filter(row => [C1, C2].includes(row.id)).map(row => ({ id: row.id, balance: row.balance })) } };
    },
  };
  const localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const scope = {
    exports: {}, console: { ...console, error() {} }, localStorage, Date, Map, Number,
    window: { setTimeout: () => 1, clearTimeout() {} },
    require: name => name === 'react' ? react : name === '@/lib/supabase' ? { supabase: sdk } : name === '@/lib/monthlyBudget' ? monthly : name === '@/lib/cardTransfers' ? transfers : name === '@/lib/saveFeedback' ? { notifySaved: title => events.push(title) } : {},
  };
  vm.runInNewContext(compile(source), scope);
  const render = () => { stateCursor = 0; refCursor = 0; effectCursor = 0; dirty = false; app = scope.exports.AppProvider({ children: null }).props.value; const runs = pending.splice(0); runs.forEach(fn => fn()); return app; };
  const flush = async () => { for (let n = 0; n < 20; n++) { if (dirty) render(); await Promise.resolve(); } if (dirty) render(); return app; };
  render();
  return {
    flush, render, states, storage, events, calls, cardRows, txRows, transferRows,
    get app() { return app; },
    async switchAccount(id) { session = sessionFor(id); callback?.(id ? 'SIGNED_IN' : 'SIGNED_OUT', session); await flush(); },
    setSessionOnly(id) { session = sessionFor(id); },
    dispose() { disposed = true; for (const effect of effects) effect?.cleanup?.(); },
  };
}

(async () => {
  const h = harness(); await h.flush();
  assert.equal(h.app.transfersLoading, false);
  const oldTx = plain(h.app.transactions), oldTotals = [h.app.totalMonthlySpending, h.app.totalMonthlyIncome, h.app.totalMonthlySavings];
  assert.equal((await h.app.addTransfer(input, ID)).error, undefined); await h.flush();
  assert.deepEqual(plain(h.app.cards.map(card => card.balance)), [87.66, 32.34]);
  assert.equal(h.app.transfers.length, 1); assert.equal(h.app.transfers[0].id, ID);
  assert.deepEqual(plain(h.app.transactions), oldTx);
  assert.deepEqual([h.app.totalMonthlySpending, h.app.totalMonthlyIncome, h.app.totalMonthlySavings], oldTotals);
  assert.equal(h.calls.filter(call => call.action && call.action !== 'read').length, 0, 'transfer never writes expenses or income or individual balances');
  assert.equal((await h.app.addTransfer(input, ID)).error, undefined); await h.flush();
  assert.equal(h.app.transfers.length, 1, 'a retried RPC does not duplicate the visible ledger');
  assert.deepEqual(plain(h.app.cards.map(card => card.balance)), [87.66, 32.34]);
  assert.ok(h.storage.has(`zero_card_transfers_v1:${A}`));
  const reload = harness({ cardRows: h.cardRows, txRows: h.txRows, transferRows: h.transferRows, storage: h.storage }); await reload.flush();
  assert.equal(reload.app.transfers[0].id, ID, 'server ledger survives remount');
  const removedCard = harness({ cardRows: h.cardRows, txRows: h.txRows, transferRows: [{ ...plain(h.transferRows[0]), from_card_id: null }], storage: new Map(h.storage) }); await removedCard.flush();
  assert.equal(removedCard.app.transfers[0].fromCardId, null, 'authoritative server rows override cached links after card deletion');
  assert.ok(removedCard.app.transfers[0].fromLabel.includes('Banca Uno'), 'historical label survives a deleted card');

  for (const failure of [{ rpcError: true }, { rpcThrow: true }]) {
    const f = harness(failure); await f.flush(); const before = plain(f.app.cards);
    assert.ok((await f.app.addTransfer(input, ID)).error); await f.flush();
    assert.deepEqual(plain(f.app.cards), before); assert.equal(f.app.transfers.length, 0); assert.equal(f.events.length, 0);
  }
  const anonymous = harness({ anonymous: true }); await anonymous.flush();
  anonymous.states[0] = plain(h.states[0]); anonymous.render();
  assert.ok((await anonymous.app.addTransfer(input, ID)).error); assert.equal(anonymous.calls.filter(call => call.rpc).length, 0);

  const wait = deferred(), busy = harness({ rpcWait: wait }); await busy.flush();
  const saving = busy.app.addTransfer(input, ID); await busy.flush();
  assert.ok((await busy.app.addTransfer(input, ID)).error);
  assert.ok((await busy.app.addTransaction({ title: 'Spesa', category: 'Cibo', amount: 2, type: 'expense', cardId: C1 })).error);
  wait.resolve(); assert.equal((await saving).error, undefined); await busy.flush();
  assert.equal(busy.calls.filter(call => call.rpc).length, 1);
  const pending = harness(); await pending.flush(); pending.app.deleteTransaction('expense'); await pending.flush();
  assert.ok((await pending.app.addTransfer(input, ID)).error); assert.equal(pending.calls.filter(call => call.rpc).length, 0);

  for (const target of [null, B, A]) {
    const gate = deferred(), race = harness({ rpcWait: gate }); await race.flush();
    const before = plain(race.app.cards); const save = race.app.addTransfer(input, ID); await race.flush();
    await race.switchAccount(target === A ? B : target);
    if (target === A) await race.switchAccount(A);
    gate.resolve(); assert.ok((await save).error); await race.flush();
    assert.equal(race.app.transfers.length, 0, 'late result cannot populate the current account');
    assert.ok(!race.events.length, 'late result does not announce success');
    if (target === null) assert.deepEqual(plain(race.app.cards), before, 'late transfer does not update signed-out card cache');
    if (target === B) {
      const foreign = JSON.parse(race.storage.get(`zero_card_transfers_v1:${B}`) || '{"rows":[]}');
      assert.equal(foreign.rows.length, 0, 'A history is never cached under B');
    }
  }
  const wrongSession = harness(); await wrongSession.flush(); wrongSession.setSessionOnly(B);
  assert.ok((await wrongSession.app.addTransfer(input, ID)).error); assert.equal(wrongSession.calls.filter(call => call.rpc).length, 0);
  const gone = deferred(), unmounted = harness({ rpcWait: gone }); await unmounted.flush();
  const done = unmounted.app.addTransfer(input, ID); await unmounted.flush(); unmounted.dispose(); gone.resolve();
  assert.ok((await done).error); assert.equal(unmounted.events.length, 0);

  const missing = harness({ historyError: true }); await missing.flush();
  assert.ok(missing.app.transferLoadError); assert.equal(missing.app.transfersLoading, false);
  assert.equal(missing.app.transactions.length, 2, 'missing transfer migration does not break existing account data');
  const slowHistory = deferred(), historyRace = harness({ historyWait: slowHistory, transferRows: [plain(h.transferRows[0])] });
  await historyRace.flush(); await historyRace.switchAccount(B); slowHistory.resolve(); await historyRace.flush();
  assert.equal(historyRace.app.transfers.length, 0, 'old account history response is ignored');
  const cached = harness({ storage: h.storage, historyError: true }); await cached.flush();
  assert.equal(cached.app.transfers[0].id, ID, 'own confirmed ledger can remain available offline');
  await cached.switchAccount(B); assert.equal(cached.app.transfers.length, 0);
  console.log('PASS transfer provider: two confirmed balances, separate ledger, unchanged expenses/income/budget, retries/reload, failure preservation, movement exclusion, account/logout/unmount races and owner-scoped cache.');
})().catch(error => { console.error(error); process.exitCode = 1; });
