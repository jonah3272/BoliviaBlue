const {
  STALE_MS,
  createSupabaseClient,
  refreshBlueFromBinance,
  isRateStale,
} = require('./_lib/binanceRefresh');

/** Last cross-source platforms seen on refresh (per serverless instance) */
let lastSourcesUsed = ['binance'];

function toPayload(data) {
  const sources = lastSourcesUsed.length ? lastSourcesUsed : ['binance'];
  return {
    source: sources.length > 1 ? 'p2p-cross-median' : 'binance-p2p',
    sources_used: sources,
    source_count: sources.length,
    buy_bob_per_usd: data.buy,
    sell_bob_per_usd: data.sell,
    official_buy: data.official_buy,
    official_sell: data.official_sell,
    buy_bob_per_brl: data.buy_bob_per_brl,
    sell_bob_per_brl: data.sell_bob_per_brl,
    buy_bob_per_eur: data.buy_bob_per_eur,
    sell_bob_per_eur: data.sell_bob_per_eur,
    updated_at_iso: data.t,
    is_stale: isRateStale(data.t, STALE_MS),
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
          const { row, sourcesUsed } = await refreshBlueFromBinance(supabase);
          if (sourcesUsed?.length) lastSourcesUsed = sourcesUsed;
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

    return res.status(200).json(toPayload(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
