import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { buildDollarRateSearchCopy, DOLLAR_SEARCH_PAGES, validObservationTime, normalizeDollarRatePayload } from '../frontend/src/utils/dollarRateSearchCopy.js';
import { buildLiveRateSeoMeta, ratesFromBluePayload } from '../frontend/src/utils/seoRateMeta.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import middleware, { normalizeRates, applyLiveSeo, applyEnglishAnnotations, metaForPath, metaForPathEn } from '../middleware.js';
const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd, fetchLiveRate } = require('../frontend/scripts/inject-seo-shell.cjs');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const sourceHtml = (path) => injectStaticJsonLd(injectRootShell(replaceMeta(template, path), ROUTES[path].shell), path);
const payload = { buy_bob_per_usd: 12.345, sell_bob_per_usd: 12.675, updated_at_iso: '2026-10-04T21:00:00Z', is_stale: false };
const decode = (s) => s.replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
function content(html, name) { return decode(html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))[1]); }
function assertParity(html, model) {
  assert.equal(decode(html.match(/<title>(.*?)<\/title>/)[1]), model.title);
  for (const name of ['description', 'og:description', 'twitter:description']) assert.equal(content(html, name), model.description);
  for (const name of ['og:title', 'twitter:title']) assert.equal(content(html, name), model.title);
  assert.equal(decode(html.match(/data-dollar-rate-answer>(.*?)<\/p>/)[1]), model.answer);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<meta name="description"/g) || []).length, 1);
  assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1);
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    assert.doesNotMatch(JSON.stringify(JSON.parse(match[1])), /verificad|verified|cada ~?15|every ~?15|R\/P15M|2024-01-01/);
  }
  assert.doesNotMatch(model.answer, /verified|verificad|multi-platform|multiplataforma|cada 15|every 15/i);
}

describe('primary dollar search copy', () => {
  it('shares head and visible answer across all three pages, both languages, and data states', () => {
    for (const [path, page] of Object.entries(DOLLAR_SEARCH_PAGES)) for (const language of ['es', 'en']) {
      for (const data of [payload, { ...payload, is_stale: true }, { ...payload, updated_at_iso: null }, { ...payload, updated_at_iso: 'invalid' }, { ...payload, buy_bob_per_usd: 0 }, { ...payload, buy_bob_per_usd: true }, { ...payload, updated_at_iso: undefined, t: payload.updated_at_iso }, { ...payload, buy: 10.11, sell: 10.22 }, null]) {
        const client = buildLiveRateSeoMeta({ ...normalizeDollarRatePayload(data), page, language });
        const pair = normalizeRates(data, path);
        let html = applyLiveSeo(sourceHtml(path), path, pair).html;
        if (language === 'en') html = applyEnglishAnnotations(html, path, pair);
        assertParity(html, client);
        assert.equal(html.match(/<link rel="canonical" href="([^"]*)"/)[1], `https://www.boliviablue.com${path}${language === 'en' ? '?lang=en' : ''}`);
        assert.match(html, new RegExp(`<html[^>]*lang="${language}"`));
        const model = (language === 'en' ? metaForPathEn : metaForPath)(path, pair?.buy, pair?.sell, pair?.updatedAt, pair?.isStale);
        assert.equal(model.description, client.description);
        assert.equal(model.observedAt, client.observedAt);
        assert.equal(renderDollarRateHtml(html, path, pair, language), html);
      }
    }
  });
  it('never invents an observation time, zero rate or a valid reading from malformed fields', () => {
    for (const value of [null, undefined, '', 0, 'invalid', '2026-10-04', '2026-10-04T21:00:00', '2026-02-30T12:00:00Z', '2026-04-31T12:00:00Z', '2026-10-04T24:00:00Z', '<script>x</script>']) assert.equal(validObservationTime(value), null);
    for (const buy of [undefined, null, '', true, {}, 0, -1, Infinity, 'NaN', '12<script>']) {
      const model = buildDollarRateSearchCopy({ buy, sell: 12.56, updatedAt: payload.updated_at_iso });
      assert.equal(model.hasRates, false);
      assert.equal(model.observedAt, null);
      assert.doesNotMatch(model.title + model.description, /0\.00|12\.56|2026|<script>/);
    }
    for (const language of ['es', 'en']) {
      const model = buildDollarRateSearchCopy({ buy: 12.34, sell: 12.56, updatedAt: 'invalid', isStale: true, language });
      assert.match(model.observation, language === 'es' ? /Hora de lectura no disponible/ : /Observation time unavailable/);
      assert.doesNotMatch(model.observation, /2026/);
    }
  });
  it('uses a caller-supplied clock only for age and never as the observation', () => {
    const input = { buy: 12.34, sell: 12.56, updatedAt: '2026-10-04T21:00:00Z', language: 'en' };
    const before = buildDollarRateSearchCopy({ ...input, now: Date.parse('2026-10-04T21:45:59Z') });
    const after = buildDollarRateSearchCopy({ ...input, now: Date.parse('2026-10-04T21:46:00Z') });
    assert.equal(before.isStale, false); assert.equal(after.isStale, true);
    assert.equal(before.observedAt, after.observedAt);
    assert.match(after.observation, /10\/4\/26, 5:00 PM/);
    assert.doesNotMatch(after.observation, /5:46/);
    const missing = buildDollarRateSearchCopy({ ...input, updatedAt: null, isStale: true, now: Date.parse('2026-10-04T21:46:00Z') });
    assert.equal(missing.observedAt, null);
    assert.equal(missing.observation, 'Observation time unavailable.');
  });
  it('formats the actual observation in Bolivia time regardless of host timezone', () => {
    const module = new URL('../frontend/src/utils/dollarRateSearchCopy.js', import.meta.url).href;
    const script = `import { buildDollarRateSearchCopy } from ${JSON.stringify(module)}; console.log(JSON.stringify(['es','en'].map(language => buildDollarRateSearchCopy({buy:12.34,sell:12.56,updatedAt:'2026-10-04T03:26:00Z',language}))));`;
    const run = (TZ) => spawnSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' });
    const west = run('America/Los_Angeles'), east = run('Asia/Tokyo');
    assert.equal(west.status, 0, west.stderr);
    assert.equal(east.status, 0, east.stderr);
    assert.equal(west.stdout, east.stdout);
    assert.match(JSON.parse(west.stdout)[1].observation, /10\/3\/26, 11:26 PM \(Bolivia\)/);
  });
  it('retains route navigation, canonical ownership, initial arithmetic and unrelated routes', () => {
    for (const path of Object.keys(DOLLAR_SEARCH_PAGES)) {
      const initial = sourceHtml(path), result = renderDollarRateHtml(initial, path, normalizeRates(payload));
      for (const nav of initial.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/g)) assert.ok(result.includes(nav[0]));
      assert.equal(result.match(/<h1[^>]*>(.*?)<\/h1>/)[1], initial.match(/<h1[^>]*>(.*?)<\/h1>/)[1]);
      if (path !== '/dolar-blue-hoy') assert.match(result, /data-live-usd100>1235<\/span>/);
      assert.ok(result.includes('<body class="google-anno-skip"'));
      assert.doesNotMatch(result, /data-overlays=/);
    }
    assert.equal(renderDollarRateHtml('unchanged', '/euro-a-boliviano', normalizeRates(payload)), 'unchanged');
    const euro = buildLiveRateSeoMeta({ buy: 13.3, sell: 13.4, page: 'euro', language: 'en' });
    assert.equal(euro.description, 'Euro blue / parallel in Bolivia: buy Bs 13.30, sell Bs 13.40. Parallel vs official EUR to BOB. Binance P2P.'); // This candidate must not silently rewrite other pages.
  });
  it('does not invent a build observation from build-clock time', async () => {
    const previous = [process.env.BUILD_RATE_BUY, process.env.BUILD_RATE_SELL];
    try {
      process.env.BUILD_RATE_BUY = '12.34'; process.env.BUILD_RATE_SELL = '12.56';
      const rate = await fetchLiveRate();
      assert.equal(rate.source, 'env'); assert.equal(rate.updatedAt, null);
    } finally {
      for (const [i, key] of ['BUILD_RATE_BUY', 'BUILD_RATE_SELL'].entries()) if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i];
    }
  });
  it('keeps the page available with an explicit missing-rate state when the API fails', async () => {
    const original = globalThis.fetch;
    try {
      for (const path of Object.keys(DOLLAR_SEARCH_PAGES)) for (const language of ['es', 'en']) {
        const calls = [];
        globalThis.fetch = async (input) => {
          calls.push(String(input));
          if (String(input).includes('/api/blue-rate')) throw new Error('fixture unavailable');
          return new Response(sourceHtml(path), { headers: { 'content-type': 'text/html' } });
        };
        const response = await middleware(new Request(`https://www.boliviablue.com${path}${language === 'en' ? '?lang=en' : ''}`, { headers: { Accept: 'text/html' } }));
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('x-bb-live-seo'), '0');
        assert.equal(calls.length, 2);
        assertParity(await response.text(), buildLiveRateSeoMeta({ page: DOLLAR_SEARCH_PAGES[path], language }));
      }
    } finally { globalThis.fetch = original; }
  });
  it('does not change hero, conversion math or other consumers of the citation component', () => {
    for (const name of ['DolarBlueHoy', 'CuantoEstaDolarBolivia']) {
      const source = readFileSync(new URL(`../frontend/src/pages/${name}.jsx`, import.meta.url), 'utf8');
      assert.doesNotMatch(source, /lastUpdated|setLastUpdated/);
      assert.match(source, /liveSeo\.observation/);
    }
    const citation = readFileSync(new URL('../frontend/src/components/AiCitationBlock.jsx', import.meta.url), 'utf8');
    assert.match(citation, /answerOverride \?\? buildRateAnswerParagraph/);
    assert.match(citation, /summaryLabel \?\?/);
    const hero = readFileSync(new URL('../frontend/src/components/MobileHeroRates.jsx', import.meta.url), 'utf8');
    assert.match(hero, /const conversion = live\.times\(100\)/);
  });
});
