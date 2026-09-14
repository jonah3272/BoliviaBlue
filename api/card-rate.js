const { createSupabaseClient } = require('./_lib/binanceRefresh');
const { attachFreshCardRate, toPayload } = require('./_lib/cardRate');

/**
 * GET /api/card-rate
 * Latest Wise/card FX. If the stored row is stale (>20m), refreshes from
 * Wise rates/live first so traffic heals GHA cron drift without a secret.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createSupabaseClient();
    const row = await attachFreshCardRate(supabase);
    if (!row) {
      return res.status(503).json({
        error: 'No card rate data available yet',
      });
    }
    return res.status(200).json(toPayload(row));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
