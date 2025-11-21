import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function About() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={t('aboutPageTitle')}
        description={language === 'es'
          ? "Conoce cómo funciona Bolivia Blue con Paz. Metodología, fuentes de datos, análisis con IA, y transparencia en el seguimiento del tipo de cambio del dólar blue en Bolivia."
          : "Learn how Bolivia Blue with Paz works. Methodology, data sources, AI analysis, and transparency in tracking the blue dollar exchange rate in Bolivia."}
        keywords={language === 'es'
          ? "acerca de bolivia blue, metodología tipo cambio, cómo funciona dólar blue, transparencia bolivia, cómo se calcula dólar blue, fuente datos bolivia blue, metodología binance p2p, mejor que bolivianblue"
          : "about bolivia blue, exchange rate methodology, how blue dollar works, bolivia transparency, how blue dollar calculated, bolivia blue data source, binance p2p methodology, better than bolivianblue"}
        canonical="/about"
      />
      
      <Header />

      {/* Navigation */}
      <Navigation />

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Rate Cards */}
            <section className="mb-8">
              <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
            </section>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('aboutPageTitle')}
          </h1>

          {/* Mission Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutMissionTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutMissionDesc')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('aboutMissionDesc2')}
            </p>
          </section>

          {/* Methodology Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutMethodology')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutMethodologyDesc')}
            </p>
            
            <div className="space-y-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('aboutBlueMarket')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('aboutBlueMarketDesc')}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('aboutOfficialRate')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('aboutOfficialRateDesc')}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('aboutUpdateFrequency')}
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
                <li>{t('aboutUpdateFrequency1')}</li>
                <li>{t('aboutUpdateFrequency2')}</li>
                <li>{t('aboutUpdateFrequency3')}</li>
              </ul>
            </div>
          </section>

          {/* Data Sources Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutDataSources')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutDataSourcesDesc')}
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{t('aboutDataSource1Title')}</strong> {t('aboutDataSource1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{t('aboutDataSource2Title')}</strong> {t('aboutDataSource2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{t('aboutDataSource3Title')}</strong> {t('aboutDataSource3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{t('aboutDataSource4Title')}</strong> {t('aboutDataSource4')}</span>
              </li>
            </ul>
          </section>

          {/* AI Sentiment Analysis */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutAITitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutAIDesc')}
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('aboutAIDetails')}
              </p>
            </div>
          </section>

          {/* Trust & Transparency */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutTransparency')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutTransparencyDesc')}
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>{t('aboutTransparency1')}</li>
              <li>{t('aboutTransparency2')}</li>
              <li>{t('aboutTransparency3')}</li>
              <li>{t('aboutTransparency4')}</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutCaveatsTitle')}
            </h2>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                <strong>{t('aboutCaveatsTitle')}</strong> {t('aboutCaveatsDesc')}
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
                <li>{t('aboutCaveats1')}</li>
                <li>{t('aboutCaveats2')}</li>
                <li>{t('aboutCaveats3')}</li>
                <li>{t('aboutCaveats4')}</li>
              </ul>
            </div>
          </section>

        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('aboutFooter')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default About;

