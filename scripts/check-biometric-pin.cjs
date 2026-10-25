const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = process.argv[2] || path.resolve(__dirname, '..');
const componentPath = process.argv[3] || path.join(root, 'src/components/PinScreen.tsx');
const ts = require(path.join(root, 'node_modules/typescript'));
const source = ts.transpileModule(fs.readFileSync(componentPath, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;

const FACE_ID = 'Sblocca con Face ID / passkey';
const VERIFYING = 'Verifica in corso…';
const ALICE = 'alice@example.test';
const BOB = 'bob@example.test';
const PIN = '482957';

function deferred() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

class Element {
  constructor(tagName = 'BODY', parentElement = null, contentEditable = null) {
    this.tagName = tagName;
    this.parentElement = parentElement;
    this.contentEditable = contentEditable;
  }
  closest() {
    for (let node = this; node; node = node.parentElement) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName) || (node.contentEditable !== null && node.contentEditable !== 'false')) return node;
    }
    return null;
  }
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of (node.children || []).flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

function textContent(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  return (node.children || []).flat(Infinity).map(textContent).join('');
}

// Run the actual component and its effects. The mock keeps aborted requests
// unresolved so late successful browser results exercise the component's guards.
function mount(initialProps, controls = {}) {
  const hooks = [], listeners = new Map(), timers = new Map();
  const statusCalls = [], unlockCalls = [];
  let cursor = 0, props = initialProps, tree, dirty = false, pending = [], nextTimer = 0;
  let mounted = true, cancelCalls = 0, writesAfterUnmount = 0;
  const react = {
    createElement: (tag, elementProps, ...children) => ({ tag, props: elementProps || {}, children }),
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[index].value, value => {
        if (!mounted) { writesAfterUnmount++; return; }
        const next = typeof value === 'function' ? value(hooks[index].value) : value;
        if (!Object.is(next, hooks[index].value)) { hooks[index].value = next; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useEffect(effect, dependencies) {
      const index = cursor++, previous = hooks[index];
      const changed = !previous || !dependencies || dependencies.length !== previous.dependencies?.length || dependencies.some((value, item) => !Object.is(value, previous.dependencies?.[item]));
      if (changed) pending.push(() => {
        previous?.cleanup?.();
        hooks[index] = { dependencies, cleanup: effect() };
      });
    },
  };
  const biometric = {
    biometricUnlockStatus(email) {
      statusCalls.push(email);
      return controls.status ? controls.status(email) : Promise.resolve({ available: true, enabled: true });
    },
    unlockWithBiometric(email, signal) {
      const request = { email, signal, ...deferred() };
      unlockCalls.push(request);
      return request.promise;
    },
    cancelBiometricPrompt() { cancelCalls++; return Promise.resolve(); },
  };
  const window = {
    addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(listener); },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
  };
  const scope = {
    exports: {}, HTMLElement: Element, AbortController, Error, window, console,
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    require(name) {
      if (name === 'react') return react;
      if (name === '@/lib/biometricUnlock') return biometric;
      if (name === 'lucide-react') return { Delete: 'Delete', Lock: 'Lock', ScanFace: 'ScanFace' };
      return { default: name, __esModule: true };
    },
  };
  vm.runInNewContext(source, scope, { filename: componentPath });
  function render(nextProps = props) {
    assert.ok(mounted, 'Cannot render an unmounted test screen');
    props = nextProps;
    let passes = 0;
    do {
      if (++passes > 20) throw Error('Component render did not settle');
      dirty = false; cursor = 0; pending = [];
      tree = scope.exports.PinScreen(props);
      for (const effect of pending) effect();
    } while (dirty);
    return tree;
  }
  function button(label) { return find(tree, node => node.tag === 'button' && textContent(node) === label); }
  function click(label) {
    const target = button(label);
    assert.ok(target, `Button exists: ${label}`);
    assert.notEqual(target.props.disabled, true, `Button is enabled: ${label}`);
    target.props.onClick();
  }
  function key(keyValue, options = {}) {
    const event = { key: keyValue, target: new Element(), defaultPrevented: false, repeat: false, isComposing: false, ctrlKey: false, metaKey: false, altKey: false, ...options };
    event.preventDefault = () => { event.defaultPrevented = true; };
    for (const listener of [...(listeners.get('keydown') || [])]) listener(event);
    return event;
  }
  function count() {
    render();
    const group = find(tree, node => typeof node.props['aria-label'] === 'string' && /^\d di 6 cifre inserite$/.test(node.props['aria-label']));
    assert.ok(group, 'PIN progress exposes an accessible count');
    return Number(group.props['aria-label'].split(' ')[0]);
  }
  async function flush() {
    for (let pass = 0; pass < 6; pass++) {
      await Promise.resolve();
      if (mounted) render();
    }
  }
  render();
  return {
    render, button, click, key, count, flush, statusCalls, unlockCalls,
    text: value => textContent(tree).includes(value),
    cancelCalls: () => cancelCalls,
    writesAfterUnmount: () => writesAfterUnmount,
    listenerCount: () => listeners.get('keydown')?.size || 0,
    unmount() { mounted = false; for (const hook of hooks) hook?.cleanup?.(); },
  };
}

function lockProps(overrides = {}) { return { mode: 'lock', accountEmail: ALICE, expectedPin: PIN, ...overrides }; }

async function run() {
  let successes = 0;
  let screen = mount(lockProps({ onSuccess: () => successes++ }));
  assert.equal(screen.button(FACE_ID), null, 'The option waits for account capability status');
  await screen.flush();
  assert.deepEqual(screen.statusCalls, [ALICE], 'Availability is checked for the signed-in account');
  assert.ok(screen.button(FACE_ID), 'An opted-in, supported account gets the biometric option');
  assert.equal(screen.unlockCalls.length, 0, 'Opening or rerendering the PIN screen never launches a biometric prompt');
  screen.render();
  await screen.flush();
  assert.equal(screen.unlockCalls.length, 0);
  screen.click(FACE_ID);
  screen.click(FACE_ID);
  assert.equal(screen.unlockCalls.length, 1, 'Rapid repeated clicks start one browser prompt');
  assert.equal(screen.unlockCalls[0].email, ALICE);
  assert.equal(screen.unlockCalls[0].signal.aborted, false);
  screen.render();
  assert.equal(screen.button(VERIFYING).props.disabled, true, 'Pending verification disables the prompt button');
  for (const digit of PIN) screen.key(digit);
  assert.equal(screen.count(), 0, 'PIN entry waits while the browser prompt is active');
  assert.equal(successes, 0, 'Starting a browser prompt does not unlock the app');
  screen.unlockCalls[0].resolve({ verified: true });
  await screen.flush();
  assert.equal(successes, 1, 'Only a verified result unlocks the app');
  screen.click(FACE_ID);
  for (const digit of PIN) screen.key(digit);
  assert.equal(screen.unlockCalls.length, 1, 'A completed screen cannot start another verification');
  assert.equal(successes, 1, 'PIN and repeated clicks cannot unlock a completed screen twice');
  screen.unmount();

  for (const status of [{ available: false, enabled: true }, { available: true, enabled: false }, { available: false, enabled: false }]) {
    screen = mount(lockProps(), { status: () => Promise.resolve(status) });
    await screen.flush();
    assert.equal(screen.button(FACE_ID), null, 'Unavailable or disabled status keeps the PIN-only UI');
    assert.equal(screen.unlockCalls.length, 0);
    screen.unmount();
  }
  screen = mount(lockProps({ accountEmail: '' }));
  await screen.flush();
  assert.equal(screen.statusCalls.length, 0, 'An absent account cannot activate biometric unlock');
  assert.equal(screen.button(FACE_ID), null);
  screen.unmount();

  screen = mount(lockProps(), { status: email => Promise.resolve({ available: true, enabled: email === ALICE }) });
  await screen.flush();
  assert.ok(screen.button(FACE_ID));
  screen.render(lockProps({ accountEmail: BOB }));
  assert.equal(screen.button(FACE_ID), null, 'Switching accounts immediately clears the previous opt-in');
  await screen.flush();
  assert.equal(screen.button(FACE_ID), null, 'One account opt-in never enables another account');
  assert.deepEqual(screen.statusCalls, [ALICE, BOB]);
  screen.unmount();

  const lateStatus = deferred();
  screen = mount(lockProps(), { status: email => email === ALICE ? lateStatus.promise : Promise.resolve({ available: true, enabled: false }) });
  screen.render(lockProps({ accountEmail: BOB }));
  await screen.flush();
  lateStatus.resolve({ available: true, enabled: true });
  await screen.flush();
  assert.equal(screen.button(FACE_ID), null, 'A late capability result for the previous account is ignored');
  screen.unmount();

  screen = mount(lockProps(), { status: () => Promise.reject(new Error('Status offline')) });
  await screen.flush();
  assert.equal(screen.button(FACE_ID), null, 'A status network error preserves PIN fallback');
  screen.unmount();

  for (const result of [{ verified: false }, {}, { verified: 'true' }]) {
    successes = 0;
    screen = mount(lockProps({ onSuccess: () => successes++ }));
    await screen.flush();
    screen.click(FACE_ID);
    screen.unlockCalls[0].resolve(result);
    await screen.flush();
    assert.equal(successes, 0, 'An unverified or malformed result never unlocks the app');
    assert.equal(screen.button(FACE_ID).props.disabled, false, 'A failed result permits a new attempt');
    screen.unmount();
  }
  for (const error of [new Error('Network unavailable'), Object.assign(new Error('Cancelled'), { name: 'NotAllowedError' })]) {
    successes = 0;
    screen = mount(lockProps({ onSuccess: () => successes++ }));
    await screen.flush();
    screen.click(FACE_ID);
    screen.unlockCalls[0].reject(error);
    await screen.flush();
    assert.equal(successes, 0, 'Denied, cancelled, or failed requests never unlock the app');
    assert.equal(screen.button(FACE_ID).props.disabled, false, 'A rejected request releases the busy state');
    for (const digit of PIN) screen.key(digit);
    assert.equal(successes, 1, 'The original PIN remains usable after a biometric failure');
    screen.unmount();
  }

  successes = 0;
  screen = mount(lockProps({ onSuccess: () => successes++ }));
  await screen.flush();
  screen.click(FACE_ID);
  screen.render();
  const cancelled = screen.unlockCalls[0];
  screen.click('Usa il codice');
  assert.equal(cancelled.signal.aborted, true, 'Choosing PIN aborts the in-flight browser request');
  assert.equal(screen.cancelCalls(), 1, 'Choosing PIN also cancels the helper browser prompt');
  for (const digit of PIN) screen.key(digit);
  assert.equal(successes, 1, 'Fast PIN entry succeeds immediately after choosing the fallback');
  cancelled.resolve({ verified: true });
  await screen.flush();
  assert.equal(successes, 1, 'A late biometric success cannot unlock again after the PIN');
  screen.unmount();

  successes = 0;
  screen = mount(lockProps({ onSuccess: () => successes++ }));
  await screen.flush();
  screen.click(FACE_ID);
  screen.render();
  const first = screen.unlockCalls[0];
  screen.click('Usa il codice');
  screen.render();
  screen.click(FACE_ID);
  const second = screen.unlockCalls[1];
  first.resolve({ verified: true });
  await screen.flush();
  assert.equal(successes, 0, 'The cancelled attempt cannot complete a newer attempt');
  assert.equal(screen.button(VERIFYING).props.disabled, true, 'A stale completion cannot clear a newer busy state');
  second.resolve({ verified: true });
  await screen.flush();
  assert.equal(successes, 1, 'The current verification still completes normally');
  screen.unmount();

  let aliceSuccesses = 0, bobSuccesses = 0;
  screen = mount(lockProps({ onSuccess: () => aliceSuccesses++ }));
  await screen.flush();
  screen.click(FACE_ID);
  screen.render();
  const aliceAttempt = screen.unlockCalls[0];
  screen.render(lockProps({ accountEmail: BOB, expectedPin: '123456', onSuccess: () => bobSuccesses++ }));
  assert.equal(aliceAttempt.signal.aborted, true, 'Changing accounts aborts the previous account prompt');
  await screen.flush();
  assert.equal(screen.button(FACE_ID).props.disabled, false, 'The new account does not inherit the old busy state');
  screen.key('1'); screen.key('2');
  assert.equal(screen.count(), 2);
  aliceAttempt.resolve({ verified: true });
  await screen.flush();
  assert.equal(aliceSuccesses, 0, 'A stale success never calls the old account callback');
  assert.equal(bobSuccesses, 0, 'A stale success never calls the new account callback');
  assert.equal(screen.count(), 2, 'A stale completion never clears the new account PIN');
  screen.render(lockProps({ accountEmail: ALICE, onSuccess: () => aliceSuccesses++ }));
  assert.equal(screen.count(), 0, 'Changing accounts clears partial PIN digits');
  screen.unmount();

  successes = 0;
  screen = mount(lockProps({ onSuccess: () => successes++ }));
  await screen.flush();
  screen.click(FACE_ID);
  const unmountedAttempt = screen.unlockCalls[0];
  screen.unmount();
  assert.equal(unmountedAttempt.signal.aborted, true, 'Unmount aborts the browser prompt');
  assert.equal(screen.listenerCount(), 0, 'Unmount removes the PIN keyboard listener');
  unmountedAttempt.resolve({ verified: true });
  await screen.flush();
  assert.equal(successes, 0, 'A result arriving after unmount cannot unlock the app');
  assert.equal(screen.writesAfterUnmount(), 0, 'A late result never writes component state after unmount');

  const statusAfterUnmount = deferred();
  screen = mount(lockProps(), { status: () => statusAfterUnmount.promise });
  screen.unmount();
  statusAfterUnmount.resolve({ available: true, enabled: true });
  await screen.flush();
  assert.equal(screen.writesAfterUnmount(), 0, 'A late status result never writes state after unmount');

  for (const mode of ['create', 'confirm']) {
    const created = [];
    successes = 0;
    screen = mount(lockProps({ mode, onPinSet: code => created.push(code), onSuccess: () => successes++ }));
    await screen.flush();
    assert.equal(screen.statusCalls.length, 0, 'PIN setup never checks biometric availability');
    assert.equal(screen.button(FACE_ID), null, 'PIN creation and confirmation never offer biometrics');
    assert.equal(screen.unlockCalls.length, 0, 'PIN setup never prompts for biometrics');
    for (const digit of PIN) screen.key(digit);
    assert.deepEqual(created, [PIN], 'Rapid keyboard entry still works in PIN setup');
    assert.equal(successes, mode === 'confirm' ? 1 : 0);
    screen.unmount();
  }

  successes = 0;
  screen = mount(lockProps({ onSuccess: () => successes++ }));
  await screen.flush();
  screen.key('4'); screen.click('8'); screen.key('3'); screen.key('Backspace');
  for (const digit of '2957') screen.key(digit, { code: 'Numpad' + digit, location: 3 });
  assert.equal(successes, 1, 'Visual keypad, rapid keyboard, numpad, and correction preserve the existing PIN path');
  assert.equal(screen.unlockCalls.length, 0, 'Using the PIN never starts a biometric prompt');
  assert.equal(screen.listenerCount(), 1, 'Biometric UI renders do not duplicate keyboard listeners');
  screen.unmount();

  console.log('Biometric PIN UI: explicit opt-in, manual prompt, verified-only unlock, failure fallback, cancellation, stale attempts, account isolation, unmount cleanup, setup exclusion, and rapid PIN entry passed');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
