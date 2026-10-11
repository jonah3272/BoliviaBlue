import { getRealConversionPage, REAL_PATH } from '../frontend/src/data/realConversionPage.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const PATH = REAL_PATH;
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const linkClass = 'text-green-700 dark:text-green-300 underline underline-offset-2';
const sectionClass = 'bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4';

export function realPageForSearch(search = '', rate = null, now = Date.now()) {
  return getRealConversionPage(new URLSearchParams(sanitizeLangSearch(search)).get('lang') === 'en' ? 'en' : 'es', rate, now);
}

/** Same copy, missing-data semantics and locale identity as the mounted BRL page. */
export function renderRealConversionHtml(html, search = '', rate = null, now = Date.now()) {
  const page = realPageForSearch(search, rate, now);
  const { language, canonical, model } = page;
  const es = language === 'es';
  const cards = [[page.buyLabel, model.buy], [page.sellLabel, model.sell]];
  const shell = `<main data-seo-shell="real-a-boliviano" class="google-anno-skip max-w-4xl mx-auto px-4 py-6 space-y-6 text-gray-900 dark:text-white">
<header class="space-y-3"><h1 class="text-3xl sm:text-4xl font-bold">${esc(page.heading)}</h1><p>${esc(page.introduction)}</p></header>
<section class="${sectionClass}" aria-labelledby="real-rate-heading"><h2 id="real-rate-heading" class="text-xl font-semibold">${esc(page.rateHeading)}</h2>
<div class="grid grid-cols-2 gap-4">${cards.map(([label, value]) => `<div class="space-y-2"><p>1 BRL =</p><p class="text-2xl font-bold tabular-nums">${model.available ? `${value.toFixed(3)} BOB` : '—'}</p><p class="text-sm">${esc(label)}</p></div>`).join('')}</div><p>${esc(page.status)}</p></section>
<div class="space-y-2 text-sm" data-real-timestamp><p>${esc(page.recordLabel)}: ${model.observedAt ? `<time datetime="${esc(model.observedAt)}">${esc(page.recordTime)}</time>` : esc(page.recordTime)}</p><p>${esc(page.timestampNote)}</p></div>
<section class="${sectionClass}" aria-labelledby="real-amounts-heading"><h2 id="real-amounts-heading" class="text-xl font-semibold">${esc(page.amountsHeading)}</h2><p class="text-sm">${esc(page.amountsNote)}</p>
<div class="overflow-x-auto"><table class="w-full text-left text-sm tabular-nums" data-real-amounts><thead><tr>${[page.amountColumn, page.buyColumn, page.sellColumn].map(label => `<th class="p-2 border-b align-top" scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${page.amounts.map(row => `<tr><th class="p-2 font-medium" scope="row">${row.amount} BRL</th><td class="p-2">${row.buy}</td><td class="p-2">${row.sell}</td></tr>`).join('')}</tbody></table></div></section>
${page.sections.map(section => `<section id="${section.id}" class="${sectionClass}"><h2 class="text-xl font-semibold">${esc(section.title)}</h2>${section.paragraphs.map(text => `<p>${esc(text)}</p>`).join('')}</section>`).join('')}
<section class="${sectionClass}" aria-labelledby="real-faq-heading"><h2 id="real-faq-heading" class="text-xl font-semibold">${esc(page.faqHeading)}</h2>${page.faqs.map(faq => `<div class="space-y-2"><h3 class="font-semibold">${esc(faq.question)}</h3><p>${esc(faq.answer)}</p></div>`).join('')}</section>
<nav class="${sectionClass}" aria-label="${esc(page.linksHeading)}"><h2 class="text-xl font-semibold">${esc(page.linksHeading)}</h2><ul class="space-y-3">${page.links.map(link => `<li><a class="${linkClass}" href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('')}</ul></nav></main>`;
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
    ...page.schemas.map(schema => `<script type="application/ld+json" data-rh="true">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`),
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
