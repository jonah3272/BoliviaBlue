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
      .from('blog_articles')
      .select('slug, title, excerpt, published_at, language')
      .eq('language', 'es')
      .order('published_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const items = (data || [])
      .map((a) => {
        const link = `https://boliviablue.com/blog/${a.slug}`;
        const date = a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString();
        return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(a.excerpt || a.title)}</description>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bolivia Blue — Blog</title>
    <link>https://boliviablue.com/blog</link>
    <description>Análisis diario del dólar blue y mercado paralelo en Bolivia</description>
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
