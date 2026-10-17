import { getDataDocumentationPage } from './dataDocumentation.js';

// Existing examples are illustrative partial responses, never live observations.
function getEndpoints(language) {
  // Document the deployed public API contract. The optional backend has separate routes.
  return [
    {
      method: 'GET', path: '/api/blue-rate',
      description: language === 'es' ? 'Cotización actual USD/BOB. La composición de fuentes puede no estar registrada para la fila guardada.' : 'Current USD/BOB quote. Source composition may be unavailable for the stored row.',
      parameters: [],
      response: { buy_bob_per_usd: 'number', sell_bob_per_usd: 'number', updated_at_iso: 'ISO 8601 observation time', generated_at_iso: 'ISO 8601 response generation time', is_stale: 'boolean', sources_used: 'array (empty when provenance is unknown)', source_count: 'number', source_provenance: 'persisted_observation | unavailable_for_stored_row', source_observation: 'validated snapshot or null', quote_kind: 'usdt_p2p_median', official_buy: 'number or null', official_sell: 'number or null', official_mid: 'number or null', official_observation: 'validated BCB evidence or an empty unavailable/unverified record; fields: version, status, source, source_url, source_date, observed_at, buy, sell, mid', official_status: 'verified | stale | unavailable | unverified', official_source: 'bcb or null', official_source_date: 'BCB board YYYY-MM-DD or null', official_observed_at: 'original BCB retrieval ISO 8601 or null' },
      example: { url: 'https://www.boliviablue.com/api/blue-rate', response: { buy_bob_per_usd: 12.34, sell_bob_per_usd: 12.56, updated_at_iso: '2026-10-03T12:00:00Z', is_stale: false, sources_used: [], source_provenance: 'unavailable_for_stored_row' } },
    },
    ...['csv', 'json'].map((format) => ({
      method: 'GET', path: `/api/historical-data.${format}`,
      description: language === 'es'
        ? 'Hasta 4.000 observaciones recientes, ordenadas por fecha ascendente. 30d limita el período; all selecciona las últimas filas disponibles, no todo el archivo. 90d y 1y devuelven 400. No se requiere token para estas muestras públicas.'
        : 'Up to 4,000 recent observations in ascending date order. 30d limits the period; all selects the latest available rows, not the entire archive. 90d and 1y return 400. These public samples do not require a token.',
      parameters: [
        { name: 'range', type: 'string', required: false, options: ['30d', 'all'], description: 'Default: 30d' },
        { name: 'limit', type: 'integer', required: false, description: '1–4000; default 4000. Larger values are capped at 4000.' },
      ],
      response: format === 'csv'
        ? 'CSV columns: t,buy,sell,mid,official_buy,official_sell,official_mid. Coverage headers: X-Data-Range, X-Data-Rows, X-Data-Limit, X-Data-Truncated, X-Data-Start, X-Data-End, X-Data-Provenance. Official provenance header: X-Official-Provenance: legacy-values-unverified; per-row-status-in-json. Legacy official values have unverified provenance; use JSON for per-row official_status and official_observation.'
        : 'JSON: { range, count, points: [{ t, buy, sell, mid, official_buy, official_sell, official_mid, official_observation, official_status, official_source, official_source_date, official_observed_at, source, sources_used, source_count, source_provenance, source_observation, quote_kind }], metadata: { range_requested, requested_start, requested_end, returned_start, returned_end, rows_returned, limit, truncated, selection, order, source, source_provenance, provenance_rows_recorded, provenance_rows_unavailable, csv_provenance, official_provenance, excluded_interpolated_gap, attribution, generated_at } }',
      example: { url: `https://www.boliviablue.com/api/historical-data.${format}?range=30d`, response: format === 'csv' ? { note: 'Read HTTP coverage headers before citing a time span.' } : { range: '30d', count: 1, points: [{ t: '2026-10-03T12:00:00Z', buy: 12.34, sell: 12.56, mid: 12.45 }], metadata: { returned_start: '2026-10-03T12:00:00Z', returned_end: '2026-10-03T12:00:00Z', rows_returned: 1, limit: 4000, truncated: false, source_provenance: 'unavailable_for_historical_rows' } } },
    })),
    {
      method: 'GET', path: '/api/health',
      description: language === 'es' ? 'Estado del archivo y fecha de la última observación.' : 'Archive status and latest observation time.',
      parameters: [], response: { ok: 'boolean', updated_at_iso: 'ISO 8601 or null', history_points: 'number', host: 'vercel' },
      example: { url: 'https://www.boliviablue.com/api/health', response: { ok: true, updated_at_iso: '2026-10-03T12:00:00Z', history_points: 29250, host: 'vercel' } },
    },
  ];

}

export function getApiDocumentation(language = 'es') {
  const es = language !== 'en';
  language = es ? 'es' : 'en';
  const methodology = getDataDocumentationPage('/fuente-de-datos', language).copy;
  const copy = {
    title: es ? 'API del Dólar Blue Bolivia | Documentación Completa' : 'Bolivia Blue Dollar API | Complete Documentation',
    heading: es ? 'API del Dólar Blue Bolivia' : 'Bolivia Blue Dollar API',
    description: es
      ? 'Documentación de la API pública del dólar blue en Bolivia: cotización actual, observaciones históricas y estado del archivo. Unidades, fechas, fuentes y límites de cobertura.'
      : 'Public Bolivia blue dollar API documentation: current quote, historical observations and archive status. Units, timestamps, sources and coverage limits.',
    introduction: es
      ? 'API REST gratuita para acceder a observaciones del dólar blue en Bolivia. Muestras públicas sin autenticación; revisá la fecha de cada observación.'
      : 'Free REST API for Bolivia blue dollar observations. Public samples need no authentication; check each observation timestamp.',
    interpretationHeading: es ? 'Unidades, fechas y fuentes' : 'Units, timestamps and sources',
    units: es
      ? 'Los campos buy_bob_per_usd y sell_bob_per_usd, y buy, sell y mid del histórico, expresan BOB por USD de referencia. La fuente es el mercado P2P USDT/BOB; no es una oferta de efectivo ni garantiza la paridad USDT/USD. Los campos official_buy, official_sell y official_mid son una comparación separada en BOB por USD. En la cotización actual, solo se publican valores con official_observation verificada; unavailable o unverified devuelve null. official_status stale conserva el último BCB verificado, con official_source_date y official_observed_at originales.'
      : 'buy_bob_per_usd and sell_bob_per_usd, and historical buy, sell and mid, express BOB per reference USD. The source is the USDT/BOB P2P market; this is not a cash offer or a guarantee of USDT/USD parity. official_buy, official_sell and official_mid are a separate comparison in BOB per USD. Current quotes only publish values backed by verified official_observation; unavailable or unverified returns null. An official_status of stale retains the last verified BCB, with its original official_source_date and official_observed_at.',
    timestamps: es
      ? 'updated_at_iso es la fecha de la observación; en los puntos históricos se llama t. generated_at_iso y metadata.generated_at indican cuándo se generó la respuesta o exportación, no una nueva observación. Revisá is_stale y la fecha de la lectura: las actualizaciones pueden retrasarse.'
      : 'updated_at_iso is the observation timestamp; historical points use t. generated_at_iso and metadata.generated_at indicate response or export generation time, not a new observation. Check is_stale and the observation time: updates can be delayed.',
    provenance: methodology.provenanceDescription,
    validity: es
      ? 'source_provenance: persisted_observation identifica un source_observation válido: versión, método, activos y fuentes son válidos, y la fecha y las medianas coinciden con la fila guardada. Si no es válido o falta, source_observation es null y sources_used está vacío; no infieras plataformas participantes.'
      : 'source_provenance: persisted_observation identifies a valid source_observation: its version, method, assets and sources are valid, and its timestamp and medians match the stored row. If it is invalid or missing, source_observation is null and sources_used is empty; do not infer participating platforms.',
    coverage: methodology.coverageDescription,
    historicalProvenance: es
      ? 'En JSON, cada punto incluye su procedencia. metadata.source_provenance puede ser persisted_observation, unavailable_for_historical_rows o mixed; provenance_rows_recorded y provenance_rows_unavailable cuentan las filas de cada grupo. CSV conserva sus siete columnas y no incluye snapshots de fuentes; usá JSON para la procedencia por fila. Los campos official_* históricos conservan los valores guardados, incluidos registros antiguos de fuente no verificada; no los atribuyas al BCB sin validar official_observation y official_status. metadata.official_provenance es per_row_in_json; legacy_values_unverified. En el histórico, stale conserva evidencia BCB validada: indica antigüedad al generar la exportación o un fallback ya marcado stale, no ausencia de procedencia. Para citarla, usá official_source_date y official_observed_at, no la fecha P2P t.'
      : 'In JSON, each point includes its provenance. metadata.source_provenance can be persisted_observation, unavailable_for_historical_rows or mixed; provenance_rows_recorded and provenance_rows_unavailable count each group. CSV retains its seven columns and does not include source snapshots; use JSON for per-row provenance. Historical official_* fields retain stored values, including legacy records of unverified source; do not attribute them to the BCB without checking official_observation and official_status. metadata.official_provenance is per_row_in_json; legacy_values_unverified. In historical data, stale retains validated BCB evidence: it reflects age at export generation or a fallback already marked stale, not missing provenance. Cite official_source_date and official_observed_at rather than the P2P timestamp t.',
    endpointsHeading: es ? 'Endpoints Disponibles' : 'Available Endpoints',
    parametersHeading: es ? 'Parámetros' : 'Parameters',
    fieldsHeading: es ? 'Campos de respuesta documentados' : 'Documented response fields',
    exampleNotice: es
      ? 'Ejemplos ilustrativos y parciales de formato. Los valores y fechas de ejemplo no son cotizaciones actuales ni prueban cobertura del archivo.'
      : 'Illustrative partial format examples. Example values and timestamps are not current quotes or evidence of archive coverage.',
    limitsHeading: es ? 'Cobertura y límites' : 'Coverage and limits',
    additionalAccess: es
      ? 'La API pública y sus muestras siguen disponibles sin registro. Las descargas ampliadas automáticas del servicio separado no están disponibles aquí; cualquier cobertura o acceso adicional requiere revisión manual.'
      : 'The public API and its samples remain available without signup. Automatic extended downloads from the separate service are unavailable here; any additional coverage or access requires manual review.',
    linksHeading: es ? 'Enlaces relacionados' : 'Related links',
    home: es ? 'Inicio' : 'Home',
    history: es ? 'Datos históricos' : 'Historical data',
    methodology: es ? 'Fuente de datos y metodología' : 'Data source and methodology',
    contact: es ? 'Preparar una consulta de datos' : 'Prepare a data inquiry',
    press: es ? 'Prensa' : 'Press',
    today: es ? 'Dólar blue hoy' : 'Blue dollar today',
  };
  const canonical = 'https://www.boliviablue.com/api-docs' + (es ? '' : '?lang=en');
  const local = (path) => {
    const [base, hash] = path.split('#');
    return base + (es ? '' : '?lang=en') + (hash ? '#' + hash : '');
  };
  return {
    es, language, copy, canonical, local,
    endpoints: getEndpoints(language),
    notes: [copy.units, copy.timestamps, copy.provenance, copy.validity, copy.historicalProvenance, copy.coverage],
    apiSchema: {
      '@context': 'https://schema.org', '@type': 'APIReference', name: copy.heading,
      description: copy.description, url: canonical, documentation: canonical,
      provider: { '@type': 'Organization', name: 'Bolivia Blue', url: 'https://www.boliviablue.com' },
      termsOfService: 'https://boliviablue.com/politica-de-privacidad',
    },
  };
}
