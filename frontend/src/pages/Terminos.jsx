import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';

function Terminos() {
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
        "name": language === 'es' ? "Términos de Servicio" : "Terms of Service",
        "item": "https://boliviablue.com/terminos"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Términos de Servicio - Bolivia Blue con Paz | Condiciones de Uso'
          : 'Terms of Service - Bolivia Blue with Paz | Terms of Use'}
        description={language === 'es'
          ? 'Términos de servicio de Bolivia Blue con Paz. Condiciones de uso de la plataforma, responsabilidades del usuario y limitaciones de responsabilidad. Información legal y transparencia.'
          : 'Terms of service of Bolivia Blue with Paz. Platform terms of use, user responsibilities and liability limitations. Legal information and transparency.'}
        keywords={language === 'es'
          ? 'términos de servicio, condiciones de uso, términos legales, bolivia blue términos, uso del sitio, responsabilidad legal'
          : 'terms of service, terms of use, legal terms, bolivia blue terms, site usage, legal liability'}
        canonical="/terminos"
        structuredData={[breadcrumbSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Términos de Servicio' : 'Terms of Service', url: '/terminos' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '📋 Términos de Servicio' : '📋 Terms of Service'}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es' 
              ? `Última actualización: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '1. Aceptación de los Términos' : '1. Acceptance of Terms'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Al acceder y utilizar boliviablue.com ("el Sitio", "nosotros", "nuestro"), aceptas cumplir con estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestro sitio.'
                  : 'By accessing and using boliviablue.com ("the Site", "we", "our"), you agree to comply with these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you should not use our site.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '2. Uso del Servicio' : '2. Use of Service'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue con Paz proporciona información sobre el tipo de cambio del dólar blue en Bolivia. Nuestro servicio es gratuito y está disponible para uso personal, educativo y comercial legítimo.'
                  : 'Bolivia Blue with Paz provides information about the blue dollar exchange rate in Bolivia. Our service is free and available for personal, educational and legitimate commercial use.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2.1 Uso Permitido' : '2.1 Permitted Use'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li>Consultar información sobre tipos de cambio para decisiones financieras personales</li>
                    <li>Usar nuestros datos para análisis, investigación o reportes (con atribución apropiada)</li>
                    <li>Integrar nuestros datos en aplicaciones o servicios propios (respetando nuestras limitaciones de API)</li>
                    <li>Compartir enlaces a nuestro sitio en redes sociales o sitios web</li>
                  </>
                ) : (
                  <>
                    <li>Consult information about exchange rates for personal financial decisions</li>
                    <li>Use our data for analysis, research or reports (with appropriate attribution)</li>
                    <li>Integrate our data into your own applications or services (respecting our API limitations)</li>
                    <li>Share links to our site on social media or websites</li>
                  </>
                )}
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2.2 Uso Prohibido' : '2.2 Prohibited Use'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li>Usar nuestros datos para actividades ilegales o fraudulentas</li>
                    <li>Intentar acceder no autorizado a nuestros sistemas o datos</li>
                    <li>Reproducir, copiar o vender nuestros datos sin permiso explícito</li>
                    <li>Usar bots o scripts automatizados que sobrecarguen nuestros servidores</li>
                    <li>Intentar manipular o interferir con el funcionamiento del sitio</li>
                  </>
                ) : (
                  <>
                    <li>Use our data for illegal or fraudulent activities</li>
                    <li>Attempt unauthorized access to our systems or data</li>
                    <li>Reproduce, copy or sell our data without explicit permission</li>
                    <li>Use bots or automated scripts that overload our servers</li>
                    <li>Attempt to manipulate or interfere with site operation</li>
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '3. Exactitud de la Información' : '3. Accuracy of Information'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nos esforzamos por proporcionar información precisa y actualizada sobre el tipo de cambio del dólar blue. Sin embargo, los tipos de cambio fluctúan constantemente y pueden variar según la ubicación, el método de pago y otros factores. La información que proporcionamos es de naturaleza informativa y no constituye asesoramiento financiero, legal o de inversión.'
                  : 'We strive to provide accurate and up-to-date information about the blue dollar exchange rate. However, exchange rates fluctuate constantly and may vary by location, payment method and other factors. The information we provide is for informational purposes and does not constitute financial, legal or investment advice.'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'No garantizamos la exactitud, completitud o actualidad de la información proporcionada. Los usuarios deben verificar los tipos de cambio actuales antes de realizar transacciones y no deben depender únicamente de nuestra información para decisiones financieras importantes.'
                  : 'We do not guarantee the accuracy, completeness or timeliness of the information provided. Users should verify current exchange rates before making transactions and should not rely solely on our information for important financial decisions.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '4. Limitación de Responsabilidad' : '4. Limitation of Liability'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue con Paz se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio esté libre de errores, interrupciones o defectos. En la máxima medida permitida por la ley, no seremos responsables por ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar nuestro servicio.'
                  : 'Bolivia Blue with Paz is provided "as is" and "as available". We do not guarantee that the service is free from errors, interruptions or defects. To the maximum extent permitted by law, we will not be liable for any direct, indirect, incidental, special or consequential damages resulting from the use or inability to use our service.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '5. Propiedad Intelectual' : '5. Intellectual Property'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Todo el contenido del sitio, incluyendo pero no limitado a texto, gráficos, logos, iconos, imágenes y software, es propiedad de Bolivia Blue con Paz o sus proveedores de contenido y está protegido por leyes de derechos de autor y otras leyes de propiedad intelectual.'
                  : 'All site content, including but not limited to text, graphics, logos, icons, images and software, is the property of Bolivia Blue with Paz or its content providers and is protected by copyright laws and other intellectual property laws.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '6. Modificaciones de los Términos' : '6. Modifications to Terms'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio. Es tu responsabilidad revisar periódicamente estos términos. El uso continuado del sitio después de cualquier modificación constituye tu aceptación de los nuevos términos.'
                  : 'We reserve the right to modify these Terms of Service at any time. Modifications will take effect immediately after their publication on the site. It is your responsibility to periodically review these terms. Continued use of the site after any modification constitutes your acceptance of the new terms.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? '7. Contacto' : '7. Contact'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos en:'
                  : 'If you have questions about these Terms of Service, you can contact us at:'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Email:</strong> <a href="mailto:info@boliviablue.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@boliviablue.com</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'También puedes visitar nuestra página de <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">contacto</a> para más información.'
                  : 'You can also visit our <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">contact page</a> for more information.'}
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default Terminos;

