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

function pathCtaClass(theme) {
  if (theme === 'eldorado') return 'bg-stone-950 text-[#F5C518] hover:bg-stone-800';
  if (theme === 'takenos') return 'bg-sky-500 text-white hover:bg-sky-400';
  if (theme === 'airtm') return 'bg-cyan-500 text-white hover:bg-cyan-400';
  return 'bg-[#F0B90B] text-stone-950 hover:bg-yellow-300';
}

function pathAccent(theme) {
  if (theme === 'eldorado') return 'border-amber-300/80 dark:border-amber-700/60';
  if (theme === 'takenos') return 'border-sky-300/80 dark:border-sky-700/60';
  if (theme === 'airtm') return 'border-cyan-300/80 dark:border-cyan-700/60';
  return 'border-yellow-300/80 dark:border-yellow-700/60';
}

function BuyDollars() {
  useAdsenseReady();

  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);

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
    {
      title: t('buyDollarsStep1Title'),
      desc: t('buyDollarsStep1Desc'),
      cta: true,
    },
    { title: t('buyDollarsStep2Title'), desc: t('buyDollarsStep2Desc') },
    { title: t('buyDollarsStep3Title'), desc: t('buyDollarsStep3Desc') },
    { title: t('buyDollarsStep4Title'), desc: t('buyDollarsStep4Desc') },
    { title: t('buyDollarsStep5Title'), desc: t('buyDollarsStep5Desc') },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name:
      language === 'es'
        ? 'Cómo comprar dólares en Bolivia'
        : 'How to buy dollars in Bolivia',
    description:
      language === 'es'
        ? 'Guía para comprar dólares en Bolivia con Binance P2P, El Dorado, Takenos y Airtm.'
        : 'Guide to buy dollars in Bolivia with Binance P2P, El Dorado, Takenos, and Airtm.',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  const onPartnerClick = (ad, placement) => {
    trackReferralClicked({
      language,
      partner: ad.partner,
      placement,
      destination: ad.href,
      link_label: `buy_page_${ad.partner}`,
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={
          language === 'es'
            ? 'Cómo Comprar Dólares en Bolivia - Binance, El Dorado, Takenos - Bolivia Blue con Paz'
            : 'How to Buy Dollars in Bolivia - Binance, El Dorado, Takenos - Bolivia Blue with Paz'
        }
        description={
          language === 'es'
            ? 'Elegí cómo comprar dólares en Bolivia: Binance P2P, El Dorado, Takenos o Airtm. Tasa paralelo en vivo y guía paso a paso.'
            : 'Choose how to buy dollars in Bolivia: Binance P2P, El Dorado, Takenos, or Airtm. Live parallel rate and step-by-step guide.'
        }
        keywords={
          language === 'es'
            ? 'comprar dólares bolivia, binance p2p bolivia, el dorado bolivia, takenos bolivia, airtm bolivia, dólar blue bolivia'
            : 'buy dollars bolivia, binance p2p bolivia, el dorado bolivia, takenos bolivia, airtm bolivia, blue dollar bolivia'
        }
        canonical="/comprar-dolares"
        structuredData={howToSchema}
      />

      <Header />
      <Navigation />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
        <PartnerAdCarousel placement="buy_page_top" midRate={midRate} />
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t('buyDollarsPageTitle')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          {language === 'es'
            ? 'Varias formas de acercarte al dólar paralelo. Elegí la que encaje con lo que necesitás.'
            : 'Several ways to reach the parallel dollar. Pick the one that fits what you need.'}
        </p>
        {midRate != null && (
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'es' ? 'Paralelo ahora' : 'Parallel now'}:{' '}
            <span className="font-mono text-lg text-gray-900 dark:text-white">
              {formatRate(midRate, 'USD')}
            </span>{' '}
            Bs / USD
          </p>
        )}
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* All referral paths */}
        <section id="opciones" className="scroll-mt-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
            {language === 'es' ? 'Elegí tu camino' : 'Choose your path'}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Opciones para comprar dólares' : 'Options to buy dollars'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'Usá nuestros enlaces para registrarte. Cada plataforma sirve un caso distinto.'
              : 'Use our links to sign up. Each platform fits a different use case.'}
          </p>

          <div className="space-y-4">
            {partners.map((ad) => (
              <article
                key={ad.id}
                className={`rounded-2xl border bg-white/70 dark:bg-gray-800/60 p-5 sm:p-6 ${pathAccent(ad.theme)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {ad.brand}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {ad.pathLabel}
                    </p>
                  </div>
                  {ad.badge && (
                    <span className="rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1">
                      {ad.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {ad.pathDesc}
                </p>
                <a
                  href={ad.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => onPartnerClick(ad, 'buy_page_paths')}
                  className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold shadow-sm transition ${pathCtaClass(ad.theme)}`}
                >
                  {ad.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Binance deep guide — still the most common P2P walkthrough */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
            {language === 'es' ? 'Guía detallada' : 'Detailed guide'}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Binance P2P paso a paso' : 'Binance P2P step by step'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {language === 'es'
              ? 'Si elegís Binance (la vía más líquida en Bolivia), seguí estos pasos. Registráte con nuestro enlace.'
              : 'If you choose Binance (the most liquid path in Bolivia), follow these steps. Sign up with our link.'}
          </p>

          <div className="mb-8">
            <BinanceButton size="lg" placement="buy_page_primary" className="w-full sm:w-auto justify-center">
              {language === 'es' ? 'Crear cuenta en Binance' : 'Create Binance account'}
            </BinanceButton>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('buyDollarsStepByStep')}
          </h3>
          <ol className="space-y-6">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                  {step.cta && (
                    <div className="mt-3">
                      <BinanceButton size="md" placement="buy_page_step1">
                        {language === 'es' ? 'Registrarse en Binance' : 'Sign up on Binance'}
                      </BinanceButton>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('buyDollarsSafetyTips')}
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className="flex gap-2">
                <span className="text-amber-600 dark:text-amber-400">✓</span>
                <span>{t(`buyDollarsSafetyTip${n}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('buyDollarsFAQ')}
          </h2>
          <div className="space-y-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t(`buyDollarsFAQ${n}Q`)}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(`buyDollarsFAQ${n}A`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center border-t border-gray-200 dark:border-gray-700 pt-8 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'es' ? '¿Listo para empezar?' : 'Ready to start?'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {partners.map((ad) => (
              <a
                key={ad.id}
                href={ad.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => onPartnerClick(ad, 'buy_page_bottom')}
                className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold ${pathCtaClass(ad.theme)}`}
              >
                {ad.brand}
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            <Link to="/plataformas" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {language === 'es' ? 'Comparar plataformas' : 'Compare platforms'}
            </Link>
            {' · '}
            <a
              href={BINANCE_REFERRAL_LINK}
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              binance.com
            </a>
          </p>
        </section>
      </main>

      {/* Sticky: jump to all options, not Binance-only */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 sm:hidden backdrop-blur">
        <a
          href="#opciones"
          className="flex w-full h-11 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-bold"
        >
          {language === 'es' ? 'Ver opciones para comprar' : 'See buy options'}
        </a>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />

      <Footer />
    </div>
  );
}

export default BuyDollars;
