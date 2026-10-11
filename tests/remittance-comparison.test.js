import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getRemittanceComparison, REMITTANCE_EXAMPLE, REMITTANCE_SOURCES } from '../frontend/src/data/remittanceComparison.js';
import { renderRemittanceComparisonHtml } from '../seo/remittanceComparisonSeo.js';
import { renderPlatformComparisonHtml } from '../seo/platformComparisonSeo.js';

const template = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

describe('hypothetical remittance comparison', () => {
  it('uses equal total spending and computes the teaching example correctly', () => {
    for (const example of REMITTANCE_EXAMPLE) {
      assert.equal(example.principalUsd + example.senderFeeUsd, example.totalUsd);
      assert.equal(example.totalUsd, 200);
      assert.equal(example.principalUsd * example.bobPerUsd, example.receivedBob);
      assert.equal(example.receivedBob / example.totalUsd, example.effectiveBobPerUsd);
    }
    assert.deepEqual(REMITTANCE_EXAMPLE.map((row) => row.effectiveBobPerUsd), [9.75, 9.9]);
    assert.equal(REMITTANCE_EXAMPLE[1].receivedBob - REMITTANCE_EXAMPLE[0].receivedBob, 30);
  });
  for (const language of ['es', 'en']) it(`shares every visible claim and source in the ${language} initial platform shell`, () => {
    const model = getRemittanceComparison(language);
    const fragment = renderRemittanceComparisonHtml(language);
    const text = decode(fragment);
    const full = renderPlatformComparisonHtml(template, `?lang=${language}`);
    assert.ok(full.includes(fragment));
    assert.equal((full.match(/id="comparar-remesas"/g) || []).length, 1);
    for (const field of ['title', 'introduction', 'checklistTitle', 'exampleTitle', 'exampleNote', 'formula', 'conclusion', 'caution', 'sourcesTitle', 'sourceNote']) assert.ok(text.includes(model[field]), field);
    for (const item of model.checklist) assert.ok(text.includes(item));
    for (const offer of model.offers) {
      assert.ok(text.includes(offer.title));
      for (const row of offer.rows) for (const value of row) assert.ok(text.includes(value));
    }
    for (const source of model.sources) {
      assert.ok(fragment.includes(`href="${source.href}" target="_blank" rel="noopener noreferrer"`));
      assert.ok(text.includes(source.label));
    }
    assert.equal(model.checklist.length, 5);
    assert.doesNotMatch(fragment, /<input|<button|<form|<iframe|<script|sponsored|onclick|utm_|[?&]ref=/i);
    assert.match(model.exampleNote, language === 'es' ? /inventados.*no hay otros cargos/i : /invented.*no other charges/i);
    assert.match(model.caution, language === 'es' ? /desconocido no significa cero/ : /unknown does not mean zero/);
    assert.match(model.sourceNote, language === 'es' ? /envíos desde EE\. UU/ : /transfers from the US/);
    assert.equal((full.match(/<h1\b/g) || []).length, 1);
  });
  it('uses exact official source URLs, a static model and the component in the existing page only', () => {
    assert.deepEqual(REMITTANCE_SOURCES.map(({ href }) => href), [
      'https://www.remitly.com/us/es/money-transfer/send-money-to-bolivia',
      'https://www.worldremit.com/en/bolivia',
      'https://www.consumerfinance.gov/consumer-tools/sending-money/',
    ]);
    const model = readFileSync(new URL('../frontend/src/data/remittanceComparison.js', import.meta.url), 'utf8');
    const component = readFileSync(new URL('../frontend/src/components/RemittanceComparison.jsx', import.meta.url), 'utf8');
    const page = readFileSync(new URL('../frontend/src/pages/Plataformas.jsx', import.meta.url), 'utf8');
    assert.match(page, /<RemittanceComparison language=\{language\} \/>/);
    assert.doesNotMatch(model + component, /fetch\(|localStorage|sessionStorage|track\w*\(|useEffect|Date\.now|new Date|best provider|mejor proveedor/i);
    assert.deepEqual(getRemittanceComparison('fr'), getRemittanceComparison('es'));
  });
});
