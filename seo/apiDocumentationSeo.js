import { getApiDocumentation } from '../frontend/src/data/apiDocumentation.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const paragraph = (value) => `<p class="break-words">${esc(value)}</p>`;
const link = (href, label) => `<a class="text-blue-600 dark:text-blue-400 underline" href="${esc(href)}">${esc(label)}</a>`;
const section = (heading, body) => `<section class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4"><h2 class="text-2xl font-bold">${esc(heading)}</h2>${body}</section>`;

export function apiDocumentationPageForSearch(search = '') {
  const language = new URLSearchParams(sanitizeLangSearch(search)).get('lang') === 'en' ? 'en' : 'es';
  return getApiDocumentation(language);
}

/** Editorial reference only: no live quote, archive, or backend requests. */
export function renderApiDocumentationHtml(html, search = '') {
  const rootPattern = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  if (!/<html\b/i.test(html) || !/<\/head>/i.test(html) || !rootPattern.test(html)) throw new Error('API documentation shell is invalid');
  const page = apiDocumentationPageForSearch(search);
  const { copy: c, language, es, canonical, local } = page;
  const endpoints = page.endpoints.map((endpoint) => `<article class="min-w-0 space-y-4">
<h3 class="font-semibold break-all">${endpoint.method} ${esc(endpoint.path)}</h3>
${paragraph(endpoint.description)}
${endpoint.parameters.length ? `<h4 class="font-semibold">${esc(c.parametersHeading)}</h4><ul class="list-disc pl-5 space-y-2">${endpoint.parameters.map((param) => `<li><code>${esc(param.name)}</code> (${esc(param.type)}): ${esc(param.description)}${param.options ? ` (${param.options.map(esc).join(', ')})` : ''}</li>`).join('')}</ul>` : ''}
<h4 class="font-semibold">${esc(c.fieldsHeading)}</h4>
<pre class="whitespace-pre-wrap break-words rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm font-mono">${esc(typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2))}</pre>
<p class="break-all">${link(endpoint.example.url, endpoint.example.url)}</p>
</article>`).join('');
  const shell = `<main data-seo-shell="api-docs" class="max-w-5xl mx-auto px-4 py-8 space-y-8 text-gray-900 dark:text-white">
<header class="space-y-4"><h1 class="text-3xl sm:text-4xl font-bold">${esc(c.heading)}</h1>${paragraph(c.introduction)}</header>
${section(c.interpretationHeading, page.notes.map(paragraph).join(''))}
${section(c.endpointsHeading, endpoints)}
${section(c.limitsHeading, paragraph(c.additionalAccess) + paragraph(es ? 'Los datos son solo informativos, no constituyen asesoramiento financiero' : 'Data is for informational purposes only, not financial advice'))}
<nav class="flex flex-wrap gap-4" aria-label="${esc(c.linksHeading)}">${[
  ['/', c.home], ['/dolar-blue-hoy', c.today], ['/datos-historicos', c.history], ['/fuente-de-datos', c.methodology], ['/contacto#data-request', c.contact], ['/prensa', c.press],
].map(([href, label]) => link(local(href), label)).join('')}</nav></main>`;
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  if (!/<html\b[^>]*\blang=/i.test(out)) out = out.replace(/<html\b/i, `<html lang="${language}"`);
  const tags = [
    `<title>${esc(c.title)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['es', BASE + '/api-docs'], ['en', BASE + '/api-docs?lang=en'], ['x-default', BASE + '/api-docs']].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', c.title], ['description', c.description], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', c.title], ['twitter:description', c.description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', c.title], ['og:description', c.description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.apiSchema).replace(/</g, '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(rootPattern, (_match, open, close) => open + shell + close);
}
