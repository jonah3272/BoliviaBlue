/**
 * Cross-source P2P medians (Binance + El Dorado + OKX + legacy Bybit public).
 * Matches paralelo.bo-style credibility: median of platform medians, not a single feed.
 */

const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const ELDORADO_PRICES_URL = 'https://api.eldorado.io/api/prices';
const OKX_BOOKS_URL = 'https://www.okx.com/v3/c2c/tradingOrders/books';
const BYBIT_LEGACY_URL = 'https://api2.bybit.com/fiat/otc/item/online';

function median(values) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

async function fetchBinanceSide(tradeType, fiat = 'BOB', rows = 20) {
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
  if (buy == null || sell == null) throw new Error('Binance insufficient data');
  return { id: 'binance', buy, sell };
}

async function fetchEldorado() {
  const res = await fetch(ELDORADO_PRICES_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`El Dorado HTTP ${res.status}`);
  const data = await res.json();
  const buy = parseFloat(data?.BUY?.BOB?.price);
  const sell = parseFloat(data?.SELL?.BOB?.price);
  if (!Number.isFinite(buy) || !Number.isFinite(sell)) throw new Error('El Dorado missing BOB');
  return { id: 'eldorado', buy, sell };
}

/** OKX: compra USDT = sell ads; venta USDT = buy ads */
async function fetchOkx() {
  const [sellAds, buyAds] = await Promise.all([
    fetch(OKX_BOOKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        quoteCurrency: 'BOB',
        baseCurrency: 'USDT',
        side: 'sell',
        paymentMethod: '',
        userType: 'all',
      }),
    }),
    fetch(OKX_BOOKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        quoteCurrency: 'BOB',
        baseCurrency: 'USDT',
        side: 'buy',
        paymentMethod: '',
        userType: 'all',
      }),
    }),
  ]);
  if (!sellAds.ok || !buyAds.ok) throw new Error(`OKX HTTP ${sellAds.status}/${buyAds.status}`);
  const sellJson = await sellAds.json();
  const buyJson = await buyAds.json();
  const compraPrices = (sellJson?.data?.sell || [])
    .map((r) => parseFloat(r.price))
    .filter((n) => Number.isFinite(n));
  const ventaPrices = (buyJson?.data?.buy || [])
    .map((r) => parseFloat(r.price))
    .filter((n) => Number.isFinite(n));
  const buy = median(compraPrices);
  const sell = median(ventaPrices);
  if (buy == null || sell == null) throw new Error('OKX insufficient data');
  return { id: 'okx', buy, sell };
}

/** Legacy public Bybit OTC list (no API key) */
async function fetchBybitLegacy() {
  const body = (side) =>
    JSON.stringify({
      userId: '',
      tokenId: 'USDT',
      currencyId: 'BOB',
      payment: [],
      side: String(side),
      size: '15',
      page: '1',
      amount: '',
    });
  const [sellSide, buySide] = await Promise.all([
    fetch(BYBIT_LEGACY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body(1),
    }),
    fetch(BYBIT_LEGACY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body(0),
    }),
  ]);
  if (!sellSide.ok || !buySide.ok) throw new Error(`Bybit HTTP ${sellSide.status}`);
  const sellJson = await sellSide.json();
  const buyJson = await buySide.json();
  const compraPrices = (sellJson?.result?.items || sellJson?.result || [])
    .map((r) => parseFloat(r.price))
    .filter((n) => Number.isFinite(n));
  const ventaPrices = (buyJson?.result?.items || buyJson?.result || [])
    .map((r) => parseFloat(r.price))
    .filter((n) => Number.isFinite(n));
  const buy = median(compraPrices);
  const sell = median(ventaPrices);
  if (buy == null || sell == null) throw new Error('Bybit insufficient data');
  return { id: 'bybit', buy, sell };
}

/**
 * Median of per-platform medians (compra / venta).
 * Requires at least one source; prefers 2+ for cross-source label.
 */
async function fetchCrossSourceBobRates() {
  const fetchers = [
    { id: 'binance', fn: fetchBinance },
    { id: 'eldorado', fn: fetchEldorado },
    { id: 'okx', fn: fetchOkx },
    { id: 'bybit', fn: fetchBybitLegacy },
  ];

  const settled = await Promise.allSettled(fetchers.map((f) => f.fn()));
  const platforms = settled
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  if (!platforms.length) {
    const err = new Error('No P2P sources available');
    err.statusCode = 502;
    throw err;
  }

  const buy = median(platforms.map((p) => p.buy));
  const sell = median(platforms.map((p) => p.sell));
  if (buy == null || sell == null) {
    const err = new Error('Cross-source median failed');
    err.statusCode = 502;
    throw err;
  }

  return {
    buy,
    sell,
    mid: (buy + sell) / 2,
    sources_used: platforms.map((p) => p.id),
    platforms,
  };
}

module.exports = {
  median,
  fetchBinanceSide,
  fetchCrossSourceBobRates,
};
