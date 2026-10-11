import { getRemittanceComparison } from '../frontend/src/data/remittanceComparison.js';

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderRemittanceComparisonHtml(language = 'es') {
  const c = getRemittanceComparison(language);
  return `<section id="${c.id}" aria-labelledby="${c.id}-title" class="scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-7 space-y-4 text-gray-700 dark:text-gray-300">
<h2 id="${c.id}-title" class="text-2xl font-bold text-gray-900 dark:text-white">${esc(c.title)}</h2><p>${esc(c.introduction)}</p>
<h3 class="text-lg font-semibold text-gray-900 dark:text-white">${esc(c.checklistTitle)}</h3><ul class="list-disc pl-5 space-y-2">${c.checklist.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
<h3 class="text-lg font-semibold text-gray-900 dark:text-white">${esc(c.exampleTitle)}</h3><p class="text-sm">${esc(c.exampleNote)}</p>
<div class="grid min-w-0 gap-4 sm:grid-cols-2">${c.offers.map((offer) => `<div data-remittance-offer="${offer.id}" class="min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 p-4"><h4 class="font-bold text-gray-900 dark:text-white">${esc(offer.title)}</h4><dl class="mt-3 space-y-3 text-sm">${offer.rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd class="font-semibold tabular-nums text-gray-900 dark:text-white">${esc(value)}</dd></div>`).join('')}</dl></div>`).join('')}</div>
<p class="font-semibold">${esc(c.formula)}</p><p>${esc(c.conclusion)}</p><p class="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">${esc(c.caution)}</p>
<h3 class="font-semibold text-gray-900 dark:text-white">${esc(c.sourcesTitle)}</h3><ul class="space-y-2 text-sm">${c.sources.map(({ href, label }) => `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="inline-block py-2 text-sky-700 dark:text-sky-300 underline underline-offset-2">${esc(label)}</a></li>`).join('')}</ul><p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">${esc(c.sourceNote)}</p></section>`;
}
