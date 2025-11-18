import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';

function About() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

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
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('aboutAIDetails')}
              </p>
            </div>

            {/* Detailed Sentiment Methodology */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {language === 'es' ? 'Metodología de Análisis de Sentimiento' : 'Sentiment Analysis Methodology'}
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {language === 'es' 
                  ? 'Nuestro sistema de análisis de sentimiento utiliza un enfoque avanzado que va más allá de simplemente contar artículos positivos o negativos. Cada artículo se analiza para determinar su impacto real en el tipo de cambio del dólar.'
                  : 'Our sentiment analysis system uses an advanced approach that goes beyond simply counting positive or negative articles. Each article is analyzed to determine its actual impact on the dollar exchange rate.'}
              </p>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">1.</span>
                    {language === 'es' ? 'Fuerza del Sentimiento (0-100)' : 'Sentiment Strength (0-100)'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'Cada artículo se analiza mediante IA (GPT-4o-mini) o análisis de palabras clave para determinar qué tan impactante es para el dólar. Artículos con mayor impacto (crisis económica, devaluación, intervención del BCB, cambios de política monetaria) reciben un puntaje de fuerza más alto (70-100), mientras que artículos con menor impacto reciben puntajes más bajos (20-50).'
                      : 'Each article is analyzed using AI (GPT-4o-mini) or keyword analysis to determine how impactful it is for the dollar. Higher impact articles (economic crisis, devaluation, BCB intervention, monetary policy changes) receive a higher strength score (70-100), while lower impact articles receive lower scores (20-50).'}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">2.</span>
                    {language === 'es' ? 'Ponderación Temporal' : 'Time Weighting'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'Los artículos más recientes tienen mayor peso en el cálculo. Utilizamos un decaimiento exponencial donde los artículos pierden peso gradualmente cada 12 horas. Esto asegura que las noticias más actuales tengan mayor influencia en el sentimiento.'
                      : 'More recent articles have greater weight in the calculation. We use exponential decay where articles gradually lose weight every 12 hours. This ensures that the most current news has greater influence on sentiment.'}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">3.</span>
                    {language === 'es' ? 'Ponderación por Categoría' : 'Category Weighting'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'Los artículos directamente relacionados con divisas, economía y política monetaria tienen un peso 1.5x mayor que los artículos generales. Esto prioriza información más relevante para el tipo de cambio.'
                      : 'Articles directly related to currency, economics, and monetary policy have 1.5x greater weight than general articles. This prioritizes information more relevant to the exchange rate.'}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400">4.</span>
                    {language === 'es' ? 'Límite por Cantidad de Artículos' : 'Count-Based Score Capping'}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {language === 'es'
                      ? 'Para evitar puntajes extremos con pocos artículos, el puntaje máximo se escala dinámicamente según el número de artículos analizados: 1 artículo (máx. ±20), 2 artículos (máx. ±30), 3 artículos (máx. ±35), 4 artículos (máx. ±40), 5+ artículos (máx. ±50). Esto proporciona una representación más precisa y conservadora del sentimiento cuando hay datos limitados.'
                      : 'To prevent extreme scores with few articles, the maximum score scales dynamically based on the number of articles analyzed: 1 article (max ±20), 2 articles (max ±30), 3 articles (max ±35), 4 articles (max ±40), 5+ articles (max ±50). This provides a more accurate and conservative representation of sentiment when data is limited.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '💡 Cómo Interpretar el Puntaje' : '💡 How to Interpret the Score'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Puntaje Positivo (+)' : 'Positive Score (+)'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {language === 'es'
                        ? 'Indica que el dólar está subiendo (más Bs por USD). Ejemplo: si el tipo de cambio pasa de 10 a 11 BOB/USD, el dólar subió.'
                        : 'Indicates the dollar is rising (more BOB per USD). Example: if the exchange rate goes from 10 to 11 BOB/USD, the dollar rose.'}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Puntaje Negativo (-)' : 'Negative Score (-)'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {language === 'es'
                        ? 'Indica que el dólar está bajando (menos Bs por USD). Ejemplo: si el tipo de cambio pasa de 10 a 9 BOB/USD, el dólar bajó.'
                        : 'Indicates the dollar is falling (fewer BOB per USD). Example: if the exchange rate goes from 10 to 9 BOB/USD, the dollar fell.'}
                    </p>
                  </div>
                </div>
              </div>
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

          {/* Contact */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('aboutContactTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutContactDesc')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('aboutLastUpdate')}
            </p>
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

