const { createClient } = require('@supabase/supabase-js');

function client() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');
  return createClient(url, key);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = client();
    const { data, error } = await supabase
      .from('news')
      .select('id, title, url, summary, published_at, source')
      .order('published_at', { ascending: false })
      .limit(40);

    if (error) throw error;

    const items = (data || [])
      .map((n) => {
        const link = n.url || `https://boliviablue.com/noticias`;
        const date = n.published_at ? new Date(n.published_at).toUTCString() : new Date().toUTCString();
        return `    <item>
      <title>${esc(n.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(n.id)}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(n.summary || n.title)}</description>
      <source url="https://boliviablue.com/noticias">${esc(n.source || 'Bolivia Blue')}</source>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bolivia Blue — Noticias</title>
    <link>https://boliviablue.com/noticias</link>
    <description>Noticias económicas de Bolivia con sentimiento sobre el dólar</description>
    <language>es-bo</language>
${items}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(500).send(`<!-- RSS error: ${esc(err.message)} -->`);
  }
};
