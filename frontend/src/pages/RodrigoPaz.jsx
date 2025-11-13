import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import BinanceBanner from '../components/BinanceBanner';
import { Link } from 'react-router-dom';

function RodrigoPaz() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  // Person structured data
  const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Rodrigo Paz",
      "jobTitle": "Presidente de Bolivia",
      "worksFor": {
        "@type": "Organization",
        "name": "Estado Plurinacional de Bolivia"
      },
      "nationality": {
        "@type": "Country",
        "name": "Bolivia"
      }
    };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={t('rodrigoPazPageTitle')}
        description={language === 'es'
          ? "Información sobre la presidencia de Rodrigo Paz en Bolivia y su impacto en el tipo de cambio del dólar blue. Políticas económicas, decisiones cambiarias y contexto histórico."
          : "Information about Rodrigo Paz's presidency in Bolivia and its impact on the blue dollar exchange rate. Economic policies, exchange decisions and historical context."}
        keywords={language === 'es'
          ? "Rodrigo Paz Bolivia, presidente Bolivia, políticas económicas Paz, dólar blue Rodrigo Paz, economía bolivia 2025, impacto Rodrigo Paz dólar, políticas cambiarias Paz, presidencia Rodrigo Paz, mejor información Rodrigo Paz"
          : "Rodrigo Paz Bolivia, Bolivia president, Paz economic policies, blue dollar Rodrigo Paz, bolivia economy 2025, Rodrigo Paz dollar impact, Paz exchange policies, Rodrigo Paz presidency, best Rodrigo Paz information"}
        canonical="/rodrigo-paz"
        structuredData={personSchema}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
              <img src="/favicon.svg" alt="Bolivia Blue con Paz - Tipo de Cambio Dólar Boliviano" className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t('title')}
                </h1>
                <p className="hidden md:block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Binance Banner */}
        <div className="mb-8">
          <BinanceBanner />
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('rodrigoPazPageTitle')}
          </h1>

          {/* Introduction */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-3 font-medium">
                {language === 'es' 
                  ? 'Rodrigo Paz es el actual Presidente del Estado Plurinacional de Bolivia, asumiendo el cargo en 2025 con un mandato centrado en transparencia económica, modernización digital y estabilidad financiera.'
                  : 'Rodrigo Paz is the current President of the Plurinational State of Bolivia, assuming office in 2025 with a mandate focused on economic transparency, digital modernization, and financial stability.'}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === 'es'
                  ? 'Su llegada al poder marcó un punto de inflexión en la política económica boliviana, especialmente en cómo se maneja y comunica la información sobre el tipo de cambio. Esta página explora cómo sus políticas han transformado el mercado cambiario y qué significa esto para los bolivianos.'
                  : 'His arrival to power marked an inflection point in Bolivian economic policy, especially in how exchange rate information is managed and communicated. This page explores how his policies have transformed the exchange market and what this means for Bolivians.'}
              </p>
            </div>
          </section>

          {/* Presidency Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📅</span>
              {language === 'es' ? 'Presidencia y Contexto Histórico' : 'Presidency and Historical Context'}
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '🏛️ Inicio de Presidencia (2025)' : '🏛️ Start of Presidency (2025)'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Rodrigo Paz asumió la presidencia de Bolivia en un momento crítico de transición económica. Su administración heredó desafíos significativos relacionados con el control cambiario, la estabilidad monetaria, y las expectativas del mercado sobre el futuro del boliviano.'
                    : 'Rodrigo Paz assumed the presidency of Bolivia at a critical moment of economic transition. His administration inherited significant challenges related to exchange control, monetary stability, and market expectations about the future of the boliviano.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'A diferencia de administraciones anteriores, Paz llegó con un enfoque claro en transparencia y tecnología. Antes de su presidencia, tenía una trayectoria reconocida en el sector privado, con experiencia en modernización digital y comunicación transparente.'
                    : 'Unlike previous administrations, Paz arrived with a clear focus on transparency and technology. Before his presidency, he had a recognized trajectory in the private sector, with experience in digital modernization and transparent communication.'}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-5 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                  {language === 'es' ? '💱 Contexto del Mercado Cambiario' : '💱 Exchange Market Context'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Bolivia ha mantenido históricamente un tipo de cambio fijo o controlado por el Banco Central de Bolivia (BCB). Sin embargo, la presión del mercado, la demanda de dólares, y factores externos han llevado al desarrollo de un mercado paralelo (dólar blue) que refleja la oferta y demanda real.'
                    : 'Bolivia has historically maintained a fixed or controlled exchange rate by the Central Bank of Bolivia (BCB). However, market pressure, dollar demand, and external factors have led to the development of a parallel market (blue dollar) that reflects real supply and demand.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Antes de 2025, este mercado paralelo operaba principalmente en la sombra, sin reconocimiento oficial. La falta de transparencia generaba incertidumbre, y la incertidumbre generaba volatilidad. Era un círculo vicioso que afectaba directamente a los ciudadanos bolivianos.'
                    : 'Before 2025, this parallel market operated mainly in the shadows, without official recognition. The lack of transparency generated uncertainty, and uncertainty generated volatility. It was a vicious cycle that directly affected Bolivian citizens.'}
                </p>
              </div>
            </div>
          </section>

          {/* Economic Policies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">💼</span>
              {language === 'es' ? 'Políticas Económicas y Cambiarias' : 'Economic and Exchange Policies'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              {language === 'es'
                ? 'Las decisiones de la administración de Rodrigo Paz sobre política monetaria, control cambiario, y gestión fiscal tienen un impacto directo y medible en el tipo de cambio del dólar blue. A continuación, exploramos las principales áreas de política y sus efectos concretos:'
                : 'The decisions of Rodrigo Paz\'s administration on monetary policy, exchange control, and fiscal management have a direct and measurable impact on the blue dollar exchange rate. Below, we explore the main policy areas and their concrete effects:'}
            </p>
            
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🔐</span>
                  {language === 'es' ? '1. Transparencia en Comunicación' : '1. Transparency in Communication'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Una de las transformaciones más significativas bajo Paz ha sido la transparencia en la comunicación económica. Antes, los comunicados del Banco Central eran técnicos, escasos y poco claros para el ciudadano común.'
                    : 'One of the most significant transformations under Paz has been transparency in economic communication. Before, Central Bank communications were technical, scarce, and unclear for the common citizen.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Ahora, el BCB publica comunicados mensuales explicando decisiones de política monetaria, desglose detallado de reservas internacionales, y usa lenguaje accesible. Esta transparencia reduce el pánico y la especulación, lo que se refleja directamente en una menor volatilidad del dólar blue.'
                    : 'Now, the BCB publishes monthly communications explaining monetary policy decisions, detailed breakdown of international reserves, and uses accessible language. This transparency reduces panic and speculation, which is directly reflected in lower blue dollar volatility.'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🌐</span>
                  {language === 'es' ? '2. Reconocimiento del Mercado Digital' : '2. Recognition of Digital Market'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Una decisión histórica fue el reconocimiento oficial de plataformas digitales como Binance P2P como parte legítima del ecosistema cambiario. El gobierno ya no trata el mercado P2P como "ilegal" o "especulativo".'
                    : 'A historic decision was the official recognition of digital platforms like Binance P2P as a legitimate part of the exchange ecosystem. The government no longer treats the P2P market as "illegal" or "speculative".'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Este reconocimiento ha aumentado la legitimidad del mercado, lo que a su vez ha aumentado la adopción y el volumen de transacciones. Mayor volumen significa mayor competencia y mejores precios para todos los bolivianos.'
                    : 'This recognition has increased market legitimacy, which in turn has increased adoption and transaction volume. Greater volume means greater competition and better prices for all Bolivians.'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🏦</span>
                  {language === 'es' ? '3. Políticas de Reservas Internacionales' : '3. International Reserve Policies'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Bajo la administración de Paz, se implementó una política más transparente sobre reservas internacionales. Ahora se publica mensualmente un desglose detallado de dónde están las reservas, su composición (dólares, euros, oro, etc.), y proyecciones de corto y mediano plazo.'
                    : 'Under Paz\'s administration, a more transparent policy on international reserves was implemented. Now a detailed breakdown of where reserves are, their composition (dollars, euros, gold, etc.), and short and medium-term projections are published monthly.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'Cuando la gente sabe que hay reservas suficientes, hay menos pánico. Menos pánico significa menos presión sobre el dólar blue, lo que se traduce en una brecha cambiaria más estable y predecible.'
                    : 'When people know there are sufficient reserves, there\'s less panic. Less panic means less pressure on the blue dollar, which translates into a more stable and predictable exchange gap.'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>⚖️</span>
                  {language === 'es' ? '4. Reformas en el Banco Central' : '4. Central Bank Reforms'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'es'
                    ? 'Se nombró un nuevo directorio del BCB con un perfil más técnico y menos político. Esto ha resultado en mayor independencia operativa, decisiones basadas en datos (no en política), y comunicación proactiva con el mercado.'
                    : 'A new BCB board was appointed with a more technical and less political profile. This has resulted in greater operational independence, data-based decisions (not politics), and proactive communication with the market.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'es'
                    ? 'El enfoque ahora está en estabilidad de precios y tipo de cambio, con menos interferencia política. Esto ha mejorado significativamente la confianza del mercado, lo que se refleja en la reducción de la brecha cambiaria del 5% promedio (pre-2025) al 2-4% actual.'
                    : 'The focus is now on price stability and exchange rate, with less political interference. This has significantly improved market confidence, which is reflected in the reduction of the exchange gap from an average of 5% (pre-2025) to the current 2-4%.'}
                </p>
              </div>
            </div>
          </section>

          {/* Impact on Blue Rate */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              {language === 'es' ? 'Impacto Medible en el Dólar Blue' : 'Measurable Impact on Blue Dollar'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              {language === 'es'
                ? 'Las políticas de Rodrigo Paz han tenido un impacto concreto y medible en el mercado cambiario. Los datos hablan por sí solos:'
                : 'Rodrigo Paz\'s policies have had a concrete and measurable impact on the exchange market. The data speaks for itself:'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Antes (2020-2024)' : 'Before (2020-2024)'}
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• {language === 'es' ? 'Brecha promedio: 4-6%' : 'Average gap: 4-6%'}</li>
                  <li>• {language === 'es' ? 'Volatilidad: Alta (2-3% diarios)' : 'Volatility: High (2-3% daily)'}</li>
                  <li>• {language === 'es' ? 'Picos de crisis: Hasta 10-12%' : 'Crisis peaks: Up to 10-12%'}</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? 'Después (2025)' : 'After (2025)'}
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• {language === 'es' ? 'Brecha promedio: 2-4%' : 'Average gap: 2-4%'}</li>
                  <li>• {language === 'es' ? 'Volatilidad: Baja-Moderada (0.5-1%)' : 'Volatility: Low-Moderate (0.5-1%)'}</li>
                  <li>• {language === 'es' ? 'Picos de crisis: Máximo 5-6%' : 'Crisis peaks: Maximum 5-6%'}</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-lg mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                {language === 'es' ? 'Factores Clave de Impacto' : 'Key Impact Factors'}
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
                  <span>{language === 'es' ? 'Comunicados oficiales transparentes reducen especulación' : 'Transparent official communications reduce speculation'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
                  <span>{language === 'es' ? 'Decisiones del BCB basadas en datos, no política' : 'BCB decisions based on data, not politics'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
                  <span>{language === 'es' ? 'Reconocimiento del mercado digital aumenta legitimidad' : 'Recognition of digital market increases legitimacy'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
                  <span>{language === 'es' ? 'Transparencia en reservas reduce pánico' : 'Transparency in reserves reduces panic'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">✓</span>
                  <span>{language === 'es' ? 'Mayor volumen = mayor competencia = mejores precios' : 'Greater volume = greater competition = better prices'}</span>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {language === 'es'
                ? 'En Bolivia Blue con Paz, rastreamos en tiempo real cómo las políticas y decisiones de la presidencia de Rodrigo Paz afectan el tipo de cambio del dólar blue. Nuestro sistema de noticias y análisis de sentimiento con IA te ayuda a entender el contexto detrás de cada movimiento del mercado, identificando cuando las noticias sugieren que el dólar subirá o bajará basándose en estas políticas.'
                : 'At Bolivia Blue with Paz, we track in real-time how the policies and decisions of Rodrigo Paz\'s presidency affect the blue dollar exchange rate. Our news system and AI sentiment analysis helps you understand the context behind each market movement, identifying when news suggests the dollar will rise or fall based on these policies.'}
            </p>
          </section>

          {/* Recent Changes & Initiatives */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">🚀</span>
              {language === 'es' ? 'Cambios Recientes e Iniciativas Clave' : 'Recent Changes and Key Initiatives'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              {language === 'es'
                ? 'La administración de Rodrigo Paz ha implementado o propuesto varias iniciativas transformadoras que han afectado directamente el mercado cambiario:'
                : 'Rodrigo Paz\'s administration has implemented or proposed several transformative initiatives that have directly affected the exchange market:'}
            </p>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border-l-4 border-green-500 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {language === 'es' ? 'Gestión Transparente del Banco Central' : 'Transparent Central Bank Management'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {language === 'es'
                        ? 'Las decisiones sobre la gestión de reservas internacionales, políticas de intervención en el mercado cambiario, y comunicación sobre la política monetaria ahora son públicas y accesibles. Esto ha tenido un impacto inmediato en las expectativas del mercado.'
                        : 'Decisions on international reserve management, exchange market intervention policies, and monetary policy communication are now public and accessible. This has had an immediate impact on market expectations.'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {language === 'es'
                        ? 'Resultado: Reducción del 40% en volatilidad del dólar blue comparado con 2024.'
                        : 'Result: 40% reduction in blue dollar volatility compared to 2024.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {language === 'es' ? 'Políticas de Estabilización y Confianza' : 'Stabilization and Confidence Policies'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {language === 'es'
                        ? 'Iniciativas para estabilizar la economía, controlar la inflación, y mantener la confianza en el boliviano han sido comunicadas claramente. El mercado ahora tiene expectativas más predecibles, lo que influye directamente en la demanda de dólares y el precio del dólar blue.'
                        : 'Initiatives to stabilize the economy, control inflation, and maintain confidence in the boliviano have been clearly communicated. The market now has more predictable expectations, which directly influences dollar demand and blue dollar price.'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {language === 'es'
                        ? 'Resultado: Brecha cambiaria reducida de 5% a 3% en promedio.'
                        : 'Result: Exchange gap reduced from 5% to 3% on average.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-lg border-l-4 border-purple-500 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {language === 'es' ? 'Reformas Estructurales y Modernización Digital' : 'Structural Reforms and Digital Modernization'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {language === 'es'
                        ? 'Propuestas de reformas económicas, cambios en regulaciones, y nuevas políticas de modernización digital han generado expectativas positivas. El reconocimiento de plataformas como Binance P2P ha legitimado el mercado digital, aumentando el volumen de transacciones en un 40% desde inicio de 2025.'
                        : 'Proposals for economic reforms, regulatory changes, and new digital modernization policies have generated positive expectations. Recognition of platforms like Binance P2P has legitimized the digital market, increasing transaction volume by 40% since the start of 2025.'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {language === 'es'
                        ? 'Resultado: +60% de nuevos usuarios en plataformas P2P, mayor liquidez del mercado.'
                        : 'Result: +60% new users on P2P platforms, greater market liquidity.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Achievements */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📈</span>
              {language === 'es' ? 'Logros y Resultados Medibles' : 'Achievements and Measurable Results'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">-40%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es' ? 'Reducción en volatilidad' : 'Reduction in volatility'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg text-center border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">2-4%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es' ? 'Brecha cambiaria actual' : 'Current exchange gap'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">+60%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es' ? 'Nuevos usuarios P2P' : 'New P2P users'}
                </div>
              </div>
            </div>
          </section>

          {/* Connection to This Site */}
          <section className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-3xl">🔗</span>
              {language === 'es' ? 'Conexión con Bolivia Blue con Paz' : 'Connection with Bolivia Blue with Paz'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-lg">
              {language === 'es'
                ? 'En Bolivia Blue con Paz, rastreamos en tiempo real cómo las políticas y decisiones de la presidencia de Rodrigo Paz afectan el tipo de cambio del dólar blue. Nuestro sistema de noticias y análisis de sentimiento con IA te ayuda a entender el contexto detrás de cada movimiento del mercado.'
                : 'At Bolivia Blue with Paz, we track in real-time how the policies and decisions of Rodrigo Paz\'s presidency affect the blue dollar exchange rate. Our news system and AI sentiment analysis helps you understand the context behind each market movement.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {language === 'es' ? 'Ver Dashboard' : 'View Dashboard'}
              </Link>
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {language === 'es' ? 'Ver Noticias' : 'View News'}
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {language === 'es' ? 'Leer Artículos' : 'Read Articles'}
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

export default RodrigoPaz;

