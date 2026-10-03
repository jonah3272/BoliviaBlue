import { Link } from 'react-router-dom';
import { useOptionalRate } from '../contexts/RateContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { headerRateSnapshot } from '../utils/headerRate';
import { formatRate } from '../utils/formatters';

export default function HeaderRates() {
  const context = useOptionalRate();
  const { currency } = useCurrency();
  const { language } = useLanguage();
  const es = language === 'es';
  const quote = headerRateSnapshot(context?.rateData, currency, { error: Boolean(context?.error) });
  const status = !quote.available
    ? context?.isLoading ? (es ? 'Cargando' : 'Loading') : (es ? 'Sin dato' : 'Unavailable')
    : quote.stale ? (es ? 'Dato anterior' : 'Older quote') : 'P2P';
  return (
    <Link
      to={quote.path}
      className="google-anno-skip flex min-h-9 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 border-t border-gray-200/70 dark:border-gray-700/70 bg-gray-50/90 dark:bg-gray-900/70 px-3 py-1.5 text-[11px] sm:text-xs tabular-nums"
      data-header-rates
      title={quote.updatedAt ? `${es ? 'Observación' : 'Observation'}: ${quote.updatedAt}` : undefined}
    >
      <span className="font-medium text-gray-600 dark:text-gray-300">Bs/{quote.currency}</span>
      <span className="text-gray-700 dark:text-gray-200">{es ? 'Compra' : 'Buy'} <strong className="font-mono text-gray-950 dark:text-white">{formatRate(quote.buy, quote.currency)}</strong></span>
      <span className="text-gray-700 dark:text-gray-200">{es ? 'Venta' : 'Sell'} <strong className="font-mono text-gray-950 dark:text-white">{formatRate(quote.sell, quote.currency)}</strong></span>
      <span className={quote.stale && quote.available ? 'font-medium text-amber-700 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}>{status}</span>
    </Link>
  );
}
