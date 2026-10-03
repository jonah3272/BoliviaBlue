// Educational conversion only. A price is supplied by the reader, never inferred
// from a provider's executable order or from the legacy buy/sell API labels.
export function guideNumber(value, { allowZero = false } = {}) {
  if (value == null || String(value).trim() === '') return null;
  const text = String(value).trim();
  if (!/^\d+(?:[.,]\d*)?$/.test(text)) return null;
  const number = Number(text.replace(',', '.'));
  return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0) ? number : null;
}

export function calculateGuideConversion({ direction = 'buy', amount, price, deduction = '' }) {
  const input = guideNumber(amount);
  const bobPerUsdt = guideNumber(price);
  const deductionProvided = String(deduction ?? '').trim() !== '';
  const fee = deductionProvided ? guideNumber(deduction, { allowZero: true }) : null;
  if (input === null || bobPerUsdt === null) return { valid: false, reason: 'inputs' };
  if (deductionProvided && fee === null) return { valid: false, reason: 'deduction' };
  const selling = direction === 'sell';
  const gross = selling ? input * bobPerUsdt : input / bobPerUsdt;
  if (!Number.isFinite(gross) || gross <= 0) return { valid: false, reason: 'inputs' };
  if (fee !== null && fee > gross) return { valid: false, reason: 'deduction' };
  const net = fee === null ? null : gross - fee;
  return {
    valid: true, input, price: bobPerUsdt, gross, net, deduction: fee,
    inputUnit: selling ? 'USDT' : 'BOB', outputUnit: selling ? 'BOB' : 'USDT',
    effectiveRate: net !== null && net > 0 ? (selling ? net / input : input / net) : null,
  };
}

export function guideMarketReference(rate, now = Date.now()) {
  const buy = guideNumber(rate?.buy_bob_per_usd ?? rate?.buy);
  const sell = guideNumber(rate?.sell_bob_per_usd ?? rate?.sell);
  const updatedAt = rate?.updated_at_iso || rate?.updatedAt || null;
  const time = Date.parse(updatedAt);
  return {
    midpoint: buy !== null && sell !== null ? (buy + sell) / 2 : null,
    updatedAt: Number.isFinite(time) ? updatedAt : null,
    stale: Boolean(rate?.is_stale || !Number.isFinite(time) || now - time > 20 * 60_000),
  };
}
