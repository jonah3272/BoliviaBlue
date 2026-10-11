const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderContextualDiscoveryLink(link) {
  return `<p class="mt-3 text-sm text-gray-700 dark:text-gray-300" data-contextual-discovery="${esc(link.id)}">${esc(link.before)}<a class="text-blue-600 dark:text-blue-400 underline underline-offset-2" href="${esc(link.href)}">${esc(link.label)}</a>${esc(link.after)}</p>`;
}
