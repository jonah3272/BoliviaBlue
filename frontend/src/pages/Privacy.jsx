import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

function Privacy() {
  // Signal to AdSense that this page has sufficient content
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
        "name": language === 'es' ? "Política de Privacidad" : "Privacy Policy",
        "item": "https://boliviablue.com/politica-de-privacidad"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Política de Privacidad - Bolivia Blue con Paz | Protección de Datos'
          : 'Privacy Policy - Bolivia Blue with Paz | Data Protection'}
        description={language === 'es'
          ? 'Política de privacidad de Bolivia Blue con Paz. Información sobre cómo recopilamos, usamos y protegemos tus datos personales. Transparencia y seguridad de datos.'
          : 'Privacy policy of Bolivia Blue with Paz. Information about how we collect, use and protect your personal data. Transparency and data security.'}
        keywords={language === 'es'
          ? 'política de privacidad, protección de datos, privacidad bolivia blue, cookies, datos personales, GDPR, privacidad web'
          : 'privacy policy, data protection, bolivia blue privacy, cookies, personal data, GDPR, web privacy'}
        canonical="/politica-de-privacidad"
        structuredData={[breadcrumbSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Política de Privacidad' : 'Privacy Policy', url: '/politica-de-privacidad' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '🔒 Política de Privacidad' : '🔒 Privacy Policy'}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es' 
              ? `Última actualización: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '1. Introducción' : '1. Introduction'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue con Paz ("nosotros", "nuestro", "el sitio") se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestro sitio web boliviablue.com.'
                  : 'Bolivia Blue with Paz ("we", "our", "the site") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose and protect your information when you use our website boliviablue.com.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '2. Información que Recopilamos' : '2. Information We Collect'}
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2.1 Información que Proporcionas' : '2.1 Information You Provide'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Actualmente, nuestro sitio no requiere registro ni recopila información personal directamente de los usuarios. No solicitamos nombres, direcciones de correo electrónico u otra información personal para usar nuestros servicios básicos.'
                  : 'Currently, our site does not require registration or collect personal information directly from users. We do not request names, email addresses or other personal information to use our basic services.'}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2.2 Información Recopilada Automáticamente' : '2.2 Automatically Collected Information'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  {language === 'es'
                    ? 'Datos de uso: Información sobre cómo utilizas nuestro sitio, incluyendo páginas visitadas, tiempo de permanencia y patrones de navegación.'
                    : 'Usage data: Information about how you use our site, including pages visited, time spent and browsing patterns.'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Información del dispositivo: Tipo de dispositivo, navegador, sistema operativo y dirección IP (anonimizada cuando sea posible).'
                    : 'Device information: Device type, browser, operating system and IP address (anonymized when possible).'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Cookies y tecnologías similares: Utilizamos cookies para mejorar la experiencia del usuario y analizar el tráfico del sitio.'
                    : 'Cookies and similar technologies: We use cookies to improve user experience and analyze site traffic.'}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '3. Uso de Cookies' : '3. Use of Cookies'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Utilizamos cookies y tecnologías similares para:'
                  : 'We use cookies and similar technologies to:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  {language === 'es'
                    ? 'Recordar tus preferencias (idioma, tema oscuro/claro)'
                    : 'Remember your preferences (language, dark/light theme)'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Analizar el uso del sitio mediante Google Analytics'
                    : 'Analyze site usage through Google Analytics'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Mostrar anuncios relevantes mediante Google AdSense'
                    : 'Display relevant ads through Google AdSense'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Mejorar el rendimiento y la funcionalidad del sitio'
                    : 'Improve site performance and functionality'}
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Puedes controlar las cookies a través de la configuración de tu navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.'
                  : 'You can control cookies through your browser settings. However, disabling certain cookies may affect site functionality.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '4. Cómo Usamos tu Información' : '4. How We Use Your Information'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Utilizamos la información recopilada para:'
                  : 'We use the information collected to:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  {language === 'es'
                    ? 'Proporcionar y mejorar nuestros servicios de seguimiento del tipo de cambio'
                    : 'Provide and improve our exchange rate tracking services'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Personalizar tu experiencia (preferencias de idioma, tema)'
                    : 'Personalize your experience (language preferences, theme)'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Analizar el uso del sitio para mejorar el contenido y la funcionalidad'
                    : 'Analyze site usage to improve content and functionality'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Mostrar anuncios relevantes y medir su efectividad'
                    : 'Display relevant ads and measure their effectiveness'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Detectar y prevenir fraudes o abusos'
                    : 'Detect and prevent fraud or abuse'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Cumplir con obligaciones legales'
                    : 'Comply with legal obligations'}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '5. Compartir Información' : '5. Sharing Information'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:'
                  : 'We do not sell, rent or share your personal information with third parties, except in the following circumstances:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  {language === 'es'
                    ? 'Proveedores de servicios: Compartimos datos con proveedores que nos ayudan a operar el sitio (Google Analytics, Google AdSense, servicios de hosting)'
                    : 'Service providers: We share data with providers who help us operate the site (Google Analytics, Google AdSense, hosting services)'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Requisitos legales: Cuando sea requerido por ley o para proteger nuestros derechos legales'
                    : 'Legal requirements: When required by law or to protect our legal rights'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Con tu consentimiento: Cuando hayas dado tu consentimiento explícito'
                    : 'With your consent: When you have given explicit consent'}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '6. Google AdSense y Anuncios' : '6. Google AdSense and Ads'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Utilizamos Google AdSense para mostrar anuncios en nuestro sitio. Google y sus socios pueden usar cookies para mostrar anuncios basados en tus visitas anteriores a este y otros sitios web. Puedes optar por no recibir anuncios personalizados visitando la página de Configuración de anuncios de Google.'
                  : 'We use Google AdSense to display ads on our site. Google and its partners may use cookies to show ads based on your previous visits to this and other websites. You can opt out of personalized ads by visiting Google\'s Ad Settings page.'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {language === 'es' ? 'Configuración de anuncios de Google' : 'Google Ad Settings'}
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '7. Seguridad de los Datos' : '7. Data Security'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet es 100% seguro.'
                  : 'We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure or destruction. However, no method of Internet transmission is 100% secure.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '8. Tus Derechos' : '8. Your Rights'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Tienes derecho a:'
                  : 'You have the right to:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                  {language === 'es'
                    ? 'Acceder a la información personal que tenemos sobre ti'
                    : 'Access personal information we have about you'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Solicitar la corrección de información inexacta'
                    : 'Request correction of inaccurate information'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Solicitar la eliminación de tus datos personales'
                    : 'Request deletion of your personal data'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Oponerte al procesamiento de tus datos personales'
                    : 'Object to processing of your personal data'}
                </li>
                <li>
                  {language === 'es'
                    ? 'Retirar tu consentimiento en cualquier momento'
                    : 'Withdraw your consent at any time'}
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Para ejercer estos derechos, contáctanos en:'
                  : 'To exercise these rights, contact us at:'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <a 
                  href="mailto:info@boliviablue.com" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  info@boliviablue.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '9. Enlaces a Terceros' : '9. Third-Party Links'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de estos sitios. Te recomendamos leer las políticas de privacidad de cualquier sitio que visites.'
                  : 'Our site may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We recommend reading the privacy policies of any site you visit.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '10. Cambios a esta Política' : '10. Changes to This Policy'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Te recomendamos revisar esta política periódicamente.'
                  : 'We may update this Privacy Policy occasionally. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We recommend reviewing this policy periodically.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '11. Contacto' : '11. Contact'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos:'
                  : 'If you have questions about this Privacy Policy, you can contact us:'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>{language === 'es' ? 'Email:' : 'Email:'}</strong>{' '}
                  <a 
                    href="mailto:info@boliviablue.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    info@boliviablue.com
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>{language === 'es' ? 'Sitio web:' : 'Website:'}</strong>{' '}
                  <a 
                    href="https://boliviablue.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    https://boliviablue.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default Privacy;

