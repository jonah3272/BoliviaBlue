import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { calculatePaymentCosts, paymentRatePreview, formatPaymentCents, PAYMENT_COST_DEFAULTS, PAYMENT_COST_EXAMPLE, PAYMENT_COST_LIMITS } from '../frontend/src/utils/paymentCosts.js';

const calculate = (changes = {}) => calculatePaymentCosts({ ...PAYMENT_COST_DEFAULTS, bobPrice: '100', usdPrice: '10', rate: '10', ...changes });
const noOutput = (result) => {
  assert.equal(result.valid, false);
  for (const key of ['bob', 'usd', 'cheaper', 'differenceCents', 'breakEven']) assert.equal(key in result, false);
};

describe('exact local payment cost arithmetic', () => {
  it('matches example A and its exact break-even, without intermediate rounding', () => {
    const result = calculatePaymentCosts(PAYMENT_COST_EXAMPLE);
    assert.equal(result.valid, true);
    assert.deepEqual(result.bob, { base: 5000n, percentage: 150n, fixed: 200n, total: 5350n });
    assert.equal(result.usd.total, 5200n);
    assert.equal(result.cheaper, 'usd');
    assert.equal(result.differenceCents, 150n);
    assert.deepEqual(result.breakEven, { kind: 'value', value: '12.36', approximate: false });
    const tie = calculatePaymentCosts({ ...PAYMENT_COST_EXAMPLE, rate: '12.36' });
    assert.equal(tie.bob.total, 5200n);
    assert.equal(tie.cheaper, 'tie');
    assert.equal(tie.differenceCents, 0n);
  });
  it('matches decimal-comma example B and its break-even', () => {
    const inputs = { bobPrice: '1200', usdPrice: '100', rate: '12,5', bobPercent: '1,5', bobFixed: '1', usdPercent: '2', usdFixed: '0.50' };
    const result = calculatePaymentCosts(inputs);
    assert.equal(result.valid, true);
    assert.deepEqual(result.bob, { base: 9600n, percentage: 144n, fixed: 100n, total: 9844n });
    assert.equal(result.usd.total, 10250n);
    assert.equal(result.cheaper, 'bob');
    assert.equal(result.differenceCents, 406n);
    assert.deepEqual(result.breakEven, { kind: 'value', value: '12', approximate: false });
    const tie = calculatePaymentCosts({ ...inputs, rate: '12' });
    assert.equal(tie.bob.total, 10250n);
    assert.equal(tie.cheaper, 'tie');
  });
  it('handles negative or zero break-even denominator without zero, negative or infinite rates', () => {
    for (const fixed of ['12', '10']) {
      const result = calculate({ bobFixed: fixed });
      assert.equal(result.valid, true);
      assert.equal(result.bob.total, fixed === '12' ? 2200n : 2000n);
      assert.equal(result.usd.total, 1000n);
      assert.equal(result.cheaper, 'usd');
      assert.equal(result.differenceCents, fixed === '12' ? 1200n : 1000n);
      assert.deepEqual(result.breakEven, { kind: 'none' });
    }
  });
  it('rounds final totals half-up, compares cents and subtracts those exact displayed totals', () => {
    const tie = calculate({ bobPrice: '500.04', usdPrice: '50' });
    assert.equal(tie.bob.total, 5000n);
    assert.equal(tie.usd.total, 5000n);
    assert.equal(tie.cheaper, 'tie');
    assert.equal(tie.differenceCents, 0n);
    const cent = calculate({ bobPrice: '500.05', usdPrice: '50' });
    assert.equal(cent.bob.total, 5001n);
    assert.equal(cent.differenceCents, 1n);
    assert.equal(cent.cheaper, 'usd');
    const noDoubleRound = calculate({ bobPrice: '0.03', rate: '2', bobPercent: '100', usdPrice: '0.03' });
    assert.equal(noDoubleRound.bob.base, 2n);
    assert.equal(noDoubleRound.bob.percentage, 2n);
    assert.equal(noDoubleRound.bob.total, 3n);
    assert.equal(noDoubleRound.cheaper, 'tie');
    assert.equal(calculate({ usdPrice: '0.03', usdPercent: '50' }).usd.total, 5n);
  });
  it('uses the unrounded USD total in break-even and reports thresholds outside display range', () => {
    const result = calculate({ bobPrice: '0.03', usdPrice: '0.03', usdPercent: '50', rate: '1' });
    assert.equal(result.usd.total, 5n);
    assert.deepEqual(result.breakEven, { kind: 'value', value: '0.666667', approximate: true });
    assert.deepEqual(calculate({ bobPrice: '0.01', usdPrice: '1000000', rate: '1' }).breakEven, { kind: 'below_range' });
    assert.deepEqual(calculate({ bobPrice: '1000000', usdPrice: '0.01', rate: '1000000' }).breakEven, { kind: 'above_range' });
  });
  it('accepts strict decimal inputs and blank optional fees without adding embedded fees twice', () => {
    const result = calculate({ bobPrice: ' 1200,50 ', usdPrice: '100', rate: ' 12,005000 ', bobPercent: '', bobFixed: ' ', usdPercent: '', usdFixed: '' });
    assert.equal(result.valid, true);
    assert.equal(result.bob.total, 10000n);
    assert.equal(result.cheaper, 'tie');
    assert.equal(paymentRatePreview(' 12,005000 '), '12.005000');
    assert.equal(paymentRatePreview('1,000'), '1.000'); // A single comma is decimal, never grouping.
    assert.equal(formatPaymentCents(5350n, 'en'), '53.50');
    assert.equal(formatPaymentCents(5350n, 'es'), '53,50');
  });
});

describe('payment checker invalid and incomplete states', () => {
  it('starts incomplete and removes all result fields for missing or invalid values', () => {
    assert.deepEqual(PAYMENT_COST_DEFAULTS, { bobPrice: '', usdPrice: '', rate: '', bobPercent: '0', bobFixed: '0', usdPercent: '0', usdFixed: '0' });
    const blank = calculatePaymentCosts(PAYMENT_COST_DEFAULTS);
    noOutput(blank);
    assert.equal(blank.status, 'incomplete');
    for (const field of ['bobPrice', 'usdPrice', 'rate']) {
      for (const value of ['', '0', '-1', 'NaN', 'Infinity', '12abc', '1.200,50', '1,200.50', '$12', '1e2', '+12', '.5', '12.']) {
        const result = calculate({ [field]: value });
        noOutput(result);
        assert.ok(result.errors[field], `${field}=${value}`);
      }
    }
    for (const field of ['bobPercent', 'bobFixed', 'usdPercent', 'usdFixed']) for (const value of ['-1', '1e2', '12abc']) noOutput(calculate({ [field]: value }));
    assert.equal(paymentRatePreview('12abc'), null);
    assert.equal(paymentRatePreview('0'), null);
  });
  it('rejects excess precision rather than silently changing inputs', () => {
    for (const field of ['bobPrice', 'usdPrice', 'bobFixed', 'usdFixed', 'bobPercent', 'usdPercent']) assert.equal(calculate({ [field]: '1.001' }).errors[field], 'precision');
    assert.equal(calculate({ rate: '1.0000001' }).errors.rate, 'precision');
    assert.equal(calculate({ rate: '1.000001' }).valid, true);
    for (const field of ['bobPercent', 'usdPercent']) {
      assert.equal(calculate({ [field]: '100.01' }).errors[field], 'percentage');
      assert.equal(calculate({ [field]: '100' }).valid, true);
    }
  });
  it('keeps legacy browsers from failing the guide when exact integers are unavailable', () => {
    const helper = readFileSync(new URL('../frontend/src/utils/paymentCosts.js', import.meta.url), 'utf8');
    assert.doesNotMatch(helper, /\b\d+n\b|\s\*\*\s/);
    const context = { BigInt: undefined };
    vm.runInNewContext(helper.replace(/export /g, '') + '\nthis.calculate = calculatePaymentCosts; this.preview = paymentRatePreview;', context);
    assert.equal(context.calculate(PAYMENT_COST_EXAMPLE).status, 'unsupported');
    assert.equal(context.preview('12'), null);
  });
  it('documents and enforces input and derived-total bounds without clamping', () => {
    assert.equal(PAYMENT_COST_LIMITS.money, '1000000');
    assert.equal(PAYMENT_COST_LIMITS.rate, '1000000');
    assert.equal(PAYMENT_COST_LIMITS.total, '1000000000');
    for (const field of ['bobPrice', 'usdPrice', 'bobFixed', 'usdFixed']) {
      noOutput(calculate({ [field]: '1000000.01' }));
      assert.equal(calculate({ [field]: '1000000.00' }).valid, true);
    }
    noOutput(calculate({ rate: '1000000.000001' }));
    assert.equal(calculate({ rate: '1000000.000000' }).valid, true);
    noOutput(calculate({ rate: '0'.repeat(33) + '1' }));
    const tooLarge = calculate({ bobPrice: '1000000', rate: '0.000001' });
    noOutput(tooLarge);
    assert.equal(tooLarge.status, 'out_of_range');
    assert.equal(calculate({ bobPrice: '1000', rate: '0.000001' }).bob.total, 100000000000n);
  });
});

describe('traveler integration and privacy contract', () => {
  it('replaces the automatic quote comparator while keeping reference cards and IBO', () => {
    const page = readFileSync(new URL('../frontend/src/pages/TravelersMoneyGuide.jsx', import.meta.url), 'utf8');
    assert.match(page, /<PaymentCostChecker language=\{language\} \/>/);
    assert.match(page, /<BlueRateCards/);
    assert.match(page, /to="\/calculadora"/);
    assert.doesNotMatch(page, /fetchCardRates|guide-usd|atSell|atOfficial|atCard|cardBob|near sell|shave a bit|te acercás a la venta|te va a dar un poco menos|Compare with this page’s sell rate/);
    assert.match(page, /payment-cost-comparison/);
    assert.match(page, /https:\/\/www\.ibo\.guide\/es\/iconos-del-sur-de-bolivia\//);
    assert.match(page, /itinerario de IBO GUIDE por el sur de Bolivia/);
    assert.match(page, /con paradas en el salar de Uyuni, Laguna Colorada y el Altiplano\./);
  });
  it('has local-only labeled input, validation, scenario and result flows in both languages', () => {
    const component = readFileSync(new URL('../frontend/src/components/PaymentCostChecker.jsx', import.meta.url), 'utf8');
    const helper = readFileSync(new URL('../frontend/src/utils/paymentCosts.js', import.meta.url), 'utf8');
    assert.doesNotMatch(component + helper, /localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|trackEvent|trackCalculator|URLSearchParams|history\.(?:push|replace)State|parseFloat\(|Number\(inputs/);
    assert.match(component, /type="text" inputMode="decimal"/);
    assert.doesNotMatch(component, /maxLength=/); // Reject the original long input rather than silently truncating a pasted amount.
    assert.match(component, /aria-invalid=\{Boolean\(error\)\}/);
    assert.match(component, /aria-describedby=/);
    assert.match(component, /<fieldset/);
    assert.match(component, /<legend/);
    assert.match(component, /aria-live="polite"/);
    assert.match(component, /setTimeout\(\(\) => setAnnouncement\(status\), 350\)/);
    assert.match(component, /const visibleResult = attempted && result\.valid/);
    assert.match(component, /Ejemplo hipotético/);
    assert.match(component, /Hypothetical example/);
    assert.match(component, /Tu escenario editado/);
    assert.match(component, /Your edited scenario/);
    assert.match(component, /setMode\('edited'\)/);
    assert.match(component, /setInputs\(\{ \.\.\.PAYMENT_COST_DEFAULTS \}\)/);
    assert.match(component, /Mismo costo estimado al centavo/);
    assert.match(component, /Same estimated cost to the nearest cent/);
    assert.match(component, /No es una cotización verificada/);
    assert.match(component, /This is not a verified quote/);
  });
});
