const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const { JSDOM } = createRequire(new URL('../frontend/package.json', `file://${__filename}`))('jsdom');
const shell = require('../frontend/scripts/inject-seo-shell.cjs');
const { reportHtml } = require('../shared/dailyEvidenceRender.cjs');
const seeds = require('../data/daily-evidence/index.json');

const BASE = 'https://www.boliviablue.com';
const template = fs.readFileSync(new URL('../frontend/index.html', `file://${__filename}`), 'utf8');
const pressShell = shell.injectStaticJsonLd(shell.injectRootShell(shell.replaceMeta(template, '/prensa'), shell.ROUTES['/prensa'].shell), '/prensa');
const row = { date: '2026-10-12', revision: 1, path: '/prensa/informes/2026-10-12/v1' };
const paths = { es: '/prensa?before=2026-10-13', en: '/prensa?before=2026-10-13&lang=en' };

function assertHead(html, language, expected) {
  const document = new JSDOM(html).window.document;
  const canonical = BASE + expected[language];
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(document.querySelector('link[rel="canonical"]').href, canonical);
  for (const [locale, path] of Object.entries({ ...expected, 'x-default': expected.es })) {
    assert.equal(document.querySelector(`link[hreflang="${locale}"]`).href, BASE + path);
  }
  assert.equal(document.querySelector('meta[property="og:url"]').content, canonical);
  assert.equal(document.querySelector('meta[name="twitter:url"]').content, canonical);
  assert.doesNotMatch(document.querySelector('meta[name="robots"]').content, /noindex/);
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  assert.ok(JSON.stringify(schemas).includes(JSON.stringify(canonical)), 'structured page identity follows the canonical');
  return document;
}

async function requestArchive(search, agent = 'Mozilla/5.0', unavailable = false) {
  const { default: middleware } = await import('../middleware.js');
  const previous = global.fetch;
  const calls = [];
  try {
    global.fetch = async url => {
      calls.push(String(url));
      if (unavailable && String(url).includes('/api/daily-report')) throw new Error('Archive unavailable');
      return String(url).includes('/api/daily-report')
        ? new Response(JSON.stringify({ reports: [row], unavailable: false, next_before: '2026-10-01' }), { headers: { 'content-type': 'application/json' } })
        : new Response(pressShell, { headers: { 'content-type': 'text/html' } });
    };
    const response = await middleware(new Request(BASE + '/prensa' + search, { headers: { accept: 'text/html', 'user-agent': agent } }));
    assert.equal(response.status, 200);
    return { html: await response.text(), calls };
  } finally { global.fetch = previous; }
}

test('archive cursors accept real API-compatible dates and reject invalid input', async () => {
  const { normalizeArchiveBefore, archiveLocalePaths } = await import('../frontend/src/data/dailyEvidenceArchive.js');
  for (const date of ['2026-01-01', '2026-10-13', '2028-02-29']) assert.equal(normalizeArchiveBefore(date), date);
  for (const value of [null, undefined, '', 20261013, '2025-12-31', '2026-02-29', '2026-02-30', '2026-13-01', '2026-10-32', '2026-1-03', '2026-10-13&lang=en', '"><script>']) {
    assert.equal(normalizeArchiveBefore(value), null);
    assert.deepEqual(archiveLocalePaths(value), { es: '/prensa', en: '/prensa?lang=en' });
  }
  assert.deepEqual(archiveLocalePaths('2026-10-13'), paths);
});

for (const language of ['es', 'en']) {
  for (const agent of ['Mozilla/5.0', 'Googlebot']) test(`${language} older archive is self-canonical without JS (${agent})`, async () => {
    const { html, calls } = await requestArchive(`?before=2026-10-13&lang=${language}&utm_source=review#informes-diarios`, agent);
    const document = assertHead(html, language, paths);
    assert.ok(calls.includes(BASE + '/api/daily-report?view=archive&before=2026-10-13'));
    assert.ok(document.querySelector(`a[href="${row.path}${language === 'en' ? '?lang=en' : ''}"]`));
    assert.ok(document.querySelector(`a[href="/prensa?before=2026-10-01${language === 'en' ? '&lang=en' : ''}#informes-diarios"]`));
    assert.doesNotMatch(document.head.innerHTML, /utm_source|#informes-diarios/);
  });

  test(`${language} first archive retains its existing canonical and language alternatives`, async () => {
    const { html, calls } = await requestArchive(language === 'en' ? '?lang=en' : '');
    assertHead(html, language, { es: '/prensa', en: '/prensa?lang=en' });
    assert.ok(calls.includes(BASE + '/api/daily-report?view=archive'));
  });

  test(`${language} invalid cursors are omitted from metadata and the API request`, async () => {
    for (const value of ['', '2026-02-30', '2025-12-31', 'not-a-date', '"><script>']) {
      const { html, calls } = await requestArchive(`?before=${encodeURIComponent(value)}&lang=${language}`);
      assertHead(html, language, { es: '/prensa', en: '/prensa?lang=en' });
      assert.ok(calls.includes(BASE + '/api/daily-report?view=archive'));
      assert.ok(!calls.some(url => url.includes('&before=')));
    }
  });
}

test('pagination metadata transformation is idempotent and leaves first-page HTML byte-identical', async () => {
  const { applyArchivePaginationMetadata } = await import('../middleware.js');
  assert.equal(applyArchivePaginationMetadata(pressShell, null), pressShell);
  assert.equal(applyArchivePaginationMetadata(pressShell, '2026-02-30'), pressShell);
  const once = applyArchivePaginationMetadata(pressShell, '2026-10-13');
  assert.equal(applyArchivePaginationMetadata(once, '2026-10-13'), once);
});

test('archive refresh failure retains only seed links before the canonical cursor', async () => {
  for (const language of ['es', 'en']) {
    const { html } = await requestArchive(`?before=2026-10-13&lang=${language}`, 'Mozilla/5.0', true);
    const document = assertHead(html, language, paths);
    assert.ok(document.querySelector('[role="status"]'));
    const links = [...document.querySelectorAll('#informes-diarios a:not([type="application/rss+xml"])')].map(link => link.getAttribute('href'));
    assert.equal(links.length, 4);
    assert.ok(links.every(href => href.match(/\/informes\/(\d{4}-\d{2}-\d{2})\//)?.[1] < '2026-10-13'));
  }
});

test('all repository-backed report editions keep their own ES/EN canonicals and alternates', () => {
  for (const seed of seeds) for (const language of ['es', 'en']) {
    const report = require(`../data/daily-evidence/${seed.date}-v${seed.revision}.json`);
    const document = new JSDOM(reportHtml(report, language)).window.document;
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
    assert.equal(document.querySelector('link[rel="canonical"]').href, report.url + (language === 'en' ? '?lang=en' : ''));
    for (const [locale, suffix] of [['es', ''], ['en', '?lang=en'], ['x-default', '']]) {
      assert.equal(document.querySelector(`link[hreflang="${locale}"]`).href, report.url + suffix);
    }
    assert.equal(document.querySelector('meta[name="robots"]'), null);
  }
});
