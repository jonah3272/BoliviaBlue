import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFinancialOffer, BUY_GUIDE_PATH, RECEIVE_PAYMENTS_INTENT } from '../config/referrals';
import { useOfferImpression } from '../hooks/useOfferImpression';
import { trackReferralClicked, trackRelatedLinkClicked } from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

export function FinancialOfferButton({ offer: providedOffer, placement, className = '', trackImpression = true, children }) {
  const language = useLanguage()?.language || 'es';
  const offer = providedOffer || getFinancialOffer(language);
  const ref = useOfferImpression({ offer, language, placement, enabled: trackImpression });
  return <a ref={ref} href={offer.href} target="_blank" rel="noopener noreferrer sponsored"
    data-offer-id={offer.id}
    onClick={() => trackReferralClicked({ language, partner: offer.partner, placement, destination: offer.href, link_label: offer.cta, offer_id: offer.id, intent: offer.intent, variant: offer.variant })}
    className={`google-anno-skip inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-bold leading-snug shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${offer.partner === 'takenos' ? 'bg-sky-700 text-white hover:bg-sky-800' : 'bg-amber-400 text-stone-950 hover:bg-amber-300'} ${className}`}>{children || offer.cta}</a>;
}

export function OfferComparisonLink({ offer, placement }) {
  const language = useLanguage()?.language || 'es';
  const ref = useOfferImpression({ offer, language, placement });
  return <div ref={ref} className="min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <h3 className="font-bold text-gray-900 dark:text-white">{offer.brand}</h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{offer.pathDesc}</p>
    <a href={offer.href} target="_blank" rel="noopener noreferrer sponsored" className="mt-3 inline-block py-2 text-sm font-semibold text-sky-700 dark:text-sky-300 underline underline-offset-4"
      onClick={() => trackReferralClicked({ language, partner: offer.partner, placement, destination: offer.href, link_label: offer.cta, offer_id: offer.id, intent: offer.intent, variant: offer.variant })}>{offer.cta} →</a>
  </div>;
}

export default function FinancialOfferCard({ placement = 'financial_offer', intent, midRate = null, guideHref, offer: providedOffer }) {
  const language = useLanguage()?.language || 'es';
  const es = language === 'es';
  const offer = providedOffer || getFinancialOffer(language, intent);
  const ref = useOfferImpression({ offer, language, placement });
  const guide = guideHref || `${BUY_GUIDE_PATH}?intent=${offer.intent}${es ? '' : '&lang=en'}#guia`;
  const rateLabel = midRate != null && Number.isFinite(Number(midRate)) ? formatRate(midRate, 'USD') : null;
  return <section ref={ref} data-financial-offer={offer.id} className="google-anno-skip min-w-0 rounded-2xl border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{offer.brand} · {es ? 'Enlace de referido' : 'Referral link'}</p>
    <h2 className="text-xl sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white">{offer.headline}</h2>
    <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">{offer.body}</p>
    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{offer.qualification}</p>
    <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <FinancialOfferButton offer={offer} placement={placement} trackImpression={false} />
      <Link to={guide} className="inline-flex min-h-[44px] items-center justify-center px-2 text-center text-sm font-semibold text-sky-700 dark:text-sky-300 underline underline-offset-4"
        onClick={() => trackRelatedLinkClicked({ language, destination: guide, link_label: offer.guideLabel, page_type: 'financial_offer' })}>{offer.guideLabel}</Link>
    </div>
    {offer.handoff && <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{offer.handoff}</p>}
    {rateLabel && offer.intent !== RECEIVE_PAYMENTS_INTENT && <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{es ? `Referencia del mercado: ~${rateLabel} Bs/USD. El precio y monto final se confirman en El Dorado.` : `Market reference: ~${rateLabel} Bs/USD. The final price and amount are confirmed in El Dorado.`}</p>}
    <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{offer.disclosure}</p>
  </section>;
}

export function OfferExposure({ offer, placement, children, as: Tag = 'div', ...props }) {
  const language = useLanguage()?.language || 'es';
  const ref = useOfferImpression({ offer, language, placement });
  return <Tag ref={ref} {...props}>{children}</Tag>;
}
