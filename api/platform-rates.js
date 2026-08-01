/**
 * GET /api/platform-rates
 * Live USDT/BOB compra/venta for platforms we can fetch directly.
 * - Binance P2P (adv search medians)
 * - El Dorado (public /api/prices)
 * Takenos / Airtm: no stable public quote API yet — returned without prices.
 */

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const ELDORADO_PRICES_URL = 'https://api.eldorado.io/api/prices';

function median(values) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

async function fetchBinanceSide(tradeType) {
  const res = await fetch(BINANCE_P2P_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      asset: 'USDT',
      fiat: 'BOB',
      tradeType,
      rows: 15,
      page: 1,
      merchantCheck: false,
      payTypes: [],
    }),
  });
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const data = await res.json();
  const prices = (data.data || [])
    .map((row) => parseFloat(row.adv?.price))
    .filter((n) => Number.isFinite(n));
  return median(prices);
}

async function fetchBinance() {
  const [buy, sell] = await Promise.all([
    fetchBinanceSide('BUY'),
    fetchBinanceSide('SELL'),
  ]);
  const mid =
    Number.isFinite(buy) && Number.isFinite(sell)
      ? (buy + sell) / 2
      : buy ?? sell ?? null;
  return {
    id: 'binance',
    name: 'Binance P2P',
    buy,
    sell,
    mid,
    live: Number.isFinite(buy) || Number.isFinite(sell),
    source: 'binance-p2p',
  };
}

async function fetchEldorado() {
  const res = await fetch(ELDORADO_PRICES_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`El Dorado HTTP ${res.status}`);
  const data = await res.json();
  const buy = parseFloat(data?.BUY?.BOB?.price);
  const sell = parseFloat(data?.SELL?.BOB?.price);
  const mid =
    Number.isFinite(buy) && Number.isFinite(sell)
      ? (buy + sell) / 2
      : buy ?? sell ?? null;
  return {
    id: 'eldorado',
    name: 'El Dorado',
    buy: Number.isFinite(buy) ? buy : null,
    sell: Number.isFinite(sell) ? sell : null,
    mid,
    live: Number.isFinite(buy) || Number.isFinite(sell),
    source: 'eldorado-api',
  };
}

function staticPartner(id, name) {
  return {
    id,
    name,
    buy: null,
    sell: null,
    mid: null,
    live: false,
    source: null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const settled = await Promise.allSettled([fetchEldorado(), fetchBinance()]);
  const platforms = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') platforms.push(result.value);
  }

  // Keep referral partners in the board even without a public rate API yet
  const have = new Set(platforms.map((p) => p.id));
  if (!have.has('takenos')) platforms.push(staticPartner('takenos', 'Takenos'));
  if (!have.has('airtm')) platforms.push(staticPartner('airtm', 'Airtm'));

  // Preferred display order (matches competitor “recomendadas”)
  const order = ['eldorado', 'takenos', 'airtm', 'binance'];
  platforms.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  const verifiedAt = new Date().toISOString();
  return res.status(200).json({
    verified_at: verifiedAt,
    asset: 'USDT',
    fiat: 'BOB',
    platforms,
  });
};
