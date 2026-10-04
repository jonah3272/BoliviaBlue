import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware, { config } from '../middleware.js';
import { getPlatformComparisonPage, SOURCES, REVIEWED_AT } from '../frontend/src/data/platformComparison.js';
import { platformComparisonPageForSearch, renderPlatformComparisonHtml } from '../seo/platformComparisonSeo.js';
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
  assert.equal(decode(html.match(/<title>([^<]*)<\/title>/)[1]), page.title);
  assert.equal(tags(html, 'h1').length, 1);
  assert.equal(decode(html.match(/<h1\b[^>]*>([^<]*)<\/h1>/)[1]), page.copy.heading);
  const cards = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map((m) => m[0]);
  assert.equal(cards.length, 6);
  assert.equal((html.match(/id="comparacion"/g) || []).length, 1);
  for (const provider of page.platforms) {
    const card = cards.find((item) => attrs(item)['data-platform'] === provider.partner);
    assert.ok(card);
    const text = decode(card);
    assert.ok(text.includes(provider.name));
    for (const value of [provider.purpose, provider.payment, provider.checks, provider.firstStep, provider.disclosure].filter(Boolean)) assert.ok(text.includes(value));
    for (const [, , href] of SOURCES[provider.partner]) assert.ok(tags(card, 'a').some((a) => a.href === href));
    const paid = tags(card, 'a').filter((a) => a.rel?.split(' ').includes('sponsored'));
    if (provider.referral) {
      assert.equal(paid.length, 1);
      assert.equal(paid[0].href, provider.referral);
      assert.ok(text.includes(provider.cta));
      assert.ok(paid[0].rel.includes('noopener') && paid[0].rel.includes('noreferrer'));
    } else assert.equal(paid.length, 0);
  }
  const visibleText = decode(main(html));
  for (const text of [...page.compareSteps, ...page.safety.flat(), page.copy.referenceWarning, page.copy.referralDisclosure, page.copy.safetyWarning, `${page.offer.brand} · ${page.copy.referralLabel}`, page.offer.qualification, page.offer.disclosure]) assert.ok(visibleText.includes(text), text);
  assert.equal(tags(html, 'time')[0].datetime, REVIEWED_AT);
  for (const [tag, key, value, attribute, expected] of [
    ['link', 'rel', 'canonical', 'href', page.canonical],
    ['meta', 'name', 'description', 'content', page.description],
    ['meta', 'property', 'og:url', 'content', page.canonical],
    ['meta', 'name', 'twitter:url', 'content', page.canonical],
    ['meta', 'property', 'og:title', 'content', page.title],
    ['meta', 'name', 'twitter:description', 'content', page.description],
  ]) {
    const found = identity(html, tag, key, value);
    assert.equal(found.length, 1);
    assert.equal(found[0][attribute], expected);
    assert.equal(found[0]['data-rh'], 'true');
  }
  assert.deepEqual(tags(html, 'link').filter((a) => a.hreflang).map((a) => [a.hreflang, a.href]), [
    ['es', 'https://www.boliviablue.com/plataformas'],
    ['en', 'https://www.boliviablue.com/plataformas?lang=en'],
    ['x-default', 'https://www.boliviablue.com/plataformas'],
  ]);
  assert.deepEqual(schemas(html), [page.comparisonSchema]);
}

describe('initial platform comparison', () => {
  it('renders the reviewed six providers, safety, disclosures and identity in ES and EN', () => {
    for (const language of ['es', 'en']) assertPage(renderPlatformComparisonHtml(template, `?lang=${language}`), getPlatformComparisonPage(language));
  });
  it('preserves guide direction, locale and hash in real links; canonical ignores unrelated queries', () => {
    for (const language of ['es', 'en']) {
      const html = renderPlatformComparisonHtml(template, `?lang=${language}&intent=receive_payments&operation=sell&utm_source=fixture`);
      const model = getPlatformComparisonPage(language);
      const internal = tags(main(html), 'a').filter((a) => a.href.startsWith('/'));
      for (const a of internal) assert.equal(new URL(a.href, 'https://www.boliviablue.com').searchParams.get('lang'), language === 'en' ? 'en' : null);
      assert.ok(internal.some((a) => a.href === model.buyGuide));
      assert.ok(internal.some((a) => a.href === model.cashGuide));
      const cash = new URL(model.cashGuide, 'https://www.boliviablue.com');
      assert.equal(cash.searchParams.get('intent'), 'buy_usdt');
      assert.equal(cash.searchParams.get('operation'), 'sell');
      assert.equal(cash.hash, '#guia');
      assert.equal(identity(html, 'link', 'rel', 'canonical')[0].href, model.canonical);
    }
  });
  it('uses the app locale policy for malformed/duplicate input and never embeds arbitrary query data', () => {
    for (const search of ['', '?lang=es', '?lang=en', '?lang=es&lang=en', '?lang=en&lang=es', '?lang=en?lang=en', '?lang=fr', '?lang=%22%3E%3Cscript%3E', '?lang=en&value=%24%26%3Cscript%3E']) {
      const page = platformComparisonPageForSearch(search);
      assert.equal(page.language, languageForLocation({ pathname: '/plataformas', search }));
      const html = renderPlatformComparisonHtml(template, search);
      assertPage(html, page);
      assert.doesNotMatch(html, /value=|lang=fr|%3Cscript%3E/);
    }
  });
  it('is idempotent and keeps non-SEO scripts, styles, stage robots and ad settings without executing tracking', () => {
    const once = renderPlatformComparisonHtml(template, '?lang=en');
    const twice = renderPlatformComparisonHtml(once, '?lang=en');
    assert.equal(main(once), main(twice));
    assertPage(twice, getPlatformComparisonPage('en'));
    const scripts = (html) => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]).filter((tag) => !tag.includes('application/ld+json'));
    assert.deepEqual(scripts(twice), scripts(template));
    const nonSeoLinks = (html) => tags(html, 'link').filter((n) => n.rel !== 'canonical' && !n.hreflang);
    assert.deepEqual(nonSeoLinks(twice), nonSeoLinks(template));
    assert.deepEqual(tags(twice, 'body'), tags(template, 'body'));
    assert.equal((twice.match(/data-seo-shell="plataformas"/g) || []).length, 1);
    assert.doesNotMatch(main(twice), /onclick=|<script|<iframe|data-offer-id=|data-financial-offer=/);
    assert.equal(tags(main(twice), 'a').filter((a) => a.rel?.includes('sponsored')).length, 4);
    const stage = renderPlatformComparisonHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"'));
    assert.equal(identity(stage, 'meta', 'name', 'robots')[0].content, 'noindex, nofollow');
  });
});

describe('platform comparison middleware', () => {
  it('serves each exact GET/HEAD route for bots and visitors using only the built shell', async () => {
    const previous = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      assert.equal(String(url), 'https://www.boliviablue.com/plataformas/index.html');
      return new Response(renderPlatformComparisonHtml(template), { headers: { 'content-type': 'text/html', 'content-length': '1', 'x-existing': 'keep' } });
    };
    try {
      for (const path of ['/plataformas', '/plataformas/', '/plataformas/index.html']) for (const method of ['GET', 'HEAD']) for (const userAgent of ['Mozilla/5.0', 'Googlebot']) {
        calls.length = 0;
        const response = await middleware(new Request(`https://www.boliviablue.com${path}?lang=en`, { method, headers: { accept: 'text/html', 'user-agent': userAgent } }));
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
        assert.equal(response.headers.get('x-existing'), 'keep');
        assert.equal(response.headers.get('content-length'), null);
        assert.equal(response.headers.get('cache-control'), 'public, s-maxage=300, stale-while-revalidate=900');
        const html = await response.text();
        if (method === 'HEAD') assert.equal(html, '');
        else assertPage(html, getPlatformComparisonPage('en'));
      }
    } finally { globalThis.fetch = previous; }
    assert.equal(config.matcher.length, 7);
    assert.equal(config.matcher.filter((route) => route.includes('|plataformas)')).length, 3);
  });
  it('returns localized 503 on unavailable shell and avoids recursion/non-document requests', async () => {
    const previous = globalThis.fetch;
    let calls = 0;
    try {
      for (const fail of [async () => { throw new Error('unavailable'); }, async () => new Response('', { status: 500 })]) {
        globalThis.fetch = async () => { calls++; return fail(); };
        for (const language of ['es', 'en']) for (const method of ['GET', 'HEAD']) {
          const response = await middleware(new Request(`https://www.boliviablue.com/plataformas?lang=${language}`, { method }));
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
      for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) assert.equal(await middleware(new Request('https://www.boliviablue.com/plataformas?lang=en', options)), undefined);
      assert.equal(calls, 0);
    } finally { globalThis.fetch = previous; }
  });
});
