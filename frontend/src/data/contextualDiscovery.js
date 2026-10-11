import { travelGuidePath } from '../config/travelGuide.js';
import { getSourceCompositionExample } from './sourceCompositionExample.js';

/** Four page-specific next steps, shared by React and the initial HTML. */
export function getContextualDiscovery(language = 'es') {
  const es = language !== 'en';
  const realPath = `/real-a-boliviano${es ? '' : '?lang=en'}`;
  return {
    calculatorReal: {
      id: 'calculator-real', href: realPath,
      before: es ? '¿Vas a convertir reales? Revisá ' : 'Converting Brazilian reais? Check ',
      label: es ? 'cómo se calcula la referencia BRL/BOB' : 'how the BRL/BOB reference is calculated',
      after: es ? ' y sus límites antes de comparar un cambio.' : ' and its limits before comparing an exchange.',
    },
    calculatorPayment: {
      id: 'calculator-payment', href: `${travelGuidePath(es ? 'es' : 'en')}#payment-cost-comparison`,
      // A full entry uses the existing lazy-mount anchor waiter. SPA hash retries
      // are time-limited and can finish before the guide has downloaded.
      fullNavigation: true,
      before: es ? 'Si un comercio te da precios en BOB y USD para la misma compra, podés ' : 'If a merchant quotes BOB and USD prices for the same purchase, you can ',
      label: es ? 'comparar ambos costos con tu tasa y comisiones' : 'compare both costs using your rate and fees',
      after: '.',
    },
    travelerReal: {
      id: 'traveler-real', href: realPath,
      before: es ? 'Si traés reales brasileños, consultá la ' : 'If you’re bringing Brazilian reais, check the ',
      label: es ? 'referencia de reales a bolivianos' : 'Brazilian real to boliviano reference',
      after: es ? ' para orientarte. Es un cruce indicativo vía USDT; confirmá si la casa de cambio acepta tus billetes y cuánto recibirías neto.' : ' for context. It’s an indicative USDT cross; confirm whether the exchange office accepts your banknotes and your net payout.',
    },
    historySources: {
      id: 'history-sources', href: getSourceCompositionExample(es ? 'es' : 'en').path,
      before: es ? 'Antes de interpretar un movimiento del gráfico, mirá este ' : 'Before interpreting a chart movement, see this ',
      label: es ? 'ejemplo de cómo cambia la referencia al cambiar las fuentes' : 'example of how changing sources changes the reference',
      after: '.',
    },
  };
}
