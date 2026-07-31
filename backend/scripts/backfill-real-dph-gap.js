/**
 * Replace the linear interpolated Railway downtime gap with real market history
 * from Dólar Paralelo Hoy's public API (Binance P2P aggregated + BCB official).
 *
 * Coverage:
 *   - 2026-07-01 → 2026-07-21: daily averages (high-res history not published)
 *   - 2026-07-22 → recovery: 10-minute snapshots
 *
 * Deletes prior interpolated rows (ms=350 cadence) in:
 *   2026-06-30T19:27Z → 2026-07-31T13:45Z
 *
 * Usage: node scripts/backfill-real-dph-gap.js [--dry-run]
 */
import { supabase } from '../db-supabase.js';

const DRY = process.argv.includes('--dry-run');
const DPH = 'https://dolarparalelohoy.com/api/rates/history';
const GAP_START = '2026-06-30T19:27:00.000Z';
const GAP_END = '2026-07-31T13:45:00.000Z'; // first real GitHub Action resume ~13:45:57

function round4(n) {
  return Math.round(Number(n) * 10000) / 10000;
}

function dayKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'BoliviaBlueBackfill/1.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ctype = res.headers.get('content-type') || '';
  if (!ctype.includes('json')) throw new Error(`Non-JSON from ${url}`);
  return res.json();
}

function rateRow(t, buy, sell, official) {
  const b = round4(buy);
  const s = round4(sell);
  const o = round4(official);
  return {
    t,
    buy: b,
    sell: s,
    mid: round4((b + s) / 2),
    official_buy: o,
    official_sell: o,
    official_mid: o
  };
}

async function deleteInterpolated() {
  const { count, error: cErr } = await supabase
    .from('rates')
    .select('*', { count: 'exact', head: true })
    .gte('t', GAP_START)
    .lt('t', GAP_END);
  if (cErr) throw cErr;
  console.log(`Rows in gap window: ${count}`);
  if (DRY || !count) return count || 0;

  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error(
      'Anon key cannot DELETE rates (RLS). Set SUPABASE_SERVICE_KEY in backend/.env, ' +
        'or run scripts/delete-interpolated-gap.sql in the Supabase SQL editor.'
    );
  }

  let deleted = 0;
  let cursor = new Date(GAP_START).getTime();
  const end = new Date(GAP_END).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  while (cursor < end) {
    const from = new Date(cursor).toISOString();
    const to = new Date(Math.min(cursor + DAY, end)).toISOString();
    const { error, count: dCount } = await supabase
      .from('rates')
      .delete({ count: 'exact' })
      .gte('t', from)
      .lt('t', to);
    if (error) throw error;
    deleted += dCount || 0;
    console.log(`Deleted ${deleted} … through ${to}`);
    cursor += DAY;
  }

  if (deleted === 0) {
    throw new Error(
      'Delete matched 0 rows despite SERVICE_KEY. Run backend/scripts/delete-interpolated-gap.sql in SQL Editor.'
    );
  }
  return deleted;
}

async function main() {
  console.log('Fetching DPH parallel history (10m)…');
  const parallel = await fetchJson(
    `${DPH}?from=2026-06-30T00:00:00.000Z&to=2026-07-31T13:45:00.000Z&interval=10m`
  );
  console.log('Fetching DPH official daily…');
  const officialHist = await fetchJson(
    `${DPH}?from=2026-06-01T00:00:00.000Z&to=2026-07-31T23:59:59.000Z&interval=1h&kind=OFICIAL`
  );

  const officialByDay = new Map();
  for (const d of officialHist.data || []) {
    officialByDay.set(dayKey(d.date), Number(d.buy_avg));
  }

  const rows = [];

  // Daily anchors for days before high-res series exists
  for (const d of parallel.data || []) {
    const day = dayKey(d.date);
    if (day < '2026-07-01' || day > '2026-07-21') continue;
    const buy = Number(d.buy_avg);
    const sell = Number(d.sell_avg);
    if (!Number.isFinite(buy) || !Number.isFinite(sell)) continue;
    const official = officialByDay.get(day);
    if (!Number.isFinite(official)) {
      console.warn(`No official for ${day}, skipping day`);
      continue;
    }
    // Noon UTC — one real daily print so charts show the true path, not a fake ramp
    rows.push(rateRow(`${day}T16:00:00.000Z`, buy, sell, official));
  }

  // High-res from ~Jul 22 until just before our live resume
  const gapEndMs = new Date(GAP_END).getTime();
  for (const p of parallel.series || []) {
    const ts = new Date(p.t).getTime();
    if (ts < new Date('2026-07-22T00:00:00Z').getTime()) continue;
    if (ts >= gapEndMs) continue;
    const buy = Number(p.parallel_buy);
    const sell = Number(p.parallel_sell);
    const official = Number(p.official_bcb);
    if (![buy, sell, official].every(Number.isFinite)) continue;
    rows.push(rateRow(p.t, buy, sell, official));
  }

  // De-dupe by timestamp
  const byT = new Map();
  for (const r of rows) byT.set(r.t, r);
  const unique = [...byT.values()].sort((a, b) => a.t.localeCompare(b.t));

  console.log(
    `Prepared ${unique.length} real points ` +
      `(daily ${unique.filter((r) => r.t.includes('T16:00:00')).length}, ` +
      `intraday ${unique.filter((r) => !r.t.includes('T16:00:00')).length})`
  );
  if (unique.length) {
    console.log('First:', unique[0]);
    console.log('Last:', unique[unique.length - 1]);
  }

  const removed = await deleteInterpolated();
  console.log(`Deleted ${removed} interpolated rows${DRY ? ' (dry-run skipped write)' : ''}`);

  if (DRY) {
    console.log('Dry-run complete — no writes.');
    return;
  }

  const BATCH = 200;
  for (let i = 0; i < unique.length; i += BATCH) {
    const chunk = unique.slice(i, i + BATCH);
    const { error } = await supabase.from('rates').insert(chunk);
    if (error) throw error;
    console.log(`Inserted ${Math.min(i + BATCH, unique.length)} / ${unique.length}`);
  }

  // Fix early live-resume rows that still have exchangerate-api official ~11.5
  const { error: fixErr } = await supabase
    .from('rates')
    .update({
      official_buy: 12.15,
      official_sell: 12.15,
      official_mid: 12.15
    })
    .gte('t', '2026-07-31T13:45:00Z')
    .lt('t', '2026-07-31T14:30:00Z')
    .lt('official_buy', 12);
  if (fixErr) console.warn('Official fix warning:', fixErr.message);
  else console.log('Corrected early resume official → 12.15');

  console.log('Done. July gap now uses real DPH market history.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
