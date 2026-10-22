export const CASH_CARD_PATH = '/efectivo-o-tarjeta-bolivia';
const BASE = 'https://www.boliviablue.com';

/** One editorial model for the interactive page and the initial HTML. */
export function cashCardPage(language = 'es') {
  const es = language !== 'en';
  const lang = es ? 'es' : 'en';
  const local = path => `${path}${es ? '' : '?lang=en'}`;
  const page = {
    language: lang,
    canonical: BASE + local(CASH_CARD_PATH),
    title: es ? '¿Efectivo o tarjeta en Bolivia? Compará tasas y comisiones' : 'Cash or card in Bolivia? Compare exchange rates and fees',
    description: es ? 'Compará efectivo al dólar blue con tarjeta y referencia BCB. Ajustá la comisión FX, revisá el ahorro estimado y calculá el costo de tu compra.' : 'Compare cash at the blue rate with cards and the BCB reference. Adjust your FX fee, check estimated savings and calculate your purchase cost.',
    heading: es ? '¿Conviene pagar en efectivo o con tarjeta en Bolivia?' : 'Is cash or card cheaper in Bolivia?',
    introduction: es ? 'La respuesta puede cambiar cada día. Compará cuántos bolivianos obtenés por cada dólar después de las comisiones, para el mismo precio en Bs.' : 'The answer can change each day. Compare how many bolivianos each dollar buys after fees, for the same price in Bs.',
    answer: es ? 'Si la tasa neta que conseguís por tus dólares en efectivo supera la tasa neta de la tarjeta, el efectivo cuesta menos. Si la tarjeta te da más bolivianos por dólar después de su comisión, la tarjeta cuesta menos.' : 'If the net rate you get for cash dollars is higher than your card’s net rate, cash costs less. If the card buys more bolivianos per dollar after its fee, the card costs less.',
    dailyHeading: es ? 'Comparación del día: blue, tarjeta y BCB' : 'Daily comparison: blue, card and BCB',
    assumption: es ? 'El escenario usa el punto medio P2P como supuesto de cambio de efectivo y una comisión de tarjeta inicial del 0%. Cambiá la comisión en el comparador. Una oferta real de billetes puede ser diferente.' : 'This scenario uses the P2P midpoint as an assumed cash exchange rate and starts with a 0% card fee. Change the fee in the comparison. An actual banknote quote can differ.',
    interact: es ? 'Activá JavaScript para cambiar la comisión y calcular con tus importes.' : 'Enable JavaScript to change the fee and calculate with your amounts.',
    guideHeading: es ? 'Cómo comparar tu costo real' : 'How to compare your actual cost',
    sections: es ? [
      { title: '1. Pedí una oferta de efectivo para tu importe', text: 'Dividí los bolivianos que vas a recibir por los dólares que entregás, incluyendo cualquier cargo de cambio. Esa es tu tasa neta. La referencia blue de esta página proviene de USDT/BOB P2P: usala para comparar, y reemplazala por la oferta de efectivo que realmente te dieron.' },
      { title: '2. Incluí la comisión de tu tarjeta', text: 'Para una tarjeta facturada en USD, dividí la tasa BOB/USD antes de comisiones entre 1 + comisión/100. Una tasa de 12 Bs/USD con un cargo del 3% equivale a unos 11,65 Bs por dólar facturado. El 0% inicial es un supuesto, no la comisión verificada de tu banco.' },
      { title: '3. Compará el mismo gasto en bolivianos', text: 'Dividí el precio en Bs por cada tasa neta. El resultado menor en USD es la opción más barata. Si el comercio aplica un recargo por tarjeta o un descuento en efectivo, usá los precios finales de cada opción. Sumá los cargos fijos que todavía no estén incluidos.' },
      { title: '4. Revisá cuándo se observaron las tasas', text: 'La herramienta retira la recomendación del día cuando las lecturas P2P o de tarjeta tienen más de 45 minutos, faltan o no tienen una hora válida. El BCB es una referencia aparte: comparalo con tu tarjeta solo si tu banco confirma que utiliza esa tasa.' },
    ] : [
      { title: '1. Get a cash quote for your amount', text: 'Divide the bolivianos you will receive by the dollars you hand over, including exchange charges. That is your net rate. This page’s blue reference comes from P2P USDT/BOB: use it as a comparison, then replace it with the actual cash offer you received.' },
      { title: '2. Include your card’s foreign transaction fee', text: 'For a card billed in USD, divide its BOB/USD rate before fees by 1 + fee/100. A 12 Bs/USD rate with a 3% fee equals about 11.65 Bs per billed dollar. The initial 0% is an assumption, not your bank’s verified fee.' },
      { title: '3. Compare the same purchase in bolivianos', text: 'Divide the Bs price by each net rate. The lower USD result is cheaper. If the merchant adds a card surcharge or offers a cash discount, use each option’s final price. Add fixed fees that are not already included.' },
      { title: '4. Check when the rates were observed', text: 'The tool withholds today’s recommendation when P2P or card readings are over 45 minutes old, missing, or lack a valid observation time. BCB is a separate benchmark: use it for your card only if your bank confirms that rate applies.' },
    ],
    exampleHeading: es ? 'Ejemplo: la comisión puede cambiar el resultado' : 'Example: a fee can change the result',
    example: es ? 'Ejemplo hipotético, no cotizaciones actuales: una compra de Bs 1.200 cuesta USD 100 con efectivo a 12 Bs/USD. Una tarjeta a 12,20 Bs/USD cuesta USD 98,36 sin comisión; con 3% cuesta USD 101,31. La tarjeta gana sin comisión y el efectivo gana al incluirla.' : 'Hypothetical example, not current quotes: a Bs 1,200 purchase costs USD 100 with cash exchanged at 12 Bs/USD. A card at 12.20 Bs/USD costs USD 98.36 with no fee; with a 3% fee it costs USD 101.31. The card wins without the fee, and cash wins when it is included.',
    faqHeading: es ? 'Preguntas sobre efectivo, tarjetas y dólar blue' : 'Questions about cash, cards and the blue dollar',
    questions: es ? [
      ['¿El dólar blue es la tasa de mi tarjeta?', 'No. Bolivia Blue publica una referencia P2P USDT/BOB. La tasa de tu tarjeta depende de la red, el emisor, la fecha de conversión y los cargos aplicables. Compará los importes netos, no solo dos tasas publicadas.'],
      ['¿Qué pasa si el BCB está por debajo del blue?', 'Si tu banco utiliza la referencia BCB y, después de comisiones, obtenés menos Bs por USD que con tu oferta de efectivo, ese efectivo te cuesta menos para la misma compra. La diferencia entre BCB y blue por sí sola no confirma la tasa aplicada por tu banco.'],
      ['¿Elijo bolivianos o dólares en el datáfono o cajero?', 'Revisá las dos monedas, la tasa y los cargos antes de aceptar. Cuando el comercio o cajero convierte a tu moneda, se trata de conversión dinámica de moneda (DCC). Visa indica que debés poder aceptar o rechazar esa conversión; el comparador de Mastercard permite incorporar el cargo bancario.'],
      ['¿Se incluyen las comisiones del cajero?', 'La comparación diaria ajusta la comisión porcentual seleccionada de tarjeta. No incorpora automáticamente retiros, adelantos de efectivo, intereses ni cargos fijos. En el cálculo con tus datos, agregá solo los costos aplicables que todavía no estén incluidos.'],
    ] : [
      ['Is the blue dollar my card’s exchange rate?', 'No. Bolivia Blue publishes a P2P USDT/BOB reference. Your card rate depends on the network, issuer, conversion date and applicable fees. Compare net amounts, not just two published rates.'],
      ['What if the BCB rate is below the blue rate?', 'If your bank uses the BCB reference and, after fees, buys fewer Bs per USD than your cash offer, that cash costs less for the same purchase. The BCB–blue gap alone does not establish the rate your bank applies.'],
      ['Should I choose bolivianos or dollars at a card terminal or ATM?', 'Check both currencies, the exchange rate and charges before accepting. A merchant or ATM converting to your home currency is offering dynamic currency conversion (DCC). Visa says you must be able to accept or decline it; Mastercard’s converter lets you include the bank fee.'],
      ['Are ATM fees included?', 'The daily comparison adjusts the selected percentage card fee. It does not automatically include withdrawals, cash advances, interest or fixed charges. In the calculation using your own inputs, add applicable costs that are not already included.'],
    ],
    resourcesHeading: es ? 'Fuentes y herramientas' : 'Sources and tools',
    links: [
      { href: local('/'), label: es ? 'Dólar blue en Bolivia hoy' : 'Bolivia blue dollar today' },
      { href: local('/comparacion'), label: es ? 'Diferencia entre BCB y blue' : 'BCB versus blue reference' },
      { href: local('/calculadora'), label: es ? 'Calculadora de dólares a bolivianos' : 'Dollar to boliviano calculator' },
      { href: es ? '/guia-dinero-bolivia' : '/bolivia-money-guide', label: es ? 'Guía de dinero para viajeros' : 'Traveler money guide' },
      { href: local('/fuente-de-datos'), label: es ? 'Método y fuentes de Bolivia Blue' : 'Bolivia Blue methodology and sources' },
      { href: 'https://www.visa.com/en-us/personal/travel/dynamic-currency-conversion', label: 'Visa: Dynamic Currency Conversion' },
      { href: 'https://caribbean.mastercard.com/content/mastercardcom/en-region-car/en/personal/get-support/convert-currency.html', label: 'Mastercard: Currency Converter' },
    ],
  };
  page.schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url: page.canonical, inLanguage: es ? 'es-BO' : 'en-US', dateModified: '2026-10-22', publisher: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE } };
  return page;
}
