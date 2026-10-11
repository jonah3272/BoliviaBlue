import { getDataDocumentationPage, PUBLIC_HISTORY_CSV, PUBLIC_HISTORY_JSON } from '../frontend/src/data/dataDocumentation.js';
import { getSourceCompositionExample } from '../frontend/src/data/sourceCompositionExample.js';
import { getDataInquiry } from '../frontend/src/data/dataInquiry.js';
import { sanitizeLangSearch } from '../frontend/src/utils/urlLang.js';

const BASE = 'https://www.boliviablue.com';
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const link = (href, label) => `<a class="text-blue-600 dark:text-blue-400 underline underline-offset-2" href="${esc(href)}">${esc(label)}</a>`;
const paragraph = (text) => `<p>${esc(text)}</p>`;
const section = (id, heading, body) => `<section${id ? ` id="${esc(id)}"` : ''} class="rounded-xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-700 dark:bg-gray-800"><h2 class="text-2xl font-bold">${esc(heading)}</h2>${body}</section>`;
const list = (items) => `<ul class="list-disc pl-5 space-y-2">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
const nav = (items) => `<nav class="flex flex-wrap gap-4">${items.map(([href, label]) => link(href, label)).join('')}</nav>`;

export function dataDocumentationPageForSearch(path, search = '') {
  const params = new URLSearchParams(sanitizeLangSearch(search));
  return getDataDocumentationPage(path, params.get('lang') === 'en' ? 'en' : 'es');
}

function citation(page) {
  const m = page.methodology;
  return section('citar', m.citeHeading, paragraph(m.citeIntroduction) + `<p class="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">${esc(m.citation)}</p>` + paragraph(m.citationAlternatives) + (page.history ? link(page.local('/fuente-de-datos#citar'), page.methodologyLabel) : ''));
}

export function renderSourceCompositionExample(language = 'es') {
  const e = getSourceCompositionExample(language);
  return `<section id="${e.id}" aria-labelledby="${e.id}-title" class="scroll-mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8 space-y-4 text-gray-800 dark:text-gray-200">
<p class="text-sm text-gray-600 dark:text-gray-400">${esc(e.date)}</p>
<h2 id="${e.id}-title" class="text-2xl font-bold text-gray-900 dark:text-white">${esc(e.title)}</h2>
<p class="font-semibold">${esc(e.summary)}</p>${paragraph(e.explanation)}
<div class="overflow-x-auto" role="region" aria-label="${esc(e.caption)}" tabindex="0"><table class="w-full text-sm text-left">
<caption class="text-left pb-3 text-gray-600 dark:text-gray-400">${esc(e.caption)}</caption>
<thead><tr class="border-b border-gray-300 dark:border-gray-600"><th scope="col" class="py-2 pr-3">${esc(e.source)}</th>${e.times.map((time) => `<th scope="col" class="p-2 whitespace-nowrap"><time datetime="${time.iso}">${time.label}</time></th>`).join('')}</tr></thead>
<tbody>${e.rows.map((row) => `<tr class="border-b border-gray-200 dark:border-gray-700"><th scope="row" class="py-2 pr-3 font-medium">${esc(row.label)}</th>${row.values.map((value) => `<td class="p-2 tabular-nums whitespace-nowrap">${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<h3 class="font-semibold">${esc(e.calculationHeading)}</h3><ol class="list-decimal pl-5 space-y-2 text-sm break-words">${e.formulas.map((formula) => `<li>${esc(formula)}</li>`).join('')}</ol>
<p class="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">${esc(e.caveat)}</p>
<details class="text-sm space-y-3"><summary class="cursor-pointer font-semibold">${esc(e.evidenceHeading)}</summary>${[e.evidence, e.coverage, e.limitations].map(paragraph).join('')}</details>
<a href="${esc(e.jsonUrl)}" download class="inline-block text-blue-600 dark:text-blue-400 underline">${esc(e.download)}</a>
<h3 class="font-semibold">${esc(e.citationLabel)}</h3><p class="select-text break-words rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-sm">${esc(e.citation)}</p></section>`;
}

export function renderSourceCompositionPressLink(language = 'es') {
  const e = getSourceCompositionExample(language);
  return `<aside class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">${link(e.path, e.pressLabel)}${paragraph(e.pressDescription)}</aside>`;
}

function sourceContent(page) {
  const { copy: c, local } = page;
  return section('', c.citationGuideHeading, paragraph(c.citationGuideDescription) + nav([[local('/dolar-blue-hoy'), c.todayLabel], [local('/prensa'), c.pressLabel], [local('/api-docs'), 'API'], [`${BASE}/llms.txt`, 'llms.txt']]))
    + section('fuente', c.sourceHeading, paragraph(c.sourceDescription))
    + section('calculo', c.calculationHeading, paragraph(c.calculationDescription) + list([c.buyDefinition, c.sellDefinition, c.midDefinition]))
    + section('frecuencia', c.frequencyHeading, paragraph(c.frequencyDescription) + paragraph(c.timestampDescription))
    + section('blue-vs-oficial', c.officialHeading, paragraph(c.officialDescription) + paragraph(c.officialSeparation) + link(local('/comparacion'), c.comparisonLabel))
    + section('historicos', c.historyHeading, paragraph(c.historyDescription) + paragraph(c.exportLimits) + nav([[local('/datos-historicos'), c.historyLabel], [PUBLIC_HISTORY_CSV, 'CSV (30d)'], [PUBLIC_HISTORY_JSON, 'JSON (30d)']]))
    + section('provenance', c.provenanceHeading, paragraph(c.provenanceDescription) + paragraph(c.coverageDescription))
    + renderSourceCompositionExample(page.language)
    + section('api', c.apiHeading, paragraph(c.apiDescription) + `<p class="break-words font-mono text-sm">GET ${esc(BASE)}/api/blue-rate</p>` + paragraph(c.apiIntroduction) + link(local('/api-docs'), c.apiLabel))
    + citation(page)
    + section('limitaciones', c.limitationsHeading, [c.limitationsDescription, c.executionWarning, c.delayWarning].map(paragraph).join(''))
    + section('faq', c.faqHeading, page.faqItems.map(({ q, a }) => `<div><h3 class="font-semibold">${esc(q)}</h3>${paragraph(a)}</div>`).join(''))
    + nav([[local('/contacto'), c.contactLabel], [local('/datos-historicos'), c.historyLabel], [local('/api-docs'), c.apiLabel]]);
}

function historyContent(page) {
  const { copy: c, methodology: m, local } = page;
  const inquiry = getDataInquiry(page.language);
  return section('cobertura', m.provenanceHeading, paragraph(c.datasetDescription) + paragraph(m.provenanceDescription) + paragraph(m.coverageDescription))
    + section('historical-chart-heading', c.chartHeading, paragraph(page.initialDataNotice) + paragraph(c.chartDescription))
    + section('', c.recordsHeading, paragraph(c.recordsDescription) + paragraph(c.tableCsvDescription))
    + section('descargas', c.downloadsHeading, paragraph(c.downloadsDescription) + paragraph(c.noSignup) + paragraph(c.publicRangeDescription) + nav([[PUBLIC_HISTORY_CSV, 'CSV'], [PUBLIC_HISTORY_JSON, 'JSON']]) + paragraph(c.teamsDescription) + paragraph(inquiry.limitation) + nav([[local('/api-docs'), 'API'], [inquiry.href, c.extendedAccessLabel]]))
    + citation(page);
}

/** Editorial content only: no history/rate/backend calls. Methodology includes a fixed, dated case study. */
export function renderDataDocumentationHtml(html, path, search = '') {
  const rootPattern = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  if (!/<html\b/i.test(html) || !/<\/head>/i.test(html) || !rootPattern.test(html)) throw new Error('Documentation shell is invalid');
  const page = dataDocumentationPageForSearch(path, search);
  const { language, es, history, copy, local, canonical } = page;
  const intro = history
    ? `<p>${esc(page.historyIntroduction)} ${link(local('/'), page.liveLabel)}. ${link(local('/fuente-de-datos'), page.methodologyLabel)}.</p>`
    : paragraph(copy.introduction);
  const shell = `<main data-seo-shell="${esc(path.slice(1))}" class="max-w-4xl mx-auto px-4 py-8 space-y-8 text-gray-900 dark:text-white">
${nav(page.breadcrumbs.map(({ name, url }) => [url, name]))}
<header class="space-y-4">${history ? paragraph(copy.eyebrow) : ''}<h1 class="text-3xl sm:text-4xl font-bold">${esc(copy.heading)}</h1>${intro}</header>
${history ? historyContent(page) : sourceContent(page)}</main>`;
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
  if (!/<html\b[^>]*\blang=/i.test(out)) out = out.replace(/<html\b/i, `<html lang="${language}"`);
  const schemas = [page.webPageSchema, page.breadcrumbSchema, history ? page.datasetSchema : page.faqSchema];
  const tags = [
    `<title>${esc(copy.title)}</title>`,
    `<link rel="canonical" href="${esc(canonical)}" data-rh="true" />`,
    ...[['es', BASE + path], ['en', BASE + path + '?lang=en'], ['x-default', BASE + path]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true" />`),
    ...[['title', copy.title], ['description', copy.description], ['keywords', copy.keywords], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['language', es ? 'Spanish' : 'English'], ['twitter:card', 'summary_large_image'], ['twitter:url', canonical], ['twitter:title', copy.title], ['twitter:description', copy.description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true" />`),
    ...[['og:type', 'website'], ['og:url', canonical], ['og:title', copy.title], ['og:description', copy.description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:locale:alternate', es ? 'en_US' : 'es_BO'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true" />`),
    ...schemas.map((schema) => `<script type="application/ld+json" data-rh="true">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`),
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(rootPattern, (_match, open, close) => open + shell + close);
}
