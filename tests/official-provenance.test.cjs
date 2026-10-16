const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createRequire } = require('node:module');
const p = require('../shared/officialProvenance.cjs');
const resolver = require('../shared/officialRate.cjs');
const source = require('../shared/rateProvenance.cjs');
const root = path.resolve(__dirname, '..');
const at = '2026-10-16T21:00:00.000Z', now = () => Date.parse(at);
const html = (value = '11,68', date = '2026-10-16') => `<article class="bcb-kpi2-card is-tc-oficial"><time datetime="${date}">${date}</time><span class="bcb-tco-num">${value}</span></article>`;
const observed = () => p.createOfficialObservation({ buy: 11.68, sell: 11.68, source_date: '2026-10-16' }, at);
const row = () => ({ t: at, official_buy: Math.fround(11.68), official_sell: Math.fround(11.68), official_mid: Math.fround(11.68), official_observation: observed() });
const db = (rows = [], error = null) => {
  const q = { select: () => q, not: () => q, order: () => q, limit: async () => ({ data: rows, error }) };
  return { from: name => { assert.equal(name, 'rates'); return q; } };
};
beforeEach(() => resolver.resetOfficialCache());

test('dated BCB board returns one unmodified value and original evidence; only BCB is requested', async () => {
  const urls = [];
  const result = await resolver.resolveOfficialRate(null, { now, fetchImpl: async url => { urls.push(url); return { ok: true, text: async () => html() }; } });
  assert.deepEqual(urls, [p.BCB_HOME_URL]);
  assert.equal(result.official_buy, 11.68); assert.equal(result.official_sell, 11.68); assert.equal(result.official_mid, 11.68);
  assert.equal(result.official_source, 'bcb'); assert.equal(result.official_status, 'verified');
  assert.equal(result.official_observed_at, at); assert.equal(result.official_source_date, '2026-10-16');
});

test('empty, malformed, ambiguous, missing-date, and unrelated primary HTML fail closed', async () => {
  for (const body of ['', '12.03', '<h1>Tipo de cambio oficial Bs 12.03</h1>', html('12.03junk'), html('NaN'), html('0.00'), html('101.00'), html('11,68', '2026-02-31'), html().replace('<time', '<i').replace('</time>', '</i>'), html() + html(), html().replaceAll('class=', 'data-class='), html().replaceAll('datetime=', 'data-datetime='), html().replaceAll('is-tc-oficial', 'not-is-tc-oficial'), html().replaceAll('bcb-tco-num', 'not-bcb-tco-num')]) {
    assert.equal(resolver.parseBcbHomepage(body), null);
    const result = await resolver.resolveOfficialRate(null, { now, fetchImpl: async () => ({ ok: true, text: async () => body }) });
    assert.equal(result.official_status, 'unavailable'); assert.equal(result.official_mid, null);
  }
});

test('BCB timeout, HTTP error, empty response and rejected lookup never consult external fallback or fabricate spread', async () => {
  for (const fetchImpl of [async () => { throw new Error('The operation was aborted.'); }, async () => ({ ok: false, status: 503 }), async () => ({ ok: true, text: async () => '' })]) {
    const result = await resolver.resolveOfficialRate(db([{ official_buy: 12.08, official_sell: 11.98, official_mid: 12.03 }]), { now, fetchImpl });
    assert.equal(result.official_buy, null); assert.equal(result.official_sell, null); assert.equal(result.official_mid, null); assert.equal(result.official_status, 'unavailable');
  }
  const result = await resolver.resolveOfficialRate(db([], new Error('DB unavailable')), { now, fetchImpl: async () => { throw Error('BCB unavailable'); } });
  assert.equal(result.official_mid, null);
});

test('last verified BCB preserves original date and observation time even with a fresh P2P timestamp', async () => {
  const stored = { ...row(), t: '2026-10-17T15:00:00Z' };
  const later = () => Date.parse('2026-10-17T15:00:00Z');
  const result = await resolver.resolveOfficialRate(db([stored]), { now: later, fetchImpl: async () => { throw Error('timeout'); } });
  assert.equal(result.official_status, 'stale'); assert.equal(result.official_buy, 11.68);
  assert.equal(result.official_observed_at, at); assert.equal(result.official_source_date, '2026-10-16');
  assert.equal(result.official_observation.observed_at, at);
});

test('in-memory BCB fallback is stale without resetting its time; a later successful fetch replaces it', async () => {
  await resolver.resolveOfficialRate(null, { now, fetchImpl: async () => ({ ok: true, text: async () => html() }) });
  const failed = await resolver.resolveOfficialRate(null, { now: () => now() + 1000, fetchImpl: async () => { throw Error('timeout'); } });
  assert.equal(failed.official_status, 'stale'); assert.equal(failed.official_observed_at, at);
  const live = await resolver.resolveOfficialRate(null, { now: () => now() + 2000, fetchImpl: async () => ({ ok: true, text: async () => html('11,69') }) });
  assert.equal(live.official_status, 'verified'); assert.equal(live.official_buy, 11.69); assert.notEqual(live.official_observed_at, at);
});

test('legacy, external, mismatched and malformed provenance never becomes verified BCB', () => {
  const base = row();
  for (const item of [
    { ...base, official_observation: null }, { ...base, official_observation: { ...observed(), source: 'exchangerate-api' } },
    { ...base, official_observation: { ...observed(), source_url: 'https://example.com/' } },
    { ...base, official_buy: 12.08 }, { ...base, official_mid: null },
    { ...base, official_observation: { ...observed(), source_date: '2026-02-31' } },
    { ...base, official_observation: { ...observed(), observed_at: '2026-02-31T21:00:00Z' } },
    { ...base, official_observation: { ...observed(), buy: '11.68' } },
  ]) { const result = p.officialPayload(item, { now: now() }); assert.equal(result.official_status, 'unverified'); assert.equal(result.official_buy, null); }
  assert.equal(p.officialPayload(base, { now: now() }).official_status, 'verified');
  assert.equal(p.officialPayload({ official_buy: null, official_sell: null }, { now: now() }).official_status, 'unavailable');
  assert.equal(p.officialPayload(base, { now: now() + 7 * 3600000 }).official_status, 'stale');
});

test('read attachment cannot fill missing values, write history, or transplant another observation', async () => {
  const { attachOfficial } = require('../api/_lib/officialRate');
  const forbiddenDb = { from() { throw Error('Reader must not access DB'); } };
  const result = await attachOfficial({ t: at, official_buy: null, official_sell: null }, forbiddenDb);
  assert.equal(result.official_mid, null); assert.equal(result.official_status, 'unavailable');
  assert.equal((await attachOfficial({ t: at, official_buy: 12.08, official_sell: 11.98 }, forbiddenDb)).official_status, 'unverified');
});

test('backend adapter and serverless adapter resolve the same official contract', async () => {
  const { getOfficialRate } = await import('../backend/officialRateClient.js');
  const a = await getOfficialRate(null, { now, fetchImpl: async () => ({ ok: true, text: async () => html() }) });
  const b = await require('../api/_lib/officialRate').resolveOfficialRate(null, { now, fetchImpl: async () => ({ ok: true, text: async () => html() }) });
  assert.deepEqual(a, b);
  const c = await getOfficialRate(null, { now, fetchImpl: async () => { throw Error('timeout'); } });
  assert.equal(c.official_status, 'stale');
});

test('serverless collector continues independent P2P and stores official unavailable or verified with separate provenance', async () => {
  const cross = { buy: 12, sell: 14, sources_used: ['binance'], platforms: [{ id: 'binance', buy: 12, sell: 14 }] };
  for (const official of [p.officialPayload({}), p.observationPayload(observed(), { now: now() })]) {
    const writes = [];
    const context = { module: { exports: {} }, console, Date, process: { env: {} }, fetch: async () => ({ ok: false }), require(name) {
      if (name.includes('rateProvenance')) return source;
      if (name === '@supabase/supabase-js') return {};
      if (name === './p2pCrossSource') return { fetchCrossSourceBobRates: async () => cross, fetchBinanceSide: async () => 4 };
      if (name === './fxDerive') return require('../api/_lib/fxDerive');
      if (name === './officialRate') return { resolveOfficialRate: async () => official };
      if (name === './cardRate') return { refreshCardRates: async () => null };
      throw Error(name);
    } };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'api/_lib/binanceRefresh.js'), 'utf8'), context);
    await context.module.exports.refreshBlueFromBinance({ from: () => ({ insert: async value => { writes.push(value); return { error: null }; } }) });
    const saved = writes[0]; assert.equal(saved.buy, 12); assert.equal(saved.sell, 14); assert.equal(source.sourcePayload(saved).source_count, 1);
    assert.equal(saved.official_mid, official.official_mid); assert.deepEqual(saved.official_observation, official.official_observation);
  }
});

test('backend refresh handles unavailable official without converting null midpoint to zero', async () => {
  const file = fs.readFileSync(path.join(root, 'backend/scheduler-supabase.js'), 'utf8');
  const fn = file.slice(file.indexOf('export async function refreshBlueRate()'), file.indexOf('/**\n * Fetch Visa'));
  const writes = [];
  const official = p.officialPayload({});
  const context = { module: { exports: {} }, console, Date, cache: {}, supabase: {}, median: xs => (xs[0] + xs[1]) / 2,
    getAllCurrentBlueRates: async () => ({ buy_bob_per_usd: 12, sell_bob_per_usd: 14, updated_at_iso: at }),
    getOfficialRate: async () => official, insertRate: async (...args) => { writes.push(args); return {}; }, refreshCardRates: async () => {}, checkAlerts: async () => {} };
  vm.runInNewContext(fn.replace('export async function', 'async function') + '\nmodule.exports = refreshBlueRate;', context);
  await context.module.exports();
  assert.equal(writes[0][3], 13); assert.equal(writes[0][6], null); assert.equal(writes[0][16].official_observation.status, 'unavailable');
  assert.equal(context.cache.latestRate.official_mid, null);
});

test('current API exposes normalized metadata; historical export retains raw legacy numbers with unverified status', async () => {
  const context = { module: { exports: {} }, console, Date, require(name) {
    if (name.includes('officialProvenance')) return p;
    if (name.includes('rateProvenance')) return source;
    return { STALE_MS: 1200000, isRateStale: () => false };
  } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'api/blue-rate.js'), 'utf8') + '\nmodule.exports.toPayload = toPayload;', context);
  const current = context.module.exports.toPayload({ ...row(), buy: 12, sell: 14 });
  assert.equal(current.official_observed_at, at); assert.equal(current.official_source_date, '2026-10-16');
  const legacy = { t: at, buy: 12, sell: 14, official_buy: 12.08, official_sell: 11.98, official_mid: 12.03 };
  assert.equal(context.module.exports.toPayload(legacy).official_buy, null);
  const { fetchHistoricalExport, exportOptions } = require('../api/_lib/historicalExport');
  const q = { select: () => q, lte: () => q, order: () => q, range: () => q, gte: () => q, then: resolve => Promise.resolve({ data: [legacy], error: null }).then(resolve) };
  const result = await fetchHistoricalExport({ from: () => q }, exportOptions({}, new Date(at)));
  assert.equal(result.points[0].official_buy, 12.08); assert.equal(result.points[0].official_sell, 11.98); assert.equal(result.points[0].official_status, 'unverified');
  assert.equal(result.points[0].official_observation.source, null);
});
