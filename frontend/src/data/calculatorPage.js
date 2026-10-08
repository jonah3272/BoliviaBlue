const BASE = 'https://www.boliviablue.com';
const PATH = '/calculadora';

/** Shared, rate-independent calculator copy for React and initial HTML. */
export function getCalculatorPage(language = 'es') {
  const es = language !== 'en';
  const local = (path) => path + (es ? '' : `${path.includes('?') ? '&' : '?'}lang=en`);
  const title = es
    ? 'Dólares a bolivianos: calculadora USD/BOB | Bolivia Blue'
    : 'Dollars to bolivianos: USD/BOB calculator | Bolivia Blue';
  const description = es
    ? 'Convertí dólares a bolivianos y bolivianos a dólares. Compará la referencia P2P y el tipo oficial, con ejemplos y explicación de compra y venta.'
    : 'Convert dollars to bolivianos and bolivianos to dollars. Compare the P2P reference and official rate, with examples and an explanation of buy and sell rates.';
  const heading = es ? 'Calculadora de dólares a bolivianos' : 'Dollars to bolivianos calculator';
  const canonical = BASE + local(PATH);
  const presets = [
    ['usd', '15', es ? '15 dólares a bolivianos' : '15 dollars to bolivianos'],
    ['usd', '100', es ? '100 dólares a bolivianos' : '100 dollars to bolivianos'],
    ['usd', '1000', es ? '1.000 dólares a bolivianos' : '1,000 dollars to bolivianos'],
    ['usd', '10000', es ? '10.000 dólares a bolivianos' : '10,000 dollars to bolivianos'],
    ['bob', '5000', es ? '5.000 bolivianos a dólares' : '5,000 bolivianos to dollars'],
  ].map(([currency, amount, label]) => ({
    href: local(`${PATH}?${currency}=${amount}`), label, preset: { [currency]: amount },
  }));
  const sections = es ? [
    {
      id: 'dolares-a-bolivianos', title: 'Cómo convertir dólares a bolivianos',
      paragraphs: [
        'Ingresá el monto en USD y elegí Blue para usar la referencia P2P. El cálculo es: monto en dólares × tasa de venta P2P = bolivianos estimados, antes de comisiones. Por ejemplo, para 100 dólares se multiplica 100 por la tasa aplicada que muestra la calculadora.',
        'Compra y venta P2P se leen desde tu perspectiva: venta es lo que recibís en BOB al vender USDT; compra es lo que pagás en BOB para comprar USDT. Por eso, para estimar los bolivianos que recibirías se usa venta.',
      ],
    },
    {
      id: 'bolivianos-a-dolares', title: 'Cómo convertir bolivianos a dólares',
      paragraphs: [
        'Ingresá el monto en BOB para cambiar la dirección. El cálculo es: monto en bolivianos ÷ tasa de compra P2P = dólares estimados, antes de comisiones. Para 5.000 BOB se divide 5.000 por la tasa de compra aplicada.',
        'La diferencia entre compra y venta hace que cambiar de ida y vuelta no devuelva necesariamente el monto inicial. Revisá la moneda de cada campo y la tasa aplicada después de intercambiarlas.',
      ],
    },
    {
      id: 'referencia-p2p-y-oficial', title: 'Referencia P2P y tipo de cambio oficial',
      paragraphs: [
        'Blue usa una referencia de operaciones P2P entre USDT y BOB. El modo Oficial usa el tipo oficial correspondiente a la dirección de la conversión. Cambiá entre ambos para comparar estimaciones con el mismo monto.',
        'La existencia de un tipo oficial no garantiza que puedas comprar o vender dólares a esa tasa ni que una entidad tenga dólares disponibles. Los límites, requisitos, comisiones y medios de pago dependen del proveedor.',
      ],
    },
    {
      id: 'limites-de-la-estimacion', title: 'Qué incluye esta estimación',
      paragraphs: [
        'El cálculo USD/BOB con referencia P2P supone 1 USD = 1 USDT. Esa paridad, la liquidez y la disponibilidad pueden variar. USDT es un activo digital; esta referencia no garantiza una cotización de dólares en efectivo, con tarjeta o por transferencia bancaria.',
        'Los resultados no incluyen las comisiones o cargos particulares de una operación. Antes de decidir, compará el monto neto que recibirías, los límites y las condiciones del proveedor. Si no hay una tasa válida, la calculadora no puede mostrar una conversión; no interpretes la ausencia de datos como una tasa de cero.',
      ],
    },
  ] : [
    {
      id: 'dolares-a-bolivianos', title: 'How to convert dollars to bolivianos',
      paragraphs: [
        'Enter the USD amount and choose Blue to use the P2P reference. The calculation is: dollar amount × P2P sell rate = estimated bolivianos, before fees. For example, 100 dollars is multiplied by the applied rate shown in the calculator.',
        'P2P buy and sell are from your perspective: sell is the BOB you receive when selling USDT; buy is the BOB you pay to buy USDT. This is why estimating the bolivianos you would receive uses the sell rate.',
      ],
    },
    {
      id: 'bolivianos-a-dolares', title: 'How to convert bolivianos to dollars',
      paragraphs: [
        'Enter the BOB amount to change direction. The calculation is: boliviano amount ÷ P2P buy rate = estimated dollars, before fees. For 5,000 BOB, divide 5,000 by the applied buy rate.',
        'The difference between buy and sell rates means that converting out and back may not return the original amount. Check the currency in each field and the applied rate after swapping them.',
      ],
    },
    {
      id: 'referencia-p2p-y-oficial', title: 'P2P reference and official exchange rate',
      paragraphs: [
        'Blue uses a reference from P2P transactions between USDT and BOB. Official mode uses the official rate for the conversion direction. Switch between the two to compare estimates for the same amount.',
        'An official rate does not guarantee that you can buy or sell dollars at that rate or that an institution has dollars available. Limits, requirements, fees and payment methods depend on the provider.',
      ],
    },
    {
      id: 'limites-de-la-estimacion', title: 'What this estimate includes',
      paragraphs: [
        'The P2P-based USD/BOB calculation assumes 1 USD = 1 USDT. That parity, liquidity and availability can vary. USDT is a digital asset; this reference does not guarantee a cash-dollar, card or bank-transfer quote.',
        'Results do not include the fees or charges of an individual transaction. Before deciding, compare the net amount you would receive, limits and provider terms. Without a valid rate, the calculator cannot show a conversion; missing data is not a zero rate.',
      ],
    },
  ];
  return {
    language: es ? 'es' : 'en', title, description, heading, canonical, presets, sections,
    introduction: es
      ? 'Ingresá cuánto querés convertir de dólares a bolivianos o de bolivianos a dólares. Elegí referencia P2P o tipo oficial y revisá qué tasa se aplica antes de comparar el resultado.'
      : 'Enter how much you want to convert from dollars to bolivianos or from bolivianos to dollars. Choose the P2P reference or official rate and check which rate applies before comparing the result.',
    presetsHeading: es ? 'Montos frecuentes para convertir' : 'Common amounts to convert',
    presetsNote: es
      ? 'Estos enlaces cargan el monto y la dirección con referencia P2P. Podés cambiar el monto o elegir Oficial después.'
      : 'These links load the amount and direction using the P2P reference. You can change the amount or choose Official afterward.',
    helpHeading: es ? 'Cómo usar la calculadora USD/BOB' : 'How to use the USD/BOB calculator',
    interactiveNote: es ? 'Activá JavaScript para usar la calculadora interactiva.' : 'Enable JavaScript to use the interactive calculator.',
    methodology: { href: local('/fuente-de-datos'), label: es ? 'Metodología y fuentes de la referencia' : 'Reference methodology and sources' },
    webAppSchema: {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: heading,
      description, url: canonical, inLanguage: es ? 'es-BO' : 'en-US',
      applicationCategory: 'FinanceApplication', operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  };
}
