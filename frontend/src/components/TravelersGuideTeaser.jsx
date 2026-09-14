import { Link } from 'react-router-dom';
import { travelGuidePath } from '../config/travelGuide';
import { trackRelatedLinkClicked } from '../utils/analyticsEvents';

/**
 * Quiet homepage entry to the traveler money guide — below the rates, not a hero.
 */
export default function TravelersGuideTeaser({ language = 'es' }) {
  const es = language === 'es';
  const to = travelGuidePath(language);

  return (
    <aside className="mt-6 max-w-2xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-5 py-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {es ? 'Viajeros' : 'Travelers'}
      </p>
      <h2 className="mt-1 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
        {es ? 'Guía de dinero para Bolivia (2026)' : 'Bolivia money guide (2026)'}
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {es
          ? 'Efectivo, tarjetas, cajeros y el dólar blue — con tasas en vivo, no con el 6,96 de blogs viejos.'
          : 'Cash, cards, ATMs, and the blue dollar — with live rates, not leftover 6.96 blog advice.'}
      </p>
      <Link
        to={to}
        onClick={() =>
          trackRelatedLinkClicked({
            language,
            destination: to,
            link_label: 'travelers_guide_teaser',
            page_type: 'home',
          })
        }
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {es ? 'Leer la guía' : 'Read the guide'}
      </Link>
    </aside>
  );
}
