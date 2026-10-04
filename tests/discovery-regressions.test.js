import { getDataDocumentationPage } from '../frontend/src/data/dataDocumentation.js';
import { renderDataDocumentationHtml } from '../seo/dataDocumentationSeo.js';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { selectRelatedArticles } from '../frontend/src/utils/relatedArticles.js';
import { articlesEs, articlesEn } from '../frontend/src/data/blogArticles.js';
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
  it('links reviewed current hubs without newly promoting legacy articles in the initial blog HTML', () => {
    const shell = ROUTES['/blog'].shell;
    assert.doesNotMatch(shell, /href="\/blog\//);
    for (const hub of ['/comprar-dolares', '/fuente-de-datos', '/datos-historicos']) assert.ok(shell.includes(`href="${hub}"`));
  });
  it('holds both languages of legacy Binance and USDT guides only from new related suggestions', () => {
    const page = readFileSync(new URL('../frontend/src/pages/Blog.jsx', import.meta.url), 'utf8');
    const hold = page.match(/const RELATED_ARTICLE_REVIEW_HOLD = \[([\s\S]*?)\];/);
    assert.ok(hold);
    const excluded = [...hold[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
    const expected = ['guia-comprar-dolares-binance-p2p', 'guide-buy-dollars-binance-p2p', 'que-es-usdt-tether-guia-completa', 'what-is-usdt-tether-complete-guide'];
    assert.deepEqual(excluded, expected);
    for (const slug of expected) assert.ok([...articlesEs, ...articlesEn].some((article) => article.slug === slug));
    const rows = expected.map((slug) => ({ slug, title: slug, category: 'Guide' }));
    rows.push({ slug: 'reviewed-peer', title: 'Reviewed peer', category: 'Guide' });
    assert.deepEqual(selectRelatedArticles(rows, { slug: 'current', category: 'Guide' }, 2, excluded).map((row) => row.slug), ['reviewed-peer']);
  });
  it('does not invent historical start years, publication dates or a fixed collection cadence', () => {
    const model = getDataDocumentationPage('/datos-historicos');
    assert.equal(model.copy.title, 'Historial del dólar blue en Bolivia | Datos y descargas');
    assert.equal(getDataDocumentationPage('/datos-historicos', 'en').copy.title, 'Bolivia blue dollar history | Data and downloads');
    const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
    const html = renderDataDocumentationHtml(template, '/datos-historicos');
    assert.doesNotMatch(html, /Archivo 2024|Archive 2024|cada 15|every 15/);
    const dataset = model.datasetSchema;
    assert.equal('datePublished' in dataset, false);
    assert.equal('temporalCoverage' in dataset, false);
    assert.equal('dateModified' in dataset, false);
    const page = readFileSync(new URL('../frontend/src/pages/DatosHistoricos.jsx', import.meta.url), 'utf8');
    assert.match(page, /title=\{copy.title\}/);
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
  it('formats citation readings in labeled Bolivia time independently of the viewer timezone', () => {
    const moduleUrl = new URL('../frontend/src/utils/citationCopy.js', import.meta.url).href;
    const script = `import { buildRateAnswerParagraph } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify(['es','en'].map(language => buildRateAnswerParagraph({ buy: 12.34, sell: 12.56, updatedAt: '2026-10-04T03:26:00Z', language }))));`;
    const render = (TZ) => {
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ }, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      return JSON.parse(result.stdout);
    };
    const quotes = render('America/Los_Angeles');
    assert.deepEqual(quotes, render('Asia/Tokyo'));
    for (const [index, locale] of ['es-BO', 'en-US'].entries()) {
      const expected = new Intl.DateTimeFormat(locale, { timeZone: 'America/La_Paz', dateStyle: 'medium', timeStyle: 'short' }).format(new Date('2026-10-04T03:26:00Z'));
      assert.ok(quotes[index].includes(expected));
      assert.match(quotes[index], index === 0 ? /hora de Bolivia/ : /Bolivia time/);
      assert.doesNotMatch(quotes[index], /every 15|cada ~?15/);
      assert.doesNotThrow(() => buildRateAnswerParagraph({ buy: 12.34, sell: 12.56, updatedAt: 'invalid', language: index ? 'en' : 'es' }));
    }
  });
});
