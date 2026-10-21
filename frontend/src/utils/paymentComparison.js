import { effectiveBobPerUsd } from '../data/usCardIssuers';
const valid = value => Number.isFinite(value) && value > 0;
export function paymentComparison({ blue, card, fee = 0, blueAt, cardAt, now = Date.now() }) {
  const effective = effectiveBobPerUsd(card, fee);
  if (!valid(blue) || !valid(effective)) return { status: 'missing', effective };
  const fresh = timestamp => {
    const age = now - Date.parse(timestamp);
    return Number.isFinite(age) && age >= -60000 && age <= 45 * 60000;
  };
  if (!fresh(blueAt) || !fresh(cardAt)) return { status: 'stale', effective };
  const savings = (1 - Math.min(blue, effective) / Math.max(blue, effective)) * 100;
  return { status: savings < 0.05 ? 'tie' : blue > effective ? 'cash' : 'card', effective, savings };
}
