const crypto = require('crypto');
const { getSupabase, cors } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { email, language = 'es', source = 'homepage' } = body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email', message: 'Email is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email', message: 'Please provide a valid email address' });
    }

    const supabase = getSupabase();
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
      return res.status(409).json({
        error: 'Already subscribed',
        message: 'This email is already subscribed to the newsletter'
      });
    }
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
