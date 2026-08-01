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
import { BINANCE_REFERRAL_LINK } from '../config/referrals';
import { BinanceButton, AirtmButton } from '../components/BrandButton';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { formatRate } from '../utils/formatters';

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
        ? 'Cómo comprar dólares en Bolivia usando Binance P2P'
        : 'How to buy dollars in Bolivia using Binance P2P',
    description:
      language === 'es'
        ? 'Guía paso a paso para comprar dólares en Bolivia con Binance P2P.'
        : 'Step-by-step guide to buy dollars in Bolivia with Binance P2P.',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={
          language === 'es'
            ? 'Cómo Comprar Dólares en Bolivia - Binance P2P - Bolivia Blue con Paz'
            : 'How to Buy Dollars in Bolivia - Binance P2P - Bolivia Blue with Paz'
        }
        description={
          language === 'es'
            ? 'Guía clara para comprar dólares en Bolivia con Binance P2P. Tasa actual, pasos y consejos de seguridad.'
            : 'Clear guide to buy dollars in Bolivia with Binance P2P. Current rate, steps, and safety tips.'
        }
        keywords={
          language === 'es'
            ? 'comprar dólares bolivia, binance p2p bolivia, cómo comprar dólares, dólar blue bolivia, comprar usdt bolivia'
            : 'buy dollars bolivia, binance p2p bolivia, how to buy dollars, blue dollar bolivia, buy usdt bolivia'
        }
        canonical="/comprar-dolares"
        structuredData={howToSchema}
      />

      <Header />
      <Navigation />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 min-h-[15.5rem]">
        <PartnerAdCarousel placement="buy_page_top" midRate={midRate} />
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t('buyDollarsPageTitle')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          {t('buyDollarsPageSubtitle')}
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
        {/* Primary path: Binance only */}
        <section className="border-t border-b border-gray-200 dark:border-gray-700 py-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
            {language === 'es' ? 'Camino recomendado' : 'Recommended path'}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Binance P2P
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
            {language === 'es'
              ? 'La vía más líquida en Bolivia: creá cuenta, comprá USDT y vendé/comprá en P2P a tasa de mercado. Usá nuestro enlace para registrarte.'
              : 'The most liquid path in Bolivia: create an account, buy USDT, then trade on P2P at market rate. Use our link to sign up.'}
          </p>
          <BinanceButton size="lg" placement="buy_page_primary" className="w-full sm:w-auto justify-center">
            {language === 'es' ? '1. Crear cuenta en Binance' : '1. Create Binance account'}
          </BinanceButton>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('buyDollarsStepByStep')}
          </h2>
          <ol className="space-y-6">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
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

        {/* Secondary: Airtm — one line, not equal weight */}
        <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'es' ? 'Alternativa: Airtm' : 'Alternative: Airtm'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {language === 'es'
              ? 'Si preferís una wallet más simple (a menudo con comisión), Airtm también sirve para mover dólares.'
              : 'If you prefer a simpler wallet (often with fees), Airtm also works for moving dollars.'}
          </p>
          <AirtmButton size="md" placement="buy_page_airtm">
            {language === 'es' ? 'Abrir Airtm' : 'Open Airtm'}
          </AirtmButton>
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

        <section className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {language === 'es'
              ? 'Listo para empezar'
              : 'Ready to start'}
          </p>
          <BinanceButton size="lg" placement="buy_page_bottom" className="justify-center">
            {language === 'es' ? 'Crear cuenta Binance' : 'Create Binance account'}
          </BinanceButton>
          <p className="mt-4 text-xs text-gray-500">
            <Link to="/plataformas" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              {language === 'es' ? 'Comparar otras plataformas' : 'Compare other platforms'}
            </Link>
            {' · '}
            <a
              href={BINANCE_REFERRAL_LINK}
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              binance.com
            </a>
          </p>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 sm:hidden backdrop-blur">
        <BinanceButton size="md" placement="buy_page_sticky" className="w-full justify-center">
          {language === 'es' ? 'Crear cuenta Binance' : 'Create Binance account'}
        </BinanceButton>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />

      <Footer />
    </div>
  );
}

export default BuyDollars;
