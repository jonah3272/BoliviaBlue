const {
  STALE_MS,
  createSupabaseClient,
  refreshBlueFromBinance,
  isRateStale,
} = require('./_lib/binanceRefresh');
const { attachOfficial } = require('./_lib/officialRate');

/** Last cross-source platforms seen on refresh (per serverless instance) */
let lastSourcesUsed = ['binance'];
let lastEurDerivation = null;

function toPayload(data, extras = {}) {
  const sources = lastSourcesUsed.length ? lastSourcesUsed : ['binance'];
  const generatedAt = extras.generated_at_iso || new Date().toISOString();
  const hasEur = data.buy_bob_per_eur != null && data.sell_bob_per_eur != null;
  const eurDerivation =
    extras.eur_derivation ||
    lastEurDerivation ||
    (hasEur ? 'usdt-cross' : null);
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
    updated_at_iso: data.t,
    generated_at_iso: generatedAt,
    eur_updated_at_iso: data.eur_updated_at_iso || (hasEur ? data.t : null),
    is_stale: isRateStale(data.t, STALE_MS),
    eur_derivation: eurDerivation,
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
          const { row, sourcesUsed, eurDerivation } = await refreshBlueFromBinance(supabase);
          if (sourcesUsed?.length) lastSourcesUsed = sourcesUsed;
          if (eurDerivation) lastEurDerivation = eurDerivation;
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

    if (data.buy_bob_per_eur == null || data.sell_bob_per_eur == null) {
      try {
        const { data: lastEur } = await supabase
          .from('rates')
          .select('buy_bob_per_eur, sell_bob_per_eur, t')
          .not('buy_bob_per_eur', 'is', null)
          .not('sell_bob_per_eur', 'is', null)
          .order('t', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastEur?.buy_bob_per_eur != null && lastEur?.sell_bob_per_eur != null) {
          data = {
            ...data,
            buy_bob_per_eur: lastEur.buy_bob_per_eur,
            sell_bob_per_eur: lastEur.sell_bob_per_eur,
            eur_updated_at_iso: lastEur.t,
          };
          lastEurDerivation = 'usdt-cross-last-valid';
        }
      } catch {
        /* keep USD row even if EUR lookup fails */
      }
    }

    data = await attachOfficial(data, supabase);

    return res.status(200).json(toPayload(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
