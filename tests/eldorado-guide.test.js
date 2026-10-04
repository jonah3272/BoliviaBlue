import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateGuideConversion, guideNumber, guideMarketReference } from '../frontend/src/utils/guideConversion.js';
import { getEldoradoGuide, ELDORADO_GUIDE_CHECKED, ELDORADO_GUIDE_SOURCES } from '../frontend/src/data/eldoradoGuide.js';
import { getBuyGuidePage } from '../frontend/src/data/buyGuidePage.js';
const source = (path) => readFileSync(new URL(`../frontend/src/${path}`, import.meta.url), 'utf8');

describe('explicit El Dorado conversion examples', () => {
  it('divides BOB by BOB/USDT when buying and multiplies USDT by BOB/USDT when selling', () => {
    const buy = calculateGuideConversion({ direction: 'buy', amount: '1000', price: '10' });
    const sell = calculateGuideConversion({ direction: 'sell', amount: '100', price: '10' });
    assert.equal(buy.gross, 100); assert.equal(buy.inputUnit, 'BOB'); assert.equal(buy.outputUnit, 'USDT');
    assert.equal(sell.gross, 1000); assert.equal(sell.inputUnit, 'USDT'); assert.equal(sell.outputUnit, 'BOB');
    assert.equal(buy.net, null); assert.equal(sell.net, null);
    assert.equal(buy.effectiveRate, null);
  });
  it('only deducts an explicitly supplied output-currency charge and calculates effective rates', () => {
    const buy = calculateGuideConversion({ direction: 'buy', amount: 1000, price: 10, deduction: 1 });
    const sell = calculateGuideConversion({ direction: 'sell', amount: 100, price: 10, deduction: 10 });
    assert.equal(buy.net, 99); assert.equal(buy.effectiveRate, 1000 / 99);
    assert.equal(sell.net, 990); assert.equal(sell.effectiveRate, 9.9);
    assert.equal(calculateGuideConversion({ amount: 1000, price: 10, deduction: 0 }).net, 100);
    assert.equal(calculateGuideConversion({ amount: 1000, price: 10, deduction: 100 }).net, 0);
    assert.equal(calculateGuideConversion({ amount: 1000, price: 10, deduction: 100 }).effectiveRate, null);
    assert.equal(calculateGuideConversion({ amount: 1000, price: 10, deduction: 101 }).valid, false);
  });
  it('accepts decimal point/comma and rejects empty, nonnumeric, negative, infinite and zero price inputs', () => {
    assert.equal(guideNumber('10,25'), 10.25); assert.equal(guideNumber('10.25'), 10.25);
    for (const invalid of ['', ' ', null, '-3', '1e5', 'Infinity', '3,4.5', 'free', '0']) {
      assert.equal(guideNumber(invalid), null);
      assert.equal(calculateGuideConversion({ amount: '1000', price: invalid }).valid, false);
    }
    for (const deduction of ['-1', 'NaN', 'Infinity', '2x']) assert.equal(calculateGuideConversion({ amount: '1000', price: '10', deduction }).valid, false);
  });
  it('keeps midpoint separate from executable price and flags missing/old reference times', () => {
    const now = Date.parse('2026-10-03T12:00:00Z');
    const row = { buy_bob_per_usd: 12.34, sell_bob_per_usd: 12.56, updated_at_iso: '2026-10-03T11:59:00Z' };
    assert.equal(guideMarketReference(row, now).midpoint, (12.34 + 12.56) / 2);
    assert.equal(guideMarketReference(row, now).stale, false);
    assert.equal(guideMarketReference({ ...row, updated_at_iso: '2026-10-03T10:00:00Z' }, now).stale, true);
    assert.equal(guideMarketReference({ ...row, updated_at_iso: null }, now).stale, true);
    assert.equal(guideMarketReference(null, now).midpoint, null);
    assert.equal(calculateGuideConversion({ amount: 1000, price: 10 }).gross, 100);
  });
});

describe('direction-specific guide and preservation', () => {
  it('requires real payment before release in the sell guide in both languages', () => {
    for (const language of ['es', 'en']) {
      const buy = getEldoradoGuide(language, 'buy');
      const sell = getEldoradoGuide(language, 'sell');
      assert.equal(buy.steps.length, 7); assert.equal(sell.steps.length, 6);
      assert.match(sell.steps[4][1], language === 'es' ? /acreditación real.*captura no basta/ : /actual credit.*screenshot is not enough/);
      assert.match(sell.steps[5][1], language === 'es' ? /confirmado el dinero.*liberá/ : /money is confirmed.*release/);
      assert.match(buy.steps[5][1], language === 'es' ? /Solo después de pagar/ : /Only after paying/);
      assert.equal(getEldoradoGuide(language, 'invalid').direction, 'buy');
    }
    assert.equal(ELDORADO_GUIDE_CHECKED, '2026-10-03');
    assert.ok(ELDORADO_GUIDE_SOURCES.every((row) => new URL(row[3]).hostname.endsWith('eldorado.io')));
  });
  it('does not add a fetch/poll or mutate the entered price from reference data', () => {
    const component = source('components/EldoradoMoneyGuide.jsx');
    assert.doesNotMatch(component, /fetch\(|setInterval|setTimeout|fetchBlueRate/);
    assert.match(component, /price: ''/);
    assert.match(component, /No lo restes dos veces/);
    assert.match(component, /hypothetical price or fee/);
    const page = source('pages/BuyDollars.jsx');
    assert.match(page, /params\.get\('operation'\)/);
    assert.match(page, /intent === BUY_USDT_INTENT \? <EldoradoMoneyGuide/);
    for (const language of ['es', 'en']) for (const direction of ['buy', 'sell']) {
      const selected = getBuyGuidePage(language, 'buy_usdt', direction);
      assert.deepEqual(selected.howToSchema.step.map(({ name, text }) => [name, text]), getEldoradoGuide(language, direction).steps);
    }
  });
});
