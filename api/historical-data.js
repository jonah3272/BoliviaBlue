const { createClient } = require('@supabase/supabase-js');

const RANGE_MS = {
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000
};
const ANON_MAX_ROWS = 4000;
const INTERP_GAP_START = Date.parse('2026-06-30T19:27:00.000Z');
const INTERP_GAP_END = Date.parse('2026-07-31T13:45:00.000Z');

function stripInterpolatedGapRates(rows) {
  return (rows || []).filter((r) => {
    const ms = Date.parse(r.t);
    if (!Number.isFinite(ms) || ms < INTERP_GAP_START || ms >= INTERP_GAP_END) return true;
    return new Date(r.t).getUTCMilliseconds() !== 350;
  });
}

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env on Vercel');
  return createClient(url, key);
}

async function fetchRates(supabase, range) {
  if (range === 'all') {
    const { data, error } = await supabase
      .from('rates')
      .select('t,buy,sell,mid,official_buy,official_sell,official_mid')
      .order('t', { ascending: false })
      .limit(ANON_MAX_ROWS);
    if (error) throw error;
    return stripInterpolatedGapRates((data || []).reverse());
  }
  const ms = RANGE_MS[range] || RANGE_MS['30d'];
  const start = new Date(Date.now() - ms).toISOString();
  const { data, error } = await supabase
    .from('rates')
    .select('t,buy,sell,mid,official_buy,official_sell,official_mid')
    .gte('t', start)
    .order('t', { ascending: true })
    .limit(ANON_MAX_ROWS);
  if (error) throw error;
  return stripInterpolatedGapRates(data || []);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const range = String(req.query.range || '30d').toLowerCase();
    const effectiveRange = range === '90d' || range === '1y' ? '30d' : range;
    const rows = await fetchRates(client(), effectiveRange);
    const wantJson = req.query.format === 'json' || (req.url && req.url.includes('.json'));

    if (wantJson) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).json({ range: effectiveRange, count: rows.length, points: rows });
    }

    const header = 't,buy,sell,mid,official_buy,official_sell,official_mid\n';
    const body = rows
      .map(
        (r) =>
          `${r.t},${r.buy},${r.sell},${r.mid ?? ''},${r.official_buy ?? ''},${r.official_sell ?? ''},${r.official_mid ?? ''}`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.status(200).send(header + body + '\n');
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
