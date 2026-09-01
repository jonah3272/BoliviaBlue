import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { PRIMARY_RATE_URL } from '../config/seo';

/** Funnel near-duplicate landings to the primary money URL */
export default function PrimaryRateLink({ className = '' }) {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div
      className={`rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 px-4 py-3 text-sm ${className}`}
    >
      <span className="text-gray-700 dark:text-gray-300">
        {es ? 'Cotización principal del día:' : 'Primary rate page:'}{' '}
      </span>
      <Link
        to={PRIMARY_RATE_URL}
        className="font-bold text-sky-700 dark:text-sky-300 hover:underline"
      >
        {es ? 'Dólar blue hoy →' : 'Blue dollar today →'}
      </Link>
    </div>
  );
}
