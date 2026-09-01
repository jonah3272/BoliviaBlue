import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';

function Equipo() {
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
        "name": language === 'es' ? "Equipo" : "Team",
        "item": "https://boliviablue.com/equipo"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Equipo - Bolivia Blue | Quiénes Somos'
          : 'Team - Bolivia Blue | Who We Are'}
        description={language === 'es'
          ? 'Conoce al equipo detrás de Bolivia Blue. Nuestra misión, valores y compromiso con la transparencia y precisión en la información sobre el tipo de cambio del dólar blue en Bolivia.'
          : 'Meet the team behind Bolivia Blue. Our mission, values and commitment to transparency and accuracy in information about the blue dollar exchange rate in Bolivia.'}
        keywords={language === 'es'
          ? 'equipo bolivia blue, quiénes somos, sobre nosotros, equipo editorial, transparencia'
          : 'bolivia blue team, who we are, about us, editorial team, transparency'}
        canonical="/equipo"
        structuredData={[breadcrumbSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Equipo' : 'Team', url: '/equipo' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '👥 Nuestro Equipo' : '👥 Our Team'}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es' 
              ? `Última actualización: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Sobre Bolivia Blue' : 'About Bolivia Blue'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue es una plataforma independiente dedicada a proporcionar información precisa y transparente sobre el tipo de cambio del dólar blue en Bolivia. Nuestro equipo está compuesto por desarrolladores, analistas de datos, y profesionales comprometidos con la transparencia financiera.'
                  : 'Bolivia Blue is an independent platform dedicated to providing accurate and transparent information about the blue dollar exchange rate in Bolivia. Our team is composed of developers, data analysts, and professionals committed to financial transparency.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Nuestra Misión' : 'Our Mission'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Democratizar el acceso a información precisa sobre el mercado cambiario boliviano. Creemos que cada boliviano tiene derecho a conocer el precio real del dólar, independientemente de su ubicación, nivel de educación financiera, o acceso a recursos. Nuestra plataforma es completamente gratuita y accesible para todos.'
                  : 'Democratize access to accurate information about the Bolivian exchange market. We believe that every Bolivian has the right to know the real price of the dollar, regardless of their location, level of financial education, or access to resources. Our platform is completely free and accessible to everyone.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Nuestros Valores' : 'Our Values'}
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Transparencia:</strong> Explicamos claramente cómo obtenemos y calculamos nuestros datos</li>
                    <li><strong>Precisión:</strong> Nos esforzamos por proporcionar información exacta y actualizada</li>
                    <li><strong>Independencia:</strong> No estamos afiliados con ningún banco, casa de cambio, o institución financiera</li>
                    <li><strong>Accesibilidad:</strong> Nuestro servicio es gratuito y disponible para todos</li>
                    <li><strong>Responsabilidad:</strong> Corregimos errores rápidamente y mantenemos altos estándares editoriales</li>
                  </>
                ) : (
                  <>
                    <li><strong>Transparency:</strong> We clearly explain how we obtain and calculate our data</li>
                    <li><strong>Accuracy:</strong> We strive to provide exact and up-to-date information</li>
                    <li><strong>Independence:</strong> We are not affiliated with any bank, exchange house, or financial institution</li>
                    <li><strong>Accessibility:</strong> Our service is free and available to everyone</li>
                    <li><strong>Responsibility:</strong> We correct errors quickly and maintain high editorial standards</li>
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Estructura del Equipo' : 'Team Structure'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestro equipo opera de manera distribuida, con miembros en diferentes ubicaciones. Trabajamos juntos para mantener la plataforma funcionando, actualizar datos, crear contenido, y responder a las necesidades de nuestros usuarios.'
                  : 'Our team operates in a distributed manner, with members in different locations. We work together to keep the platform running, update data, create content, and respond to our users\' needs.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Áreas de Responsabilidad' : 'Areas of Responsibility'}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {language === 'es' ? (
                  <>
                    <li><strong>Desarrollo y Tecnología:</strong> Mantenimiento de la plataforma, desarrollo de nuevas funcionalidades, y optimización técnica</li>
                    <li><strong>Análisis de Datos:</strong> Recopilación y procesamiento de datos de tipos de cambio, verificación de precisión</li>
                    <li><strong>Contenido Editorial:</strong> Creación de artículos, guías, y contenido educativo</li>
                    <li><strong>Atención al Usuario:</strong> Respuesta a consultas, reportes de errores, y soporte técnico</li>
                  </>
                ) : (
                  <>
                    <li><strong>Development and Technology:</strong> Platform maintenance, development of new features, and technical optimization</li>
                    <li><strong>Data Analysis:</strong> Collection and processing of exchange rate data, accuracy verification</li>
                    <li><strong>Editorial Content:</strong> Creation of articles, guides, and educational content</li>
                    <li><strong>User Support:</strong> Response to inquiries, error reports, and technical support</li>
                  </>
                )}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Propiedad y Financiamiento' : 'Ownership and Funding'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue es una plataforma independiente operada por un equipo privado. No recibimos financiamiento de bancos, instituciones gubernamentales, o casas de cambio. Nuestros ingresos provienen principalmente de enlaces de afiliados (como Binance y Airtm) y publicidad, pero estos no influyen en nuestro contenido editorial.'
                  : 'Bolivia Blue is an independent platform operated by a private team. We do not receive funding from banks, government institutions, or exchange houses. Our revenue comes primarily from affiliate links (such as Binance and Airtm) and advertising, but these do not influence our editorial content.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si quieres contactar a nuestro equipo, puedes hacerlo a través de:'
                  : 'If you want to contact our team, you can do so through:'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>Email:</strong> <a href="mailto:info@boliviablue.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@boliviablue.com</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'También puedes visitar nuestra página de <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">contacto</a> para más información o para enviarnos un mensaje directo.'
                  : 'You can also visit our <a href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">contact page</a> for more information or to send us a direct message.'}
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default Equipo;

