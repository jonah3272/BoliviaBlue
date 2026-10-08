import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware, { config } from '../middleware.js';
import { getCalculatorPage } from '../frontend/src/data/calculatorPage.js';
import { calculatorPageForSearch, renderCalculatorHtml } from '../seo/calculatorSeo.js';
import { languageForLocation } from '../frontend/src/utils/pageLocale.js';

const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => attrs(m[0]));
const main = (html) => html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
const schemas = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const identity = (html, tag, key, value) => tags(html, tag).filter((item) => item[key] === value);

function assertPage(html, page) {
  assert.equal(tags(html, 'html')[0].lang, page.language);
  assert.equal(tags(html, 'title').length, 1);
  assert.equal(decode(html.match(/<title>([^<]*)<\/title>/)[1]), page.title);
  assert.equal(tags(html, 'h1').length, 1);
  assert.equal(decode(html.match(/<h1\b[^>]*>([^<]*)<\/h1>/)[1]), page.heading);
  const visible = decode(main(html));
  for (const value of [page.introduction, page.presetsHeading, page.presetsNote, page.helpHeading, ...page.sections.flatMap((section) => [section.title, ...section.paragraphs])]) assert.ok(visible.includes(value), value);
  for (const preset of page.presets) {
    assert.ok(tags(main(html), 'a').some((a) => a.href === preset.href));
    assert.ok(visible.includes(preset.label));
  }
  assert.ok(tags(main(html), 'a').some((a) => a.href === page.methodology.href));
  assert.deepEqual(schemas(html), [page.webAppSchema]);
  for (const [tag, key, value, attribute, expected] of [
    ['link', 'rel', 'canonical', 'href', page.canonical],
    ['meta', 'name', 'description', 'content', page.description],
    ['meta', 'property', 'og:url', 'content', page.canonical],
    ['meta', 'name', 'twitter:url', 'content', page.canonical],
    ['meta', 'property', 'og:title', 'content', page.title],
    ['meta', 'name', 'twitter:description', 'content', page.description],
  ]) {
    const found = identity(html, tag, key, value);
    assert.equal(found.length, 1); assert.equal(found[0][attribute], expected);
    assert.equal(found[0]['data-rh'], 'true');
  }
  assert.deepEqual(tags(html, 'link').filter((a) => a.hreflang).map((a) => [a.hreflang, a.href]), [
    ['es', 'https://www.boliviablue.com/calculadora'],
    ['en', 'https://www.boliviablue.com/calculadora?lang=en'],
    ['x-default', 'https://www.boliviablue.com/calculadora'],
  ]);
  assert.doesNotMatch(html, /aggregateRating|ratingValue|reviewCount|dateModified|currentExchangeRate/);
  assert.doesNotMatch(visible, /cada 15|every 15|tiempo real|real.time|≈|\d+\.\d{2} (?:BOB|Bs)/);
}

describe('initial calculator content', () => {
  it('shares useful copy, presets and identity in both locales without rate values or fabricated freshness', () => {
    for (const language of ['es', 'en']) assertPage(renderCalculatorHtml(template, `?lang=${language}`), getCalculatorPage(language));
  });
  it('canonicalizes amounts and arbitrary query parameters to the existing locale page', () => {
    for (const language of ['es', 'en']) {
      const page = getCalculatorPage(language);
      assert.deepEqual(page.presets.map((preset) => preset.preset), [{ usd: '15' }, { usd: '100' }, { usd: '1000' }, { usd: '10000' }, { bob: '5000' }]);
      for (const query of ['usd=15', 'usd=100', 'usd=1000', 'usd=10000', 'bob=5000', 'usd=%3Cscript%3E&ref=tracking']) {
        const html = renderCalculatorHtml(template, `?lang=${language}&${query}`);
        assertPage(html, page);
        for (const link of tags(main(html), 'a')) assert.equal(new URL(link.href, 'https://www.boliviablue.com').searchParams.get('lang'), language === 'en' ? 'en' : null);
      }
    }
  });
  it('matches app locale normalization and never embeds arbitrary query data', () => {
    for (const search of ['', '?lang=es', '?lang=en', '?lang=es&lang=en', '?lang=en&lang=es', '?lang=en?lang=en', '?lang=fr', '?lang=%22%3E%3Cscript%3E']) {
      const page = calculatorPageForSearch(search);
      assert.equal(page.language, languageForLocation({ pathname: '/calculadora', search }));
      assertPage(renderCalculatorHtml(template, search), page);
    }
  });
  it('is idempotent and preserves application scripts, styles and staging robots', () => {
    const once = renderCalculatorHtml(template, '?lang=en');
    const twice = renderCalculatorHtml(once, '?lang=en&usd=100');
    assert.equal(main(once), main(twice)); assertPage(twice, getCalculatorPage('en'));
    const scripts = (html) => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).filter((tag) => !tag.includes('application/ld+json'));
    assert.deepEqual(scripts(twice), scripts(template));
    const nonSeoLinks = (html) => tags(html, 'link').filter((n) => n.rel !== 'canonical' && !n.hreflang);
    assert.deepEqual(nonSeoLinks(twice), nonSeoLinks(template));
    assert.equal((twice.match(/data-seo-shell="calculadora"/g) || []).length, 1);
    const stage = renderCalculatorHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"'));
    assert.equal(identity(stage, 'meta', 'name', 'robots')[0].content, 'noindex, nofollow');
  });
});

describe('calculator middleware', () => {
  it('serves localized GET/HEAD for browsers and bots with one static-shell fetch and no rate requests', async () => {
    const previous = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      assert.equal(new URL(url).pathname, '/calculadora/index.html');
      return new Response(renderCalculatorHtml(template), { headers: { 'content-type': 'text/html', 'content-length': '1', 'x-existing': 'keep' } });
    };
    try {
      for (const path of ['/calculadora', '/calculadora/', '/calculadora/index.html']) for (const method of ['GET', 'HEAD']) for (const userAgent of ['Mozilla/5.0', 'Googlebot']) for (const language of ['es', 'en']) {
        calls.length = 0;
        const response = await middleware(new Request(`https://www.boliviablue.com${path}?usd=100&lang=${language}`, { method, headers: { accept: 'text/html', 'user-agent': userAgent } }));
        assert.equal(response.status, 200); assert.equal(calls.length, 1);
        assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
        assert.equal(response.headers.get('x-existing'), 'keep');
        assert.equal(response.headers.get('content-length'), null);
        assert.equal(response.headers.get('cache-control'), 'public, s-maxage=300, stale-while-revalidate=900');
        const html = await response.text();
        if (method === 'HEAD') assert.equal(html, '');
        else assertPage(html, getCalculatorPage(language));
      }
    } finally { globalThis.fetch = previous; }
    assert.equal(config.matcher.length, 7);
    assert.equal(config.matcher.filter((route) => route.includes('|calculadora|')).length, 3);
  });
  it('fails truthfully in the selected locale and skips recursion and non-document requests', async () => {
    const previous = globalThis.fetch;
    let calls = 0;
    try {
      for (const fail of [async () => { throw new Error('unavailable'); }, async () => new Response('', { status: 500 })]) {
        globalThis.fetch = async () => { calls++; return fail(); };
        for (const language of ['es', 'en']) for (const method of ['GET', 'HEAD']) {
          const response = await middleware(new Request(`https://www.boliviablue.com/calculadora?lang=${language}`, { method }));
          assert.equal(response.status, 503);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
          assert.equal(response.headers.get('retry-after'), '60');
          const body = await response.text();
          if (method === 'HEAD') assert.equal(body, '');
          else assert.equal(tags(body, 'html')[0].lang, language);
        }
      }
      calls = 0;
      for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) assert.equal(await middleware(new Request('https://www.boliviablue.com/calculadora?lang=en', options)), undefined);
      assert.equal(calls, 0);
    } finally { globalThis.fetch = previous; }
  });
});
