import { Link } from 'react-router-dom';
import { buildRateAnswerParagraph, LLMS_TXT_URL, PLAIN_CITE_EN, PLAIN_CITE_ES } from '../utils/citationCopy';

/**
 * Crawlable, plain-language rate answer for Google AI / LLM citation.
 * One block per page — do not duplicate CrossSourceBadge messaging.
 */
export default function AiCitationBlock({
  language = 'es',
  buy,
  sell,
  updatedAt,
  sourcesUsed = [],
  citePath = '/dolar-blue-hoy',
  showCopyButton = false,
  className = '',
}) {
  const es = language === 'es';
  const answer = buildRateAnswerParagraph({
    buy,
    sell,
    updatedAt,
    sourcesUsed,
    language,
    citePath,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(es ? PLAIN_CITE_ES : PLAIN_CITE_EN);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      className={`rounded-xl border border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/30 px-4 py-4 sm:px-6 sm:py-5 ${className}`}
      aria-label={es ? 'Respuesta sobre el dólar blue hoy' : 'Blue dollar answer for today'}
      data-ai-citation="rate-answer"
    >
      <p
        id={citePath === '/' ? 'respuesta-dolar-blue-bolivia' : 'respuesta-dolar-blue-hoy'}
        className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-100"
      >
        {answer}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
        <Link to="/fuente-de-datos" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          {es ? 'Metodología' : 'Methodology'}
        </Link>
        <Link to="/prensa" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          {es ? 'Cómo citar' : 'How to cite'}
        </Link>
        <a href={LLMS_TXT_URL} className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          llms.txt
        </a>
        <Link to="/api-docs" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          API
        </Link>
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            {es ? 'Copiar cita' : 'Copy citation'}
          </button>
        )}
      </div>
    </section>
  );
}
