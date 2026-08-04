const {
  createSupabaseClient,
  refreshBlueFromBinance,
} = require('./_lib/binanceRefresh');

function authorized(req) {
  const secret = process.env.CRON_SECRET || process.env.RATE_REFRESH_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const queryKey = typeof req.query?.key === 'string' ? req.query.key : '';
  return bearer === secret || queryKey === secret;
}

/**
 * POST /api/refresh-rates
 * Auth: Authorization: Bearer $CRON_SECRET  (or ?key=)
 * Used as a reliable alternative when GitHub Actions cron drifts.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createSupabaseClient();
    const { row, buyPrices, sellPrices } = await refreshBlueFromBinance(supabase);

    return res.status(200).json({
      ok: true,
      source: 'binance-p2p',
      buy_bob_per_usd: row.buy,
      sell_bob_per_usd: row.sell,
      updated_at_iso: row.t,
      samples: { buy: buyPrices.slice(0, 5), sell: sellPrices.slice(0, 5) },
    });
  } catch (err) {
    console.error('[refresh-rates]', err);
    const status = err.statusCode === 502 ? 502 : 500;
    return res.status(status).json({
      error: status === 502 ? 'Insufficient Binance P2P data' : 'Refresh failed',
      message: err.message,
    });
  }
};
