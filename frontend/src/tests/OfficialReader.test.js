import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ row: null, points: [], selections: [] }));
vi.mock('../utils/supabase', () => ({ supabase: { from: () => {
  let selection;
  const query = new Proxy({}, { get(_, key) {
    if (key === 'select') return value => { selection = value; mocks.selections.push(value); return query; };
    if (key === 'single') return async () => ({ data: mocks.row });
    if (key === 'maybeSingle') return async () => ({ data: null });
    if (key === 'then') return resolve => resolve({ data: selection?.startsWith('t,') ? mocks.points : null });
    return () => query;
  } });
  return query;
} } }));
vi.mock('../utils/logger', () => ({ default: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
const observedAt = new Date().toISOString();
const boardDate = new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10);
const values = { official_buy: 11.68, official_sell: 11.68, official_mid: 11.68 };
const observation = { version: 1, status: 'verified', source: 'bcb', source_url: 'https://www.bcb.gob.bo/', source_date: boardDate, observed_at: observedAt, buy: 11.68, sell: 11.68, mid: 11.68 };
const p2p = { t: observedAt, buy: 12.02, sell: 11.98, mid: 12, buy_bob_per_cop: .002, sell_bob_per_cop: .003, mid_bob_per_cop: .0025 };
beforeEach(() => { vi.resetModules(); mocks.selections = []; mocks.points = []; vi.unstubAllGlobals(); });

for (const status of ['verified', 'stale']) it(`direct Supabase ${status} metadata survives the current reader and USD history`, async () => {
  mocks.row = { ...p2p, ...values, official_observation: { ...observation, status } };
  mocks.points = [mocks.row];
  const { fetchBlueRate, fetchBlueHistory } = await import('../utils/api');
  const result = await fetchBlueRate();
  expect(result).toMatchObject({ ...values, official_status: status, official_source: 'bcb', official_source_date: boardDate, official_observed_at: observedAt });
  expect(result.official_observation).toEqual(mocks.row.official_observation);
  const { points } = await fetchBlueHistory('1D');
  expect(points[0].official_observation).toEqual(mocks.row.official_observation);
  expect(mocks.selections).toContain('t, buy, sell, mid, official_buy, official_sell, official_mid, official_observation');
});

for (const [label, fields, status] of [['missing', {}, 'unavailable'], ['legacy', values, 'unverified'], ['null', { official_buy: null, official_sell: null, official_mid: null }, 'unavailable']]) it(`${label} values remain unavailable without looking for arbitrary last-official rows`, async () => {
  mocks.row = { ...p2p, ...fields }; mocks.points = [mocks.row];
  const { fetchBlueRate, fetchBlueHistory } = await import('../utils/api');
  const result = await fetchBlueRate();
  expect(result).toMatchObject({ buy: 12.02, sell: 11.98, official_buy: null, official_sell: null, official_mid: null, official_status: status, official_source: null });
  expect(mocks.selections).not.toContain('official_buy, official_sell, official_mid');
  const { points } = await fetchBlueHistory('1D');
  expect(points[0]).toMatchObject({ official_buy: null, official_status: status });
});

for (const fields of [{ official_buy: null, official_sell: null, official_mid: null }, {}]) it('self-heal discards older official values when a new response is unavailable or omits them', async () => {
  mocks.row = { ...p2p, t: new Date(Date.now() - 3600000).toISOString(), ...values, official_observation: observation };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ buy_bob_per_usd: 12.02, sell_bob_per_usd: 11.98, updated_at_iso: observedAt, ...fields }) }));
  const { fetchBlueRate } = await import('../utils/api');
  expect(await fetchBlueRate()).toMatchObject({ official_buy: null, official_sell: null, official_mid: null, official_status: 'unavailable', official_source: null });
});

it('non-USD readers preserve actual BCB USD values, never fabricate official fiat crosses', async () => {
  mocks.row = { ...p2p, ...values, official_observation: observation };
  const { fetchBlueRate } = await import('../utils/api');
  const result = await fetchBlueRate('COP');
  expect(result).toMatchObject({ buy: .002, sell: .003, ...values, official_observation: observation });
});
