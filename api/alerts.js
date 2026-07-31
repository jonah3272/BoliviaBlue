const { createClient } = require('@supabase/supabase-js');

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
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  if (origin) res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { email, alert_type, threshold, direction, source = 'homepage' } = body;

    if (!email || !alert_type || threshold == null || !direction) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, alert_type, threshold, and direction are required'
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (!['buy', 'sell', 'both'].includes(alert_type) || !['above', 'below'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid alert_type or direction' });
    }
    const thr = parseFloat(threshold);
    if (!Number.isFinite(thr) || thr <= 0) return res.status(400).json({ error: 'Invalid threshold' });

    const supabase = client();
    const ip =
      (req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
      req.headers['x-real-ip'] ||
      null;

    const { data, error } = await supabase
      .from('rate_alerts')
      .insert({
        email,
        alert_type,
        threshold: thr,
        direction,
        is_active: true,
        ip_address: ip,
        user_agent: req.headers['user-agent'] || null,
        referrer: req.headers.referer || req.headers.referrer || null,
        source
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Alert created successfully',
      alert: {
        id: data.id,
        email: data.email,
        alert_type: data.alert_type,
        threshold: data.threshold,
        direction: data.direction
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
