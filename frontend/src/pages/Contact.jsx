import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';

function Contact() {
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": language === 'es' ? "Inicio" : "Home",
        "item": "https://boliviablue.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": language === 'es' ? "Contacto" : "Contact",
        "item": "https://boliviablue.com/contact"
      }
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bolivia Blue con Paz",
    "url": "https://boliviablue.com",
    "logo": "https://boliviablue.com/favicon-96x96.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["Spanish", "English"],
      "areaServed": "BO"
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Contacto - Bolivia Blue con Paz | Preguntas y Sugerencias'
          : 'Contact - Bolivia Blue with Paz | Questions and Suggestions'}
        description={language === 'es'
          ? 'Contáctanos para preguntas sobre el tipo de cambio del dólar blue en Bolivia, reportar errores, o enviar sugerencias. Respondemos todas las consultas.'
          : 'Contact us for questions about Bolivia blue dollar exchange rate, report errors, or send suggestions. We respond to all inquiries.'}
        keywords={language === 'es'
          ? 'contacto bolivia blue, soporte dolar blue bolivia, preguntas tipo cambio, ayuda bolivia blue, contactar boliviablue.com'
          : 'contact bolivia blue, bolivia blue dollar support, exchange rate questions, bolivia blue help, contact boliviablue.com'}
        canonical="/contact"
        structuredData={[breadcrumbSchema, organizationSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              {language === 'es' ? 'Inicio' : 'Home'}
            </Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              {language === 'es' ? 'Contacto' : 'Contact'}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '📧 Contáctanos' : '📧 Contact Us'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {language === 'es'
              ? 'Estamos aquí para ayudarte con cualquier pregunta sobre el dólar blue en Bolivia'
              : 'We\'re here to help with any questions about the blue dollar in Bolivia'}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Email Contact */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="text-5xl mb-4 text-center">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {language === 'es' ? 'Email' : 'Email'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
              {language === 'es'
                ? 'Para consultas generales, soporte técnico o reportar errores'
                : 'For general inquiries, technical support or report errors'}
            </p>
            <div className="text-center">
              <a 
                href="mailto:contact@boliviablue.com" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@boliviablue.com
              </a>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800">
            <div className="text-5xl mb-4 text-center">❓</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {language === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
              {language === 'es'
                ? 'Encuentra respuestas a las preguntas más comunes sobre el dólar blue'
                : 'Find answers to the most common questions about the blue dollar'}
            </p>
            <div className="text-center">
              <Link 
                to="/faq" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'es' ? 'Ver FAQ' : 'View FAQ'}
              </Link>
            </div>
          </div>
        </div>

        {/* What You Can Contact Us About */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '💬 ¿En qué podemos ayudarte?' : '💬 How can we help you?'}
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Preguntas sobre el servicio' : 'Service questions'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es'
                    ? 'Consultas sobre cómo funciona el sitio, fuentes de datos, o interpretación de tasas'
                    : 'Questions about how the site works, data sources, or rate interpretation'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Reportar errores técnicos' : 'Report technical errors'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es'
                    ? 'Problemas con la carga del sitio, datos incorrectos, o bugs en calculadoras'
                    : 'Issues with site loading, incorrect data, or calculator bugs'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Sugerencias de mejora' : 'Improvement suggestions'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es'
                    ? 'Ideas para nuevas funcionalidades, diseño, o contenido que te gustaría ver'
                    : 'Ideas for new features, design, or content you\'d like to see'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Colaboraciones y prensa' : 'Partnerships and press'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'es'
                    ? 'Oportunidades de colaboración, menciones en medios, o integraciones API'
                    : 'Partnership opportunities, media mentions, or API integrations'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Response Time */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg mb-12">
          <div className="flex items-center justify-center gap-4">
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'es' ? 'Tiempo de respuesta' : 'Response time'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Respondemos todos los emails en menos de 24 horas (días hábiles)'
                  : 'We respond to all emails within 24 hours (business days)'}
              </p>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'es' ? '📚 Recursos Útiles' : '📚 Useful Resources'}
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/about" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">ℹ️</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Sobre Nosotros' : 'About Us'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Conoce más sobre el proyecto' : 'Learn more about the project'}
              </p>
            </Link>

            <Link to="/faq" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">❓</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Respuestas rápidas' : 'Quick answers'}
              </p>
            </Link>

            <Link to="/buy-dollars" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Guía de Compra' : 'Buying Guide'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Cómo comprar dólares' : 'How to buy dollars'}
              </p>
            </Link>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'es' ? 'Última actualización: ' : 'Last updated: '}
              {new Date().toLocaleString(language === 'es' ? 'es-BO' : 'en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                timeZone: 'America/La_Paz'
              })}
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;

