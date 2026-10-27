const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const component = process.argv[3] || path.join(root, 'src/components/CardTransfers.tsx');
const ts = require(path.join(root, 'node_modules/typescript'));
const compiled = ts.transpileModule(fs.readFileSync(component, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
function findAll(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap(child => findAll(child, predicate))];
}
function text(node) { return typeof node === 'string' || typeof node === 'number' ? String(node) : node && typeof node === 'object' ? [node.props?.children].flat(Infinity).map(text).join('') : ''; }
function harness(app = {}, selectedCardIds = []) {
  const states = []; let cursor = 0, tree;
  const react = { useState(initial) { const slot = cursor++; if (!(slot in states)) states[slot] = initial; return [states[slot], update => { states[slot] = typeof update === 'function' ? update(states[slot]) : update; }]; } };
  const scope = { exports: {}, Date, require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx: (tag, props) => ({ tag, props }), jsxs: (tag, props) => ({ tag, props }) };
    if (name === '@/context/AppContext') return { useApp: () => ({ transfers: [], transfersLoading: false, transferLoadError: '', ...app }) };
    if (name === './TransferModal') return { TransferModal: 'TransferModal' };
    if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key });
    throw Error(`Unexpected import ${name}`);
  } };
  vm.runInNewContext(compiled, scope, { filename: component });
  const render = ids => { if (ids) selectedCardIds = ids; cursor = 0; tree = scope.exports.CardTransfers({ selectedCardIds }); return tree; };
  render();
  return { render, get tree() { return tree; }, rows: () => findAll(tree, node => node.tag === 'li'), button: label => findAll(tree, node => node.tag === 'button' && text(node) === label)[0] };
}
const transfers = Array.from({ length: 7 }, (_, i) => ({ id: String(i), fromCardId: i % 2 ? 'a' : 'b', toCardId: i % 2 ? 'c' : 'a', fromLabel: `Carta partenza ${i}`, toLabel: `Carta arrivo ${i}`, amount: i + 1.5, date: `2026-10-${String(10 + i).padStart(2, '0')}`, createdAt: `2026-10-20T12:0${i}:00Z`, ...(i === 6 ? { note: 'Ricarica mensile' } : {}) }));
const all = harness({ transfers });
assert.equal(all.rows().length, 5, 'history starts with five most recent');
assert.ok(text(all.rows()[0]).includes('Carta partenza 6'), 'date orders newest first');
assert.ok(text(all.rows()[0]).includes('Carta arrivo 6'));
assert.ok(text(all.rows()[0]).includes('Ricarica mensile'));
for (const row of all.rows()) {
  const amount = findAll(row, node => node.tag === 'p' && node.props.className?.includes('text-sm font-extrabold'))[0];
  assert.ok(amount, 'each transfer has its own neutral amount');
  assert.ok(!/^[+−-]/.test(text(amount)), 'amount never impersonates an income or expense sign');
}
all.button('Mostra tutti (7)').props.onClick(); all.render(); assert.equal(all.rows().length, 7);
all.button('Mostra gli ultimi 5').props.onClick(); all.render(); assert.equal(all.rows().length, 5);
const source = harness({ transfers }, ['b']); assert.equal(source.rows().length, 4, 'card filter includes outgoing transfers');
const destination = harness({ transfers }, ['c']); assert.equal(destination.rows().length, 3, 'card filter includes incoming transfers');
const both = harness({ transfers }, ['b', 'c']); both.button('Mostra tutti (7)').props.onClick(); both.render(); assert.equal(both.rows().length, 7, 'multiple cards use OR and do not duplicate rows');
const missing = harness({ transfers }, ['removed']); assert.equal(missing.rows().length, 0); assert.match(text(missing.tree), /Nessun trasferimento per le carte selezionate/);
const deleted = harness({ transfers: [{ ...transfers[0], fromCardId: null, toCardId: null, fromLabel: 'Carta eliminata · 1234', toLabel: 'Altra carta eliminata · 5678' }] });
assert.equal(deleted.rows().length, 1); assert.ok(text(deleted.tree).includes('Carta eliminata · 1234'), 'stored labels preserve history after card deletion');
const loading = harness({ transfersLoading: true }); assert.match(text(loading.tree), /Caricamento trasferimenti/);
const error = harness({ transferLoadError: 'Connessione non disponibile', transfers: [transfers[0]] }); assert.match(text(error.tree), /Connessione non disponibile/); assert.equal(error.rows().length, 1, 'confirmed cached history can coexist with a load error');
assert.equal(findAll(all.tree, node => node.tag === 'TransferModal')[0].props.isOpen, false);
all.button('Nuovo trasferimento').props.onClick(); all.render(); assert.equal(findAll(all.tree, node => node.tag === 'TransferModal')[0].props.isOpen, true);
findAll(all.tree, node => node.tag === 'TransferModal')[0].props.onClose(); all.render(); assert.equal(findAll(all.tree, node => node.tag === 'TransferModal')[0].props.isOpen, false);
console.log('PASS transfer history: neutral amounts, source/destination card filters, date ordering, pagination, deleted-card labels, cached/error/loading states and modal entry.');
