export function cardReferenceLabel(row, language = 'es') {
  const es = language !== 'en';
  const source = String(row?.source || '').toLowerCase();
  if (source.includes('wise')) return es
    ? 'Referencia estimada de Wise; no es una cotización confirmada de Visa, Mastercard o tu banco. Ingresá tu tasa si la conocés.'
    : 'Estimated Wise reference; not a confirmed Visa, Mastercard or issuer quote. Enter your own rate if known.';
  return es
    ? `Referencia de tarjeta estimada${row?.source ? ` · fuente: ${row.source}` : ' · fuente no identificada'}. Confirmá la tasa de tu emisor.`
    : `Estimated card reference${row?.source ? ` · source: ${row.source}` : ' · source unidentified'}. Confirm your issuer’s rate.`;
}
