import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import middleware, { config } from '../middleware.js';
import { buyGuidePageForSearch, renderBuyGuideHtml } from '../seo/buyGuideSeo.js';
import { getEldoradoGuide } from '../frontend/src/data/eldoradoGuide.js';
import { getFinancialOffer, ELDORADO_REFERRAL_LINK, TAKENOS_REFERRAL_LINK } from '../frontend/src/config/referrals.js';

const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const schemas = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));

describe('initial buying guide HTML', () => {
  it('uses the same reviewed visible steps, disclosure and schema for each language and goal', () => {
    for (const language of ['es', 'en']) for (const intent of ['buy_usdt', 'receive_payments']) for (const operation of ['buy', 'sell']) {
      const search = `?lang=${language}&intent=${intent}&operation=${operation}`;
      const page = buyGuidePageForSearch(search);
      const html = renderBuyGuideHtml(template, search);
      const text = decode(html);
      const expected = intent === 'buy_usdt' ? getEldoradoGuide(language, operation).steps : getFinancialOffer(language, intent).steps;
      assert.deepEqual(page.offer.steps, expected);
      for (const [heading, body] of expected) assert.ok(text.includes(heading) && text.includes(body));
      assert.ok(text.includes(page.offer.disclosure));
      assert.ok(text.includes(page.offer.qualification));
      assert.match(html, /rel="sponsored noopener noreferrer"/);
      assert.ok(text.includes(intent === 'buy_usdt' ? ELDORADO_REFERRAL_LINK : TAKENOS_REFERRAL_LINK));
      assert.equal((html.match(/id="guia"/g) || []).length, 1);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.deepEqual(schemas(html), [page.howToSchema]);
      if (intent === 'buy_usdt') {
        assert.ok(text.includes(page.guide.warningTitle) && text.includes(page.guide.warning));
        assert.match(html, /datetime="2026-10-03"/);
      } else assert.doesNotMatch(html, /<time|data-eldorado-guide|Iniciar disputa/);
      assert.doesNotMatch(html, /FAQPage|BOB\/USDT ≈|Compra 12\.34/);
    }
  });
  it('aligns one canonical, locale, title and social identity with React, excluding intent from canonical', () => {
    for (const language of ['es', 'en']) {
      const search = `?intent=receive_payments&operation=sell&lang=${language}`;
      const html = renderBuyGuideHtml(template, search);
      const canonical = 'https://www.boliviablue.com/comprar-dolares' + (language === 'en' ? '?lang=en' : '');
      assert.match(html, new RegExp(`<html lang="${language}">`));
      assert.equal((html.match(/<title>/g) || []).length, 1);
      assert.equal((html.match(/name="description"/g) || []).length, 1);
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
      assert.ok(html.includes(`rel="canonical" href="${canonical}" data-rh="true"`));
      for (const property of ['og:url', 'twitter:url']) assert.ok(html.includes(`${property}" content="${canonical}"`));
      for (const lang of ['es', 'en', 'x-default']) assert.equal((html.match(new RegExp(`hreflang="${lang}"`, 'g')) || []).length, 1);
      const goalLinks = [...html.matchAll(/href="(\/comprar-dolares\?[^"]+)"/g)].map((match) => new URL(decode(match[1]), 'https://www.boliviablue.com'));
      for (const link of goalLinks) {
        assert.equal(link.searchParams.get('lang'), language === 'en' ? 'en' : null);
        assert.equal(link.hash, '#guia');
      }
    }
  });
  it('is idempotent, preserves scripts and normalizes hostile or duplicate query values', () => {
    const query = '?intent=%22%3E%3Cscript%3E&operation=unknown&lang=es&lang=en';
    const page = buyGuidePageForSearch(query);
    assert.equal(page.language, 'en');
    assert.equal(page.intent, 'buy_usdt');
    assert.equal(page.operation, 'buy');
    const once = renderBuyGuideHtml(template, query);
    const twice = renderBuyGuideHtml(once, query);
    assert.equal((twice.match(/data-seo-shell="comprar-dolares"/g) || []).length, 1);
    assert.deepEqual(schemas(twice), schemas(once));
    assert.match(twice, /type="module" src="\/src\/main\.jsx"/);
    assert.match(twice, /<body class="google-anno-skip">/);
    assert.ok(!twice.includes('<script>&'));
    assert.match(renderBuyGuideHtml(template.replace('content="index, follow"', 'content="noindex, nofollow"')), /content="noindex, nofollow"/);
  });
});

describe('guide middleware is independent of rates', () => {
  it('serves GET and HEAD for exact route variants and only requests the built guide asset', async () => {
    const previous = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      return new Response(renderBuyGuideHtml(template), { headers: { 'content-type': 'text/html', 'content-length': '1', 'x-existing-header': 'preserved' } });
    };
    try {
      for (const path of ['/comprar-dolares', '/comprar-dolares/', '/comprar-dolares/index.html']) for (const method of ['GET', 'HEAD']) {
        calls.length = 0;
        const response = await middleware(new Request(`https://www.boliviablue.com${path}?lang=en&operation=sell`, { method, headers: { accept: 'text/html' } }));
        assert.equal(response.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, 'https://www.boliviablue.com/comprar-dolares/index.html');
        assert.equal(calls[0].options.headers['x-bb-skip-live-seo'], '1');
        assert.equal(response.headers.get('content-length'), null);
        assert.equal(response.headers.get('x-existing-header'), 'preserved');
        const html = await response.text();
        if (method === 'HEAD') assert.equal(html, '');
        else assert.ok(decode(html).includes(getEldoradoGuide('en', 'sell').steps[5][1]));
      }
    } finally { globalThis.fetch = previous; }
    assert.equal(config.matcher.length, 7);
    assert.equal(config.matcher.filter((route) => route.includes('|comprar-dolares|')).length, 3);
  });
  it('returns localized non-cacheable 503 on asset failure and skips non-document or recursive requests', async () => {
    const previous = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => { calls++; throw new Error('asset unavailable'); };
    try {
      for (const method of ['GET', 'HEAD']) {
        const response = await middleware(new Request('https://www.boliviablue.com/comprar-dolares?lang=es&lang=en', { method }));
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
        assert.equal(response.headers.get('retry-after'), '60');
        const body = await response.text();
        assert.ok(method === 'HEAD' ? body === '' : body.includes('<html lang="en">'));
      }
      calls = 0;
      for (const options of [{ method: 'POST' }, { headers: { accept: 'application/json' } }, { headers: { 'x-bb-skip-live-seo': '1' } }]) assert.equal(await middleware(new Request('https://www.boliviablue.com/comprar-dolares?lang=en', options)), undefined);
      assert.equal(calls, 0);
    } finally { globalThis.fetch = previous; }
  });
});
