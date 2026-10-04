const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createRequire } = require('node:module');
const vm = require('node:vm');
const frontendRequire = createRequire(join(__dirname, '../frontend/package.json'));
const { buildSync } = frontendRequire('esbuild');
const React = frontendRequire('react');
const { renderToStaticMarkup } = frontendRequire('react-dom/server');
const { MemoryRouter } = frontendRequire('react-router-dom');
const page = readFileSync(join(__dirname, '../frontend/src/pages/EuroToBoliviano.jsx'), 'utf8');
const panel = page.slice(page.indexOf('export function EuroNextSteps'), page.indexOf('\nfunction EuroToBoliviano()'));
const bundle = buildSync({ stdin: { contents: `import { Link } from 'react-router-dom'; import { travelGuidePath } from './src/config/travelGuide'; import { localizedLocation } from './src/utils/pageLocale'; export const events = []; const trackRelatedLinkClicked = event => events.push(event); ${panel}`, resolveDir: join(__dirname, '../frontend'), loader: 'jsx' }, bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'react-router-dom'] }).outputFiles[0].text;
const scope = { module: { exports: {} }, exports: {}, require: frontendRequire, URLSearchParams };
vm.runInNewContext(bundle, scope);
const { EuroNextSteps, events } = scope.module.exports;
const elements = (node) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(elements) : [node, ...elements(node.props?.children)];
const labels = ['euro_next_travel', 'euro_next_receive_payments', 'euro_next_buy_usdt'];

function expected(language) {
  const suffix = language === 'en' ? '&lang=en' : '';
  return [language === 'en' ? '/bolivia-money-guide' : '/guia-dinero-bolivia', `/comprar-dolares?intent=receive_payments${suffix}#guia`, `/comprar-dolares?intent=buy_usdt${suffix}#guia`];
}

describe('Euro next-step choices', () => {
  it('renders the exact three localized internal choices and descriptive link text', () => {
    const copy = {
      es: ['¿Qué querés hacer ahora?', 'Viajar a Bolivia', 'Efectivo, tarjetas y cajeros', 'Cobrar del exterior', 'Revisar cómo recibir un pago', 'Comprar USDT con bolivianos', 'Ver pasos, requisitos y costos'],
      en: ['What would you like to do next?', 'Travel to Bolivia', 'Cash, cards and ATMs', 'Get paid from abroad', 'Review how to receive a payment', 'Buy USDT with bolivianos', 'See steps, requirements and costs'],
    };
    for (const language of ['es', 'en']) {
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(EuroNextSteps, { language })));
      const hrefs = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
      assert.deepEqual(hrefs, expected(language));
      for (const value of copy[language]) assert.ok(html.includes(value), value);
      assert.match(html, /aria-labelledby="euro-next-step-heading"/);
      assert.equal((html.match(/id="euro-next-step-heading"/g) || []).length, 1);
      assert.doesNotMatch(html, /target="_blank"|https?:|payment-cost-comparison|referral|guarantee|bonus/i);
    }
  });
  it('uses only fixed related-link event payloads and retains each real destination', () => {
    for (const language of ['es', 'en']) {
      events.length = 0;
      const links = elements(EuroNextSteps({ language })).filter((node) => node.props?.to);
      assert.equal(links.length, 3);
      links.forEach((node) => node.props.onClick());
      assert.deepEqual(JSON.parse(JSON.stringify(events)), expected(language).map((destination, index) => ({ language, destination, link_label: labels[index], page_type: 'euro' })));
      assert.ok(links.every((node) => node.props.to.startsWith('/')));
    }
    assert.match(page, /import \{ trackRelatedLinkClicked \} from '\.\.\/utils\/analyticsEvents'/);
    assert.doesNotMatch(panel, /convertEur|trackReferral|trackEvent\(|localStorage|sessionStorage|document\.cookie|fetch\(/);
  });
  it('is stacked and contained at narrow widths with real keyboard links', () => {
    const nodes = elements(EuroNextSteps({ language: 'en' }));
    const grid = nodes.find((node) => node.props?.className?.includes('sm:grid-cols-3'));
    assert.ok(grid?.props.className.includes('grid gap-3'));
    const links = nodes.filter((node) => node.props?.to);
    for (const node of links) {
      assert.ok(node.props.className.includes('min-w-0'));
      assert.ok(node.props.className.includes('min-h-[72px]'));
      assert.ok(node.props.className.includes('focus-visible:ring-2'));
      assert.equal(node.props.tabIndex, undefined);
    }
  });
  it('allows the EUR input to shrink beside its result on narrow screens', () => {
    const input = page.match(/<input\s+id="euro-quick"[\s\S]*?\/>/)[0];
    const classes = input.match(/className="([^"]+)"/)[1].split(' ');
    for (const className of ['min-w-0', 'flex-1', 'min-h-[44px]']) assert.ok(classes.includes(className));
    assert.match(page, /<label htmlFor="euro-quick"/);
    assert.match(input, /type="number"/);
    assert.match(input, /inputMode="decimal"/);
    assert.match(input, /value=\{convertEur\}/);
    assert.match(input, /onChange=\{\(e\) => setConvertEur\(e.target.value\)\}/);
    assert.match(page, /Number\(convertEur\) \* buy\)\.toFixed\(2\)/);
  });
  it('replaces only the generic banner after the EUR snapshot and keeps the dollar-rate related link', () => {
    const render = page.slice(page.indexOf('\nfunction EuroToBoliviano()'));
    assert.doesNotMatch(render, /BinanceBanner|See today’s blue dollar rate →|Ver cotización del dólar blue hoy →/);
    assert.ok(render.indexOf('<CurrencyRateSnapshot') < render.indexOf('<EuroNextSteps language={language} />'));
    assert.ok(render.indexOf('<EuroNextSteps language={language} />') < render.indexOf('{/* Main Content */}'));
    const related = render.slice(render.indexOf('{/* Related Links */}'));
    assert.match(related, /to="\/dolar-blue-hoy"/);
    assert.match(render, /fetchBlueHistory\('1W', 'EUR'\)/);
    assert.match(render, /Number\(convertEur\) \* buy/);
    assert.match(render, /canonical="\/euro-a-boliviano"/);
  });
});
