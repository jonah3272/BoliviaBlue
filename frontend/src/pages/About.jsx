import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BlueRateCards from '../components/BlueRateCards';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAdsenseReady } from '../hooks/useAdsenseReady';

function About() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
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
        canonical="/acerca-de"
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
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('aboutMissionDesc2')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'es' 
                ? 'En un mercado donde la información sobre el tipo de cambio puede ser confusa o difícil de acceder, Bolivia Blue con Paz se compromete a proporcionar datos precisos, actualizados y completamente transparentes. Creemos que cada boliviano tiene derecho a conocer el precio real del dólar, ya sea para tomar decisiones financieras personales, realizar transacciones comerciales, o simplemente mantenerse informado sobre la situación económica del país.'
                : 'In a market where exchange rate information can be confusing or difficult to access, Bolivia Blue with Paz is committed to providing accurate, up-to-date, and completely transparent data. We believe every Bolivian has the right to know the real price of the dollar, whether for personal financial decisions, commercial transactions, or simply staying informed about the country\'s economic situation.'}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'es' 
                ? 'Nuestra plataforma es completamente gratuita y accesible para todos, sin necesidad de registro ni suscripción. Operamos con total transparencia, mostrando exactamente cómo calculamos nuestras tasas y de dónde provienen nuestros datos. Este compromiso con la transparencia es fundamental para construir confianza y ayudar a los usuarios a tomar decisiones informadas.'
                : 'Our platform is completely free and accessible to everyone, with no registration or subscription required. We operate with complete transparency, showing exactly how we calculate our rates and where our data comes from. This commitment to transparency is fundamental to building trust and helping users make informed decisions.'}
            </p>
          </section>

          {/* Why We Built This Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? '¿Por Qué Construimos Esta Plataforma?' : 'Why We Built This Platform'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'es' 
                ? 'El mercado cambiario en Bolivia ha sido históricamente opaco y difícil de navegar. Muchos bolivianos dependen del dólar para sus transacciones diarias, remesas familiares, o inversiones, pero encontrar información precisa y actualizada sobre el tipo de cambio real ha sido un desafío constante. Las tasas oficiales del Banco Central no siempre reflejan el precio real al que se pueden realizar transacciones en el mercado paralelo.'
                : 'The exchange market in Bolivia has historically been opaque and difficult to navigate. Many Bolivians depend on the dollar for their daily transactions, family remittances, or investments, but finding accurate and up-to-date information about the real exchange rate has been a constant challenge. The Central Bank\'s official rates do not always reflect the real price at which transactions can be made in the parallel market.'}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'es' 
                ? 'Con la llegada de plataformas digitales como Binance P2P, el mercado paralelo se ha vuelto más accesible y transparente. Sin embargo, aún existe una necesidad de una fuente centralizada de información que agregue datos de múltiples fuentes, los analice, y los presente de manera clara y comprensible. Bolivia Blue con Paz nació de esta necesidad: crear una plataforma que democratice el acceso a información precisa sobre el tipo de cambio del dólar blue.'
                : 'With the arrival of digital platforms like Binance P2P, the parallel market has become more accessible and transparent. However, there is still a need for a centralized source of information that aggregates data from multiple sources, analyzes it, and presents it in a clear and understandable way. Bolivia Blue with Paz was born from this need: to create a platform that democratizes access to accurate information about the blue dollar exchange rate.'}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'es' 
                ? 'Bajo la administración del presidente Rodrigo Paz, el contexto económico de Bolivia está evolucionando, y es más importante que nunca tener acceso a información precisa y actualizada sobre el mercado cambiario. Nuestra plataforma no solo proporciona datos en tiempo real, sino que también ofrece análisis de tendencias, noticias relevantes, y herramientas prácticas como calculadoras y alertas de precio.'
                : 'Under President Rodrigo Paz\'s administration, Bolivia\'s economic context is evolving, and it is more important than ever to have access to accurate and up-to-date information about the exchange market. Our platform not only provides real-time data but also offers trend analysis, relevant news, and practical tools like calculators and price alerts.'}
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

      <Footer />
    </div>
  );
}

export default About;

