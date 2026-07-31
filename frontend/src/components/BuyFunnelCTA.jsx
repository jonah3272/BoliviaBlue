import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { BUY_GUIDE_PATH, getWhatsAppRateShareUrl } from '../config/referrals';
import { BinanceButton, AirtmButton } from './BrandButton';
import {
  trackBuyFunnelViewed,
  trackWhatsAppShareClicked,
  trackRelatedLinkClicked,
} from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

/**
 * Primary monetization block: rate → Binance signup → Airtm → guide → WhatsApp.
 * Used on Home, SEO rate pages (via BinanceBanner), and /comprar-dolares.
 */
function BuyFunnelCTA({
  placement = 'unknown',
  midRate = null,
  compact = false,
  showGuideLink = true,
}) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  useEffect(() => {
    trackBuyFunnelViewed({ language, placement });
  }, [language, placement]);

  const waUrl = useMemo(
    () => getWhatsAppRateShareUrl({ rate: midRate, language }),
    [midRate, language]
  );

  const rateLabel =
    midRate != null && Number.isFinite(Number(midRate))
      ? formatRate(midRate, 'USD')
      : null;

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
      data-buy-funnel={placement}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'} md:flex-row md:items-center`}>
        <div className="flex-1 text-center md:text-left min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {language === 'es' ? '¿Necesitás dólares ahora?' : 'Need dollars now?'}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {rateLabel
              ? language === 'es'
                ? `Paralelo ~${rateLabel} Bs. Creá cuenta en Binance y comprá USDT/P2P con la tasa del mercado.`
                : `Parallel ~${rateLabel} Bs. Create a Binance account and buy USDT/P2P at market rate.`
              : language === 'es'
                ? 'Creá cuenta en Binance y comprá USDT en P2P con la tasa del paralelo.'
                : 'Create a Binance account and buy USDT on P2P at the parallel rate.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2 flex-shrink-0">
          <BinanceButton size={compact ? 'md' : 'lg'} placement={placement} className="justify-center">
            {language === 'es' ? 'Crear cuenta Binance' : 'Create Binance account'}
          </BinanceButton>
          <AirtmButton size="md" placement={placement} className="justify-center">
            {language === 'es' ? 'Airtm' : 'Airtm'}
          </AirtmButton>
          {showGuideLink && (
            <Link
              to={BUY_GUIDE_PATH}
              onClick={() =>
                trackRelatedLinkClicked({
                  language,
                  destination: BUY_GUIDE_PATH,
                  link_label: `buy_guide_from_${placement}`,
                  page_type: 'buy_funnel',
                })
              }
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {language === 'es' ? 'Cómo comprar' : 'How to buy'}
            </Link>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsAppShareClicked({
                language,
                placement,
                has_rate: rateLabel != null,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default BuyFunnelCTA;
