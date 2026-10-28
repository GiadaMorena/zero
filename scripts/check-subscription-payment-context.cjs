const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const source = process.argv[3] || path.join(root, 'src/context/AppContext.tsx');
const ts = require(path.join(root, 'node_modules/typescript'));
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
const scope = { exports: {}, require: () => ({}), Date };
vm.runInNewContext(compile(path.join(root, 'src/lib/monthlyBudget.ts')), scope);
const monthly = scope.exports;
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CARD = '11111111-1111-4111-8111-111111111111', SUB = '22222222-2222-4222-8222-222222222222';
const TX = '33333333-3333-4333-8333-333333333333';
const now = new Date(), day = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const input = { subscriptionId: SUB, cycleDate: day, paid: true };
const tx = { id: TX, title: 'Netflix', category: 'Abbonamenti', amount: -6.99, date: day, cardId: CARD, type: 'expense', createdAt: now.toISOString() };
const success = { tracking: { startedOn: day, subscriptions: { [SUB]: { cardId: CARD, payments: { [day]: true } } } }, transaction: tx, balance: { id: CARD, balance: 93.01 } };
const plain = x => JSON.parse(JSON.stringify(x));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

function harness(options = {}) {
  const states = [], refs = [], notices = [], calls = [];
  let stateIndex = 0, refIndex = 0, sessionId = A, response = success;
  const react = { createContext: () => ({ Provider: 'provider' }), useContext: () => null, useEffect() {},
    useState(initial) { const i = stateIndex++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
    useRef(initial) { const i = refIndex++; return refs[i] || (refs[i] = { current: initial }); }, createElement: (tag, props) => ({ tag, props }) };
  const sdk = { auth: { getSession: async () => ({ data: { session: sessionId ? { user: { id: sessionId } } : null }, error: null }) } };
  const module = { exports: {}, Date, Number, Map, console, localStorage: { removeItem() {} },
    require(name) {
      if (name === 'react') return react;
      if (name === '@/lib/supabase') return { supabase: sdk };
      if (name === '@/lib/monthlyBudget') return monthly;
      if (name === '@/lib/saveFeedback') return { notifySaved: message => notices.push(message) };
      if (name === '@/lib/subscriptionPayment') return { persistSubscriptionPayment: async (client, value) => { assert.equal(client, sdk); calls.push(plain(value)); if (options.wait) await options.wait.promise; if (options.throw) throw Error('offline'); return response; } };
      return {};
    } };
  vm.runInNewContext(compile(source), module);
  const render = () => { stateIndex = refIndex = 0; return module.exports.AppProvider({ children: null }).props.value; };
  render(); states[0] = [{ id: CARD, bankName: 'Carta test', balance: 100 }]; states[2] = []; states[7] = A; states[8] = true;
  refs[0].current = { id: A, epoch: 1 };
  return { render, states, refs, calls, notices, response(value) { response = value; }, session(id) { sessionId = id; }, switchOwner(id) { sessionId = id; refs[0].current = { id, epoch: refs[0].current.epoch + 1 }; } };
}

(async () => {
  const h = harness();
  assert.equal(h.render().totalMonthlySpending, 0);
  const saved = await h.render().recordSubscriptionPayment(input);
  assert.equal(saved.transaction.id, TX); assert.equal(h.states[0][0].balance, 93.01);
  assert.equal(h.render().transactions.length, 1); assert.equal(h.render().totalMonthlySpending, 6.99); assert.equal(h.render().totalMonthlyIncome, 0);
  h.response({ ...success, balance: { id: CARD, balance: 90 } });
  await h.render().recordSubscriptionPayment(input);
  assert.equal(h.render().transactions.length, 1, 'retry replaces the same movement instead of duplicating it');
  assert.equal(h.states[0][0].balance, 90, 'use the confirmed current balance, never subtract locally on retry');
  for (const reply of [{ error: 'offline' }, { needsChoice: true, candidates: [tx] }, { ...success, transaction: null, balance: null }]) {
    const q = harness(); q.response(reply); const result = await q.render().recordSubscriptionPayment(input);
    assert.deepEqual(plain(result), plain(reply)); assert.equal(q.states[0][0].balance, 100); assert.equal(q.states[2].length, 0);
  }
  for (const change of ['logout', 'switch', 'roundtrip', 'unmount']) {
    const wait = deferred(), q = harness({ wait }); const pending = q.render().recordSubscriptionPayment(input);
    await Promise.resolve(); await Promise.resolve();
    if (change === 'logout') q.switchOwner(null);
    if (change === 'switch') q.switchOwner(B);
    if (change === 'roundtrip') { q.switchOwner(B); q.switchOwner(A); }
    if (change === 'unmount') q.refs[1].current = false;
    wait.resolve(); assert.ok((await pending).error, change);
    assert.equal(q.states[0][0].balance, 100); assert.equal(q.states[2].length, 0); assert.equal(q.notices.length, 0);
  }
  const missing = harness(); missing.session(null); assert.ok((await missing.render().recordSubscriptionPayment(input)).error); assert.equal(missing.calls.length, 0);
  for (const kind of ['pending-delete', 'busy']) {
    const q = harness(); if (kind === 'pending-delete') q.states[10] = 'pending'; else q.refs[4].current = true;
    assert.ok((await q.render().recordSubscriptionPayment(input)).error); assert.equal(q.calls.length, 0);
  }
  const failed = harness({ throw: true }); assert.ok((await failed.render().recordSubscriptionPayment(input)).error); assert.equal(failed.states[0][0].balance, 100); assert.equal(failed.states[2].length, 0);
  console.log('PASS subscription payment context: confirmed expense/balance, correct totals, no duplicate retry, duplicate-choice and failure preservation, movement exclusion and account/logout/unmount guards.');
})().catch(error => { console.error(error); process.exitCode = 1; });
