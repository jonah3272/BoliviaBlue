import { useLanguage } from '../contexts/LanguageContext';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';

function PoliticaEditorial() {
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
        "name": language === 'es' ? "Política Editorial" : "Editorial Policy",
        "item": "https://boliviablue.com/politica-editorial"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Política Editorial - Bolivia Blue | Estándares y Principios'
          : 'Editorial Policy - Bolivia Blue | Standards and Principles'}
        description={language === 'es'
          ? 'Política editorial de Bolivia Blue. Nuestros estándares de contenido, principios de independencia, metodología de noticias y compromiso con la precisión y transparencia.'
          : 'Editorial policy of Bolivia Blue. Our content standards, independence principles, news methodology and commitment to accuracy and transparency.'}
        keywords={language === 'es'
          ? 'política editorial, estándares editoriales, independencia editorial, metodología noticias, transparencia periodística'
          : 'editorial policy, editorial standards, editorial independence, news methodology, journalistic transparency'}
        canonical="/politica-editorial"
        structuredData={[breadcrumbSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
            { name: language === 'es' ? 'Política Editorial' : 'Editorial Policy', url: '/politica-editorial' }
          ]}
        />

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '📰 Política Editorial' : '📰 Editorial Policy'}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {language === 'es' 
              ? `Última actualización: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Nuestra Misión Editorial' : 'Our Editorial Mission'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Bolivia Blue se compromete a proporcionar información precisa, imparcial y útil sobre el mercado cambiario boliviano. Nuestra política editorial guía todas las decisiones sobre qué contenido publicamos, cómo lo presentamos, y cómo mantenemos nuestra independencia editorial.'
                  : 'Bolivia Blue is committed to providing accurate, unbiased and useful information about the Bolivian exchange market. Our editorial policy guides all decisions about what content we publish, how we present it, and how we maintain our editorial independence.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Principios Fundamentales' : 'Fundamental Principles'}
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '1. Precisión' : '1. Accuracy'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nos esforzamos por verificar todos los hechos antes de publicarlos. Cuando publicamos información sobre tipos de cambio, datos históricos, o noticias, verificamos múltiples fuentes y utilizamos metodologías transparentes. Si cometemos un error, lo corregimos rápidamente y de manera transparente (ver nuestra <a href="/correcciones" className="text-blue-600 dark:text-blue-400 hover:underline">Política de Correcciones</a>).'
                  : 'We strive to verify all facts before publishing them. When we publish information about exchange rates, historical data, or news, we verify multiple sources and use transparent methodologies. If we make an error, we correct it quickly and transparently (see our <a href="/correcciones" className="text-blue-600 dark:text-blue-400 hover:underline">Corrections Policy</a>).'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '2. Independencia' : '2. Independence'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestro contenido editorial no está influenciado por anunciantes, patrocinadores, o intereses comerciales. Mantenemos una separación clara entre nuestro contenido editorial y nuestros anuncios o enlaces de afiliados. Las decisiones editoriales se basan únicamente en la relevancia, precisión y utilidad para nuestros usuarios.'
                  : 'Our editorial content is not influenced by advertisers, sponsors, or commercial interests. We maintain a clear separation between our editorial content and our ads or affiliate links. Editorial decisions are based solely on relevance, accuracy and usefulness to our users.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '3. Transparencia' : '3. Transparency'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Somos transparentes sobre nuestras fuentes de datos, metodologías, y procesos. Explicamos claramente cómo calculamos los tipos de cambio, de dónde provienen nuestras noticias, y cómo funcionan nuestras herramientas. Esta transparencia permite a los usuarios evaluar la confiabilidad de nuestra información.'
                  : 'We are transparent about our data sources, methodologies, and processes. We clearly explain how we calculate exchange rates, where our news comes from, and how our tools work. This transparency allows users to evaluate the reliability of our information.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '4. Utilidad' : '4. Usefulness'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Priorizamos contenido que sea útil y relevante para nuestros usuarios. Nos enfocamos en información que ayuda a los bolivianos a tomar decisiones financieras informadas, entender el mercado cambiario, y navegar el sistema financiero.'
                  : 'We prioritize content that is useful and relevant to our users. We focus on information that helps Bolivians make informed financial decisions, understand the exchange market, and navigate the financial system.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Fuentes de Contenido' : 'Content Sources'}
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Datos de Tipos de Cambio' : 'Exchange Rate Data'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestros tipos de cambio provienen de datos públicos de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado paralelo. Esta metodología se explica en detalle en nuestra página <a href="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline">Acerca de</a>.'
                  : 'Our exchange rates come from public Binance P2P data for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the parallel market. This methodology is explained in detail on our <a href="/acerca-de" className="text-blue-600 dark:text-blue-400 hover:underline">About</a> page.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Noticias' : 'News'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestras noticias provienen de fuentes públicas y confiables, incluyendo medios de comunicación bolivianos e internacionales. Utilizamos inteligencia artificial para analizar el sentimiento de las noticias y determinar su impacto potencial en el tipo de cambio. Siempre proporcionamos enlaces a las fuentes originales y no modificamos el contenido de las noticias originales.'
                  : 'Our news comes from public and reliable sources, including Bolivian and international media. We use artificial intelligence to analyze news sentiment and determine its potential impact on the exchange rate. We always provide links to original sources and do not modify the content of original news.'}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Contenido Original' : 'Original Content'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Nuestro blog y contenido educativo es escrito por nuestro equipo o generado con asistencia de IA, pero siempre revisado y editado por humanos. Nos esforzamos por proporcionar análisis únicos, guías prácticas, y explicaciones claras que no se encuentran fácilmente en otras fuentes.'
                  : 'Our blog and educational content is written by our team or generated with AI assistance, but always reviewed and edited by humans. We strive to provide unique analysis, practical guides, and clear explanations that are not easily found in other sources.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Separación Editorial-Comercial' : 'Editorial-Commercial Separation'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Mantenemos una separación estricta entre nuestro contenido editorial y nuestros anuncios o enlaces de afiliados. Los anuncios están claramente marcados y no influyen en nuestro contenido editorial. Los enlaces de afiliados (como Binance o Airtm) se incluyen solo cuando son relevantes y útiles para nuestros usuarios, y siempre los marcamos claramente.'
                  : 'We maintain a strict separation between our editorial content and our ads or affiliate links. Ads are clearly marked and do not influence our editorial content. Affiliate links (such as Binance or Airtm) are included only when they are relevant and useful to our users, and we always mark them clearly.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {language === 'es'
                  ? 'Si tienes preguntas sobre nuestra política editorial o quieres sugerir contenido, contáctanos en:'
                  : 'If you have questions about our editorial policy or want to suggest content, contact us at:'}
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

export default PoliticaEditorial;

