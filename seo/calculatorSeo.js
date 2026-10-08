import { getCalculatorPage } from '../frontend/src/data/calculatorPage.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const PATH = '/calculadora';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const linkClass = 'text-sky-700 dark:text-sky-300 underline underline-offset-2';

export function calculatorPageForSearch(search = '') {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  return getCalculatorPage(params.get('lang') === 'en' ? 'en' : 'es');
}

/** No live-rate request or amount-specific output: one useful page in both locales. */
export function renderCalculatorHtml(html, search = '') {
  const page = calculatorPageForSearch(search);
  const { language, canonical } = page;
  const es = language === 'es';
  const shell = `<main data-seo-shell="calculadora" class="google-anno-skip max-w-3xl mx-auto px-4 py-8 space-y-6 text-gray-900 dark:text-white">
<header class="space-y-3"><h1 class="text-3xl font-bold">${esc(page.heading)}</h1><p>${esc(page.introduction)}</p></header>
<noscript><p>${esc(page.interactiveNote)}</p></noscript>
<section aria-labelledby="calculator-presets-heading" class="space-y-3"><h2 id="calculator-presets-heading" class="text-xl font-semibold">${esc(page.presetsHeading)}</h2>
<nav class="flex flex-wrap gap-3" aria-label="${esc(page.presetsHeading)}">${page.presets.map(({ href, label }) => `<a class="${linkClass}" href="${esc(href)}">${esc(label)}</a>`).join('')}</nav><p class="text-sm">${esc(page.presetsNote)}</p></section>
<section class="space-y-5"><h2 class="text-2xl font-bold">${esc(page.helpHeading)}</h2>
${page.sections.map(({ id, title, paragraphs }) => `<section id="${id}" class="space-y-3"><h3 class="text-xl font-semibold">${esc(title)}</h3>${paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</section>`).join('')}
<p><a class="${linkClass}" href="${esc(page.methodology.href)}">${esc(page.methodology.label)}</a></p></section></main>`;

  // Helmet adopts these identity tags on mount; createRoot replaces the visible shell.
  // Keep all application, security, stylesheet and advertising configuration intact.
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['es', BASE + PATH], ['en', BASE + PATH + '?lang=en'], ['x-default', BASE + PATH]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', page.title], ['description', page.description], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', page.title], ['twitter:description', page.description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', page.title], ['og:description', page.description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.webAppSchema).replace(/</g, '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
