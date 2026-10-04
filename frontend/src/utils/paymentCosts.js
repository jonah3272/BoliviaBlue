// Local budget arithmetic only. Prices, rates and fees are supplied by the reader.
// Fractions use BigInt; final route totals are rounded once, half-up, to USD cents.
export const PAYMENT_COST_LIMITS = Object.freeze({ money: '1000000', rate: '1000000', total: '1000000000', percentage: '100', textLength: 32 });
export const PAYMENT_COST_DEFAULTS = Object.freeze({ bobPrice: '', usdPrice: '', rate: '', bobPercent: '0', bobFixed: '0', usdPercent: '0', usdFixed: '0' });
export const PAYMENT_COST_EXAMPLE = Object.freeze({ bobPrice: '600', usdPrice: '52', rate: '12', bobPercent: '3', bobFixed: '2', usdPercent: '0', usdFixed: '0' });

const fraction = (n, d = BigInt(1)) => ({ n, d });
const add = (a, b) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const subtract = (a, b) => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
const multiply = (a, b) => fraction(a.n * b.n, a.d * b.d);
const divide = (a, b) => fraction(a.n * b.d, a.d * b.n);
const compare = (a, b) => a.n * b.d - b.n * a.d;
const decimalScale = (places) => BigInt('1' + '0'.repeat(places));
const scaledHalfUp = (a, places) => {
  const scaled = a.n * decimalScale(places);
  return scaled / a.d + (BigInt(2) * (scaled % a.d) >= a.d ? BigInt(1) : BigInt(0));
};
const fixedDecimal = (scaled, places) => {
  const digits = scaled.toString().padStart(places + 1, '0');
  return `${digits.slice(0, -places)}.${digits.slice(-places)}`;
};

function parseDecimal(value, { optional = false, precision = 2, maximum = PAYMENT_COST_LIMITS.money } = {}) {
  const text = String(value ?? '').trim();
  if (!text) return optional ? { value: fraction(BigInt(0)), normalized: '0' } : { error: 'required' };
  if (text.length > PAYMENT_COST_LIMITS.textLength) return { error: 'range' };
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) return { error: 'format' };
  const [whole, decimals = ''] = text.replace(',', '.').split('.');
  if (decimals.length > precision) return { error: 'precision' };
  const parsed = fraction(BigInt(whole + decimals), decimalScale(decimals.length));
  if (!optional && parsed.n === BigInt(0)) return { error: 'positive' };
  if (compare(parsed, fraction(BigInt(maximum))) > BigInt(0)) return { error: maximum === PAYMENT_COST_LIMITS.percentage ? 'percentage' : 'range' };
  const normalized = BigInt(whole).toString() + (decimals ? `.${decimals}` : '');
  return { value: parsed, normalized };
}

/** Preserve a valid manually entered rate's precision in the visible unit preview. */
export function paymentRatePreview(value) {
  if (typeof BigInt !== 'function') return null;
  return parseDecimal(value, { precision: 6, maximum: PAYMENT_COST_LIMITS.rate }).normalized ?? null;
}

export function calculatePaymentCosts(inputs = {}) {
  if (typeof BigInt !== 'function') return { valid: false, status: 'unsupported', errors: {} };
  const parsed = {};
  const errors = {};
  for (const field of Object.keys(PAYMENT_COST_DEFAULTS)) {
    const optional = field.endsWith('Percent') || field.endsWith('Fixed');
    const result = parseDecimal(inputs[field], {
      optional,
      precision: field === 'rate' ? 6 : 2,
      maximum: field === 'rate' ? PAYMENT_COST_LIMITS.rate : field.endsWith('Percent') ? PAYMENT_COST_LIMITS.percentage : PAYMENT_COST_LIMITS.money,
    });
    if (result.error) errors[field] = result.error;
    else parsed[field] = result.value;
  }
  if (Object.keys(errors).length) return { valid: false, status: Object.values(errors).every((error) => error === 'required') ? 'incomplete' : 'invalid', errors };
  const route = (base, percentage, fixed) => {
    const fee = multiply(base, divide(percentage, fraction(BigInt(100))));
    const total = add(add(base, fee), fixed);
    return { total, cents: { base: scaledHalfUp(base, 2), percentage: scaledHalfUp(fee, 2), fixed: scaledHalfUp(fixed, 2), total: scaledHalfUp(total, 2) } };
  };
  const bob = route(divide(parsed.bobPrice, parsed.rate), parsed.bobPercent, parsed.bobFixed);
  const usd = route(parsed.usdPrice, parsed.usdPercent, parsed.usdFixed);
  const maxTotal = fraction(BigInt(PAYMENT_COST_LIMITS.total));
  if (compare(bob.total, maxTotal) > BigInt(0) || compare(usd.total, maxTotal) > BigInt(0)) return { valid: false, status: 'out_of_range', errors: {} };
  const difference = bob.cents.total - usd.cents.total;
  const denominator = subtract(usd.total, parsed.bobFixed);
  let breakEven = { kind: 'none' };
  if (denominator.n > BigInt(0)) {
    const rate = divide(multiply(parsed.bobPrice, add(fraction(BigInt(1)), divide(parsed.bobPercent, fraction(BigInt(100))))), denominator);
    if (compare(rate, fraction(BigInt(1), BigInt(1000000))) < BigInt(0)) breakEven = { kind: 'below_range' };
    else if (compare(rate, fraction(BigInt(PAYMENT_COST_LIMITS.rate))) > BigInt(0)) breakEven = { kind: 'above_range' };
    else {
      const scaled = scaledHalfUp(rate, 6);
      const value = fixedDecimal(scaled, 6).replace(/\.?0+$/, '');
      breakEven = { kind: 'value', value, approximate: rate.n * BigInt(1000000) % rate.d !== BigInt(0) };
    }
  }
  return {
    valid: true, status: 'valid', bob: bob.cents, usd: usd.cents,
    cheaper: difference === BigInt(0) ? 'tie' : difference > BigInt(0) ? 'usd' : 'bob',
    differenceCents: difference < BigInt(0) ? -difference : difference,
    breakEven,
  };
}

export function formatPaymentCents(cents, language = 'es') {
  const whole = (cents / BigInt(100)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, language === 'en' ? ',' : '.');
  return whole + (language === 'en' ? '.' : ',') + (cents % BigInt(100)).toString().padStart(2, '0');
}
