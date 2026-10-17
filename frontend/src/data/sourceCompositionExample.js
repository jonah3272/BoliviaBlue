// Fixed historical example, never a live quote. The exact source rows are preserved
// in the dated public JSON; tests keep these display values aligned with that file.
export const SOURCE_COMPOSITION_ANCHOR = 'ejemplo-composicion-fuentes';
export const SOURCE_COMPOSITION_JSON = '/data/examples/2026-10-08-source-composition.json';
const BASE = 'https://www.boliviablue.com';
const COPY = {
  es: {
    title: 'Qué cambia cuando una referencia P2P pasa de tres fuentes a dos',
    date: 'Observaciones del 8 de octubre de 2026 · Bolivia (UTC−04:00)',
    summary: '11,88 → 11,82 BOB por USDT: −0,49% en la referencia registrada de venta.',
    explanation: 'Los valores de venta guardados de Binance y El Dorado no cambiaron. Bybit figuraba en el primer registro y no en el segundo. Aplicar la mediana a cada conjunto registrado reproduce todo el cambio.',
    caption: 'Campo «venta» del recolector, en BOB por USDT. Valores a cuatro decimales; horarios de observación en Bolivia.',
    source: 'Fuente / resultado', missing: 'No registrado', count: 'Fuentes registradas', aggregate: 'Mediana (venta)',
    calculationHeading: 'El cálculo, paso a paso',
    formulas: [
      '15:14:34.043 · mediana(11,7630; 11,8800; 11,8940) = 11,8800',
      '15:36:24.631 · mediana(11,7630; 11,8800) = (11,7630 + 11,8800) / 2 = 11,8215',
      'Cambio: 11,8215 − 11,8800 = −0,0585 BOB por USDT',
      'Cambio porcentual: (−0,0585 / 11,8800) × 100 = −0,492424…% (−0,49% redondeado)',
    ],
    caveat: 'Este es un efecto aritmético de la composición de fuentes registrada. No demuestra una caída del mercado ni del dólar en efectivo, una interrupción de Bybit o su precio posterior. El valor ausente no se arrastra ni se reemplaza por cero.',
    evidenceHeading: 'Datos y límites para reproducirlo',
    evidence: 'Dos filas preservadas del JSON público generado el 10 de octubre de 2026 a las 03:22:42.408 UTC. El archivo descargable conserva sus campos y valores originales; la tabla solo presenta venta, con cuatro decimales. No es la descarga completa del historial. Ese JSON no contiene official_observation: sus campos official_* no acreditan origen BCB y no se usan en este cálculo P2P.',
    coverage: 'En esa captura, 124 registros tenían desglose de fuentes: 38 h 47 min de cobertura. Este ejemplo no acredita una tendencia semanal. Los horarios son del recolector, no de la última modificación de cada anuncio.',
    limitations: 'Son entradas guardadas por BoliviaBlue, no una auditoría independiente de las plataformas. Las referencias no son ofertas ejecutables comparables por monto, pago, comisiones o contraparte.',
    download: 'Descargar las dos observaciones originales (JSON)',
    citationLabel: 'Cita sugerida', copy: 'Copiar cita', copied: 'Cita copiada.',
    copyFailed: 'No se pudo copiar. Seleccioná la cita que aparece arriba y copiala manualmente.',
    citation: 'BoliviaBlue. «Qué cambia cuando una referencia P2P pasa de tres fuentes a dos». Observaciones: 8 de octubre de 2026, 15:14:34.043 y 15:36:24.631 (Bolivia, UTC−04:00). Campo venta, BOB por USDT; ejemplo de composición de fuentes, no una caída del mercado.',
    pressLabel: 'Ejemplo reproducible: de tres fuentes P2P a dos',
    pressDescription: 'Dos observaciones del 8 de octubre de 2026 muestran por qué hay que citar las fuentes además del número. Incluye el cálculo y el JSON original.',
  },
  en: {
    title: 'What changes when a P2P reference goes from three sources to two',
    date: 'Observations from October 8, 2026 · Bolivia (UTC−04:00)',
    summary: '11.88 → 11.82 BOB per USDT: −0.49% in the recorded sell reference.',
    explanation: 'The stored sell inputs from Binance and El Dorado did not change. Bybit appeared in the first record and not in the second. Applying the median to each recorded set reproduces the entire change.',
    caption: 'Collector sell field, in BOB per USDT. Values shown to four decimals; observation times in Bolivia.',
    source: 'Source / result', missing: 'Not recorded', count: 'Recorded sources', aggregate: 'Median (sell)',
    calculationHeading: 'The calculation, step by step',
    formulas: [
      '15:14:34.043 · median(11.7630, 11.8800, 11.8940) = 11.8800',
      '15:36:24.631 · median(11.7630, 11.8800) = (11.7630 + 11.8800) / 2 = 11.8215',
      'Change: 11.8215 − 11.8800 = −0.0585 BOB per USDT',
      'Percentage change: (−0.0585 / 11.8800) × 100 = −0.492424…% (−0.49% rounded)',
    ],
    caveat: 'This is an arithmetic effect of the recorded source composition. It does not establish a market-wide or cash-dollar decline, a Bybit outage or its later price. The missing value is neither carried forward nor replaced with zero.',
    evidenceHeading: 'Data and limits for reproduction',
    evidence: 'Two rows preserved from the public JSON generated on October 10, 2026 at 03:22:42.408 UTC. The download retains their original fields and values; the table displays only sell, to four decimals. This is not the full history export. That JSON contains no official_observation: its official_* fields do not establish BCB provenance and are not used in this P2P calculation.',
    coverage: 'In that capture, 124 records included source breakdowns, covering 38 h 47 min. This example does not establish a weekly trend. Timestamps belong to the collector, not to each advertisement’s last update.',
    limitations: 'These are inputs recorded by BoliviaBlue, not an independent platform audit. The references are not executable offers comparable by amount, payment method, fees or counterparty.',
    download: 'Download the two original observations (JSON)',
    citationLabel: 'Suggested citation', copy: 'Copy citation', copied: 'Citation copied.',
    copyFailed: 'Could not copy. Select the citation above and copy it manually.',
    citation: 'BoliviaBlue. “What changes when a P2P reference goes from three sources to two.” Observations: October 8, 2026, 15:14:34.043 and 15:36:24.631 (Bolivia, UTC−04:00). Sell field, BOB per USDT; a source-composition example, not a market decline.',
    pressLabel: 'Reproducible example: from three P2P sources to two',
    pressDescription: 'Two observations from October 8, 2026 show why a citation needs the sources as well as the number. Includes the calculation and original JSON.',
  },
};

export function getSourceCompositionExample(language = 'es') {
  const en = language === 'en';
  const copy = COPY[en ? 'en' : 'es'];
  const path = `/fuente-de-datos${en ? '?lang=en' : ''}#${SOURCE_COMPOSITION_ANCHOR}`;
  const format = (value) => en ? value : value.replace('.', ',');
  return {
    ...copy, id: SOURCE_COMPOSITION_ANCHOR, path, url: BASE + path,
    jsonUrl: SOURCE_COMPOSITION_JSON,
    citation: `${copy.citation} ${BASE + path}`,
    times: [
      { iso: '2026-10-08T15:14:34.043-04:00', label: '15:14:34.043' },
      { iso: '2026-10-08T15:36:24.631-04:00', label: '15:36:24.631' },
    ],
    rows: [
      { label: 'Binance', values: ['11.8800', '11.8800'].map(format) },
      { label: 'El Dorado', values: ['11.7630', '11.7630'].map(format) },
      { label: 'Bybit', values: [format('11.8940'), copy.missing] },
      { label: copy.count, values: ['3', '2'] },
      { label: copy.aggregate, values: ['11.8800', '11.8215'].map(format) },
    ],
  };
}
