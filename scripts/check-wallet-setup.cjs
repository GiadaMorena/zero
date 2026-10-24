const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const source = process.argv[3] || path.join(root, 'src/components/ApplePaySetup.tsx');
const ts = require(path.join(root, 'node_modules/typescript'));
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics.length, 0, 'Setup component parses without TypeScript syntax errors');
function text(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  return [node.props?.children].flat(Infinity).map(text).join('');
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const found = find(child, predicate); if (found) return found; }
  return null;
}
const cardId = '11111111-1111-4111-8111-111111111111';
const endpoint = 'https://web.push.apple.com/fake-device';
function mount(options = {}) {
  const config = { configured: true, registered: true, permission: 'granted', support: true, session: true, testAccepted: true, ...options };
  const hooks = [], calls = { requests: [], copied: [], updates: 0 };
  let cursor = 0, dirty = false, effects = [], tree;
  const jsx = (tag, props) => ({ tag, props: props || {} });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[index].value, value => {
        const next = typeof value === 'function' ? value(hooks[index].value) : value;
        if (!Object.is(next, hooks[index].value)) { hooks[index].value = next; dirty = true; }
      }];
    },
    useEffect(effect, deps) {
      const index = cursor++, previous = hooks[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps?.[i]))) {
        effects.push(() => { previous?.cleanup?.(); hooks[index] = { deps, cleanup: effect() }; });
      }
    },
  };
  const registration = {
    update: async () => { calls.updates++; },
    pushManager: { getSubscription: async () => config.registered ? { endpoint } : null },
  };
  const window = { location: { hash: '' }, PushManager: {}, Notification: {}, setTimeout, clearTimeout };
  const navigator = {
    clipboard: { writeText: async value => { calls.copied.push(value); } },
    serviceWorker: { getRegistration: async () => registration },
  };
  if (!config.support) { delete window.PushManager; delete window.Notification; }
  const session = { access_token: 'account-session-fixture' };
  const imports = {
    react,
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    '@/context/AppContext': { useApp: () => ({ cards: [{ id: cardId, bankName: 'Banca test', number: '•••• 1234' }] }) },
    '@/lib/supabase': { supabase: { auth: { getSession: async () => ({ data: { session: config.session ? session : null } }) } } },
  };
  const fetch = async (url, init = {}) => {
    calls.requests.push({ url, ...init });
    let body, ok = true;
    if (url === '/api/wallet/setup' && (!init.method || init.method === 'GET')) body = { configured: config.configured, linked: config.linked };
    else if (url === '/api/push') body = { endpoints: config.registered ? [endpoint] : [] };
    else if (url === '/api/wallet/setup' && init.method === 'POST') body = { token: 'scoped-token-fixture', expires: '2027-01-01T00:00:00Z' };
    else if (url === '/api/wallet/setup' && init.method === 'DELETE') body = { ok: true };
    else if (url === '/api/wallet/test') body = { notificationAccepted: config.testAccepted };
    else throw Error('Unexpected request: ' + url);
    return { ok, json: async () => body };
  };
  const forbiddenStorage = { getItem() { throw Error('Setup must not read persisted secrets'); }, setItem() { throw Error('Setup must not persist secrets'); } };
  const scope = { exports: {}, require: name => imports[name], fetch, navigator, window, Notification: { get permission() { return config.permission; } }, localStorage: forbiddenStorage, sessionStorage: forbiddenStorage, crypto: { randomUUID: () => '22222222-2222-4222-8222-222222222222' }, URLSearchParams, Date, Error, console };
  vm.runInNewContext(compiled.outputText, scope);
  function render() {
    let passes = 0;
    do {
      if (++passes > 20) throw Error('Setup did not settle');
      dirty = false; cursor = 0; effects = []; tree = scope.exports.ApplePaySetup();
      for (const effect of effects) effect();
    } while (dirty);
    return tree;
  }
  async function flush() { for (let i = 0; i < 4; i++) { await new Promise(resolve => setImmediate(resolve)); render(); } return tree; }
  function button(label) { const found = find(tree, node => node.tag === 'button' && text(node) === label); assert.ok(found, 'Button exists: ' + label); return found; }
  render();
  return {
    calls, config, window, render, flush, button,
    chooseCard() { find(tree, node => node.tag === 'select').props.onChange({ target: { value: cardId } }); render(); },
    async click(label) { const item = button(label); assert.ok(!item.props.disabled, 'Button enabled: ' + label); item.props.onClick(); render(); await flush(); },
    visibleText: () => text(tree),
    token: () => find(tree, node => node.props?.['aria-label'] === 'Codice personale automazione Apple Pay')?.props.value,
  };
}
(async () => {
  const unavailable = mount({ configured: false }); await unavailable.flush(); unavailable.chooseCard();
  assert.equal(unavailable.button('Crea collegamento').props.disabled, true);
  assert.equal(unavailable.button('Invia notifica di prova').props.disabled, true);
  assert.match(unavailable.visibleText(), /attesa di configurazione/);
  assert.equal(unavailable.calls.requests.some(call => call.method === 'POST'), false);

  const missingDevice = mount({ registered: false }); await missingDevice.flush(); missingDevice.chooseCard();
  assert.equal(missingDevice.button('Crea collegamento').props.disabled, true);
  assert.match(missingDevice.visibleText(), /Attiva prima/);
  missingDevice.config.registered = true;
  await missingDevice.click('Controlla di nuovo');
  assert.equal(missingDevice.button('Crea collegamento').props.disabled, false, 'Refreshing detects nearby push activation');

  const unsupported = mount({ support: false }); await unsupported.flush(); unsupported.chooseCard();
  assert.equal(unsupported.button('Crea collegamento').props.disabled, true);
  assert.match(unsupported.visibleText(), /icona sulla schermata Home/);

  const denied = mount({ permission: 'denied' }); await denied.flush(); denied.chooseCard();
  assert.equal(denied.button('Crea collegamento').props.disabled, true);

  const signedOut = mount({ session: false }); await signedOut.flush(); signedOut.chooseCard();
  assert.equal(signedOut.button('Crea collegamento').props.disabled, true);
  assert.equal(signedOut.calls.requests.length, 0, 'No account API call without a session');

  const app = mount(); await app.flush();
  assert.equal(app.token(), undefined, 'Mount never fetches or exposes a pairing secret');
  assert.equal(app.calls.requests.filter(call => call.method === 'POST').length, 0);
  assert.equal(app.button('Crea collegamento').props.disabled, true, 'Explicit card selection required');
  app.chooseCard();
  await app.click('Crea collegamento');
  const creation = app.calls.requests.find(call => call.url === '/api/wallet/setup' && call.method === 'POST');
  assert.equal(creation.headers.authorization, 'Bearer account-session-fixture');
  assert.deepEqual(JSON.parse(creation.body), { cardId, endpoint });
  assert.equal(app.token(), 'Bearer scoped-token-fixture');
  await app.click('Copia codice con Bearer');
  assert.equal(app.calls.copied[0], 'Bearer scoped-token-fixture');
  const updatesBeforeTest = app.calls.updates;
  await app.click('Invia notifica di prova');
  assert.ok(app.calls.updates > updatesBeforeTest, 'Test updates the installed worker before sending a notification');
  const test = app.calls.requests.find(call => call.url === '/api/wallet/test');
  assert.equal(test.headers.authorization, 'Bearer account-session-fixture');
  assert.deepEqual(JSON.parse(test.body), { cardId, endpoint }, 'Only safe preview endpoint receives the test');
  assert.match(app.visibleText(), /Invio della notifica di prova accettato/);
  assert.match(app.visibleText(), /arrivo sul telefono va verificato da te/);
  assert.equal(app.calls.requests.some(call => call.url === '/api/wallet/payment'), false, 'Setup does not submit real payments');
  await app.click('Prova solo il modulo qui');
  assert.match(app.window.location.hash, /preview=1/);
  await app.click('Disattiva collegamento');
  assert.equal(app.token(), undefined, 'Revocation removes the in-memory secret');
  assert.ok(app.calls.requests.some(call => call.url === '/api/wallet/setup' && call.method === 'DELETE'));

  const notAccepted = mount({ testAccepted: false }); await notAccepted.flush(); notAccepted.chooseCard();
  await notAccepted.click('Invia notifica di prova');
  assert.match(notAccepted.visibleText(), /prova non è stata accettata/);
  console.log('PASS: wallet setup readiness and device gating, explicit card/token creation, copy/revoke, worker update, safe preview test, truthful delivery status and no secret persistence.');
})().catch(error => { console.error(error); process.exitCode = 1; });
