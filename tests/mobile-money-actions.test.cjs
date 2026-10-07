const { before, afterEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createRequire } = require('node:module');
const frontendRequire = createRequire(join(__dirname, '../frontend/package.json'));
const { JSDOM } = frontendRequire('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://www.boliviablue.com/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const React = frontendRequire('react');
const { render, screen, fireEvent, cleanup } = frontendRequire('@testing-library/react');
const { MemoryRouter, Routes, Route, useLocation, useNavigate } = frontendRequire('react-router-dom');
const { build } = frontendRequire('esbuild');
const h = React.createElement;
let MobileMoneyActions, getBuyGuidePage, navigate, location;
const events = [];
globalThis.__mobileMoneyEvents = events;

before(async () => {
  const result = await build({
    stdin: {
      contents: "export { default as MobileMoneyActions } from './src/components/MobileMoneyActions.jsx'; export { getBuyGuidePage } from './src/data/buyGuidePage.js';",
      resolveDir: join(__dirname, '../frontend'), loader: 'js',
    },
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-router-dom'],
    plugins: [{ name: 'local-analytics-fixture', setup(api) {
      api.onResolve({ filter: /utils\/analyticsEvents$/ }, () => ({ path: 'analytics', namespace: 'fixture' }));
      api.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const trackRelatedLinkClicked = event => globalThis.__mobileMoneyEvents.push(event);', loader: 'js' }));
    } }],
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, frontendRequire);
  ({ MobileMoneyActions, getBuyGuidePage } = module.exports);
});

afterEach(() => { cleanup(); events.length = 0; });

const expectedGuide = language => `/comprar-dolares?intent=buy_usdt&operation=sell${language === 'en' ? '&lang=en' : ''}#guia`;
const label = language => language === 'en' ? 'USDT → BOB: see steps' : 'USDT → BOB: ver pasos';
function Probe() {
  location = useLocation(); navigate = useNavigate();
  return null;
}
// The destination identity comes from production's shared page/offer builder.
function GuideIdentity() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const page = getBuyGuidePage(params.get('lang') || 'es', params.get('intent'), params.get('operation'));
  return h('section', { id: 'guia', 'data-operation': page.operation, 'data-offer-id': page.offer.id }, page.offer.guideLabel);
}
function mount(language = 'es', strict = false) {
  const tree = h(MemoryRouter, { initialEntries: [language === 'en' ? '/?lang=en' : '/'] },
    h(Probe), h(Routes, null,
      h(Route, { path: '/', element: h(MobileMoneyActions, { language }) }),
      h(Route, { path: '/comprar-dolares', element: h(GuideIdentity) }),
      h(Route, { path: '/calculadora', element: h('p', null, 'Calculator destination') })));
  return render(strict ? h(React.StrictMode, null, tree) : tree);
}

describe('mobile homepage seller next step', () => {
  it('renders precisely two internal links in ES and EN, retaining the calculator destination', () => {
    for (const language of ['es', 'en']) {
      mount(language);
      const links = screen.getAllByRole('link');
      assert.deepEqual(links.map(link => link.getAttribute('href')), [expectedGuide(language), '/calculadora']);
      assert.equal(links[0].textContent, label(language));
      assert.equal(links[1].textContent, language === 'en' ? 'Calculator' : 'Calculadora');
      for (const link of links) {
        assert.equal(link.getAttribute('target'), null);
        assert.equal(link.getAttribute('tabindex'), null);
        assert.equal(link.getAttribute('role'), null);
      }
      assert.equal(events.length, 0, 'rendering a route must not create a referral or route-click event');
      cleanup();
    }
  });

  it('lands on the matching sell operation and offer through the localized URL', () => {
    for (const language of ['es', 'en']) {
      mount(language);
      fireEvent.click(screen.getByRole('link', { name: label(language) }));
      assert.equal(location.pathname + location.search + location.hash, expectedGuide(language));
      assert.equal(document.querySelector('#guia').dataset.operation, 'sell');
      assert.equal(document.querySelector('#guia').dataset.offerId, 'eldorado_usdt_bob');
      assert.match(document.querySelector('#guia').textContent, language === 'en' ? /Sell USDT and receive bolivianos/ : /Vender USDT y recibir bolivianos/);
      assert.deepEqual(events.at(-1), { language, destination: expectedGuide(language), link_label: 'home_mobile_sell_usdt_guide', page_type: 'home' });
      cleanup(); events.length = 0;
    }
  });

  it('supports Back, Forward and repeated intentional clicks without render-generated events', async () => {
    mount('en', true);
    fireEvent.click(screen.getByRole('link', { name: label('en') }));
    assert.equal(events.length, 1);
    await React.act(async () => navigate(-1));
    assert.equal(location.pathname + location.search, '/?lang=en');
    assert.ok(screen.getByRole('link', { name: label('en') }));
    await React.act(async () => navigate(1));
    assert.equal(location.pathname + location.search + location.hash, expectedGuide('en'));
    assert.equal(events.length, 1);
    await React.act(async () => navigate(-1));
    fireEvent.click(screen.getByRole('link', { name: label('en') }));
    assert.equal(events.length, 2);
    assert.deepEqual(events[0], events[1]);
  });

  it('keeps modified clicks native and leaves the current route untouched', () => {
    mount();
    const preventJSDOMNavigation = event => event.preventDefault();
    document.addEventListener('click', preventJSDOMNavigation);
    try {
      for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
        fireEvent.click(screen.getByRole('link', { name: label('es') }), { [modifier]: true });
        assert.equal(location.pathname, '/');
        assert.equal(screen.getByRole('link', { name: label('es') }).getAttribute('href'), expectedGuide('es'));
      }
    } finally { document.removeEventListener('click', preventJSDOMNavigation); }
    assert.equal(events.length, 4, 'each intentional link activation records the existing related-link event');
  });

  it('retains the calculator action and emits no seller event for it', () => {
    mount();
    fireEvent.click(screen.getByRole('link', { name: 'Calculadora' }));
    assert.equal(location.pathname, '/calculadora');
    assert.equal(events.length, 0);
  });

  it('uses wrapping, constrained links with 44px targets and keyboard focus styles', () => {
    mount();
    const nav = screen.getByRole('navigation', { name: 'Guía de venta y calculadora' });
    for (const value of ['google-anno-skip', 'flex-wrap', 'w-full', 'max-w-xs']) assert.ok(nav.classList.contains(value));
    for (const link of screen.getAllByRole('link')) for (const value of ['min-h-[44px]', 'min-w-0', 'max-w-full', 'focus-visible:ring-2']) assert.ok(link.classList.contains(value));
  });

  it('is mounted only in the mobile hero after the unchanged signup button and commission line', () => {
    const home = readFileSync(join(__dirname, '../frontend/src/pages/Home.jsx'), 'utf8');
    const hero = home.slice(home.indexOf('{/* Mobile: compact title'), home.indexOf('{/* Hero — desktop only */}'));
    assert.equal((home.match(/<MobileMoneyActions\b/g) || []).length, 1);
    assert.match(hero, /className="md:hidden text-center"/);
    assert.match(hero, /<FinancialOfferButton placement="home_mobile_hero" className="h-11 w-full max-w-xs justify-center">\s*\{language === 'es' \? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account'\}\s*<\/FinancialOfferButton>\s*<p className="text-\[11px\] text-gray-500 dark:text-gray-400">\{language === 'es' \? 'Podemos recibir una comisión' : 'We may earn a commission'\}<\/p>\s*<MobileMoneyActions language=\{language\} \/>/);
    assert.doesNotMatch(hero, /live\.[^\n]*&&[^\n]*MobileMoneyActions|currentRate[^\n]*&&[^\n]*MobileMoneyActions/);
  });

  it('introduces no new event system, amounts, external referral or rate/eligibility claims', () => {
    const source = readFileSync(join(__dirname, '../frontend/src/components/MobileMoneyActions.jsx'), 'utf8');
    assert.doesNotMatch(source, /trackEvent\(|trackReferral|trackOffer|IntersectionObserver|localStorage|sessionStorage|fetch\(|https?:|amount|quickUsd|currentRate|bonus|guarantee/i);
    assert.match(source, /trackRelatedLinkClicked/);
    assert.doesNotMatch(source, /stopPropagation|preventDefault|onKeyDown|window\.open/);
  });
});
