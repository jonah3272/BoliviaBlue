import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import { normalizeDollarRatePayload, buildDollarRateSearchCopy } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { formatDateTime } from '../frontend/src/utils/formatters.js';
const input = '<html><head><title>Old</title></head><body><main data-seo-shell="home"></main></body></html>';
const observed = '2026-10-12T01:00:00Z';
const rate = { buy: 11.875, sell: 11.895, updatedAt: observed, source_observation: { version: 1, observed_at: observed, method: 'median_of_platform_quotes', quote_asset: 'USDT', fiat: 'BOB', platforms: [{ id: 'binance', buy: 11.875, sell: 11.895 }] } };
for (const language of ['es', 'en']) for (const state of ['ready', 'stale', 'unavailable', 'unknown-source', 'missing-time']) {
  test(`${language} ${state}: initial hero leads with the original pair, observation and same-record source answer`, () => {
    const data = state === 'unavailable' ? null : { ...rate, updatedAt: state === 'missing-time' ? null : observed, source_observation: state === 'unknown-source' ? null : rate.source_observation };
    const normalized = normalizeDollarRatePayload(data);
    const now = Date.parse(observed) + (state === 'stale' ? 3600000 : 0);
    const model = buildDollarRateSearchCopy({ ...normalized, language, page: 'home', now });
    const html = renderDollarRateHtml(input, '/', normalized, language, now);
    for (const marker of ['data-home-rate-hero', 'data-home-rate-line', 'data-home-conversion', 'data-home-observation', 'data-dollar-rate-answer', 'data-home-secondary-actions']) assert.ok(html.includes(marker), marker);
    assert.ok(html.indexOf('data-home-heading') < html.indexOf('data-home-rate-line'));
    assert.ok(html.indexOf('data-home-rate-line') < html.indexOf('data-home-observation'));
    assert.ok(html.indexOf('data-home-observation') < html.indexOf('data-dollar-rate-answer'));
    assert.ok(html.indexOf('data-dollar-rate-answer') < html.indexOf('data-home-secondary-actions'));
    assert.ok(html.includes(model.answer));
    assert.doesNotMatch(html, /href="#price-alerts"/);
    const mobileSources = html.match(/<details[^>]*>([\s\S]*?)<\/details>/)[1];
    for (const destination of ['/fuente-de-datos', '/prensa', '/llms.txt', '/api-docs']) assert.ok(mobileSources.includes(`href="${destination}${language === 'en' && destination !== '/llms.txt' ? '?lang=en' : ''}"`));
    for (const destination of ['/dolar-blue-hoy', '/comprar-dolares']) assert.ok(html.includes(`href="${destination}${language === 'en' ? '?lang=en' : ''}"`));
    if (model.hasRates) { assert.ok(html.includes(model.buyStr)); assert.ok(html.includes(model.sellStr)); }
    else assert.doesNotMatch(html, /11\.88|11\.89|<time/);
    if (model.observedAt) assert.ok(html.includes(formatDateTime(observed, language === 'es' ? 'es-BO' : 'en-US')));
    else assert.doesNotMatch(html, /<time|Invalid Date/);
    if (state === 'stale') assert.match(html, /dato desactualizado|stale reading/);
    if (['unknown-source', 'missing-time', 'unavailable'].includes(state)) assert.doesNotMatch(html, /Binance P2P/);
  });
}
test('one promoted source panel retains every detailed rate mode, disclosure and ad hook', () => {
  const home = readFileSync(new URL('../frontend/src/pages/Home.jsx', import.meta.url), 'utf8');
  assert.equal((home.match(/<AiCitationBlock/g) || []).length, 1);
  for (const marker of ['<BlueRateCards', '<RateTrioStrip', '<RateBinanceCta', '<SourceObservationPanel', '<AdSenseAutoAds', 'useAdsenseReady();', 'USDT es un criptoactivo, no efectivo USD.', 'Podemos recibir una comisión']) assert.ok(home.includes(marker), marker);
  assert.doesNotMatch(home, /Actualizado cada 15 min|Updated every 15 min/);
});
