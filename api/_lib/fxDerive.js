/**
 * Convert USDT-quoted prices into BOB-per-fiat without swapping sides.
 * Binance P2P fiat quotes are fiat-per-USDT; EURUSDT spot is USDT-per-EUR.
 */

function asPositiveRate(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** BOB per fiat from P2P: (BOB/USDT) / (fiat/USDT). */
function bobPerFiatFromUsdtP2p(bobPerUsdt, fiatPerUsdt) {
  const bob = asPositiveRate(bobPerUsdt);
  const fiat = asPositiveRate(fiatPerUsdt);
  if (!bob || !fiat) return null;
  return bob / fiat;
}

/** BOB per fiat from spot: (BOB/USDT) * (USDT/fiat). */
function bobPerFiatFromUsdtSpot(bobPerUsdt, usdtPerFiat) {
  const bob = asPositiveRate(bobPerUsdt);
  const usdt = asPositiveRate(usdtPerFiat);
  if (!bob || !usdt) return null;
  return bob * usdt;
}

module.exports = {
  asPositiveRate,
  bobPerFiatFromUsdtP2p,
  bobPerFiatFromUsdtSpot,
};
