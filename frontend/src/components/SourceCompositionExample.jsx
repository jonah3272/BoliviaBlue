import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSourceCompositionExample } from '../data/sourceCompositionExample';

export default function SourceCompositionExample({ language = 'es' }) {
  const example = getSourceCompositionExample(language);
  const location = useLocation();
  const section = useRef(null);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (location.hash === `#${example.id}`) section.current?.scrollIntoView({ block: 'start' });
  }, [location.key, location.hash, example.id]);
  useEffect(() => { setStatus(''); }, [language]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(example.citation); setStatus(example.copied); }
    catch { setStatus(example.copyFailed); }
  };

  return <section ref={section} id={example.id} aria-labelledby={`${example.id}-title`} className="scroll-mt-[calc(var(--bb-header-height,81px)_+_1rem)] md:scroll-mt-[calc(var(--bb-header-height,81px)_+_4rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8 space-y-4 text-gray-800 dark:text-gray-200">
    <p className="text-sm text-gray-600 dark:text-gray-400">{example.date}</p>
    <h2 id={`${example.id}-title`} className="text-2xl font-bold text-gray-900 dark:text-white">{example.title}</h2>
    <p className="font-semibold">{example.summary}</p>
    <p>{example.explanation}</p>
    <div className="overflow-x-auto" role="region" aria-label={example.caption} tabIndex={0}>
      <table className="w-full text-sm text-left">
        <caption className="text-left pb-3 text-gray-600 dark:text-gray-400">{example.caption}</caption>
        <thead><tr className="border-b border-gray-300 dark:border-gray-600">
          <th scope="col" className="py-2 pr-3">{example.source}</th>
          {example.times.map((time) => <th key={time.iso} scope="col" className="p-2 whitespace-nowrap"><time dateTime={time.iso}>{time.label}</time></th>)}
        </tr></thead>
        <tbody>{example.rows.map((row) => <tr key={row.label} className="border-b border-gray-200 dark:border-gray-700">
          <th scope="row" className="py-2 pr-3 font-medium">{row.label}</th>
          {row.values.map((value, i) => <td key={i} className="p-2 tabular-nums whitespace-nowrap">{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <h3 className="font-semibold">{example.calculationHeading}</h3>
    <ol className="list-decimal pl-5 space-y-2 text-sm break-words">
      {example.formulas.map((formula) => <li key={formula}>{formula}</li>)}
    </ol>
    <p className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">{example.caveat}</p>
    <details className="text-sm space-y-3">
      <summary className="cursor-pointer font-semibold">{example.evidenceHeading}</summary>
      <p>{example.evidence}</p><p>{example.coverage}</p><p>{example.limitations}</p>
    </details>
    <a href={example.jsonUrl} download className="inline-block text-blue-600 dark:text-blue-400 underline">{example.download}</a>
    <h3 className="font-semibold">{example.citationLabel}</h3>
    <p className="select-text break-words rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-sm">{example.citation}</p>
    <button type="button" onClick={copy} className="rounded-lg bg-blue-600 text-white px-4 py-3 text-sm">{example.copy}</button>
    <p role="status" className="text-sm">{status}</p>
  </section>;
}
