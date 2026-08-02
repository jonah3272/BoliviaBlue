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
    title: 'Guías y Análisis del Dólar en Bolivia | BoliviaBlue',
    h1: 'Guías y Análisis',
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

const HOME_H1 = 'Dólar Blue Bolivia – Cotización en Tiempo Real y Herramientas';

const FIXTURE = `<!DOCTYPE html>
<html lang="es">
<head>
<title>Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min</title>
<meta name="title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="description" content="Homepage description" />
<link rel="canonical" href="https://boliviablue.com/" />
<meta property="og:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta property="og:description" content="Homepage description" />
<meta property="og:url" content="https://boliviablue.com/" />
<meta name="twitter:title" content="Dólar Blue Bolivia Hoy | Cotización en Vivo Cada 15 Min" />
<meta name="twitter:description" content="Homepage description" />
<meta name="twitter:url" content="https://boliviablue.com/" />
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
      assert.match(html, new RegExp(`property="og:url" content="${BASE_URL}${expected.path}"`));
      assert.match(html, new RegExp(`name="twitter:url" content="${BASE_URL}${expected.path}"`));
      assert.match(html, /lang="es"/);
      assert.match(html, /id="root"/);
      assert.match(html, new RegExp(`<h1[^>]*>${expected.h1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
      assert.doesNotMatch(html, /rel="canonical" href="https:\/\/boliviablue\.com\/"/);
      assert.doesNotMatch(html, /property="og:url" content="https:\/\/boliviablue\.com\/"/);
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
      assert.doesNotMatch(html, /rel="canonical" href="https:\/\/boliviablue\.com\/"/);
      assert.doesNotMatch(html, /property="og:url" content="https:\/\/boliviablue\.com\/"/);
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
