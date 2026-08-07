/**
 * Always-visible three-way rate comparison for SERP differentiation:
 * parallel (blue) vs BCB official vs legacy fixed reference.
 */
import { formatRate } from '../utils/formatters';

const LEGACY_FIXED = 6.96;

export default function RateTrioStrip({
  buy,
  sell,
  officialBuy,
  officialSell,
  language = 'es',
  updatedAt = null,
}) {
  const es = language === 'es';
  const blueMid =
    Number.isFinite(buy) && Number.isFinite(sell) ? (buy + sell) / 2 : Number.isFinite(buy) ? buy : null;
  const bcbMid =
    Number.isFinite(officialBuy) && Number.isFinite(officialSell)
      ? (officialBuy + officialSell) / 2
      : Number.isFinite(officialBuy)
        ? officialBuy
        : null;
  const gap =
    blueMid != null && bcbMid != null && bcbMid !== 0
      ? ((blueMid - bcbMid) / bcbMid) * 100
      : null;

  const cells = [
    {
      key: 'blue',
      label: es ? 'Paralelo (blue)' : 'Parallel (blue)',
      value: blueMid,
      sub:
        Number.isFinite(buy) && Number.isFinite(sell)
          ? `${es ? 'Compra' : 'Buy'} ${formatRate(buy)} · ${es ? 'Venta' : 'Sell'} ${formatRate(sell)}`
          : null,
      accent: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40',
      valueClass: 'text-blue-700 dark:text-blue-300',
    },
    {
      key: 'bcb',
      label: es ? 'BCB (oficial)' : 'BCB (official)',
      value: bcbMid,
      sub: es ? 'Publicado por el Banco Central' : 'Published by the Central Bank',
      accent: 'border-gray-400 bg-gray-50 dark:bg-gray-800/60',
      valueClass: 'text-gray-800 dark:text-gray-100',
    },
    {
      key: 'fixed',
      label: es ? 'Fijo histórico' : 'Legacy fixed',
      value: LEGACY_FIXED,
      sub: es ? 'Referencia 2011–2025 (ya no opera)' : '2011–2025 reference (no longer active)',
      accent: 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30',
      valueClass: 'text-amber-800 dark:text-amber-200',
    },
  ];

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm"
      aria-label={es ? 'Comparación de tipos de cambio' : 'Exchange rate comparison'}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {es ? 'Tres precios del dólar en Bolivia' : 'Three dollar prices in Bolivia'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            {es
              ? 'El paralelo es lo que la gente paga hoy. El BCB es la referencia oficial. El fijo histórico quedó como memoria del régimen anterior.'
              : 'Parallel is what people pay today. BCB is the official reference. The legacy fixed rate is historical only.'}
          </p>
        </div>
        {gap != null && (
          <div className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {es ? 'Brecha blue vs BCB' : 'Blue vs BCB gap'}:{' '}
            <span className={gap >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
              {gap >= 0 ? '+' : ''}
              {gap.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`rounded-xl border-l-4 ${c.accent} px-4 py-3`}
          >
            <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
              {c.label}
            </div>
            <div className={`mt-1 font-mono text-3xl font-bold tabular-nums ${c.valueClass}`}>
              {c.value != null ? formatRate(c.value) : '—'}
              <span className="text-sm font-semibold ml-1 opacity-70">Bs</span>
            </div>
            {c.sub && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-snug">{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {updatedAt && (
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-500">
          {es ? 'Lectura paralelo' : 'Parallel reading'}: {new Date(updatedAt).toLocaleString(es ? 'es-BO' : 'en-US')}
        </p>
      )}
    </section>
  );
}
