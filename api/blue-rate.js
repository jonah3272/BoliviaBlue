const { createClient } = require('@supabase/supabase-js');

const STALE_MS = 20 * 60 * 1000;

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env on Vercel');
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = client();
    const { data, error } = await supabase
      .from('rates')
      .select('*')
      .order('t', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(503).json({
        error: 'No rate data available yet',
        message: error?.message || 'Empty rates table'
      });
    }

    return res.status(200).json({
      source: 'binance-p2p',
      buy_bob_per_usd: data.buy,
      sell_bob_per_usd: data.sell,
      official_buy: data.official_buy,
      official_sell: data.official_sell,
      buy_bob_per_brl: data.buy_bob_per_brl,
      sell_bob_per_brl: data.sell_bob_per_brl,
      buy_bob_per_eur: data.buy_bob_per_eur,
      sell_bob_per_eur: data.sell_bob_per_eur,
      updated_at_iso: data.t,
      is_stale: Date.now() - new Date(data.t).getTime() > STALE_MS,
      sample_buy: [],
      sample_sell: []
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
