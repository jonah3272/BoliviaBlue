import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { buildPressCitations } from '../frontend/src/utils/pressCitations.js';
import { newsroomReport, observationLabel } from '../frontend/src/utils/sourceObservation.js';
import { PLAIN_CITE_ES, PLAIN_CITE_EN } from '../frontend/src/utils/citationCopy.js';
import { getDataDocumentationPage } from '../frontend/src/data/dataDocumentation.js';
import { renderDataDocumentationHtml } from '../seo/dataDocumentationSeo.js';
import { applyLiveSeo, applyEnglishAnnotations, metaForPath, metaForPathEn } from '../middleware.js';
const require = createRequire(import.meta.url);
const { ROUTES, applyLiveRatesToRoutes, injectRootShell, replaceMeta } = require('../frontend/scripts/inject-seo-shell.cjs');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const time = '2026-10-13T03:26:00Z';
const now = Date.parse(time);
const rate = { buy: 11.905, sell: 11.915, updatedAt: time, source_observation: { version: 1, observed_at: time, method: 'median_of_platform_quotes', quote_asset: 'USDT', fiat: 'BOB', platforms: [{ id: 'binance', buy: 11.905000000000001, sell: 11.915000000000001 }] } };

for (const language of ['es', 'en']) {
  test(`all press formats retain the snapshot timestamp, units and rounding: ${language}`, () => {
    const before = JSON.stringify(rate);
    const report = newsroomReport(rate, language, now);
    for (const citation of Object.values(buildPressCitations(rate, language, now))) {
      for (const expected of [time, observationLabel(time, language), '11.90', '11.91', 'USDT/BOB', 'Binance P2P']) {
        assert.ok(citation.includes(expected), expected);
        assert.ok(report.text.includes(expected), expected);
      }
      assert.match(citation, language === 'es' ? /por USDT/ : /per USDT/);
      assert.match(citation, /prensa(?:\?lang=en)?#corte-informativo/);
      assert.doesNotMatch(citation, /cotiza hoy|Today’s|per USD\b|por USD\b|11\.905/);
    }
    assert.equal(JSON.stringify(rate), before);
  });

  test(`missing or invalid observation time never produces a numeric press quote: ${language}`, () => {
    for (const updatedAt of [null, undefined, '', 'invalid', '2026-02-30T12:00:00Z', '2026-10-13', '2026-10-13T03:26:00']) {
      const input = { ...rate, updatedAt, generated_at_iso: time, fetchedAt: time };
      for (const citation of Object.values(buildPressCitations(input, language, now))) {
        assert.doesNotMatch(citation, /11\.90|11\.91|Binance|2026-10-13/);
        assert.match(citation, language === 'es' ? /Cotización fechada no disponible/ : /Dated quote unavailable/);
      }
    }
    for (const input of [null, { ...rate, buy: null }, { ...rate, sell: '11.915' }]) {
      for (const citation of Object.values(buildPressCitations(input, language, now))) assert.doesNotMatch(citation, /11\.90|11\.91/);
    }
  });

  test(`stale readings and unavailable provenance stay qualified: ${language}`, () => {
    for (const citation of Object.values(buildPressCitations(rate, language, now + 86400000))) {
      assert.ok(citation.includes(time));
      assert.match(citation, language === 'es' ? /Lectura desactualizada/ : /Stale observation/);
    }
    for (const source_observation of [null, { ...rate.source_observation, observed_at: '2026-10-12T03:26:00Z' }, { ...rate.source_observation, version: 9 }]) {
      for (const citation of Object.values(buildPressCitations({ ...rate, source_observation, sources_used: ['binance', 'bybit'] }, language, now))) {
        assert.match(citation, /11\.90/);
        assert.doesNotMatch(citation, /Binance|Bybit/);
        assert.match(citation, language === 'es' ? /Desglose de fuentes no disponible/ : /Source breakdown unavailable/);
      }
    }
  });

  test(`future observations fail closed beyond a one-minute clock-skew tolerance: ${language}`, () => {
    for (const ahead of [0, 59_999, 60_000, 60_001, 365 * 86400000]) {
      const iso = new Date(now + ahead).toISOString();
      const boliviaOffset = new Date(now + ahead - 4 * 3600000).toISOString().replace('Z', '-04:00');
      for (const updatedAt of [iso, boliviaOffset]) {
        const input = { ...rate, updatedAt, generated_at_iso: time, fetchedAt: time, source_observation: { ...rate.source_observation, observed_at: iso } };
        for (const citation of Object.values(buildPressCitations(input, language, now))) {
          if (ahead <= 60_000) {
            assert.ok(citation.includes(updatedAt));
            assert.match(citation, /11\.90/);
            assert.match(citation, /Binance P2P/);
          } else {
            assert.doesNotMatch(citation, /11\.90|11\.91|Binance P2P/);
            assert.ok(!citation.includes(updatedAt));
            assert.ok(!citation.includes(time), 'Never substitute the current/request time');
            assert.match(citation, language === 'es' ? /Cotización fechada no disponible/ : /Dated quote unavailable/);
          }
        }
      }
    }
    for (const badClock of [NaN, Infinity, 'invalid']) for (const citation of Object.values(buildPressCitations(rate, language, badClock))) assert.doesNotMatch(citation, /11\.90|11\.91|Binance P2P/);
  });

  test(`API timestamp aliases match the snapshot and untrusted strings cannot enter HTML: ${language}`, () => {
    for (const input of [{ ...rate, updatedAt: undefined, updated_at_iso: time }, { ...rate, updatedAt: undefined, t: time }]) {
      assert.deepEqual(buildPressCitations(input, language, now), buildPressCitations(rate, language, now));
    }
    const badTime = '<img src=x onerror="alert(1)">';
    const input = { ...rate, updated_at_iso: badTime, source_observation: { ...rate.source_observation, platforms: [{ id: badTime, buy: rate.buy, sell: rate.sell }] }, sources_used: [badTime] };
    const citation = buildPressCitations(input, language, now);
    for (const text of Object.values(citation)) assert.doesNotMatch(text, /onerror|alert\(|11\.90|11\.91/);
    assert.match(citation.html, /^<p>[^<]+<a href="https:\/\/www\.boliviablue\.com\/prensa(?:\?lang=en)?#corte-informativo">/);
  });

  test(`historical and AI citation copy describe per-record provenance accurately: ${language}`, () => {
    const page = getDataDocumentationPage('/datos-historicos', language);
    const expected = language === 'es'
      ? 'La composición de fuentes está disponible solo para registros con source_observation válido y coincidente con la lectura; para los demás, es desconocida.'
      : 'Source composition is available only for records with valid source_observation matching the observation; otherwise, it is unknown.';
    const html = renderDataDocumentationHtml(template, '/datos-historicos', `?lang=${language}`);
    for (const value of [page.copy.datasetDescription, page.datasetSchema.description, html, language === 'es' ? PLAIN_CITE_ES : PLAIN_CITE_EN]) {
      assert.ok(value.includes(expected));
      assert.doesNotMatch(value, /No se conserva la composición|Per-record source composition is not recorded|historical source composition is not recorded|fuentes históricas no está registrada/);
    }
  });
}

test('press initial HTML and metadata cannot freeze a build-time or middleware numeric quote', () => {
  const saved = Object.fromEntries(Object.entries(ROUTES).map(([path, route]) => [path, { ...route }]));
  try {
    for (const updatedAt of [time, null]) {
      applyLiveRatesToRoutes(11.86, 11.82, updatedAt);
      const base = injectRootShell(replaceMeta(template, '/prensa'), ROUTES['/prensa'].shell);
      const applied = applyLiveSeo(base, '/prensa', { buy: '11.93', sell: '11.80', updatedAt });
      const english = applyEnglishAnnotations(applied.html, '/prensa', applied.rates);
      for (const html of [base, applied.html, english, applyEnglishAnnotations(base, '/prensa', null)]) {
        assert.doesNotMatch(html, /11\.86|11\.82|11\.93|11\.80|data-live-buy|cotiza hoy|Ready citation: Bolivia blue dollar buy/);
        assert.match(html, /href="\/prensa(?:\?lang=en)?#corte-informativo"/);
        assert.match(html, /id="corte-informativo"/);
        assert.match(html, /USDT\/BOB/);
      }
      for (const meta of [metaForPath('/prensa', '11.93', '11.80', updatedAt), metaForPathEn('/prensa', '11.93', '11.80', updatedAt)]) assert.doesNotMatch(JSON.stringify(meta), /11\.93|11\.80/);
    }
  } finally {
    for (const [path, route] of Object.entries(saved)) Object.assign(ROUTES[path], route);
  }
});
