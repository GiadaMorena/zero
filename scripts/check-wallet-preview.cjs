const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = process.argv[2] || path.resolve(__dirname, '..');
const ts = require(root + '/node_modules/typescript');
function compile(file, jsx = false) { return ts.transpileModule(fs.readFileSync(root + '/' + file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: jsx ? ts.JsxEmit.ReactJSX : undefined } }).outputText; }
function moduleFrom(file) { const scope = { exports: {}, URLSearchParams, Date, Number, String }; vm.runInNewContext(compile(file), scope); return scope.exports; }
const wallet = moduleFrom('src/lib/walletPayment.ts');
const quick = moduleFrom('src/lib/quickTransaction.ts');
const monthly = moduleFrom('src/lib/monthlyBudget.ts');
const fields = { currency: 'EUR', cardId: '11111111-1111-4111-8111-111111111111', ref: '22222222-2222-4222-8222-222222222222', amount: '12,50', merchant: 'Pagamento fittizio', date: '2026-10-24' };
function parse(extra = {}) { return wallet.parseWalletPayment('#zero-pay?' + new URLSearchParams({ ...fields, ...extra }).toString()); }
assert.equal(parse({ preview: '1' }).preview, true);
for (const value of ['', '0', 'true', 'yes']) assert.notEqual(parse({ preview: value }).preview, true, 'Only the explicit preview flag activates preview mode');
assert.equal(wallet.parseWalletPayment('#zero-pay?' + new URLSearchParams({ ...fields, amount: '[IMPORTO]', preview: '1' })), null, 'Preview cannot bypass payment field validation');

function findAll(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  const own = predicate(node) ? [node] : [];
  return own.concat(...[node.props?.children].flat(Infinity).map(child => findAll(child, predicate)));
}
function find(node, predicate) { return findAll(node, predicate)[0] || null; }
function text(node) { if (node === null || node === undefined || typeof node === 'boolean') return ''; if (typeof node !== 'object') return String(node); return [node.props?.children].flat(Infinity).map(text).join(''); }
function mount(draft, transaction) {
  const hooks = [], calls = { added: [], updated: [], saved: 0, closed: 0 };
  let cursor = 0, tree;
  const react = {
    useState(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial; return [hooks[index], value => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value; }]; },
    useRef(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect() {},
  };
  const jsx = (tag, props) => ({ tag, props: props || {} });
  const app = { cards: [{ id: fields.cardId, bankName: 'Carta di prova', number: '1234', balance: 50 }], activeCard: { id: fields.cardId }, transactions: [], addTransaction: async data => { calls.added.push(data); return {}; }, updateTransaction: async (id, data) => { calls.updated.push({ id, data }); return {}; } };
  const imports = { react, 'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' }, '@/context/AppContext': { useApp: () => app }, '@/lib/quickTransaction': quick, '@/lib/monthlyBudget': monthly, '@/lib/walletPayment': wallet, 'lucide-react': new Proxy({}, { get: (_target, name) => name }) };
  const scope = { exports: {}, require: name => imports[name], console };
  vm.runInNewContext(compile('src/components/AddSpesaModal.tsx', true), scope);
  const props = { isOpen: true, draft, transaction, onSaved: () => calls.saved++, onClose: () => calls.closed++ };
  function render() {
    cursor = 0;
    const formComponent = scope.exports.AddSpesaModal(props);
    assert.equal(typeof formComponent.tag, 'function', 'The real modal mounts TransactionForm');
    tree = formComponent.tag(formComponent.props);
    return tree;
  }
  render();
  return {
    calls, render,
    submit: async () => { const form = find(render(), node => node.tag === 'form'); let prevented = false; await form.props.onSubmit({ preventDefault() { prevented = true; } }); assert.equal(prevented, true); render(); },
    chooseCategory(name) { const button = find(render(), node => node.tag === 'button' && text(node) === name); assert.ok(button, 'Category exists: ' + name); button.props.onClick(); render(); },
    value: id => find(render(), node => node.props?.id === id)?.props.value,
    submitButtons: () => findAll(render(), node => node.tag === 'button' && node.props.type !== 'button'),
    error: () => text(find(render(), node => node.props?.role === 'alert')),
  };
}
(async () => {
  const preview = mount(parse({ preview: '1' }));
  assert.equal(preview.value('transaction-amount'), '12,50'); assert.equal(preview.value('transaction-date'), fields.date); assert.equal(preview.value('transaction-card'), fields.cardId);
  assert.equal(preview.submitButtons().length, 0, 'A preview exposes no explicit or implicit submit button');
  await preview.submit(); preview.chooseCategory('Cibo'); await preview.submit();
  assert.equal(preview.submitButtons().length, 0, 'Selecting a category never reveals a save button in preview');
  assert.equal(preview.calls.added.length, 0); assert.equal(preview.calls.updated.length, 0); assert.equal(preview.calls.saved, 0); assert.equal(preview.calls.closed, 0);
  assert.match(preview.error(), /prova.*nessuna spesa/i);

  // Even an accidentally supplied edit target cannot turn a preview into a write.
  const editPreview = mount(parse({ preview: '1' }), { id: 'existing', title: fields.merchant, amount: -12.5, category: 'Cibo', date: fields.date, cardId: fields.cardId, type: 'expense' });
  await editPreview.submit(); assert.equal(editPreview.calls.updated.length, 0); assert.equal(editPreview.calls.added.length, 0); assert.equal(editPreview.calls.saved, 0);

  const normal = mount(parse());
  assert.equal(normal.submitButtons().length, 1);
  await normal.submit(); assert.equal(normal.calls.added.length, 0, 'A real imported draft still requires explicit category selection'); assert.match(normal.error(), /categoria/);
  normal.chooseCategory('Cibo'); await normal.submit();
  assert.equal(normal.calls.added.length, 1); assert.equal(normal.calls.updated.length, 0); assert.equal(normal.calls.saved, 1); assert.equal(normal.calls.closed, 1);
  assert.equal(normal.calls.added[0].amount, 12.5); assert.equal(normal.calls.added[0].cardId, fields.cardId); assert.equal(normal.calls.added[0].date, fields.date); assert.equal(normal.calls.added[0].category, 'Cibo'); assert.match(normal.calls.added[0].note, /zero-pay:/);
  console.log('PASS: real wallet preview modal cannot save or update, even on submit; normal imported drafts require a category and persist exactly once.');
})().catch(error => { console.error(error); process.exitCode = 1; });
