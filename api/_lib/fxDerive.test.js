const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  asPositiveRate,
  bobPerFiatFromUsdtP2p,
  bobPerFiatFromUsdtSpot,
} = require('./fxDerive');

describe('asPositiveRate', () => {
  it('accepts finite positives and rejects junk', () => {
    assert.equal(asPositiveRate(12.48), 12.48);
    assert.equal(asPositiveRate('1.17'), 1.17);
    assert.equal(asPositiveRate(0), null);
    assert.equal(asPositiveRate(-1), null);
    assert.equal(asPositiveRate(NaN), null);
    assert.equal(asPositiveRate(undefined), null);
  });
});

describe('EUR derivation', () => {
  it('does not treat a P2P median number as an array (regression)', () => {
    const bobBuy = 12.48;
    const eurPerUsdt = 0.85;
    const out = bobPerFiatFromUsdtP2p(bobBuy, eurPerUsdt);
    assert.ok(out > 14 && out < 16);
  });

  it('spot path multiplies USDT-per-EUR', () => {
    const bobBuy = 12.48;
    const usdtPerEur = 1.17;
    const out = bobPerFiatFromUsdtSpot(bobBuy, usdtPerEur);
    assert.equal(Number(out.toFixed(4)), Number((12.48 * 1.17).toFixed(4)));
  });

  it('does not swap buy/sell merely because one is larger', () => {
    const buy = bobPerFiatFromUsdtP2p(12.48, 0.85);
    const sell = bobPerFiatFromUsdtP2p(12.44, 0.86);
    assert.notEqual(buy, sell);
    assert.equal(buy > sell, 12.48 / 0.85 > 12.44 / 0.86);
  });
});
