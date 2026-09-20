/**
 * Focused tests for the four new route-specific SEO shells.
 * Run: node --test frontend/scripts/inject-seo-shell.test.cjs
 *
 * Config tests always run. Dist-output checks run when frontend/dist exists
 * (after `npm run build` in frontend/).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  BASE_URL,
  ROUTES,
  replaceMeta,
  injectRootShell,
  injectStaticJsonLd,
  fillLiveRateSlots,
} = require('./inject-seo-shell.cjs');

const NEW_ROUTES = [
  {
    path: '/comparacion',
    title: 'Dólar Blue vs. Dólar Oficial en Bolivia',
    h1: 'Dólar Blue vs. Dólar Oficial',
    shellId: 'comparacion',
    mustInclude: ['mercado paralelo', 'BCB', '/calculadora', '/datos-historicos', '/fuente-de-datos'],
  },
  {
    path: '/calculadora',
    title: 'Calculadora de Dólares a Bolivianos | BoliviaBlue',
    h1: 'Calculadora de Dólares a Bolivianos',
    shellId: 'calculadora',
    mustInclude: ['bolivianos', '/comparacion', '/datos-historicos'],
  },
  {
    path: '/blog',
    title: 'Blog | Bolivia Blue',
    h1: 'Blog',
    shellId: 'blog',
    mustInclude: ['/noticias', '/comparacion', '/datos-historicos'],
  },
  {
    path: '/noticias',
    title: 'Noticias del Dólar y Tipo de Cambio en Bolivia',
    h1: 'Noticias del Dólar en Bolivia',
    shellId: 'noticias',
    mustInclude: ['/blog', '/comparacion', '/datos-historicos'],
  },
];

const HOME_H1 = 'Dólar Blue Bolivia Hoy';

const FIXTURE = `<!DOCTYPE html>
<html lang="es">
<head>
<title>Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min</title>
<meta name="title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="description" content="Homepage description" />
<link rel="canonical" href="https://www.boliviablue.com/" />
<meta property="og:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta property="og:description" content="Homepage description" />
<meta property="og:url" content="https://www.boliviablue.com/" />
<meta name="twitter:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="twitter:description" content="Homepage description" />
<meta name="twitter:url" content="https://www.boliviablue.com/" />
</head>
<body>
<div id="root"></div>
</body>
</html>`;

describe('new route shell configuration', () => {
  for (const expected of NEW_ROUTES) {
    it(`defines ${expected.path} with unique metadata and shell`, () => {
      const route = ROUTES[expected.path];
      assert.ok(route, `missing ROUTES[${expected.path}]`);
      assert.equal(route.title, expected.title);
      assert.equal(route.canonical, `${BASE_URL}${expected.path}`);
      assert.match(route.shell, new RegExp(`data-seo-shell="${expected.shellId}"`));
      assert.match(route.shell, new RegExp(`<h1[^>]*>${expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
      assert.doesNotMatch(route.shell, new RegExp(HOME_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.doesNotMatch(route.title, /2024|2025/);
      assert.doesNotMatch(route.description, /2024|2025/);
      assert.doesNotMatch(route.description, /en vivo|tiempo real|cada \d+ min/i);
      for (const snippet of expected.mustInclude) {
        assert.match(route.shell, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      }
      const schemas = route.getJsonLd();
      assert.equal(schemas[0]['@type'], 'WebPage');
      assert.equal(schemas[0].url, route.canonical);
      assert.ok(!schemas.some((s) => s['@type'] === 'FAQPage' || s['@type'] === 'Article' || s['@type'] === 'NewsArticle'));
    });
  }

  it('keeps titles unique across the four new routes', () => {
    const titles = NEW_ROUTES.map((r) => ROUTES[r.path].title);
    assert.equal(new Set(titles).size, titles.length);
  });
});

describe('replaceMeta + shell injection for new routes', () => {
  for (const expected of NEW_ROUTES) {
    it(`builds HTML for ${expected.path} with self-canonical and no homepage identity`, () => {
      const route = ROUTES[expected.path];
      let html = replaceMeta(FIXTURE, expected.path);
      html = injectRootShell(html, route.shell);
      html = injectStaticJsonLd(html, expected.path);

      assert.match(html, new RegExp(`<title>${expected.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
      assert.match(html, new RegExp(`rel="canonical" href="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`hreflang="es" href="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`hreflang="en" href="${BASE_URL}${expected.path}\\?lang=en"`));
      assert.match(html, new RegExp(`hreflang="x-default" href="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`property="og:url" content="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`name="twitter:url" content="${BASE_URL}${expected.path}"`));
      assert.match(html, /lang="es"/);
      assert.match(html, /id="root"/);
      assert.match(html, new RegExp(`<h1[^>]*>${expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
      assert.doesNotMatch(html, new RegExp(`rel="canonical" href="${BASE_URL}/"`));
      assert.doesNotMatch(html, new RegExp(`property="og:url" content="${BASE_URL}/"`));
      assert.doesNotMatch(html, new RegExp(HOME_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.equal((html.match(/<h1\b/gi) || []).length, 1);
    });
  }
});

describe('generated dist output for new routes', () => {
  const dist = path.join(__dirname, '..', 'dist');
  const hasNewShells = NEW_ROUTES.every((expected) =>
    fs.existsSync(path.join(dist, expected.path.slice(1), 'index.html'))
  );

  for (const expected of NEW_ROUTES) {
    it(`${expected.path} dist shell (when built)`, { skip: !hasNewShells }, () => {
      const file = path.join(dist, expected.path.slice(1), 'index.html');
      assert.ok(fs.existsSync(file), `missing ${file}`);
      const html = fs.readFileSync(file, 'utf8');
      assert.match(html, new RegExp(`<title>${expected.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
      assert.match(html, new RegExp(`rel="canonical" href="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`property="og:url" content="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`name="description" content="${ROUTES[expected.path].description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
      assert.match(html, new RegExp(`data-seo-shell="${expected.shellId}"`));
      assert.match(html, new RegExp(`<h1[^>]*>${expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
      assert.match(html, /lang="es"/);
      assert.match(html, /id="root"/);
      assert.doesNotMatch(html, new RegExp(HOME_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.doesNotMatch(html, new RegExp(`rel="canonical" href="${BASE_URL}/"`));
      assert.doesNotMatch(html, new RegExp(`property="og:url" content="${BASE_URL}/"`));
      assert.doesNotMatch(html, /2024|2025/);
      for (const snippet of expected.mustInclude) {
        assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      }
    });
  }

  it('homepage dist does not use the four new H1s', { skip: !hasNewShells }, () => {
    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    for (const expected of NEW_ROUTES) {
      assert.doesNotMatch(html, new RegExp(`data-seo-shell="${expected.shellId}"`));
      assert.doesNotMatch(html, new RegExp(`<h1[^>]*>${expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
    }
    assert.match(html, /data-seo-shell="home"/);
  });
});

describe('homepage brand sitelink candidates', () => {
  it('exposes About, Advertise, Blog and Terms in the crawlable home shell', () => {
    const shell = ROUTES['/'].shell;
    for (const href of ['/acerca-de', '/publicitar', '/blog', '/terminos']) {
      assert.match(shell, new RegExp(`href="${href}"`));
    }
    assert.match(shell, /Sobre Bolivia Blue/);
    assert.match(shell, /Publicitar en Bolivia Blue/);
    assert.match(shell, /Términos y Condiciones/);
    assert.match(shell, /href="\/dolar-blue-santa-cruz"/);
    assert.match(shell, /href="\/dolar-blue-la-paz"/);
    assert.match(shell, /href="\/dolar-blue-cochabamba"/);
  });

  it('exposes product sitelinks and a $100 converter slot', () => {
    const shell = ROUTES['/'].shell;
    for (const href of ['/prensa', '/fuente-de-datos', '/binance-p2p-bolivia', '/calculadora', '/datos-historicos', '/guia-dinero-bolivia']) {
      assert.match(shell, new RegExp(`href="${href}"`));
    }
    assert.match(shell, /data-live-usd100/);
    assert.match(shell, /data-live-buy/);
    assert.match(shell, /100 USD/);
  });
});

describe('priority crawl shells', () => {
  for (const expected of [
    { path: '/euro-a-boliviano', h1: 'Euro Blue Bolivia – EUR a BOB', shellId: 'euro-a-boliviano', must: ['USDT', '/dolar-blue-hoy', '/calculadora'] },
    { path: '/prensa', h1: 'Kit de prensa y backlinks', shellId: 'prensa', must: ['medios', '/api-docs', 'data-live-buy', 'historical-data.csv', '/embed.html'] },
    { path: '/api-docs', h1: 'API del Dólar Blue Bolivia', shellId: 'api-docs', must: ['REST', '/dolar-blue-hoy'] },
    { path: '/real-a-boliviano', h1: 'Real Blue Bolivia – BRL a BOB', shellId: 'real-a-boliviano', must: ['USDT', '/euro-a-boliviano'] },
    { path: '/peso-a-boliviano', h1: 'Peso colombiano a boliviano – COP a BOB', shellId: 'peso-a-boliviano', must: ['USDT/COP', '/euro-a-boliviano', '/calculadora'] },
    { path: '/sol-a-boliviano', h1: 'Sol peruano a boliviano – PEN a BOB', shellId: 'sol-a-boliviano', must: ['USDT/PEN', '/euro-a-boliviano', '/calculadora'] },
    { path: '/peso-argentino-a-boliviano', h1: 'Peso argentino a boliviano – ARS a BOB', shellId: 'peso-argentino-a-boliviano', must: ['USDT/ARS', '/sol-a-boliviano', '/calculadora'] },
    { path: '/peso-chileno-a-boliviano', h1: 'Peso chileno a boliviano – CLP a BOB', shellId: 'peso-chileno-a-boliviano', must: ['USDT/CLP', '/sol-a-boliviano', '/calculadora'] },
    { path: '/dolar-blue-santa-cruz', h1: 'Dólar Blue Santa Cruz Hoy', shellId: 'dolar-blue-santa-cruz', must: ['data-live-buy', '/calculadora', '/dolar-blue-la-paz'] },
    { path: '/dolar-blue-la-paz', h1: 'Dólar Blue La Paz Hoy', shellId: 'dolar-blue-la-paz', must: ['data-live-buy', '/dolar-blue-santa-cruz'] },
    { path: '/dolar-blue-cochabamba', h1: 'Dólar Blue Cochabamba Hoy', shellId: 'dolar-blue-cochabamba', must: ['data-live-buy', '/dolar-blue-la-paz'] },
    { path: '/guia-dinero-bolivia', h1: 'Guía de dinero para viajeros en Bolivia (2026)', shellId: 'guia-dinero-bolivia', must: ['data-live-buy', '/binance-p2p-bolivia', '/calculadora'] },
    { path: '/bolivia-money-guide', h1: 'The Bolivia money guide for travelers (2026)', shellId: 'bolivia-money-guide', must: ['data-live-buy', 'Binance P2P', '/guia-dinero-bolivia'] },
  ]) {
    it(`defines ${expected.path} without homepage identity`, () => {
      const route = ROUTES[expected.path];
      assert.ok(route);
      assert.match(route.shell, new RegExp(`data-seo-shell="${expected.shellId}"`));
      assert.match(route.shell, new RegExp(expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.doesNotMatch(route.shell, new RegExp(HOME_H1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.equal(route.canonical, `${BASE_URL}${expected.path}`);
      for (const snippet of expected.must) {
        assert.match(route.shell, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      }
    });
  }
});

describe('fillLiveRateSlots', () => {
  it('fills buy/sell and rounds 100 USD from the buy snapshot', () => {
    const html = 'compra <span data-live-buy>—</span> · 100 USD ≈ <span data-live-usd100>—</span>';
    const out = fillLiveRateSlots(html, '11.61', '11.50', '2026-09-12T15:00:00.000Z');
    assert.match(out, /data-live-buy[^>]*>11\.61/);
    assert.match(out, /data-live-usd100[^>]*>1161/);
  });
});
