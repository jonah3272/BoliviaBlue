import { getSupabase, cors } from '../_lib/supabase.js';

export default async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = getSupabase();
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
    return res.status(500).json({ ok: false, error: err.message });
  }
}
