import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DATA_INQUIRY_PATH, getDataInquiry } from '../data/dataInquiry';
import { trackCommercialAccessClicked } from '../utils/analyticsEvents';

export default function DataInquiry({ language = 'es' }) {
  const inquiry = getDataInquiry(language);
  const location = useLocation();
  const sectionRef = useRef(null);
  const previewRef = useRef(null);
  const textRef = useRef(null);
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    if (location.hash === '#data-request') {
      sectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [location.key, location.hash]);

  const trackAction = (link_label) => trackCommercialAccessClicked({
    language: inquiry.language,
    destination: DATA_INQUIRY_PATH,
    link_label,
  });

  const copyInquiry = async () => {
    setCopyState('copying');
    trackAction('data_inquiry_copy');
    try {
      await navigator.clipboard.writeText(inquiry.fullText);
      setCopyState('copied');
    } catch {
      if (!previewRef.current || !textRef.current) return;
      setCopyState('failed');
      previewRef.current.open = true;
      textRef.current.focus();
      textRef.current.select();
    }
  };

  return (
    <section ref={sectionRef} id="data-request" aria-labelledby="data-request-heading" className="mb-10 scroll-mt-24 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-gray-800 sm:p-6">
      <h2 id="data-request-heading" className="text-2xl font-bold text-gray-900 dark:text-white">{inquiry.heading}</h2>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{inquiry.introduction}</p>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{inquiry.limitation}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={inquiry.mailto} onClick={() => trackAction('data_inquiry_prepare_email')} className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
          {inquiry.prepareLabel}
        </a>
        <button type="button" disabled={copyState === 'copying'} onClick={copyInquiry} className="rounded-lg border border-blue-300 bg-white px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-600 dark:bg-gray-900 dark:text-blue-300">
          {copyState === 'copying' ? inquiry.copyingLabel : inquiry.copyLabel}
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{inquiry.nextStep}</p>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {copyState === 'copied' ? inquiry.copied : copyState === 'failed' ? inquiry.copyFailed : ''}
      </p>
      <details ref={previewRef} className="mt-3 text-sm text-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-medium text-blue-700 dark:text-blue-300">{inquiry.previewLabel}</summary>
        <label htmlFor="data-inquiry-template" className="mt-3 block font-medium">{inquiry.templateLabel}</label>
        <textarea ref={textRef} id="data-inquiry-template" readOnly value={inquiry.fullText} rows={12} spellCheck={false} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100" />
      </details>
    </section>
  );
}
