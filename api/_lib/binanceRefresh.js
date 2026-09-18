const { createClient } = require('@supabase/supabase-js');
const { fetchBinanceSide, fetchCrossSourceBobRates } = require('./p2pCrossSource');
const {
  asPositiveRate,
  bobPerFiatFromUsdtP2p,
  bobPerFiatFromUsdtSpot,
} = require('./fxDerive');
const { resolveOfficialRate } = require('./officialRate');
const { refreshCardRates } = require('./cardRate');

const STALE_MS = 20 * 60 * 1000;

function createSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env on Vercel');
  return createClient(url, key);
}

async function fetchP2P(tradeType, fiat = 'BOB', rows = 20) {
  return fetchBinanceSide(tradeType, fiat, rows);
}

async function p2pFiatPerUsdt(fiat) {
  const [buySide, sellSide] = await Promise.all([
    fetchP2P('BUY', fiat),
    fetchP2P('SELL', fiat),
  ]);
  const buy = asPositiveRate(buySide);
  const sell = asPositiveRate(sellSide);
  if (!buy || !sell) return null;
  return { buy, sell };
}

async function fetchEurUsdtSpot() {
  const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT');
  if (!res.ok) return null;
  const data = await res.json();
  return asPositiveRate(data?.price);
}

/** Spot quote in fiat-per-USDT units (same as Binance P2P fiat books). */
async function fetchUsdtFiatSpot(symbol) {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
  if (!res.ok) return null;
  const data = await res.json();
  return asPositiveRate(data?.price);
}

/**
 * BOB per 1 fiat: P2P book first, then optional spot (fiat per USDT).
 * Never invents a fixed multiplier.
 */
async function deriveBobPerFiat(bobBuy, bobSell, fiat, spotSymbol = null) {
  let buyFiat = null;
  let sellFiat = null;
  let derivation = null;
  try {
    const p2p = await p2pFiatPerUsdt(fiat);
    if (p2p) {
      buyFiat = bobPerFiatFromUsdtP2p(bobBuy, p2p.buy);
      sellFiat = bobPerFiatFromUsdtP2p(bobSell, p2p.sell);
      derivation = 'p2p-usdt';
    }
  } catch {
    /* fall through to spot */
  }
  if ((buyFiat == null || sellFiat == null) && spotSymbol) {
    try {
      const fiatPerUsdt = await fetchUsdtFiatSpot(spotSymbol);
      if (fiatPerUsdt) {
        buyFiat = bobPerFiatFromUsdtP2p(bobBuy, fiatPerUsdt);
        sellFiat = bobPerFiatFromUsdtP2p(bobSell, fiatPerUsdt);
        derivation = `spot-${spotSymbol.toLowerCase()}`;
      }
    } catch {
      /* leave unavailable */
    }
  }
  return { buy: buyFiat, sell: sellFiat, derivation };
}

async function getOfficialFallback(supabase) {
  return resolveOfficialRate(supabase);
}

/**
 * Cross-source P2P medians (Binance + El Dorado + OKX + Bybit) and insert rates row.
 * @returns {{ row: object, buyPrices: number[], sellPrices: number[], sourcesUsed: string[] }}
 */
async function refreshBlueFromBinance(supabase = createSupabaseClient()) {
  const cross = await fetchCrossSourceBobRates();
  const buy = cross.buy;
  const sell = cross.sell;
  const buyPrices = cross.platforms.map((p) => p.buy);
  const sellPrices = cross.platforms.map((p) => p.sell);
  const sourcesUsed = cross.sources_used;

  let buyBrl = null;
  let sellBrl = null;
  let buyEur = null;
  let sellEur = null;
  let eurDerivation = null;
  let buyCop = null;
  let sellCop = null;
  let copDerivation = null;
  let buyPen = null;
  let sellPen = null;
  let penDerivation = null;
  let buyArs = null;
  let sellArs = null;
  let arsDerivation = null;
  let buyClp = null;
  let sellClp = null;
  let clpDerivation = null;
  try {
    const brl = await p2pFiatPerUsdt('BRL');
    if (brl) {
      buyBrl = bobPerFiatFromUsdtP2p(buy, brl.buy);
      sellBrl = bobPerFiatFromUsdtP2p(sell, brl.sell);
    }
  } catch {
    /* optional — BRL P2P is often thin */
  }
  try {
    const eur = await p2pFiatPerUsdt('EUR');
    if (eur) {
      buyEur = bobPerFiatFromUsdtP2p(buy, eur.buy);
      sellEur = bobPerFiatFromUsdtP2p(sell, eur.sell);
      eurDerivation = 'p2p-usdt';
    }
  } catch {
    /* fall through to spot */
  }
  if (buyEur == null || sellEur == null) {
    try {
      const usdtPerEur = await fetchEurUsdtSpot();
      if (usdtPerEur) {
        buyEur = bobPerFiatFromUsdtSpot(buy, usdtPerEur);
        sellEur = bobPerFiatFromUsdtSpot(sell, usdtPerEur);
        eurDerivation = 'spot-usdt';
      }
    } catch {
      /* EUR remains unavailable */
    }
  }

  const copPair = await deriveBobPerFiat(buy, sell, 'COP', 'USDTCOP');
  buyCop = copPair.buy;
  sellCop = copPair.sell;
  copDerivation = copPair.derivation;

  const [penPair, arsPair, clpPair] = await Promise.all([
    deriveBobPerFiat(buy, sell, 'PEN', 'USDTPEN'),
    deriveBobPerFiat(buy, sell, 'ARS', 'USDTARS'),
    deriveBobPerFiat(buy, sell, 'CLP', 'USDTCLP'),
  ]);
  buyPen = penPair.buy;
  sellPen = penPair.sell;
  penDerivation = penPair.derivation;
  buyArs = arsPair.buy;
  sellArs = arsPair.sell;
  arsDerivation = arsPair.derivation;
  buyClp = clpPair.buy;
  sellClp = clpPair.sell;
  clpDerivation = clpPair.derivation;

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
    buy_bob_per_cop: buyCop,
    sell_bob_per_cop: sellCop,
    mid_bob_per_cop: buyCop != null && sellCop != null ? (buyCop + sellCop) / 2 : null,
    buy_bob_per_pen: buyPen,
    sell_bob_per_pen: sellPen,
    mid_bob_per_pen: buyPen != null && sellPen != null ? (buyPen + sellPen) / 2 : null,
    buy_bob_per_ars: buyArs,
    sell_bob_per_ars: sellArs,
    mid_bob_per_ars: buyArs != null && sellArs != null ? (buyArs + sellArs) / 2 : null,
    buy_bob_per_clp: buyClp,
    sell_bob_per_clp: sellClp,
    mid_bob_per_clp: buyClp != null && sellClp != null ? (buyClp + sellClp) / 2 : null,
  };

  const { error } = await supabase.from('rates').insert(row);
  if (error) throw error;

  let cardRate = null;
  try {
    cardRate = await refreshCardRates(supabase);
  } catch (err) {
    console.warn('[refresh] card rates failed:', err.message || err);
  }

  return {
    row,
    buyPrices,
    sellPrices,
    sourcesUsed,
    eurDerivation,
    copDerivation,
    penDerivation,
    arsDerivation,
    clpDerivation,
    cardRate,
  };
}

function isRateStale(iso, staleMs = STALE_MS) {
  if (!iso) return true;
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return true;
  return Date.now() - ms > staleMs;
}

module.exports = {
  STALE_MS,
  createSupabaseClient,
  refreshBlueFromBinance,
  isRateStale,
  deriveBobPerFiat,
};
