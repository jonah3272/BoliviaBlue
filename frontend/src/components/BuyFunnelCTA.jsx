import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AIRTM_REFERRAL_LINK,
  ELDORADO_REFERRAL_LINK,
  TAKENOS_REFERRAL_LINK,
  MERU_REFERRAL_LINK,
  BUY_GUIDE_PATH,
  getWhatsAppRateShareUrl,
} from '../config/referrals';
import { BinanceButton } from './BrandButton';
import {
  trackBuyFunnelViewed,
  trackWhatsAppShareClicked,
  trackRelatedLinkClicked,
  trackReferralClicked,
} from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

const quietBtn =
  'inline-flex items-center justify-center h-11 px-4 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap';

/**
 * Compact monetization block (rate → Binance + partner chips).
 * Prefer PartnerAdCarousel for the primary rotating funnel.
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
      className={`relative overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-white/95 dark:bg-gray-800/95 ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
      data-buy-funnel={placement}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400/80" />

      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
        <div className="text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {language === 'es' ? '¿Necesitás dólares ahora?' : 'Need dollars now?'}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl min-h-[2.5rem]">
            {rateLabel
              ? language === 'es'
                ? `Paralelo ~${rateLabel} Bs. Elegí Binance P2P, El Dorado, Takenos, Meru o Airtm.`
                : `Parallel ~${rateLabel} Bs. Choose Binance P2P, El Dorado, Takenos, Meru or Airtm.`
              : language === 'es'
                ? 'Elegí Binance P2P, El Dorado, Takenos, Meru o Airtm según cómo quieras operar.'
                : 'Choose Binance P2P, El Dorado, Takenos, Meru or Airtm based on how you want to operate.'}
          </p>
        </div>

        <div className="flex justify-center md:justify-start">
          <BinanceButton
            size="md"
            placement={placement}
            className="h-12 w-full sm:w-auto sm:min-w-[16rem] justify-center text-base"
          >
            {language === 'es' ? 'Crear cuenta Binance' : 'Create Binance account'}
          </BinanceButton>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <a
            href={ELDORADO_REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackReferralClicked({
                language,
                partner: 'eldorado',
                placement,
                destination: ELDORADO_REFERRAL_LINK,
                link_label: 'eldorado_quiet',
              })
            }
            className={`${quietBtn} border-amber-500/50 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40`}
          >
            El Dorado
          </a>
          <a
            href={TAKENOS_REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackReferralClicked({
                language,
                partner: 'takenos',
                placement,
                destination: TAKENOS_REFERRAL_LINK,
                link_label: 'takenos_quiet',
              })
            }
            className={`${quietBtn} border-sky-500/50 text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40`}
          >
            Takenos
          </a>
          <a
            href={MERU_REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackReferralClicked({
                language,
                partner: 'meru',
                placement,
                destination: MERU_REFERRAL_LINK,
                link_label: 'meru_quiet',
              })
            }
            className={`${quietBtn} border-indigo-500/50 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40`}
          >
            Meru
          </a>
          <a
            href={AIRTM_REFERRAL_LINK}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackReferralClicked({
                language,
                partner: 'airtm',
                placement,
                destination: AIRTM_REFERRAL_LINK,
                link_label: 'airtm_quiet',
              })
            }
            className={`${quietBtn} border-cyan-600/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40`}
          >
            Airtm
          </a>
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
              className={`${quietBtn} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60`}
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
            className={`${quietBtn} gap-1.5 border-[#25D366]/50 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/10`}
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
