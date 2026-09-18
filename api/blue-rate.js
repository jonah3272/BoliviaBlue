const {
  STALE_MS,
  createSupabaseClient,
  refreshBlueFromBinance,
  isRateStale,
} = require('./_lib/binanceRefresh');
const { attachOfficial } = require('./_lib/officialRate');
const { attachFreshCardRate, toPayload: toCardPayload } = require('./_lib/cardRate');

/** Last cross-source platforms seen on refresh (per serverless instance) */
let lastSourcesUsed = ['binance'];
let lastEurDerivation = null;
let lastCopDerivation = null;
let lastPenDerivation = null;
let lastArsDerivation = null;
let lastClpDerivation = null;

const LAST_VALID_PAIRS = [
  {
    buy: 'buy_bob_per_eur',
    sell: 'sell_bob_per_eur',
    iso: 'eur_updated_at_iso',
    setDeriv: () => { lastEurDerivation = 'usdt-cross-last-valid'; },
  },
  {
    buy: 'buy_bob_per_cop',
    sell: 'sell_bob_per_cop',
    iso: 'cop_updated_at_iso',
    setDeriv: () => { lastCopDerivation = 'usdt-cross-last-valid'; },
  },
  {
    buy: 'buy_bob_per_pen',
    sell: 'sell_bob_per_pen',
    iso: 'pen_updated_at_iso',
    setDeriv: () => { lastPenDerivation = 'usdt-cross-last-valid'; },
  },
  {
    buy: 'buy_bob_per_ars',
    sell: 'sell_bob_per_ars',
    iso: 'ars_updated_at_iso',
    setDeriv: () => { lastArsDerivation = 'usdt-cross-last-valid'; },
  },
  {
    buy: 'buy_bob_per_clp',
    sell: 'sell_bob_per_clp',
    iso: 'clp_updated_at_iso',
    setDeriv: () => { lastClpDerivation = 'usdt-cross-last-valid'; },
  },
];

async function attachLastValidPair(supabase, data, spec) {
  if (data[spec.buy] != null && data[spec.sell] != null) return data;
  try {
    const { data: last } = await supabase
      .from('rates')
      .select(`${spec.buy}, ${spec.sell}, t`)
      .not(spec.buy, 'is', null)
      .not(spec.sell, 'is', null)
      .order('t', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (last?.[spec.buy] != null && last?.[spec.sell] != null) {
      spec.setDeriv();
      return {
        ...data,
        [spec.buy]: last[spec.buy],
        [spec.sell]: last[spec.sell],
        [spec.iso]: last.t,
      };
    }
  } catch {
    /* keep USD row even if this fiat lookup fails */
  }
  return data;
}

function toPayload(data, extras = {}) {
  const sources = lastSourcesUsed.length ? lastSourcesUsed : ['binance'];
  const generatedAt = extras.generated_at_iso || new Date().toISOString();
  const hasEur = data.buy_bob_per_eur != null && data.sell_bob_per_eur != null;
  const hasCop = data.buy_bob_per_cop != null && data.sell_bob_per_cop != null;
  const hasPen = data.buy_bob_per_pen != null && data.sell_bob_per_pen != null;
  const hasArs = data.buy_bob_per_ars != null && data.sell_bob_per_ars != null;
  const hasClp = data.buy_bob_per_clp != null && data.sell_bob_per_clp != null;
  const eurDerivation =
    extras.eur_derivation ||
    lastEurDerivation ||
    (hasEur ? 'usdt-cross' : null);
  const copDerivation =
    extras.cop_derivation ||
    lastCopDerivation ||
    (hasCop ? 'p2p-usdt' : null);
  const penDerivation =
    extras.pen_derivation ||
    lastPenDerivation ||
    (hasPen ? 'p2p-usdt' : null);
  const arsDerivation =
    extras.ars_derivation ||
    lastArsDerivation ||
    (hasArs ? 'p2p-usdt' : null);
  const clpDerivation =
    extras.clp_derivation ||
    lastClpDerivation ||
    (hasClp ? 'p2p-usdt' : null);
  return {
    source: sources.length > 1 ? 'p2p-cross-median' : 'binance-p2p',
    sources_used: sources,
    source_count: sources.length,
    quote_kind: 'usdt_p2p_median',
    buy_bob_per_usd: data.buy,
    sell_bob_per_usd: data.sell,
    official_buy: data.official_buy,
    official_sell: data.official_sell,
    official_mid: data.official_mid,
    buy_bob_per_brl: data.buy_bob_per_brl,
    sell_bob_per_brl: data.sell_bob_per_brl,
    buy_bob_per_eur: data.buy_bob_per_eur,
    sell_bob_per_eur: data.sell_bob_per_eur,
    buy_bob_per_cop: data.buy_bob_per_cop,
    sell_bob_per_cop: data.sell_bob_per_cop,
    buy_bob_per_pen: data.buy_bob_per_pen,
    sell_bob_per_pen: data.sell_bob_per_pen,
    buy_bob_per_ars: data.buy_bob_per_ars,
    sell_bob_per_ars: data.sell_bob_per_ars,
    buy_bob_per_clp: data.buy_bob_per_clp,
    sell_bob_per_clp: data.sell_bob_per_clp,
    updated_at_iso: data.t,
    generated_at_iso: generatedAt,
    eur_updated_at_iso: data.eur_updated_at_iso || (hasEur ? data.t : null),
    cop_updated_at_iso: data.cop_updated_at_iso || (hasCop ? data.t : null),
    pen_updated_at_iso: data.pen_updated_at_iso || (hasPen ? data.t : null),
    ars_updated_at_iso: data.ars_updated_at_iso || (hasArs ? data.t : null),
    clp_updated_at_iso: data.clp_updated_at_iso || (hasClp ? data.t : null),
    is_stale: isRateStale(data.t, STALE_MS),
    eur_derivation: eurDerivation,
    cop_derivation: copDerivation,
    pen_derivation: penDerivation,
    ars_derivation: arsDerivation,
    clp_derivation: clpDerivation,
    sample_buy: [],
    sample_sell: [],
  };
}

/**
 * GET /api/blue-rate
 * Returns latest parallel rate. If the stored row is stale (>20m), refreshes
 * from Binance P2P first so traffic heals GHA cron drift without a secret.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createSupabaseClient();
    const view = String(req.query?.view || '').toLowerCase();
    if (view === 'card') {
      const row = await attachFreshCardRate(supabase);
      if (!row) {
        return res.status(503).json({ error: 'No card rate data available yet' });
      }
      return res.status(200).json(toCardPayload(row));
    }

    let { data, error } = await supabase
      .from('rates')
      .select('*')
      .order('t', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(503).json({
        error: 'No rate data available yet',
        message: error?.message || 'Empty rates table',
      });
    }

    if (isRateStale(data.t, STALE_MS)) {
      try {
        // Re-check age in case another instance just wrote.
        const { data: latest } = await supabase
          .from('rates')
          .select('t')
          .order('t', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (isRateStale(latest?.t, STALE_MS)) {
          const refreshed = await refreshBlueFromBinance(supabase);
          const { row, sourcesUsed } = refreshed;
          if (sourcesUsed?.length) lastSourcesUsed = sourcesUsed;
          if (refreshed.eurDerivation) lastEurDerivation = refreshed.eurDerivation;
          if (refreshed.copDerivation) lastCopDerivation = refreshed.copDerivation;
          if (refreshed.penDerivation) lastPenDerivation = refreshed.penDerivation;
          if (refreshed.arsDerivation) lastArsDerivation = refreshed.arsDerivation;
          if (refreshed.clpDerivation) lastClpDerivation = refreshed.clpDerivation;
          data = row;
        } else {
          const { data: fresh } = await supabase
            .from('rates')
            .select('*')
            .order('t', { ascending: false })
            .limit(1)
            .single();
          if (fresh) data = fresh;
        }
      } catch (healErr) {
        console.error('[blue-rate] self-heal failed:', healErr.message || healErr);
        // Fall through with stale row rather than 500ing the public API.
      }
    }

    for (const spec of LAST_VALID_PAIRS) {
      data = await attachLastValidPair(supabase, data, spec);
    }

    data = await attachOfficial(data, supabase);
    // Blue can be fresh while Wise/card still sits on this morning's snapshot.
    await attachFreshCardRate(supabase);

    return res.status(200).json(toPayload(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
