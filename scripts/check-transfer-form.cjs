const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = process.argv[2] || path.resolve(__dirname, '..');
const component = process.argv[3] || path.join(root, 'src/components/TransferModal.tsx');
const ts = require(path.join(root, 'node_modules/typescript'));
function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
}
const helpers = { exports: {} };
vm.runInNewContext(compile(path.join(root, 'src/lib/quickTransaction.ts')), helpers);

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return null;
}
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return node && typeof node === 'object' ? [node.props?.children].flat(Infinity).map(text).join('') : '';
}
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
const cards = [
  { id: 'a', bankName: 'Fineco', number: '1234', balance: 100 },
  { id: 'b', bankName: 'Intesa', number: '5678', balance: 20 },
  { id: 'c', bankName: 'Revolut', number: '9012', balance: 90 },
];

function harness(override = {}) {
  const hooks = [], effects = [], listeners = new Map(), calls = [];
  let cursor = 0, tree, closeCount = 0, uuidCount = 0, dirty = false, disposed = false, writesAfterUnmount = 0;
  const app = { cards: cards.map(item => ({ ...item })), activeCard: cards[1], ...override,
    addTransfer: async (...args) => { calls.push(args); return override.save ? override.save(...args) : {}; },
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[index].value, update => { if (disposed) { writesAfterUnmount++; return; } hooks[index].value = typeof update === 'function' ? update(hooks[index].value) : update; dirty = true; }];
    },
    useRef(initial) { const index = cursor++; return hooks[index] ??= { current: initial }; },
    useEffect(effect, dependencies) {
      const index = cursor++, previous = hooks[index];
      if (!previous || !dependencies || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects.push(() => { previous?.cleanup?.(); hooks[index] = { dependencies, cleanup: effect() }; });
      }
    },
  };
  const document = {
    activeElement: null,
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type, handler) { if (listeners.get(type) === handler) listeners.delete(type); },
  };
  const scope = { exports: {}, console, Date, HTMLElement: class {}, document,
    crypto: { randomUUID: () => { uuidCount++; return 'ef2790a4-87a0-41af-b56a-9088fbad474f'; } },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: (tag, props) => ({ tag, props }), jsxs: (tag, props) => ({ tag, props }) };
      if (name === '@/context/AppContext') return { useApp: () => app };
      if (name === '@/lib/quickTransaction') return helpers.exports;
      if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key });
      throw Error(`Unexpected dependency ${name}`);
    },
  };
  vm.runInNewContext(compile(component), scope, { filename: component });
  const props = { isOpen: true, onClose: () => closeCount++ };
  function render() {
    do {
      dirty = false; cursor = 0; effects.length = 0;
      const outer = scope.exports.TransferModal(props);
      tree = outer?.tag(outer.props) || null;
      effects.splice(0).forEach(effect => effect());
    } while (dirty);
    return tree;
  }
  render();
  const byId = id => find(tree, node => node.props?.id === id);
  function input(id, value) { byId(id).props.onChange({ target: { value }, currentTarget: { value } }); render(); }
  const form = () => find(tree, node => node.tag === 'form');
  function submit() { return form().props.onSubmit({ preventDefault() {} }); }
  const button = name => find(tree, node => node.tag === 'button' && (node.props['aria-label'] === name || text(node) === name));
  function unmount() { hooks.forEach(hook => hook.cleanup?.()); disposed = true; }
  return { app, render, byId, input, submit, form, button, unmount, listeners, calls,
    get tree() { return tree; }, get closeCount() { return closeCount; }, get uuidCount() { return uuidCount; }, get writesAfterUnmount() { return writesAfterUnmount; } };
}

(async () => {
  const defaults = harness();
  assert.equal(defaults.byId('transfer-from').props.value, 'b', 'active card starts as source');
  assert.equal(defaults.byId('transfer-to').props.value, 'a');
  assert.match(defaults.byId('transfer-date').props.value, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(text(defaults.tree).includes('Non modifica spese, entrate o budget.'));
  assert.ok(text(defaults.tree).includes('Non esegue un bonifico.'));
  assert.equal(defaults.form().props['data-app-update-block'], 'true');
  defaults.button('Inverti carte').props.onClick(); defaults.render();
  assert.equal(defaults.byId('transfer-from').props.value, 'a');
  assert.equal(defaults.byId('transfer-to').props.value, 'b');
  defaults.input('transfer-from', 'b');
  assert.equal(defaults.byId('transfer-to').props.value, 'a', 'selecting destination as source swaps instead of producing same card');
  defaults.input('transfer-to', 'b');
  assert.equal(defaults.byId('transfer-from').props.value, 'a', 'selecting source as destination also swaps');

  for (const value of ['', '0', '-1', '1,234', '12cats', 'Infinity', '999999999999999999999999']) {
    const h = harness(); h.input('transfer-amount', value); await h.submit(); h.render();
    assert.equal(h.calls.length, 0, `Invalid amount ${value} never persists`);
    assert.ok(find(h.tree, node => node.props?.role === 'alert'));
  }
  const insufficient = harness(); insufficient.input('transfer-amount', '20,01'); await insufficient.submit(); insufficient.render();
  assert.equal(insufficient.calls.length, 0); assert.match(text(insufficient.tree), /saldo.*non è sufficiente/);
  const wrongDate = harness(); wrongDate.input('transfer-amount', '1'); wrongDate.input('transfer-date', '2026-02-31'); await wrongDate.submit();
  assert.equal(wrongDate.calls.length, 0);
  const removed = harness(); removed.input('transfer-amount', '1'); removed.app.cards = cards.filter(card => card.id !== 'b'); removed.render(); await removed.submit();
  assert.equal(removed.calls.length, 0, 'removed source is not silently reassigned');
  const oneCard = harness({ cards: cards.slice(0, 1) }); oneCard.input('transfer-amount', '1'); await oneCard.submit(); oneCard.render();
  assert.equal(oneCard.calls.length, 0); assert.match(text(oneCard.tree), /almeno due carte/);

  const wait = deferred(); const pending = harness({ save: () => wait.promise });
  pending.input('transfer-amount', '12,50'); pending.input('transfer-date', '2026-10-27'); pending.input('transfer-note', '  Ricarica  ');
  const first = pending.submit(); const duplicate = pending.submit(); pending.render();
  assert.equal(pending.calls.length, 1, 'fast double submission submits once');
  assert.deepEqual(JSON.parse(JSON.stringify(pending.calls[0][0])), { fromCardId: 'b', toCardId: 'a', amount: 12.5, date: '2026-10-27', note: 'Ricarica' });
  assert.equal(pending.calls[0][1], 'ef2790a4-87a0-41af-b56a-9088fbad474f');
  assert.equal(pending.button('Chiudi').props.disabled, true);
  pending.button('Chiudi').props.onClick(); assert.equal(pending.closeCount, 0);
  pending.listeners.get('keydown')({ key: 'Escape', preventDefault() {} }); assert.equal(pending.closeCount, 0, 'Escape cannot interrupt a pending save');
  assert.equal(find(pending.tree, node => node.tag === 'fieldset').props.disabled, true);
  wait.resolve({ error: 'Connessione interrotta. Riprova.' }); await first; await duplicate; pending.render();
  assert.equal(pending.closeCount, 0); assert.equal(pending.byId('transfer-amount').props.value, '12,50');
  assert.equal(pending.byId('transfer-note').props.value, '  Ricarica  ');
  assert.equal(find(pending.tree, node => node.tag === 'fieldset').props.disabled, true, 'submitted payload stays frozen after an ambiguous error');
  assert.equal(pending.button('Chiudi').props.disabled, false, 'after a failed attempt the user can leave and inspect history');
  assert.match(text(pending.tree), /Riprova con gli stessi dati.*storico nelle Carte/);
  pending.input('transfer-amount', '3'); pending.input('transfer-note', 'Different draft');
  const retry = pending.submit(); await retry; pending.render();
  assert.equal(pending.calls.length, 2); assert.equal(pending.uuidCount, 1, 'retry reuses original idempotency key');
  assert.equal(pending.calls[0][1], pending.calls[1][1]);
  assert.deepEqual(JSON.parse(JSON.stringify(pending.calls[0][0])), JSON.parse(JSON.stringify(pending.calls[1][0])), 'retry always resends the same captured payload even if a stale event fires');

  const network = harness({ save: async () => { throw Error('offline'); } }); network.input('transfer-amount', '1'); await network.submit(); network.render();
  assert.equal(network.closeCount, 0); assert.equal(network.button('Chiudi').props.disabled, false); assert.match(text(network.tree), /dati inseriti sono ancora qui/);
  const success = harness(); success.input('transfer-amount', '20,00'); await success.submit();
  assert.equal(success.calls.length, 1); assert.equal(success.closeCount, 1, 'success closes form only after persistence');
  for (const outcome of [{}, { error: 'Account cambiato' }]) {
    const response = deferred(), gone = harness({ save: () => response.promise }); gone.input('transfer-amount', '1');
    const saving = gone.submit(); gone.render(); gone.unmount(); response.resolve(outcome); await saving;
    assert.equal(gone.closeCount, 0, 'late persistence cannot call the close callback after unmount');
    assert.equal(gone.writesAfterUnmount, 0, 'late success or account error never writes state after unmount');
  }
  const rejection = deferred(), rejectedAfterUnmount = harness({ save: () => rejection.promise }); rejectedAfterUnmount.input('transfer-amount', '1');
  const lateFailure = rejectedAfterUnmount.submit(); rejectedAfterUnmount.unmount(); rejection.reject(Error('offline')); await lateFailure;
  assert.equal(rejectedAfterUnmount.writesAfterUnmount, 0);
  const escape = harness(); escape.listeners.get('keydown')({ key: 'Escape', preventDefault() {} }); assert.equal(escape.closeCount, 1);
  escape.unmount(); assert.equal(escape.listeners.has('keydown'), false);
  console.log('PASS transfer form: paired card selection, swap, decimal/date/balance validation, missing cards, frozen retry payload/key, double-submit guard, draft retention, saving lock, late/unmounted responses, Escape and listener cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
