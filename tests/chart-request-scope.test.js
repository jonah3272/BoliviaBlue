import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../frontend/src/components/BlueChart.jsx', import.meta.url), 'utf8');
// Exercise the existing loading effect without a DOM or live API. Chart drawing
// is independent of request selection and is covered by the React review.
const effect = source.match(/useEffect\(\(\) => \{\s*const loadData = async \(\) => \{[\s\S]*?\}, \[range, language, showOfficial, currency\]\);/)[0];
const points = [
  { t: '2026-10-01T12:00:00Z', buy: 11, sell: 12, mid: 11.5, official_buy: 6, official_sell: 7 },
  { t: '2026-10-02T12:00:00Z', buy: 12, sell: 13, mid: 12.5, official_buy: 6.5, official_sell: 7.5 },
];

async function load({ range = '1W', currency = 'USD', language = 'es', showOfficial = false, rows = points, failure = null } = {}) {
  const requests = []; const state = {}; const loading = [];
  let finished;
  const done = new Promise((resolve) => { finished = resolve; });
  const context = {
    range, currency, language, showOfficial, console: { log() {}, error() {} },
    useEffect: (callback) => callback(),
    fetchBlueHistory: async (...args) => { requests.push(args); if (failure) throw failure; return { points: rows }; },
    setIsLoading: (value) => { loading.push(value); if (!value) finished(); },
    setError: (value) => { state.error = value; },
    setRawData: (value) => { state.rawData = value; },
    setStats: (value) => { state.stats = value; },
    setData: (value) => { state.data = value; },
    setUniqueDateIndices: (value) => { state.dateIndices = value; },
    setDataAge: (value) => { state.unusedAge = value; },
  };
  vm.runInNewContext(effect, context);
  await done;
  await Promise.resolve();
  return { requests, state, loading };
}

describe('chart requests only the selected period', () => {
  it('loads the default week without a background full-history request', async () => {
    assert.match(source, /\[range, setRange\] = useState\('1W'\)/);
    const result = await load();
    assert.deepEqual(result.requests, [['1W', 'USD']]);
    assert.deepEqual(result.loading, [true, false]);
    assert.equal(result.state.stats.points, 2);
    assert.equal(result.state.stats.latestBuy, 12);
    assert.equal(result.state.stats.latestSell, 13);
    assert.equal(result.state.rawData, points);
    assert.equal(result.state.error, null);
    assert.equal('unusedAge' in result.state, false);
  });
  it('retains every explicit period, selected currency, locale and official series', async () => {
    for (const range of ['1D', '1W', '1M', '1Y', 'ALL']) for (const currency of ['USD', 'EUR']) for (const language of ['es', 'en']) for (const showOfficial of [false, true]) {
      const { requests, state } = await load({ range, currency, language, showOfficial });
      assert.deepEqual(requests, [[range, currency]]);
      assert.equal(state.data.length, 2);
      assert.equal(state.stats.latestBuy, showOfficial ? 6.5 : 12);
      assert.equal(state.data[0].buy, showOfficial ? 6 : 11);
      assert.equal(state.stats.points, 2);
      assert.equal(state.error, null);
      if (range === 'ALL') assert.equal(state.dateIndices.length, 2);
    }
    assert.match(source, /value: 'ALL'/);
    assert.match(source, /onClick=\{\(\) => selectRange\(value, false\)\}/);
  });
  it('preserves empty and failed-load states without unrelated requests', async () => {
    const empty = await load({ rows: [] });
    assert.deepEqual(empty.requests, [['1W', 'USD']]);
    assert.equal(empty.state.data.length, 0);
    assert.equal(empty.state.stats.points, 0);
    assert.equal(empty.state.error, null);
    const failed = await load({ failure: new Error('fixture unavailable') });
    assert.deepEqual(failed.requests, [['1W', 'USD']]);
    assert.equal(failed.state.error, 'fixture unavailable');
    assert.deepEqual(failed.loading, [true, false]);
  });
});
