const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
function compile(file, jsx = false) { const source = process.argv[3] && file.endsWith('WalletPaymentReceiver.tsx') ? process.argv[3] : root + '/' + file; return ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: jsx ? ts.JsxEmit.ReactJSX : undefined } }).outputText; }
const logicScope = { exports: {}, URLSearchParams, Date, Number };
vm.runInNewContext(compile('src/lib/walletPayment.ts'), logicScope);
const logic = logicScope.exports;
const KEY = 'zero_pending_wallet_v1';
const base = { currency: 'EUR', cardId: '11111111-1111-4111-8111-111111111111', amount: '12,50', merchant: 'Pagamento fittizio', date: '2026-10-24', ref: '22222222-2222-4222-8222-222222222222' };
const hash = extra => '#zero-pay?' + new URLSearchParams({ ...base, ...extra }).toString();
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const result = find(child, predicate); if (result) return result; }
  return null;
}
function mount({ props = { unlocked: false, accountEmail: 'old@example.test' }, stored = new Map(), initialHash = '', transactions = [] } = {}) {
  const hooks = [], listeners = new Map(), local = new Map();
  let cursor = 0, dirty = false, pendingEffects = [], tree;
  const sessionStorage = { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
  const localStorage = { getItem: key => local.get(key) || null, setItem: (key, value) => local.set(key, value) };
  const window = { location: { hash: initialHash, pathname: '/', search: '' }, history: { replaceState: () => { window.location.hash = ''; } }, addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) };
  const react = {
    useRef(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useState(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial }; return [hooks[index].value, value => { const next = typeof value === 'function' ? value(hooks[index].value) : value; if (!Object.is(next, hooks[index].value)) { hooks[index].value = next; dirty = true; } }]; },
    useEffect(effect, deps) { const index = cursor++, previous = hooks[index]; if (!previous || deps.some((value, i) => !Object.is(value, previous.deps?.[i]))) pendingEffects.push(() => { previous?.cleanup?.(); hooks[index] = { deps, cleanup: effect() }; }); },
  };
  const jsx = (tag, elementProps) => ({ tag, props: elementProps || {} });
  const imports = { react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' }, '@/context/AppContext': { useApp: () => ({ isHydrated: true, transactions }) }, '@/components/AddSpesaModal': { AddSpesaModal: 'AddSpesaModal' }, '@/lib/walletPayment': logic, '@/lib/supabase': { supabase: { auth: { getSession: async () => ({ data: { session: null } }) } } } };
  const scope = { exports: {}, require: name => imports[name], window, document: { addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' }, navigator: {}, sessionStorage, localStorage, URLSearchParams, URL, Date, String, JSON };
  vm.runInNewContext(compile('src/components/WalletPaymentReceiver.tsx', true), scope);
  function render(next = props) { props = next; let passes = 0; do { if (++passes > 20) throw Error('Receiver did not settle'); dirty = false; cursor = 0; pendingEffects = []; tree = scope.exports.WalletPaymentReceiver(props); for (const effect of pendingEffects) effect(); } while (dirty); return tree; }
  render();
  return { stored, render, pending: () => JSON.parse(stored.get(KEY) || 'null'), modal: () => find(tree, node => node.tag === 'AddSpesaModal'), alert: () => find(tree, node => node.props?.role === 'alert'), receive(value) { window.location.hash = value; listeners.get('hashchange')?.(); render(); }, unmount() { for (const hook of hooks) hook?.cleanup?.(); } };
}

// Cached email from the previous account must not claim an incoming payment before login/PIN.
const incoming = mount({ initialHash: hash() });
assert.equal(incoming.pending().owner, ''); assert.equal(incoming.modal(), null);
incoming.render({ unlocked: true, accountEmail: 'correct@example.test' });
assert.equal(incoming.pending().owner, 'correct@example.test'); assert.ok(incoming.modal()); assert.equal(incoming.alert(), null);
assert.equal(incoming.modal().props.draft.amount, 12.5);

// Rehydration in the same tab across Google OAuth retains an unbound draft, then binds it after unlock.
const beforeOAuth = mount({ initialHash: hash() }); const cache = beforeOAuth.stored; beforeOAuth.unmount();
const afterOAuth = mount({ stored: cache, props: { unlocked: false, accountEmail: 'correct@example.test' } });
assert.equal(afterOAuth.pending().owner, ''); afterOAuth.render({ unlocked: true, accountEmail: 'correct@example.test' });
assert.ok(afterOAuth.modal()); assert.equal(afterOAuth.pending().owner, 'correct@example.test');

// Existing bound drafts remain protected when a different account signs in.
const bound = mount({ initialHash: hash(), props: { unlocked: true, accountEmail: 'owner@example.test' } });
bound.render({ unlocked: false, accountEmail: 'other@example.test' }); bound.render({ unlocked: true, accountEmail: 'other@example.test' });
assert.equal(bound.modal(), null); assert.ok(bound.alert()); assert.equal(bound.pending().owner, 'owner@example.test');

// An already-mounted receiver refreshes the listener when the app locks or signs out.
const relocked = mount({ initialHash: hash(), props: { unlocked: true, accountEmail: 'owner@example.test' } });
relocked.render({ unlocked: false, accountEmail: 'owner@example.test' });
relocked.receive(hash({ ref: '33333333-3333-4333-8333-333333333333' }));
assert.equal(relocked.pending().owner, '');

// A preview must never become a real payable draft when recovered after an OAuth navigation.
const preview = mount({ initialHash: hash({ preview: '1' }) });
assert.equal(preview.pending().draft.preview, true); preview.unmount();
const restoredPreview = mount({ stored: preview.stored, props: { unlocked: true, accountEmail: 'correct@example.test' } });
assert.equal(restoredPreview.modal().props.draft.preview, true); assert.equal(restoredPreview.pending().draft.preview, true);
restoredPreview.modal().props.onClose(); restoredPreview.render(); assert.equal(restoredPreview.pending(), null);

console.log('PASS: wallet draft ownership after unlock, same-tab OAuth recovery, account isolation, relock listener and persistent preview safety.');
