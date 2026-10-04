import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { selectRelatedArticles } from '../frontend/src/utils/relatedArticles.js';
import { articlesEs } from '../frontend/src/data/blogArticles.js';
import { buildRateAnswerParagraph, PLAIN_CITE_ES, PLAIN_CITE_EN } from '../frontend/src/utils/citationCopy.js';
const require = createRequire(import.meta.url);
const { ROUTES } = require('../frontend/scripts/inject-seo-shell.cjs');

describe('article discovery and truthful source context', () => {
  it('prefers related category then fills with other articles without self-links or duplicate slugs', () => {
    const current = { id: 1, slug: 'current', category: 'Education' };
    const rows = [
      { id: 50, slug: 'other', title: 'Other', category: 'News' },
      { id: 99, slug: 'current', title: 'Same slug', category: 'Education' },
      { slug: 'same', title: 'Same category', category: 'Education' },
      { id: 52, slug: 'same', title: 'Duplicate', category: 'Education' },
    ];
    assert.deepEqual(selectRelatedArticles(rows, current).map((row) => row.slug), ['same', 'other']);
    assert.deepEqual(selectRelatedArticles(rows, { slug: 'current', category: 'Missing' }).map((row) => row.slug), ['other', 'same']);
    assert.equal(rows.length, 4);
    assert.deepEqual(selectRelatedArticles(rows, current, 2, ['same']).map((row) => row.slug), ['other']);
  });
  it('handles missing categories and unusable candidates without inventing link destinations', () => {
    assert.deepEqual(selectRelatedArticles([null, {}, { id: 1, title: 'No slug' }, { slug: ' ', title: 'Blank' }], { slug: 'current' }), []);
    assert.deepEqual(selectRelatedArticles(null, null), []);
    assert.deepEqual(selectRelatedArticles([{ slug: 'current', title: 'Current' }], { slug: 'current' }), []);
    assert.equal(selectRelatedArticles([{ slug: 'next', title: 'Next' }], { slug: 'current' })[0].slug, 'next');
  });
  it('puts existing canonical fallback article links and useful hubs in the initial blog HTML', () => {
    const shell = ROUTES['/blog'].shell;
    const slugs = [...shell.matchAll(/href="\/blog\/([^"?#]+)"/g)].map((match) => match[1]);
    assert.ok(slugs.length >= 2);
    for (const slug of slugs) assert.ok(articlesEs.some((article) => article.slug === slug));
    for (const hub of ['/comprar-dolares', '/fuente-de-datos', '/guia-dinero-bolivia']) assert.ok(shell.includes(`href="${hub}"`));
  });
  it('does not invent historical start years, publication dates or a fixed collection cadence', () => {
    const route = ROUTES['/datos-historicos'];
    assert.equal(route.title, 'Historial del dólar blue en Bolivia | Datos y descargas');
    assert.doesNotMatch(route.title + route.description + route.shell + JSON.stringify(route.getJsonLd()), /2024|2025|cada 15|every 15|2026/);
    const dataset = route.getJsonLd().find((schema) => schema['@type'] === 'Dataset');
    assert.ok(dataset);
    assert.equal('datePublished' in dataset, false);
    assert.equal('temporalCoverage' in dataset, false);
    const page = readFileSync(new URL('../frontend/src/pages/DatosHistoricos.jsx', import.meta.url), 'utf8');
    assert.ok(page.includes(route.title));
    assert.ok(page.includes('Bolivia blue dollar history | Data and downloads'));
    assert.doesNotMatch(page, /Archive 2024|Archivo 2024|updates every 15|se actualiza cada 15/);
  });
  it('qualifies quoted values as a USDT/BOB proxy without changing values or inventing sources', () => {
    for (const language of ['es', 'en']) {
      const quote = buildRateAnswerParagraph({ buy: 12.34, sell: 12.56, language });
      assert.ok(quote.includes('12.34') && quote.includes('12.56'));
      assert.match(quote, /USDT\/BOB/);
      assert.match(quote, language === 'es' ? /no es una cotización de efectivo/ : /not a cash exchange quote/);
      assert.match(quote, language === 'es' ? /composición de fuentes no registrada/ : /source composition not recorded/);
    }
    assert.match(PLAIN_CITE_ES, /USDT\/BOB/);
    assert.match(PLAIN_CITE_EN, /USD proxy/);
  });
});
