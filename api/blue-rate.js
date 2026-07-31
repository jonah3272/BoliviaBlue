import { getSupabase, cors } from '../_lib/supabase.js';

const STALE_MS = 20 * 60 * 1000;

export default async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabase();
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

    const isStale = Date.now() - new Date(data.t).getTime() > STALE_MS;

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
      is_stale: isStale,
      sample_buy: [],
      sample_sell: []
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
