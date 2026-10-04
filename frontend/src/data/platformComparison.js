import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK, ELDORADO_REFERRAL_LINK, getFinancialOffer } from '../config/referrals.js';

export const REVIEWED_AT = '2026-10-04';
export const SOURCES = {
  eldorado: [
    ['Compra con QR en Bolivia', 'Buying with QR in Bolivia', 'https://eldorado.io/blog/como-comprar-usdt-qr-bolivia-guia-paso-a-paso'],
    ['Límites y tiempos', 'Limits and timing', 'https://faq.eldorado.io/es/articles/12382059-limites-y-tiempos-de-las-transacciones-p2p'],
    ['Comisiones', 'Fees', 'https://eldorado.io/blog/comisiones-el-dorado-p2p'],
  ],
  binance: [
    ['Cómo comprar en P2P', 'How to buy on P2P', 'https://www.binance.com/en/support/faq/detail/360043832851'],
    ['Tarifario P2P', 'P2P fee schedule', 'https://www.binance.com/en/fee/p2pFeeRate'],
    ['Introducción a P2P', 'P2P introduction', 'https://www.binance.com/en/support/faq/detail/360038038972'],
  ],
  airtm: [
    ['Cómo se calculan las tarifas', 'How fees are calculated', 'https://help.airtm.com/es-LA/support/solutions/articles/47001186315--c%C3%B3mo-calcula-airtm-las-tarifas-'],
    ['Ver tasa y costos', 'Preview rates and costs', 'https://help.airtm.com/es-LA/support/solutions/articles/47001186002-d%C3%B3nde-ver-la-tasa-de-cambio-en-airtm'],
    ['Retiro bancario directo', 'Direct bank withdrawal', 'https://help.airtm.com/en/support/solutions/articles/47001198154-how-do-i-directly-non-p2p-withdraw-from-my-airtm-wallet-to-a-bank-'],
  ],
  wallbit: [
    ['Depósitos y retiros en Bolivia', 'Deposits and withdrawals in Bolivia', 'https://help.wallbit.io/es/articles/12373896-como-hacer-depositos-y-retiros-en-bolivia'],
    ['Tarifas y comisiones', 'Fees and charges', 'https://help.wallbit.io/es/articles/9156314-listado-de-tarifas-y-comisiones'],
  ],
  bitget: [
    ['Cómo funciona P2P', 'How P2P works', 'https://www.bitget.com/support/articles/11969360373529'],
    ['Anuncio que incluye BOB', 'Announcement including BOB', 'https://www.bitget.com/support/articles/12560603884495'],
  ],
  bybit: [
    ['Comisiones P2P vigentes', 'Current P2P fees', 'https://www.bybit.com/en/help-center/article/P2P-on-Bybit-Fees-Explained'],
  ],
};
export const BINANCE_HELP = 'https://www.binance.com/en/support/faq/detail/9bd969ce7fcd4592acfdddd2bf9ef15f';
export const ELDORADO_HELP = 'https://faq.eldorado.io/es/articles/12382040-que-hacer-si-tengo-un-problema-en-una-transaccion-p2p';

/** Editorial comparison: no quote feed, stars, universal minimums or tested ranking. */
export function getPlatformComparison(language = 'es') {
  const es = language === 'es';
  return [
    {
      id: 'eldoradop2p', partner: 'eldorado', name: 'El Dorado', referral: ELDORADO_REFERRAL_LINK,
      purpose: es ? 'Comprar o vender USDT con BOB mediante anuncios P2P.' : 'Buy or sell USDT with BOB through P2P ads.',
      payment: es ? 'QR o transferencia admitida en la oferta.' : 'QR or a transfer supported by the offer.',
      checks: es ? 'Precio, comisión, USDT netos, límites del anuncio y verificación de identidad. El tiempo depende del pago y de la confirmación de la contraparte.' : 'Price, fee, net USDT, ad limits and identity verification. Timing depends on payment and counterparty confirmation.',
      firstStep: es ? 'En Cambiar, elegí Tengo BOB → Quiero USDT y revisá las ofertas para tu medio de pago.' : 'In Exchange, choose I have BOB → I want USDT and review offers for your payment method.',
      cta: es ? 'Crear mi cuenta El Dorado' : 'Create my El Dorado account',
      disclosure: es ? 'Enlace de referido: Bolivia Blue puede ganar una comisión. Operar con USDT implica riesgos y costos.' : 'Referral link: Bolivia Blue may earn a commission. Trading USDT involves risks and costs.',
    },
    {
      id: 'binance', partner: 'binance', name: 'Binance P2P', referral: BINANCE_REFERRAL_LINK,
      purpose: es ? 'Comparar anuncios de compra o venta de cripto entre usuarios.' : 'Compare crypto buy or sell ads from other users.',
      payment: es ? 'Elegí BOB y filtrá por el medio admitido en tu cuenta y en el anuncio.' : 'Select BOB and filter for a method supported by your account and the ad.',
      checks: es ? 'Precio, límites, historial de la contraparte y comisiones aplicables. Puede haber cargos de la plataforma, del banco y de retiro.' : 'Price, limits, counterparty history and applicable fees. Platform, bank and withdrawal charges may apply.',
      firstStep: es ? 'Consultá la guía P2P y verificá identidad, método de pago y condiciones antes de abrir una orden.' : 'Read the P2P guide and check identity verification, payment method and terms before opening an order.',
      cta: es ? 'Ver invitación Binance' : 'View Binance invitation',
      disclosure: es ? 'Enlace de referido a la campaña Earn Together. No abre una orden P2P. Revisá condiciones y elegibilidad; no garantizamos una recompensa. Bolivia Blue puede recibir una recompensa.' : 'Referral link to the Earn Together campaign. It does not open a P2P order. Check terms and eligibility; we do not guarantee a reward. Bolivia Blue may receive a reward.',
    },
    {
      id: 'airtm', partner: 'airtm', name: 'Airtm', referral: AIRTM_REFERRAL_LINK,
      purpose: es ? 'Añadir, convertir o retirar saldo; comprobá si tu ruta usa P2P o transferencia directa.' : 'Add, convert or withdraw a balance; check whether your route uses P2P or a direct transfer.',
      payment: es ? 'Métodos habilitados para tu cuenta. Airtm documenta retiros directos a bancos de Bolivia, sujetos a disponibilidad.' : 'Methods available to your account. Airtm documents direct withdrawals to Bolivian banks, subject to availability.',
      checks: es ? 'Simulá el monto y abrí Ver detalles de tarifa. Compará lo que enviás, lo que recibís y el plazo de ese método.' : 'Preview your amount and open the fee details. Compare what you send, what you receive and the timing for that method.',
      cta: es ? 'Conocer Airtm' : 'Explore Airtm',
      disclosure: es ? 'Enlace de referido: Bolivia Blue puede recibir una recompensa. Revisá requisitos y costos en Airtm.' : 'Referral link: Bolivia Blue may receive a reward. Check Airtm’s requirements and costs.',
    },
    {
      id: 'wallbit', partner: 'wallbit', name: 'Wallbit',
      purpose: es ? 'Depositar BOB por QR o retirar a una cuenta bancaria boliviana, según disponibilidad.' : 'Deposit BOB by QR or withdraw to a Bolivian bank account, subject to availability.',
      payment: es ? 'Para este flujo, Wallbit exige una cuenta bancaria a tu nombre; no admite billeteras digitales locales.' : 'This flow requires a bank account in your own name; local digital wallets are not supported.',
      checks: es ? 'Cotización, límites, costo de retiro y condiciones del plan. Este proceso es distinto de comparar anuncios P2P.' : 'Exchange quote, limits, withdrawal cost and plan terms. This is a different process from comparing P2P ads.',
    },
    {
      id: 'bitget', partner: 'bitget', name: 'Bitget P2P',
      purpose: es ? 'Comparar otra oferta P2P si tu cuenta muestra BOB y un método que podés usar.' : 'Compare another P2P offer if your account displays BOB and a payment method you can use.',
      payment: es ? 'Depende de los anuncios disponibles.' : 'Depends on available ads.',
      checks: es ? 'KYC, precio, límites, cargos aplicables y costos del banco o de retiro. La documentación menciona BOB, pero confirmá la disponibilidad actual en tu cuenta.' : 'KYC, price, limits, applicable fees and bank or withdrawal costs. Official documentation mentions BOB, but confirm current availability in your account.',
    },
    {
      id: 'bybit', partner: 'bybit', name: 'Bybit P2P',
      purpose: es ? 'Comparar anuncios en BOB si están habilitados para tu cuenta.' : 'Compare BOB ads if they are available to your account.',
      payment: es ? 'Usá únicamente el método indicado en el anuncio y admitido por tu cuenta.' : 'Use only the method specified in the ad and supported by your account.',
      checks: es ? 'Precio, límites y tarifario vigente para tu moneda y tipo de operación. Aunque una comisión de plataforma sea cero, pueden existir otros costos.' : 'Price, limits and the current fee schedule for your currency and transaction type. Even when a platform fee is zero, other costs may apply.',
    },
  ];
}


/** Reviewed content shared verbatim by React and the initial HTML. */
export function getPlatformComparisonPage(language = 'es') {
  const es = language !== 'en';
  language = es ? 'es' : 'en';
  const copy = {
    title: es ? 'Plataformas para comprar USDT y cambiar dinero en Bolivia | Bolivia Blue' : 'Platforms to buy USDT and exchange money in Bolivia | Bolivia Blue',
    description: es ? 'Compará Binance P2P, El Dorado, Airtm, Wallbit, Bitget y Bybit por uso, medios de pago y costos a revisar antes de operar en Bolivia.' : 'Compare Binance P2P, El Dorado, Airtm, Wallbit, Bitget and Bybit by use case, payment method and costs to check before transacting in Bolivia.',
    home: es ? 'Inicio' : 'Home',
    platforms: es ? 'Plataformas' : 'Platforms',
    schemaLanguage: es ? 'es-BO' : 'en-US',
    heading: es ? 'Compará plataformas para comprar USDT y cambiar dinero en Bolivia' : 'Compare platforms to buy USDT and exchange money in Bolivia',
    introduction: es ? 'Elegí según lo que querés hacer: comprar USDT con bolivianos, vender cripto para recibir BOB o mover saldo desde una billetera. Antes de abrir una cuenta, comprobá que admita tu país, tu documento y tu medio de pago.' : 'Choose by what you need to do: buy USDT with bolivianos, sell crypto for BOB or move a wallet balance. Before opening an account, check that it supports your country, identity document and payment method.',
    referenceWarning: es ? 'Esta es una comparación informativa, no una cotización ni una orden. La referencia de Bolivia Blue no es el precio final de ninguna plataforma. USDT y USDC son criptoactivos; no son billetes de dólar y tienen riesgos.' : 'This is an informational comparison, not a quote or an order. Bolivia Blue’s reference rate is not any provider’s final price. USDT and USDC are cryptoassets, not dollar banknotes, and carry risks.',
    referralLabel: es ? 'Enlace de referido' : 'Referral link',
    referralDisclosure: es ? 'Aviso de referidos: Bolivia Blue puede recibir una comisión o recompensa si usás los enlaces identificados como referidos. Los costos, requisitos y condiciones los define cada proveedor. No prometemos bonos.' : 'Referral disclosure: Bolivia Blue may receive a commission or reward when you use links marked as referrals. Each provider sets its costs, requirements and terms. We do not promise bonuses.',
    nextStep: es ? 'Tu próximo paso' : 'Your next step',
    buyNavigationLabel: es ? 'Comprar USDT con BOB' : 'Buy USDT with BOB',
    buyGuideLabel: es ? 'Comprar USDT con BOB: ver los pasos' : 'Buy USDT with BOB: see the steps',
    viewComparison: es ? 'Ver comparación' : 'View comparison',
    cashGuideLabel: es ? 'De USDT a efectivo: cómo seguir' : 'From USDT to cash: what comes next',
    comparisonHeading: es ? 'Compará el proceso, después la oferta' : 'Compare the process, then the offer',
    comparisonIntroduction: es ? 'Compará el mismo monto, moneda, dirección del cambio y medio de pago. La disponibilidad, los límites y el total final se confirman en cada proveedor.' : 'Compare the same amount, currency, exchange direction and payment method. Confirm availability, limits and the final total with each provider.',
    purpose: es ? 'Para qué podés evaluarla' : 'What to consider it for',
    payment: es ? 'Pago o retiro local' : 'Local payment or withdrawal',
    checks: es ? 'Antes de confirmar' : 'Before confirming',
    firstStep: es ? 'Primer paso: ' : 'First step: ',
    binanceGuide: es ? 'Ver guía oficial Binance P2P' : 'Read the official Binance P2P guide',
    informationalLink: es ? 'Enlace informativo. No usamos un enlace de referido de Bolivia Blue para este proveedor.' : 'Informational link. We do not use a Bolivia Blue referral link for this provider.',
    firstPurchase: es ? 'Cómo hacer mi primera compra' : 'How to make my first purchase',
    officialDocumentation: es ? 'Documentación oficial' : 'Official documentation',
    stepsHeading: es ? 'Tu comparación en cuatro pasos' : 'Compare in four steps',
    safetyHeading: es ? 'Si algo no coincide, frená y usá el soporte oficial' : 'If something does not match, stop and use official support',
    safetyWarning: es ? 'Escrow, KYC y el historial de una contraparte son controles útiles, pero no eliminan el riesgo de fraude, demoras, bloqueos o pérdidas.' : 'Escrow, KYC and counterparty history are useful controls, but do not eliminate fraud, delays, restrictions or losses.',
    binanceAppeal: es ? 'Cómo apelar en Binance' : 'How to appeal on Binance',
    eldoradoDispute: es ? 'Cómo iniciar una disputa en El Dorado' : 'How to open an El Dorado dispute',
    nextHeading: es ? '¿Querés ver el proceso antes de registrarte?' : 'Want to see the process before signing up?',
    guideNavigationLabel: es ? 'Guía paso a paso' : 'Step-by-step guide',
    buyGuideCta: es ? 'Ver cómo comprar USDT con BOB' : 'See how to buy USDT with BOB',
    calculatorNavigationLabel: es ? 'Calculadora' : 'Calculator',
    calculatorLabel: es ? 'Usar la calculadora como referencia' : 'Use the calculator as a reference',
    sourcesHeading: es ? 'Fuentes oficiales y fecha de revisión' : 'Official sources and review date',
    reviewedLabel: es ? 'Revisado el ' : 'Reviewed ',
    reviewedDate: es ? '4 de octubre de 2026' : 'October 4, 2026',
    sourcesNote: es ? 'Las fuentes están enlazadas en cada ficha. Las condiciones pueden cambiar. Consultá el tarifario y la pantalla de confirmación del proveedor antes de operar.' : 'Sources are linked in each provider card. Terms may change. Check the provider’s fee schedule and confirmation screen before transacting.',
    banksLabel: es ? 'Consultar también los bancos de Bolivia' : 'Also review banks in Bolivia',
  };
  const local = (href) => {
    const url = new URL(href, 'https://www.boliviablue.com');
    if (!es) url.searchParams.set('lang', 'en');
    return url.pathname + url.search + url.hash;
  };
  const compareSteps = es ? [
    'Definí el recorrido: BOB → USDT, USDT → BOB u otro saldo. No compares resultados en activos distintos como si fueran equivalentes.',
    'Cotizá el mismo monto con un método que puedas usar. Revisá mínimos, máximos y requisitos.',
    'Compará el total. Para comprar, dividí los BOB totales que pagarías por los USDT netos que recibirías. Sumá por separado cargos bancarios o de retiro que no estén incluidos; no los cuentes dos veces.',
    'Revisá el plazo y las condiciones de la orden. La tasa indicativa de Bolivia Blue y la calculadora sirven de referencia; confirmá la oferta final en el proveedor.',
  ] : [
    'Define the route: BOB → USDT, USDT → BOB or another balance. Do not treat results in different assets as equivalent.',
    'Quote the same amount with a payment method you can use. Check minimums, maximums and requirements.',
    'Compare the total. To buy, divide the total BOB you would pay by the net USDT you would receive. Add bank or withdrawal costs separately if they are not included; do not count them twice.',
    'Check the order’s timing and terms. Bolivia Blue’s indicative rate and calculator are references; confirm the final offer with the provider.',
  ];
  const safety = es ? [
    ['Antes de pagar', 'Comprobá destinatario, monto y método en la orden. Si hay datos distintos o te piden salir del proceso, no envíes dinero; usá el chat y la cancelación del proveedor cuando corresponda.'],
    ['Después de pagar', 'No canceles por una promesa de devolución. Guardá el comprobante, marcá el pago solo si realmente lo hiciste y solicitá ayuda o una disputa desde la orden. Seguí las indicaciones del soporte oficial y verificá cualquier reembolso en tu cuenta.'],
    ['Si vendés', 'Comprobá en tu banco o billetera que el dinero llegó antes de liberar cripto. Una captura o un mensaje no prueban la acreditación.'],
    ['Durante la operación', 'El pago puede hacerse en la app de tu banco; conservá la orden, la conversación y las pruebas dentro de la plataforma. No aceptes negocios paralelos por WhatsApp o Telegram.'],
  ] : [
    ['Before paying', 'Check the recipient, amount and payment method in the order. If details differ or someone asks you to leave the process, do not send money; use the provider’s chat and cancellation process where appropriate.'],
    ['After paying', 'Do not cancel based on a promise of a refund. Keep proof, mark the payment only after you have actually paid and request help or a dispute through the order. Follow official support’s instructions and verify any refund in your account.'],
    ['If selling', 'Verify the money in your bank or wallet before releasing crypto. A screenshot or message does not prove receipt.'],
    ['During the transaction', 'Payment may take place in your banking app; keep the order, conversation and evidence on the platform. Do not agree to side deals through WhatsApp or Telegram.'],
  ];
  const { title, description } = copy;
  const canonical = 'https://www.boliviablue.com' + local('/plataformas');
  return {
    language, es, copy, title, description, local, canonical,
    platforms: getPlatformComparison(language), compareSteps, safety,
    offer: getFinancialOffer(language),
    buyGuide: local('/comprar-dolares?intent=buy_usdt#guia'),
    cashGuide: local('/comprar-dolares?intent=buy_usdt&operation=sell#guia'),
    breadcrumbs: [{ name: copy.home, url: local('/') }, { name: copy.platforms, url: local('/plataformas') }],
    comparisonSchema: { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: copy.schemaLanguage },
  };
}
