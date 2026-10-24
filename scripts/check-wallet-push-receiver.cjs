const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const staged = process.argv[3];
const ts = require(path.join(root, 'node_modules/typescript'));
function compile(file, jsx = false) {
  const source = staged && file.endsWith('WalletPaymentReceiver.tsx') ? path.join(staged, 'WalletPaymentReceiver.tsx') : path.join(root, file);
  return ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: jsx ? ts.JsxEmit.ReactJSX : undefined } }).outputText;
}
const parserScope = { exports: {}, URLSearchParams, Date, Number };
vm.runInNewContext(compile('src/lib/walletPayment.ts'), parserScope);
const logic = parserScope.exports;
const firstId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', secondId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const draft = { ref: '11111111-1111-4111-8111-111111111111', cardId: '22222222-2222-4222-8222-222222222222', amount: 12.5, title: 'Negozio di prova', date: '2026-10-24' };
const first = { id: firstId, draft }, second = { id: secondId, draft: { ...draft, ref: '33333333-3333-4333-8333-333333333333' } };
const response = (items, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => ({ drafts: items }) });
const wait = () => new Promise(resolve => setImmediate(resolve));
function find(node, predicate) { if (!node || typeof node !== 'object') return null; if (predicate(node)) return node; for (const child of [node.props?.children].flat(Infinity)) { const result = find(child, predicate); if (result) return result; } return null; }
function mount({ unlocked = true, email = 'owner@example.test', hash = '', handler = async () => response([first]), transactions = [] } = {}) {
  const hooks = [], listeners = new Map(), swListeners = new Map(), documentListeners = new Map(), requests = [], stored = new Map(), local = new Map();
  let cursor = 0, dirty = false, effects = [], tree, props = { unlocked, accountEmail: email }, sessionEmail = email;
  const events = map => ({ addEventListener(type, fn) { if (!map.has(type)) map.set(type, new Set()); map.get(type).add(fn); }, removeEventListener(type, fn) { map.get(type)?.delete(fn); } });
  const window = { location: { hash, pathname: '/', search: '', origin: 'https://zero.example' }, history: { replaceState() { window.location.hash = ''; } }, ...events(listeners) };
  const storage = map => ({ getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });
  const react = {
    useRef(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useState(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial }; return [hooks[index].value, update => { const next = typeof update === 'function' ? update(hooks[index].value) : update; if (!Object.is(next, hooks[index].value)) { hooks[index].value = next; dirty = true; } }]; },
    useEffect(effect, deps) { const index = cursor++, before = hooks[index]; if (!before || deps.some((value, i) => !Object.is(value, before.deps?.[i]))) effects.push(() => { before?.cleanup?.(); hooks[index] = { deps, cleanup: effect() }; }); },
  };
  const jsx = (tag, props) => ({ tag, props: props || {} });
  const imports = { react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' }, '@/context/AppContext': { useApp: () => ({ isHydrated: true, transactions }) }, '@/components/AddSpesaModal': { AddSpesaModal: 'AddSpesaModal' }, '@/lib/walletPayment': logic, '@/lib/supabase': { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: `token:${sessionEmail}`, user: { email: sessionEmail } } } }) } } } };
  const scope = { exports: {}, require: key => imports[key], window, document: { visibilityState: 'visible', ...events(documentListeners) }, navigator: { serviceWorker: events(swListeners) }, sessionStorage: storage(stored), localStorage: storage(local), URLSearchParams, URL, Date, JSON, console,
    fetch: async (url, options) => { const request = { url, ...options }; requests.push(request); return options.method === 'DELETE' ? response([]) : handler(request); } };
  vm.runInNewContext(compile('src/components/WalletPaymentReceiver.tsx', true), scope);
  function render(next = props) { props = next; let passes = 0; do { if (++passes > 25) throw Error('Receiver render loop'); dirty = false; cursor = 0; effects = []; tree = scope.exports.WalletPaymentReceiver(props); for (const effect of effects) effect(); } while (dirty); return tree; }
  async function settle() { for (let count = 0; count < 8; count++) { await wait(); render(); } }
  const dispatch = (map, type, value) => { for (const fn of [...map.get(type) || []]) fn(value); render(); };
  render();
  return { requests, stored, render, settle, modal: () => find(tree, n => n.tag === 'AddSpesaModal'), alert: () => find(tree, n => n.props?.role === 'alert'), switchAccount(email, unlocked = true) { sessionEmail = email; render({ unlocked, accountEmail: email }); }, focus: () => dispatch(listeners, 'focus'), visible: () => dispatch(documentListeners, 'visibilitychange'), message: (value, source = 'https://zero.example/zero-push-sw.js') => dispatch(swListeners, 'message', { data: value, source: { scriptURL: source } }), hash(value) { window.location.hash = value; dispatch(listeners, 'hashchange'); }, unmount() { hooks.forEach(hook => hook?.cleanup?.()); } };
}

function worker() {
  const callbacks = {}, notifications = [], opened = [], posted = [], focused = [];
  let clients = [];
  const self = { location: { origin: 'https://zero.example' }, addEventListener: (type, fn) => { callbacks[type] = fn; }, registration: { showNotification: async (title, data) => notifications.push({ title, ...data }) }, skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => clients, openWindow: async url => { opened.push(url); return { postMessage: data => posted.push(data) }; } } };
  vm.runInNewContext(fs.readFileSync(staged ? path.join(staged, 'zero-push-sw.js') : path.join(root, 'public/zero-push-sw.js'), 'utf8'), { self, URL });
  async function event(type, value) { let done; callbacks[type]({ ...value, waitUntil: promise => { done = promise; } }); await done; }
  return { notifications, opened, posted, focused, event, clients(value) { clients = value; } };
}

(async () => {
  // A cold installed-app launch with no hash recovers the durable authenticated inbox.
  const cold = mount(); await cold.settle(); assert.equal(cold.requests.length, 1); assert.ok(cold.modal()); assert.equal(cold.modal().props.draft.amount, 12.5); assert.equal(cold.stored.size, 0, 'Server drafts must not enter the unbound pre-login cache');
  const locked = mount({ unlocked: false }); await locked.settle(); assert.equal(locked.requests.length, 0); assert.equal(locked.modal(), null); locked.switchAccount('owner@example.test'); await locked.settle(); assert.ok(locked.modal());

  // A late response from a previous account cannot display that account's payment.
  let release; const raced = mount({ handler: req => req.headers.authorization.includes('owner@') ? new Promise(resolve => { release = resolve; }) : response([]) });
  await wait(); raced.switchAccount('other@example.test'); await raced.settle(); release(response([first])); await raced.settle(); assert.equal(raced.modal(), null);

  // Only our worker can request an inbox refresh; foreground also recovers missed delivery.
  const live = mount({ handler: async () => response([]) }); await live.settle();
  live.message({ type: 'zero-wallet-payment', id: firstId }, 'https://other.example/zero-push-sw.js'); await live.settle(); assert.equal(live.requests.length, 1);
  live.message({ type: 'zero-wallet-payment', id: firstId }, 'https://zero.example/unrelated-sw.js'); await live.settle(); assert.equal(live.requests.length, 1);
  live.message({ type: 'zero-wallet-payment', id: firstId }); await live.settle(); assert.equal(live.requests.length, 2); live.visible(); await live.settle(); assert.equal(live.requests.length, 3);

  // Queue each payment once and acknowledge only after an explicit close/save callback.
  const queue = mount({ handler: async () => response([first, first, second, { id: 'bad', draft }, { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', draft: { ...draft, amount: -1 } }]) });
  await queue.settle(); assert.equal(queue.requests.filter(r => r.method === 'DELETE').length, 0); assert.equal(queue.modal().props.draft.ref, first.draft.ref);
  queue.modal().props.onClose(); await queue.settle(); assert.equal(queue.modal().props.draft.ref, second.draft.ref); assert.equal(queue.requests.filter(r => r.method === 'DELETE').length, 1);
  queue.focus(); await queue.settle(); assert.equal(queue.modal().props.draft.ref, second.draft.ref, 'A concurrent stale inbox response cannot reinsert a dismissed draft');

  const saved = mount(); await saved.settle(); saved.modal().props.onSaved(); saved.render(); assert.equal(saved.requests.filter(r => r.method === 'DELETE').length, 0, 'Successful save callback records deduplication; acknowledgement waits for closing the committed form'); saved.modal()?.props.onClose();
  // A re-render after committing locally shows the duplicate notice. Dismissing that
  // notice acknowledges the same server draft without saving any second movement.
  if (saved.alert()) saved.alert().props.children.find(child => child?.tag === 'button').props.onClick();
  await saved.settle(); assert.equal(saved.requests.filter(r => r.method === 'DELETE').length, 1);

  const preview = mount({ handler: async () => response([{ ...first, draft: { ...draft, preview: true } }]) }); await preview.settle(); assert.equal(preview.modal().props.draft.preview, true);
  const failure = mount({ hash: '#zero-wallet-inbox', handler: async () => response([], 503) }); await failure.settle(); assert.ok(failure.alert()); assert.equal(failure.requests.length, 1, 'Unavailable server must not cause a refetch loop');

  // SW click paths are fixed same-origin targets, even if a payload carries an arbitrary URL.
  const sw = worker(); await sw.event('install', {}); await sw.event('activate', {});
  await sw.event('push', { data: { json: () => ({ type: 'zero-wallet-payment', id: firstId, title: 'Pagamento da controllare', body: 'Apri ZERO', url: 'https://attacker.invalid', amount: 999, merchant: 'secret' }) } });
  assert.equal(sw.notifications[0].data.id, firstId); assert.equal(sw.notifications[0].data.url, undefined); assert.equal(sw.notifications[0].data.amount, undefined);
  await sw.event('notificationclick', { notification: { data: sw.notifications[0].data, close() {} } }); assert.deepEqual(sw.opened, ['https://zero.example/#zero-wallet-inbox']);
  sw.clients([{ url: 'https://foreign.example', postMessage() { throw Error('Foreign window messaged'); }, focus() { throw Error('Foreign window focused'); } }, { url: 'https://zero.example/', postMessage: data => sw.posted.push(data), focus: async () => sw.focused.push(true) }]);
  await sw.event('notificationclick', { notification: { data: sw.notifications[0].data, close() {} } }); assert.equal(sw.opened.length, 1); assert.equal(sw.focused.length, 1); assert.equal(sw.posted.at(-1).type, 'zero-wallet-payment');
  await sw.event('push', { data: { json: () => null } }); await sw.event('notificationclick', { notification: { data: { url: 'https://attacker.invalid' }, close() {} } }); assert.equal(sw.posted.at(-1).type, 'zero-subscription-reminders');
  console.log('PASS: cold PWA recovery, unlock/account isolation, trusted SW notifications, queued drafts, explicit acknowledgement, preview persistence, failure handling and safe push click routing.');
})().catch(error => { console.error(error); process.exitCode = 1; });
