import { qrCardPage, QR_CARD_PATH } from '../frontend/src/data/qrCardPage.js';
import { santaCruzPage, SANTA_CRUZ_PATH, SANTA_CRUZ_PROVIDERS } from '../frontend/src/data/santaCruzExchange.js';
const BASE = 'https://www.boliviablue.com';
const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function shell(html, path, search, page, body) {
  const en = new URLSearchParams(search).get('lang') === 'en', canonical = BASE + path + (en ? '?lang=en' : '');
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  let out = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'')
    .replace(/<meta\b[^>]*(?:name=["'](?:title|description|keywords|robots|language|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi,'')
    .replace(/<link\b[^>]*(?:rel=["']canonical["']|hreflang=)[^>]*>/gi,'')
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'')
    .replace(/<html\b([^>]*)\blang=["'][^"']*["']/i, `<html$1lang="${en?'en':'es'}"`);
  const tags = [`<title>${esc(page.title)}</title>`, `<link rel="canonical" href="${canonical}" data-rh="true">`,
    `<meta name="description" content="${esc(page.description)}" data-rh="true">`,
    `<meta name="robots" content="${noindex?'noindex, nofollow':'index, follow'}" data-rh="true">`,
    ...[['es',BASE+path],['en',BASE+path+'?lang=en'],['x-default',BASE+path]].map(([lang,url])=>`<link rel="alternate" hreflang="${lang}" href="${url}" data-rh="true">`),
    ...[['og:type','website'],['og:url',canonical],['og:title',page.title],['og:description',page.description],['og:site_name','Bolivia Blue'],['og:image',BASE+'/header-og-image.jpg']].map(([property,content])=>`<meta property="${property}" content="${esc(content)}" data-rh="true">`),
    `<meta name="twitter:card" content="summary_large_image" data-rh="true">`,
    `<script type="application/ld+json" data-rh="true">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:page.title,description:page.description,url:canonical,inLanguage:en?'en':'es-BO',dateModified:'2026-10-22'}).replaceAll('<','\\u003c')}</script>`];
  out=out.replace('</head>',()=>tags.join('\n')+'\n</head>');
  const main=`<main data-seo-shell="payment-tool" class="max-w-4xl mx-auto px-4 py-8 space-y-8 text-gray-900 dark:text-white"><header class="space-y-4"><a href="/${en?'?lang=en':''}" class="text-sky-700 underline">Bolivia Blue</a><h1 class="text-3xl sm:text-5xl font-bold">${esc(page.heading)}</h1><p class="text-lg">${esc(page.intro)}</p></header>${body}</main>`;
  return out.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/,(_m,start,end)=>start+main+end);
}
export function renderQrCardHtml(html, search='') {
  const en=new URLSearchParams(search).get('lang')==='en', page=qrCardPage(en?'en':'es');
  const body=`<section class="rounded-2xl border border-sky-200 p-6"><h2 class="text-xl font-bold">${en?'How to compare QR and card':'Cómo comparar QR y tarjeta'}</h2><ol class="list-decimal pl-5 space-y-3">${page.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><noscript><p>${en?'Enable JavaScript to enter rates and calculate both totals.':'Activá JavaScript para ingresar las tasas y calcular ambos totales.'}</p></noscript></section><p>${esc(page.note)}</p><nav class="flex flex-wrap gap-4"><a href="/efectivo-o-tarjeta-bolivia${en?'?lang=en':''}">${en?'Cash vs. card':'Efectivo vs. tarjeta'}</a><a href="/dolar-blue-santa-cruz${en?'?lang=en':''}">${en?'Santa Cruz cash quotes':'Cotizar efectivo en Santa Cruz'}</a></nav>`;
  return shell(html,QR_CARD_PATH,search,page,body);
}
export function renderSantaCruzHtml(html, search='') {
  const en=new URLSearchParams(search).get('lang')==='en', page=santaCruzPage(en?'en':'es');
  const body=`<section><h2 class="text-2xl font-bold">${esc(page.providersHeading)}</h2>${SANTA_CRUZ_PROVIDERS.map(p=>`<article class="rounded-2xl border border-gray-200 p-5 space-y-3"><h3 class="text-xl font-semibold">${esc(p.name)}</h3><p>${esc(p.address)}</p><p>${esc(p.phone)} · ${en?'Contact checked':'Contacto revisado'}: ${p.contactChecked}</p><p class="font-semibold">${esc(page.status)}</p><p>${esc(page.limits)}</p><a href="https://wa.me/${p.whatsapp}?text=${encodeURIComponent(page.request)}" target="_blank" rel="noopener noreferrer">${en?'Request a WhatsApp quote':'Pedir cotización por WhatsApp'}</a> · <a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer">${en?'Source: provider website':'Fuente: sitio del proveedor'}</a></article>`).join('')}</section><section><h2 class="text-2xl font-bold">${esc(page.checklistHeading)}</h2><ul class="list-disc pl-5">${page.checklist.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section><section><h2 class="text-xl font-bold">${en?'Your actual cash offer vs. card':'Tu oferta real de efectivo vs. tarjeta'}</h2><p>${en?'Enter your USD banknote amount, offered BOB, exchange charges and card fee in the interactive calculator. Your offer remains a user-entered scenario, not a verified market quote.':'En el comparador interactivo podés ingresar tus USD en billetes, los Bs ofrecidos, los cargos del cambio y la comisión de tarjeta. Tu oferta es un escenario ingresado por vos, no una cotización de mercado verificada.'}</p></section><nav class="flex flex-wrap gap-4"><a href="/${en?'?lang=en':''}">${en?'National P2P reference':'Referencia nacional P2P'}</a><a href="/efectivo-o-tarjeta-bolivia${en?'?lang=en':''}">${en?'Cash vs. card':'Efectivo vs. tarjeta'}</a><a href="/comparar-qr-tarjeta${en?'?lang=en':''}">${en?'QR vs. card':'QR vs. tarjeta'}</a></nav>`;
  return shell(html,SANTA_CRUZ_PATH,search,page,body);
}
