const { it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { pathToFileURL } = require('node:url');
const repo = path.resolve(__dirname, '..');
const frontendRequire = createRequire(path.join(repo, 'frontend/package.json'));
const { JSDOM } = frontendRequire('jsdom');
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://www.boliviablue.com/comprar-dolares', pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); });
// Exercise exposure-event plumbing; actual visibility still needs browser QA.
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe() { this.callback([{ isIntersecting: true, intersectionRatio: 1 }]); }
  disconnect() {}
};
const React = frontendRequire('react');
const { createRoot } = frontendRequire('react-dom/client');
const { createMemoryRouter, RouterProvider } = frontendRequire('react-router-dom');
const { build } = frontendRequire('esbuild');
const h = React.createElement;
let language = 'es';
const events = [];
globalThis.__guideTestLanguage = () => ({ language, t: key => key });
globalThis.__guideTestEvent = (name, params) => events.push({ name, params });
const model = () => import(pathToFileURL(path.join(repo, 'frontend/src/data/buyGuidePage.js')));
const referrals = () => import(pathToFileURL(path.join(repo, 'frontend/src/config/referrals.js')));

async function loadGuide() {
  const result = await build({
    entryPoints: [path.join(repo, 'frontend/src/pages/BuyDollars.jsx')],
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-router-dom'],
    plugins: [{ name: 'guide-fixtures', setup(api) {
      const fixtures = [
        [/contexts\/LanguageContext$/, 'export const useLanguage = () => globalThis.__guideTestLanguage();'],
        [/components\/(Header|Navigation|Footer|PageMeta|BlueRateCards|PlatformRatesBoard)$/, 'export default function Fixture() { return null; }'],
        [/components\/BrandButton$/, 'export const BinanceButton = () => null;'],
        [/hooks\/useAdsenseReady$/, 'export const useAdsenseReady = () => {};'],
        [/utils\/api$/, 'export const fetchBlueRate = async () => null;'],
        [/^\.\/analytics$/, 'export const trackEvent = (name, params) => globalThis.__guideTestEvent(name, params);'],
      ];
      fixtures.forEach(([filter, contents], index) => {
        const namespace = `guide-fixture-${index}`;
        api.onResolve({ filter }, () => ({ path: namespace, namespace }));
        api.onLoad({ filter: /.*/, namespace }, () => ({ contents, loader: 'js' }));
      });
    } }],
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, frontendRequire);
  return module.exports.default;
}
const goal = () => document.querySelector('[aria-label="Tu objetivo"], [aria-label="Your goal"]');
const directionButtons = () => document.querySelectorAll('[aria-label="Dirección de la conversión"] button, [aria-label="Conversion direction"] button');
const settle = async (action) => React.act(async () => { await action(); });

it('shares direction, handoff and unchanged commercial disclosure with initial HTML in ES/EN', async () => {
  const { getBuyGuidePage } = await model();
  const { getFinancialOffer } = await referrals();
  const { renderBuyGuideHtml } = await import(pathToFileURL(path.join(repo, 'seo/buyGuideSeo.js')));
  const template = readFileSync(path.join(repo, 'frontend/index.html'), 'utf8');
  for (const lang of ['es', 'en']) for (const operation of ['buy', 'sell']) {
    const page = getBuyGuidePage(lang, 'buy_usdt', operation);
    const base = getFinancialOffer(lang, 'buy_usdt');
    assert.equal(page.usdtGoalLabel, operation === 'sell' ? (lang === 'es' ? 'Vender USDT' : 'Sell USDT') : (lang === 'es' ? 'Comprar USDT' : 'Buy USDT'));
    assert.equal(page.offer.cta, lang === 'es' ? 'Continuar en El Dorado' : 'Continue to El Dorado');
    const initial = new JSDOM(renderBuyGuideHtml(template, `?lang=${lang}&intent=buy_usdt&operation=${operation}`)).window.document;
    assert.equal(initial.querySelector('nav [aria-current="true"]').textContent, page.usdtGoalLabel);
    const cta = initial.querySelector(`a[href="${base.href}"]`);
    assert.equal(cta.textContent, page.offer.cta);
    assert.equal(cta.getAttribute('rel'), 'sponsored noopener noreferrer');
    assert.ok(initial.body.textContent.includes(page.offer.handoff));
    assert.ok(initial.body.textContent.includes(base.disclosure));
    assert.equal(page.offer.disclosure, base.disclosure);
    assert.equal(page.offer.qualification, base.qualification);
    assert.equal(page.offer.href, 'https://link.eldorado.io/MMLGEZcDf5b');
    assert.equal(page.offer.variant, 'handoff_v2');
    assert.equal(page.offer.id, operation === 'sell' ? 'eldorado_usdt_bob' : 'eldorado_bob_usdt');
    assert.equal(page.offer.intent, operation === 'sell' ? 'sell_usdt' : 'buy_usdt');
    assert.ok(page.offer.handoff.includes(operation === 'sell' ? 'USDT → BOB' : 'BOB → USDT'));
    assert.match(page.offer.handoff, lang === 'es' ? /ofertas y medios de pago disponibles.*no crea una orden/ : /available offers and payment methods.*does not create an order/);
    assert.equal(base.handoff, undefined);
    assert.equal(base.cta, lang === 'es' ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account');
    assert.equal(base.variant, 'benefit_v1');
    assert.deepEqual(getBuyGuidePage(lang, 'receive_payments', operation).offer, getFinancialOffer(lang, 'receive_payments'));
  }
  assert.equal(getBuyGuidePage('en', 'unknown', 'unknown').usdtGoalLabel, 'Buy USDT');
});

it('updates rendered goals and every guide CTA through direction, intent and history changes in both languages', async () => {
  const Guide = await loadGuide();
  const { getBuyGuidePage } = await model();
  for (language of ['es', 'en']) {
    const root = createRoot(document.getElementById('root'));
    const router = createMemoryRouter([{ path: '*', element: h(Guide) }], { initialEntries: [`/comprar-dolares?intent=buy_usdt&operation=buy&lang=${language}#guia`] });
    await settle(() => root.render(h(RouterProvider, { router })));
    const check = (operation) => {
      const page = getBuyGuidePage(language, 'buy_usdt', operation);
      assert.equal(goal().querySelector('[aria-pressed="true"]').textContent, page.usdtGoalLabel);
      assert.equal(document.querySelector('[data-eldorado-guide]').getAttribute('data-eldorado-guide'), operation);
      assert.equal([...document.querySelectorAll('p')].filter(p => p.textContent === page.offer.handoff).length, 2);
      const ctas = [...document.querySelectorAll(`a[data-offer-id="${page.offer.id}"]`)];
      assert.equal(ctas.length, 3, 'top, guide and mobile sticky use the same selected offer');
      events.length = 0;
      ctas.forEach(cta => {
        assert.ok(cta.textContent.startsWith(page.offer.cta));
        assert.equal(cta.href, page.offer.href);
        assert.match(cta.rel, /sponsored/);
        cta.click();
      });
      const clicks = events.filter(e => e.name === 'referral_clicked');
      assert.deepEqual(clicks.map(e => e.params.placement), ['buy_page_top', 'buy_page_guide', 'buy_page_sticky']);
      for (const { params } of clicks) {
        assert.equal(params.intent, page.offer.intent);
        assert.equal(params.offer_id, page.offer.id);
        assert.equal(params.variant, 'handoff_v2');
        assert.equal(params.link_label, page.offer.cta);
        assert.equal(params.language, language);
        assert.equal(params.destination, page.offer.href);
        for (const key of ['value', 'currency', 'revenue', 'qualified', 'signed_up']) assert.equal(key in params, false);
      }
      assert.equal(events.filter(e => e.name === 'outbound_source_clicked').length, 3);
    };
    const exposures = events.filter(e => e.name === 'offer_viewed' && e.params.partner === 'eldorado');
    assert.equal(exposures.length, 3);
    assert.ok(exposures.every(e => e.params.variant === 'handoff_v2' && e.params.intent === 'buy_usdt'));
    check('buy');
    await settle(() => directionButtons()[1].click());
    const sellExposures = events.filter(e => e.name === 'offer_viewed' && e.params.partner === 'eldorado');
    assert.equal(sellExposures.length, 3);
    assert.ok(sellExposures.every(e => e.params.intent === 'sell_usdt' && e.params.offer_id === 'eldorado_usdt_bob'));
    check('sell');
    await settle(() => directionButtons()[1].click());
    check('sell');
    await settle(() => goal().querySelectorAll('button')[1].click());
    assert.equal(document.querySelector('[data-eldorado-guide]'), null);
    assert.equal(document.querySelectorAll('a[data-offer-id="takenos_client_payments"]').length, 3);
    assert.equal(document.body.textContent.includes('This link does not create an order.'), false);
    assert.equal(document.body.textContent.includes('Este enlace no crea una orden.'), false);
    await settle(() => router.navigate(-1));
    check('sell');
    await settle(() => directionButtons()[0].click());
    check('buy');
    await settle(() => root.unmount());
    router.dispose();
    events.length = 0;
  }
});
