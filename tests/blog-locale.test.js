import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { BLOG_TRANSLATIONS, blogLocaleForSlug, blogLocalePaths } from '../frontend/src/utils/blogLocale.js';
import { languageForLocation, languageForPath, localizedLocation } from '../frontend/src/utils/pageLocale.js';
import { articlesEs, articlesEn } from '../frontend/src/data/blogArticles.js';
import { articleRequest, loadArticle, renderArticleHtml } from '../seo/articleSeo.js';

const BASE = 'https://www.boliviablue.com';
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);
const { buildSitemapXml } = require('../api/_lib/sitemapXml.js');

test('translation map covers only verified, unique published partners', () => {
  assert.equal(BLOG_TRANSLATIONS.length, 5);
  const slugs = BLOG_TRANSLATIONS.flatMap(pair => [pair.es, pair.en]);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const pair of BLOG_TRANSLATIONS) {
    assert.ok(articlesEs.some(article => article.slug === pair.es));
    assert.ok(articlesEn.some(article => article.slug === pair.en));
  }
  assert.equal(blogLocaleForSlug('missing'), null);
  assert.equal(blogLocalePaths('missing'), null);
  assert.equal(languageForPath('/blog/missing'), null);
});

for (const pair of BLOG_TRANSLATIONS) for (const language of ['es', 'en']) {
  const path = `/blog/${pair[language]}`;
  const paths = blogLocalePaths(pair[language]);
  test(`${pair[language]}: direct entry, query normalization, toggle and initial HTML agree`, async () => {
    for (const search of ['', '?lang=en', '?lang=es', '?lang=en?lang=en']) {
      assert.equal(languageForLocation({ pathname: path, search }), language, 'known slug owns its language');
      const request = articleRequest(path, search);
      assert.equal(request.language, language);
      const article = await loadArticle(request, { env: {} });
      assert.equal(article.status, 200);
      assert.equal(article.canonical, BASE + paths[language]);
      const html = renderArticleHtml(template, article, request);
      assert.ok(html.includes(`<html lang="${language}"`));
      assert.ok(html.includes(`<link rel="canonical" href="${BASE + paths[language]}"`));
      for (const [locale, partnerPath] of Object.entries({ ...paths, 'x-default': paths.es })) {
        assert.ok(html.includes(`hreflang="${locale}" href="${BASE + partnerPath}"`));
      }
      assert.ok(html.includes(`"inLanguage":"${language === 'es' ? 'es-BO' : 'en-US'}"`));
      assert.ok(html.includes(`"mainEntityOfPage":"${BASE + paths[language]}"`));
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    }
    for (const target of ['es', 'en']) {
      const result = localizedLocation({ pathname: path, search: '?utm_source=review&lang=en?lang=en', hash: '#sources' }, target);
      const url = new URL(result, BASE);
      assert.equal(url.pathname, `/blog/${pair[target]}`);
      assert.equal(url.searchParams.get('lang'), target === 'en' ? 'en' : null);
      assert.equal(url.searchParams.getAll('lang').length, target === 'en' ? 1 : 0);
      assert.equal(url.searchParams.get('utm_source'), 'review');
      assert.equal(url.hash, '#sources');
      assert.equal(languageForLocation(url), target);
    }
  });
}

test('unknown slugs stay unavailable/missing and never receive guessed partners or indexable shells', async () => {
  for (const language of ['es', 'en']) {
    const request = articleRequest('/blog/not-a-published-guide', `?lang=${language}`);
    const options = { env: { SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'test-only' }, fetcher: async () => ({ ok: true, json: async () => [] }) };
    const missing = await loadArticle(request, options);
    assert.equal(missing.status, 404);
    const html = renderArticleHtml(template, missing, request);
    assert.match(html, /content="noindex, follow"/);
    assert.doesNotMatch(html, /hreflang=|"@type":"BlogPosting"/);
    assert.equal((await loadArticle(request, { env: {} })).status, 503, 'outage is not a false 404');
    assert.equal(localizedLocation({ pathname: '/blog/not-a-published-guide' }, language), `/blog/not-a-published-guide${language === 'en' ? '?lang=en' : ''}`);
  }
});

test('existing traveler/general/news routing and Spanish sitemap URLs stay intact', () => {
  assert.equal(languageForLocation({ pathname: '/blog/%77hat-is-usdt-tether-complete-guide' }), 'en');
  assert.equal(localizedLocation({ pathname: '/blog/%77hat-is-usdt-tether-complete-guide' }, 'es'), '/blog/que-es-usdt-tether-guia-completa');
  assert.equal(languageForPath('/blog/%invalid'), null);
  assert.equal(languageForLocation({ pathname: '/bolivia-money-guide', search: '?lang=es' }), 'en');
  assert.equal(localizedLocation({ pathname: '/bolivia-money-guide', search: '?x=1&lang=en', hash: '#cash' }, 'es'), '/guia-dinero-bolivia?x=1#cash');
  assert.equal(localizedLocation({ pathname: '/calculadora', search: '?amount=100', hash: '#result' }, 'en'), '/calculadora?amount=100&lang=en#result');
  assert.equal(articleRequest('/noticias/news-slug', '?lang=en').language, 'en');
  assert.equal(articleRequest('/blog/rss.xml'), null);
  const sitemap = buildSitemapXml(new Date('2026-10-15T12:00:00Z'));
  for (const pair of BLOG_TRANSLATIONS) assert.ok(sitemap.includes(`<loc>${BASE}/blog/${pair.es}</loc>`));
  assert.doesNotMatch(sitemap, /hreflang="en" href="[^"\n]*\/blog\//, 'sitemap does not invent same-slug English partners');
});
