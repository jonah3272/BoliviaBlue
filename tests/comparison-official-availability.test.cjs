const { before, afterEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..');
const requireFrontend = createRequire(path.join(repo, 'frontend/package.json'));
const { JSDOM } = requireFrontend('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://www.boliviablue.com/comparacion' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
const React = requireFrontend('react');
const { render, screen, waitFor, cleanup } = requireFrontend('@testing-library/react');
const { MemoryRouter } = requireFrontend('react-router-dom');
const { build } = requireFrontend('esbuild');

const official = { official_buy: 6.86, official_sell: 6.96, official_mid: 6.91 };
const missing = { official_buy: null, official_sell: null, official_mid: null };
let Comparison, sourceObservationModel, language, reader, response;
const queries = [];
globalThis.__comparisonAvailabilityTest = {
  language: () => ({ language, t: key => key }),
  read: async () => { response = await reader(); return response; },
};

// Execute the actual frontend reader with only its infrastructure boundaries
// replaced. A fresh VM gives each case an independent production rate cache.
function actualReader({ fields = missing, fallback = 'none', buy = 12.02, sell = 11.98 } = {}) {
  const row = { t: new Date().toISOString(), buy, sell, mid: (buy + sell) / 2, ...fields };
  const supabase = { from(table) {
    assert.equal(table, 'rates');
    let selection;
    const query = new Proxy({}, { get(_, key) {
      if (key === 'select') return value => { selection = value; queries.push(value); return query; };
      if (key === 'single') return async () => ({ data: row, error: null });
      if (key === 'maybeSingle') return async () => {
        if (selection === 'official_buy, official_sell, official_mid') {
          if (fallback === 'throw') throw new Error('Official lookup unavailable');
          if (fallback === 'error') return { data: null, error: { message: 'Official lookup unavailable' } };
          return { data: fallback === 'valid' ? official : null, error: null };
        }
        return { data: null, error: null };
      };
      return () => query;
    } });
    return query;
  } };
  const context = {
    supabase, sourceObservationModel, logger: { warn() {}, error() {} },
    // The source's fresh-row path needs no network and no retry; the timeout
    // boundary is disabled so a successful local test leaves no 18s timer.
    setTimeout: () => 0,
    fetch: () => { throw new Error('Unexpected network request'); },
  };
  const source = readFileSync(path.join(repo, 'frontend/src/utils/api.js'), 'utf8')
    .replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
  vm.runInNewContext(source + '\nthis.read = fetchBlueRate;', context);
  return context.read;
}

before(async () => {
  ({ sourceObservationModel } = await import('../frontend/src/utils/sourceObservation.js'));
  const result = await build({
    entryPoints: [path.join(repo, 'frontend/src/pages/Comparison.jsx')],
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/jsx-runtime', 'react-router-dom'],
    plugins: [{ name: 'comparison-boundaries', setup(api) {
      api.onResolve({ filter: /contexts\/LanguageContext$/ }, () => ({ path: 'language', namespace: 'test' }));
      api.onResolve({ filter: /utils\/api$/ }, () => ({ path: 'api', namespace: 'test' }));
      api.onResolve({ filter: /utils\/analyticsEvents$/ }, () => ({ path: 'analytics', namespace: 'test' }));
      api.onResolve({ filter: /hooks\/useAdsenseReady$/ }, () => ({ path: 'ads', namespace: 'test' }));
      api.onResolve({ filter: /components\/(Header|Footer|Navigation|BlueRateCards|BinanceBanner|PageMeta)$/ }, () => ({ path: 'empty', namespace: 'test' }));
      api.onLoad({ filter: /.*/, namespace: 'test' }, ({ path: name }) => ({ loader: 'js', contents: {
        language: 'export const useLanguage = () => globalThis.__comparisonAvailabilityTest.language();',
        api: 'export const fetchBlueRate = () => globalThis.__comparisonAvailabilityTest.read(); export const fetchBlueHistory = async () => ({ points: [] });',
        analytics: 'export const trackComparisonPageViewed = () => {}; export const trackRelatedLinkClicked = () => {};',
        ads: 'export const useAdsenseReady = () => {};',
        empty: 'export default () => null;',
      }[name] }));
    } }],
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, requireFrontend);
  Comparison = module.exports.default;
});
afterEach(cleanup);

async function mount(options) {
  queries.length = 0;
  response = null;
  reader = actualReader(options);
  render(React.createElement(MemoryRouter, null, React.createElement(Comparison)));
  await waitFor(() => assert.ok(response));
  await waitFor(() => assert.ok(screen.queryByText(`${response.buy.toFixed(2)} / ${response.sell.toFixed(2)} BOB/USDT`)));
  const section = screen.getByRole('region', { name: language === 'es' ? 'Cotización actual: blue vs valor referencial (BCB)' : 'Current quote: blue vs reference rate (BCB)' });
  return [...section.querySelectorAll('p.text-2xl')].map(element => element.textContent);
}

for (const locale of ['es', 'en']) describe(`Comparison actual reader to UI (${locale})`, () => {
  for (const [name, options] of [
    ['stored nulls and no last-official row', {}],
    ['missing buy side', { fields: { ...official, official_buy: null } }],
    ['missing sell side', { fields: { ...official, official_sell: null } }],
    ['a stored midpoint without a valid pair', { fields: { ...missing, official_mid: 6.91 } }],
    ['omitted official fields', { fields: {} }],
    ['a returned lookup error', { fallback: 'error' }],
    ['a thrown lookup error', { fallback: 'throw' }],
  ]) it(`shows no gap for ${name}`, async () => {
    language = locale;
    const values = await mount(options);
    assert.equal(response.buy, 12.02);
    assert.equal(response.sell, 11.98);
    assert.ok(response.official_buy == null || response.official_sell == null);
    assert.ok(queries.includes('official_buy, official_sell, official_mid'));
    assert.deepEqual(values, ['12.02 / 11.98 BOB/USDT', '—', '—', '—']);
  });

  for (const fallback of ['none', 'valid']) it(`preserves healthy official comparison (${fallback === 'valid' ? 'recovered fallback' : 'current row'})`, async () => {
    language = locale;
    assert.deepEqual(await mount({ fields: fallback === 'valid' ? missing : official, fallback }), ['12.02 / 11.98 BOB/USDT', '6.86 / 6.96 BOB/USD', '+5.09 BOB', '+73.7%']);
  });

  it('keeps a legitimate zero difference visible', async () => {
    language = locale;
    assert.deepEqual(await mount({ fields: official, buy: 6.86, sell: 6.96 }), ['6.86 / 6.96 BOB/USDT', '6.86 / 6.96 BOB/USD', '+0.00 BOB', '+0.0%']);
  });

  it('preserves a negative difference without changing arithmetic', async () => {
    language = locale;
    assert.deepEqual(await mount({ fields: official, buy: 6.5, sell: 6.5 }), ['6.50 / 6.50 BOB/USDT', '6.86 / 6.96 BOB/USD', '-0.41 BOB', '-5.9%']);
  });
});
