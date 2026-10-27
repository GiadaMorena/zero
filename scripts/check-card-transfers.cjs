const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('node:assert/strict');
const root = process.argv[2] || path.resolve(__dirname, '..');
const helperPath = process.argv[3] || path.join(root, 'src/lib/cardTransfers.ts');
const ts = require(path.join(root, 'node_modules/typescript'));
const compiled = ts.transpileModule(fs.readFileSync(helperPath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} }; vm.runInNewContext(compiled, { exports: mod.exports, Date, Number, Error });
const { validateCardTransfer, transferFromRow, persistCardTransfer } = mod.exports;
const a = '00000000-0000-4000-8000-000000000001', b = '00000000-0000-4000-8000-000000000002', id = '00000000-0000-4000-8000-000000000010';
const input = { fromCardId: a, toCardId: b, amount: 12.34, date: '2026-10-27', note: '  Giroconto  ' };
const row = { id, from_card_id: a, to_card_id: b, from_label: 'Fineco · •••• 1234', to_label: 'Allianz · •••• 5678', amount: '12.34', date: input.date, note: 'Giroconto', created_at: '2026-10-27T12:00:00Z' };
const response = () => ({ transfer: { ...row }, balances: [{ id: a, balance: '87.66' }, { id: b, balance: '32.34' }] });
(async () => {
  assert.equal(validateCardTransfer(input), null);
  for (const bad of [{ ...input, fromCardId: b }, { ...input, toCardId: 'missing' }, ...[0, -1, NaN, Infinity, .001, 12.345, 1000000000].map(amount => ({ ...input, amount })),
    ...['2026-02-30', '2026-13-01', '', '27/10/2026', '1800-01-01'].map(date => ({ ...input, date })), { ...input, note: 'x'.repeat(501) }]) {
    let calls = 0; const result = await persistCardTransfer({ rpc: async () => { calls++; return { data: response(), error: null }; } }, bad, id);
    assert.ok(result.error); assert.equal(calls, 0, 'invalid transfer never reaches persistence');
  }
  assert.equal(transferFromRow({ ...row, date: '2026-02-30' }), null);
  assert.equal(transferFromRow({ ...row, amount: Infinity }), null);
  assert.equal(transferFromRow({ ...row, from_card_id: null }).fromCardId, null, 'deleted-card history remains readable');
  let captured;
  const success = await persistCardTransfer({ rpc: async (name, args) => { captured = { name, args }; return { data: response(), error: null }; } }, input, id);
  assert.equal(captured.name, 'record_card_transfer'); assert.equal(captured.args.p_request_id, id); assert.equal(captured.args.p_note, 'Giroconto');
  assert.equal(captured.args.p_amount, 12.34); assert.equal(success.transfer.amount, 12.34); assert.equal(success.balances[0].balance, 87.66);
  for (const broken of [null, {}, { transfer: row, balances: [{ id: a, balance: 87.66 }] }, { transfer: row, balances: [{ id: a, balance: 87.66 }, { id: a, balance: 32.34 }] },
    { transfer: { ...row, id: b }, balances: response().balances }, { transfer: row, balances: [{ id: a, balance: NaN }, { id: b, balance: 32.34 }] }]) {
    assert.ok((await persistCardTransfer({ rpc: async () => ({ data: broken, error: null }) }, input, id)).error, 'partial/malformed response never reports success');
  }
  for (const [code, fragment] of [['ZERO_TRANSFER_INSUFFICIENT_FUNDS', 'saldo'], ['ZERO_TRANSFER_CARD_UNAVAILABLE', 'carte'], ['ZERO_TRANSFER_AUTH_REQUIRED', 'Accedi'], ['ZERO_TRANSFER_REQUEST_CONFLICT', 'dati diversi']]) {
    const result = await persistCardTransfer({ rpc: async () => ({ data: null, error: { message: code } }) }, input, id); assert.ok(result.error.includes(fragment));
  }
  let attempts = 0; const ids = [];
  const lost = { rpc: async (_name, args) => { ids.push(args.p_request_id); if (++attempts === 1) throw Error('lost after commit'); return { data: response(), error: null }; } };
  assert.ok((await persistCardTransfer(lost, input, id)).error);
  assert.equal((await persistCardTransfer(lost, input, id)).transfer.id, id); assert.deepEqual(ids, [id, id], 'retry keeps the idempotent request ID');
  const deletedResponse = response(); deletedResponse.transfer.from_card_id = null; deletedResponse.balances.shift();
  assert.equal((await persistCardTransfer({ rpc: async () => ({ data: deletedResponse, error: null }) }, input, id)).transfer.fromCardId, null);
  console.log('PASS transfer validation, deleted-card history, one atomic RPC, confirmed-only balances, honest errors and stable retry identity.');
})().catch(error => { console.error(error); process.exitCode = 1; });
