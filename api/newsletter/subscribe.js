const crypto = require('crypto');
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
    const { email, language = 'es', source = 'homepage' } = body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const supabase = client();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          language,
          source,
          verification_token: verificationToken,
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select()
      .single();
    if (error) throw error;

    return res.status(200).json({
      success: true,
      message:
        language === 'es'
          ? '¡Suscripción exitosa! Revisa tu correo para confirmar.'
          : 'Subscription successful! Check your email to confirm.',
      subscription: { email: data.email, language: data.language }
    });
  } catch (err) {
    if (/duplicate|unique/i.test(err.message || '')) {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
