import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';

function RodrigoPaz() {
  const { t, language } = useLanguage();

  // Person structured data
  const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Rodrigo Paz",
      "jobTitle": "Presidente de Bolivia",
      "worksFor": {
        "@type": "Organization",
        "name": "Estado Plurinacional de Bolivia"
      },
      "nationality": {
        "@type": "Country",
        "name": "Bolivia"
      }
    };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={t('rodrigoPazPageTitle')}
        description={language === 'es'
          ? "Información sobre la presidencia de Rodrigo Paz en Bolivia y su impacto en el tipo de cambio del dólar blue. Políticas económicas, decisiones cambiarias y contexto histórico."
          : "Information about Rodrigo Paz's presidency in Bolivia and its impact on the blue dollar exchange rate. Economic policies, exchange decisions and historical context."}
        keywords={language === 'es'
          ? "Rodrigo Paz Bolivia, presidente Bolivia, políticas económicas Paz, dólar blue Rodrigo Paz, economía bolivia 2025, impacto Rodrigo Paz dólar, políticas cambiarias Paz, presidencia Rodrigo Paz, mejor información Rodrigo Paz"
          : "Rodrigo Paz Bolivia, Bolivia president, Paz economic policies, blue dollar Rodrigo Paz, bolivia economy 2025, Rodrigo Paz dollar impact, Paz exchange policies, Rodrigo Paz presidency, best Rodrigo Paz information"}
        canonical="/rodrigo-paz"
        structuredData={personSchema}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Bolivia Blue
              </h1>
            </Link>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs />
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('rodrigoPazPageTitle')}
          </h1>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('rodrigoPazIntro')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('rodrigoPazIntro2')}
            </p>
          </section>

          {/* Presidency Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('rodrigoPazPresidencyTitle')}
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazTimeline1Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazTimeline1Desc')}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazTimeline2Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazTimeline2Desc')}
                </p>
              </div>
            </div>
          </section>

          {/* Economic Policies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('rodrigoPazEconomicPoliciesTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('rodrigoPazEconomicPoliciesDesc')}
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazPolicy1Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazPolicy1Desc')}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazPolicy2Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazPolicy2Desc')}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazPolicy3Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazPolicy3Desc')}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('rodrigoPazPolicy4Title')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('rodrigoPazPolicy4Desc')}
                </p>
              </div>
            </div>
          </section>

          {/* Impact on Blue Rate */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('rodrigoPazBlueRateTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('rodrigoPazBlueRateDesc')}
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('rodrigoPazBlueRateFactorsTitle')}
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
                <li>{t('rodrigoPazBlueRateFactor1')}</li>
                <li>{t('rodrigoPazBlueRateFactor2')}</li>
                <li>{t('rodrigoPazBlueRateFactor3')}</li>
                <li>{t('rodrigoPazBlueRateFactor4')}</li>
                <li>{t('rodrigoPazBlueRateFactor5')}</li>
              </ul>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('rodrigoPazBlueRateConclusion')}
            </p>
          </section>

          {/* Recent Changes & Initiatives */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('rodrigoPazRecentChangesTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('rodrigoPazRecentChangesDesc')}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('rodrigoPazChange1Title')}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('rodrigoPazChange1Desc')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('rodrigoPazChange2Title')}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('rodrigoPazChange2Desc')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('rodrigoPazChange3Title')}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('rodrigoPazChange3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Connection to This Site */}
          <section className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('rodrigoPazConnectionTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('rodrigoPazConnectionDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('rodrigoPazViewDashboard')}
              </Link>
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {t('rodrigoPazViewNews')}
              </Link>
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

export default RodrigoPaz;

