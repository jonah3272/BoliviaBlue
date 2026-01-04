import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';

function Correcciones() {
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
        "name": language === 'es' ? "Política de Correcciones" : "Corrections Policy",
        "item": "https://boliviablue.com/correcciones"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Política de Correcciones - Bolivia Blue con Paz | Transparencia y Precisión'
          : 'Corrections Policy - Bolivia Blue with Paz | Transparency and Accuracy'}
        description={language === 'es'
          ? 'Política de correcciones de Bolivia Blue con Paz. Cómo reportar errores, nuestro proceso de corrección y compromiso con la precisión y transparencia de la información.'
          : 'Corrections policy of Bolivia Blue with Paz. How to report errors, our correction process and commitment to accuracy and transparency of information.'}
        keywords={language === 'es'
          ? 'política de correcciones, reportar errores, corrección de datos, transparencia, precisión, bolivia blue correcciones'
          : 'corrections policy, report errors, data correction, transparency, accuracy, bolivia blue corrections'}
        canonical="/correcciones"
        structuredData={[breadcrumbSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Política de Correcciones' : 'Corrections Policy', url: '/correcciones' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '✏️ Política de Correcciones' : '✏️ Corrections Policy'}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es' 
              ? `Última actualización: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Nuestro Compromiso con la Precisión' : 'Our Commitment to Accuracy'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'En Bolivia Blue con Paz, nos comprometemos a proporcionar información precisa y actualizada sobre el tipo de cambio del dólar blue en Bolivia. Reconocemos que, a pesar de nuestros mejores esfuerzos, pueden ocurrir errores. Esta política describe cómo manejamos las correcciones y cómo puedes ayudarnos a mantener la precisión de nuestra información.'
                  : 'At Bolivia Blue with Paz, we are committed to providing accurate and up-to-date information about the blue dollar exchange rate in Bolivia. We recognize that, despite our best efforts, errors may occur. This policy describes how we handle corrections and how you can help us maintain the accuracy of our information.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Cómo Reportar un Error' : 'How to Report an Error'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si encuentras un error en nuestro sitio, ya sea en los tipos de cambio, datos históricos, noticias, o cualquier otro contenido, te agradecemos que nos lo reportes. Puedes hacerlo de las siguientes maneras:'
                  : 'If you find an error on our site, whether in exchange rates, historical data, news, or any other content, we appreciate you reporting it. You can do so in the following ways:'}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Email:</strong> Envía un correo a <a href="mailto:info@boliviablue.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@boliviablue.com</a> con el asunto "Corrección" o "Error Reportado"</li>
                    <li><strong>Página de Contacto:</strong> Usa nuestro <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">formulario de contacto</a> y selecciona "Reportar Error"</li>
                    <li><strong>Incluye detalles:</strong> Especifica qué página, qué información es incorrecta, y cuál debería ser la información correcta</li>
                  </>
                ) : (
                  <>
                    <li><strong>Email:</strong> Send an email to <a href="mailto:info@boliviablue.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@boliviablue.com</a> with the subject "Correction" or "Error Reported"</li>
                    <li><strong>Contact Page:</strong> Use our <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">contact form</a> and select "Report Error"</li>
                    <li><strong>Include details:</strong> Specify which page, what information is incorrect, and what the correct information should be</li>
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Nuestro Proceso de Corrección' : 'Our Correction Process'}
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '1. Revisión Inicial' : '1. Initial Review'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Cuando recibimos un reporte de error, nuestro equipo lo revisa dentro de 24 horas (días hábiles). Verificamos la información reportada contra nuestras fuentes de datos y registros internos.'
                  : 'When we receive an error report, our team reviews it within 24 hours (business days). We verify the reported information against our data sources and internal records.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2. Verificación' : '2. Verification'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si el error es confirmado, investigamos la causa raíz. Esto puede incluir revisar nuestros procesos de recopilación de datos, verificar nuestras fuentes, o identificar problemas técnicos.'
                  : 'If the error is confirmed, we investigate the root cause. This may include reviewing our data collection processes, verifying our sources, or identifying technical issues.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '3. Corrección' : '3. Correction'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Una vez verificada la corrección, actualizamos la información en el sitio lo antes posible. Para errores críticos (como tipos de cambio significativamente incorrectos), hacemos la corrección de inmediato. Para errores menores, los corregimos dentro de 48 horas.'
                  : 'Once the correction is verified, we update the information on the site as soon as possible. For critical errors (such as significantly incorrect exchange rates), we make the correction immediately. For minor errors, we correct them within 48 hours.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '4. Notificación' : '4. Notification'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si el reporte fue enviado por email, notificamos al reportero cuando la corrección ha sido completada. Para correcciones significativas que afectan a muchos usuarios, podemos publicar una nota en nuestro sitio o redes sociales.'
                  : 'If the report was sent by email, we notify the reporter when the correction has been completed. For significant corrections that affect many users, we may post a note on our site or social media.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Tipos de Errores que Corregimos' : 'Types of Errors We Correct'}
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Errores en tipos de cambio:</strong> Valores incorrectos en las tasas de compra o venta</li>
                    <li><strong>Errores en datos históricos:</strong> Información incorrecta en gráficos o tablas históricas</li>
                    <li><strong>Errores en noticias:</strong> Información incorrecta en artículos o resúmenes de noticias</li>
                    <li><strong>Errores técnicos:</strong> Problemas con calculadoras, gráficos, o funcionalidades del sitio</li>
                    <li><strong>Errores de contenido:</strong> Información incorrecta en páginas informativas o educativas</li>
                  </>
                ) : (
                  <>
                    <li><strong>Exchange rate errors:</strong> Incorrect values in buy or sell rates</li>
                    <li><strong>Historical data errors:</strong> Incorrect information in historical charts or tables</li>
                    <li><strong>News errors:</strong> Incorrect information in articles or news summaries</li>
                    <li><strong>Technical errors:</strong> Problems with calculators, charts, or site functionality</li>
                    <li><strong>Content errors:</strong> Incorrect information on informational or educational pages</li>
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Limitaciones' : 'Limitations'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Es importante entender que los tipos de cambio fluctúan constantemente y pueden variar según la ubicación, el método de pago, y otros factores. Una diferencia entre nuestra tasa y la tasa que encuentras en una transacción específica no necesariamente constituye un error. Sin embargo, si encuentras una discrepancia significativa y consistente, por favor repórtala.'
                  : 'It is important to understand that exchange rates fluctuate constantly and may vary by location, payment method, and other factors. A difference between our rate and the rate you find in a specific transaction does not necessarily constitute an error. However, if you find a significant and consistent discrepancy, please report it.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Para reportar un error o hacer una pregunta sobre nuestra política de correcciones, contáctanos en:'
                  : 'To report an error or ask a question about our corrections policy, contact us at:'}
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

export default Correcciones;

