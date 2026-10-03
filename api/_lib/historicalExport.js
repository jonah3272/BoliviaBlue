const MAX_ROWS = 4000;
const PAGE_SIZE = 1000;
const COLUMNS = 't,buy,sell,mid,official_buy,official_sell,official_mid';
const GAP_START = Date.parse('2026-06-30T19:27:00.000Z');
const GAP_END = Date.parse('2026-07-31T13:45:00.000Z');

function isObservedRow(row) {
  const ms = Date.parse(row.t);
  return !Number.isFinite(ms) || ms < GAP_START || ms >= GAP_END || new Date(row.t).getUTCMilliseconds() !== 350;
}

function exportOptions(query = {}, now = new Date()) {
  const range = String(query.range || '30d').toLowerCase();
  if (!['30d', 'all'].includes(range)) {
    const error = new Error('Unsupported range. Use 30d or all (up to 4000 rows). Extended exports are not available on this endpoint.');
    error.statusCode = 400;
    throw error;
  }
  const requestedLimit = query.limit === undefined ? MAX_ROWS : Number(query.limit);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    const error = new Error('limit must be a positive integer (maximum 4000).');
    error.statusCode = 400;
    throw error;
  }
  return {
    range, limit: Math.min(requestedLimit, MAX_ROWS),
    requested_start: range === '30d' ? new Date(now.getTime() - 30 * 86400000).toISOString() : null,
    requested_end: now.toISOString(),
  };
}

async function fetchHistoricalExport(supabase, options) {
  const collected = [];
  let offset = 0;
  while (collected.length <= options.limit) {
    let query = supabase.from('rates').select(COLUMNS)
      .lte('t', options.requested_end).order('t', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (options.requested_start) query = query.gte('t', options.requested_start);
    const { data, error } = await query;
    if (error) throw error;
    const page = data || [];
    collected.push(...page.filter(isObservedRow));
    if (page.length < PAGE_SIZE) break;
    offset += page.length;
  }
  const truncated = collected.length > options.limit;
  const points = collected.slice(0, options.limit).reverse();
  return {
    range: options.range, count: points.length, points,
    metadata: {
      range_requested: options.range,
      requested_start: options.requested_start, requested_end: options.requested_end,
      returned_start: points[0]?.t || null, returned_end: points.at(-1)?.t || null,
      rows_returned: points.length, limit: options.limit, truncated,
      selection: 'most_recent', order: 'ascending',
      source: 'Bolivia Blue stored rate observations',
      source_provenance: 'unavailable_for_historical_rows',
      excluded_interpolated_gap: true,
      attribution: 'https://www.boliviablue.com/fuente-de-datos',
      generated_at: options.requested_end,
    },
  };
}

function toCsv(points) {
  return COLUMNS + '\n' + points.map((r) => COLUMNS.split(',').map((key) => r[key] ?? '').join(',')).join('\n') + '\n';
}

module.exports = { MAX_ROWS, PAGE_SIZE, exportOptions, fetchHistoricalExport, toCsv, isObservedRow };
