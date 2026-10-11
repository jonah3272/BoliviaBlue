const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const provenance = require('../shared/rateProvenance.cjs');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const now = '2026-10-11T06:00:00.000Z';
const quiet = { log() {}, warn() {}, error() {} };
const cross = {
  buy: 12,
  sell: 14,
  sources_used: ['binance', 'eldorado'],
  platforms: [
    { id: 'binance', buy: 11, sell: 13 },
    { id: 'eldorado', buy: 13, sell: 15 },
  ],
};
const official = { official_buy: 6.86, official_sell: 6.96, official_mid: 6.91 };
const validBrl = { BUY: ['4'], SELL: ['5'] };
const noBrl = { BUY: [], SELL: [] };

class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return Date.parse(now); }
}

// Resolve retry delays immediately, without firing the collector/reader timeouts.
function testTimeout(callback, delay) {
  if (delay < 10000) callback();
  return 0;
}

function quoteFetch(initialFixture) {
  let fixture = initialFixture;
  const requests = [];
  return {
    requests,
    setFixture(next) { fixture = next; },
    async fetch(url, options) {
      assert.equal(url, 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search');
      const body = JSON.parse(options.body);
      requests.push(body);
      assert.equal(body.asset, 'USDT');
      assert.notEqual(body.fiat, 'BOB', 'BOB must use the cross-source collector');
      const prices = body.fiat === 'BRL'
        ? fixture[body.tradeType]
        : [body.tradeType === 'BUY' ? '4' : '5'];
      if (prices instanceof Error) throw prices;
      if (prices?.status) return { ok: false, status: prices.status, statusText: 'Fixture failure' };
      return {
        ok: true,
        json: async () => ({ data: prices.map(price => ({ adv: { price } })) }),
      };
    },
  };
}

function backendWriter(fixture) {
  const quotes = quoteFetch(fixture);
  let bobCalls = 0;
  const collector = {
    module: { exports: {} }, console: quiet, Date: FixedDate, AbortController,
    setTimeout: testTimeout, clearTimeout() {}, fetch: quotes.fetch,
    createSourceObservation: provenance.createSourceObservation,
    fetchCrossSourceBobRates: async () => { bobCalls++; return cross; },
  };
  const medianSource = read('backend/median.js').replace(/^export /gm, '');
  const collectorSource = read('backend/p2pClient.js');
  vm.runInNewContext(
    medianSource + '\n' + collectorSource.slice(collectorSource.indexOf('const BINANCE_P2P_URL'))
      .replace(/^export /gm, '') + '\nmodule.exports = getAllCurrentBlueRates;',
    collector,
  );

  const writes = [];
  const writer = {
    module: { exports: {} }, console: quiet, LOCAL_MODE: false,
    readSourceObservation: provenance.readSourceObservation,
    supabase: {
      from(table) {
        assert.equal(table, 'rates');
        return {
          insert(value) {
            writes.push(value);
            return { select: () => ({ single: async () => ({ data: value, error: null }) }) };
          },
        };
      },
    },
  };
  const dbSource = read('backend/db-supabase.js');
  vm.runInNewContext(
    dbSource.slice(dbSource.indexOf('export async function insertRate'),
      dbSource.indexOf('/**\n * Get the most recent rate')).replace(/^export /gm, '')
      + '\nmodule.exports = insertRate;',
    writer,
  );

  const cache = {};
  const scheduler = {
    module: { exports: {} }, console: quiet, Date: FixedDate, cache,
    getAllCurrentBlueRates: collector.module.exports,
    getOfficialRate: async () => official,
    insertRate: writer.module.exports,
    refreshCardRates: async () => null,
    checkAlerts: async () => null,
  };
  const schedulerSource = read('backend/scheduler-supabase.js');
  vm.runInNewContext(
    medianSource + '\n' + schedulerSource.slice(schedulerSource.indexOf('export async function refreshBlueRate()'),
      schedulerSource.indexOf('/**\n * Fetch Visa')).replace(/^export /gm, '')
      + '\nmodule.exports = refreshBlueRate;',
    scheduler,
  );
  return {
    writes, cache, requests: quotes.requests, setFixture: quotes.setFixture,
    bobCalls: () => bobCalls,
    async refresh() {
      await scheduler.module.exports();
      return writes.at(-1);
    },
  };
}

function vercelWriter(fixture) {
  const quotes = quoteFetch(fixture);
  const p2p = { module: { exports: {} }, fetch: quotes.fetch };
  vm.runInNewContext(read('api/_lib/p2pCrossSource.js'), p2p);
  let bobCalls = 0;
  const writes = [];
  const supabase = {
    from(table) {
      assert.equal(table, 'rates');
      return { insert: async value => { writes.push(value); return { error: null }; } };
    },
  };
  const context = {
    module: { exports: {} }, console: quiet, Date: FixedDate, process: { env: {} },
    fetch: quotes.fetch,
    require(name) {
      if (name.includes('rateProvenance')) return provenance;
      if (name === '@supabase/supabase-js') return {};
      if (name === './p2pCrossSource') return {
        fetchBinanceSide: p2p.module.exports.fetchBinanceSide,
        fetchCrossSourceBobRates: async () => { bobCalls++; return cross; },
      };
      if (name === './fxDerive') return require('../api/_lib/fxDerive');
      if (name === './officialRate') return { resolveOfficialRate: async () => official };
      if (name === './cardRate') return { refreshCardRates: async () => null };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(read('api/_lib/binanceRefresh.js'), context);
  return {
    writes, requests: quotes.requests, setFixture: quotes.setFixture,
    bobCalls: () => bobCalls,
    async refresh() {
      const result = await context.module.exports.refreshBlueFromBinance(supabase);
      assert.equal(result.row, writes.at(-1));
      return result.row;
    },
  };
}

function assertRow(row, expectedBrl) {
  assert.deepEqual([row.buy_bob_per_brl, row.sell_bob_per_brl, row.mid_bob_per_brl], expectedBrl);
  assertUnchangedRates(row);
}

function assertUnchangedRates(row) {
  assert.deepEqual([row.buy, row.sell, row.mid], [12, 14, 13]);
  assert.deepEqual([row.buy_bob_per_eur, row.sell_bob_per_eur, row.mid_bob_per_eur], [3, 2.8, 2.9]);
  assert.deepEqual([row.official_buy, row.official_sell, row.official_mid], [6.86, 6.96, 6.91]);
  assert.equal(row.source_observation.observed_at, row.t);
  assert.equal(provenance.sourcePayload(row).source_count, 2);
  assert.deepEqual(provenance.sourcePayload(row).sources_used, cross.sources_used);
}

const missingFixtures = [
  ['empty buy book', { BUY: [], SELL: ['5'] }],
  ['empty sell book', { BUY: ['4'], SELL: [] }],
  ['both books empty', noBrl],
  ['zero buy median', { BUY: ['0'], SELL: ['5'] }],
  ['zero sell median', { BUY: ['4'], SELL: ['0'] }],
  ['negative buy median', { BUY: ['-4'], SELL: ['5'] }],
  ['negative sell median', { BUY: ['4'], SELL: ['-5'] }],
  ['non-finite prices', { BUY: ['NaN', 'Infinity', 'invalid'], SELL: ['5'] }],
  ['buy cross overflows from a finite positive divisor', { BUY: ['5e-324'], SELL: ['5'] }],
  ['sell cross overflows from a finite positive divisor', { BUY: ['4'], SELL: ['5e-324'] }],
  ['network rejection', { BUY: new Error('BRL fixture unavailable'), SELL: ['5'] }],
  ['HTTP failure', { BUY: ['4'], SELL: { status: 503 } }],
];

for (const [name, makeWriter] of [['backend', backendWriter], ['Vercel', vercelWriter]]) {
  test(`${name} persists the observed same-side BRL cross without sorting or forcing a spread`, async () => {
    const writer = makeWriter(validBrl);
    assertRow(await writer.refresh(), [3, 2.8, 2.9]);
    assert.equal(writer.writes.length, 1);
    assert.equal(writer.bobCalls(), 1);
    assert.deepEqual(writer.requests.filter(request => request.fiat === 'BRL')
      .map(request => request.tradeType).sort(), ['BUY', 'SELL']);
  });

  test(`${name} keeps a finite BRL midpoint when finite near-maximum crosses would overflow their sum`, async () => {
    const writer = makeWriter({ BUY: ['1e-307'], SELL: ['1e-307'] });
    const row = await writer.refresh();
    const buy = 12 / 1e-307;
    const sell = 14 / 1e-307;
    const expectedMid = buy / 2 + sell / 2;
    assert.equal(buy + sell, Infinity, 'the fixture must exercise sum overflow');
    assert.equal(row.buy_bob_per_brl, buy);
    assert.equal(row.sell_bob_per_brl, sell);
    assert.ok(Number.isFinite(row.mid_bob_per_brl));
    assert.ok(Math.abs(row.mid_bob_per_brl / expectedMid - 1) <= Number.EPSILON);
    assertUnchangedRates(row);
    assert.equal(writer.writes.length, 1);
  });

  for (const [reason, fixture] of missingFixtures) {
    test(`${name} persists null BRL and unchanged USD/EUR for ${reason}`, async () => {
      const writer = makeWriter(fixture);
      assertRow(await writer.refresh(), [null, null, null]);
      assert.equal(writer.writes.length, 1);
      assert.equal(writer.bobCalls(), 1);
    });
  }

  test(`${name} replaces a prior available BRL observation with null on the next failed refresh`, async () => {
    const writer = makeWriter(validBrl);
    assertRow(await writer.refresh(), [3, 2.8, 2.9]);
    writer.setFixture(noBrl);
    assertRow(await writer.refresh(), [null, null, null]);
    assert.equal(writer.writes.length, 2);
    assert.equal(writer.bobCalls(), 2);
    if (writer.cache) {
      assert.equal(writer.cache.latestRate.buy_bob_per_brl, null);
      assert.equal(writer.cache.latestRate.sell_bob_per_brl, null);
      assert.equal(writer.cache.isHealthy, true);
    }
  });
}

test('public API JSON preserves explicit BRL nulls from either writer', async () => {
  const context = {
    module: { exports: {} }, console: quiet, Date: FixedDate,
    require(name) {
      if (name.includes('rateProvenance')) return provenance;
      if (name === './_lib/binanceRefresh') return { STALE_MS: 1200000, isRateStale: () => false };
      if (name === './_lib/officialRate' || name === './_lib/cardRate') return {};
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(read('api/blue-rate.js') + '\nmodule.exports.toPayload = toPayload;', context);
  for (const makeWriter of [backendWriter, vercelWriter]) {
    const row = await makeWriter(noBrl).refresh();
    const payload = JSON.parse(JSON.stringify(context.module.exports.toPayload(row)));
    assert.equal(Object.hasOwn(payload, 'buy_bob_per_brl'), true);
    assert.equal(Object.hasOwn(payload, 'sell_bob_per_brl'), true);
    assert.equal(payload.buy_bob_per_brl, null);
    assert.equal(payload.sell_bob_per_brl, null);
    assert.equal(payload.buy_bob_per_usd, 12);
    assert.equal(payload.sell_bob_per_usd, 14);
    assert.equal(payload.buy_bob_per_eur, 3);
    assert.equal(payload.sell_bob_per_eur, 2.8);
    assert.equal(payload.source_count, 2);
  }
});

async function frontendReader(brlFields) {
  const { sourceObservationModel } = await import('../frontend/src/utils/sourceObservation.js');
  const oldTime = '2026-10-11T05:00:00.000Z';
  const old = {
    t: oldTime, buy: 12, sell: 14, mid: 13, ...official,
    buy_bob_per_brl: 2.4, sell_bob_per_brl: 2.41, mid_bob_per_brl: 2.405,
    buy_bob_per_eur: 3, sell_bob_per_eur: 2.8, mid_bob_per_eur: 2.9,
    source_observation: provenance.createSourceObservation(cross, oldTime),
  };
  const fresh = {
    updated_at_iso: now, buy_bob_per_usd: 12, sell_bob_per_usd: 14,
    buy_bob_per_eur: 3, sell_bob_per_eur: 2.8, ...official, ...brlFields,
    source_observation: provenance.createSourceObservation(cross, now),
  };
  const query = new Proxy({}, {
    get(_, key) {
      if (key === 'single') return async () => ({ data: old });
      if (key === 'maybeSingle') return async () => ({ data: null });
      return () => query;
    },
  });
  const context = {
    supabase: { from: () => query }, sourceObservationModel,
    logger: quiet, console: quiet, Date: FixedDate, setTimeout: testTimeout,
    fetch: async url => {
      assert.equal(url, '/api/blue-rate');
      return { ok: true, json: async () => fresh };
    },
  };
  vm.runInNewContext(read('frontend/src/utils/api.js')
    .replace(/^import .*;\n/gm, '').replace(/^export /gm, '')
    + '\nthis.fetchRate = fetchBlueRate;', context);
  return context.fetchRate;
}

for (const [name, fields] of [
  ['explicit nulls', { buy_bob_per_brl: null, sell_bob_per_brl: null }],
  ['omitted BRL fields', {}],
]) {
  test(`frontend self-heal discards prior BRL when the new observation has ${name}`, async () => {
    const fetchRate = await frontendReader(fields);
    const usd = await fetchRate('USD');
    assert.equal(usd.buy_bob_per_brl, null);
    assert.equal(usd.sell_bob_per_brl, null);
    assert.equal(usd.buy_bob_per_usd, 12);
    assert.equal(usd.sell_bob_per_usd, 14);
    assert.equal(usd.buy_bob_per_eur, 3);
    assert.equal(usd.sell_bob_per_eur, 2.8);
    assert.equal(usd.updated_at_iso, now);
    assert.equal(usd.source_count, 2);
    await assert.rejects(fetchRate('BRL'), /BRL rate data is not available/);
  });
}

test('frontend self-heal preserves a new real BRL pair and its same-side midpoint', async () => {
  const fetchRate = await frontendReader({ buy_bob_per_brl: 3, sell_bob_per_brl: 2.8 });
  const brl = await fetchRate('BRL');
  assert.deepEqual([brl.buy_bob_per_brl, brl.sell_bob_per_brl, brl.mid_bob_per_brl], [3, 2.8, 2.9]);
  assert.equal(brl.updated_at_iso, now);
});

test('frontend self-heal keeps a finite BRL midpoint when the sum alone would overflow', async () => {
  const fetchRate = await frontendReader({ buy_bob_per_brl: 1.2e308, sell_bob_per_brl: 1.4e308 });
  const brl = await fetchRate('BRL');
  assert.ok(Number.isFinite(brl.mid_bob_per_brl));
  assert.equal(brl.mid_bob_per_brl, 1.2e308 / 2 + 1.4e308 / 2);
});
