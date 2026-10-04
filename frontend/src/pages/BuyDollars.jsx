import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import PlatformRatesBoard from '../components/PlatformRatesBoard';
import FinancialOfferCard, { FinancialOfferButton, OfferComparisonLink } from '../components/FinancialOfferCard';
import Footer from '../components/Footer';
import EldoradoMoneyGuide from '../components/EldoradoMoneyGuide';
import { getBuyGuidePage } from '../data/buyGuidePage';
import { fetchBlueRate } from '../utils/api';
import { getPartnerAds, BUY_USDT_INTENT, RECEIVE_PAYMENTS_INTENT } from '../config/referrals';
import { BinanceButton } from '../components/BrandButton';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function BuyDollars() {
  useAdsenseReady();
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const es = language === 'es';
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const stickyRef = useRef(null);
  const page = getBuyGuidePage(language, params.get('intent'), params.get('operation'));
  const { intent, operation, offer, howToSchema } = page;
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  useEffect(() => {
    const node = stickyRef.current;
    if (!node) return undefined;
    const measure = () => document.documentElement.style.setProperty('--bb-buy-cta-height', `${node.getBoundingClientRect().height}px`);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      document.documentElement.style.removeProperty('--bb-buy-cta-height');
    };
  }, []);
  useEffect(() => {
    if (location.hash === '#guia') document.getElementById('guia')?.scrollIntoView({ block: 'start' });
  }, [location.key, location.hash]);

  useEffect(() => {
    let cancelled = false;
    fetchBlueRate().then((rate) => { if (!cancelled) setCurrentRate(rate); }).catch((err) => console.error('Error loading rate:', err));
    return () => { cancelled = true; };
  }, []);
  const midRate = useMemo(() => {
    const buy = currentRate?.buy ?? currentRate?.buy_bob_per_usd;
    const sell = currentRate?.sell ?? currentRate?.sell_bob_per_usd;
    if (Number.isFinite(buy) && Number.isFinite(sell)) return (buy + sell) / 2;
    return Number.isFinite(buy) ? buy : null;
  }, [currentRate]);
  const partners = getPartnerAds(language).filter((ad) => ad.partner !== offer.partner);
  const steps = [1, 2, 3, 4, 5].map((n) => ({ title: t(`buyDollarsStep${n}Title`), desc: t(`buyDollarsStep${n}Desc`), cta: n === 1 }));
  const selectOperation = (nextOperation) => {
    const next = new URLSearchParams(params);
    next.set('operation', nextOperation);
    setParams(next, { preventScrollReset: true });
  };
  const selectIntent = (nextIntent) => {
    const next = new URLSearchParams(params);
    next.set('intent', nextIntent);
    setParams(next, { preventScrollReset: true });
  };
  return <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
    <PageMeta title={page.title}
      description={page.description}
      canonical="/comprar-dolares" structuredData={howToSchema} />
    <Header />
    <Navigation />
    <main className="google-anno-skip max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-20 space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">{es ? 'De la cotización al siguiente paso' : 'From the exchange rate to your next step'}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{page.heading}</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">{page.introduction}</p>
        <div role="group" aria-label={es ? 'Tu objetivo' : 'Your goal'} className="mt-5 grid grid-cols-2 gap-2">
          {[[BUY_USDT_INTENT, es ? 'Comprar USDT' : 'Buy USDT'], [RECEIVE_PAYMENTS_INTENT, es ? 'Cobrar del exterior' : 'Get paid from abroad']].map(([value, label]) => <button key={value} type="button" aria-pressed={intent === value} onClick={() => selectIntent(value)}
            className={`min-w-0 min-h-[48px] rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${intent === value ? 'border-sky-700 bg-sky-700 text-white' : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'}`}>{label}</button>)}
        </div>
        <div className="mt-4"><FinancialOfferCard placement="buy_page_top" offer={offer} intent={intent} midRate={midRate} guideHref={`?${params.toString()}#guia`} /></div>
      </section>
      <section id="guia" className="scroll-mt-[calc(var(--bb-header-height,117px)+4rem)] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-7">
        {intent === BUY_USDT_INTENT ? <EldoradoMoneyGuide offer={offer} direction={operation} onDirectionChange={selectOperation} currentRate={currentRate} /> : <>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{offer.guideLabel}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{offer.brand} · {offer.qualification}</p>
        <ol className="mt-5 space-y-5">{offer.steps.map(([title, body], index) => <li key={`${offer.id}-${index}`} className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800 dark:bg-sky-900 dark:text-sky-100">{index + 1}</span>
          <div className="min-w-0"><h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{body}</p></div>
        </li>)}</ol>
        <a href={offer.source} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block py-2 text-sm text-sky-700 dark:text-sky-300 underline">{es ? 'Ver instrucciones oficiales del proveedor' : 'Read the provider’s official instructions'}</a>
        </>}
        {intent === RECEIVE_PAYMENTS_INTENT && <><div className="mt-3"><FinancialOfferButton offer={offer} placement="buy_page_guide" /></div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{offer.disclosure}</p></>}
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">{es ? 'Compará con la referencia del mercado' : 'Compare with the market reference'}</h2>
        <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{es ? 'Las referencias no son ofertas ejecutables. Confirmá precio, comisiones y monto final en cada proveedor.' : 'These references are not executable offers. Confirm the price, fees and final amount with each provider.'}</p>
      </section>
      <section id="opciones">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{es ? 'Otras opciones para comparar' : 'Other options to compare'}</h2>
        <p className="mt-2 mb-4 text-sm text-gray-600 dark:text-gray-300">{es ? 'Los enlaces de referido pueden generar una comisión para Bolivia Blue. Revisá condiciones, costos y disponibilidad.' : 'Referral links may earn Bolivia Blue a commission. Review terms, costs and availability.'}</p>
        <div className="grid gap-3 sm:grid-cols-2">{partners.map((ad) => <OfferComparisonLink key={ad.id} offer={ad} placement="buy_page_comparison" />)}</div>
        <Link to="/plataformas" className="mt-4 inline-block py-2 text-sm text-sky-700 dark:text-sky-300 underline">{es ? 'Comparación completa de plataformas' : 'Full platform comparison'}</Link>
      </section>
      <details className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <summary className="cursor-pointer py-2 font-semibold text-gray-900 dark:text-white">{es ? '¿Preferís Binance? Guía de compra P2P' : 'Prefer Binance? P2P buying guide'}</summary>
        {/* Binance walkthrough */}
        <div className="rounded-3xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-gray-900 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-2">
                {es ? 'Guía detallada' : 'Detailed guide'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {es ? 'Binance P2P paso a paso' : 'Binance P2P step by step'}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                {es
                  ? 'Esta guía explica cómo pagar BOB para recibir USDT. El enlace abre una invitación de Binance; revisá sus condiciones.'
                  : 'This guide explains paying BOB to receive USDT. The link opens a Binance invitation; review its terms.'}
              </p>
            </div>
            <BinanceButton size="lg" placement="buy_page_binance_secondary" className="justify-center shrink-0">
              {language === 'es' ? 'Ver invitación Binance' : 'View Binance invitation'}
            </BinanceButton>
          </div>

          <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
            {es ? 'USDT no es efectivo USD. Las tasas mostradas son referencias, no precios garantizados. ' : 'USDT is not USD cash. Displayed rates are references, not guaranteed execution prices. '}
            <a href="https://www.binance.com/en/support/faq/detail/360039384951" target="_blank" rel="noopener noreferrer" className="underline">{es ? 'Instrucciones oficiales de compra' : 'Official buying instructions'}</a>
          </p>
          <ol className="space-y-0 divide-y divide-amber-200/50 dark:divide-amber-900/40">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0B90B] text-sm font-black text-stone-950">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                  {step.cta && (
                    <div className="mt-3">
                      <BinanceButton size="md" placement="buy_page_step1">
                        {language === 'es' ? 'Ver invitación Binance' : 'View Binance invitation'}
                      </BinanceButton>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>


      </details>
      <section>
        <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{es ? 'Antes de pagar' : 'Before you pay'}</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{es ? 'Verificá los datos del destinatario, los costos y la orden. Usá el chat y la ayuda de la plataforma. Las reseñas y la custodia temporal no eliminan el riesgo de fraude o demoras. Si ya pagaste, no canceles sin haber recibido el reembolso.' : 'Verify recipient details, costs and the order. Use the platform’s chat and help. Reviews and temporary escrow do not eliminate fraud or delays. If you already paid, do not cancel unless you have received a refund.'}</p>
      </section>
      <details className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <summary className="cursor-pointer py-2 font-semibold text-gray-900 dark:text-white">{es ? 'Ver cotizaciones por plataforma' : 'View platform quotes'}</summary>
        <PlatformRatesBoard placement="buy_page_platforms" />
      </details>
      <section>
        <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{t('buyDollarsFAQ')}</h2>
        {[1, 2, 3, 4].map((n) => <div key={n} className="border-b border-gray-200 dark:border-gray-700">
          <button type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-gray-900 dark:text-white" onClick={() => setOpenFaq(openFaq === n ? null : n)} aria-expanded={openFaq === n}>{t(`buyDollarsFAQ${n}Q`)}<span aria-hidden>{openFaq === n ? '−' : '+'}</span></button>
          {openFaq === n && <p className="pb-4 text-sm text-gray-600 dark:text-gray-300">{t(`buyDollarsFAQ${n}A`)}</p>}
        </div>)}
      </section>
    </main>
    <div ref={stickyRef} className="google-anno-skip fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+var(--bb-ad-reserved-bottom,0px))] inset-x-0 z-40 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 sm:hidden backdrop-blur">
      <FinancialOfferButton offer={offer} placement="buy_page_sticky" className="w-full"><span>{offer.cta}<span className="block text-[10px] font-normal">{es ? 'Enlace de referido' : 'Referral link'}</span></span></FinancialOfferButton>
    </div>
    <div className="h-[calc(7rem+env(safe-area-inset-bottom))] sm:hidden" aria-hidden />
    <Footer />
  </div>;
}
export default BuyDollars;
