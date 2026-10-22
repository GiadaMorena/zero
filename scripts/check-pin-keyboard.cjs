const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
const source = ts.transpileModule(fs.readFileSync(root + '/src/components/PinScreen.tsx', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;

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

// Execute the real component, its effects, and its window event handler.
// State changes can intentionally stay batched to cover fast typing before React renders.
function mount(initialProps) {
  const hooks = [];
  const listeners = new Map();
  const timers = new Map();
  let cursor = 0, props = initialProps, tree, dirty = false, pending = [], nextTimer = 0;
  const react = {
    createElement: (tag, elementProps, ...children) => ({ tag, props: elementProps || {}, children }),
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[index].value, value => {
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
      const index = cursor++;
      const previous = hooks[index];
      const changed = !previous || !dependencies || dependencies.some((value, item) => !Object.is(value, previous.dependencies?.[item]));
      if (changed) pending.push(() => {
        previous?.cleanup?.();
        hooks[index] = { dependencies, cleanup: effect() };
      });
    },
  };
  const window = {
    addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(listener); },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
  };
  const scope = {
    exports: {}, HTMLElement: Element, window, console,
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    require: name => name === 'react' ? react : name === 'lucide-react' ? { Delete: 'Delete', Lock: 'Lock' } : { default: name, __esModule: true },
  };
  vm.runInNewContext(source, scope);
  function render(nextProps = props) {
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
  function key(keyValue, options = {}) {
    const event = { key: keyValue, target: new Element(), defaultPrevented: false, repeat: false, isComposing: false, ctrlKey: false, metaKey: false, altKey: false, ...options };
    event.preventDefault = () => { event.defaultPrevented = true; };
    for (const listener of [...(listeners.get('keydown') || [])]) listener(event);
    return event;
  }
  function clickDigit(digit) {
    const button = find(tree, node => node.tag === 'button' && node.children.includes(digit));
    assert.ok(button, `Keypad contains ${digit}`);
    button.props.onClick();
  }
  function count() {
    render();
    const group = find(tree, node => typeof node.props['aria-label'] === 'string' && /^\d di 6 cifre inserite$/.test(node.props['aria-label']));
    assert.ok(group, 'PIN progress has an accessible count');
    return Number(group.props['aria-label'].split(' ')[0]);
  }
  render();
  return {
    render, key, clickDigit, count,
    text: text => !!find(tree, node => node.children.includes(text)),
    flushTimers() { for (const [id, timer] of [...timers].sort((a, b) => a[1].delay - b[1].delay)) { timers.delete(id); timer.callback(); } render(); },
    listenerCount: () => listeners.get('keydown')?.size || 0,
    unmount() { for (const hook of hooks) hook?.cleanup?.(); },
  };
}

let successes = 0;
let screen = mount({ mode: 'lock', expectedPin: '482957', onSuccess: () => successes++ });
assert.equal(screen.listenerCount(), 1);
for (const digit of '482957') assert.equal(screen.key(digit).defaultPrevented, true);
assert.equal(successes, 1, 'Fast keyboard entry completes once without an intermediate render');
screen.key('9'); screen.key('Backspace'); screen.key('7');
assert.equal(successes, 1, 'Additional keys cannot complete the accepted PIN again');
assert.equal(screen.count(), 6);
assert.equal(screen.listenerCount(), 1, 'Renders replace rather than duplicate the listener');
screen.unmount();
assert.equal(screen.listenerCount(), 0, 'Unmount removes the global keyboard handler');
screen.key('4');
assert.equal(successes, 1);

successes = 0;
screen = mount({ mode: 'lock', expectedPin: '482957', onSuccess: () => successes++ });
screen.key('4', { code: 'Numpad4', location: 3 });
screen.clickDigit('8'); screen.key('3');
assert.equal(screen.key('Backspace').defaultPrevented, true);
for (const digit of '2957') screen.key(digit, { code: 'Numpad' + digit, location: 3 });
assert.equal(successes, 1, 'Numpad, visual keypad, and Backspace use the same current PIN');
screen.unmount();

screen = mount({ mode: 'lock', expectedPin: '482957' });
for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true }, { isComposing: true }]) {
  assert.equal(screen.key('4', options).defaultPrevented, false);
}
screen.key('4', { defaultPrevented: true });
for (const key of ['Enter', 'Tab', 'ArrowLeft', 'Delete', 'Escape', 'a']) assert.equal(screen.key(key).defaultPrevented, false);
for (const target of [new Element('INPUT'), new Element('TEXTAREA'), new Element('SELECT'), new Element('SPAN', new Element('DIV', null, 'true')), new Element('DIV', null, '')]) {
  assert.equal(screen.key('4', { target }).defaultPrevented, false, 'Editable elements retain their keyboard events');
}
assert.equal(screen.count(), 0, 'Shortcuts, repeat, composition, and typing in fields never modify the PIN');
screen.key('4', { target: new Element('DIV', null, 'false') });
assert.equal(screen.count(), 1, 'An explicitly noneditable element does not block PIN typing');
screen.unmount();

successes = 0;
screen = mount({ mode: 'lock', expectedPin: '482957', onSuccess: () => successes++ });
for (const digit of '123456') screen.key(digit);
screen.render();
assert.equal(successes, 0);
assert.equal(screen.text('Codice non corretto'), true);
screen.key('Backspace'); screen.key('7');
assert.equal(screen.count(), 6, 'Input waits for the error reset after an invalid complete code');
screen.flushTimers();
assert.equal(screen.count(), 0, 'An invalid keyboard PIN clears for retry');
for (const digit of '482957') { screen.key(digit); screen.render(); }
assert.equal(successes, 1, 'Retry succeeds using the configured code');
screen.unmount();

const created = [];
successes = 0;
screen = mount({ mode: 'create', onPinSet: code => created.push(code) });
for (const digit of '395827') screen.key(digit);
assert.deepEqual(created, ['395827'], 'Keyboard entry works during PIN creation');
screen.render({ mode: 'confirm', expectedPin: created[0], onSuccess: () => successes++ });
assert.equal(screen.count(), 0, 'Changing to confirmation starts with an empty code');
for (const digit of '395827') screen.key(digit);
assert.equal(successes, 1, 'Keyboard confirmation validates the created PIN');
screen.unmount();

successes = 0;
screen = mount({ mode: 'lock', expectedPin: '111111', onSuccess: () => { throw Error('Stale callback used'); } });
screen.render({ mode: 'lock', expectedPin: '222222', onSuccess: () => successes++ });
for (const digit of '222222') screen.key(digit);
assert.equal(successes, 1, 'Keyboard validation uses the latest expected code and callback');
screen.unmount();
console.log('PIN keyboard, numpad, mixed input, correction, rapid typing, ignored shortcuts/editable targets, retry, creation/confirmation and listener cleanup passed');
