import { getRemittanceComparison } from '../data/remittanceComparison.js';

/** Static educational content; no inputs, quote requests, storage or analytics. */
export default function RemittanceComparison({ language = 'es' }) {
  const content = getRemittanceComparison(language);
  return <section id={content.id} aria-labelledby={`${content.id}-title`} className="scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-7 space-y-4 text-gray-700 dark:text-gray-300">
    <h2 id={`${content.id}-title`} className="text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h2>
    <p>{content.introduction}</p>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{content.checklistTitle}</h3>
    <ul className="list-disc pl-5 space-y-2">{content.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{content.exampleTitle}</h3>
    <p className="text-sm">{content.exampleNote}</p>
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">{content.offers.map((offer) => <div key={offer.id} data-remittance-offer={offer.id} className="min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h4 className="font-bold text-gray-900 dark:text-white">{offer.title}</h4>
      <dl className="mt-3 space-y-3 text-sm">{offer.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="font-semibold tabular-nums text-gray-900 dark:text-white">{value}</dd></div>)}</dl>
    </div>)}</div>
    <p className="font-semibold">{content.formula}</p>
    <p>{content.conclusion}</p>
    <p className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">{content.caution}</p>
    <h3 className="font-semibold text-gray-900 dark:text-white">{content.sourcesTitle}</h3>
    <ul className="space-y-2 text-sm">{content.sources.map(({ href, label }) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-sky-700 dark:text-sky-300 underline underline-offset-2">{label}</a></li>)}</ul>
    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{content.sourceNote}</p>
  </section>;
}
