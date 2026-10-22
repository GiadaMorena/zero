const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict'), ts = require('typescript');
function fixture({ owner = true, registered = true, disabled = false, recent = false } = {}) {
  const callbacks = [], deliveries = [];
  const device = { endpoint: 'https://web.push.apple.com/test', keys: {} };
  const state = { devices: registered ? [device] : [], sent: recent ? [`test:${Date.now()}`] : [] };
  const admin = { from() { const query = { select: () => query, eq: () => query, single: async () => ({ data: { notifications_enabled: !disabled } }) }; return query; } };
  const helpers = { noCache: {}, authenticatedUser: async () => owner ? { admin, user: { id: 'owner' } } : null, readPushState: async () => structuredClone(state), writePushState: async (_admin, _id, value) => Object.assign(state, value) };
  const sender = { setVapidDetails() {}, sendNotification: async (target, payload) => deliveries.push({ target, payload: JSON.parse(payload) }) };
  const imports = { 'next/server': { after: callback => callbacks.push(callback) }, 'web-push': { __esModule: true, default: sender }, '@/lib/subscriptionReminderServer': helpers };
  const scope = { exports: {}, require: name => imports[name], Response, Date, setTimeout: callback => callback(), console, process: { env: { VAPID_PUBLIC_KEY: 'public', VAPID_PRIVATE_KEY: 'private', CRON_SECRET: 'cron' } } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/api/push/test/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, scope);
  return { route: scope.exports, callbacks, deliveries, state };
}
const request = endpoint => new Request('https://example.invalid/api/push/test', { method: 'POST', body: JSON.stringify({ endpoint: endpoint || 'https://web.push.apple.com/test' }) });
(async () => {
  const anonymous = fixture({ owner: false }); assert.equal((await anonymous.route.POST(request())).status, 401); assert.equal(anonymous.callbacks.length, 0);
  const missing = fixture({ registered: false }); assert.equal((await missing.route.POST(request())).status, 404);
  const other = fixture(); assert.equal((await other.route.POST(request('https://web.push.apple.com/other-user'))).status, 404); assert.equal(other.callbacks.length, 0);
  const rate = fixture({ recent: true }); assert.equal((await rate.route.POST(request())).status, 429);
  const valid = fixture(); assert.equal((await valid.route.POST(request())).status, 202); assert.equal(valid.deliveries.length, 0, 'No notification before response/background task'); await valid.callbacks[0](); assert.equal(valid.deliveries.length, 1); assert.equal(valid.deliveries[0].payload.title, 'Prova notifiche ZERO');
  const logout = fixture(); await logout.route.POST(request()); logout.state.devices = []; await logout.callbacks[0](); assert.equal(logout.deliveries.length, 0, 'No send after device is unregistered');
  const off = fixture({ disabled: true }); await off.route.POST(request()); await off.callbacks[0](); assert.equal(off.deliveries.length, 0);
  console.log('PASS: delayed push test, own-device isolation, authentication, throttling, logout and reminder preference.');
})().catch(error => { console.error(error); process.exitCode = 1; });
