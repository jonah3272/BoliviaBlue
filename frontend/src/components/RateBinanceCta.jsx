import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { BUY_GUIDE_PATH } from '../config/referrals';
import { BinanceButton } from './BrandButton';
import { formatRate } from '../utils/formatters';
import { trackBuyFunnelViewed, trackRelatedLinkClicked } from '../utils/analyticsEvents';

/**
 * Single paid CTA for rate/SEO surfaces. Do not rotate partners here.
 */
export default function RateBinanceCta({ placement = 'rate_binance', midRate = null }) {
  const language = useLanguage()?.language || 'es';
  const es = language === 'es';
  const rootRef = useRef(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || viewedRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackBuyFunnelViewed({ language, placement });
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [language, placement]);

  const rateLabel =
    midRate != null && Number.isFinite(Number(midRate))
      ? formatRate(midRate, 'USD')
      : null;

  return (
    <div
      ref={rootRef}
      className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-white/95 dark:bg-gray-800/95 p-4 sm:p-5"
      data-rate-binance={placement}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {es ? 'Comprá USDT al paralelo' : 'Buy USDT at the parallel rate'}
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            {rateLabel
              ? es
                ? `~${rateLabel} Bs · Binance P2P, el camino más usado en Bolivia.`
                : `~${rateLabel} Bs · Binance P2P, the most used path in Bolivia.`
              : es
                ? 'Binance P2P, el camino más usado en Bolivia para acercarte al blue.'
                : 'Binance P2P, the most used path in Bolivia to the blue rate.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <BinanceButton
            size="md"
            placement={placement}
            className="h-11 w-full sm:w-auto justify-center"
          >
            {es ? 'Comprar en Binance' : 'Buy on Binance'}
          </BinanceButton>
          <Link
            to={BUY_GUIDE_PATH}
            onClick={() =>
              trackRelatedLinkClicked({
                language,
                destination: BUY_GUIDE_PATH,
                link_label: `buy_guide_from_${placement}`,
                page_type: 'rate_binance',
              })
            }
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
          >
            {es ? 'Otras opciones' : 'Other options'}
          </Link>
        </div>
      </div>
    </div>
  );
}
