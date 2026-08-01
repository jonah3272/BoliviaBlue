/**
 * Stable-height rate snapshot for currency conversion SEO pages.
 * Always mounts the same layout for loading / ready / error to avoid CLS.
 */

const ACCENT = {
  blue: {
    section:
      'bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800',
    buy: 'text-blue-600 dark:text-blue-400',
    sell: 'text-green-600 dark:text-green-400',
    tertiary: 'text-purple-600 dark:text-purple-400',
  },
  green: {
    section:
      'bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 border-green-200 dark:border-green-800',
    buy: 'text-green-600 dark:text-green-400',
    sell: 'text-yellow-600 dark:text-yellow-400',
    tertiary: 'text-purple-600 dark:text-purple-400',
  },
  purple: {
    section:
      'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-purple-200 dark:border-purple-800',
    buy: 'text-purple-600 dark:text-purple-400',
    sell: 'text-blue-600 dark:text-blue-400',
    tertiary: 'text-purple-600 dark:text-purple-400',
  },
};

function RateValue({ value, className, loading }) {
  return (
    <div
      className={`text-2xl font-bold tabular-nums leading-tight min-h-[2rem] ${className}`}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="inline-block skeleton h-7 w-28 align-middle" aria-hidden="true" />
      ) : (
        value
      )}
    </div>
  );
}

function SnapshotCard({ topLabel, valueDisplay, bottomLabel, valueClass, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md min-h-[7.5rem] flex flex-col justify-center">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 min-h-[1.25rem]">{topLabel}</div>
      <RateValue
        loading={loading}
        value={valueDisplay ? `${valueDisplay} BOB` : '—'}
        className={valueClass}
      />
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 min-h-[1rem]">{bottomLabel || '\u00a0'}</div>
    </div>
  );
}

/**
 * @param {{
 *   language: string,
 *   accent?: 'blue'|'green'|'purple',
 *   title: string,
 *   cards: Array<{ topLabel: string, valueDisplay: string|null, bottomLabel?: string, tone?: 'buy'|'sell'|'tertiary' }>,
 *   footnote: string,
 *   isLoading?: boolean,
 *   errorMessage?: string|null,
 * }} props
 */
export default function CurrencyRateSnapshot({
  language,
  accent = 'blue',
  title,
  cards,
  footnote,
  isLoading = false,
  errorMessage = null,
}) {
  const colors = ACCENT[accent] || ACCENT.blue;
  const hasAnyValue = cards?.some((c) => c.valueDisplay);
  const loading = isLoading && !hasAnyValue;

  return (
    <section
      className={`rounded-xl p-6 sm:p-8 border-2 ${colors.section}`}
      data-currency-rate-snapshot
      aria-live="polite"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 min-h-[1.75rem] sm:min-h-[2rem]">
          {title}
        </h2>

        {errorMessage && !loading ? (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {(cards || []).map((card, i) => (
            <SnapshotCard
              key={i}
              topLabel={card.topLabel}
              valueDisplay={card.valueDisplay}
              bottomLabel={card.bottomLabel}
              valueClass={colors[card.tone || (i === 0 ? 'buy' : i === 1 ? 'sell' : 'tertiary')]}
              loading={loading}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[1.25rem]">{footnote}</p>
      </div>
    </section>
  );
}

/**
 * Always-rendered conversion list so prose height stays stable.
 */
export function CurrencyConversionList({
  fromCode,
  rate,
  amounts = [1, 10, 50, 100, 500, 1000],
  isLoading = false,
}) {
  const n = Number(rate);
  const hasRate = Number.isFinite(n);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 min-h-[12rem]">
      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
        {amounts.map((amt) => (
          <li key={amt} className="min-h-[1.5rem] tabular-nums">
            <strong>
              {amt} {fromCode}
            </strong>
            {' = '}
            {isLoading && !hasRate ? (
              <span className="inline-block skeleton h-4 w-24 align-middle" aria-hidden="true" />
            ) : (
              <>{(hasRate ? n * amt : 0).toFixed(2)} BOB</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
