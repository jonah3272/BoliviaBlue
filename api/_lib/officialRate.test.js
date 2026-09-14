/**
 * Run: node --test api/_lib/officialRate.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseBcbHomepage, asOfficialRate } = require('./officialRate');

const CURRENT_CARD = `
<article class="bcb-kpi2-card is-tc-oficial has-range-label">
  <p class="bcb-kpi2-name">Tipo de cambio oficial</p>
  <div class="bcb-tco-value">
    <div class="bcb-tco-amount">
      <!--<span class="bcb-tco-bs">Bs</span>-->
      <span class="bcb-tco-num">11,53</span>
    </div>
  </div>
</article>
`;

const LEGACY_ARROW = `
<article class="bcb-kpi2-card is-tc-oficial">
  <p>Tipo de cambio oficial</p>
  Bs → 12,15
</article>
`;

const LEGACY_COMPRA_VENTA = `
<html><body>
Valor referencial del dólar estadounidense Compra 6,96 Venta 6,86
</body></html>
`;

describe('parseBcbHomepage', () => {
  it('reads .bcb-tco-num when the Bs span is commented out (Sep 2026 layout)', () => {
    const parsed = parseBcbHomepage(CURRENT_CARD);
    assert.equal(parsed.buy, 11.53);
    assert.equal(parsed.sell, 11.53);
  });

  it('still reads the old Bs → mid', () => {
    const parsed = parseBcbHomepage(LEGACY_ARROW);
    assert.equal(parsed.buy, 12.15);
    assert.equal(parsed.sell, 12.15);
  });

  it('still reads Compra/Venta under Valor referencial', () => {
    const parsed = parseBcbHomepage(LEGACY_COMPRA_VENTA);
    assert.equal(parsed.buy, 6.96);
    assert.equal(parsed.sell, 6.86);
  });

  it('does not invent a rate from empty HTML', () => {
    assert.equal(parseBcbHomepage(''), null);
    assert.equal(parseBcbHomepage('<html></html>'), null);
  });
});

describe('asOfficialRate', () => {
  it('rejects junk that used to leak into the BCB card', () => {
    assert.equal(asOfficialRate(0), null);
    assert.equal(asOfficialRate(10.5), 10.5);
    assert.equal(asOfficialRate(null), null);
    assert.equal(asOfficialRate('11,53'), null);
  });
});
