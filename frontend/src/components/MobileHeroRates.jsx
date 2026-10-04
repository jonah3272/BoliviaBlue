import { formatDateTime } from '../utils/formatters';

/** Keep the mobile hero's three quote rows present while RateContext settles. */
export default function MobileHeroRates({ live, rate, loading, error, language }) {
  const es = language === 'es';
  const observed = formatDateTime(rate?.updated_at_iso, es ? 'es-BO' : 'en-US');
  const hasQuote = Boolean(live.buyStr && live.sellStr);
  const pending = !hasQuote && loading && !error;
  const conversion = live.times(100);
  const state = hasQuote ? (rate?.is_stale ? 'stale' : 'ready') : pending ? 'loading' : 'unavailable';

  return (
    <div data-mobile-hero-rates data-state={state} aria-busy={pending}>
      <p className="mt-2 flex min-h-16 flex-col justify-center gap-x-1 text-2xl font-bold leading-8 tabular-nums text-gray-900 dark:text-white min-[400px]:min-h-8 min-[400px]:flex-row">
        <span>{es ? 'Compra' : 'Buy'} {live.buyStr || '—'}</span>{' '}
        <span>· {es ? 'Venta' : 'Sell'} {live.sellStr || '—'}</span>
      </p>
      <p className="mt-2 min-h-5 text-sm font-semibold leading-5 text-gray-800 dark:text-gray-200">
        100 USD ≈ {conversion || '—'} Bs
      </p>
      <p className={`mt-1 min-h-8 text-xs leading-4 ${error && !rate ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>
        {observed ? (
          <>
            <span className="block">
              {es ? 'Lectura P2P' : 'P2P reading'}:{' '}
              <time dateTime={rate.updated_at_iso}>{observed}</time>
            </span>{' '}
            <span className="block">
              {es ? '(hora de Bolivia)' : '(Bolivia time)'}
              {rate?.is_stale ? (es ? ' · dato desactualizado' : ' · stale reading') : ''}
            </span>
          </>
        ) : error && !rate ? (
          <>
            <span className="block">{es ? 'No hay una lectura nueva.' : 'No new reading yet.'}</span>{' '}
            <span className="block">{es ? 'Reintentando…' : 'Retrying…'}</span>
          </>
        ) : (
          <span>
            {hasQuote
              ? (es ? 'Hora de lectura no disponible.' : 'Reading time unavailable.')
              : pending
                ? (es ? 'Cargando lectura P2P…' : 'Loading P2P reading…')
                : (es ? 'Lectura P2P no disponible.' : 'P2P reading unavailable.')}
          </span>
        )}
      </p>
    </div>
  );
}
