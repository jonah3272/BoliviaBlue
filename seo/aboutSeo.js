import { getAboutPage } from '../frontend/src/data/aboutPage.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const p = (text) => `<p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">${esc(text)}</p>`;
const list = (items) => `<ul class="space-y-2 list-disc list-inside">${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const section = (heading, content) => `<section class="mb-8"><h2 class="text-2xl font-semibold mb-4">${esc(heading)}</h2>${content}</section>`;
const detail = (heading, text) => `<div class="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 mb-4"><h3 class="font-semibold mb-2">${esc(heading)}</h3>${p(text)}</div>`;

export function aboutPageForSearch(search = '') {
  return getAboutPage(new URLSearchParams(sanitizeLangSearch(search)).get('lang'));
}

/** The same editorial paragraphs as the React article, without live rate placeholders. */
export function renderAboutArticle(copy) {
  const c = copy;
  return `<article class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12"><h1 class="text-3xl sm:text-4xl font-bold mb-6">${esc(c.aboutHeading)}</h1>`
    + section(c.aboutMissionTitle, [c.aboutMissionDesc, c.aboutMissionDesc2, c.aboutMissionContext, c.aboutFreeAccess].map(p).join(''))
    + section(c.aboutWhyTitle, [c.aboutWhyContext, c.aboutWhySources, c.aboutTools].map(p).join(''))
    + section(c.aboutMethodology, p(c.aboutMethodologyDesc) + detail(c.aboutBlueMarket, c.aboutBlueMarketDesc) + detail(c.aboutOfficialRate, c.aboutOfficialRateDesc) + `<h3 class="font-semibold mb-2">${esc(c.aboutUpdateFrequency)}</h3>` + list([c.aboutUpdateFrequency1, c.aboutUpdateFrequency2, c.aboutUpdateFrequency3]))
    + section(c.aboutDataSources, p(c.aboutDataSourcesDesc) + '<ul class="space-y-3">' + [1, 2, 3, 4].map(n => `<li><strong>${esc(c[`aboutDataSource${n}Title`])}</strong> ${esc(c[`aboutDataSource${n}`])}</li>`).join('') + '</ul>')
    + section(c.aboutAITitle, p(c.aboutAIDesc) + p(c.aboutAIDetails))
    + section(c.aboutTransparency, p(c.aboutTransparencyDesc) + list([c.aboutTransparency1, c.aboutTransparency2, c.aboutTransparency3, c.aboutTransparency4]))
    + section(c.aboutCaveatsTitle, `<p class="mb-3"><strong>${esc(c.aboutCaveatsTitle)}</strong> ${esc(c.aboutCaveatsDesc)}</p>` + list([c.aboutCaveats1, c.aboutCaveats2, c.aboutCaveats3, c.aboutCaveats4]))
    + '</article>';
}

export function renderAboutHtml(html, search = '') {
  const rootPattern = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  if (!/<html\b/i.test(html) || !/<\/head>/i.test(html) || !rootPattern.test(html)) throw new Error('About shell is invalid');
  const page = aboutPageForSearch(search);
  const { language, canonical, title, description, keywords } = page;
  const es = language === 'es';
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  if (!/<html\b[^>]*\blang=/i.test(out)) out = out.replace(/<html\b/i, `<html lang="${language}"`);
  const tags = [
    `<title>${esc(title)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['es', BASE + page.path], ['en', BASE + page.path + '?lang=en'], ['x-default', BASE + page.path]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', title], ['description', description], ['keywords', keywords], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', title], ['twitter:description', description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', title], ['og:description', description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.breadcrumbSchema).replace(/</g, '\\u003c')}</script>`,
  ];
  const breadcrumb = `<nav class="flex gap-4 mb-6" aria-label="${es ? 'Ruta de navegación' : 'Breadcrumb'}">${page.breadcrumbs.map(({ name, url }) => `<a class="text-blue-600 dark:text-blue-400" href="${esc(url)}">${esc(name)}</a>`).join('')}</nav>`;
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(rootPattern, (_match, open, close) => open + `<main data-seo-shell="acerca-de" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-900 dark:text-white">${breadcrumb}${renderAboutArticle(page.copy)}</main>` + close);
}
