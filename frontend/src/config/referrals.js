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
      highlight: es ? 'Cuenta en dólares' : 'USD account',
      headlineRest: es ? 'en EE. UU.' : 'in the USA',
      headline: es ? 'Tu cuenta en dólares en EE. UU.' : 'Your USD account in the USA',
      sub: es
        ? 'Recibí ACH/wire, mové USDT y usá saldo en Bolivia — fuera del tipo oficial.'
        : 'Get ACH/wire, move USDT, spend in Bolivia — outside the official rate.',
      pathLabel: es ? 'Cuenta USD (EE. UU.)' : 'USD account (USA)',
      pathDesc: es
        ? 'Ideal si querés recibir transferencias ACH/wire y mover USDT con una cuenta en dólares.'
        : 'Best if you want ACH/wire deposits and USDT with a real USD account.',
      badge: es ? 'Recomendado' : 'Recommended',
      cta: es ? 'Abrir El Dorado' : 'Open El Dorado',
      theme: 'eldorado',
      surface: 'light',
      showQr: true,
    },
    {
      id: 'takenos',
      partner: 'takenos',
      href: TAKENOS_REFERRAL_LINK,
      brand: 'Takenos',
      highlight: es ? 'USD + EUR' : 'USD + EUR',
      headlineRest: es ? 'en una sola app' : 'in one app',
      headline: es ? 'Recibí ingresos en USD y EUR' : 'Get paid in USD and EUR',
      sub: es
        ? 'Cobrá del exterior, tarjeta internacional, y usá tu saldo en Bolivia.'
        : 'Get paid abroad, international card, spend your balance in Bolivia.',
      pathLabel: es ? 'Multimoneda + tarjeta' : 'Multi-currency + card',
      pathDesc: es
        ? 'Cobrá en USD/EUR, tarjeta internacional, y gastá el saldo en Bolivia.'
        : 'Get paid in USD/EUR, international card, spend balance in Bolivia.',
      badge: es ? 'Nuevo' : 'New',
      cta: es ? 'Empezar en Takenos' : 'Start with Takenos',
      theme: 'takenos',
      surface: 'light',
      showQr: true,
    },
    {
      id: 'airtm',
      partner: 'airtm',
      href: AIRTM_REFERRAL_LINK,
      brand: 'Airtm',
      highlight: es ? 'Tarjeta virtual' : 'Virtual card',
      headlineRest: es ? 'en USD' : 'in USD',
      headline: es ? 'Tu tarjeta virtual en USD' : 'Your virtual USD card',
      sub: es
        ? 'Pagá online en comercios internacionales con tu saldo Airtm.'
        : 'Pay online at international merchants with your Airtm balance.',
      pathLabel: es ? 'Wallet + tarjeta virtual' : 'Wallet + virtual card',
      pathDesc: es
        ? 'Wallet simple para freelancers: recibir, convertir y pagar online en USD.'
        : 'Simple wallet for freelancers: receive, convert, and pay online in USD.',
      badge: null,
      cta: es ? 'Crear cuenta Airtm' : 'Create Airtm account',
      theme: 'airtm',
      surface: 'dark',
      showQr: false,
    },
    {
      id: 'binance',
      partner: 'binance',
      href: BINANCE_REFERRAL_LINK,
      brand: 'Binance',
      highlight: es ? 'USDT al paralelo' : 'USDT at parallel',
      headlineRest: es ? 'vía P2P' : 'via P2P',
      headline: es ? 'Comprá USDT al dólar paralelo' : 'Buy USDT at the parallel rate',
      sub: es
        ? 'La vía más usada en Bolivia para acercarte a la cotización blue.'
        : 'The most used path in Bolivia to the blue market rate.',
      pathLabel: es ? 'P2P más líquido' : 'Most liquid P2P',
      pathDesc: es
        ? 'La vía más usada en Bolivia para comprar/vender USDT cerca del dólar blue.'
        : 'The most used path in Bolivia to buy/sell USDT near the blue rate.',
      badge: es ? 'Más usado' : 'Most used',
      cta: es ? 'Crear cuenta Binance' : 'Create Binance account',
      theme: 'binance',
      surface: 'light',
      showQr: false,
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
