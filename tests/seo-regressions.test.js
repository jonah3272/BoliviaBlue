import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { articleRequest, loadArticle, renderArticleHtml } from '../seo/articleSeo.js';
import middleware, { applyEnglishAnnotations } from '../middleware.js';
import { languageForLocation, localizedLocation } from '../frontend/src/utils/pageLocale.js';
import { newsIdFromSlugParam } from '../frontend/src/utils/newsSlug.js';
const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd } = require('../frontend/scripts/inject-seo-shell.cjs');
const { buildSitemapXml } = require('../api/_lib/sitemapXml.js');
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const shell = (path) => injectStaticJsonLd(injectRootShell(replaceMeta(template, path), ROUTES[path].shell), path);
function inspect(html) {
  const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const all = (pattern) => [...html.matchAll(pattern)].map((m) => m[0]);
  const tags = [...all(/<(?:meta|link)\b[^>]*>/g), ...all(/<script\b[^>]*>[\s\S]*?<\/script>/g), ...all(/<h1\b[^>]*>[\s\S]*?<\/h1>/g), ...all(/<main\b[^>]*>[\s\S]*?<\/main>/g)];
  const select = (selector) => tags.filter((tag) => {
    const attr = attributes(tag);
    if (selector === 'h1') return tag.startsWith('<h1');
    if (selector === 'main') return tag.startsWith('<main');
    if (selector === 'link[rel=canonical]') return tag.startsWith('<link') && attr.rel === 'canonical';
    if (selector === 'link[hreflang]') return tag.startsWith('<link') && 'hreflang' in attr;
    if (selector === 'link[hreflang=en]') return attr.hreflang === 'en';
    if (selector === 'link[hreflang=es]') return attr.hreflang === 'es';
    if (selector === 'meta[name=description]') return attr.name === 'description';
    if (selector === 'meta[name=robots]') return attr.name === 'robots';
    if (selector === 'script[type="application/ld+json"]') return tag.startsWith('<script') && attr.type === 'application/ld+json';
    if (selector === 'img[onerror]') return /<img[^>]*onerror/.test(tag);
    return false;
  }).map((tag) => ({ ...attributes(tag), outerHTML: tag, textContent: tag.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '').replace(/&amp;/g, '&'), getAttribute: (name) => attributes(tag)[name] }));
  return { documentElement: { lang: html.match(/<html[^>]*lang="([^"]*)"/)[1] }, querySelector: (q) => select(q)[0], querySelectorAll: select };
}
const env = { SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_ANON_KEY: 'public-test-key' };

describe('article metadata and failure semantics', () => {
  it('uses actual remote article fields with one identity and safely renders dollars and HTML', async () => {
    const request = articleRequest('/blog/fixture');
    const article = await loadArticle(request, { env, fetcher: async () => Response.json([{ slug: 'fixture', title: 'Ahorra $100 y $& hoy <script>x</script>', excerpt: 'Compra $50 <img src=x onerror=alert(1)>', language: 'es' }]) });
    const dom = inspect(renderArticleHtml(shell('/blog'), article, request));
    assert.equal(article.status, 200);
    assert.equal(dom.querySelectorAll('h1').length, 1);
    assert.match(dom.querySelector('h1').textContent, /Ahorra \$100 y \$& hoy/);
    assert.equal(dom.querySelectorAll('link[rel=canonical]').length, 1);
    assert.equal(dom.querySelector('link[rel=canonical]').href, 'https://www.boliviablue.com/blog/fixture');
    assert.equal(dom.querySelectorAll('link[hreflang]').length, 0);
    assert.equal(dom.querySelectorAll('meta[name=description]').length, 1);
    assert.equal(dom.querySelectorAll('img[onerror]').length, 0);
    const schema = JSON.parse(dom.querySelector('script[type="application/ld+json"]').textContent);
    assert.equal(schema['@type'], 'BlogPosting');
    assert.equal(schema.inLanguage, 'es-BO');
  });
  it('distinguishes a confirmed missing slug from an unavailable lookup', async () => {
    const request = articleRequest('/blog/not-a-real-article');
    const missing = await loadArticle(request, { env, fetcher: async () => Response.json([]) });
    const unavailable = await loadArticle(request, { env, fetcher: async () => { throw new Error('offline'); } });
    assert.equal(missing.status, 404);
    assert.equal(unavailable.status, 503);
    for (const article of [missing, unavailable]) {
      const doc = inspect(renderArticleHtml(shell('/blog'), article, request));
      assert.equal(doc.querySelector('meta[name=robots]').content, 'noindex, follow');
      assert.equal(doc.querySelectorAll('script[type="application/ld+json"]').length, 0);
    }
  });
  it('does not use a service-role key to bypass public content access', async () => {
    let requested = false;
    const result = await loadArticle(articleRequest('/blog/absent'), { env: { SUPABASE_URL: env.SUPABASE_URL, SUPABASE_SERVICE_KEY: 'private-fixture' }, fetcher: async () => { requested = true; return Response.json([]); } });
    assert.equal(result.status, 503);
    assert.equal(requested, false);
  });
  it('resolves bundled fallback articles and keeps untranslated news Spanish', async () => {
    const fallback = await loadArticle(articleRequest('/blog/guia-comprar-dolares-binance-p2p'), { env: {} });
    assert.equal(fallback.status, 200);
    const id = 'c435558e-1111-4444-9999-110011001100';
    const news = await loadArticle(articleRequest(`/noticias/noticia-${id}`, '?lang=en'), { env, fetcher: async () => Response.json([{ id, title: 'Noticia económica' }]) });
    assert.equal(news.language, 'es');
    assert.ok(!news.canonical.includes('?lang=en'));
    assert.equal(newsIdFromSlugParam('some-title-12345678'), '12345678');
  });
  it('returns 503/noindex when the article shell fails instead of a generic 200', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => new Response('unavailable', { status: 503 });
    try {
      const response = await middleware(new Request('https://www.boliviablue.com/blog/absent', { headers: { Accept: 'text/html' } }));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
      assert.equal(response.headers.get('cache-control'), 'no-store');
    } finally { globalThis.fetch = original; }
  });
});

describe('canonical, locale and head ownership', () => {
  it('consolidates the parallel alias consistently without indexing it in the sitemap', () => {
    const doc = inspect(shell('/dolar-paralelo-bolivia-en-vivo'));
    assert.equal(doc.querySelector('link[rel=canonical]').href, 'https://www.boliviablue.com/dolar-blue-hoy');
    const page = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)).find((s) => s['@type'] === 'WebPage');
    assert.equal(page.url, 'https://www.boliviablue.com/dolar-blue-hoy');
    assert.ok(!buildSitemapXml().includes('/dolar-paralelo-bolivia-en-vivo'));
  });
  it('uses the real guide pair for canonical, language and reciprocal alternates', () => {
    for (const [path, lang] of [['/guia-dinero-bolivia', 'es'], ['/bolivia-money-guide', 'en']]) {
      const doc = inspect(shell(path));
      assert.equal(doc.documentElement.lang, lang);
      assert.equal(doc.querySelector('link[rel=canonical]').href, `https://www.boliviablue.com${path}`);
      assert.equal(doc.querySelector('link[hreflang=en]').href, 'https://www.boliviablue.com/bolivia-money-guide');
      assert.equal(doc.querySelector('link[hreflang=es]').href, 'https://www.boliviablue.com/guia-dinero-bolivia');
      assert.equal(applyEnglishAnnotations(shell(path), path, { buy: '12.34', sell: '12.56' }), shell(path));
    }
    assert.equal(languageForLocation({ pathname: '/bolivia-money-guide/' }), 'en');
    assert.equal(languageForLocation({ pathname: '/bolivia-money-guide/index.html' }), 'en');
    assert.equal(localizedLocation({ pathname: '/bolivia-money-guide/', search: '?utm_source=test' }, 'es'), '/guia-dinero-bolivia?utm_source=test');
  });
  it('translates English crawl content and JSON-LD with and without live rates', () => {
    for (const pair of [null, { buy: '12.34', sell: '12.56' }]) {
      const doc = inspect(applyEnglishAnnotations(shell('/euro-a-boliviano'), '/euro-a-boliviano', pair));
      assert.equal(doc.documentElement.lang, 'en');
      assert.match(doc.querySelector('link[rel=canonical]').href, /\?lang=en$/);
      assert.match(doc.querySelector('h1').textContent, /Euro/);
      assert.equal(JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent).inLanguage, 'en-US');
      assert.doesNotMatch(doc.querySelector('main').textContent, /compra|Cotización/);
    }
  });
  it('marks static SEO metadata and JSON-LD for Helmet ownership', () => {
    const html = shell('/blog');
    for (const tag of html.match(/<(?:meta|link|script)\b[^>]*(?:name="(?:description|robots)"|property="og:[^"]*"|rel="canonical"|hreflang=|type="application\/ld\+json")[^>]*>/g)) {
      assert.match(tag, /data-rh="true"/, tag);
    }
  });
});
