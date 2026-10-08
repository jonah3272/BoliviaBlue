import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware, { config } from '../middleware.js';
import { DATA_DOCUMENTATION_PATHS, getDataDocumentationPage, PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON } from '../frontend/src/data/dataDocumentation.js';
import { dataDocumentationPageForSearch, renderDataDocumentationHtml } from '../seo/dataDocumentationSeo.js';
import { languageForLocation } from '../frontend/src/utils/pageLocale.js';

const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((m) => attrs(m[0]));
const main = (html) => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
const schemas = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const identity = (html, tag, key, value) => tags(html, tag).filter((item) => item[key] === value);

function assertPage(html, page) {
  assert.equal(tags(html, 'html')[0].lang, page.language);
  assert.equal(decode(html.match(/<title>([^<]*)<\/title>/)[1]), page.copy.title);
  assert.equal(tags(html, 'h1').length, 1);
  assert.equal(decode(html.match(/<h1\b[^>]*>([^<]*)<\/h1>/)[1]), page.copy.heading);
  assert.equal(tags(html, 'main').length, 1);
  assert.equal(tags(html, 'main')[0]['data-seo-shell'], page.path.slice(1));
  for (const [tag, key, value, attribute, expected] of [
    ['link', 'rel', 'canonical', 'href', page.canonical],
    ['meta', 'name', 'description', 'content', page.copy.description],
    ['meta', 'name', 'keywords', 'content', page.copy.keywords],
    ['meta', 'property', 'og:url', 'content', page.canonical],
    ['meta', 'name', 'twitter:url', 'content', page.canonical],
    ['meta', 'property', 'og:title', 'content', page.copy.title],
    ['meta', 'name', 'twitter:description', 'content', page.copy.description],
  ]) {
    const found = identity(html, tag, key, value);
    assert.equal(found.length, 1);
    assert.equal(found[0][attribute], expected);
    assert.equal(found[0]['data-rh'], 'true');
  }
  assert.deepEqual(tags(html, 'link').filter((a) => a.hreflang).map((a) => [a.hreflang, a.href]), [
    ['es', 'https://www.boliviablue.com' + page.path],
    ['en', 'https://www.boliviablue.com' + page.path + '?lang=en'],
    ['x-default', 'https://www.boliviablue.com' + page.path],
  ]);
  assert.deepEqual(schemas(html), [page.webPageSchema, page.breadcrumbSchema, page.history ? page.datasetSchema : page.faqSchema]);
}

describe('shared initial methodology and history documentation', () => {
  it('renders the qualified source, calculation, cadence, provenance and citation text in both languages', () => {
    for (const language of ['es', 'en']) {
      const page = getDataDocumentationPage('/fuente-de-datos', language);
      const html = renderDataDocumentationHtml(template, page.path, `?lang=${language}`);
      assertPage(html, page);
      const text = decode(main(html));
      for (const key of ['introduction', 'sourceDescription', 'calculationDescription', 'buyDefinition', 'sellDefinition', 'midDefinition', 'frequencyDescription', 'timestampDescription', 'officialDescription', 'officialSeparation', 'historyDescription', 'exportLimits', 'provenanceDescription', 'coverageDescription', 'apiDescription', 'citeIntroduction', 'citation', 'citationAlternatives', 'limitationsDescription', 'executionWarning', 'delayWarning']) assert.ok(text.includes(page.copy[key]), key);
      for (const { q, a } of page.faqItems) assert.ok(text.includes(q) && text.includes(a));
      assert.doesNotMatch(text, /lectura verificada|verified reading|transparent and up to date|1 USDT = 1 USD/);
    }
  });
  it('gives history useful explanations and real export URLs without manufacturing observations or current coverage', () => {
    for (const language of ['es', 'en']) {
      const page = getDataDocumentationPage('/datos-historicos', language);
      const html = renderDataDocumentationHtml(template, page.path, `?lang=${language}`);
      assertPage(html, page);
      const text = decode(main(html));
      for (const value of [page.historyIntroduction, page.initialDataNotice, page.copy.datasetDescription, page.copy.chartDescription, page.copy.recordsDescription, page.copy.downloadsDescription, page.copy.publicRangeDescription, page.methodology.provenanceDescription, page.methodology.coverageDescription, page.methodology.citation]) assert.ok(text.includes(value), value);
      assert.doesNotMatch(html, /<table|<time|dateModified|datePublished|temporalCoverage|updateFrequency|ExchangeRateSpecification|12\.34|12\.56|fixture|50,000|50\.000|No data for this period/);
      assert.equal(schemas(html).some((schema) => schema['@type'] === 'FAQPage'), false);
      assert.deepEqual(page.datasetSchema.distribution.map((d) => d.contentUrl), [PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON]);
      assert.ok(tags(main(html), 'a').some((a) => a.href === page.local('/contacto#data-request')));
    }
  });
  it('retains English on internal links and leaves exact public export query contracts untouched', () => {
    for (const path of DATA_DOCUMENTATION_PATHS) for (const language of ['es', 'en']) {
      const page = getDataDocumentationPage(path, language);
      const html = renderDataDocumentationHtml(template, path, `?lang=${language}&range=all&utm_source=arbitrary`);
      for (const a of tags(main(html), 'a').filter((a) => a.href.startsWith('/'))) assert.equal(new URL(a.href, 'https://www.boliviablue.com').searchParams.get('lang'), language === 'en' ? 'en' : null);
      const exports = tags(main(html), 'a').filter((a) => a.href.includes('/api/historical-data.'));
      assert.deepEqual(exports.map((a) => a.href), [PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON]);
      assert.equal(identity(html, 'link', 'rel', 'canonical')[0].href, page.canonical);
      assert.doesNotMatch(html, /range=all|utm_source=arbitrary/);
    }
  });
  it('keeps the API example contained on narrow screens in React and initial HTML', () => {
    const component = readFileSync(new URL('../frontend/src/pages/DataSource.jsx', import.meta.url), 'utf8');
    const code = component.match(/<code className="([^"]*)">\s*GET \{BASE_URL\}\/api\/blue-rate\s*<\/code>/);
    assert.ok(code, 'The API example retains its original visible command');
    for (const name of ['block', 'min-w-0', 'break-all']) assert.ok(code[1].split(' ').includes(name));
    for (const language of ['es', 'en']) {
      const html = renderDataDocumentationHtml(template, '/fuente-de-datos', `?lang=${language}`);
      assert.match(html, /<p class="break-words font-mono text-sm">GET https:\/\/www\.boliviablue\.com\/api\/blue-rate<\/p>/);
    }
  });
  it('uses the same malformed/duplicate locale policy as React and supports every exact route', () => {
    for (const path of DATA_DOCUMENTATION_PATHS) for (const search of ['', '?lang=es', '?lang=en', '?lang=es&lang=en', '?lang=en&lang=es', '?lang=en?lang=en', '?lang=fr', '?lang=%22%3E%3Cscript%3E']) {
      const page = dataDocumentationPageForSearch(path, search);
      assert.equal(page.language, languageForLocation({ pathname: path, search }));
      assertPage(renderDataDocumentationHtml(template, path, search), page);
    }
    assert.throws(() => renderDataDocumentationHtml(template, '/unrelated'), /Unsupported/);
  });
  it('escapes content/head/schema and keeps application/ad configuration and noindex ownership intact', () => {
    const page = getDataDocumentationPage('/fuente-de-datos');
    const saved = { title: page.copy.title, sourceDescription: page.copy.sourceDescription };
    try {
      page.copy.title = 'A "quote" & <tag> $&';
      page.copy.sourceDescription = '</script><script>alert("fixture")</script>';
      const html = renderDataDocumentationHtml(template, page.path);
      assertPage(html, getDataDocumentationPage(page.path));
      assert.ok(html.includes('A &quot;quote&quot; &amp; &lt;tag&gt; $&'));
      assert.ok(main(html).includes('&lt;/script&gt;&lt;script&gt;alert'));
      assert.doesNotMatch(main(html), /<script/);
    } finally { Object.assign(page.copy, saved); }
    for (const path of DATA_DOCUMENTATION_PATHS) {
      const once = renderDataDocumentationHtml(template, path, '?lang=en');
      const twice = renderDataDocumentationHtml(once, path, '?lang=en');
      assertPage(twice, getDataDocumentationPage(path, 'en'));
      assert.equal(main(once), main(twice));
      const scripts = (html) => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).filter((tag) => !tag.includes('application/ld+json'));
      assert.deepEqual(scripts(twice), scripts(template));
      assert.deepEqual(tags(twice, 'body'), tags(template, 'body'));
      assert.deepEqual(tags(twice, 'link').filter((n) => n.rel !== 'canonical' && !n.hreflang), tags(template, 'link').filter((n) => n.rel !== 'canonical' && !n.hreflang));
      assert.doesNotMatch(main(twice), /onclick=|<script|<iframe|data-offer-id|data-overlays=/);
      const stage = renderDataDocumentationHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"'), path);
      assert.equal(identity(stage, 'meta', 'name', 'robots')[0].content, 'noindex, nofollow');
    }
  });
});

describe('documentation middleware isolation and failure semantics', () => {
  it('serves GET/HEAD variants for all visitors with one static asset request and no data dependency', async () => {
    const previous = globalThis.fetch;
    const calls = [];
    try {
      for (const path of DATA_DOCUMENTATION_PATHS) {
        globalThis.fetch = async (url, options) => {
          calls.push({ url: String(url), options });
          assert.equal(String(url), `https://www.boliviablue.com${path}/index.html`);
          return new Response(renderDataDocumentationHtml(template, path), { headers: { 'content-length': '1', 'x-existing': 'keep' } });
        };
        for (const suffix of ['', '/', '/index.html']) for (const method of ['GET', 'HEAD']) for (const userAgent of ['Mozilla/5.0', 'Googlebot']) for (const language of ['es', 'en']) {
          calls.length = 0;
          const response = await middleware(new Request(`https://www.boliviablue.com${path}${suffix}?lang=${language}`, { method, headers: { accept: 'text/html', 'user-agent': userAgent } }));
          assert.equal(response.status, 200);
          assert.equal(calls.length, 1);
          assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
          assert.equal(response.headers.get('content-length'), null);
          assert.equal(response.headers.get('x-existing'), 'keep');
          assert.equal(response.headers.get('cache-control'), 'public, s-maxage=300, stale-while-revalidate=900');
          const html = await response.text();
          if (method === 'HEAD') assert.equal(html, '');
          else assertPage(html, getDataDocumentationPage(path, language));
        }
      }
    } finally { globalThis.fetch = previous; }
    assert.equal(config.matcher.length, 7);
    for (const path of DATA_DOCUMENTATION_PATHS) assert.equal(config.matcher.filter((route) => route.includes('|' + path.slice(1) + '|')).length, 3);
  });
  it('returns localized no-store 503 for failed, empty or malformed assets rather than an empty 200', async () => {
    const previous = globalThis.fetch;
    try {
      for (const fail of [async () => { throw new Error('offline'); }, async () => new Response('', { status: 500 }), async () => new Response(''), async () => new Response('<html><head></head><body>Wrong asset</body></html>')]) {
        globalThis.fetch = fail;
        for (const path of DATA_DOCUMENTATION_PATHS) for (const language of ['es', 'en']) for (const method of ['GET', 'HEAD']) {
          const response = await middleware(new Request(`https://www.boliviablue.com${path}?lang=${language}`, { method }));
          assert.equal(response.status, 503);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
          assert.equal(response.headers.get('retry-after'), '60');
          const body = await response.text();
          if (method === 'HEAD') assert.equal(body, '');
          else assert.equal(tags(body, 'html')[0].lang, language);
        }
      }
    } finally { globalThis.fetch = previous; }
  });
  it('does not intercept non-documents, unsupported methods or its own static asset fetch', async () => {
    const previous = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => { calls++; throw new Error('Unexpected fetch'); };
    try {
      for (const path of DATA_DOCUMENTATION_PATHS) for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) assert.equal(await middleware(new Request(`https://www.boliviablue.com${path}?lang=en`, options)), undefined);
      assert.equal(calls, 0);
    } finally { globalThis.fetch = previous; }
  });
});
