const { createClient } = require('@supabase/supabase-js');
const { renderBadgeSvg } = require('./_lib/badgeSvg');

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end('Method not allowed');

  let buy = null;
  let sell = null;
  try {
    const supabase = client();
    const { data } = await supabase
      .from('rates')
      .select('buy,sell')
      .order('t', { ascending: false })
      .limit(1)
      .maybeSingle();
    buy = data?.buy ?? null;
    sell = data?.sell ?? null;
  } catch {
    /* fall through to dashes */
  }

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  return res.status(200).send(renderBadgeSvg(buy, sell));
};
