import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import middleware, { config } from '../middleware.js';
import { getApiDocumentation } from '../frontend/src/data/apiDocumentation.js';
import { apiDocumentationPageForSearch, renderApiDocumentationHtml } from '../seo/apiDocumentationSeo.js';
import { languageForLocation } from '../frontend/src/utils/pageLocale.js';

const require = createRequire(import.meta.url);
const { sourcePayload, createSourceObservation } = require('../shared/rateProvenance.cjs');
const { MAX_ROWS, exportOptions, fetchHistoricalExport, toCsv } = require('../api/_lib/historicalExport');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const main = (html) => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
const schema = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const scripts = (html) => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).filter((tag) => !tag.includes('application/ld+json'));
const expectedPaths = ['/api/blue-rate', '/api/historical-data.csv', '/api/historical-data.json', '/api/health'];

for (const language of ['es', 'en']) {
  test(`API initial HTML includes the shared contract, units, time, provenance and coverage (${language})`, () => {
    const page = getApiDocumentation(language);
    const html = renderApiDocumentationHtml(template, `?lang=${language}`);
    const text = decode(main(html));
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes(`<html lang="${language}"`));
    assert.ok(html.includes(`<title>${page.copy.title}</title>`));
    assert.ok(html.includes(`rel="canonical" href="${page.canonical}"`));
    assert.deepEqual(schema(html), [page.apiSchema]);
    for (const note of [page.copy.introduction, ...page.notes, page.copy.additionalAccess]) assert.ok(text.includes(note), note);
    assert.deepEqual(page.endpoints.map((endpoint) => endpoint.path), expectedPaths);
    for (const endpoint of page.endpoints) {
      assert.ok(text.includes(`GET ${endpoint.path}`));
      assert.ok(text.includes(endpoint.description));
      assert.ok(text.includes(typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2)));
      for (const param of endpoint.parameters) assert.ok(text.includes(param.description));
    }
    assert.doesNotMatch(text, /12\.34|12\.56|29250|2026-10-03|2026-10-14|No data|Sin datos/);
    assert.doesNotMatch(html, /ExchangeRateSpecification|dateModified|datePublished|temporalCoverage|updateFrequency|R\/P15M|cada 15|every 15/);
  });
  test(`API links preserve locale without adding language parameters to API requests (${language})`, () => {
    const page = getApiDocumentation(language);
    const html = renderApiDocumentationHtml(template, `?lang=${language}&utm_source=ignored&range=all`);
    const hrefs = [...main(html).matchAll(/href="([^"]*)"/g)].map((m) => decode(m[1]));
    for (const endpoint of page.endpoints) assert.ok(hrefs.includes(endpoint.example.url));
    for (const path of ['/', '/dolar-blue-hoy', '/datos-historicos', '/fuente-de-datos', '/contacto#data-request', '/prensa']) assert.ok(hrefs.includes(page.local(path)));
    assert.doesNotMatch(html, /utm_source=ignored|range=all/);
  });
}

test('locale normalization, re-rendering, script retention and noindex ownership match existing documentation', () => {
  for (const search of ['', '?lang=en', '?lang=es&lang=en', '?lang=en&lang=es', '?lang=en?lang=en', '?lang=fr', '?lang=%22%3E%3Cscript%3E']) {
    const page = apiDocumentationPageForSearch(search);
    assert.equal(page.language, languageForLocation({ pathname: '/api-docs', search }));
    const once = renderApiDocumentationHtml(template, search);
    const twice = renderApiDocumentationHtml(once, search);
    assert.equal(main(once), main(twice));
    assert.deepEqual(schema(twice), [page.apiSchema]);
    assert.deepEqual(scripts(twice), scripts(template));
    assert.doesNotMatch(main(twice), /<script|onclick=|<iframe|utm_source=/);
    const stage = renderApiDocumentationHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"'), search);
    assert.match(stage, /name="robots" content="noindex, nofollow"/);
  }
  for (const invalid of ['', '<html><head></head><body></body></html>']) assert.throws(() => renderApiDocumentationHtml(invalid), /shell is invalid/);
});

test('documented range, cap, CSV columns and provenance enums match the actual export contract', async () => {
  const page = getApiDocumentation('en');
  const csv = page.endpoints[1];
  const json = page.endpoints[2];
  assert.equal(MAX_ROWS, 4000);
  assert.deepEqual(csv.parameters[0].options, ['30d', 'all']);
  assert.equal(exportOptions({ limit: 5000 }).limit, MAX_ROWS);
  assert.equal(exportOptions().range, '30d');
  for (const range of ['90d', '1y']) assert.throws(() => exportOptions({ range }), { statusCode: 400 });
  for (const limit of [0, -1, 1.5, 'bad']) assert.throws(() => exportOptions({ limit }), { statusCode: 400 });
  assert.ok(csv.response.includes(toCsv([]).trim()));
  const t = '2026-10-03T12:00:00Z';
  const row = { t, buy: 12.34, sell: 12.56, mid: 12.45 };
  const known = { ...row, source_observation: createSourceObservation({ ...row, platforms: [{ id: 'binance', buy: row.buy, sell: row.sell }] }, t) };
  for (const [rows, provenance] of [[[], 'unavailable_for_historical_rows'], [[row], 'unavailable_for_historical_rows'], [[known], 'persisted_observation'], [[row, known], 'mixed']]) {
    const query = { select() { return this; }, lte() { return this; }, gte() { return this; }, order() { return this; }, range() { return this; }, then(resolve) { return Promise.resolve({ data: rows }).then(resolve); } };
    const result = await fetchHistoricalExport({ from: () => query }, exportOptions({}, new Date(t)));
    assert.equal(result.metadata.source_provenance, provenance);
    for (const key of Object.keys(result.metadata)) assert.ok(json.response.includes(key), key);
    for (const point of result.points) for (const key of Object.keys(point)) assert.ok(json.response.includes(key), key);
  }
  for (const value of [row, { ...known, source_observation: { ...known.source_observation, observed_at: '2020-01-01T00:00:00Z' } }]) {
    assert.equal(sourcePayload(value).source_observation, null);
    assert.deepEqual(sourcePayload(value).sources_used, []);
  }
  assert.equal(sourcePayload(known).source_provenance, 'persisted_observation');
});

test('API middleware handles all locale, visitor and GET/HEAD variants without rate or archive requests', async () => {
  const previous = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      assert.equal(String(url), 'https://www.boliviablue.com/api-docs/index.html');
      return new Response(renderApiDocumentationHtml(template), { headers: { 'content-length': '1', 'x-existing': 'keep' } });
    };
    for (const suffix of ['', '/', '/index.html']) for (const method of ['GET', 'HEAD']) for (const userAgent of ['Mozilla/5.0', 'Googlebot']) for (const language of ['es', 'en']) {
      calls.length = 0;
      const response = await middleware(new Request(`https://www.boliviablue.com/api-docs${suffix}?lang=${language}`, { method, headers: { accept: 'text/html', 'user-agent': userAgent } }));
      assert.equal(response.status, 200);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
      assert.equal(response.headers.get('content-length'), null);
      assert.equal(response.headers.get('x-existing'), 'keep');
      const html = await response.text();
      if (method === 'HEAD') assert.equal(html, '');
      else assert.deepEqual(schema(html), [getApiDocumentation(language).apiSchema]);
    }
    for (const matcher of config.matcher.filter((value) => value.includes(':page'))) assert.ok(matcher.includes('|api-docs|'));
    calls.length = 0;
    for (const request of [new Request('https://www.boliviablue.com/api-docs', { method: 'POST' }), new Request('https://www.boliviablue.com/api-docs', { headers: { 'x-bb-skip-live-seo': '1' } }), new Request('https://www.boliviablue.com/api-docs', { headers: { accept: 'application/json' } })]) assert.equal(await middleware(request), undefined);
    assert.equal(calls.length, 0);
  } finally { globalThis.fetch = previous; }
});

test('unavailable or malformed static assets return honest 503s without false quotes', async () => {
  const previous = globalThis.fetch;
  try {
    for (const result of [() => Promise.reject(new Error('offline')), () => new Response('', { status: 404 }), () => new Response('<html></html>')]) {
      globalThis.fetch = result;
      for (const language of ['es', 'en']) for (const method of ['GET', 'HEAD']) {
        const response = await middleware(new Request(`https://www.boliviablue.com/api-docs?lang=${language}`, { method, headers: { accept: 'text/html' } }));
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
        assert.equal(response.headers.get('retry-after'), '60');
        const html = await response.text();
        if (method === 'HEAD') assert.equal(html, '');
        else assert.ok(html.includes(`<html lang="${language}"`));
      }
    }
  } finally { globalThis.fetch = previous; }
});

test('production build includes the API contract in its HTML before any JavaScript', { skip: !existsSync(new URL('../frontend/dist/api-docs/index.html', import.meta.url)) }, () => {
  const html = readFileSync(new URL('../frontend/dist/api-docs/index.html', import.meta.url), 'utf8');
  assert.equal(main(html), main(renderApiDocumentationHtml(template)));
  assert.deepEqual(schema(html), [getApiDocumentation().apiSchema]);
});
