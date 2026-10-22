const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const number = value => typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value.replace(',', '.')) : NaN;
// Every method buys the SAME BOB-priced purchase. A final QR total already
// includes the app's fees; rate mode adds only the separately stated fees.
export function compareQrAndCard({ bobAmount, qrMode = 'total', qrTotal, qrRate, qrFeePct = '0', qrFixedUsd = '0', cardRate, cardFeePct = '0', cardFixedUsd = '0' }) {
  const bob = number(bobAmount), card = number(cardRate), cf = number(cardFeePct), cfixed = number(cardFixedUsd);
  const qf = number(qrFeePct), qfixed = number(qrFixedUsd);
  const validFee = value => Number.isFinite(value) && value >= 0 && value <= 100;
  if (!positive(bob)) return { valid: false, error: 'amount' };
  if (!positive(card) || !validFee(cf) || !Number.isFinite(cfixed) || cfixed < 0) return { valid: false, error: 'card' };
  let qrCost;
  if (qrMode === 'total') qrCost = number(qrTotal);
  else if (qrMode === 'rate' && positive(number(qrRate)) && validFee(qf) && Number.isFinite(qfixed) && qfixed >= 0) qrCost = bob / number(qrRate) * (1 + qf / 100) + qfixed;
  if (!positive(qrCost)) return { valid: false, error: 'qr' };
  const cardCost = bob / card * (1 + cf / 100) + cfixed;
  if (!positive(cardCost)) return { valid: false, error: 'card' };
  // Compare settled cents, so amounts presented as equal cannot have a winner.
  const qrCents = Math.round((qrCost + Number.EPSILON) * 100), cardCents = Math.round((cardCost + Number.EPSILON) * 100);
  if (qrCents < 1 || cardCents < 1 || !Number.isSafeInteger(qrCents) || !Number.isSafeInteger(cardCents)) return { valid: false, error: 'amount' };
  const difference = Math.abs(qrCents - cardCents) / 100;
  return { valid: true, qrCost: qrCents / 100, cardCost: cardCents / 100,
    qrEffective: bob / qrCost, cardEffective: bob / cardCost,
    winner: qrCents === cardCents ? 'tie' : qrCents < cardCents ? 'qr' : 'card', difference,
    savingsPct: difference / (Math.max(qrCents, cardCents) / 100) * 100 };
}
