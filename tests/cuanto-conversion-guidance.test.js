import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getCuantoConversionGuide } from '../frontend/src/data/cuantoConversionGuide.js';
import { renderDollarRateHtml } from '../seo/dollarRateSeo.js';
import { buildDollarRateSearchCopy } from '../frontend/src/utils/dollarRateSearchCopy.js';

const require = createRequire(import.meta.url);
const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd } = require('../frontend/scripts/inject-seo-shell.cjs');
const path = '/cuanto-esta-dolar-bolivia';
const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const source = injectStaticJsonLd(injectRootShell(replaceMeta(template, path), ROUTES[path].shell), path);
const now = Date.parse('2026-10-09T00:05:00Z');
const rates = { buy: 12.345, sell: 11.975, updatedAt: '2026-10-09T00:00:00Z' };
const decode = (s) => s.replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');

describe('how-much conversion guidance', () => {
  for (const language of ['es', 'en']) {
    it(`${language}: shares direction, units, presets and limits across initial-HTML rate states`, () => {
      const guide = getCuantoConversionGuide(language);
      assert.deepEqual(guide.presets.map((preset) => preset.amount), [100, 1000]);
      for (const data of [rates, { ...rates, isStale: true }, { ...rates, updatedAt: null }, null]) {
        const html = renderDollarRateHtml(source, path, data, language, now);
        const visible = decode(html);
        const model = buildDollarRateSearchCopy({ ...data, page: 'cuanto', language, now });
        for (const copy of [guide.heading, guide.buyLabel, guide.sellLabel, guide.unit, guide.explanation, model.answer]) assert.ok(visible.includes(copy), copy);
        assert.match(visible, language === 'es' ? /multiplica el monto por la tasa de venta P2P.*divide por la tasa de compra/ : /multiplies the amount by the P2P sell rate.*divides by the buy rate/);
        assert.match(visible, /1 USD = 1 USDT/);
        assert.match(visible, language === 'es' ? /antes de comisiones; no garantiza una cotización de efectivo/ : /before fees; it does not guarantee a cash quote/);
        for (const preset of guide.presets) {
          const url = new URL(preset.href, 'https://www.boliviablue.com');
          assert.equal(url.pathname, '/calculadora');
          assert.equal(url.searchParams.get('usd'), String(preset.amount));
          assert.equal(url.searchParams.get('lang'), language === 'en' ? 'en' : null);
          assert.ok(visible.includes(`href="${preset.href}"`));
          assert.ok(visible.includes(preset.label));
        }
        assert.doesNotMatch(visible, /data-live-usd100|100 USD ≈|1235|1234\.50|cada 15|every 15/);
        assert.equal((html.match(/<h1\b/g) || []).length, 1);
        assert.equal(renderDollarRateHtml(html, path, data, language, now), html);
        if (data?.isStale) assert.match(visible, /desactualizada|stale/);
        if (data && !data.updatedAt) assert.match(visible, /Hora de lectura no disponible|Observation time unavailable/);
        if (!data) assert.match(visible, /Lectura P2P no disponible|P2P reading unavailable/);
      }
    });
  }
  it('removes route-specific duplicate arithmetic and misleading FAQ promises', () => {
    const page = readFileSync(new URL('../frontend/src/pages/CuantoEstaDolarBolivia.jsx', import.meta.url), 'utf8');
    assert.doesNotMatch(page, /liveBobParts|live\.times|\[1, 10, 50, 100, 500, 1000\]|cada 15|every 15|precio real al que|real price at which/);
    assert.match(page, /getCuantoConversionGuide\(language\)/);
    assert.equal((page.match(/\{liveSeo.answer\}/g) || []).length, 2);
    assert.equal((page.match(/\{conversionGuide.explanation\}/g) || []).length, 2);
  });
  it('does not add the route-specific guidance to home, today or euro', () => {
    for (const other of ['/', '/dolar-blue-hoy', '/euro-a-boliviano']) {
      for (const language of ['es', 'en']) {
        const initial = injectRootShell(replaceMeta(template, other), ROUTES[other].shell);
        const result = renderDollarRateHtml(initial, other, rates, language, now);
        assert.doesNotMatch(result, /data-cuanto-conversion-guide|data-cuanto-reference-cards/);
        if (other === '/' && language === 'es') assert.match(result, /data-live-usd100>1235<\/span> Bs \(compra P2P\)/);
        if (other === '/euro-a-boliviano') assert.equal(result, initial);
      }
    }
  });
});
