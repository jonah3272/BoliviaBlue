import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getContextualDiscovery } from '../frontend/src/data/contextualDiscovery.js';
import { getSourceCompositionExample } from '../frontend/src/data/sourceCompositionExample.js';
import { getCalculatorPage } from '../frontend/src/data/calculatorPage.js';
import { languageForLocation } from '../frontend/src/utils/pageLocale.js';
import { renderContextualDiscoveryLink } from '../seo/contextualDiscoverySeo.js';
import { renderCalculatorHtml } from '../seo/calculatorSeo.js';
import { renderDataDocumentationHtml } from '../seo/dataDocumentationSeo.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const template = read('frontend/index.html');

for (const language of ['es', 'en']) {
  test(`${language}: four bounded destinations preserve locale and exact deep links`, () => {
    const discovery = getContextualDiscovery(language);
    assert.equal(Object.keys(discovery).length, 4);
    for (const link of Object.values(discovery)) {
      assert.equal(languageForLocation(new URL(link.href, 'https://www.boliviablue.com')), language);
      assert.ok(link.before && link.label && link.after);
    }
    assert.equal(discovery.calculatorReal.href, '/real-a-boliviano' + (language === 'en' ? '?lang=en' : ''));
    assert.equal(discovery.travelerReal.href, discovery.calculatorReal.href);
    assert.equal(discovery.historySources.href, getSourceCompositionExample(language).path);
    assert.equal(discovery.calculatorPayment.href, `${language === 'en' ? '/bolivia-money-guide' : '/guia-dinero-bolivia'}#payment-cost-comparison`);
    assert.equal(discovery.calculatorPayment.fullNavigation, true);
    assert.ok(Object.entries(discovery).filter(([key]) => key !== 'calculatorPayment').every(([, link]) => !link.fullNavigation));
  });

  test(`${language}: calculator/history shells include each shared contextual paragraph once in the intended section`, () => {
    const discovery = getContextualDiscovery(language);
    const calculator = renderCalculatorHtml(template, language === 'en' ? '?lang=en' : '');
    for (const key of ['calculatorReal', 'calculatorPayment']) {
      assert.ok(calculator.includes(renderContextualDiscoveryLink(discovery[key])));
      assert.equal(calculator.split(`data-contextual-discovery="${discovery[key].id}"`).length - 1, 1);
    }
    assert.ok(calculator.indexOf('id="limites-de-la-estimacion"') < calculator.indexOf('data-contextual-discovery="calculator-payment"'));
    assert.deepEqual(getCalculatorPage(language).sections.filter(section => section.contextualLink).map(section => section.id), ['limites-de-la-estimacion']);
    const history = renderDataDocumentationHtml(template, '/datos-historicos', language === 'en' ? '?lang=en' : '');
    assert.ok(history.includes(renderContextualDiscoveryLink(discovery.historySources)));
    assert.equal(history.split('data-contextual-discovery="history-sources"').length - 1, 1);
    assert.ok(history.indexOf('id="cobertura"') < history.indexOf('data-contextual-discovery="history-sources"'));
    assert.ok(history.indexOf('data-contextual-discovery="history-sources"') < history.indexOf('id="historical-chart-heading"'));
  });
}

test('React placements and traveler build shells consume shared copy without adding sitewide links', () => {
  const calculator = read('frontend/src/pages/Calculator.jsx');
  const travelers = read('frontend/src/pages/TravelersMoneyGuide.jsx');
  const history = read('frontend/src/pages/DatosHistoricos.jsx');
  const build = read('frontend/scripts/inject-seo-shell.cjs');
  assert.match(calculator, /<CurrencyCalculator[^>]*\/>\s*<ContextualDiscoveryLink link=\{page.realGuidance\}/);
  assert.match(calculator, /contextualLink && <ContextualDiscoveryLink link=\{contextualLink\}/);
  assert.match(travelers, /<ContextualDiscoveryLink link=\{discovery.travelerReal\}/);
  assert.ok(travelers.indexOf('id="efectivo"') < travelers.indexOf('link={discovery.travelerReal}'));
  assert.ok(travelers.indexOf('link={discovery.travelerReal}') < travelers.indexOf('id="cajeros"'));
  assert.match(history, /<ContextualDiscoveryLink link=\{getContextualDiscovery\(language\).historySources\}/);
  assert.match(build, /\[\['\/guia-dinero-bolivia', 'es'\], \['\/bolivia-money-guide', 'en'\]\]/);
  assert.match(build, /renderContextualDiscoveryLink\(getContextualDiscovery\(language\).travelerReal\)/);
  for (const file of ['frontend/src/components/Header.jsx', 'frontend/src/components/Footer.jsx', 'frontend/src/components/Navigation.jsx']) assert.doesNotMatch(read(file), /ContextualDiscovery/);
});

test('HTML renderer escapes every copy field and attribute', () => {
  const html = renderContextualDiscoveryLink({ id: '"test', href: '/?x="<&', before: '<script>', label: '"<&', after: "'</script>" });
  assert.doesNotMatch(html, /<script>|<\/script>/);
  assert.match(html, /href="\/\?x=&quot;&lt;&amp;"/);
  assert.match(html, /&lt;script&gt;/);
});
