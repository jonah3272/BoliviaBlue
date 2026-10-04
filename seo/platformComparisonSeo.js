import { getPlatformComparisonPage, REVIEWED_AT, SOURCES, BINANCE_HELP, ELDORADO_HELP } from '../frontend/src/data/platformComparison.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const PATH = '/plataformas';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const linkClass = 'text-sky-700 dark:text-sky-300 underline underline-offset-2';
const link = (href, label, external = false, sponsored = false) => `<a class="${linkClass}" href="${esc(href)}"${external ? ` target="_blank" rel="noopener noreferrer${sponsored ? ' sponsored' : ''}"` : ''}>${esc(label)}</a>`;

export function platformComparisonPageForSearch(search = '') {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  return getPlatformComparisonPage(params.get('lang') === 'en' ? 'en' : 'es');
}

/** Static editorial content only. No rate, provider, tracking or database requests. */
export function renderPlatformComparisonHtml(html, search = '') {
  const page = platformComparisonPageForSearch(search);
  const { language, es, copy, platforms, offer, local, buyGuide, cashGuide, canonical } = page;
  const cards = platforms.map((platform) => `<article data-platform="${esc(platform.partner)}" class="min-w-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-4">
<h3 class="text-xl font-bold">${esc(platform.name)}</h3>
<dl class="space-y-3">${[[copy.purpose, platform.purpose], [copy.payment, platform.payment], [copy.checks, platform.checks]].map(([label, value]) => `<div><dt class="font-semibold">${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
${platform.firstStep ? `<p><strong>${esc(copy.firstStep)}</strong>${esc(platform.firstStep)}</p>` : ''}
${platform.partner === 'binance' ? `<p>${link(SOURCES.binance[0][2], copy.binanceGuide, true)}</p>` : ''}
${platform.referral ? `<p>${link(platform.referral, platform.cta, true, true)}</p><p class="text-sm">${esc(platform.disclosure)}</p>` : `<p class="text-sm">${esc(copy.informationalLink)}</p>`}
${platform.partner === 'eldorado' ? `<p>${link(buyGuide, copy.firstPurchase)}</p>` : ''}
<div class="text-sm"><h4 class="font-semibold">${esc(copy.officialDocumentation)}</h4><ul class="space-y-1">${SOURCES[platform.partner].map(([spanish, english, href]) => `<li>${link(href, es ? spanish : english, true)}</li>`).join('')}</ul></div></article>`).join('');
  const shell = `<main data-seo-shell="plataformas" class="google-anno-skip max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-gray-900 dark:text-white">
<nav class="flex flex-wrap gap-4">${page.breadcrumbs.map(({ name, url }) => link(url, name)).join('')}</nav>
<section class="space-y-4"><h1 class="text-3xl sm:text-4xl font-bold">${esc(copy.heading)}</h1><p>${esc(copy.introduction)}</p><p class="text-sm">${esc(copy.referenceWarning)}</p><p class="text-sm">${esc(copy.referralDisclosure)}</p>
<nav class="flex flex-wrap gap-4" aria-label="${esc(copy.nextStep)}">${link(buyGuide, copy.buyGuideLabel)}${link('#comparacion', copy.viewComparison)}${link(cashGuide, copy.cashGuideLabel)}</nav></section>
<section class="min-w-0 rounded-2xl border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3"><p>${esc(offer.brand)} · ${esc(copy.referralLabel)}</p><h2 class="text-2xl font-bold">${esc(offer.headline)}</h2><p>${esc(offer.body)}</p><p class="text-sm">${esc(offer.qualification)}</p><p>${link(offer.href, offer.cta, true, true)}</p><p>${link(buyGuide, offer.guideLabel)}</p><p class="text-sm">${esc(offer.disclosure)}</p></section>
<section id="comparacion" class="space-y-5"><h2 class="text-2xl font-bold">${esc(copy.comparisonHeading)}</h2><p>${esc(copy.comparisonIntroduction)}</p><div class="grid min-w-0 gap-5 lg:grid-cols-2">${cards}</div></section>
<section class="space-y-4"><h2 class="text-2xl font-bold">${esc(copy.stepsHeading)}</h2><ol class="list-decimal pl-5 space-y-3">${page.compareSteps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol></section>
<section data-payment-safety class="rounded-2xl border border-amber-300 p-5 space-y-4"><h2 class="text-2xl font-bold">${esc(copy.safetyHeading)}</h2><dl class="space-y-3">${page.safety.map(([label, text]) => `<div><dt class="font-semibold">${esc(label)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl><p>${esc(copy.safetyWarning)}</p><nav class="flex flex-wrap gap-4">${link(BINANCE_HELP, copy.binanceAppeal, true)}${link(ELDORADO_HELP, copy.eldoradoDispute, true)}</nav></section>
<section class="space-y-4"><h2 class="text-xl font-bold">${esc(copy.nextHeading)}</h2><nav class="flex flex-wrap gap-4">${link(buyGuide, copy.buyGuideCta)}${link(local('/calculadora'), copy.calculatorLabel)}</nav></section>
<section class="text-sm space-y-3"><h2 class="font-semibold">${esc(copy.sourcesHeading)}</h2><p>${esc(copy.reviewedLabel)}<time datetime="${REVIEWED_AT}">${esc(copy.reviewedDate)}</time>. ${esc(copy.sourcesNote)}</p>${link(local('/bancos'), copy.banksLabel)}</section></main>`;

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
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.comparisonSchema).replace(/</g, '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
