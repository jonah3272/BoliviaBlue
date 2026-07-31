module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    ok: true,
    host: 'vercel',
    hasUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    hasKey: Boolean(
      process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY
    ),
    time: new Date().toISOString()
  });
};
