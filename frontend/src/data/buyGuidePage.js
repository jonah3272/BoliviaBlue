import { getEldoradoGuide } from './eldoradoGuide.js';
import { getFinancialOffer, BUY_USDT_INTENT, RECEIVE_PAYMENTS_INTENT } from '../config/referrals.js';

/** Shared visible guide identity for the initial HTML and the interactive page. */
export function getBuyGuidePage(language = 'es', requestedIntent, requestedOperation) {
  const es = language !== 'en';
  const intent = requestedIntent === RECEIVE_PAYMENTS_INTENT ? RECEIVE_PAYMENTS_INTENT : BUY_USDT_INTENT;
  const operation = requestedOperation === 'sell' ? 'sell' : 'buy';
  const selling = operation === 'sell';
  const usdtGoalLabel = selling ? (es ? 'Vender USDT' : 'Sell USDT') : (es ? 'Comprar USDT' : 'Buy USDT');
  const conversion = selling ? 'USDT → BOB' : 'BOB → USDT';
  const baseOffer = getFinancialOffer(es ? 'es' : 'en', intent);
  const guide = getEldoradoGuide(es ? 'es' : 'en', operation);
  const offer = intent === BUY_USDT_INTENT ? {
    ...baseOffer,
    id: operation === 'sell' ? 'eldorado_usdt_bob' : baseOffer.id,
    intent: operation === 'sell' ? 'sell_usdt' : baseOffer.intent,
    // Fixed guide creative version, not a randomized experiment or a conversion signal.
    variant: 'handoff_v2',
    cta: es ? 'Continuar en El Dorado' : 'Continue to El Dorado',
    handoff: es
      ? `Creá y verificá tu cuenta, o iniciá sesión si ya tenés una. Luego elegí ${conversion} y revisá las ofertas y medios de pago disponibles. Este enlace no crea una orden.`
      : `Create and verify your account, or sign in if you already have one. Then choose ${conversion} and check available offers and payment methods. This link does not create an order.`,
    headline: operation === 'sell' ? (es ? 'Convertí tus USDT en bolivianos con El Dorado' : 'Convert your USDT to bolivianos with El Dorado') : baseOffer.headline,
    body: operation === 'sell' ? (es ? 'Vendé USDT y recibí BOB por un medio de cobro admitido. Revisá el monto neto y verificá el ingreso en tu cuenta antes de liberar los USDT.' : 'Sell USDT and receive BOB through a supported method. Check the net amount and verify payment in your account before releasing USDT.') : baseOffer.body,
    guideLabel: guide.title,
    guideSummary: guide.summary,
    steps: guide.steps,
  } : baseOffer;
  return {
    language: es ? 'es' : 'en', intent, operation, offer, guide, usdtGoalLabel,
    title: es ? 'Comprar y vender USDT con bolivianos | Guía Bolivia Blue' : 'Buy and sell USDT with bolivianos | Bolivia Blue guide',
    description: es ? 'Aprendé a comprar USDT con BOB y vender USDT por bolivianos en El Dorado: pasos, conversiones, comisiones y seguridad. También pagos del exterior con Takenos.' : 'Learn to buy USDT with BOB and sell USDT for bolivianos on El Dorado: steps, conversions, fees and safety. Also receive overseas payments with Takenos.',
    heading: es ? '¿Qué querés hacer con tu dinero?' : 'What do you want to do with your money?',
    introduction: es ? 'Elegí tu objetivo y seguí una guía para empezar.' : 'Choose your goal and follow a guide to get started.',
    howToSchema: {
      '@context': 'https://schema.org', '@type': 'HowTo',
      name: `${offer.brand}: ${offer.guideLabel}`,
      description: offer.guideSummary || offer.body,
      step: offer.steps.map(([name, text], index) => ({ '@type': 'HowToStep', position: index + 1, name, text })),
    },
  };
}
