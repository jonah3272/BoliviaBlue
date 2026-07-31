/**
 * US card issuer presets: network settlement rate + typical FX fee.
 * Fee schedules change — labels note "typical / check your card."
 *
 * effectiveBobPerUsd = networkBobPerUsd / (1 + feePct)
 * (spending BOB billed in USD: FX fee reduces Bs received per billed dollar)
 */

export const US_CARD_ISSUERS = [
  {
    id: 'bcb-bank',
    network: 'bcb',
    feePct: 0,
    labelEs: 'BCB / banco (referencia)',
    labelEn: 'BCB / bank (reference)',
    blurbEs: 'Tipo de cambio oficial BCB — referencia bancaria real en Bolivia',
    blurbEn: 'BCB official rate — real bank reference in Bolivia'
  },
  {
    id: 'capital-one',
    network: 'mastercard',
    feePct: 0,
    labelEs: 'Capital One (típica)',
    labelEn: 'Capital One (typical)',
    blurbEs: 'Mastercard · comisión FX 0% (revisa tu tarjeta)',
    blurbEn: 'Mastercard · 0% FX fee (check your card)'
  },
  {
    id: 'chase-sapphire',
    network: 'visa',
    feePct: 0,
    labelEs: 'Chase Sapphire / Freedom',
    labelEn: 'Chase Sapphire / Freedom',
    blurbEs: 'Visa · comisión FX 0% (típico en Sapphire/FU)',
    blurbEn: 'Visa · 0% FX fee (typical Sapphire/FU)'
  },
  {
    id: 'citi-custom',
    network: 'mastercard',
    feePct: 0,
    labelEs: 'Citi Custom Cash / Strata',
    labelEn: 'Citi Custom Cash / Strata',
    blurbEs: 'Mastercard · comisión FX 0% (revisa tu tarjeta)',
    blurbEn: 'Mastercard · 0% FX fee (check your card)'
  },
  {
    id: 'amex-gold',
    network: 'amex',
    feePct: 0.027,
    labelEs: 'Amex Gold / Everyday',
    labelEn: 'Amex Gold / Everyday',
    blurbEs: 'Amex · comisión FX 2.7% típica',
    blurbEn: 'Amex · typical 2.7% FX fee'
  },
  {
    id: 'amex-no-fx',
    network: 'amex',
    feePct: 0,
    labelEs: 'Amex sin comisión FX',
    labelEn: 'Amex no-FX cards',
    blurbEs: 'Amex · 0% FX (algunas tarjetas; verifica)',
    blurbEn: 'Amex · 0% FX (some cards; verify)'
  },
  {
    id: 'generic-visa-3',
    network: 'visa',
    feePct: 0.03,
    labelEs: 'Banco US genérico (Visa 3%)',
    labelEn: 'Generic US bank (Visa 3%)',
    blurbEs: 'Visa · comisión FX ~3%',
    blurbEn: 'Visa · ~3% FX fee'
  },
  {
    id: 'generic-mc-3',
    network: 'mastercard',
    feePct: 0.03,
    labelEs: 'Banco US genérico (MC 3%)',
    labelEn: 'Generic US bank (MC 3%)',
    blurbEs: 'Mastercard · comisión FX ~3%',
    blurbEn: 'Mastercard · ~3% FX fee'
  }
];

export function getIssuerById(id) {
  return US_CARD_ISSUERS.find((i) => i.id === id) || US_CARD_ISSUERS[0];
}

export function networkBobPerUsd(cardRates, network, officialBobPerUsd = null) {
  if (network === 'bcb') {
    return Number.isFinite(officialBobPerUsd) ? officialBobPerUsd : null;
  }
  if (!cardRates) return null;
  if (network === 'visa') return cardRates.visa_bob_per_usd ?? null;
  if (network === 'mastercard') return cardRates.mastercard_bob_per_usd ?? null;
  if (network === 'amex') return cardRates.amex_bob_per_usd ?? null;
  return null;
}

/**
 * Effective Bs per USD after issuer FX fee when billing USD for a BOB charge.
 */
export function effectiveBobPerUsd(networkRate, feePct) {
  const rate = Number(networkRate);
  const fee = Number(feePct) || 0;
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return Math.round((rate / (1 + fee)) * 10000) / 10000;
}

export function networkLabel(network) {
  if (network === 'visa') return 'Visa';
  if (network === 'mastercard') return 'Mastercard';
  if (network === 'amex') return 'Amex';
  if (network === 'bcb') return 'BCB';
  return network;
}
