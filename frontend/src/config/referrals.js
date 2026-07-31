// Centralized referral links — all outbound partner CTAs should use these.

export const BINANCE_REFERRAL_LINK =
  'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default';

/** P2P board (no referral credit). Prefer signup link for new users. */
export const BINANCE_P2P_LINK = 'https://www.binance.com/en/p2p';

export const AIRTM_REFERRAL_LINK = 'https://app.airtm.io/ivt/dasyl1sfs6fzr';

export const BUY_GUIDE_PATH = '/comprar-dolares';

/**
 * WhatsApp share: current rate + link to buy guide (referral funnel).
 */
export function getWhatsAppRateShareUrl({ rate, language = 'es' } = {}) {
  const site = `https://boliviablue.com${BUY_GUIDE_PATH}`;
  const rateText =
    rate != null && Number.isFinite(Number(rate))
      ? Number(rate).toFixed(2)
      : null;
  const text =
    language === 'es'
      ? rateText
        ? `Dólar blue Bolivia hoy: ${rateText} Bs. Ver tasa y cómo comprar → ${site}`
        : `Dólar blue Bolivia en vivo. Ver tasa y cómo comprar → ${site}`
      : rateText
        ? `Bolivia blue dollar today: ${rateText} Bs. Check rate & how to buy → ${site}`
        : `Bolivia blue dollar live. Check rate & how to buy → ${site}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
