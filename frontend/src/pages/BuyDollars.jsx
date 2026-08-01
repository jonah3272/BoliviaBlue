import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import PartnerAdCarousel from '../components/PartnerAdCarousel';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { fetchBlueRate } from '../utils/api';
import { BINANCE_REFERRAL_LINK, getPartnerAds } from '../config/referrals';
import { BinanceButton } from '../components/BrandButton';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { formatRate } from '../utils/formatters';
import { trackReferralClicked } from '../utils/analyticsEvents';

function brandMark(theme) {
  if (theme === 'takenos') {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 3c-2.8 2.2-4.5 4.8-4.5 7.6A4.5 4.5 0 0012 15a4.5 4.5 0 004.5-4.4C16.5 7.8 14.8 5.2 12 3z" />
        </svg>
      </span>
    );
  }
  if (theme === 'airtm') {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 text-sm font-black shadow-md">
        AT
      </span>
    );
  }
  if (theme === 'binance') {
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0B90B] text-black text-lg font-black shadow-md">
        B
      </span>
    );
  }
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5C518] text-stone-950 text-lg font-black shadow-md">
      ◆
    </span>
  );
}

function pathGlow(theme) {
  if (theme === 'eldorado') return 'hover:border-amber-400/70 hover:shadow-[0_0_0_1px_rgba(245,197,24,0.25)]';
  if (theme === 'takenos') return 'hover:border-sky-400/70 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.25)]';
  if (theme === 'airtm') return 'hover:border-cyan-400/70 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.25)]';
  return 'hover:border-yellow-400/70 hover:shadow-[0_0_0_1px_rgba(240,185,11,0.25)]';
}

function pathCta(theme) {
  if (theme === 'eldorado') return 'bg-stone-950 text-[#F5C518] dark:bg-[#F5C518] dark:text-stone-950';
  if (theme === 'takenos') return 'bg-sky-500 text-white';
  if (theme === 'airtm') return 'bg-cyan-400 text-slate-950';
  return 'bg-[#F0B90B] text-stone-950';
}

function BuyDollars() {
  useAdsenseReady();

  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const es = language === 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        setCurrentRate(await fetchBlueRate());
      } catch (err) {
        console.error('Error loading rate:', err);
      }
    };
    loadRate();
  }, []);

  const midRate = useMemo(() => {
    const buy = currentRate?.buy ?? currentRate?.buy_bob_per_usd;
    const sell = currentRate?.sell ?? currentRate?.sell_bob_per_usd;
    if (Number.isFinite(buy) && Number.isFinite(sell)) return (buy + sell) / 2;
    if (Number.isFinite(buy)) return buy;
    return null;
  }, [currentRate]);

  const partners = useMemo(() => getPartnerAds(language), [language]);

  const steps = [
    { title: t('buyDollarsStep1Title'), desc: t('buyDollarsStep1Desc'), cta: true },
    { title: t('buyDollarsStep2Title'), desc: t('buyDollarsStep2Desc') },
    { title: t('buyDollarsStep3Title'), desc: t('buyDollarsStep3Desc') },
    { title: t('buyDollarsStep4Title'), desc: t('buyDollarsStep4Desc') },
    { title: t('buyDollarsStep5Title'), desc: t('buyDollarsStep5Desc') },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: es ? 'Cómo comprar dólares en Bolivia' : 'How to buy dollars in Bolivia',
    description: es
      ? 'Guía para comprar dólares en Bolivia con Binance P2P, El Dorado, Takenos y Airtm.'
      : 'Guide to buy dollars in Bolivia with Binance P2P, El Dorado, Takenos, and Airtm.',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  const openPartner = (ad, placement, e) => {
    e.preventDefault();
    trackReferralClicked({
      language,
      partner: ad.partner,
      placement,
      destination: ad.href,
      link_label: `buy_page_${ad.partner}`,
    });
    window.open(ad.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={
          es
            ? 'Cómo Comprar Dólares en Bolivia - Binance, El Dorado, Takenos - Bolivia Blue con Paz'
            : 'How to Buy Dollars in Bolivia - Binance, El Dorado, Takenos - Bolivia Blue with Paz'
        }
        description={
          es
            ? 'Elegí cómo comprar dólares en Bolivia: Binance P2P, El Dorado, Takenos o Airtm. Tasa paralelo en vivo y guía paso a paso.'
            : 'Choose how to buy dollars in Bolivia: Binance P2P, El Dorado, Takenos, or Airtm. Live parallel rate and step-by-step guide.'
        }
        keywords={
          es
            ? 'comprar dólares bolivia, binance p2p bolivia, el dorado bolivia, takenos bolivia, airtm bolivia, dólar blue bolivia'
            : 'buy dollars bolivia, binance p2p bolivia, el dorado bolivia, takenos bolivia, airtm bolivia, blue dollar bolivia'
        }
        canonical="/comprar-dolares"
        structuredData={howToSchema}
      />

      <Header />
      <Navigation />

      {/* Hero intro — before rates so the page job is clear */}
      <section className="relative overflow-hidden border-b border-gray-200/60 dark:border-gray-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(245,197,24,0.10), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-3">
            {es ? 'Guía práctica' : 'Practical guide'}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
            {t('buyDollarsPageTitle')}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {es
              ? 'Cuatro caminos al dólar paralelo. Elegí según lo que necesitás — cuenta USD, tarjeta, o P2P líquido.'
              : 'Four paths to the parallel dollar. Pick by what you need — USD account, card, or liquid P2P.'}
          </p>
          {midRate != null && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {es ? 'Paralelo ahora' : 'Parallel now'}{' '}
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {formatRate(midRate, 'USD')}
              </span>{' '}
              Bs / USD
            </p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <PartnerAdCarousel placement="buy_page_top" midRate={midRate} />
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {/* Path picker — entire row is the link */}
        <section id="opciones" className="scroll-mt-24 pt-6">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 mb-2">
              {es ? 'Elegí tu camino' : 'Choose your path'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {es ? 'Dónde comprar dólares hoy' : 'Where to buy dollars today'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
              {es
                ? 'Tocá cualquier opción para registrarte con nuestro enlace. Cada una sirve un caso distinto.'
                : 'Tap any option to sign up with our link. Each one fits a different use case.'}
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {partners.map((ad, i) => (
              <a
                key={ad.id}
                href={ad.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={(e) => openPartner(ad, 'buy_page_paths', e)}
                className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 ${pathGlow(ad.theme)}`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {brandMark(ad.theme)}
                    <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {ad.brand}
                      </h3>
                      {ad.badge && (
                        <span className="rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-white dark:text-gray-900">
                          {ad.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-1.5">
                      {ad.bestFor}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {ad.pathDesc}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold shadow-sm transition duration-200 group-hover:scale-[1.02] ${pathCta(ad.theme)}`}
                >
                  {ad.cta}
                  <svg
                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            <Link to="/plataformas" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300">
              {es ? 'Ver comparación completa de plataformas' : 'See full platform comparison'}
            </Link>
          </p>
        </section>

        {/* Binance walkthrough */}
        <section className="rounded-3xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-gray-900 p-6 sm:p-8 lg:p-10">
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
                  ? 'La vía más líquida en Bolivia. Registráte con nuestro enlace y seguí estos pasos.'
                  : 'The most liquid path in Bolivia. Sign up with our link and follow these steps.'}
              </p>
            </div>
            <BinanceButton size="lg" placement="buy_page_primary" className="justify-center shrink-0">
              {es ? 'Crear cuenta Binance' : 'Create Binance account'}
            </BinanceButton>
          </div>

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
                        {es ? 'Registrarse en Binance' : 'Sign up on Binance'}
                      </BinanceButton>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Safety */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('buyDollarsSafetyTips')}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <li
                key={n}
                className="flex gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40 px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="mt-0.5 text-emerald-500 font-bold" aria-hidden>
                  ✓
                </span>
                <span>{t(`buyDollarsSafetyTip${n}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ accordion */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('buyDollarsFAQ')}
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 border-y border-gray-200 dark:border-gray-700">
            {[1, 2, 3, 4].map((n) => {
              const open = openFaq === n;
              return (
                <div key={n}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : n)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {t(`buyDollarsFAQ${n}Q`)}
                    </span>
                    <span
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed -mt-1">
                      {t(`buyDollarsFAQ${n}A`)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA strip */}
        <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-black px-6 py-8 sm:px-10 sm:py-10 text-center text-white">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {es ? '¿Listo para comprar?' : 'Ready to buy?'}
          </h2>
          <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
            {es
              ? 'Empezá por la opción que mejor encaje. Todos los enlaces son nuestros referrals.'
              : 'Start with the option that fits best. All links are our referrals.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {partners.map((ad) => (
              <a
                key={ad.id}
                href={ad.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={(e) => openPartner(ad, 'buy_page_bottom', e)}
                className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold transition hover:opacity-90 ${pathCta(ad.theme)}`}
              >
                {ad.brand}
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/40">
            <Link to="/plataformas" className="underline underline-offset-2 hover:text-white/70">
              {es ? 'Comparar plataformas' : 'Compare platforms'}
            </Link>
            {' · '}
            <a
              href={BINANCE_REFERRAL_LINK}
              className="underline underline-offset-2 hover:text-white/70"
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              binance.com
            </a>
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 sm:hidden backdrop-blur">
        <a
          href="#opciones"
          className="flex w-full h-11 items-center justify-center rounded-xl bg-sky-500 text-white text-sm font-bold shadow-md"
        >
          {es ? 'Ver opciones para comprar' : 'See buy options'}
        </a>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />

      <Footer />
    </div>
  );
}

export default BuyDollars;
