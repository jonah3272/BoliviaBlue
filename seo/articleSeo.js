import { articlesEs, articlesEn } from '../frontend/src/data/blogArticles.js';
import { newsArticlePath, newsIdFromSlugParam } from '../frontend/src/utils/newsSlug.js';

const BASE = 'https://www.boliviablue.com';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const plain = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export function articleRequest(path, search = '') {
  const match = path.match(/^\/(blog|noticias)\/([^/]+)$/);
  if (!match || match[2] === 'rss.xml') return null;
  return { kind: match[1], slug: decodeURIComponent(match[2]), language: new URLSearchParams(search).get('lang') === 'en' ? 'en' : 'es' };
}

/** Read only the published content fields already exposed by the public SPA. */
export async function loadArticle(request, { fetcher = fetch, env = process.env } = {}) {
  const { kind, slug } = request;
  const language = kind === 'noticias' ? 'es' : request.language;
  const fallback = kind === 'blog' ? (language === 'es' ? articlesEs : articlesEn).find((a) => a.slug === slug) : null;
  const id = kind === 'noticias' ? newsIdFromSlugParam(slug) : null;
  if (kind === 'noticias' && !id) return { status: 404, language };
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  let unavailable = !url || !key;
  let article = null;
  if (!unavailable) {
    try {
      const endpoint = new URL(`/rest/v1/${kind === 'blog' ? 'blog_articles' : 'news'}`, url);
      endpoint.searchParams.set('select', kind === 'blog' ? 'slug,title,excerpt,published_at,created_at,author,language' : 'id,title,summary,published_at,source,url');
      endpoint.searchParams.set(kind === 'blog' ? 'slug' : 'id', `eq.${kind === 'blog' ? slug : id}`);
      endpoint.searchParams.set(kind === 'blog' ? 'language' : 'type', `eq.${kind === 'blog' ? language : 'article'}`);
      endpoint.searchParams.set('limit', '1');
      const response = await fetcher(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
      if (!response.ok) throw new Error('Content lookup unavailable');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Invalid content response');
      article = rows[0] || null;
    } catch { unavailable = true; }
  }
  article ||= fallback;
  if (!article) return { status: unavailable ? 503 : 404, language };
  const path = kind === 'blog' ? `/blog/${article.slug}` : newsArticlePath(article);
  return {
    status: 200, language, kind, path,
    canonical: BASE + path + (kind === 'blog' && language === 'en' ? '?lang=en' : ''),
    title: plain(article.title), description: plain(article.excerpt || article.summary || article.title),
    published: article.published_at || article.created_at || article.date,
    author: article.author || article.source || 'Bolivia Blue',
  };
}

export function renderArticleHtml(html, article, request) {
  const es = article.language !== 'en';
  const found = article.status === 200;
  const unavailable = article.status === 503;
  const title = found ? article.title : unavailable ? (es ? 'Artículo temporalmente no disponible' : 'Article temporarily unavailable') : (es ? 'Artículo no encontrado' : 'Article not found');
  const description = found ? article.description : title;
  const canonical = article.canonical || BASE + `/${request.kind}/${encodeURIComponent(request.slug)}` + (request.kind === 'blog' && request.language === 'en' ? '?lang=en' : '');
  // Remove only SEO-owned tags; scripts, assets, security and other head settings stay intact.
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${es ? 'es' : 'en'}"`);
  const displayTitle = `${title} | ${request.kind === 'blog' ? 'Blog' : es ? 'Noticias' : 'News'} – Bolivia Blue`;
  const tags = [
    `<title>${esc(displayTitle)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['title', displayTitle], ['description', description], ['robots', found ? 'index, follow' : 'noindex, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', displayTitle], ['twitter:description', description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, value]) => `<meta name="${name}" content="${esc(value)}" data-rh="true" />`),
    ...[['og:type', found ? 'article' : 'website'], ['og:url', canonical], ['og:title', displayTitle], ['og:description', description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([name, value]) => `<meta property="${name}" content="${esc(value)}" data-rh="true" />`),
  ];
  if (found) {
    const schema = { '@context': 'https://schema.org', '@type': request.kind === 'blog' ? 'BlogPosting' : 'NewsArticle', headline: title, description, url: canonical, mainEntityOfPage: canonical, inLanguage: es ? 'es-BO' : 'en-US', datePublished: article.published, author: { '@type': 'Organization', name: article.author }, publisher: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE } };
    tags.push(`<script type="application/ld+json" data-rh="true">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
  }
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  const shell = `<main data-seo-shell="article" class="max-w-3xl mx-auto px-4 py-8"><h1>${esc(title)}</h1><p>${esc(description)}</p><a href="/${request.kind}">${es ? 'Volver' : 'Back'}</a></main>`;
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
