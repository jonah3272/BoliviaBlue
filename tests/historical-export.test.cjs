const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { exportOptions, fetchHistoricalExport, toCsv, isObservedRow } = require('../api/_lib/historicalExport');
const now = new Date('2026-10-03T12:00:00Z');
function fixture(count) {
  return Array.from({ length: count }, (_, i) => ({ t: new Date(now.getTime() - i * 60000).toISOString(), buy: 12.34, sell: 12.56, mid: 12.45, official_buy: 6.86, official_sell: 6.96, official_mid: 6.91 }));
}
function store(rows) {
  const requests = [];
  return {
    requests,
    from() {
      const filter = { order: [] };
      const q = {
        select(columns) { filter.columns = columns.split(','); return q; },
        lte(_key, value) { filter.end = value; return q; },
        gte(_key, value) { filter.start = value; return q; },
        order(key, options) { assert.equal(options.ascending, false); filter.order.push(key); return q; },
        range(start, end) { assert.ok(end - start < 1000); filter.offset = start; filter.last = end; return q; },
        then(resolve) {
          requests.push({ ...filter });
          const selected = rows.filter((r) => (!filter.start || r.t >= filter.start) && r.t <= filter.end).sort((a, b) => b.t.localeCompare(a.t) || (filter.order.includes('id') ? (b.id || 0) - (a.id || 0) : 0));
          return Promise.resolve({ data: selected.slice(filter.offset, filter.last + 1).map((r) => Object.fromEntries(filter.columns.map((key) => [key, r[key]]))), error: null }).then(resolve);
        },
      };
      return q;
    },
  };
}
describe('bounded historical export', () => {
  it('fetches every page beyond the Supabase 1000-row default', async () => {
    const db = store(fixture(2880));
    const result = await fetchHistoricalExport(db, exportOptions({}, now));
    assert.equal(result.count, 2880);
    assert.equal(db.requests.length, 3);
    assert.equal(result.metadata.truncated, false);
    assert.equal(result.points.at(-1).t, now.toISOString());
    assert.equal(result.points[0].t, fixture(2880).at(-1).t);
    assert.equal(result.metadata.source_provenance, 'unavailable_for_historical_rows');
  });
  it('uses a unique secondary order when timestamps tie across page boundaries', async () => {
    const rows = fixture(2300).map((r, i) => ({ ...r, id: i + 1, t: now.toISOString(), buy: i + 1 }));
    const db = store(rows);
    const result = await fetchHistoricalExport(db, exportOptions({}, now));
    assert.equal(result.count, 2300);
    assert.equal(new Set(result.points.map((r) => r.buy)).size, 2300);
    for (const request of db.requests) assert.deepEqual(request.order, ['t', 'id']);
    assert.equal(result.points[0].buy, 1);
    assert.equal(result.points.at(-1).buy, 2300);
    assert.ok(!('id' in result.points[0]));
  });
  it('keeps the newest 4000 in ascending order and discloses truncation', async () => {
    const result = await fetchHistoricalExport(store(fixture(9000)), exportOptions({ range: 'all', limit: 50000 }, now));
    assert.equal(result.count, 4000);
    assert.equal(result.metadata.truncated, true);
    assert.equal(result.metadata.limit, 4000);
    assert.equal(result.points[0].t, fixture(4000).at(-1).t);
    assert.equal(result.metadata.returned_end, now.toISOString());
  });
  it('does not report truncation at exactly the limit', async () => {
    const result = await fetchHistoricalExport(store(fixture(4000)), exportOptions({}, now));
    assert.equal(result.metadata.truncated, false);
    assert.equal(result.count, 4000);
  });
  it('enforces range dates, requested limit and a fixed snapshot upper bound', async () => {
    const rows = [...fixture(2500), { ...fixture(1)[0], t: '2025-01-01T00:00:00Z' }, { ...fixture(1)[0], t: '2027-01-01T00:00:00Z' }];
    const result = await fetchHistoricalExport(store(rows), exportOptions({ limit: 1250 }, now));
    assert.equal(result.count, 1250);
    assert.equal(result.metadata.truncated, true);
    assert.equal(result.metadata.returned_end, now.toISOString());
    assert.ok(result.points[0].t >= result.metadata.requested_start);
  });
  it('rejects unsupported ranges instead of silently returning 30d', () => {
    for (const range of ['90d', '1y', 'bad']) assert.throws(() => exportOptions({ range }, now), { statusCode: 400 });
    for (const limit of ['bad', 0, -5, 1.5]) assert.throws(() => exportOptions({ limit }, now), { statusCode: 400 });
  });
  it('keeps CSV columns and values compatible with the JSON points', async () => {
    const result = await fetchHistoricalExport(store(fixture(1201)), exportOptions({}, now));
    const lines = toCsv(result.points).trim().split('\n');
    assert.equal(lines[0], 't,buy,sell,mid,official_buy,official_sell,official_mid');
    assert.equal(lines.length - 1, result.count);
    assert.equal(lines[1].split(',')[0], result.points[0].t);
    assert.equal(Number(lines[1].split(',')[1]), result.points[0].buy);
  });
  it('keeps the existing interpolation exclusion without relabeling rows', () => {
    assert.equal(isObservedRow({ t: '2026-07-01T12:00:00.350Z' }), false);
    assert.equal(isObservedRow({ t: '2026-07-01T12:00:00.000Z' }), true);
    assert.equal(isObservedRow({ t: '2026-10-01T12:00:00.350Z' }), true);
  });
  it('supports the separate authenticated backend cap without weakening public limits', async () => {
    const options = { range: '90d', limit: 50000, requested_start: '2026-07-05T12:00:00.000Z', requested_end: now.toISOString() };
    const result = await fetchHistoricalExport(store(fixture(6200)), options);
    assert.equal(result.count, 6200);
    assert.equal(result.metadata.truncated, false);
    assert.equal(result.range, '90d');
    assert.equal(exportOptions({ limit: 50000 }, now).limit, 4000);
  });
});

it('public HTTP handler preserves JSON/CSV schemas and exposes coverage headers', async () => {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const path = require('node:path');
  const historical = require('../api/_lib/historicalExport');
  const latest = Date.now() - 60000;
  const rows = fixture(1201).map((r, i) => ({ ...r, t: new Date(latest - i * 60000).toISOString() }));
  const context = {
    module: { exports: {} }, process: { env: { SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_ANON_KEY: 'fixture' } },
    require: (name) => name === '@supabase/supabase-js' ? { createClient: () => store(rows) } : historical,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../api/historical-data.js'), 'utf8'), context);
  const handler = context.module.exports;
  function response() {
    return { headers: {}, code: 200, body: null, setHeader(k, v) { this.headers[k] = v; }, status(v) { this.code = v; return this; }, json(v) { this.body = v; return this; }, send(v) { this.body = v; return this; }, end() { return this; } };
  }
  const json = response();
  await handler({ method: 'GET', headers: {}, query: { range: '30d', format: 'json' }, url: '/api/historical-data.json' }, json);
  assert.equal(json.code, 200);
  assert.equal(json.body.count, 1201);
  assert.equal(json.body.points.at(-1).t, rows[0].t);
  assert.equal(json.headers['X-Data-Truncated'], 'false');
  const csv = response();
  await handler({ method: 'GET', headers: {}, query: { range: '30d', format: 'csv' }, url: '/api/historical-data.csv' }, csv);
  assert.equal(csv.body, historical.toCsv(json.body.points));
  assert.match(csv.headers['Access-Control-Expose-Headers'], /X-Data-Truncated/);
  const bad = response();
  await handler({ method: 'GET', headers: {}, query: { range: '90d' } }, bad);
  assert.equal(bad.code, 400);
});
