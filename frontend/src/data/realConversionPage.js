import { validObservationTime } from '../utils/observationTime.js';
import { observationLabel } from '../utils/sourceObservation.js';

export const REAL_PATH = '/real-a-boliviano';
const BASE = 'https://www.boliviablue.com';
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** A dated stored cross is a reference, not proof of separately recorded BRL inputs. */
export function realRateModel(rate, now = Date.now()) {
  const observedAt = validObservationTime(rate?.updated_at_iso ?? rate?.t);
  const buy = rate?.buy_bob_per_brl;
  const sell = rate?.sell_bob_per_brl;
  const available = positive(buy) && positive(sell) && Boolean(observedAt);
  const stale = available && (rate?.is_stale === true || now - Date.parse(observedAt) > 20 * 60000 || Date.parse(observedAt) > now + 60000);
  return { available, stale, observedAt, buy: available ? buy : null, sell: available ? sell : null };
}

export function getRealConversionPage(language = 'es', rate = null, now = Date.now()) {
  const es = language !== 'en';
  const lang = es ? 'es' : 'en';
  const suffix = es ? '' : '?lang=en';
  const model = realRateModel(rate, now);
  const page = {
    language: lang, canonical: BASE + REAL_PATH + suffix,
    title: es ? 'Real a boliviano: conversión BRL a BOB | Bolivia Blue' : 'Brazilian real to boliviano: BRL to BOB | Bolivia Blue',
    description: es ? 'Referencia de real brasileño a boliviano vía USDT. Consulta disponibilidad, fecha del registro, fórmula BRL/BOB y límites antes de comparar un cambio.' : 'Brazilian real to boliviano reference via USDT. Check availability, the record date, BRL/BOB calculation and limits before comparing an exchange.',
    heading: es ? 'Real brasileño a boliviano: BRL a BOB' : 'Brazilian real to boliviano: BRL to BOB',
    introduction: es ? 'Una referencia para comparar importes en reales y bolivianos. El llamado real blue de esta página es un cruce indicativo vía USDT; no es una oferta de cambio de efectivo ni una cantidad garantizada al realizar una operación.' : 'A reference for comparing amounts in Brazilian reais and bolivianos. This page’s real blue is an indicative cross via USDT, not a cash-exchange offer or a guaranteed transaction amount.',
    rateHeading: es ? 'Referencia BRL/BOB del registro disponible' : 'BRL/BOB reference from the available record',
    status: !model.available ? (es ? 'Referencia BRL/BOB no disponible. No mostramos una cotización de reemplazo.' : 'BRL/BOB reference unavailable. We do not display a replacement quote.') : model.stale ? (es ? 'Registro desactualizado. Estas cifras no deben tratarse como una cotización actual.' : 'Stale record. These figures should not be treated as a current quote.') : (es ? 'Cruce indicativo guardado, antes de comisiones.' : 'Stored indicative cross, before fees.'),
    buyLabel: es ? 'Cruce de las referencias de compra de USDT' : 'Cross of USDT buy-side references',
    sellLabel: es ? 'Cruce de las referencias de venta de USDT' : 'Cross of USDT sell-side references',
    recordLabel: es ? 'Fecha del registro' : 'Record timestamp',
    recordTime: model.observedAt ? observationLabel(model.observedAt, lang) : (es ? 'No disponible' : 'Unavailable'),
    timestampNote: es ? 'La fecha corresponde al registro guardado. No disponemos de una marca de tiempo independiente para la pata BRL/USDT, ni de su desglose histórico de ofertas; no puede verificarse por separado con estos datos.' : 'The timestamp belongs to the stored record. We do not have an independent BRL/USDT leg timestamp or its historical offer breakdown, so that leg cannot be separately verified from this data.',
    amountsHeading: es ? 'Importes de referencia en bolivianos' : 'Reference amounts in bolivianos',
    amountsNote: es ? 'Multiplicamos el importe en BRL por cada referencia BOB/BRL guardada. Las tasas se muestran con 3 decimales y los totales con 2; el cálculo usa la precisión disponible. No son límites mínimo/máximo ni ofertas ejecutables.' : 'We multiply the BRL amount by each stored BOB/BRL reference. Rates display 3 decimal places and totals 2; calculations use the available precision. These are not minimum/maximum bounds or executable offers.',
    amountColumn: es ? 'Importe BRL' : 'BRL amount',
    buyColumn: es ? 'Referencia compra (BOB)' : 'Buy-side reference (BOB)',
    sellColumn: es ? 'Referencia venta (BOB)' : 'Sell-side reference (BOB)',
    sections: es ? [
      { id: 'como-se-calcula', title: 'Cómo se calcula el cruce vía USDT', paragraphs: [
        'La fórmula es BOB por BRL = (BOB por USDT) ÷ (BRL por USDT). La pata BOB utiliza la mediana de las cotizaciones de las plataformas P2P que respondieron. La pata BRL se consulta en Binance P2P.',
        'Conservamos las dos referencias del cálculo: compra BOB ÷ compra BRL y venta BOB ÷ venta BRL. Compra y venta describen los lados de compra y venta de USDT en los datos de origen; no equivalen a una promesa de comprar o vender tus reales a ese precio.',
        'Una operación BRL → USDT → BOB usaría lados opuestos: comprar USDT con BRL y venderlo por BOB. Por eso el cruce de esta página no calcula el resultado ejecutable de esas dos operaciones. Confirma las ofertas, los medios de pago, los límites y los costos de cada paso.'
      ]},
      { id: 'convertir-en-ambas-direcciones', title: 'Convertir BRL a BOB, o BOB a BRL', paragraphs: [
        'Para una comparación aritmética, multiplica los reales por la referencia expresada en BOB por BRL. En sentido inverso, divide los bolivianos por esa misma referencia. Una cifra mayor en BOB por BRL representa más bolivianos por cada real dentro de ese cálculo.',
        'La calculadora general permite elegir BRL manualmente, ingresar un importe y cambiar el sentido. Abre inicialmente en USD: selecciona BRL antes de usarla. Si falta la referencia de BRL, no uses el resultado de otra moneda como sustituto.'
      ]},
      { id: 'comparar-un-cambio', title: 'Qué comparar antes de cambiar dinero', paragraphs: [
        'Para efectivo, transferencias o una remesa, solicita al proveedor el total neto que recibirías, la moneda de entrega, todas las comisiones y el plazo. Compara ese total con el importe que entregas; una cotización P2P puede diferir del precio disponible para tu ubicación o forma de pago.',
        'Esta página no publica una cotización oficial BRL/BOB del Banco Central de Bolivia. Tampoco certifica disponibilidad de efectivo, acceso a una plataforma o aceptación de una cuenta bancaria brasileña.'
      ]}
    ] : [
      { id: 'como-se-calcula', title: 'How the USDT cross is calculated', paragraphs: [
        'The formula is BOB per BRL = (BOB per USDT) ÷ (BRL per USDT). The BOB leg uses the median of quotes from responding P2P platforms. The BRL leg is requested from Binance P2P.',
        'The calculation retains two references: BOB buy ÷ BRL buy and BOB sell ÷ BRL sell. Buy and sell describe the USDT trading sides in the source data; they do not promise that your reais can be bought or sold at these prices.',
        'A BRL → USDT → BOB transaction would use opposite sides: buying USDT with BRL and selling it for BOB. This page’s cross therefore does not calculate the executable outcome of those two trades. Confirm offers, payment methods, limits and costs for each step.'
      ]},
      { id: 'convertir-en-ambas-direcciones', title: 'Convert BRL to BOB, or BOB to BRL', paragraphs: [
        'For an arithmetic comparison, multiply reais by the reference expressed in BOB per BRL. In the reverse direction, divide bolivianos by that same reference. A higher BOB-per-BRL figure represents more bolivianos per real within that calculation.',
        'The general calculator lets you select BRL manually, enter an amount and change direction. It initially opens in USD: select BRL before using it. When the BRL reference is missing, do not substitute a result for a different currency.'
      ]},
      { id: 'comparar-un-cambio', title: 'What to compare before exchanging money', paragraphs: [
        'For cash, transfers or remittances, ask the provider for the net amount you would receive, payout currency, all fees and timing. Compare that net amount with what you pay; a P2P reference can differ from the price available for your location or payment method.',
        'This page does not publish an official Central Bank of Bolivia BRL/BOB quote. It does not certify cash availability, platform access or acceptance of a Brazilian bank account.'
      ]}
    ],
    faqHeading: es ? 'Preguntas frecuentes' : 'Frequently asked questions',
    faqs: es ? [
      { question: '¿Cuánto son 100 reales en bolivianos?', answer: 'Si hay un registro BRL/BOB válido y fechado, la tabla muestra 100 multiplicado por cada referencia guardada. Sin datos suficientes mostramos un guion, no una tasa fija. Confirma con tu proveedor cuánto recibirías realmente.' },
      { question: '¿Por qué no aparece una cotización de BRL?', answer: 'Puede faltar una de las referencias necesarias o no haberse podido cargar el registro. El cálculo requiere datos BRL y BOB válidos. La página vuelve a consultar los datos periódicamente; eso no garantiza que haya una nueva cotización.' },
      { question: '¿La fecha demuestra que ambas patas se midieron al mismo tiempo?', answer: 'No. Es la fecha del registro. Los datos disponibles no incluyen una hora independiente de BRL/USDT ni permiten auditar por separado la procedencia de todos los valores BRL históricos.' }
    ] : [
      { question: 'How much are 100 reais in bolivianos?', answer: 'When a valid dated BRL/BOB record is available, the table shows 100 multiplied by each stored reference. Without sufficient data we show a dash, not a fixed rate. Confirm the actual payout with your provider.' },
      { question: 'Why is the BRL quote missing?', answer: 'A required reference may be missing, or the record may not have loaded. The calculation needs valid BRL and BOB data. The page requests data periodically; that does not guarantee a new quote is available.' },
      { question: 'Does the timestamp prove both legs were measured together?', answer: 'No. It is the record timestamp. The available data does not include an independent BRL/USDT time or let you separately audit the origin of every historical BRL value.' }
    ],
    linksHeading: es ? 'Calculadora y fuentes' : 'Calculator and sources',
    links: [
      { href: '/calculadora' + suffix, label: es ? 'Abrir calculadora y seleccionar BRL' : 'Open calculator and select BRL' },
      { href: '/fuente-de-datos' + suffix, label: es ? 'Metodología de la referencia P2P' : 'P2P reference methodology' },
      { href: 'https://p2p.binance.com/', label: 'Binance P2P' },
      { href: '/dolar-blue-hoy' + suffix, label: es ? 'Referencia USDT/BOB' : 'USDT/BOB reference' }
    ],
    model,
  };
  const total = (amount, value) => model.available && Number.isFinite(amount * value) ? (amount * value).toFixed(2) : '—';
  page.amounts = [1, 10, 100, 500, 1000].map(amount => ({ amount, buy: total(amount, model.buy), sell: total(amount, model.sell) }));
  page.schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: page.heading, description: page.description, url: page.canonical, inLanguage: es ? 'es-BO' : 'en-US' },
    { '@context': 'https://schema.org', '@type': 'FAQPage', url: page.canonical, inLanguage: es ? 'es-BO' : 'en-US', mainEntity: page.faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }
  ];
  return page;
}
