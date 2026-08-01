const { createClient } = require('@supabase/supabase-js');

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env on Vercel');
  return createClient(url, key);
}

function authorized(req) {
  const secret = process.env.CRON_SECRET || process.env.RATE_REFRESH_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const queryKey = typeof req.query?.key === 'string' ? req.query.key : '';
  return bearer === secret || queryKey === secret;
}

function median(values) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

async function fetchP2P(tradeType, fiat = 'BOB', rows = 20) {
  const res = await fetch(BINANCE_P2P_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      asset: 'USDT',
      fiat,
      tradeType,
      rows,
      page: 1,
      merchantCheck: false,
      payTypes: [],
    }),
  });
  if (!res.ok) throw new Error(`Binance P2P HTTP ${res.status}`);
  const data = await res.json();
  const prices = (data.data || [])
    .map((row) => parseFloat(row.adv?.price))
    .filter((n) => Number.isFinite(n));
  return prices;
}

async function getOfficialFallback(supabase) {
  const { data } = await supabase
    .from('rates')
    .select('official_buy, official_sell, official_mid')
    .order('t', { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    official_buy: data?.official_buy ?? null,
    official_sell: data?.official_sell ?? null,
    official_mid: data?.official_mid ?? null,
  };
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
    const supabase = client();
    const [buyPrices, sellPrices] = await Promise.all([
      fetchP2P('BUY', 'BOB'),
      fetchP2P('SELL', 'BOB'),
    ]);
    const buy = median(buyPrices);
    const sell = median(sellPrices);
    if (buy == null || sell == null) {
      return res.status(502).json({ error: 'Insufficient Binance P2P data' });
    }

    let buyBrl = null;
    let sellBrl = null;
    let buyEur = null;
    let sellEur = null;
    try {
      const [brlBuy, brlSell] = await Promise.all([
        fetchP2P('BUY', 'BRL'),
        fetchP2P('SELL', 'BRL'),
      ]);
      const bb = median(brlBuy);
      const bs = median(brlSell);
      if (bb && bs) {
        buyBrl = buy / bb;
        sellBrl = sell / bs;
      }
    } catch {
      /* optional */
    }
    try {
      const [eurBuy, eurSell] = await Promise.all([
        fetchP2P('BUY', 'EUR'),
        fetchP2P('SELL', 'EUR'),
      ]);
      const eb = median(eurBuy);
      const es = median(eurSell);
      if (eb && es) {
        buyEur = buy / eb;
        sellEur = sell / es;
      }
    } catch {
      /* optional */
    }

    const official = await getOfficialFallback(supabase);
    const mid = (buy + sell) / 2;
    const nowIso = new Date().toISOString();
    const row = {
      t: nowIso,
      buy,
      sell,
      mid,
      official_buy: official.official_buy,
      official_sell: official.official_sell,
      official_mid: official.official_mid,
      buy_bob_per_brl: buyBrl,
      sell_bob_per_brl: sellBrl,
      mid_bob_per_brl: buyBrl != null && sellBrl != null ? (buyBrl + sellBrl) / 2 : null,
      buy_bob_per_eur: buyEur,
      sell_bob_per_eur: sellEur,
      mid_bob_per_eur: buyEur != null && sellEur != null ? (buyEur + sellEur) / 2 : null,
    };

    const { error } = await supabase.from('rates').insert(row);
    if (error) throw error;

    return res.status(200).json({
      ok: true,
      source: 'binance-p2p',
      buy_bob_per_usd: buy,
      sell_bob_per_usd: sell,
      updated_at_iso: nowIso,
      samples: { buy: buyPrices.slice(0, 5), sell: sellPrices.slice(0, 5) },
    });
  } catch (err) {
    console.error('[refresh-rates]', err);
    return res.status(500).json({ error: 'Refresh failed', message: err.message });
  }
};
