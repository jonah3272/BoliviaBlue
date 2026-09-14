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

function toPayload(data, extras = {}) {
  const sources = lastSourcesUsed.length ? lastSourcesUsed : ['binance'];
  const generatedAt = extras.generated_at_iso || new Date().toISOString();
  const hasEur = data.buy_bob_per_eur != null && data.sell_bob_per_eur != null;
  const hasCop = data.buy_bob_per_cop != null && data.sell_bob_per_cop != null;
  const eurDerivation =
    extras.eur_derivation ||
    lastEurDerivation ||
    (hasEur ? 'usdt-cross' : null);
  const copDerivation =
    extras.cop_derivation ||
    lastCopDerivation ||
    (hasCop ? 'p2p-usdt' : null);
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
    updated_at_iso: data.t,
    generated_at_iso: generatedAt,
    eur_updated_at_iso: data.eur_updated_at_iso || (hasEur ? data.t : null),
    cop_updated_at_iso: data.cop_updated_at_iso || (hasCop ? data.t : null),
    is_stale: isRateStale(data.t, STALE_MS),
    eur_derivation: eurDerivation,
    cop_derivation: copDerivation,
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
          const { row, sourcesUsed, eurDerivation, copDerivation } = await refreshBlueFromBinance(supabase);
          if (sourcesUsed?.length) lastSourcesUsed = sourcesUsed;
          if (eurDerivation) lastEurDerivation = eurDerivation;
          if (copDerivation) lastCopDerivation = copDerivation;
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

    if (data.buy_bob_per_cop == null || data.sell_bob_per_cop == null) {
      try {
        const { data: lastCop } = await supabase
          .from('rates')
          .select('buy_bob_per_cop, sell_bob_per_cop, t')
          .not('buy_bob_per_cop', 'is', null)
          .not('sell_bob_per_cop', 'is', null)
          .order('t', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastCop?.buy_bob_per_cop != null && lastCop?.sell_bob_per_cop != null) {
          data = {
            ...data,
            buy_bob_per_cop: lastCop.buy_bob_per_cop,
            sell_bob_per_cop: lastCop.sell_bob_per_cop,
            cop_updated_at_iso: lastCop.t,
          };
          lastCopDerivation = 'usdt-cross-last-valid';
        }
      } catch {
        /* keep USD row even if COP lookup fails */
      }
    }

    data = await attachOfficial(data, supabase);
    // Blue can be fresh while Wise/card still sits on this morning's snapshot.
    await attachFreshCardRate(supabase);

    return res.status(200).json(toPayload(data));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
