import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import middleware, { config } from '../middleware.js';
import { ABOUT_COPY, getAboutPage } from '../frontend/src/data/aboutPage.js';
import { aboutPageForSearch, renderAboutHtml } from '../seo/aboutSeo.js';
import { languageForLocation } from '../frontend/src/utils/pageLocale.js';
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = text => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const main = html => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
const schemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const scripts = html => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0]).filter(tag => !tag.includes('application/ld+json'));
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function check(html, lang) {
  const page = getAboutPage(lang);
  assert.match(html, new RegExp(`<html lang="${lang}"`));
  assert.ok(html.includes(`<title>${page.title}</title>`));
  assert.ok(html.includes(`rel="canonical" href="${page.canonical}"`));
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.deepEqual(schemas(html), [page.breadcrumbSchema]);
  for (const [key, value] of Object.entries(ABOUT_COPY[lang])) if (key !== 'aboutHeaderSubtitle') assert.ok(decode(main(html)).includes(value), key);
  assert.doesNotMatch(html, /aboutDataSourcesDesc|cada (?:15|5) minutos|every (?:15|5) minutes|every few minutes|cada pocos minutos|típicamente fija|typically fixed|very infrequently|dateModified|datePublished/);
}
for (const lang of ['es', 'en']) test(`About full initial HTML and bounded methodology (${lang})`, () => check(renderAboutHtml(template, `?lang=${lang}`), lang));
test('shared copy matches the available-source and saved-observation implementation', () => {
  const collector = source('api/_lib/p2pCrossSource.js');
  const provenance = source('shared/rateProvenance.cjs');
  for (const id of ['binance', 'eldorado', 'okx', 'bybit']) assert.ok(provenance.includes(`'${id}'`));
  assert.match(collector, /median\(platforms\.map/);
  assert.match(provenance, /median_of_platform_quotes/);
  assert.match(source('api/_lib/binanceRefresh.js'), /source_observation: createSourceObservation/);
  assert.match(source('api/_lib/officialRate.js'), /official/);
  assert.match(source('shared/officialProvenance.cjs'), /readOfficialObservation/);
  assert.doesNotMatch(source('backend/officialRateClient.js'), /exchangerate-api/);
  assert.match(source('backend/scheduler-supabase.js'), /getOfficialRate/);
  assert.match(ABOUT_COPY.es.aboutOfficialRateDesc, /procedencia verificada/);
  assert.match(ABOUT_COPY.es.aboutOfficialRateDesc, /fuente no verificada/);
  assert.match(ABOUT_COPY.es.aboutDataSource2, /fechas originales/);
  assert.match(ABOUT_COPY.en.aboutOfficialRateDesc, /verified Central Bank/);
  assert.match(ABOUT_COPY.en.aboutOfficialRateDesc, /source unverified/);
  assert.match(ABOUT_COPY.en.aboutDataSource2, /original dates/);
  assert.match(ABOUT_COPY.es.aboutBlueMarketDesc, /una sola plataforma/);
  assert.match(ABOUT_COPY.en.aboutBlueMarketDesc, /just one platform/);
  assert.match(ABOUT_COPY.es.aboutDataSource4, /registros antiguos/);
  assert.match(ABOUT_COPY.en.aboutDataSource4, /Older records/);
});
test('locale normalization, idempotence, noindex, script retention and malformed shell handling', () => {
  for (const search of ['', '?lang=en', '?lang=es&lang=en', '?lang=en&lang=es', '?lang=en?lang=en', '?lang=fr', '?lang=%22%3E%3Cscript%3E']) {
    const page = aboutPageForSearch(search);
    assert.equal(page.language, languageForLocation({ pathname: '/acerca-de', search }));
    const once = renderAboutHtml(template, search);
    const twice = renderAboutHtml(once, search);
    check(twice, page.language);
    assert.equal(main(twice), main(once));
    assert.deepEqual(scripts(twice), scripts(template));
    assert.doesNotMatch(main(twice), /<script|onclick=|<iframe|utm_source=/);
    const stage = renderAboutHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"'), search);
    assert.match(stage, /name="robots" content="noindex, nofollow"/);
  }
  for (const invalid of ['', '<html><head></head><body></body></html>']) assert.throws(() => renderAboutHtml(invalid), /shell is invalid/);
});
test('About middleware supports ES/EN, GET/HEAD, all path forms and both visitor types without API calls', async () => {
  const original = globalThis.fetch; const calls = [];
  try {
    globalThis.fetch = async (url, options) => { calls.push({ url: String(url), options }); return new Response(renderAboutHtml(template), { headers: { 'content-type': 'text/html', 'content-length': '1', 'x-existing': 'keep' } }); };
    for (const suffix of ['', '/', '/index.html']) for (const method of ['GET', 'HEAD']) for (const agent of ['Mozilla/5.0', 'Googlebot']) for (const lang of ['es', 'en']) {
      calls.length = 0;
      const response = await middleware(new Request(`https://www.boliviablue.com/acerca-de${suffix}?lang=${lang}`, { method, headers: { accept: 'text/html', 'user-agent': agent } }));
      assert.equal(response.status, 200); assert.equal(calls.length, 1);
      assert.equal(calls[0].url, 'https://www.boliviablue.com/acerca-de/index.html');
      assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
      assert.equal(response.headers.get('content-length'), null);
      assert.equal(response.headers.get('x-existing'), 'keep');
      const html = await response.text();
      if (method === 'HEAD') assert.equal(html, ''); else check(html, lang);
    }
    assert.equal(config.matcher.length, 7);
    assert.equal(config.matcher.filter(route => route.includes('|acerca-de|')).length, 3);
  } finally { globalThis.fetch = original; }
});
test('About unavailable assets return localized no-store 503 for GET/HEAD', async () => {
  const original = globalThis.fetch;
  try {
    for (const fail of [async () => { throw new Error('offline'); }, async () => new Response('', { status: 500 }), async () => new Response(''), async () => new Response('<html><head></head><body>Wrong asset</body></html>')]) {
      globalThis.fetch = fail;
      for (const lang of ['es', 'en']) for (const method of ['GET', 'HEAD']) {
        const response = await middleware(new Request(`https://www.boliviablue.com/acerca-de?lang=${lang}`, { method }));
        assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow'); assert.equal(response.headers.get('retry-after'), '60');
        const html = await response.text(); if (method === 'HEAD') assert.equal(html, ''); else assert.ok(html.includes(`lang="${lang}"`));
      }
    }
  } finally { globalThis.fetch = original; }
});
test('About bypasses unsupported methods, non-documents and recursive static fetches', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('unexpected fetch'); };
  try {
    for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) assert.equal(await middleware(new Request('https://www.boliviablue.com/acerca-de', options)), undefined);
  } finally { globalThis.fetch = original; }
});
test('built About contains the shared Spanish article and retained app assets', { skip: !existsSync(new URL('../frontend/dist/acerca-de/index.html', import.meta.url)) }, () => {
  const html = source('frontend/dist/acerca-de/index.html'); check(html, 'es'); assert.match(html, /assets\/index-/);
});
