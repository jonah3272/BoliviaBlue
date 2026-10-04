import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK, ELDORADO_REFERRAL_LINK } from '../frontend/src/config/referrals.js';

const page = readFileSync(new URL('../frontend/src/pages/Plataformas.jsx', import.meta.url), 'utf8');
const model = page.slice(page.indexOf('export function getPlatformComparison'), page.indexOf('\nfunction Plataformas(')).replace('export function', 'function');
const context = { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK, ELDORADO_REFERRAL_LINK };
vm.runInNewContext(model + '\nthis.compare = getPlatformComparison;', context);

describe('qualified platform comparison', () => {
  it('keeps six distinct provider routes and the exact three owned referral destinations in both languages', () => {
    const destinations = {
      eldorado: 'https://link.eldorado.io/MMLGEZcDf5b',
      binance: 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default',
      airtm: 'https://app.airtm.io/ivt/dasyl1sfs6fzr',
    };
    for (const language of ['es', 'en']) {
      const rows = context.compare(language);
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
    assert.doesNotMatch(page, /renderStars|★|Mejor tasa del mercado|Best market rate|Tasas más competitivas|Most competitive rates|Highest liquidity|Highest security|Sin comisiones|No fees|\$10 USD|\$50 USD|2-5%|cancel the transaction immediately|cancela la transacción inmediatamente|No referral program|Sin programa de referidos/);
    assert.match(page, /No canceles por una promesa de devolución/);
    assert.match(page, /Do not cancel based on a promise of a refund/);
    assert.match(page, /dinero llegó antes de liberar cripto/);
    assert.match(page, /before releasing crypto/);
    assert.match(page, /El pago puede hacerse en la app de tu banco/);
    assert.match(page, /Payment may take place in your banking app/);
    assert.match(page, /no los cuentes dos veces/);
    assert.match(page, /do not count them twice/);
  });
  it('preserves labeled referral attribution, explicit locale links and the supported guide anchor', () => {
    assert.match(page, /rel="noopener noreferrer sponsored"/);
    assert.match(page, /trackReferralClicked\(\{ language, partner: platform\.partner, placement: 'plataformas', destination: platform\.referral/);
    assert.match(page, /url: local\('\/'\)/);
    assert.match(page, /url: local\('\/plataformas'\)/);
    assert.match(page, /intent=buy_usdt&operation=sell#guia/);
    assert.doesNotMatch(page, /#cash-out-title/);
    assert.match(page, /searchParams\.set\('lang', 'en'\)/);
    assert.match(page, /RateBinanceCta placement="plataformas_top"/);
    assert.match(page, /REVIEWED_AT = '2026-10-04'/);
    assert.doesNotMatch(page, /AggregateRating|Review"|reviewRating|dateModified: new Date/);
    const shell = readFileSync(new URL('../frontend/scripts/inject-seo-shell.cjs', import.meta.url), 'utf8');
    const metadata = shell.match(/\['\/plataformas', '([^']+)', '([^']+)'\]/);
    assert.ok(metadata);
    assert.ok(page.includes(metadata[1]) && page.includes(metadata[2]));
  });
});
