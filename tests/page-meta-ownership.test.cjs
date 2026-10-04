const { it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const repo = path.resolve(__dirname, '..');
const frontendRequire = createRequire(path.join(repo, 'frontend/package.json'));
const { JSDOM } = frontendRequire('jsdom');
const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', { url: 'https://www.boliviablue.com/', pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window), IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const React = frontendRequire('react');
const { createRoot } = frontendRequire('react-dom/client');
const { HelmetProvider } = frontendRequire('react-helmet-async');
const { build } = frontendRequire('esbuild');
const h = React.createElement;
let language = 'es';
async function loadPageMeta(componentName = 'PageMeta') {
  const result = await build({
    entryPoints: [path.join(repo, `frontend/src/components/${componentName}.jsx`)],
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-helmet-async', 'react-router-dom'],
    define: { 'import.meta.env.VITE_ENV': '"production"' },
    plugins: [{ name: 'fixture-language', setup(api) {
      api.onResolve({ filter: /contexts\/LanguageContext$/ }, () => ({ path: 'language', namespace: 'fixture' }));
      api.onResolve({ filter: /utils\/adsenseLoader$/ }, () => ({ path: 'ads', namespace: 'ads-fixture' }));
      api.onLoad({ filter: /.*/, namespace: 'ads-fixture' }, () => ({ contents: 'export const blockAdsOnThisPage = () => {};', loader: 'js' }));
      api.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useLanguage = () => globalThis.__headTestLanguage();', loader: 'js' }));
    } }],
  });
  globalThis.__headTestLanguage = () => ({ language });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, frontendRequire);
  return module.exports.default;
}
async function settle(action) {
  await React.act(async () => { action(); await new Promise(resolve => setTimeout(resolve, 20)); });
  await new Promise(resolve => setTimeout(resolve, 35)); // flush Helmet's deferred head commit
}
const schemas = () => [...document.head.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));

it('owns only committed page metadata across interrupted SSR replacement, rate updates and route changes', async () => {
  const PageMeta = await loadPageMeta();
  const { renderDollarRateHtml } = await import(pathToFileURL(path.join(repo, 'seo/dollarRateSeo.js')));
  const { applyEnglishAnnotations } = await import(pathToFileURL(path.join(repo, 'middleware.js')));
  const { buildDollarRateSearchCopy, DOLLAR_SEARCH_PAGES } = await import(pathToFileURL(path.join(repo, 'frontend/src/utils/dollarRateSearchCopy.js')));
  const { ROUTES, replaceMeta, injectRootShell, injectStaticJsonLd } = require('../frontend/scripts/inject-seo-shell.cjs');
  const template = readFileSync(path.join(repo, 'frontend/index.html'), 'utf8');
  const payload = { buy: 12.01, sell: 11.97, updatedAt: '2026-10-04T21:27:21.587Z' };
  for (language of ['es', 'en']) {
    let blocked = true, release;
    const pending = new Promise(resolve => { release = resolve; });
    function DeferredPagePart() { if (blocked) throw pending; return h('div', null, 'Ready'); }
    function Page({ route, rates }) {
      const copy = buildDollarRateSearchCopy({ ...rates, page: DOLLAR_SEARCH_PAGES[route], language, now: Date.now() });
      return h(React.Fragment, null,
        h(PageMeta, { title: copy.title, description: copy.description, canonical: route, includeBrandSchema: false, structuredData: [
          { '@context': 'https://schema.org', '@type': 'WebPage', name: copy.title, description: copy.description, ...(copy.observedAt ? { dateModified: copy.observedAt } : {}) },
          { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Rate?', acceptedAnswer: { '@type': 'Answer', text: copy.answer } }] },
        ] }),
        h('p', { 'data-visible-answer': true }, copy.answer), h(DeferredPagePart));
    }
    const tree = (route, rates) => h(React.StrictMode, null, h(HelmetProvider, null,
      h(React.Suspense, { fallback: h('p', null, 'Loading') }, h(Page, { key: route, route, rates }))));
    let initial = injectStaticJsonLd(injectRootShell(replaceMeta(template, '/'), ROUTES['/'].shell), '/');
    initial = renderDollarRateHtml(initial, '/', null, language);
    if (language === 'en') initial = applyEnglishAnnotations(initial, '/', null);
    const initialDom = new JSDOM(initial);
    document.head.innerHTML = initialDom.window.document.head.innerHTML;
    document.getElementById('root').innerHTML = initialDom.window.document.getElementById('root').innerHTML;
    const ad = document.createElement('script'); ad.id = 'unrelated-ad-loader'; ad.src = 'https://example.test/ads.js'; document.head.append(ad);
    const verification = document.createElement('meta'); verification.name = 'google-site-verification'; verification.content = 'keep-me'; verification.setAttribute('data-rh', 'true'); document.head.append(verification);
    const initialHead = document.head.innerHTML;
    const root = createRoot(document.getElementById('root'));
    try {
      // This render is abandoned after PageMeta renders but before it commits.
      // Before the fix, Helmet already registers its unavailable quote and never removes it.
      await settle(() => root.render(tree('/', null)));
      assert.equal(document.head.innerHTML, initialHead, 'suspended page must leave initial HTTP metadata untouched');
      blocked = false;
      await settle(() => { root.render(tree('/', payload)); release(); });
      const verify = (route, rates) => {
        const copy = buildDollarRateSearchCopy({ ...rates, page: DOLLAR_SEARCH_PAGES[route], language, now: Date.now() });
        const all = schemas();
        assert.equal(all.filter(s => s['@type'] === 'WebPage').length, 1);
        assert.equal(all.filter(s => s['@type'] === 'FAQPage').length, 1);
        assert.equal(all.find(s => s['@type'] === 'FAQPage').mainEntity[0].acceptedAnswer.text, copy.answer);
        assert.equal(document.querySelector('[data-visible-answer]').textContent, copy.answer);
        assert.equal(document.title, copy.title);
        assert.equal(document.querySelectorAll('meta[name="description"]').length, 1);
        assert.equal(document.querySelector('meta[name="description"]').content, copy.description);
        assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
        assert.equal(document.querySelector('link[rel="canonical"]').href, `https://www.boliviablue.com${route}${language === 'en' ? '?lang=en' : ''}`);
        const alternates = [...document.querySelectorAll('link[rel="alternate"][hreflang]')];
        assert.equal(alternates.length, 3);
        assert.equal(new Set(alternates.map(link => link.hreflang)).size, 3);
        assert.ok(alternates.every(link => new URL(link.href).pathname === route));
        assert.equal(document.getElementById('unrelated-ad-loader'), ad);
        assert.equal(document.querySelector('[name="google-site-verification"]'), verification);
        assert.equal(document.querySelector('[data-seo-shell]'), null);
      };
      verify('/', payload);
      const latest = { ...payload, buy: 12.02, sell: 11.98 };
      await settle(() => root.render(tree('/', latest))); verify('/', latest);
      await settle(() => root.render(tree('/dolar-blue-hoy', payload))); verify('/dolar-blue-hoy', payload);
      await settle(() => root.render(tree('/cuanto-esta-dolar-bolivia', payload))); verify('/cuanto-esta-dolar-bolivia', payload);
      await settle(() => root.render(tree('/dolar-blue-hoy', latest))); verify('/dolar-blue-hoy', latest); // Back-equivalent remount
      await settle(() => root.render(tree('/', latest))); verify('/', latest);
    } finally { await settle(() => root.unmount()); }
    assert.equal(schemas().length, 0, 'unmount must not restore an orphaned pending page');
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 0);
    assert.equal(document.getElementById('unrelated-ad-loader'), ad);
  }
});

it('does not retain head state when a same-commit sibling update suspends, with or without StrictMode', async () => {
  const PageMeta = await loadPageMeta();
  const { Helmet } = frontendRequire('react-helmet-async');
  const never = new Promise(() => {});
  function Block({ active }) { if (active) throw never; return h('p', null, 'Committed page'); }
  function Page({ phase, route }) {
    const [commitUpdate, setCommitUpdate] = React.useState(false);
    React.useLayoutEffect(() => setCommitUpdate(true), []);
    return h(React.Fragment, null,
      h(PageMeta, { title: route + ' ' + phase, description: phase, canonical: route, noindex: phase === 'missing', ogType: 'article', includeBrandSchema: false,
        structuredData: [{ '@type': 'WebPage', route, phase }, { '@type': 'FAQPage', route, phase }] }),
      h(Block, { active: commitUpdate && phase === 'pending' }));
  }
  function CardHead({ phase }) {
    return h(Helmet, null, h('script', { type: 'application/ld+json' }, JSON.stringify({ '@type': 'ExchangeRateSpecification', phase })));
  }
  for (const strict of [false, true]) {
    document.head.innerHTML = '<title>Initial server title</title><meta name="google-site-verification" content="keep-me"><meta http-equiv="Content-Security-Policy" content="fixture"><script id="unrelated-security-script" nonce="fixture" src="https://example.test/security.js"></script>';
    const verification = document.querySelector('[name="google-site-verification"]');
    const security = document.getElementById('unrelated-security-script');
    const csp = document.querySelector('[http-equiv="Content-Security-Policy"]');
    const root = createRoot(document.getElementById('root'));
    const tree = (phase, route = '/') => h(strict ? React.StrictMode : React.Fragment, null, h(HelmetProvider, null,
      h(React.Suspense, { fallback: h('p', null, 'Fallback') }, h(Page, { key: route, phase, route })), h(CardHead, { phase })));
    const verify = (phase, route) => {
      const current = schemas().filter(schema => schema['@type'] !== 'ExchangeRateSpecification');
      assert.deepEqual(current.map(schema => [schema['@type'], schema.route, schema.phase]), [['WebPage', route, phase], ['FAQPage', route, phase]]);
      assert.equal(document.title, route + ' ' + phase);
      assert.equal(document.querySelector('meta[name="robots"]').content, phase === 'missing' ? 'noindex, nofollow' : 'index, follow');
      assert.equal(document.querySelector('meta[property="og:type"]').content, 'article');
      assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 3);
      assert.ok([...document.querySelectorAll('link[rel="alternate"][hreflang]')].every(link => new URL(link.href).pathname === route));
      assert.ok(schemas().some(schema => schema['@type'] === 'ExchangeRateSpecification'), 'other Helmet consumer remains');
      assert.equal(document.getElementById('unrelated-security-script'), security);
      assert.equal(document.querySelector('[http-equiv="Content-Security-Policy"]'), csp);
      assert.equal(document.querySelector('[name="google-site-verification"]'), verification);
      assert.equal(verification.hasAttribute('data-bb-page-head'), false);
    };
    try {
      await settle(() => root.render(tree('pending')));
      await settle(() => root.render(tree('loaded'))); verify('loaded', '/');
      await settle(() => root.render(tree('loaded', '/dolar-blue-hoy'))); verify('loaded', '/dolar-blue-hoy');
      await settle(() => root.render(tree('missing', '/blog/missing'))); verify('missing', '/blog/missing');
      await settle(() => root.render(tree('loaded', '/'))); verify('loaded', '/');
    } finally { await settle(() => root.unmount()); }
    assert.equal(schemas().filter(schema => ['WebPage', 'FAQPage'].includes(schema['@type'])).length, 0);
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 0);
    assert.equal(document.getElementById('unrelated-security-script'), security);
  }
});

it('retires an abandoned actual Redirect and clears its committed noindex/refresh after navigation', async () => {
  const PageMeta = await loadPageMeta();
  const Redirect = await loadPageMeta('Redirect');
  const { BrowserRouter, Routes, Route, useLocation } = frontendRequire('react-router-dom');
  language = 'en';
  document.head.innerHTML = '<title>Initial page</title><meta name="robots" content="index, follow" data-rh="true"><link rel="canonical" href="https://www.boliviablue.com/" data-rh="true">';
  const originalHead = document.head.innerHTML;
  window.history.replaceState({}, '', '/alias');
  let blocked = true;
  const pending = new Promise(() => {});
  function Block() { if (blocked) throw pending; return null; }
  function Target() {
    const location = useLocation();
    return h(React.Fragment, null, h(PageMeta, { title: 'Target page', description: 'Target description', canonical: '/target', includeBrandSchema: false }), h('p', { 'data-current-route': location.pathname }, 'Target'));
  }
  const tree = h(React.StrictMode, null, h(HelmetProvider, null, h(BrowserRouter, null, h(Routes, null,
    h(Route, { path: '/alias', element: h(React.Suspense, { fallback: h('p', null, 'Loading alias') }, h(Redirect, { to: '/target' }), h(Block)) }),
    h(Route, { path: '/target', element: h(Target) })))));
  const root = createRoot(document.getElementById('root'));
  const visit = (route) => { window.history.pushState({}, '', route); window.dispatchEvent(new window.PopStateEvent('popstate')); };
  const verifyTarget = () => {
    assert.equal(document.querySelector('[data-current-route]').getAttribute('data-current-route'), '/target');
    assert.equal(document.title, 'Target page');
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
    assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://www.boliviablue.com/target?lang=en');
    assert.equal(document.querySelectorAll('meta[name="robots"]').length, 1);
    assert.equal(document.querySelector('meta[name="robots"]').content, 'index, follow');
    assert.equal(document.querySelector('meta[http-equiv="refresh"]'), null);
  };
  try {
    await settle(() => root.render(tree));
    assert.equal(document.head.innerHTML, originalHead, 'abandoned alias cannot publish redirect metadata');
    await settle(() => visit('/target')); verifyTarget();
    blocked = false;
    await settle(() => visit('/alias'));
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
    assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://www.boliviablue.com/target');
    assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
    assert.equal(document.querySelector('meta[http-equiv="refresh"]').content, '0; url=https://www.boliviablue.com/target');
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 160)); });
    await new Promise(resolve => setTimeout(resolve, 35));
    verifyTarget();
    assert.equal(window.location.pathname, '/target');
  } finally { await settle(() => root.unmount()); }
  assert.equal(document.querySelector('meta[http-equiv="refresh"]'), null);
});
