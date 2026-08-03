/**
 * GET /api/platform-rates
 * Live BOB compra/venta for recommended platforms:
 * - Binance P2P (adv search medians)
 * - El Dorado (public /api/prices)
 * - Airtm (public rates.airtm.io bob/usd)
 * - Takenos (no first-party public quote API — market feed)
 */

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const ELDORADO_PRICES_URL = 'https://api.eldorado.io/api/prices';
const AIRTM_RATES_URL = 'https://rates.airtm.io/';
/** Takenos does not publish a stable public rate API; this feed is what public Bolivia rate boards use. */
const TAKENOS_MARKET_URL = 'https://api.dolarbluebolivia.click/v1/takenos';

function median(values) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function pack(id, name, buy, sell, source) {
  const b = Number.isFinite(buy) ? buy : null;
  const s = Number.isFinite(sell) ? sell : null;
  const mid = b != null && s != null ? (b + s) / 2 : b ?? s ?? null;
  return {
    id,
    name,
    buy: b,
    sell: s,
    mid,
    live: b != null || s != null,
    source,
  };
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
  return pack('binance', 'Binance P2P', buy, sell, 'binance-p2p');
}

async function fetchEldorado() {
  const res = await fetch(ELDORADO_PRICES_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`El Dorado HTTP ${res.status}`);
  const data = await res.json();
  const buy = parseFloat(data?.BUY?.BOB?.price);
  const sell = parseFloat(data?.SELL?.BOB?.price);
  return pack('eldorado', 'El Dorado', buy, sell, 'eldorado-api');
}

async function fetchAirtm() {
  const res = await fetch(AIRTM_RATES_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Airtm HTTP ${res.status}`);
  const data = await res.json();
  const bob = data?.data?.['bob/usd'];
  if (!bob) throw new Error('Airtm missing bob/usd');
  // addValue ≈ compra (BOB per USD when adding funds)
  // withdrawValue ≈ venta (BOB per USD when withdrawing)
  const buy = parseFloat(bob.addValue);
  const sell = parseFloat(bob.withdrawValue);
  return pack('airtm', 'Airtm', buy, sell, 'rates.airtm.io');
}

async function fetchTakenos() {
  const res = await fetch(TAKENOS_MARKET_URL, {
    headers: { Accept: 'application/json', 'User-Agent': 'BoliviaBlue/1.0' },
  });
  if (!res.ok) throw new Error(`Takenos feed HTTP ${res.status}`);
  const json = await res.json();
  const row = json?.data || json;
  const buy = parseFloat(row.buy);
  const sell = parseFloat(row.sell);
  if (!Number.isFinite(buy) && !Number.isFinite(sell)) {
    throw new Error('Takenos feed empty');
  }
  return pack('takenos', 'Takenos', buy, sell, 'takenos-market-feed');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const settled = await Promise.allSettled([
    fetchEldorado(),
    fetchTakenos(),
    fetchAirtm(),
    fetchBinance(),
  ]);

  const platforms = [];
  const errors = {};
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      platforms.push(result.value);
    } else {
      const msg = result.reason?.message || String(result.reason);
      // best-effort id from message
      if (/takenos/i.test(msg)) errors.takenos = msg;
      else if (/airtm/i.test(msg)) errors.airtm = msg;
      else if (/dorado/i.test(msg)) errors.eldorado = msg;
      else if (/binance/i.test(msg)) errors.binance = msg;
    }
  }

  const order = ['eldorado', 'takenos', 'meru', 'airtm', 'binance'];
  const names = {
    eldorado: 'El Dorado',
    takenos: 'Takenos',
    meru: 'Meru',
    airtm: 'Airtm',
    binance: 'Binance P2P',
  };
  const have = new Set(platforms.map((p) => p.id));
  for (const id of order) {
    if (!have.has(id)) {
      platforms.push(pack(id, names[id], null, null, null));
    }
  }
  platforms.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return res.status(200).json({
    verified_at: new Date().toISOString(),
    asset: 'USDT',
    fiat: 'BOB',
    platforms,
    ...(Object.keys(errors).length ? { partial_errors: errors } : {}),
  });
};
