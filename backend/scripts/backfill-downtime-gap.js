/**
 * Backfill the Railway downtime gap so charts don't show a cliff.
 *
 * Gap found: 2026-06-30 ~19:27 UTC → 2026-07-31 ~13:45 UTC
 * We do NOT have real Binance P2P history for that window, so we insert
 * linear interpolations every 15 minutes between the last real point and
 * the first recovery point. Charts look continuous; treat as estimated.
 *
 * Usage: node scripts/backfill-downtime-gap.js [--dry-run]
 */
import { supabase } from '../db-supabase.js';

const STEP_MS = 15 * 60 * 1000;
const DRY = process.argv.includes('--dry-run');

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

async function main() {
  const { data: beforeRows, error: e1 } = await supabase
    .from('rates')
    .select('*')
    .lt('t', '2026-07-31T13:00:00Z')
    .order('t', { ascending: false })
    .limit(1);
  if (e1) throw e1;

  const { data: afterRows, error: e2 } = await supabase
    .from('rates')
    .select('*')
    .gte('t', '2026-07-31T13:00:00Z')
    .order('t', { ascending: true })
    .limit(1);
  if (e2) throw e2;

  const start = beforeRows?.[0];
  const end = afterRows?.[0];
  if (!start || !end) {
    throw new Error('Could not find gap endpoints');
  }

  const t0 = new Date(start.t).getTime();
  const t1 = new Date(end.t).getTime();
  const hours = (t1 - t0) / 3600000;
  console.log(`Gap: ${start.t} → ${end.t} (${hours.toFixed(1)} hours)`);
  console.log(`Blue ${start.buy}/${start.sell} → ${end.buy}/${end.sell}`);

  // Skip if somehow already dense
  const { count } = await supabase
    .from('rates')
    .select('*', { count: 'exact', head: true })
    .gt('t', start.t)
    .lt('t', end.t);
  if ((count || 0) > 100) {
    console.log(`Already have ${count} points in gap — aborting to avoid duplicates.`);
    process.exit(0);
  }

  const rows = [];
  for (let ts = t0 + STEP_MS; ts < t1; ts += STEP_MS) {
    const t = (ts - t0) / (t1 - t0);
    const buy = round4(lerp(start.buy, end.buy, t));
    const sell = round4(lerp(start.sell, end.sell, t));
    const mid = round4((buy + sell) / 2);
    const official_buy = round4(
      lerp(start.official_buy ?? start.buy, end.official_buy ?? end.buy, t)
    );
    const official_sell = round4(
      lerp(start.official_sell ?? start.sell, end.official_sell ?? end.sell, t)
    );
    const official_mid = round4((official_buy + official_sell) / 2);

    const row = {
      t: new Date(ts).toISOString(),
      buy,
      sell,
      mid,
      official_buy,
      official_sell,
      official_mid
    };

    // Optional FX fields if both endpoints have them
    if (start.buy_bob_per_brl != null && end.buy_bob_per_brl != null) {
      row.buy_bob_per_brl = round4(lerp(start.buy_bob_per_brl, end.buy_bob_per_brl, t));
      row.sell_bob_per_brl = round4(lerp(start.sell_bob_per_brl, end.sell_bob_per_brl, t));
      row.mid_bob_per_brl = round4((row.buy_bob_per_brl + row.sell_bob_per_brl) / 2);
    }
    if (start.buy_bob_per_eur != null && end.buy_bob_per_eur != null) {
      row.buy_bob_per_eur = round4(lerp(start.buy_bob_per_eur, end.buy_bob_per_eur, t));
      row.sell_bob_per_eur = round4(lerp(start.sell_bob_per_eur, end.sell_bob_per_eur, t));
      row.mid_bob_per_eur = round4((row.buy_bob_per_eur + row.sell_bob_per_eur) / 2);
    }

    rows.push(row);
  }

  console.log(`Will insert ${rows.length} interpolated points${DRY ? ' (dry-run)' : ''}`);
  if (DRY) {
    console.log('Sample:', rows[0], '...', rows[rows.length - 1]);
    return;
  }

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('rates').insert(chunk);
    if (error) throw error;
    console.log(`Inserted ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  // Fix early recovery rows that used bad exchangerate-api official (~11.5)
  const { error: fixErr } = await supabase
    .from('rates')
    .update({
      official_buy: 12.15,
      official_sell: 12.15,
      official_mid: 12.15
    })
    .gte('t', '2026-07-31T13:00:00Z')
    .lt('t', '2026-07-31T14:30:00Z')
    .lt('official_buy', 12);
  if (fixErr) console.warn('Official fix warning:', fixErr.message);
  else console.log('Corrected early recovery official rates toward BCB 12.15');

  console.log('Done. Charts should no longer cliff across July.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
