import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { getSourceCompositionExample, SOURCE_COMPOSITION_ANCHOR, SOURCE_COMPOSITION_JSON } from '../frontend/src/data/sourceCompositionExample.js';
import { renderDataDocumentationHtml, renderSourceCompositionPressLink } from '../seo/dataDocumentationSeo.js';
import { applyEnglishAnnotations } from '../middleware.js';

const raw = readFileSync(new URL('../frontend/public/data/examples/2026-10-08-source-composition.json', import.meta.url));
const rows = JSON.parse(raw);
const units = (value) => Math.round(value * 10000);
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('preserves the exact audited two-row JSON, including every original field', () => {
  assert.equal(createHash('sha256').update(raw).digest('hex'), 'bbc70fee46a02df5b1c67055691cfdaed5a3642a1357a4a9bbf4e2bf49373c20');
  assert.equal(rows.length, 2);
  assert.equal(SOURCE_COMPOSITION_JSON, '/data/examples/2026-10-08-source-composition.json');
  assert.deepEqual(rows.map((r) => r.t), ['2026-10-08T19:14:34.043+00:00', '2026-10-08T19:36:24.631+00:00']);
  assert.deepEqual(rows.map((r) => r.source_count), [3, 2]);
});

test('reproduces both medians and the change using four-decimal integer arithmetic', () => {
  for (const row of rows) {
    const values = row.source_observation.platforms.map((p) => units(p.sell)).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    const median = values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
    assert.equal(median, units(row.sell));
    assert.equal(row.source_count, values.length);
    assert.deepEqual(row.sources_used, row.source_observation.platforms.map((p) => p.id));
    assert.equal(Date.parse(row.t), Date.parse(row.source_observation.observed_at));
  }
  assert.equal(units(rows[1].sell) - units(rows[0].sell), -585);
  assert.equal(((-585 / units(rows[0].sell)) * 100).toFixed(8), '-0.49242424');
  for (const id of ['binance', 'eldorado']) assert.equal(rows[0].source_observation.platforms.find((p) => p.id === id).sell, rows[1].source_observation.platforms.find((p) => p.id === id).sell);
  assert.equal(rows[1].source_observation.platforms.find((p) => p.id === 'bybit'), undefined);
});

test('display values and local times come from the preserved rows, without filling the absent source', () => {
  for (const language of ['es', 'en']) {
    const e = getSourceCompositionExample(language);
    const format = (value) => language === 'en' ? value.toFixed(4) : value.toFixed(4).replace('.', ',');
    for (const [index, row] of rows.entries()) {
      for (const [platformIndex, id] of ['binance', 'eldorado', 'bybit'].entries()) {
        const platform = row.source_observation.platforms.find((p) => p.id === id);
        assert.equal(e.rows[platformIndex].values[index], platform ? format(platform.sell) : e.missing);
      }
      assert.equal(e.rows[3].values[index], String(row.source_count));
      assert.equal(e.rows[4].values[index], format(row.sell));
      assert.equal(Date.parse(e.times[index].iso), Date.parse(row.t));
      assert.match(e.times[index].iso, /-04:00$/);
    }
  }
});

test('initial HTML includes the same bilingual evidence, limitations, anchor and citation', () => {
  for (const language of ['es', 'en']) {
    const e = getSourceCompositionExample(language);
    const html = renderDataDocumentationHtml(template, '/fuente-de-datos', `?lang=${language}`);
    const text = decode(html);
    for (const key of ['date', 'title', 'summary', 'explanation', 'caption', 'caveat', 'evidence', 'coverage', 'limitations', 'citation']) assert.ok(text.includes(e[key]), key);
    for (const formula of e.formulas) assert.ok(text.includes(formula));
    assert.equal((html.match(new RegExp(`id="${SOURCE_COMPOSITION_ANCHOR}"`, 'g')) || []).length, 1);
    assert.match(html, /<a href="\/data\/examples\/2026-10-08-source-composition.json" download/);
    assert.ok(html.indexOf('id="provenance"') < html.indexOf(`id="${e.id}"`));
    assert.ok(e.citation.endsWith(e.url));
    assert.equal(e.path, `/fuente-de-datos${language === 'en' ? '?lang=en' : ''}#${SOURCE_COMPOSITION_ANCHOR}`);
    const press = decode(renderSourceCompositionPressLink(language));
    assert.ok(press.includes(e.path) && press.includes(e.pressLabel) && press.includes(e.pressDescription));
  }
  const history = renderDataDocumentationHtml(template, '/datos-historicos');
  assert.ok(!history.includes(SOURCE_COMPOSITION_ANCHOR), 'Does not add the case study to live history');
});

test('integrates as one methodology section and a newsroom link without replacing the snapshot', () => {
  const method = readFileSync(new URL('../frontend/src/pages/DataSource.jsx', import.meta.url), 'utf8');
  const press = readFileSync(new URL('../frontend/src/pages/PressKit.jsx', import.meta.url), 'utf8');
  const build = readFileSync(new URL('../frontend/scripts/inject-seo-shell.cjs', import.meta.url), 'utf8');
  assert.match(method, /<SourceCompositionExample language=\{language\} \/>/);
  assert.match(press, /<NewsroomSnapshot rate=\{rateData\} language=\{language\} loading=\{isLoading\} error=\{error\} \/>/);
  assert.match(press, /<Link to=\{example.path\}/);
  assert.match(build, /renderSourceCompositionPressLink\('es'\)/);
});

test('English newsroom initial HTML retains the shared example link with or without live rates', () => {
  const e = getSourceCompositionExample('en');
  const pressTemplate = template.replace('<div id="root"></div>', '<div id="root"><main data-seo-shell="prensa"><h1>Prensa</h1></main></div>');
  assert.match(pressTemplate, /data-seo-shell="prensa"/);
  for (const pair of [null, { buy: '11.93', sell: '11.88', updatedAt: '2026-10-10T03:22:38.224Z' }]) {
    const html = decode(applyEnglishAnnotations(pressTemplate, '/prensa', pair));
    assert.ok(html.includes(`href="${e.path}"`));
    assert.ok(html.includes(e.pressLabel) && html.includes(e.pressDescription));
    assert.equal((html.match(new RegExp(e.id, 'g')) || []).length, 1);
    const other = applyEnglishAnnotations(pressTemplate, '/euro-a-boliviano', pair);
    assert.ok(!other.includes(e.id), 'Other English routes remain untouched');
  }
});

test('example anchors clear the measured header and desktop navigation with matching responsive CSS', async () => {
  const component = readFileSync(new URL('../frontend/src/components/SourceCompositionExample.jsx', import.meta.url), 'utf8');
  const classes = ['scroll-mt-[calc(var(--bb-header-height,81px)_+_1rem)]', 'md:scroll-mt-[calc(var(--bb-header-height,81px)_+_4rem)]'];
  for (const className of classes) {
    assert.ok(component.includes(className));
    for (const language of ['es', 'en']) assert.ok(renderDataDocumentationHtml(template, '/fuente-de-datos', `?lang=${language}`).includes(className));
  }
  assert.ok(!component.includes('scroll-mt-6'));
  const require = createRequire(new URL('../frontend/package.json', import.meta.url));
  const postcss = require('postcss');
  const tailwindcss = require('tailwindcss');
  const css = await postcss([tailwindcss({ content: [{ raw: classes.join(' '), extension: 'html' }], corePlugins: { preflight: false } })]).process('@tailwind utilities;', { from: undefined });
  const offsets = [];
  css.root.walkDecls('scroll-margin-top', (declaration) => {
    const media = declaration.parent.parent;
    offsets.push({ value: declaration.value, minWidth: media.type === 'atrule' ? Number(media.params.match(/min-width: (\d+)px/)[1]) : 0 });
  });
  assert.deepEqual(offsets, [
    { value: 'calc(var(--bb-header-height,81px) + 1rem)', minWidth: 0 },
    { value: 'calc(var(--bb-header-height,81px) + 4rem)', minWidth: 768 },
  ]);
  for (const width of [390, 640, 767, 768, 1280]) {
    const rem = width < 768 ? 1 : 4;
    // Desktop navigation is 47px (20px line + 24px padding + 3px borders).
    const navigationHeight = width < 768 ? 0 : 47;
    assert.ok(rem * 16 - navigationHeight >= 16, `Header/navigation clearance at ${width}px`);
  }
});
