const { createClient } = require('@supabase/supabase-js');

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    const err = new Error(
      'Missing Supabase env on Vercel. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SERVICE_KEY).'
    );
    err.statusCode = 500;
    throw err;
  }
  return createClient(url, key);
}

function cors(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );
}

module.exports = async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = client();
    const { count, error } = await supabase
      .from('rates')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;

    const { data: latest } = await supabase
      .from('rates')
      .select('t')
      .order('t', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.status(200).json({
      ok: true,
      updated_at_iso: latest?.t || null,
      history_points: count || 0,
      host: 'vercel'
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, error: err.message });
  }
};
