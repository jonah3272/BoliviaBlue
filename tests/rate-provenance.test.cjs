const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

describe('rate provenance', () => {
  it('reads persisted sources after a cold start and never assigns them to another observation', () => {
    const provenance = require('../shared/rateProvenance.cjs');
    const context = {
      module: { exports: {} }, console, Date,
      require: (name) => name.includes('rateProvenance') ? provenance : ({ STALE_MS: 1200000, isRateStale: () => false }),
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'api/blue-rate.js'), 'utf8') + '\nmodule.exports.test = { toPayload };', context);
    const { toPayload } = context.module.exports.test;
    const row = { t: '2026-10-03T12:00:00Z', buy: 12.34, sell: 12.56 };
    assert.equal(toPayload(row).source_provenance, 'unavailable_for_stored_row');
    row.source_observation = provenance.createSourceObservation({ ...row, platforms: [{ id: 'eldorado', buy: row.buy, sell: row.sell }] }, row.t);
    assert.equal(toPayload(row).source, 'eldorado-p2p');
    assert.equal(toPayload(row).source_provenance, 'persisted_observation');
    assert.equal(toPayload({ ...row, t: '2026-10-03T12:05:00Z' }).source_count, 0);
    assert.equal(toPayload({ ...row, t: '2026-10-03T12:00:00+00:00' }).source_count, 1);
  });
  it('the backend refresh uses the same cross-source USD/BOB collector and preserves conversion units', async () => {
    const source = fs.readFileSync(path.join(root, 'backend/p2pClient.js'), 'utf8');
    const start = source.indexOf('export async function getAllCurrentBlueRates()');
    const attachStart = source.indexOf('async function attachFiatCross(');
    const attachEnd = source.indexOf('\n/**', attachStart);
    let bobCalls = 0;
    const requestedFiats = [];
    const context = {
      module: { exports: {} }, console, Date,
      createSourceObservation: require('../shared/rateProvenance.cjs').createSourceObservation,
      fetchCrossSourceBobRates: async () => { bobCalls++; return { buy: 12, sell: 14, sources_used: ['binance', 'eldorado'], platforms: [{ id: 'binance', buy: 11, sell: 13 }, { id: 'eldorado', buy: 13, sell: 15 }] }; },
      getCurrentBlueRateForFiat: async (fiat) => { requestedFiats.push(fiat); return { buy: 4, sell: 5 }; },
      fetch: async () => { throw new Error('Unexpected network request'); },
    };
    vm.runInNewContext(source.slice(attachStart, attachEnd) + '\n' + source.slice(start).replace('export async function', 'async function') + '\nmodule.exports = getAllCurrentBlueRates;', context);
    const result = await context.module.exports();
    assert.equal(bobCalls, 1);
    assert.ok(!requestedFiats.includes('BOB'));
    assert.deepEqual(requestedFiats, ['BRL', 'EUR', 'COP', 'PEN', 'ARS', 'CLP']);
    assert.equal(result.buy_bob_per_usd, 12);
    assert.equal(result.sell_bob_per_usd, 14);
    assert.equal(result.source, 'p2p-cross-median');
    for (const fiat of ['brl', 'eur', 'cop', 'pen', 'ars', 'clp']) {
      assert.equal(result[`buy_bob_per_${fiat}`], 3);
      assert.equal(result[`sell_bob_per_${fiat}`], 2.8);
    }
    assert.match(fs.readFileSync(path.join(root, 'api/_lib/binanceRefresh.js'), 'utf8'), /await fetchCrossSourceBobRates\(\)/);
  });
  it('citation copy does not invent a platform list when provenance is missing', async () => {
    const { formatP2pSourceList } = await import('../frontend/src/utils/citationCopy.js');
    assert.equal(formatP2pSourceList([], 'en'), 'source composition not recorded');
    assert.equal(formatP2pSourceList(['eldorado'], 'en'), 'El Dorado');
    assert.equal(formatP2pSourceList(['binance', 'okx'], 'en'), 'Binance and OKX');
  });
});
