import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';

function FAQ() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

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
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('faqPageTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t('faqPageSubtitle')}
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t(faq.q)}
                </h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {t(faq.a)}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('faqStillHaveQuestions')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t('faqStillHaveQuestionsDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('faqLearnMore')}
              </Link>
              <Link
                to="/rodrigo-paz"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('faqAboutRodrigoPaz')}
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

