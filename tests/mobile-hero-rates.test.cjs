const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createRequire } = require('node:module');
const frontendRequire = createRequire(join(__dirname, '../frontend/package.json'));
const { buildSync } = frontendRequire('esbuild');
const vm = require('node:vm');
const React = frontendRequire('react');
const { renderToStaticMarkup } = frontendRequire('react-dom/server');

// Real component rendering, using the unchanged production quote and time helpers.
const compiled = buildSync({ stdin: { contents: `import Component from './frontend/src/components/MobileHeroRates.jsx'; import { liveBobParts } from './frontend/src/utils/seoRateMeta.js'; import { formatDateTime } from './frontend/src/utils/formatters.js'; export { Component, liveBobParts, formatDateTime };`, resolveDir: join(__dirname, '..'), loader: 'js' }, bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime'] }).outputFiles[0].text;
const scope = { exports: {}, module: { exports: {} }, require: frontendRequire, console };
vm.runInNewContext(compiled, scope);
const { Component, liveBobParts, formatDateTime } = scope.module.exports;
const fixture = { buy: 12.34, sell: 12.56, updated_at_iso: '2026-10-04T20:16:00Z', is_stale: false };
const render = (rate, { language = 'es', loading = false, error = null } = {}) => renderToStaticMarkup(React.createElement(Component, { rate, live: liveBobParts(rate), language, loading, error }));
const text = (html) => html.replace(/<[^>]*>/g, '').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');

describe('mobile hero reserved quote rows', () => {
  it('keeps three rows and identical geometry classes across pending, ready, stale and unavailable states', () => {
    for (const language of ['es', 'en']) {
      const renders = [render(null, { language, loading: true }), render(fixture, { language }), render({ ...fixture, is_stale: true }, { language }), render(null, { language, error: 'offline' }), render(null, { language }), render({ ...fixture, updated_at_iso: null }, { language })];
      const geometries = renders.map((html) => [...html.matchAll(/<p class="([^"]*)"/g)].map((m) => m[1].replace(/text-(?:amber|gray)-\d+|dark:text-(?:amber|gray)-\d+/g, 'color')));
      for (const geometry of geometries) {
        assert.equal(geometry.length, 3);
        assert.deepEqual(geometry, geometries[0]);
        assert.ok(geometry[0].includes('min-h-16') && geometry[0].includes('min-[400px]:min-h-8'));
        assert.ok(geometry[0].includes('flex-col') && geometry[0].includes('min-[400px]:flex-row'));
        assert.ok(geometry[1].includes('min-h-5') && geometry[2].includes('min-h-8'));
      }
    }
  });
  it('does not fabricate numbers or timestamps while loading or unavailable', () => {
    for (const language of ['es', 'en']) for (const loading of [true, false]) {
      const html = render(null, { language, loading });
      assert.doesNotMatch(html, /<time|12\.34|12\.56|0\.00/);
      assert.match(text(html), /100 USD ≈ — Bs/);
      assert.equal((text(html).match(/—/g) || []).length, 3);
      assert.ok(html.includes(`data-state="${loading ? 'loading' : 'unavailable'}"`));
      assert.ok(text(html).includes(loading ? (language === 'es' ? 'Cargando lectura P2P…' : 'Loading P2P reading…') : (language === 'es' ? 'Lectura P2P no disponible.' : 'P2P reading unavailable.')));
    }
  });
  it('preserves buy/sell formatting, buy-side 100 USD arithmetic, timestamp and stale status', () => {
    for (const language of ['es', 'en']) {
      const rate = { ...fixture, is_stale: true };
      const html = render(rate, { language, error: 'refresh unavailable' });
      const live = liveBobParts(rate);
      assert.ok(text(html).includes(live.buyStr) && text(html).includes(live.sellStr));
      assert.ok(text(html).includes(`100 USD ≈ ${live.times(100)} Bs`));
      assert.ok(text(html).includes(formatDateTime(rate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')));
      assert.ok(html.includes(`dateTime="${rate.updated_at_iso}"`));
      assert.ok(text(html).includes(`${formatDateTime(rate.updated_at_iso, language === 'es' ? 'es-BO' : 'en-US')} ${language === 'es' ? '(hora de Bolivia)' : '(Bolivia time)'}`));
      assert.match(html, /data-state="stale"/);
      assert.ok(text(html).includes(language === 'es' ? 'dato desactualizado' : 'stale reading'));
      assert.doesNotMatch(text(html), /Reintentando|Retrying/);
    }
  });
  it('preserves the no-reading retry message and handles missing/invalid times truthfully', () => {
    for (const language of ['es', 'en']) {
      const html = render(null, { language, error: 'offline' });
      assert.ok(text(html).includes(language === 'es' ? 'No hay una lectura nueva. Reintentando…' : 'No new reading yet. Retrying…'));
      assert.match(html, /data-state="unavailable"/);
      for (const timestamp of [null, 'invalid']) {
        const missing = render({ ...fixture, updated_at_iso: timestamp }, { language });
        assert.doesNotMatch(missing, /<time|Invalid Date/);
        assert.ok(text(missing).includes(language === 'es' ? 'Hora de lectura no disponible.' : 'Reading time unavailable.'));
      }
    }
  });
  it('is mounted unconditionally only inside the existing mobile hero before the unchanged offer', () => {
    const home = readFileSync(join(__dirname, '../frontend/src/pages/Home.jsx'), 'utf8');
    const hero = home.slice(home.indexOf('{/* Mobile: compact title'), home.indexOf('{/* Hero — desktop only */}'));
    assert.equal((hero.match(/<MobileHeroRates\b/g) || []).length, 1);
    assert.ok(hero.indexOf('<MobileHeroRates') < hero.indexOf('<FinancialOfferButton'));
    assert.match(hero, /className="md:hidden text-center"/);
    assert.match(hero, /placement="home_mobile_hero"/);
    assert.doesNotMatch(hero, /live\.buyStr &&|live\.times\(100\) &&|updated_at_iso &&/);
    const source = readFileSync(join(__dirname, '../frontend/src/components/MobileHeroRates.jsx'), 'utf8');
    assert.doesNotMatch(source, /fetch\(|useRate\(|localStorage|trackEvent/);
  });
});
