import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
import BlueRateCards from '../components/BlueRateCards';
import { Link } from 'react-router-dom';

function FAQ() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  const [showOfficial, setShowOfficial] = useState(false);

  // FAQ structured data
  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": t('faqQ1'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA1')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ2'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA2')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ3'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA3')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ4'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA4')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ5'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA5')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ6'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA6')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ7'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA7')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ8'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA8')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ9'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA9')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ10'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA10')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ11'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA11')
          }
        },
        {
          "@type": "Question",
          "name": t('faqQ12'),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": t('faqA12')
          }
        }
      ]
    };

  const faqs = [
    { q: 'faqQ1', a: 'faqA1' },
    { q: 'faqQ2', a: 'faqA2' },
    { q: 'faqQ3', a: 'faqA3' },
    { q: 'faqQ4', a: 'faqA4' },
    { q: 'faqQ5', a: 'faqA5' },
    { q: 'faqQ6', a: 'faqA6' },
    { q: 'faqQ7', a: 'faqA7' },
    { q: 'faqQ8', a: 'faqA8' },
    { q: 'faqQ9', a: 'faqA9' },
    { q: 'faqQ10', a: 'faqA10' },
    { q: 'faqQ11', a: 'faqA11' },
    { q: 'faqQ12', a: 'faqA12' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={t('faqPageTitle')}
        description={t('faqPageSubtitle')}
        keywords={language === 'es'
          ? "preguntas frecuentes dólar blue, faq tipo cambio bolivia, dudas dólar paralelo, preguntas bolivia blue, qué es dólar blue, cómo funciona dólar blue, preguntas frecuentes bolivia blue, mejor que bolivianblue.net"
          : "blue dollar faq, exchange rate questions bolivia, parallel dollar questions, bolivia blue faq, what is blue dollar, how blue dollar works, bolivia blue frequently asked questions, better than bolivianblue.net"}
        canonical="/faq"
        structuredData={faqSchema}
      />
      
      <Header />
      <Navigation />

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Rate Cards */}
            <section className="mb-8">
              <BlueRateCards showOfficial={showOfficial} setShowOfficial={setShowOfficial} />
            </section>
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
              {/* Hero Section */}
              <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('faqPageTitle')}
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('faqPageSubtitle')}
                </p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {language === 'es' 
                    ? 'Encuentra respuestas rápidas a las preguntas más comunes sobre el bolivia blue rate, el tipo de cambio del dólar blue, y cómo usar nuestra plataforma.'
                    : 'Find quick answers to the most common questions about bolivia blue rate, blue dollar exchange rate, and how to use our platform.'}
                </p>
              </div>

              {/* FAQ Categories */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {language === 'es' ? 'Categorías' : 'Categories'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <a href="#basics" className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    {language === 'es' ? 'Conceptos Básicos' : 'Basics'}
                  </a>
                  <a href="#rates" className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                    {language === 'es' ? 'Tasas de Cambio' : 'Exchange Rates'}
                  </a>
                  <a href="#usage" className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    {language === 'es' ? 'Uso de la Plataforma' : 'Platform Usage'}
                  </a>
                  <a href="#safety" className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                    {language === 'es' ? 'Seguridad' : 'Safety'}
                  </a>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-8">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    id={index < 3 ? 'basics' : index < 6 ? 'rates' : index < 9 ? 'usage' : 'safety'}
                    className="scroll-mt-20 border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                          {t(faq.q)}
                        </h2>
                        <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line prose prose-sm dark:prose-invert max-w-none">
                          {t(faq.a)}
                        </div>
                        {faq.q === 'faqQ5' && (
                          <div className="mt-4">
                            <Link
                              to="/buy-dollars"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {language === 'es' ? 'Ver guía completa para comprar dólares' : 'View complete guide to buying dollars'}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Help */}
              <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t('faqStillHaveQuestions')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {t('faqStillHaveQuestionsDesc')}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('faqLearnMore')}
                    </Link>
                    <Link
                      to="/rodrigo-paz"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('faqAboutRodrigoPaz')}
                    </Link>
                  </div>
                </div>
              </section>
              
              {/* Quick Links */}
              <section className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/calculator" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Calculadora' : 'Calculator'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Convierte USD a BOB y viceversa' : 'Convert USD to BOB and vice versa'}
                    </div>
                  </Link>
                  <Link to="/bolivia-blue-rate" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Guía completa sobre el dólar blue' : 'Complete guide about blue dollar'}
                    </div>
                  </Link>
                  <Link to="/buy-dollars" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Comprar Dólares' : 'Buy Dollars'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Guía paso a paso' : 'Step-by-step guide'}
                    </div>
                  </Link>
                  <Link to="/blog" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {language === 'es' ? 'Blog' : 'Blog'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'es' ? 'Artículos y guías' : 'Articles and guides'}
                    </div>
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

export default FAQ;

