import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';

const index = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const shellSource = readFileSync(new URL('../frontend/scripts/inject-seo-shell.cjs', import.meta.url), 'utf8');
const home = readFileSync(new URL('../frontend/src/pages/Home.jsx', import.meta.url), 'utf8');
const critical = index.match(/<style>([\s\S]*?data-home-heading[\s\S]*?)<\/style>/)[1];
const input = '<html><head><title>Existing title</title><link rel="canonical" href="https://www.boliviablue.com/"></head><body><main data-seo-shell="home"></main></body></html>';

test('both language shells and the build fallback use only the homepage heading marker', () => {
  for (const language of ['es', 'en']) {
    const output = renderDollarRateHtml(input, '/', null, language);
    assert.match(output, /<h1 data-home-heading class="font-bold text-gray-900">/);
    assert.match(output, /<link rel="canonical" href="https:\/\/www.boliviablue.com\/">/);
    assert.match(output, /data-rate-reading-guide/);
    assert.match(output, /data-dollar-rate-answer/);
    assert.doesNotMatch(renderDollarRateHtml(input, '/dolar-blue-hoy', null, language), /data-home-heading/);
  }
  assert.match(shellSource, /<h1 data-home-heading class="font-bold text-gray-900">Dólar blue en Bolivia hoy<\/h1>/);
});

const assets = new URL('../frontend/dist/assets/', import.meta.url);
test('critical H1 typography matches actual built Home utilities on both sides of 768px', { skip: !existsSync(assets) }, () => {
  const require = createRequire(new URL('../frontend/package.json', import.meta.url));
  const postcss = require('postcss');
  const css = readdirSync(assets).filter(name => name.endsWith('.css')).map(name => readFileSync(new URL(name, assets), 'utf8')).join('\n');
  const mobileRates = readFileSync(new URL('../frontend/src/components/MobileHeroRates.jsx', import.meta.url), 'utf8');
  const rateClasses = [...mobileRates.matchAll(/<p className="([^"]+)"/g)].map(match => match[1].split(' '));
  const headings = [...home.matchAll(/<h1 className="([^"]+)"/g)].map(match => match[1].split(' '));
  assert.equal(headings.length, 2);

  function typography(source, width, matches) {
    const result = { 'letter-spacing': 'normal' };
    postcss.parse(source).walkRules(rule => {
      for (let node = rule.parent; node; node = node.parent) {
        if (node.type === 'atrule' && node.name === 'media') {
          const min = node.params.match(/min-width:\s*(\d+)px/);
          const max = node.params.match(/max-width:\s*(\d+)px/);
          if ((min && width < Number(min[1])) || (max && width > Number(max[1]))) return;
        }
      }
      if (!rule.selectors.some(matches)) return;
      rule.walkDecls(decl => { if (['font-size', 'line-height', 'letter-spacing', 'font-weight'].includes(decl.prop)) result[decl.prop] = decl.value.replace(/(^|-)0\./g, '$1.'); });
    });
    return result;
  }

  for (const width of [390, 639, 640, 700, 767, 768, 1280]) {
    const classes = headings[width < 768 ? 0 : 1];
    const final = typography(css, width, selector => classes.some(name => selector === '.' + name.replaceAll(':', '\\:')));
    const initial = typography(critical, width, selector => selector === '[data-home-heading]');
    assert.deepEqual(initial, final, `H1 cascade mismatch at ${width}px`);
    assert.equal(initial['font-size'], width < 768 ? '1.5rem' : '3rem');
    assert.equal(initial['line-height'], width < 768 ? '1.25' : '1');
    if (width < 768) {
      for (const [i, marker] of ['data-home-rate-line', 'data-home-conversion'].entries()) {
        const finalRate = typography(css, width, selector => rateClasses[i].some(name => selector === '.' + name.replaceAll(':', '\\:')));
        const initialRate = typography(critical, width, selector => selector === '[' + marker + ']');
        assert.deepEqual(initialRate, finalRate, `${marker} cascade mismatch at ${width}px`);
      }
    }
  }
});
