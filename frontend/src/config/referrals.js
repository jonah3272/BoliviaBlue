// Centralized referral links — all outbound partner CTAs should use these.

export const BINANCE_REFERRAL_LINK =
  'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default';

/** P2P board (no referral credit). Prefer signup link for new users. */
export const BINANCE_P2P_LINK = 'https://www.binance.com/en/p2p';

export const AIRTM_REFERRAL_LINK = 'https://app.airtm.io/ivt/dasyl1sfs6fzr';

export const ELDORADO_REFERRAL_LINK = 'https://link.eldorado.io/MMLGEZcDf5b';

export const TAKENOS_REFERRAL_LINK =
  'https://takenos.go.link/?adj_t=1ptq1hru&adj_label=rjhasnoemail';

export const BUY_GUIDE_PATH = '/comprar-dolares';

/**
 * Rotating monetization slides (order = display priority).
 * @param {'es'|'en'} language
 */
export function getPartnerAds(language = 'es') {
  const es = language === 'es';
  return [
    {
      id: 'eldorado',
      partner: 'eldorado',
      href: ELDORADO_REFERRAL_LINK,
      brand: 'El Dorado',
      headline: es ? 'Tu cuenta en dólares en EE. UU.' : 'Your USD account in the USA',
      sub: es
        ? 'Recibí, enviá y pagá con saldo en dólares. Ideal si necesitás operar fuera del tipo oficial.'
        : 'Receive, send and pay with a USD balance — useful when the official rate is not enough.',
      cta: es ? 'Abrir El Dorado' : 'Open El Dorado',
      theme: 'eldorado',
    },
    {
      id: 'takenos',
      partner: 'takenos',
      href: TAKENOS_REFERRAL_LINK,
      brand: 'Takenos',
      headline: es ? 'Recibí ingresos en USD y EUR' : 'Get paid in USD and EUR',
      sub: es
        ? 'Cuenta multi-moneda + tarjeta. Cobrá del exterior y usá tu saldo en Bolivia.'
        : 'Multi-currency account + card. Get paid abroad and spend locally in Bolivia.',
      cta: es ? 'Probar Takenos' : 'Try Takenos',
      theme: 'takenos',
    },
    {
      id: 'airtm',
      partner: 'airtm',
      href: AIRTM_REFERRAL_LINK,
      brand: 'Airtm',
      headline: es ? 'Tu tarjeta virtual en USD' : 'Your virtual USD card',
      sub: es
        ? 'Pagá online en comercios internacionales con saldo Airtm.'
        : 'Pay online at international merchants with your Airtm balance.',
      cta: es ? 'Crear cuenta Airtm' : 'Create Airtm account',
      theme: 'airtm',
    },
    {
      id: 'binance',
      partner: 'binance',
      href: BINANCE_REFERRAL_LINK,
      brand: 'Binance',
      headline: es ? 'Comprá USDT al dólar paralelo' : 'Buy USDT at the parallel rate',
      sub: es
        ? 'P2P con Binance: la vía más usada para acercarte a la cotización blue.'
        : 'Binance P2P — the most used path to the blue/parallel market rate.',
      cta: es ? 'Crear cuenta Binance' : 'Create Binance account',
      theme: 'binance',
    },
  ];
}

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
