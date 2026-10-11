/** Fixed teaching example only. These figures are not provider or market quotes. */
export const REMITTANCE_EXAMPLE = Object.freeze([
  Object.freeze({ id: 'a', principalUsd: 195, senderFeeUsd: 5, totalUsd: 200, bobPerUsd: 10, receivedBob: 1950, effectiveBobPerUsd: 9.75 }),
  Object.freeze({ id: 'b', principalUsd: 200, senderFeeUsd: 0, totalUsd: 200, bobPerUsd: 9.9, receivedBob: 1980, effectiveBobPerUsd: 9.9 }),
]);

export const REMITTANCE_SOURCES = Object.freeze([
  Object.freeze({ href: 'https://www.remitly.com/us/es/money-transfer/send-money-to-bolivia', es: 'Remitly: costos y entrega de EE. UU. a Bolivia', en: 'Remitly: US-to-Bolivia costs and delivery (Spanish)' }),
  Object.freeze({ href: 'https://www.worldremit.com/en/bolivia', es: 'WorldRemit: total a pagar y monto a recibir (inglés)', en: 'WorldRemit: total to pay and amount received' }),
  Object.freeze({ href: 'https://www.consumerfinance.gov/consumer-tools/sending-money/', es: 'CFPB: información para comparar envíos desde EE. UU. (inglés)', en: 'CFPB: information for comparing transfers from the US' }),
]);

export function getRemittanceComparison(language = 'es') {
  const es = language !== 'en';
  const number = (value) => value.toLocaleString(es ? 'es-BO' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const copy = es ? {
    title: 'Comparar una remesa a Bolivia',
    introduction: 'Pedí dos cotizaciones con la misma moneda de envío, el mismo presupuesto total y una forma de cobro que el destinatario pueda usar. Una tasa anunciada más alta no siempre entrega más bolivianos.',
    checklistTitle: 'Qué anotar de cada cotización',
    checklist: [
      'Total que paga quien envía, incluidos los cargos e impuestos conocidos.',
      'Bolivianos netos que recibirá el destinatario y cualquier cargo de cobro pendiente de confirmar.',
      'Medio de pago en origen y forma de cobro en Bolivia que ambas personas puedan usar.',
      'Plazo de entrega y fecha o vigencia de la cotización.',
      'Requisitos, límites y condiciones que se apliquen a ese envío.',
    ],
    exampleTitle: 'Ejemplo hipotético: USD 200 de gasto total',
    exampleNote: 'Todos los números son inventados para explicar la cuenta. No representan a ningún proveedor ni una tasa actual. Ambas ofertas suponen que no hay otros cargos y que se puede usar la misma forma de cobro.',
    offer: 'Oferta', principal: 'Monto convertido', fee: 'Comisión de quien envía', total: 'Total pagado', rate: 'Tasa del ejemplo', received: 'Bolivianos recibidos', effective: 'Tasa efectiva por USD total gastado',
    formula: 'Tasa efectiva = bolivianos netos recibidos ÷ gasto total de quien envía.',
    conclusion: 'En este ejemplo, B entrega Bs 30 más por el mismo gasto de USD 200, aunque su tasa anunciada sea menor. A: 1.950 ÷ 200 = 9,75; B: 1.980 ÷ 200 = 9,90 BOB por USD total gastado.',
    caution: 'Si no conocés los cargos en destino, confirmalos antes de comparar: desconocido no significa cero. No vuelvas a restar un cargo que ya está incluido en el total o en el monto neto. Si cambia el monto, pedí una nueva cotización; las comisiones y condiciones pueden cambiar.',
    sourcesTitle: 'Fuentes para revisar tu cotización',
    sourceNote: 'Consultadas el 11 de octubre de 2026. Las condiciones se confirman con cada proveedor. La guía del CFPB se refiere a envíos desde EE. UU.; aquí se usa para explicar qué importes comparar, sin extender sus reglas a otros países.',
  } : {
    title: 'Compare a remittance to Bolivia',
    introduction: 'Request two quotes with the same sending currency, total budget and receiving method the recipient can use. A higher advertised exchange rate does not always deliver more bolivianos.',
    checklistTitle: 'What to record from each quote',
    checklist: [
      'The total paid by the sender, including known fees and taxes.',
      'The net bolivianos the recipient will receive and any collection charges still to be confirmed.',
      'A payment method and a receiving method in Bolivia that both people can use.',
      'The delivery time and the quote’s date or validity period.',
      'The requirements, limits and conditions that apply to this transfer.',
    ],
    exampleTitle: 'Hypothetical example: USD 200 total spending',
    exampleNote: 'All figures are invented to explain the calculation. They do not represent any provider or a current exchange rate. Both offers assume no other charges and the same usable receiving method.',
    offer: 'Offer', principal: 'Amount converted', fee: 'Sender’s fee', total: 'Total paid', rate: 'Example rate', received: 'Bolivianos received', effective: 'Effective rate per total USD spent',
    formula: 'Effective rate = net bolivianos received ÷ the sender’s total spending.',
    conclusion: 'In this example, B delivers Bs 30 more for the same USD 200 total spending, despite its lower advertised rate. A: 1,950 ÷ 200 = 9.75; B: 1,980 ÷ 200 = 9.90 BOB per total USD spent.',
    caution: 'If destination charges are unknown, confirm them before comparing: unknown does not mean zero. Do not subtract a charge again if it is already included in the total or net amount. Request a new quote if the amount changes; fees and conditions may change.',
    sourcesTitle: 'Sources for reviewing your quote',
    sourceNote: 'Checked October 11, 2026. Confirm terms with each provider. The CFPB guide concerns transfers from the US; it is used here to explain which amounts to compare, without extending its rules to other countries.',
  };
  return {
    id: 'comparar-remesas', ...copy,
    offers: REMITTANCE_EXAMPLE.map((offer) => ({
      id: offer.id,
      title: `${copy.offer} ${offer.id.toUpperCase()}`,
      rows: [
        [copy.principal, `USD ${number(offer.principalUsd)}`],
        [copy.fee, `USD ${number(offer.senderFeeUsd)}`],
        [copy.total, `USD ${number(offer.totalUsd)}`],
        [copy.rate, `${number(offer.bobPerUsd)} BOB/USD`],
        [copy.received, `Bs ${number(offer.receivedBob)}`],
        [copy.effective, `${number(offer.effectiveBobPerUsd)} BOB/USD`],
      ],
    })),
    sources: REMITTANCE_SOURCES.map((source) => ({ href: source.href, label: es ? source.es : source.en })),
  };
}
