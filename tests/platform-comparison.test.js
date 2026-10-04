import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getPlatformComparison, getPlatformComparisonPage, REVIEWED_AT } from '../frontend/src/data/platformComparison.js';
import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK, ELDORADO_REFERRAL_LINK } from '../frontend/src/config/referrals.js';

const page = readFileSync(new URL('../frontend/src/pages/Plataformas.jsx', import.meta.url), 'utf8');
const shared = readFileSync(new URL('../frontend/src/data/platformComparison.js', import.meta.url), 'utf8');

describe('qualified platform comparison', () => {
  it('keeps six distinct provider routes and the exact three owned referral destinations in both languages', () => {
    const destinations = {
      eldorado: 'https://link.eldorado.io/MMLGEZcDf5b',
      binance: 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default',
      airtm: 'https://app.airtm.io/ivt/dasyl1sfs6fzr',
    };
    for (const language of ['es', 'en']) {
      const rows = getPlatformComparison(language);
      assert.equal(rows.length, 6);
      assert.equal(new Set(rows.map(({ partner }) => partner)).size, 6);
      assert.equal(rows[0].partner, 'eldorado');
      assert.equal(rows.filter(({ referral }) => referral).length, 3);
      for (const row of rows) {
        for (const key of ['purpose', 'payment', 'checks']) assert.ok(row[key].length > 15);
        for (const key of ['rating', 'security', 'speed', 'fees', 'minAmount']) assert.equal(key in row, false);
        if (row.referral) {
          assert.equal(row.referral, destinations[row.partner]);
          assert.ok(row.cta && row.disclosure);
          assert.match(row.disclosure, language === 'es' ? /referido/ : /Referral/);
        } else assert.equal(destinations[row.partner], undefined);
      }
      const binance = rows.find(({ partner }) => partner === 'binance');
      assert.match(binance.cta, language === 'es' ? /invitación/ : /invitation/);
      assert.match(binance.disclosure, /Earn Together/);
      assert.match(binance.disclosure, language === 'es' ? /No abre una orden P2P/ : /does not open a P2P order/);
    }
  });
  it('removes unsupported ratings, universal fee/minimum/speed claims and unsafe immediate cancellation', () => {
    assert.doesNotMatch(page + shared, /renderStars|★|Mejor tasa del mercado|Best market rate|Tasas más competitivas|Most competitive rates|Highest liquidity|Highest security|Sin comisiones|No fees|\$10 USD|\$50 USD|2-5%|cancel the transaction immediately|cancela la transacción inmediatamente|No referral program|Sin programa de referidos/);
    assert.match(shared, /No canceles por una promesa de devolución/);
    assert.match(shared, /Do not cancel based on a promise of a refund/);
    assert.match(shared, /dinero llegó antes de liberar cripto/);
    assert.match(shared, /before releasing crypto/);
    assert.match(shared, /El pago puede hacerse en la app de tu banco/);
    assert.match(shared, /Payment may take place in your banking app/);
    assert.match(shared, /no los cuentes dos veces/);
    assert.match(shared, /do not count them twice/);
  });
  it('preserves labeled referral attribution, explicit locale links and the supported guide anchor', () => {
    assert.match(page, /rel="noopener noreferrer sponsored"/);
    assert.match(page, /trackReferralClicked\(\{ language, partner: platform\.partner, placement: 'plataformas', destination: platform\.referral/);
    assert.match(shared, /url: local\('\/'\)/);
    assert.match(shared, /url: local\('\/plataformas'\)/);
    assert.match(shared, /intent=buy_usdt&operation=sell#guia/);
    assert.doesNotMatch(page, /#cash-out-title/);
    assert.match(shared, /searchParams\.set\('lang', 'en'\)/);
    assert.match(page, /RateBinanceCta placement="plataformas_top"/);
    assert.equal(REVIEWED_AT, '2026-10-04');
    assert.doesNotMatch(page, /AggregateRating|Review"|reviewRating|dateModified: new Date/);
    const shell = readFileSync(new URL('../frontend/scripts/inject-seo-shell.cjs', import.meta.url), 'utf8');
    assert.match(shell, /renderPlatformComparisonHtml\(originalHtml\)/);
    assert.doesNotMatch(shell, /\['\/plataformas',/);
    for (const language of ['es', 'en']) {
      const model = getPlatformComparisonPage(language);
      assert.equal(model.title, model.comparisonSchema.name);
      assert.equal(model.description, model.comparisonSchema.description);
    }
  });
});
