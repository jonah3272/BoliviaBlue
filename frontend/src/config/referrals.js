// Centralized referral links — all outbound partner CTAs should use these.

export const BINANCE_REFERRAL_LINK =
  'https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=en&ref=GRO_28502_RNV8W&utm_source=default';

/** @deprecated P2P board does not pay. Always send users to BINANCE_REFERRAL_LINK. */
export const BINANCE_P2P_LINK = BINANCE_REFERRAL_LINK;

export const AIRTM_REFERRAL_LINK = 'https://app.airtm.io/ivt/dasyl1sfs6fzr';

export const ELDORADO_REFERRAL_LINK = 'https://link.eldorado.io/MMLGEZcDf5b';

export const TAKENOS_REFERRAL_LINK =
  'https://takenos.go.link/?adj_t=1ptq1hru&adj_label=rjhasnoemail';

/** Existing Meru referral code; current reward eligibility is not verified. */
export const MERU_REFERRAL_CODE = 'NGPFPG';
export const MERU_REFERRAL_LINK =
  `https://getmeru.com/referrals/?referralCode=${MERU_REFERRAL_CODE}`;

export const BUY_GUIDE_PATH = '/comprar-dolares';

// Version label for this fixed creative, not a randomized experiment.
export const OFFER_VARIANT = 'benefit_v1';
export const BUY_USDT_INTENT = 'buy_usdt';
export const RECEIVE_PAYMENTS_INTENT = 'receive_payments';
export const ELDORADO_BUY_GUIDE = 'https://eldorado.io/blog/como-comprar-usdt-qr-bolivia-guia-paso-a-paso';
export const TAKENOS_PAYMENT_GUIDE = 'https://takenos.com/cobrar-del-exterior';

export function getFinancialOffer(language = 'es', intent = BUY_USDT_INTENT) {
  const es = language === 'es';
  if (intent === RECEIVE_PAYMENTS_INTENT) return {
    id: 'takenos_client_payments', partner: 'takenos', brand: 'Takenos', intent,
    href: TAKENOS_REFERRAL_LINK, variant: OFFER_VARIANT,
    headline: es ? 'Cobrá a tus clientes del exterior en USD y EUR' : 'Get paid by overseas clients in USD and EUR',
    body: es ? 'Recibí transferencias en una cuenta a tu nombre y administrá tus ingresos desde una sola app. Abrir la cuenta no tiene costo.' : 'Receive transfers into an account in your name and manage your income in one app. There’s no account-opening fee.',
    cta: es ? 'Crear mi cuenta Takenos' : 'Create my Takenos account',
    guideLabel: es ? 'Cómo recibir mi primer pago' : 'How to receive my first payment',
    qualification: es ? 'Requiere verificación de identidad. Los métodos disponibles dependen de tu cuenta.' : 'Identity verification required. Available payment methods depend on your account.',
    disclosure: es ? 'Enlace de referido: Bolivia Blue puede recibir una recompensa. Takenos no es un banco; el saldo se acredita en USD digitales. Revisá los costos de conversión y retiro.' : 'Referral link: Bolivia Blue may receive a reward. Takenos is not a bank; balances are credited in digital USD. Check conversion and withdrawal costs.',
    source: TAKENOS_PAYMENT_GUIDE,
    steps: es ? [
      ['Creá y verificá tu cuenta', 'Abrí Takenos con el enlace y completá la verificación de identidad en la app.'],
      ['Revisá cómo puede pagarte tu cliente', 'Consultá los datos de cuenta en USD o EUR y los métodos habilitados. Revisá requisitos, costos y datos del destinatario.'],
      ['Compartí los datos de cobro', 'Enviá a tu cliente los datos que muestra la app para el método elegido.'],
      ['Comprobá la acreditación', 'Verificá el pago recibido en la app. Antes de convertir o retirar, revisá la cotización y los costos aplicables.'],
    ] : [
      ['Create and verify your account', 'Open Takenos through the link and complete identity verification in the app.'],
      ['Check how your client can pay', 'Review your USD or EUR account details and available methods. Check requirements, costs and recipient details.'],
      ['Share your payment details', 'Give your client the details shown in the app for your chosen payment method.'],
      ['Check the received payment', 'Verify that the payment has arrived in the app. Review the exchange rate and costs before converting or withdrawing.'],
    ],
  };
  return {
    id: 'eldorado_bob_usdt', partner: 'eldorado', brand: 'El Dorado', intent: BUY_USDT_INTENT,
    href: ELDORADO_REFERRAL_LINK, variant: OFFER_VARIANT,
    headline: es ? 'Comprá USDT con bolivianos, desde tu celular' : 'Buy USDT with bolivianos, from your phone',
    body: es ? 'Elegí una oferta en El Dorado y pagá con QR o transferencia local. Revisá el precio, la comisión y cuánto vas a recibir antes de confirmar.' : 'Choose an El Dorado offer and pay by QR or local transfer. Check the price, fee and amount you’ll receive before confirming.',
    cta: es ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account',
    guideLabel: es ? 'Cómo hacer mi primera compra' : 'How to make my first purchase',
    qualification: es ? '18+ · Verificación de identidad · Medio de pago admitido' : '18+ · Identity verification · Supported payment method',
    disclosure: es ? 'Enlace de referido: Bolivia Blue puede ganar una comisión. USDT es un criptoactivo, no efectivo USD; la operación tiene riesgos y costos.' : 'Referral link: Bolivia Blue may earn a commission. USDT is a cryptoasset, not USD cash; trading involves risks and costs.',
    source: ELDORADO_BUY_GUIDE,
    steps: es ? [
      ['Creá y verificá tu cuenta', 'Abrí El Dorado desde el enlace y completá el registro y la verificación de identidad en la app.'],
      ['Elegí BOB → USDT', 'En Cambiar, seleccioná “Tengo BOB” y “Quiero USDT”. Elegí Pago con QR o un medio de pago local admitido.'],
      ['Revisá la oferta', 'Compará comerciantes, límites, precio y comisiones. Comprobá los USDT que recibirías antes de abrir la orden.'],
      ['Pagá BOB al vendedor', 'Usá los datos de pago de la orden y verificá el destinatario. Después de pagar, adjuntá el comprobante y marcá Pago realizado.'],
      ['Verificá los USDT recibidos', 'Esperá la confirmación del comerciante y comprobá el saldo. Si ya pagaste, no canceles sin reembolso; pedí ayuda desde la orden.'],
    ] : [
      ['Create and verify your account', 'Open El Dorado through the link and complete signup and identity verification in the app.'],
      ['Choose BOB → USDT', 'In Exchange, select “I have BOB” and “I want USDT”. Choose QR payment or a supported local payment method.'],
      ['Review the offer', 'Compare merchants, limits, price and fees. Check how much USDT you would receive before opening the order.'],
      ['Pay BOB to the seller', 'Use the payment details in the order and check the recipient. After paying, upload proof and mark payment completed.'],
      ['Verify the USDT received', 'Wait for the merchant’s confirmation and check your balance. If you already paid, do not cancel without a refund; get help through the order.'],
    ],
  };
}

/** Provider comparisons. Existing referral destinations are kept byte-for-byte. */
export function getPartnerAds(language = 'es') {
  const es = language === 'es';
  const primary = [getFinancialOffer(language), getFinancialOffer(language, RECEIVE_PAYMENTS_INTENT)].map((offer) => ({
    ...offer, theme: offer.partner, pathDesc: offer.body, sub: offer.body,
    bestFor: offer.intent === BUY_USDT_INTENT ? (es ? 'Comprar USDT con BOB' : 'Buy USDT with BOB') : (es ? 'Cobrar del exterior' : 'Get paid from abroad'),
  }));
  return [...primary, {
    id: 'binance_earn_together', partner: 'binance', brand: 'Binance', href: BINANCE_REFERRAL_LINK,
    intent: 'compare_providers', variant: OFFER_VARIANT, theme: 'binance',
    headline: es ? 'Explorá Binance Earn Together' : 'Explore Binance Earn Together',
    cta: es ? 'Ver invitación Binance' : 'View Binance invitation',
    sub: es ? 'Invitación de la campaña Earn Together. Revisá sus condiciones y elegibilidad; no garantiza una recompensa.' : 'Earn Together campaign invitation. Review its terms and eligibility; rewards depend on meeting the campaign requirements.',
    pathDesc: es ? 'Invitación de la campaña Earn Together, sujeta a condiciones. El enlace no abre una orden P2P.' : 'Earn Together campaign invitation, subject to terms. This link does not open a P2P order.',
    bestFor: es ? 'Conocer la campaña de Binance' : 'Explore the Binance campaign',
  }, {
    id: 'meru_account', partner: 'meru', brand: 'Meru', href: MERU_REFERRAL_LINK,
    intent: 'compare_providers', variant: OFFER_VARIANT, theme: 'meru',
    cta: es ? 'Conocer Meru' : 'Explore Meru',
    pathDesc: es ? `Consultá los servicios y costos disponibles. Código de referido: ${MERU_REFERRAL_CODE}. No prometemos un bono.` : `Review available services and fees. Referral code: ${MERU_REFERRAL_CODE}. No bonus is promised.`,
    bestFor: es ? 'Comparar otra cuenta digital' : 'Compare another digital account',
  }, {
    id: 'airtm_account', partner: 'airtm', brand: 'Airtm', href: AIRTM_REFERRAL_LINK,
    intent: 'compare_providers', variant: OFFER_VARIANT, theme: 'airtm',
    cta: es ? 'Conocer Airtm' : 'Explore Airtm',
    pathDesc: es ? 'Consultá las opciones para recibir, convertir y pagar, junto con sus costos y requisitos.' : 'Review options to receive, convert and pay, including their costs and requirements.',
    bestFor: es ? 'Comparar otra billetera digital' : 'Compare another digital wallet',
  }];
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
