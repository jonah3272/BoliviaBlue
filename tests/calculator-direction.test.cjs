const { describe, it, before, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const repo = path.resolve(__dirname, '..');
const requireFrontend = createRequire(path.join(repo, 'frontend/package.json'));
const { JSDOM } = requireFrontend('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://www.boliviablue.com/calculadora' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
const React = requireFrontend('react');
const { render, fireEvent, screen, waitFor, cleanup } = requireFrontend('@testing-library/react');
const { BrowserRouter, MemoryRouter, useNavigate } = requireFrontend('react-router-dom');
const { build } = requireFrontend('esbuild');
const h = React.createElement;
const fixture = {
  buy_bob_per_usd: 12.01, sell_bob_per_usd: 11.97,
  official_buy: 6.86, official_sell: 6.96,
  buy_bob_per_eur: 13.2, sell_bob_per_eur: 13.4,
  buy_bob_per_brl: 2.4, sell_bob_per_brl: 2.5,
  buy_bob_per_cop: 0.003, sell_bob_per_cop: 0.0031,
  buy_bob_per_pen: 3.1, sell_bob_per_pen: 3.2,
  buy_bob_per_ars: 0.01, sell_bob_per_ars: 0.011,
  buy_bob_per_clp: 0.012, sell_bob_per_clp: 0.013,
};
let language, rateResponse, copied, events, navigate, schema, Calculator, CalculatorPage, calculatorRate, refresh;
const nativeSetInterval = globalThis.setInterval;
const translations = { es: { bolivianos: 'Bolivianos', swapCurrencies: 'Intercambiar monedas', official: 'Oficial', unofficial: 'Blue' }, en: { bolivianos: 'Bolivianos', swapCurrencies: 'Swap currencies', official: 'Official', unofficial: 'Blue' } };
globalThis.__calculatorTest = {
  language: () => ({ language, t: (key) => translations[language][key] || key }),
  rates: () => rateResponse(),
  event: (...args) => events.push(args),
  meta: (value) => { schema = value; return null; },
};
async function loadComponent(entry) {
  const output = await build({ entryPoints: [path.join(repo, entry)], bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'react-router-dom'], plugins: [{ name: 'fixtures', setup(api) {
    api.onResolve({ filter: /contexts\/LanguageContext$/ }, () => ({ path: 'language', namespace: 'fixture' }));
    api.onResolve({ filter: /utils\/api$/ }, () => ({ path: 'rates', namespace: 'fixture' }));
    api.onResolve({ filter: /utils\/analytics(Events)?$/ }, () => ({ path: 'analytics', namespace: 'fixture' }));
    api.onResolve({ filter: /hooks\/useAdsenseReady$/ }, () => ({ path: 'ads', namespace: 'fixture' }));
    api.onResolve({ filter: /components\/(Header|BlueRateCards|RateTrioStrip|PageMeta|Navigation|Footer)$/ }, (args) => ({ path: args.path.endsWith('PageMeta') ? 'meta' : 'empty', namespace: 'fixture' }));
    api.onResolve({ filter: /FinancialOfferCard$/ }, () => ({ path: 'offer', namespace: 'fixture' }));
    api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path: name }) => ({ loader: 'js', contents: {
      language: 'export const useLanguage = () => globalThis.__calculatorTest.language();',
      rates: 'export const fetchBlueRate = () => globalThis.__calculatorTest.rates(); export const fetchBlueHistory = async () => [];',
      analytics: 'export const trackCalculatorUsage = (...a) => globalThis.__calculatorTest.event("usage", ...a); export const trackCalculatorCurrencySwitch = (...a) => globalThis.__calculatorTest.event("currency", ...a); export const trackCalculatorSwap = (...a) => globalThis.__calculatorTest.event("swap", ...a); export const trackCalculatorUsed = (...a) => globalThis.__calculatorTest.event("used", ...a);',
      ads: 'export const useAdsenseReady = () => {};',
      empty: 'export default () => null;',
      meta: 'export default (props) => globalThis.__calculatorTest.meta(props);',
      offer: 'import { createElement } from "react"; export const FinancialOfferButton = ({ children }) => createElement("a", { href: "https://example.test/unchanged-offer" }, children);',
    }[name] }));
  } }] });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', output.outputFiles[0].text)(module, module.exports, requireFrontend);
  return module.exports.default;
}
function NavigationHarness() { navigate = useNavigate(); return null; }
function mount(route = '/calculadora', component = Calculator) {
  return render(h(MemoryRouter, { initialEntries: [route] }, h(NavigationHarness), h(component)));
}
const bob = () => document.getElementById('calculator-bob');
const foreign = () => document.getElementById('calculator-foreign');
const click = (name) => fireEvent.click(screen.getByRole('button', { name, exact: true }));
const change = (input, value) => fireEvent.change(input, { target: { value } });
const history = () => JSON.parse(localStorage.getItem('calculatorHistory'));
const result = async (expectedBob, expectedForeign) => waitFor(() => { assert.equal(bob().value, expectedBob); assert.equal(foreign().value, expectedForeign); });
before(async () => {
  Calculator = await loadComponent('frontend/src/components/CurrencyCalculator.jsx');
  CalculatorPage = await loadComponent('frontend/src/pages/Calculator.jsx');
  ({ calculatorRate } = await import('../frontend/src/utils/calculatorRates.js'));
});
beforeEach(() => {
  globalThis.setInterval = (callback, delay, ...args) => { if (delay === 60000) refresh = callback; return nativeSetInterval(callback, delay, ...args); };
  language = 'es'; rateResponse = async () => ({ ...fixture }); copied = ''; events = []; schema = undefined;
  localStorage.clear();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { copied = text; } } });
});
afterEach(() => { cleanup(); globalThis.setInterval = nativeSetInterval; });

describe('calculator P2P direction', () => {
  it('matches the homepage sell reference and both USDT trade directions before fees', async () => {
    mount(); await result('1197.00', '100');
    const home = readFileSync(path.join(repo, 'frontend/src/pages/Home.jsx'), 'utf8');
    assert.match(home, /Number\(quickUsd\) \* Number\(currentRate\.sell\)/);
    assert.equal(Number(bob().value), 100 * fixture.sell_bob_per_usd);
    click('USDT'); await result('1197.00', '100');
    change(bob(), '1201'); await result('1201', '100.0000');
    assert.match(document.body.textContent, /Tasa aplicada: 12.01/);
    assert.equal(history()[0].from, 'BOB'); assert.equal(history()[0].to, 'USDT');
    assert.equal(history()[0].rate, '12.0100');
  });
  it('shows two genuine directional unit rates independent of active input', async () => {
    mount(); await result('1197.00', '100');
    assert.ok(screen.getByText('11.97')); assert.ok(screen.getByText('0.0833'));
    change(bob(), '1201'); await result('1201', '100.0000');
    assert.ok(screen.getByText('11.97')); assert.ok(screen.getByText('0.0833'));
  });
  it('swaps direction while retaining the prior output in its own currency, including repeated swaps', async () => {
    mount(); await result('1197.00', '100');
    click('Intercambiar monedas'); await result('1197.00', '99.6669');
    click('Intercambiar monedas'); await result('1193.01', '99.6669');
    assert.equal(events.filter(([event]) => event === 'swap').length, 2);
    assert.equal(events.filter(([event]) => event === 'used').length, 1);
    assert.deepEqual(Object.keys(events.find(([event]) => event === 'used')[1]).sort(), ['from_currency', 'language', 'to_currency', 'use_official']);
  });
  it('applies quick amounts in both directions without duplicate history entries', async () => {
    mount(); await result('1197.00', '100'); assert.equal(history().length, 1);
    click('$500'); await result('5985.00', '500'); assert.equal(history().length, 2);
    change(bob(), '1201'); await result('1201', '100.0000');
    click('1,000 Bs'); await result('1000', '83.2639');
    assert.equal(history().length, 4);
  });
  it('uses URL USD and BOB presets, resets incompatible currency/rate modes, and handles Back', async () => {
    mount('/calculadora?usd=500'); await result('5985.00', '500');
    click('EUR'); click('Oficial');
    await React.act(async () => navigate('/calculadora?bob=1201'));
    await result('1201', '100.0000');
    assert.match(document.querySelector('label[for="calculator-foreign"]').textContent, /USD/);
    await React.act(async () => navigate(-1)); await result('5985.00', '500');
  });
  it('reapplies repeated same-URL scenario presets after currency, rate and amount changes', async () => {
    for (const scenario of [
      { route: '/calculadora?usd=500', link: /Remesa \$500/, initialBob: '5985.00', initialForeign: '500' },
      { route: '/calculadora?bob=5000', link: /Viaje 5.000 Bs/, initialBob: '5000', initialForeign: '416.3197' },
    ]) {
      mount(scenario.route, CalculatorPage); await result(scenario.initialBob, scenario.initialForeign);
      click('EUR'); click('Oficial'); change(foreign(), '700');
      await waitFor(() => assert.equal(foreign().value, '700'));
      fireEvent.click(screen.getByRole('link', { name: scenario.link }));
      await result(scenario.initialBob, scenario.initialForeign);
      assert.match(document.querySelector('label[for="calculator-foreign"]').textContent, /USD/);
      assert.match(document.body.textContent, /Referencia P2P USDT/);
      // A second activation after editing the opposite input also reapplies it.
      change(bob(), '700');
      fireEvent.click(screen.getByRole('link', { name: scenario.link }));
      await result(scenario.initialBob, scenario.initialForeign);
      // Equal-query history entries are navigation, not a new scenario click.
      await React.act(async () => navigate(scenario.route));
      change(foreign(), '700');
      await React.act(async () => navigate(-1));
      await result('8379.00', '700');
      await React.act(async () => navigate(1));
      await result('8379.00', '700');
      cleanup(); localStorage.clear();
    }
  });
  it('does not reset the current calculator for modified scenario clicks intended for another tab', async () => {
    mount('/calculadora?usd=500', CalculatorPage); await result('5985.00', '500');
    click('EUR'); click('Oficial'); change(foreign(), '700'); await result('5277.80', '700');
    const preventBrowserNavigation = (event) => event.preventDefault();
    document.addEventListener('click', preventBrowserNavigation);
    try {
      for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
        fireEvent.click(screen.getByRole('link', { name: /Remesa \$500/ }), { [modifier]: true });
        await result('5277.80', '700');
      }
    } finally { document.removeEventListener('click', preventBrowserNavigation); }
  });
  it('preserves edited currency, rate and amount on hash navigation and hash Back/Forward', async () => {
    mount('/calculadora?usd=500', CalculatorPage); await result('5985.00', '500');
    click('EUR'); click('Oficial'); change(foreign(), '700'); await result('5277.80', '700');
    await React.act(async () => navigate('/calculadora?usd=500#google_vignette'));
    await result('5277.80', '700');
    await React.act(async () => navigate(-1)); await result('5277.80', '700');
    await React.act(async () => navigate(1)); await result('5277.80', '700');
    // An intentional same-query scenario click still applies from a hash URL.
    fireEvent.click(screen.getByRole('link', { name: /Remesa \$500/ }));
    await result('5985.00', '500');
  });
  it('preserves edits for native BrowserRouter hash changes after a scenario click', async () => {
    window.history.replaceState(null, '', '/calculadora?usd=100');
    render(h(BrowserRouter, null, h(CalculatorPage)));
    await result('1197.00', '100');
    fireEvent.click(screen.getByRole('link', { name: /Remesa \$500/ })); await result('5985.00', '500');
    click('EUR'); click('Oficial'); change(foreign(), '700'); await result('5277.80', '700');
    await React.act(async () => {
      window.location.hash = 'calculator-section';
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await result('5277.80', '700');
    await React.act(async () => {
      window.location.hash = 'google_vignette';
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await result('5277.80', '700');
    await React.act(async () => {
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await result('5277.80', '700');
    await React.act(async () => {
      window.history.forward();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await result('5277.80', '700');
    fireEvent.click(screen.getByRole('link', { name: /Remesa \$500/ })); await result('5985.00', '500');
    assert.equal(window.location.hash, '');
  });
  it('copies and saves the displayed direction/result with P2P qualifications in ES and EN', async () => {
    for (const locale of ['es', 'en']) {
      language = locale; mount('/calculadora?bob=1201'); await result('1201', '100.0000');
      click(locale === 'es' ? 'Copiar' : 'Copy');
      await waitFor(() => assert.match(copied, /1201 BOB = 100.0000 USD/));
      assert.match(copied, /P2P/); assert.match(copied, locale === 'es' ? /antes de comisiones/ : /before fees/);
      const item = history()[0]; assert.equal(item.toAmount, foreign().value); assert.equal(item.fromAmount, '1201.00');
      assert.equal(item.calculationVersion, 2); cleanup(); localStorage.clear();
    }
  });
  it('preserves old history amounts and flags legacy P2P calculations instead of recasting them', async () => {
    const legacy = { id: 1, timestamp: '2025-01-01T00:00:00Z', from: 'USD', to: 'BOB', fromAmount: '100', toAmount: '1201', rate: '12.01', rateType: 'blue', currency: 'USD' };
    localStorage.setItem('calculatorHistory', JSON.stringify([legacy]));
    mount(); await result('1197.00', '100'); click('Historial (2)');
    assert.match(document.body.textContent, /Cálculo anterior: verificá/);
    assert.deepEqual(history()[1], legacy);
    click('Limpiar'); assert.equal(history().length, 0);
  });
  it('retains official USD direction and all existing fiat-cross blue/official arithmetic', async () => {
    for (const currency of ['USD', 'USDT', 'USDC']) {
      assert.equal(calculatorRate(fixture, currency, true, false), 6.86);
      assert.equal(calculatorRate(fixture, currency, true, true), 6.96);
      assert.equal(calculatorRate(fixture, currency, false, false), 11.97);
      assert.equal(calculatorRate(fixture, currency, false, true), 12.01);
    }
    for (const currency of ['EUR', 'BRL', 'COP', 'PEN', 'ARS', 'CLP']) {
      const key = currency.toLowerCase();
      assert.equal(calculatorRate(fixture, currency), fixture[`buy_bob_per_${key}`]);
      assert.equal(calculatorRate(fixture, currency, false, true), fixture[`sell_bob_per_${key}`]);
      assert.equal(calculatorRate(fixture, currency, true), 6.86 * (fixture[`buy_bob_per_${key}`] / 12.01));
      assert.equal(calculatorRate(fixture, currency, true, true), 6.96 * (fixture[`sell_bob_per_${key}`] / 11.97));
    }
    mount(); await result('1197.00', '100'); click('Oficial'); await result('686.00', '100');
    change(bob(), '696'); await result('696', '100.0000');
    click('EUR'); click('Blue'); change(foreign(), '100'); await result('1320.00', '100');
    change(bob(), '1340'); await result('1340', '100.0000');
  });
  it('keeps USD/USDC proxy limitations explicit and comparisons labeled as midpoint estimates', async () => {
    mount(); await result('1197.00', '100'); click('USDC');
    assert.match(document.body.textContent, /USDC es una estimación a paridad 1:1 con USDT, sin garantía de paridad o liquidez/);
    click('Comparar'); assert.match(document.body.textContent, /Estimaciones con tasa media blue, antes de comisiones/);
  });
  it('clears results/history for empty, zero, incomplete or overflowing amounts', async () => {
    mount(); await result('1197.00', '100'); const count = history().length;
    for (const invalid of ['', '0', '.', '9'.repeat(400)]) {
      change(foreign(), invalid); await result('', invalid);
      assert.equal(screen.queryByRole('button', { name: 'Copiar', exact: true }), null);
      assert.equal(history().length, count);
      assert.doesNotMatch(document.body.textContent, /Infinity|NaN/);
    }
  });
  it('renders loading and unavailable data without fabricated numbers, copy or history', async () => {
    let resolve; rateResponse = () => new Promise((done) => { resolve = done; });
    mount(); assert.match(screen.getByRole('status').textContent, /Cargando/);
    assert.equal(bob().value, ''); assert.equal(history().length, 0);
    await React.act(async () => resolve({ ...fixture, sell_bob_per_usd: null, buy_bob_per_usd: 0 }));
    assert.match(screen.getByRole('status').textContent, /Tasa no disponible/);
    assert.equal(screen.queryByRole('button', { name: 'Copiar', exact: true }), null);
    assert.doesNotMatch(document.body.textContent, /Infinity|NaN/);
  });
  it('handles failed rate requests and malformed history safely', async () => {
    language = 'en'; localStorage.setItem('calculatorHistory', '{}');
    rateResponse = async () => { throw new Error('fixture network failure'); };
    mount(); await waitFor(() => assert.match(screen.getByRole('status').textContent, /Rate unavailable/));
    assert.equal(bob().value, ''); assert.equal(history().length, 0);
  });
  it('handles unavailable browser storage without blocking conversions', async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage denied'); } });
    try { mount(); await result('1197.00', '100'); change(bob(), '1201'); await result('1201', '100.0000'); }
    finally { Object.defineProperty(globalThis, 'localStorage', original); }
  });
  it('keeps page scenarios, explanatory examples and metadata aligned in ES and EN', async () => {
    for (const locale of ['es', 'en']) {
      language = locale; mount('/calculadora', CalculatorPage); await result('1197.00', '100');
      assert.match(document.body.textContent, /5985/); assert.match(document.body.textContent, /416.32/);
      assert.doesNotMatch(document.body.textContent, /6005|Bs en efectivo|BOB cash/);
      assert.equal(schema.structuredData[0].currentExchangeRate, '11.97');
      assert.match(document.body.textContent, /0.04 Bs/);
      cleanup(); localStorage.clear();
    }
  });
  it('refreshes the active result without duplicates, discloses refresh failures and recovers', async () => {
    mount(); await result('1197.00', '100');
    await React.act(async () => refresh()); assert.equal(history().length, 1);
    rateResponse = async () => ({ ...fixture, sell_bob_per_usd: 12 });
    await React.act(async () => refresh()); await result('1200.00', '100'); assert.equal(history().length, 2);
    rateResponse = async () => { throw new Error('fixture refresh failure'); };
    await React.act(async () => refresh()); await result('1200.00', '100');
    assert.match(screen.getByRole('status').textContent, /última referencia cargada/);
    rateResponse = async () => ({ ...fixture });
    await React.act(async () => refresh()); await result('1197.00', '100');
    assert.equal(screen.queryByRole('status'), null);
  });
  it('never calculates with zero, negative or non-finite rates in either direction', async () => {
    for (const invalid of [0, -1, NaN, Infinity, null, 'bad']) {
      const data = { ...fixture, buy_bob_per_usd: invalid, sell_bob_per_usd: invalid };
      assert.equal(calculatorRate(data), 0); assert.equal(calculatorRate(data, 'USD', false, true), 0);
    }
    mount(); await result('1197.00', '100');
    rateResponse = async () => ({ ...fixture, buy_bob_per_usd: 0, sell_bob_per_usd: NaN });
    await React.act(async () => refresh()); await result('', '100');
    change(bob(), '1201'); await result('1201', '');
    assert.equal(screen.queryByRole('button', { name: 'Copiar', exact: true }), null);
    assert.equal(history().length, 1);
  });
  it('replays effects safely in StrictMode with one new result, intact legacy history and the URL BOB input', async () => {
    const legacy = { id: 'legacy', from: 'USD', to: 'BOB', fromAmount: '100', toAmount: '1201', rateType: 'blue', currency: 'USD' };
    localStorage.setItem('calculatorHistory', JSON.stringify([legacy]));
    render(h(React.StrictMode, null, h(MemoryRouter, { initialEntries: ['/calculadora?bob=1201'] }, h(Calculator))));
    await result('1201', '100.0000'); assert.equal(history().length, 2); assert.deepEqual(history()[1], legacy);
  });
  it('does not describe missing page rates as zero-value remittances', async () => {
    rateResponse = () => new Promise(() => {}); mount('/calculadora', CalculatorPage);
    assert.doesNotMatch(document.body.textContent, /~0 BOB|~0.00 USD/);
    assert.equal(schema.structuredData.length, 1);
  });
});
