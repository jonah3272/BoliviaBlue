import { CASH_CARD_PATH, cashCardPage } from '../frontend/src/data/cashCardPage.js';
import { paymentComparison } from '../frontend/src/utils/paymentComparison.js';
import { officialRateModel } from '../frontend/src/utils/officialRate.js';

const BASE = 'https://www.boliviablue.com';
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const positive = value => (typeof value === 'number' || typeof value === 'string') && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;

/** Same comparison and expiry rules as the interactive home tool; no guessed observations. */
export function cashCardSnapshot(rate, card, now = Date.now()) {
  const buy = positive(rate?.buy_bob_per_usd ?? rate?.buy);
  const sell = positive(rate?.sell_bob_per_usd ?? rate?.sell);
  const blue = buy && sell ? (buy + sell) / 2 : buy;
  const cardRate = positive(card?.visa_bob_per_usd ?? card?.mastercard_bob_per_usd ?? card?.amex_bob_per_usd);
  const blueAt = rate?.updated_at_iso ?? rate?.t;
  const cardAt = card?.updated_at_iso ?? card?.t;
  const comparison = paymentComparison({ blue, card: cardRate, blueAt, cardAt, now });
  if (rate?.is_stale === true && comparison.status !== 'missing') comparison.status = 'stale';
  return { blue, blueAt, cardAt, comparison, official: officialRateModel(rate) };
}

export function renderCashCardHtml(html, search = '', rate = null, card = null, now = Date.now()) {
  const page = cashCardPage(new URLSearchParams(search).get('lang') === 'en' ? 'en' : 'es');
  const es = page.language === 'es';
  const { blue, blueAt, cardAt, comparison, official } = cashCardSnapshot(rate, card, now);
  const ready = ['cash', 'card', 'tie'].includes(comparison.status);
  const verdict = comparison.status === 'cash' ? (es ? `Hoy, efectivo al blue costaría ${comparison.savings.toFixed(1)}% menos que tarjeta` : `Today, cash at the blue rate would cost ${comparison.savings.toFixed(1)}% less than card`)
    : comparison.status === 'card' ? (es ? `Hoy, tarjeta costaría ${comparison.savings.toFixed(1)}% menos que efectivo al blue` : `Today, card would cost ${comparison.savings.toFixed(1)}% less than cash at the blue rate`)
    : comparison.status === 'tie' ? (es ? 'Hoy, efectivo al blue y tarjeta cuestan prácticamente lo mismo' : 'Today, cash at the blue rate and card cost about the same')
    : comparison.status === 'stale' ? (es ? 'Datos desactualizados: no hay recomendación para hoy' : 'Rates need updating: no recommendation for today')
    : (es ? 'Faltan tasas para comparar hoy' : 'Rates unavailable for today’s comparison');
  const observation = (label, value) => {
    const date = new Date(value);
    if (!value || !Number.isFinite(date.getTime()) || date.getTime() > now + 60000) return '';
    return `<p>${label}: <time datetime="${esc(date.toISOString())}">${esc(date.toLocaleString(es ? 'es-BO' : 'en-US', { timeZone: 'America/La_Paz' }))}</time> (${es ? 'hora de Bolivia' : 'Bolivia time'})</p>`;
  };
  const shell = `<main data-seo-shell="cash-card" class="max-w-4xl mx-auto px-4 py-8 space-y-8 text-gray-900 dark:text-white">
    <header class="space-y-4"><a href="${page.links[0].href}">Bolivia Blue</a><h1 class="text-3xl sm:text-5xl font-bold">${esc(page.heading)}</h1><p class="text-lg">${esc(page.introduction)}</p><p class="rounded-xl bg-sky-50 p-4">${esc(page.answer)}</p></header>
    <section class="rounded-2xl border border-emerald-200 p-5 space-y-3" data-cash-card-snapshot><h2 class="text-xl font-bold">${esc(page.dailyHeading)}</h2><p class="font-bold" data-daily-payment-result>${esc(verdict)}</p><p>${esc(page.assumption)}</p>
    ${ready ? `<p>${es ? 'Efectivo supuesto' : 'Assumed cash'}: ${blue.toFixed(2)} Bs/USD · ${es ? 'Tarjeta neta' : 'Card after fee'}: ${comparison.effective.toFixed(2)} Bs/USD</p>` : ''}
    ${official.available ? `<p>${es ? (official.stale ? 'Último BCB verificado' : 'Referencia BCB') : (official.stale ? 'Last verified BCB' : 'BCB reference')}: ${official.official_mid.toFixed(2)} Bs/USD. ${es ? 'No garantiza la tasa de tu tarjeta.' : 'Not a guaranteed card rate.'}</p>` : ''}
    <div class="text-xs text-gray-500">${observation(es ? 'Lectura P2P' : 'P2P observation', blueAt)}${observation(es ? 'Lectura de tarjeta' : 'Card observation', cardAt)}</div><noscript><p>${esc(page.interact)}</p></noscript></section>
    <section class="space-y-4"><h2 class="text-2xl font-bold">${esc(page.guideHeading)}</h2>${page.sections.map(section => `<section><h3 class="font-bold">${esc(section.title)}</h3><p>${esc(section.text)}</p></section>`).join('')}</section>
    <section class="rounded-2xl bg-sky-950 text-white p-6 space-y-3"><h2 class="text-xl font-bold">${esc(page.exampleHeading)}</h2><p>${esc(page.example)}</p></section>
    <section class="space-y-4"><h2 class="text-2xl font-bold">${esc(page.faqHeading)}</h2>${page.questions.map(([question, answer]) => `<details class="rounded-xl border border-gray-200 p-4"><summary class="font-semibold">${esc(question)}</summary><p class="mt-3">${esc(answer)}</p></details>`).join('')}</section>
    <nav aria-label="${esc(page.resourcesHeading)}"><h2 class="text-xl font-bold">${esc(page.resourcesHeading)}</h2><ul class="flex flex-wrap gap-4">${page.links.map(link => `<li><a class="text-sky-700 underline" href="${esc(link.href)}">${esc(link.label)}</a></li>`).join('')}</ul></nav></main>`;
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi, '')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi, '')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${page.language}"`);
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<link rel="canonical" href="${esc(page.canonical)}" data-rh="true">`,
    ...[['es', BASE + CASH_CARD_PATH], ['en', BASE + CASH_CARD_PATH + '?lang=en'], ['x-default', BASE + CASH_CARD_PATH]].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" data-rh="true">`),
    ...[['title', page.title], ['description', page.description], ['robots', noindex ? 'noindex, nofollow' : 'index, follow'], ['twitter:card', 'summary_large_image'], ['twitter:title', page.title], ['twitter:description', page.description], ['twitter:image', BASE + '/header-og-image.jpg']].map(([name, content]) => `<meta name="${name}" content="${esc(content)}" data-rh="true">`),
    ...[['og:type', 'website'], ['og:url', page.canonical], ['og:title', page.title], ['og:description', page.description], ['og:locale', es ? 'es_BO' : 'en_US'], ['og:site_name', 'Bolivia Blue'], ['og:image', BASE + '/header-og-image.jpg']].map(([property, content]) => `<meta property="${property}" content="${esc(content)}" data-rh="true">`),
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(page.schema).replaceAll('<', '\\u003c')}</script>`,
  ];
  out = out.replace('</head>', () => tags.join('\n') + '\n</head>');
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, (_match, open, close) => open + shell + close);
}
