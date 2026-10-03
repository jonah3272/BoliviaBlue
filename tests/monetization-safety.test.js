import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BINANCE_REFERRAL_LINK, getPartnerAds } from '../frontend/src/config/referrals.js';
import { historicalTableData, checkExtendedExportService } from '../frontend/src/utils/historicalTable.js';
const source = (name) => readFileSync(new URL(`../frontend/src/${name}`, import.meta.url), 'utf8');

describe('buying instructions and referral intent', () => {
  it('describes buying USDT for BOB consistently in Spanish and English', () => {
    const file = source('contexts/LanguageContext.jsx');
    const start = file.indexOf('export const translations');
    const end = file.indexOf('export function LanguageProvider');
    const translations = vm.runInNewContext(file.slice(start, end).replace('export const translations', 'const translations') + '\ntranslations;');
    assert.match(translations.es.buyDollarsStep3Desc, /"Comprar" USDT/);
    assert.match(translations.en.buyDollarsStep3Desc, /"Buy" USDT/);
    assert.match(translations.es.buyDollarsStep5Desc, /BOB al vendedor/);
    assert.match(translations.en.buyDollarsStep5Desc, /BOB to the seller/);
    assert.doesNotMatch(translations.es.buyDollarsStep5Desc, /deseas vender|al comprador/);
    assert.doesNotMatch(translations.en.buyDollarsStep5Desc, /want to sell|to the buyer/);
    assert.match(translations.es.buyDollarsSafetyTip5, /no canceles.*reembolso/);
    assert.match(translations.en.buyDollarsSafetyTip5, /do not cancel.*refund/);
    assert.doesNotMatch(translations.es.buyDollarsP2PAdvantage2, /garantía/);
    assert.doesNotMatch(translations.en.buyDollarsP2PAdvantage2, /guarantee/);
    assert.match(source('pages/BuyDollars.jsx'), /360039384951/);
  });
  it('keeps the affiliate identifier while labeling the actual invitation destination', () => {
    assert.equal(BINANCE_REFERRAL_LINK, 'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default');
    for (const language of ['es', 'en']) {
      const ad = getPartnerAds(language).find((row) => row.partner === 'binance');
      assert.equal(ad.href, BINANCE_REFERRAL_LINK);
      assert.match(ad.cta, language === 'es' ? /invitación/ : /invitation/);
      assert.doesNotMatch(ad.sub, /most used|más usada|guaranteed/i);
    }
  });
  it('emits intent/lead events without generic conversions or invented monetary value', () => {
    const events = [];
    const context = { trackEvent: (name, params) => events.push({ name, params }) };
    const file = source('utils/analyticsEvents.js').replace(/^import .*;\s*$/gm, '').replace(/export function /g, 'function ');
    vm.runInNewContext(file + '\ntrackRateAlertSubmitted({language:"en",threshold:12.5}); trackReferralClicked({language:"en",partner:"binance",placement:"fixture"}); trackCalculatorUsed({language:"en"});', context);
    assert.equal(events.filter((event) => event.name === 'rate_alert_submitted').length, 1);
    assert.equal(events.filter((event) => event.name === 'referral_clicked').length, 1);
    assert.ok(events.every((event) => event.name !== 'conversion'));
    assert.ok(events.every((event) => !('value' in event.params) && !('currency' in event.params)));
    assert.equal(events[0].params.threshold, '12.5');
  });
  it('excludes only publisher-owned conversion sections using the documented class', () => {
    for (const file of ['components/RateBinanceCta.jsx', 'pages/Calculator.jsx', 'pages/BuyDollars.jsx', 'pages/Home.jsx']) assert.match(source(file), /google-anno-skip/);
    assert.match(source('pages/Home.jsx'), /grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\]/);
    assert.match(source('components/NewsletterSignup.jsx'), /flex flex-col sm:flex-row/);
  });
});

describe('historical table and unavailable extended backend', () => {
  it('adapts chart points/t to the existing table contract without changing rates', () => {
    const result = historicalTableData({ range: '1M', points: [{ t: '2026-10-03T12:00:00Z', buy: '12.34', sell: 12.56 }, { t: 'invalid', buy: 12, sell: 13 }, { t: '2026-10-03T12:00:00Z', buy: null, sell: 13 }] });
    assert.equal(result.history.length, 1);
    assert.equal(result.history[0].timestamp, '2026-10-03T12:00:00Z');
    assert.equal(result.history[0].buy, 12.34);
    assert.equal(result.history[0].sell, 12.56);
    assert.equal(historicalTableData({ history: result.history }).history.length, 1);
  });
  it('shows extended access only after a successful read-only health check', async () => {
    const calls = [];
    const healthy = await checkExtendedExportService('https://api.boliviablue.com/', { fetcher: async (url, options) => { calls.push({ url, options }); return Response.json({ ok: true }); } });
    assert.equal(healthy, true);
    assert.equal(calls[0].url, 'https://api.boliviablue.com/api/health');
    assert.equal(calls[0].options.method, 'GET');
    assert.equal(calls[0].options.credentials, 'omit');
    assert.equal(await checkExtendedExportService('https://api.boliviablue.com', { fetcher: async () => new Response('Application not found', { status: 404 }) }), false);
    assert.equal(await checkExtendedExportService('https://api.boliviablue.com', { fetcher: async () => { throw new Error('offline'); } }), false);
    assert.equal(await checkExtendedExportService('', { fetcher: async () => { throw new Error('must not call'); } }), false);
  });
});
