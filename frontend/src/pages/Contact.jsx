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
                to="/preguntas-frecuentes" 
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
            <Link to="/acerca-de" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">ℹ️</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Sobre Nosotros' : 'About Us'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Conoce más sobre el proyecto' : 'Learn more about the project'}
              </p>
            </Link>

            <Link to="/preguntas-frecuentes" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
              <div className="text-3xl mb-2">❓</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                {language === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'es' ? 'Respuestas rápidas' : 'Quick answers'}
              </p>
            </Link>

            <Link to="/comprar-dolares" className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all text-center">
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

        {/* Comprehensive Contact Information Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '📞 Información de Contacto Detallada' : '📞 Detailed Contact Information'}
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {language === 'es'
                ? 'En Bolivia Blue con Paz, valoramos la comunicación con nuestros usuarios. Estamos comprometidos a responder todas tus consultas de manera rápida y profesional. A continuación encontrarás información detallada sobre cómo contactarnos y qué esperar cuando lo hagas.'
                : 'At Bolivia Blue with Paz, we value communication with our users. We are committed to responding to all your inquiries quickly and professionally. Below you will find detailed information on how to contact us and what to expect when you do.'}
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {language === 'es' ? 'Horarios de Atención' : 'Support Hours'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'Nuestro equipo revisa y responde a todos los correos electrónicos durante días hábiles (lunes a viernes). Aunque no tenemos un horario de oficina físico, nos esforzamos por responder todas las consultas en menos de 24 horas durante días laborables. Para consultas urgentes relacionadas con errores técnicos críticos, hacemos nuestro mejor esfuerzo para responder lo antes posible.'
                : 'Our team reviews and responds to all emails during business days (Monday to Friday). Although we do not have a physical office schedule, we strive to respond to all inquiries within 24 hours during business days. For urgent inquiries related to critical technical errors, we do our best to respond as soon as possible.'}
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {language === 'es' ? 'Tipos de Consultas que Atendemos' : 'Types of Inquiries We Handle'}
            </h3>
            
            <div className="space-y-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '1. Preguntas sobre el Servicio' : '1. Service Questions'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? 'Respondemos preguntas sobre cómo funciona nuestra plataforma, cómo interpretamos los datos, nuestras fuentes de información, y nuestra metodología. Si tienes dudas sobre cómo leer los gráficos, entender las tasas, o usar nuestras herramientas, estamos aquí para ayudarte.'
                    : 'We answer questions about how our platform works, how we interpret data, our information sources, and our methodology. If you have questions about how to read the charts, understand the rates, or use our tools, we are here to help.'}
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  {language === 'es' ? (
                    <>
                      <li>¿Cómo se calcula el dólar blue en su plataforma?</li>
                      <li>¿De dónde provienen los datos que muestran?</li>
                      <li>¿Con qué frecuencia se actualizan las tasas?</li>
                      <li>¿Cómo interpreto los gráficos históricos?</li>
                      <li>¿Qué significa el análisis de sentimiento?</li>
                    </>
                  ) : (
                    <>
                      <li>How is the blue dollar calculated on your platform?</li>
                      <li>Where does the data you show come from?</li>
                      <li>How often are the rates updated?</li>
                      <li>How do I interpret the historical charts?</li>
                      <li>What does sentiment analysis mean?</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '2. Reporte de Errores Técnicos' : '2. Technical Error Reports'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? 'Si encuentras algún error en el sitio, datos incorrectos, problemas con las calculadoras, o cualquier otro problema técnico, por favor repórtalo. Incluye detalles como qué página estabas visitando, qué acción estabas realizando, y cualquier mensaje de error que hayas visto. Esto nos ayuda a mejorar la plataforma para todos.'
                    : 'If you find any errors on the site, incorrect data, problems with calculators, or any other technical issues, please report them. Include details such as what page you were visiting, what action you were performing, and any error messages you saw. This helps us improve the platform for everyone.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Tipos de errores que nos interesan: datos de tasas incorrectos, gráficos que no cargan, calculadoras que no funcionan correctamente, problemas de visualización en móviles, enlaces rotos, o cualquier comportamiento inesperado del sitio.'
                    : 'Types of errors we are interested in: incorrect rate data, charts that do not load, calculators that do not work correctly, display problems on mobile, broken links, or any unexpected site behavior.'}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-l-4 border-purple-500">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '3. Sugerencias de Mejora' : '3. Improvement Suggestions'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? 'Valoramos mucho tus ideas y sugerencias. Si tienes ideas para nuevas funcionalidades, mejoras en el diseño, contenido adicional que te gustaría ver, o formas de hacer la plataforma más útil, nos encantaría escucharlas. Todas las sugerencias son consideradas seriamente por nuestro equipo.'
                    : 'We greatly value your ideas and suggestions. If you have ideas for new features, design improvements, additional content you would like to see, or ways to make the platform more useful, we would love to hear them. All suggestions are seriously considered by our team.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Ejemplos de sugerencias que hemos implementado gracias a usuarios: alertas de precio, calculadora de divisas, análisis de sentimiento con IA, y mejoras en la visualización móvil.'
                    : 'Examples of suggestions we have implemented thanks to users: price alerts, currency calculator, AI sentiment analysis, and mobile display improvements.'}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '4. Colaboraciones y Prensa' : '4. Partnerships and Press'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {language === 'es'
                    ? 'Si eres periodista, blogger, o representante de un medio de comunicación y deseas mencionar o citar nuestra plataforma, estamos abiertos a colaboraciones. También consideramos oportunidades de asociación con otras plataformas financieras, integraciones API para desarrolladores, o proyectos educativos relacionados con el mercado cambiario boliviano.'
                    : 'If you are a journalist, blogger, or representative of a media outlet and wish to mention or quote our platform, we are open to collaborations. We also consider partnership opportunities with other financial platforms, API integrations for developers, or educational projects related to the Bolivian exchange market.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Para consultas de prensa, por favor incluye información sobre tu medio, el propósito de la mención, y cómo planeas usar la información. Para colaboraciones técnicas, describe el proyecto y cómo nuestra plataforma podría integrarse.'
                    : 'For press inquiries, please include information about your outlet, the purpose of the mention, and how you plan to use the information. For technical collaborations, describe the project and how our platform could integrate.'}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {language === 'es' ? 'Preguntas Frecuentes sobre Contacto' : 'Frequently Asked Questions about Contact'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '¿Cuánto tiempo tarda la respuesta?' : 'How long does a response take?'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {language === 'es'
                    ? 'Nos esforzamos por responder todos los correos en menos de 24 horas durante días hábiles. Para consultas urgentes o errores críticos, intentamos responder lo antes posible, a menudo en menos de 12 horas.'
                    : 'We strive to respond to all emails within 24 hours during business days. For urgent inquiries or critical errors, we try to respond as soon as possible, often within 12 hours.'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '¿Ofrecen soporte telefónico?' : 'Do you offer phone support?'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {language === 'es'
                    ? 'Actualmente, nuestro soporte se realiza principalmente por correo electrónico. Esto nos permite atender mejor a todos nuestros usuarios y mantener un registro de todas las consultas. Para consultas muy urgentes, podemos considerar comunicación adicional según el caso.'
                    : 'Currently, our support is primarily via email. This allows us to better serve all our users and maintain a record of all inquiries. For very urgent inquiries, we may consider additional communication on a case-by-case basis.'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '¿Puedo solicitar una funcionalidad específica?' : 'Can I request a specific feature?'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {language === 'es'
                    ? '¡Absolutamente! Valoramos las sugerencias de nuestros usuarios. Mientras más detalles proporciones sobre la funcionalidad que te gustaría ver, mejor podremos evaluar su viabilidad e implementación. Incluye información sobre cómo usarías la funcionalidad y por qué sería útil.'
                    : 'Absolutely! We value suggestions from our users. The more details you provide about the feature you would like to see, the better we can evaluate its feasibility and implementation. Include information about how you would use the feature and why it would be useful.'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '¿Cómo reporto un error de datos?' : 'How do I report a data error?'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {language === 'es'
                    ? 'Si crees que hay un error en los datos mostrados (por ejemplo, una tasa de cambio incorrecta), por favor incluye: la fecha y hora cuando viste el error, qué valor esperabas ver, qué valor se mostró, y cualquier otra información relevante. Esto nos ayuda a investigar y corregir el problema rápidamente.'
                    : 'If you believe there is an error in the data shown (for example, an incorrect exchange rate), please include: the date and time when you saw the error, what value you expected to see, what value was shown, and any other relevant information. This helps us investigate and correct the problem quickly.'}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {language === 'es' ? 'Nuestro Compromiso con los Usuarios' : 'Our Commitment to Users'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {language === 'es'
                ? 'En Bolivia Blue con Paz, creemos que la comunicación abierta y transparente es fundamental para construir confianza. Nos comprometemos a:'
                : 'At Bolivia Blue with Paz, we believe that open and transparent communication is fundamental to building trust. We commit to:'}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              {language === 'es' ? (
                <>
                  <li>Responder todas las consultas de manera profesional y oportuna</li>
                  <li>Ser transparentes sobre nuestras fuentes de datos y metodología</li>
                  <li>Considerar seriamente todas las sugerencias de mejora</li>
                  <li>Corregir errores rápidamente cuando se reportan</li>
                  <li>Mantener la privacidad de la información de contacto de nuestros usuarios</li>
                  <li>Continuar mejorando la plataforma basándonos en el feedback de los usuarios</li>
                </>
              ) : (
                <>
                  <li>Responding to all inquiries professionally and promptly</li>
                  <li>Being transparent about our data sources and methodology</li>
                  <li>Seriously considering all improvement suggestions</li>
                  <li>Quickly correcting errors when reported</li>
                  <li>Maintaining the privacy of our users' contact information</li>
                  <li>Continuing to improve the platform based on user feedback</li>
                </>
              )}
            </ul>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 mt-8 border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '💡 Consejo Útil' : '💡 Helpful Tip'}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {language === 'es'
                  ? <>Antes de contactarnos, te recomendamos revisar nuestra <Link to="/preguntas-frecuentes" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">página de preguntas frecuentes</Link>, donde respondemos muchas de las consultas más comunes. También puedes consultar nuestra <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">página sobre nosotros</Link> para entender mejor cómo funciona nuestra plataforma y de dónde provienen nuestros datos.</>
                  : <>Before contacting us, we recommend checking our <Link to="/preguntas-frecuentes" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">frequently asked questions page</Link>, where we answer many of the most common questions. You can also check our <Link to="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">about page</Link> to better understand how our platform works and where our data comes from.</>}
              </p>
            </div>
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

