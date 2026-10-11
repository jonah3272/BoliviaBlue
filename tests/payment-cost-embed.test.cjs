const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = resolve(__dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const html = read('frontend/public/embed.html');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function bootstrap(query = '') {
  const appended = [];
  const target = { innerHTML: '' };
  const document = {
    title: '', documentElement: {},
    getElementById: (id) => id === 'w' ? target : null,
    createElement: (tag) => ({ tag, attrs: {}, setAttribute(key, value) { this.attrs[key] = value; } }),
    head: { appendChild: (node) => appended.push(node) },
    body: { appendChild: (node) => appended.push(node) },
  };
  vm.runInNewContext(source, { URLSearchParams, window: { location: { search: query } }, document });
  return { appended, target, document };
}

test('default and unknown modes preserve the legacy rate loader and options', () => {
  for (const query of ['', '?lang=en&theme=dark', '?mode=unknown&lang=en']) {
    const { appended, document } = bootstrap(query);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].src, '/embed.js');
    assert.equal(appended[0].attrs['data-target'], 'w');
    assert.equal(appended[0].attrs['data-medium'], 'iframe');
    assert.equal(appended[0].attrs['data-lang'], query.includes('lang=en') ? 'en' : 'es');
    assert.equal(appended[0].attrs['data-theme'], query.includes('theme=dark') ? 'dark' : 'light');
    assert.equal(document.documentElement.lang, query.includes('lang=en') ? 'en' : 'es-BO');
  }
});

test('payment mode loads only isolated local assets and retains a localized guide fallback', () => {
  for (const language of ['en', 'es']) {
    const { appended, target, document } = bootstrap(`?mode=payment-cost&lang=${language}&rate=12&bobPrice=600`);
    assert.equal(appended.length, 2);
    assert.equal(appended[0].href, '/payment-cost/payment-cost.css');
    assert.equal(appended[1].src, '/payment-cost/payment-cost.js');
    assert.doesNotMatch(JSON.stringify(appended), /embed\.js|blue-rate|bobPrice|rate=12/);
    assert.match(target.innerHTML, /#payment-cost-comparison/);
    assert.match(target.innerHTML, language === 'en' ? /bolivia-money-guide/ : /guia-dinero-bolivia/);
    appended[1].onerror();
    assert.match(target.innerHTML, language === 'en' ? /Open the payment-cost checker/ : /Abrir el comparador/);
    assert.match(document.title, /BOB\/USD/);
  }
});

test('noindex and old compact iframe styling are preserved without route/header changes', () => {
  assert.match(html, /<meta name="robots" content="noindex"/);
  assert.match(html, /@media \(max-height: 220px\)/);
  assert.match(html, /\[data-bb-attribution\]/);
  assert.doesNotMatch(read('api/sitemap.js'), /payment-cost/);
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.headers.find((header) => header.source === '/embed.html').headers.find((header) => header.key === 'Content-Security-Policy').value, 'frame-ancestors *');
});

test('entry reuses the checker without app infrastructure, input serialization or remote resources', () => {
  const entry = read('frontend/src/embeds/paymentCostEmbed.jsx');
  assert.match(entry, /import PaymentCostChecker from '..\/components\/PaymentCostChecker'/);
  assert.match(entry, /<PaymentCostChecker language=\{language\} \/>/);
  assert.doesNotMatch(entry, /fetch\(|XMLHttpRequest|sendBeacon|postMessage|localStorage|sessionStorage|document\.cookie|trackEvent|RateProvider|main\.jsx|useAdsense/);
  const params = [...entry.matchAll(/params\.get\('([^']+)'\)/g)].map((match) => match[1]);
  assert.deepEqual(params.sort(), ['lang', 'theme']);
  assert.doesNotMatch(read('frontend/src/embeds/paymentCostEmbed.css'), /url\(|@import|overflow:\s*hidden/);
  const build = read('frontend/vite.payment-embed.config.js');
  assert.match(build, /outDir: 'dist\/payment-cost'/);
  assert.match(build, /publicDir: false/);
  assert.match(build, /formats: \['iife'\]/);
});

test('publisher section gives a responsive, scrollable iframe and manual copy fallback', () => {
  const page = read('frontend/src/pages/Widget.jsx');
  assert.match(page, /id="payment-cost"/);
  assert.match(page, /mode=payment-cost&amp;lang=/);
  assert.match(page, /width="100%" height="900"/);
  assert.doesNotMatch(page, /scrolling="no"/);
  assert.match(page, /textarea id="payment-embed-code" readOnly/);
  assert.match(page, /Automatic copying failed/);
  assert.match(page, /lang=es or lang=en/);
});
