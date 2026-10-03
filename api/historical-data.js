const { createClient } = require('@supabase/supabase-js');

const { exportOptions, fetchHistoricalExport, toCsv } = require('./_lib/historicalExport');

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env on Vercel');
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const options = exportOptions(req.query);
    const result = await fetchHistoricalExport(client(), options);
    const { metadata } = result;
    const coverageHeaders = {
      'X-Data-Range': result.range,
      'X-Data-Rows': String(result.count),
      'X-Data-Limit': String(metadata.limit),
      'X-Data-Truncated': String(metadata.truncated),
      'X-Data-Start': metadata.returned_start || '',
      'X-Data-End': metadata.returned_end || '',
      'X-Data-Provenance': metadata.source_provenance,
    };
    for (const [key, value] of Object.entries(coverageHeaders)) res.setHeader(key, value);
    res.setHeader('Access-Control-Expose-Headers', Object.keys(coverageHeaders).join(', '));
    const wantJson = req.query.format === 'json' || (req.url && req.url.includes('.json'));

    if (wantJson) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json(result);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.status(200).send(toCsv(result.points));
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.statusCode === 400 ? 'Invalid export request' : 'Internal server error', message: err.message });
  }
};
