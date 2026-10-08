/** Evergreen editorial copy shared by the initial HTML and mounted main page. */
export function rateReadingGuide(language = 'es') {
  return language === 'en' ? {
    heading: 'How to read Bolivia’s blue dollar reference',
    items: [
      ['What is measured?', 'Bolivia Blue follows P2P USDT/BOB references. USDT is used as a proxy for the US dollar, but a P2P crypto quote is not a physical-dollar, bank or BCB quote.'],
      ['How is the reference calculated?', 'The current collector takes available platform quotes and calculates the median separately for buy and sell. Coverage can change between observations. The source breakdown shows only contributions saved with that exact record.'],
      ['How should I compare or cite it?', 'Keep the observation time and the quote unit. Confirm the trade direction, payment method, fees and availability with the venue before acting. Historical records without source details cannot establish a same-method market trend.'],
    ],
  } : {
    heading: 'Cómo leer el dólar blue en Bolivia',
    items: [
      ['¿Qué se mide?', 'Bolivia Blue sigue referencias P2P USDT/BOB. USDT se usa como referencia del dólar estadounidense, pero una cotización cripto P2P no es una cotización de dólares físicos, bancaria ni del BCB.'],
      ['¿Cómo se calcula la referencia?', 'El recolector actual toma las referencias disponibles por plataforma y calcula la mediana por separado para compra y venta. La cobertura puede cambiar entre lecturas. El desglose muestra solo los aportes guardados con ese registro exacto.'],
      ['¿Cómo comparar o citar?', 'Conservá la hora de observación y la unidad de cotización. Confirmá el sentido de la operación, método de pago, costos y disponibilidad en la plataforma antes de operar. Los registros históricos sin fuentes no acreditan una tendencia de mercado con metodología comparable.'],
    ],
  };
}
