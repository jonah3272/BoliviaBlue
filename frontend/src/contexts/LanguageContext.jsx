import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackLanguageSwitched } from '../utils/analyticsEvents';

const LanguageContext = createContext();

export const translations = {
  es: {
    // Header
    title: 'Bolivia Blue Rate con Paz',
    titleShort: 'Bolivia Blue',
    subtitle: 'Siguiendo el pulso del Boliviano bajo el Presidente Paz',
    
    // Rate Cards
    buy: 'COMPRAR',
    sell: 'VENDER',
    perUSD: 'Bs. por USD',
    updated: 'Actualizado',
    stale: 'Desactualizado',
    change24h: '24h',
    blueMarketTitle: 'Mercado Paralelo (Dólar Blue) - Binance P2P',
    officialRateTitle: 'Tipo de Cambio Oficial - Banco Central de Bolivia',
    
    // Chart
    chartTitle: 'Histórico del Dólar Blue',
    timeRanges: {
      '1D': '1D',
      '1W': '1S',
      '1M': '1M',
      '1Y': '1A',
      'ALL': 'Todo'
    },
    blueRate: 'Dólar Blue',
    officialRate: 'Oficial',
    collectingData: 'Recopilando datos históricos...',
    collectingDataDesc: 'El sistema actualiza cada 15 minutos. Los datos históricos se acumularán con el tiempo.',
    fewDataPoints: '📊 Datos recientes',
    fewDataPointsDesc: 'punto | puntos. El gráfico mejorará a medida que se acumulen más datos cada 15 minutos.',
    chartBuy: 'Compra',
    chartSell: 'Venta',
    chartTypeArea: 'Área',
    chartTypeCandlestick: 'Velas Japonesas',
    
    // News
    newsTitle: 'Noticias Económicas',
    newsLoading: 'Cargando noticias...',
    newsError: 'No se pudieron cargar las noticias',
    newsEmpty: 'No hay noticias disponibles en este momento',
    newsSentiment: {
      up: 'Alcista',
      down: 'Bajista',
      neutral: 'Neutral'
    },
    
    // About
    aboutTitle: 'Acerca de Bolivia Blue con Paz',
    aboutMethodology: 'Metodología',
    aboutMethodologyDesc: 'Este sitio rastrea dos tipos de cambio en Bolivia:',
    aboutBlueMarket: 'Mercado Paralelo (Dólar Blue):',
    aboutBlueMarketDesc: 'Datos de ofertas públicas de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado informal.',
    aboutOfficialRate: 'Tipo de Cambio Oficial:',
    aboutOfficialRateDesc: 'Tasa controlada por el Banco Central de Bolivia (BCB), utilizada por bancos y casas de cambio autorizadas. Esta tasa es típicamente fija o se ajusta con muy poca frecuencia.',
    aboutDataSources: 'Fuentes de datos',
    aboutDataSource1: 'Dólar Blue: Binance P2P API (USDT/BOB)',
    aboutDataSource2: 'Tipo de Cambio Oficial: Banco Central de Bolivia / APIs de mercado',
    aboutDataSource3: 'Noticias: Medios bolivianos verificados (El Deber, Página Siete, La Razón, etc.)',
    aboutDataSource4: 'Frecuencia de actualización: cada 15 minutos',
    aboutNewsSources: 'Fuentes de Noticias',
    aboutNewsSourcesDesc: 'Nuestro sistema recopila artículos de múltiples fuentes verificadas para garantizar cobertura completa y actualizada:',
    aboutNewsSourceRSS: 'RSS Feeds:',
    aboutNewsSourceRSSDesc: 'Google News (búsquedas específicas sobre economía boliviana, Rodrigo Paz, y dólar), El Deber, Página Siete, Opinión, eju.tv y otros medios bolivianos verificados.',
    aboutNewsSourceTwitter: 'Twitter/X:',
    aboutNewsSourceTwitterDesc: 'Búsquedas en tiempo real usando la API oficial de Twitter con consultas específicas sobre economía boliviana, tipo de cambio, y menciones de Rodrigo Paz. Actualizado cada 15 minutos.',
    aboutNewsSourceFiltering: 'Filtrado Inteligente:',
    aboutNewsSourceFilteringDesc: 'Solo mostramos artículos relevantes a Bolivia que mencionan economía, política, divisas, o Rodrigo Paz. Los artículos se categorizan automáticamente (divisas, economía, política, banca, etc.).',
    aboutNewsSourceDeduplication: 'Prevención de Duplicados:',
    aboutNewsSourceDeduplicationDesc: 'Cada artículo se identifica por su URL única. El sistema evita almacenar artículos duplicados, garantizando que cada noticia aparezca solo una vez.',
    aboutSentimentAnalysis: 'Análisis de Sentimiento con IA',
    aboutSentimentAnalysisDesc: 'Utilizamos inteligencia artificial avanzada para determinar si las noticias sugieren que el dólar subirá o bajará:',
    aboutSentimentAI: 'IA Principal (OpenAI GPT-4o-mini):',
    aboutSentimentAIDesc: 'Para artículos relacionados con divisas, utilizamos GPT-4o-mini de OpenAI. El modelo analiza el título y resumen del artículo considerando factores como cambios en el tipo de cambio, políticas económicas, estabilidad política, acciones del banco central, reservas internacionales, inflación y relaciones internacionales.',
    aboutSentimentKeywords: 'Análisis por Palabras Clave (Fallback):',
    aboutSentimentKeywordsDesc: 'Para artículos no relacionados directamente con divisas, utilizamos un sistema de palabras clave optimizado que identifica términos específicos que indican fortalecimiento o debilitamiento del dólar.',
    aboutSentimentWeighting: 'Ponderación Inteligente:',
    aboutSentimentWeightingDesc: 'El sentimiento diario se calcula usando un algoritmo avanzado que: (1) Ponderación temporal - artículos más recientes tienen mayor peso, (2) Ponderación por categoría - artículos de divisas tienen 1.5x peso, (3) Umbral de confianza - requiere al menos 20% de diferencia para determinar tendencia.',
    aboutSentimentUpdate: 'Actualización Continua:',
    aboutSentimentUpdateDesc: 'El análisis de sentimiento se realiza automáticamente cuando se agregan nuevos artículos. Los artículos se actualizan cada 15 minutos desde todas las fuentes.',
    aboutCaveats: 'Advertencias importantes',
    aboutCaveatsTitle: 'El dólar blue refleja el mercado informal.',
    aboutCaveatsDesc: 'Los tipos de cambio del mercado paralelo pueden variar significativamente del tipo de cambio oficial del Banco Central de Bolivia. La diferencia (spread) entre ambos indica la presión del mercado y puede reflejar escasez de divisas, expectativas de devaluación, o restricciones cambiarias. Use esta información únicamente como referencia. No nos hacemos responsables de decisiones financieras tomadas con base en estos datos.',
    aboutTransparency: 'Transparencia',
    aboutTransparencyDesc: 'Este es un proyecto de código abierto creado para proporcionar visibilidad sobre el mercado cambiario boliviano durante la presidencia de Rodrigo Paz. El código fuente está disponible públicamente para revisión y auditoría.',
    aboutLastUpdate: 'Última actualización del sistema: Noviembre 2025',
    
    // About Page (Full)
    aboutPageTitle: 'Acerca de - Bolivia Blue con Paz',
    aboutMissionTitle: 'Nuestra Misión',
    aboutMissionDesc: 'Bolivia Blue con Paz es una plataforma independiente de seguimiento en tiempo real del tipo de cambio del dólar blue en Bolivia. Nuestro objetivo es proporcionar transparencia y visibilidad sobre el mercado cambiario informal durante la presidencia de Rodrigo Paz.',
    aboutMissionDesc2: 'Creemos que el acceso a información precisa y actualizada sobre los tipos de cambio es fundamental para que los bolivianos tomen decisiones financieras informadas.',
    aboutUpdateFrequency: 'Frecuencia de Actualización',
    aboutUpdateFrequency1: 'Tasas de cambio: cada 15 minutos desde Binance P2P',
    aboutUpdateFrequency2: 'Noticias financieras: cada 5 minutos desde múltiples fuentes',
    aboutUpdateFrequency3: 'Análisis de sentimiento: en tiempo real con IA',
    aboutDataSource1Title: 'Binance P2P:',
    aboutDataSource2Title: 'Banco Central de Bolivia:',
    aboutDataSource3Title: 'Medios de comunicación:',
    aboutDataSource4Title: 'Redes sociales:',
    aboutAITitle: 'Análisis de Sentimiento con Inteligencia Artificial',
    aboutAIDesc: 'Utilizamos OpenAI GPT-4o-mini para analizar el sentimiento de noticias y tweets relacionados con la economía boliviana y el tipo de cambio.',
    aboutAIDetails: 'El sistema identifica si una noticia o tweet sugiere que el dólar subirá (alcista), bajará (bajista), o no tendrá efecto significativo (neutral). Esto ayuda a los usuarios a entender el contexto detrás de los movimientos del tipo de cambio.',
    aboutTransparency1: 'Código fuente disponible públicamente',
    aboutTransparency2: 'Metodología transparente y documentada',
    aboutTransparency3: 'Sin manipulación de datos',
    aboutTransparency4: 'Actualizaciones automáticas sin intervención manual',
    aboutCaveats1: 'Los precios del mercado paralelo pueden variar según la ubicación y el método de pago',
    aboutCaveats2: 'No somos responsables de decisiones financieras tomadas con base en estos datos',
    aboutCaveats3: 'Siempre verifique las tasas antes de realizar transacciones',
    aboutCaveats4: 'El dólar blue es un mercado informal y puede estar sujeto a regulaciones locales',
    aboutContactTitle: 'Contacto y Feedback',
    aboutContactDesc: '¿Tienes preguntas, sugerencias o encontraste un error? Estamos abiertos a feedback de la comunidad. Puedes contactarnos a través de nuestra página de contacto.',
    aboutFooter: 'Bolivia Blue con Paz - Transparencia en el mercado cambiario boliviano',
    
    // FAQ Page
    faqPageTitle: 'Preguntas Frecuentes - Bolivia Blue con Paz | Mejor que bolivianblue.net',
    faqPageSubtitle: 'Respuestas a las preguntas más comunes sobre el dólar blue en Bolivia',
    faqQ1: '¿Qué es el dólar blue en Bolivia?',
    faqA1: 'El dólar blue (o dólar paralelo) es el tipo de cambio del dólar estadounidense en el mercado informal de Bolivia. A diferencia del tipo de cambio oficial establecido por el Banco Central de Bolivia (BCB), el dólar blue se negocia libremente entre particulares y puede diferir significativamente del tipo oficial. Este mercado surge cuando hay restricciones cambiarias, escasez de divisas oficiales, o expectativas de devaluación.',
    faqQ2: '¿Por qué el dólar blue es diferente del tipo de cambio oficial?',
    faqA2: 'El tipo de cambio oficial está controlado por el Banco Central de Bolivia y se mantiene relativamente estable. El dólar blue refleja la oferta y demanda real del mercado, y puede ser más alto cuando:\n\n• Hay escasez de dólares en el mercado oficial\n• Existen restricciones para comprar dólares a través de canales oficiales\n• Hay expectativas de devaluación del boliviano\n• La demanda de dólares supera la oferta oficial\n\nLa diferencia entre ambos tipos (spread) indica la presión del mercado sobre la moneda.',
    faqQ3: '¿Cómo se calcula el precio del dólar blue en este sitio?',
    faqA3: 'Calculamos el dólar blue usando datos de Binance P2P, una plataforma de intercambio peer-to-peer de criptomonedas. Específicamente:\n\n• Recopilamos ofertas públicas de compra y venta del par USDT/BOB (Tether/Boliviano)\n• Tomamos una muestra representativa de ofertas (aproximadamente 20 por lado)\n• Calculamos la mediana de las ofertas de compra para obtener el precio de venta\n• Calculamos la mediana de las ofertas de venta para obtener el precio de compra\n• Actualizamos estos datos cada 15 minutos\n\nLa mediana es más robusta que el promedio porque no se ve afectada por valores extremos.',
    faqQ4: '¿Es legal cambiar dólares en el mercado paralelo (blue)?',
    faqA4: 'El mercado paralelo de divisas existe en un área gris legal. Si bien no está explícitamente prohibido en muchos casos, las transacciones pueden estar sujetas a regulaciones locales sobre control cambiario. Recomendamos:\n\n• Consultar con un asesor legal o financiero antes de realizar transacciones grandes\n• Verificar las regulaciones actuales del Banco Central de Bolivia\n• Usar canales oficiales cuando sea posible\n\nEste sitio proporciona información únicamente con fines informativos y no constituye asesoramiento legal o financiero.',
    faqQ5: '¿Dónde puedo cambiar dólares en Bolivia?',
    faqA5: 'En Bolivia puedes cambiar dólares en:\n\n• Bancos autorizados (tipo de cambio oficial)\n• Casas de cambio autorizadas (tipo de cambio oficial o cercano)\n• Mercado paralelo (dólar blue) - a través de particulares, plataformas P2P como Binance, o casas de cambio no oficiales\n\nEl tipo de cambio oficial suele ser más bajo pero puede tener restricciones. El dólar blue suele ser más alto pero más accesible.',
    faqQ6: '¿Por qué sube o baja el dólar blue?',
    faqA6: 'El dólar blue fluctúa según varios factores:\n\n• Oferta y demanda: Si hay más personas buscando dólares que dólares disponibles, el precio sube\n• Expectativas económicas: Noticias sobre inflación, políticas económicas, o estabilidad política afectan el precio\n• Restricciones oficiales: Si el BCB limita el acceso a dólares oficiales, el mercado paralelo crece\n• Factores externos: Crisis internacionales, precios de commodities, o cambios en políticas de otros países\n• Confianza en la moneda: Si hay preocupación sobre el valor del boliviano, la demanda de dólares aumenta\n\nSeguimos las noticias económicas y políticas para entender estos movimientos.',
    faqQ7: '¿Cada cuánto actualizan los datos?',
    faqA7: 'Actualizamos los datos con la siguiente frecuencia:\n\n• Tipo de cambio (compra/venta): Cada 15 minutos desde Binance P2P\n• Noticias financieras: Cada 5 minutos desde múltiples fuentes (Google News, medios bolivianos, Twitter)\n• Análisis de sentimiento: En tiempo real cuando se publican nuevas noticias o tweets\n• Gráficos históricos: Se actualizan automáticamente con cada nueva medición\n\nEl sistema funciona 24/7 sin intervención manual.',
    faqQ8: '¿De dónde obtienen las noticias?',
    faqA8: 'Recopilamos noticias de múltiples fuentes confiables:\n\n• Google News con búsquedas específicas sobre economía boliviana, Rodrigo Paz, y tipo de cambio\n• Medios bolivianos: El Deber, Página Siete, Los Tiempos, La Razón, Opinion.com.bo\n• Twitter/X: Tweets de cuentas verificadas y con alta relevancia sobre economía boliviana\n• Fuentes oficiales: Comunicados del Banco Central de Bolivia y gobierno\n\nFiltramos las noticias para incluir solo contenido relevante a Bolivia, economía, finanzas, y la presidencia de Rodrigo Paz.',
    faqQ9: '¿Qué es Binance P2P?',
    faqA9: 'Binance P2P es una plataforma de intercambio peer-to-peer (persona a persona) operada por Binance, una de las mayores exchanges de criptomonedas del mundo. Permite a los usuarios comprar y vender criptomonedas (como USDT, que está vinculado al dólar) directamente con otros usuarios usando moneda local (en este caso, bolivianos).\n\n• Los usuarios publican ofertas de compra o venta\n• Otros usuarios pueden aceptar estas ofertas\n• Las transacciones se realizan directamente entre usuarios\n• Binance actúa como intermediario y garantiza la seguridad\n\nUsamos Binance P2P porque es una fuente transparente y pública de datos sobre el mercado paralelo de divisas.',
    faqQ10: '¿Qué es el análisis de sentimiento y cómo funciona?',
    faqA10: 'El análisis de sentimiento utiliza inteligencia artificial (OpenAI GPT-4o-mini) para determinar si una noticia o tweet sugiere que el dólar subirá, bajará, o no tendrá efecto significativo.\n\nEl sistema:\n\n• Lee el contenido completo del artículo o tweet\n• Analiza el contexto y las implicaciones económicas\n• Clasifica el sentimiento como:\n  - Alcista (↗️): Sugiere que el dólar subirá\n  - Bajista (↘️): Sugiere que el dólar bajará\n  - Neutral (⚪): No indica un movimiento claro\n\nEsto ayuda a los usuarios a entender el contexto detrás de los movimientos del tipo de cambio.',
    faqQ11: '¿Rodrigo Paz qué tiene que ver con el dólar blue?',
    faqA11: 'Rodrigo Paz es el actual Presidente de Bolivia. Sus políticas económicas, decisiones sobre control cambiario, y gestión de la economía nacional tienen un impacto directo en el tipo de cambio del dólar blue.\n\nPor ejemplo:\n\n• Si implementa políticas que aumentan la confianza en el boliviano, el dólar blue puede bajar\n• Si hay restricciones cambiarias o controles, el mercado paralelo puede crecer\n• Sus comunicados y decisiones del Banco Central afectan las expectativas del mercado\n• Las políticas fiscales y monetarias influyen en la oferta y demanda de dólares\n\nSeguimos las noticias sobre su presidencia para entender cómo afectan al mercado cambiario. Puedes leer más en nuestra página dedicada a Rodrigo Paz.',
    faqQ12: '¿Cómo uso la calculadora de divisas?',
    faqA12: 'La calculadora es simple de usar:\n\n1. Ve a la página "Calculadora"\n2. Ingresa la cantidad que deseas convertir\n3. Selecciona la dirección de conversión (USD a BOB o BOB a USD)\n4. La calculadora usa automáticamente las tasas más recientes del dólar blue\n5. Puedes hacer clic en el botón de intercambio (↔️) para cambiar la dirección\n\nLa calculadora se actualiza automáticamente cada 15 minutos con las tasas más recientes.',
    faqStillHaveQuestions: '¿Aún tienes preguntas?',
    faqStillHaveQuestionsDesc: 'Si no encontraste la respuesta que buscabas, puedes leer más información en nuestras otras páginas o contactarnos.',
    faqLearnMore: 'Más información',
    faqAboutRodrigoPaz: 'Sobre Rodrigo Paz',
    
    // Rodrigo Paz Page
    rodrigoPazPageTitle: 'Rodrigo Paz - Presidencia y Economía Boliviana',
    rodrigoPazIntro: 'Rodrigo Paz es el actual Presidente del Estado Plurinacional de Bolivia. Su presidencia marca un período significativo en la historia económica del país, con políticas que tienen un impacto directo en el mercado cambiario y el tipo de cambio del dólar blue.',
    rodrigoPazIntro2: 'Esta página proporciona contexto sobre su presidencia, políticas económicas, y cómo estas decisiones afectan el mercado cambiario boliviano que rastreamos en Bolivia Blue con Paz.',
    rodrigoPazPresidencyTitle: 'Presidencia y Contexto Histórico',
    rodrigoPazTimeline1Title: 'Inicio de Presidencia',
    rodrigoPazTimeline1Desc: 'Rodrigo Paz asumió la presidencia de Bolivia en un momento de transición económica. Su administración heredó desafíos relacionados con el control cambiario, la estabilidad monetaria, y las expectativas del mercado sobre el futuro del boliviano.',
    rodrigoPazTimeline2Title: 'Contexto Económico',
    rodrigoPazTimeline2Desc: 'Bolivia ha mantenido históricamente un tipo de cambio fijo o controlado por el Banco Central. Sin embargo, la presión del mercado, la demanda de dólares, y factores externos han llevado al desarrollo de un mercado paralelo (dólar blue) que refleja la oferta y demanda real.',
    rodrigoPazEconomicPoliciesTitle: 'Políticas Económicas y Cambiarias',
    rodrigoPazEconomicPoliciesDesc: 'Las decisiones de la administración de Rodrigo Paz sobre política monetaria, control cambiario, y gestión fiscal tienen un impacto directo en el tipo de cambio del dólar blue. A continuación, exploramos las principales áreas de política:',
    rodrigoPazPolicy1Title: 'Control Cambiario',
    rodrigoPazPolicy1Desc: 'El Banco Central de Bolivia, bajo la supervisión del gobierno de Paz, mantiene controles sobre el tipo de cambio oficial. Las restricciones en el acceso a dólares oficiales pueden aumentar la demanda en el mercado paralelo, afectando el precio del dólar blue.',
    rodrigoPazPolicy2Title: 'Política Monetaria',
    rodrigoPazPolicy2Desc: 'Las decisiones sobre tasas de interés, emisión monetaria, y reservas internacionales influyen en la confianza en el boliviano. Si hay preocupación sobre la estabilidad monetaria, la demanda de dólares aumenta, presionando al alza el dólar blue.',
    rodrigoPazPolicy3Title: 'Política Fiscal',
    rodrigoPazPolicy3Desc: 'El gasto público, la inversión gubernamental, y la gestión del déficit fiscal afectan las expectativas económicas. Políticas que generan confianza pueden fortalecer el boliviano, mientras que preocupaciones fiscales pueden debilitarlo.',
    rodrigoPazPolicy4Title: 'Relaciones Internacionales',
    rodrigoPazPolicy4Desc: 'Los acuerdos comerciales, relaciones con organismos internacionales, y acceso a financiamiento externo influyen en la disponibilidad de dólares y las expectativas del mercado sobre el futuro económico del país.',
    rodrigoPazBlueRateTitle: 'Impacto en el Dólar Blue',
    rodrigoPazBlueRateDesc: 'Las políticas y decisiones de la administración de Rodrigo Paz tienen un impacto directo en el tipo de cambio del dólar blue. Entender este contexto es fundamental para interpretar los movimientos del mercado paralelo.',
    rodrigoPazBlueRateFactorsTitle: 'Factores que Conectan la Presidencia con el Dólar Blue',
    rodrigoPazBlueRateFactor1: 'Comunicados oficiales sobre política económica y cambiaria',
    rodrigoPazBlueRateFactor2: 'Decisiones del Banco Central sobre reservas y tipo de cambio oficial',
    rodrigoPazBlueRateFactor3: 'Anuncios sobre políticas fiscales y monetarias',
    rodrigoPazBlueRateFactor4: 'Relaciones internacionales y acceso a financiamiento',
    rodrigoPazBlueRateFactor5: 'Estabilidad política y expectativas del mercado',
    rodrigoPazBlueRateConclusion: 'Seguimos las noticias sobre la presidencia de Rodrigo Paz para entender cómo sus decisiones afectan el mercado cambiario. Nuestro sistema de análisis de sentimiento con IA ayuda a identificar cuando las noticias sugieren que el dólar subirá o bajará basándose en estas políticas.',
    rodrigoPazRecentChangesTitle: 'Cambios Recientes e Iniciativas',
    rodrigoPazRecentChangesDesc: 'La administración de Rodrigo Paz ha implementado o propuesto varias iniciativas que pueden afectar el mercado cambiario:',
    rodrigoPazChange1Title: 'Gestión del Banco Central',
    rodrigoPazChange1Desc: 'Las decisiones sobre la gestión de reservas internacionales, políticas de intervención en el mercado cambiario, y comunicación sobre la política monetaria tienen un impacto inmediato en las expectativas del mercado.',
    rodrigoPazChange2Title: 'Políticas de Estabilización',
    rodrigoPazChange2Desc: 'Iniciativas para estabilizar la economía, controlar la inflación, y mantener la confianza en el boliviano pueden influir en la demanda de dólares y el precio del dólar blue.',
    rodrigoPazChange3Title: 'Reformas Estructurales',
    rodrigoPazChange3Desc: 'Propuestas de reformas económicas, cambios en regulaciones, y nuevas políticas pueden generar expectativas que afectan el mercado cambiario a corto y largo plazo.',
    rodrigoPazConnectionTitle: 'Conexión con Bolivia Blue con Paz',
    rodrigoPazConnectionDesc: 'En Bolivia Blue con Paz, rastreamos en tiempo real cómo las políticas y decisiones de la presidencia de Rodrigo Paz afectan el tipo de cambio del dólar blue. Nuestro sistema de noticias y análisis de sentimiento con IA te ayuda a entender el contexto detrás de cada movimiento del mercado.',
    rodrigoPazViewDashboard: 'Ver Dashboard',
    rodrigoPazViewNews: 'Ver Noticias',
    
    // Footer
    footerText: 'Hecho con datos abiertos para transparencia.',
    footerUpdates: 'Actualizaciones cada 15 minutos',
    
    // Loading & Errors
    loading: 'Cargando...',
    error: 'Error al cargar datos',
    retry: 'Reintentar',
    noData: 'Sin datos disponibles',
    
    // Navigation
    navDashboard: 'Dashboard',
    navDashboardShort: 'Inicio',
    navCommunity: 'Comunidad',
    navCalculator: 'Calculadora',
    navBuyDollars: 'Comprar Dólares',
    navNews: 'Noticias',
    navRodrigoPaz: 'Rodrigo Paz',
    navAbout: 'Acerca de',
    navContact: 'Contacto',
    navFAQ: 'FAQ',
    navBlog: 'Blog',
    navBancos: 'Bancos',
    navPlataformas: 'Plataformas',
    navEquipo: 'Equipo',
    navPrivacy: 'Privacidad',
    navTerms: 'Términos',
    navCorrections: 'Correcciones',
    navEditorial: 'Política Editorial',
    learnMore: 'Saber Más',
    
    // Twitter/X Section
    twitterSection: 'En Twitter/X',
    
    // Sentiment Legend
    sentimentIndicators: 'Indicadores:',
    sentimentUp: 'USD↑',
    sentimentDown: 'USD↓',
    sentimentNeutral: 'Neutral',
    sentimentAI: '(IA)',
    sentimentUSDUp: 'USD ↑',
    sentimentUSDDown: 'USD↓',
    sentimentKeyIndicators: '🔑 Indicadores:',
    sentimentUSDRising: 'USD ↑',
    sentimentUSDFalling: 'USD ↓',
    
    // News
    latestNews: 'Últimas noticias:',
    loadingNews: 'Cargando noticias...',
    errorLoadingNews: 'Error al cargar noticias',
    noNewsAvailable: 'No hay noticias disponibles',
    readMore: 'Leer más',
    economicNews: 'Noticias Económicas',
    newsSubtitle: 'Últimas noticias sobre economía, política y finanzas de Bolivia',
    
    // Tweets
    errorLoadingTweets: 'Error al cargar tweets',
    noTweetsAvailable: 'No hay tweets disponibles',
    
    // Calculator
    currencyCalculator: 'Calculadora de Divisas',
    bolivianos: 'Bolivianos (BOB)',
    dollars: 'Dólares (USD)',
    swapCurrencies: 'Intercambiar monedas',
    unofficialRates: 'Tasas No Oficiales',
    officialRates: 'Tasas Oficiales',
    exchangeRates: 'Tipos de Cambio',
    official: 'Oficial',
    unofficial: 'No Oficial',
    inverse: 'Inverso',
    loadingRates: 'Cargando tasas...',
    
    // Binance Banner
    buyDollarsBinance: 'Comprar dólares en Binance',
    binanceDescription: 'Seguro, rápido y con bajas comisiones',
    goToBinance: 'Ir a Binance',
    goToBinanceAria: 'Ir a Binance (abre en nueva ventana)',
    
    // Chart
    spread: 'Spread',
    historicalPriceChart: 'Gráfico de precios histórico',
    
    // Breadcrumbs
    breadcrumbHome: 'Inicio',
    
    // Time formatting
    lessThanHourAgo: 'Hace menos de 1 hora',
    hoursAgo: 'Hace {hours} hora | Hace {hours} horas',
    daysAgo: 'Hace {days} día | Hace {days} días',
    
    // Sentiment tooltips
    neutralTooltip: 'Neutral - Sin impacto claro en divisas',
    upTooltip: 'Dólar Subiendo - Boliviano Debilitándose',
    downTooltip: 'Dólar Bajando - Boliviano Fortaleciéndose',
    
    // Daily Sentiment Summary
    dailySentimentTitle: 'Sentimiento del Día',
    dailySentimentTotal: 'Total',
    dailySentimentArticles: 'artículos',
    dailySentimentPositive: 'Positivo',
    dailySentimentNegative: 'Negativo',
    dailySentimentTrendUp: 'Tendencia Alcista',
    dailySentimentTrendDown: 'Tendencia Bajista',
    dailySentimentNeutral: 'Neutral',
    
    // Buy Dollars Page
    buyDollarsPageTitle: 'Cómo Comprar Dólares en Bolivia',
    buyDollarsPageSubtitle: 'Guía completa para comprar dólares usando Binance P2P de forma segura',
    buyDollarsCurrentRates: 'Tasas Actuales',
    buyDollarsWhatIsP2P: '¿Qué es Binance P2P?',
    buyDollarsP2PDesc1: 'Binance P2P (Peer-to-Peer) es una plataforma que conecta compradores y vendedores directamente, permitiendo intercambiar criptomonedas como USDT por monedas locales como el Boliviano.',
    buyDollarsP2PDesc2: 'A diferencia del mercado tradicional, Binance actúa como intermediario seguro, bloqueando los fondos hasta que ambas partes confirmen la transacción.',
    buyDollarsP2PAdvantage1: 'Tasas competitivas del mercado paralelo',
    buyDollarsP2PAdvantage2: 'Proceso seguro con garantía de Binance',
    buyDollarsP2PAdvantage3: 'Disponible 24/7',
    buyDollarsP2PAdvantage4: 'Sin necesidad de intermediarios físicos',
    buyDollarsStepByStep: 'Guía Paso a Paso',
    buyDollarsStep1Title: 'Crear cuenta en Binance',
    buyDollarsStep1Desc: 'Regístrate en Binance.com con tu correo electrónico o número de teléfono. Verifica tu identidad completando el proceso KYC (Know Your Customer) con tu documento de identidad.',
    buyDollarsStep2Title: 'Comprar USDT',
    buyDollarsStep2Desc: 'Compra USDT (Tether) usando tu tarjeta de crédito/débito o transferencia bancaria. USDT es una criptomoneda estable vinculada al dólar estadounidense (1 USDT ≈ 1 USD).',
    buyDollarsStep3Title: 'Ir a Binance P2P',
    buyDollarsStep3Desc: 'Navega a la sección P2P de Binance desde el menú principal. Selecciona "Vender" USDT y "Comprar" BOB (Bolivianos). Verás una lista de compradores disponibles.',
    buyDollarsStep4Title: 'Seleccionar comprador',
    buyDollarsStep4Desc: 'Elige un comprador con buena reputación (mira el porcentaje de finalización y las reseñas). Revisa los límites mínimos y máximos de transacción y la tasa ofrecida.',
    buyDollarsStep5Title: 'Realizar transacción',
    buyDollarsStep5Desc: 'Ingresa la cantidad de USDT que deseas vender. Confirma la transacción y espera a que Binance bloquee los fondos en garantía. Transfiere los bolivianos al comprador según las instrucciones proporcionadas. Una vez que el comprador confirme la recepción, recibirás los USDT liberados en tu cuenta.',
    buyDollarsSafetyTips: 'Consejos de Seguridad',
    buyDollarsSafetyTip1: 'Solo negocia con usuarios verificados y con alta reputación (mínimo 95% de finalización)',
    buyDollarsSafetyTip2: 'Nunca completes una transacción fuera de la plataforma Binance P2P',
    buyDollarsSafetyTip3: 'Verifica que los datos bancarios coincidan exactamente antes de transferir',
    buyDollarsSafetyTip4: 'Comunícate solo a través del chat oficial de Binance P2P',
    buyDollarsSafetyTip5: 'Si algo parece sospechoso, cancela la transacción y reporta al usuario',
    buyDollarsReadyToStart: '¿Listo para comenzar?',
    buyDollarsReadyDesc: 'Únete a millones de usuarios que confían en Binance P2P para intercambiar divisas de forma segura.',
    buyDollarsCreateAccount: 'Crear Cuenta en Binance',
    buyDollarsGoToP2P: 'Ir a Binance P2P',
    buyDollarsFAQ: 'Preguntas Frecuentes',
    buyDollarsFAQ1Q: '¿Cuánto tiempo tarda una transacción P2P?',
    buyDollarsFAQ1A: 'Las transacciones P2P generalmente se completan en 15-30 minutos, dependiendo de la velocidad de respuesta del comprador y la confirmación de la transferencia bancaria.',
    buyDollarsFAQ2Q: '¿Hay límites de transacción?',
    buyDollarsFAQ2A: 'Sí, cada comprador establece límites mínimos y máximos. Los límites típicos van desde 100 BOB hasta varios miles de bolivianos. Verifica los límites antes de iniciar una transacción.',
    buyDollarsFAQ3Q: '¿Es seguro usar Binance P2P?',
    buyDollarsFAQ3A: 'Binance P2P es seguro cuando sigues las mejores prácticas: verifica la reputación del usuario, nunca completes transacciones fuera de la plataforma, y comunícate solo a través del chat oficial. Binance actúa como intermediario y bloquea los fondos hasta que ambas partes confirmen.',
    buyDollarsFAQ4Q: '¿Qué pasa si hay un problema con la transacción?',
    buyDollarsFAQ4A: 'Si surge algún problema, puedes usar el sistema de disputa de Binance. Un moderador revisará el caso y resolverá según la evidencia proporcionada. Siempre mantén capturas de pantalla de tus transferencias bancarias como prueba.'
  },
  
  en: {
    // Header
    title: 'Bolivia Blue Rate with Paz',
    titleShort: 'Bolivia Blue',
    subtitle: 'Tracking the Boliviano\'s pulse under President Paz',
    
    // Rate Cards
    buy: 'BUY',
    sell: 'SELL',
    perUSD: 'Bs. per USD',
    updated: 'Updated',
    stale: 'Stale',
    change24h: '24h',
    blueMarketTitle: 'Parallel Market (Blue Dollar) - Binance P2P',
    officialRateTitle: 'Official Exchange Rate - Central Bank of Bolivia',
    
    // Chart
    chartTitle: 'Blue Dollar History',
    timeRanges: {
      '1D': '1D',
      '1W': '1W',
      '1M': '1M',
      '1Y': '1Y',
      'ALL': 'All'
    },
    blueRate: 'Blue Dollar',
    officialRate: 'Official',
    collectingData: 'Collecting historical data...',
    collectingDataDesc: 'The system updates every 15 minutes. Historical data will accumulate over time.',
    fewDataPoints: '📊 Recent data',
    fewDataPointsDesc: 'point | points. The chart will improve as more data accumulates every 15 minutes.',
    chartBuy: 'Buy',
    chartSell: 'Sell',
    
    // News
    newsTitle: 'Economic News',
    newsLoading: 'Loading news...',
    newsError: 'Failed to load news',
    newsEmpty: 'No news available at this time',
    newsSentiment: {
      up: 'Bullish',
      down: 'Bearish',
      neutral: 'Neutral'
    },
    
    // About
    aboutTitle: 'About Bolivia Blue with Paz',
    aboutMethodology: 'Methodology',
    aboutMethodologyDesc: 'This site tracks two types of exchange rates in Bolivia:',
    aboutBlueMarket: 'Parallel Market (Blue Dollar):',
    aboutBlueMarketDesc: 'Data from public Binance P2P offers for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the informal market.',
    aboutOfficialRate: 'Official Exchange Rate:',
    aboutOfficialRateDesc: 'Rate controlled by the Central Bank of Bolivia (BCB), used by banks and authorized exchange houses. This rate is typically fixed or adjusted very infrequently.',
    aboutDataSources: 'Data sources',
    aboutDataSource1: 'Blue Dollar: Binance P2P API (USDT/BOB)',
    aboutDataSource2: 'Official Exchange Rate: Central Bank of Bolivia / market APIs',
    aboutDataSource3: 'News: Verified Bolivian media (El Deber, Página Siete, La Razón, etc.)',
    aboutDataSource4: 'Update frequency: every 15 minutes',
    aboutNewsSources: 'News Sources',
    aboutNewsSourcesDesc: 'Our system collects articles from multiple verified sources to ensure comprehensive and up-to-date coverage:',
    aboutNewsSourceRSS: 'RSS Feeds:',
    aboutNewsSourceRSSDesc: 'Google News (specific searches about Bolivian economy, Rodrigo Paz, and dollar), El Deber, Página Siete, Opinión, eju.tv and other verified Bolivian media outlets.',
    aboutNewsSourceTwitter: 'Twitter/X:',
    aboutNewsSourceTwitterDesc: 'Real-time searches using Twitter\'s official API with specific queries about Bolivian economy, exchange rates, and mentions of Rodrigo Paz. Updated every 15 minutes.',
    aboutNewsSourceFiltering: 'Smart Filtering:',
    aboutNewsSourceFilteringDesc: 'We only show articles relevant to Bolivia that mention economy, politics, currency, or Rodrigo Paz. Articles are automatically categorized (currency, economy, politics, banking, etc.).',
    aboutNewsSourceDeduplication: 'Duplicate Prevention:',
    aboutNewsSourceDeduplicationDesc: 'Each article is identified by its unique URL. The system prevents storing duplicate articles, ensuring each news item appears only once.',
    aboutSentimentAnalysis: 'AI-Powered Sentiment Analysis',
    aboutSentimentAnalysisDesc: 'We use advanced artificial intelligence to determine whether news suggests the dollar will rise or fall:',
    aboutSentimentAI: 'Primary AI (OpenAI GPT-4o-mini):',
    aboutSentimentAIDesc: 'For currency-related articles, we use OpenAI\'s GPT-4o-mini. The model analyzes the article title and summary considering factors like exchange rate changes, economic policies, political stability, central bank actions, foreign reserves, inflation, and international relations.',
    aboutSentimentKeywords: 'Keyword Analysis (Fallback):',
    aboutSentimentKeywordsDesc: 'For articles not directly related to currency, we use an optimized keyword system that identifies specific terms indicating dollar strengthening or weakening.',
    aboutSentimentWeighting: 'Smart Weighting:',
    aboutSentimentWeightingDesc: 'Daily sentiment is calculated using an advanced algorithm that: (1) Time-weighting - more recent articles have higher weight, (2) Category weighting - currency articles have 1.5x weight, (3) Confidence threshold - requires at least 20% difference to determine trend.',
    aboutSentimentUpdate: 'Continuous Updates:',
    aboutSentimentUpdateDesc: 'Sentiment analysis is performed automatically when new articles are added. Articles are updated every 15 minutes from all sources.',
    aboutCaveats: 'Important warnings',
    aboutCaveatsTitle: 'The blue dollar reflects the informal market.',
    aboutCaveatsDesc: 'Parallel market exchange rates may vary significantly from the official exchange rate of the Central Bank of Bolivia. The difference (spread) between both indicates market pressure and may reflect foreign currency shortages, devaluation expectations, or exchange restrictions. Use this information only as a reference. We are not responsible for financial decisions made based on this data.',
    aboutTransparency: 'Transparency',
    aboutTransparencyDesc: 'This is an open source project created to provide visibility into the Bolivian exchange market during the presidency of Rodrigo Paz.',
    aboutLastUpdate: 'Last system update: November 2025',
    
    // About Page (Full)
    aboutPageTitle: 'About - Bolivia Blue with Paz | Better than bolivianblue.net',
    aboutMissionTitle: 'Our Mission',
    aboutMissionDesc: 'Bolivia Blue with Paz is an independent platform for real-time tracking of the blue dollar exchange rate in Bolivia. Our goal is to provide transparency and visibility into the informal exchange market during the presidency of Rodrigo Paz.',
    aboutMissionDesc2: 'We believe that access to accurate and up-to-date information about exchange rates is essential for Bolivians to make informed financial decisions.',
    aboutUpdateFrequency: 'Update Frequency',
    aboutUpdateFrequency1: 'Exchange rates: every 15 minutes from Binance P2P',
    aboutUpdateFrequency2: 'Financial news: every 5 minutes from multiple sources',
    aboutUpdateFrequency3: 'Sentiment analysis: in real-time with AI',
    aboutDataSource1Title: 'Binance P2P:',
    aboutDataSource2Title: 'Central Bank of Bolivia:',
    aboutDataSource3Title: 'Media:',
    aboutDataSource4Title: 'Social media:',
    aboutAITitle: 'Sentiment Analysis with Artificial Intelligence',
    aboutAIDesc: 'We use OpenAI GPT-4o-mini to analyze the sentiment of news and tweets related to the Bolivian economy and exchange rate.',
    aboutAIDetails: 'The system identifies whether a news article or tweet suggests the dollar will rise (bullish), fall (bearish), or have no significant effect (neutral). This helps users understand the context behind exchange rate movements.',
    aboutTransparency1: 'Publicly available source code',
    aboutTransparency2: 'Transparent and documented methodology',
    aboutTransparency3: 'No data manipulation',
    aboutTransparency4: 'Automatic updates without manual intervention',
    aboutCaveats1: 'Parallel market prices may vary by location and payment method',
    aboutCaveats2: 'We are not responsible for financial decisions made based on this data',
    aboutCaveats3: 'Always verify rates before making transactions',
    aboutCaveats4: 'The blue dollar is an informal market and may be subject to local regulations',
    aboutContactTitle: 'Contact and Feedback',
    aboutContactDesc: 'Do you have questions, suggestions, or found an error? We are open to community feedback. You can contact us through our contact page.',
    aboutFooter: 'Bolivia Blue with Paz - Transparency in the Bolivian exchange market',
    
    // FAQ Page
    faqPageTitle: 'Frequently Asked Questions - Bolivia Blue with Paz | Better than bolivianblue.net',
    faqPageSubtitle: 'Answers to the most common questions about the blue dollar in Bolivia',
    faqQ1: 'What is the blue dollar in Bolivia?',
    faqA1: 'The blue dollar (or parallel dollar) is the exchange rate of the US dollar in Bolivia\'s informal market. Unlike the official exchange rate set by the Central Bank of Bolivia (BCB), the blue dollar is freely traded between individuals and can differ significantly from the official rate. This market emerges when there are exchange restrictions, shortages of official foreign currency, or devaluation expectations.',
    faqQ2: 'Why is the blue dollar different from the official exchange rate?',
    faqA2: 'The official exchange rate is controlled by the Central Bank of Bolivia and remains relatively stable. The blue dollar reflects real market supply and demand, and can be higher when:\n\n• There is a shortage of dollars in the official market\n• There are restrictions on buying dollars through official channels\n• There are expectations of boliviano devaluation\n• Dollar demand exceeds official supply\n\nThe difference between both rates (spread) indicates market pressure on the currency.',
    faqQ3: 'How is the blue dollar price calculated on this site?',
    faqA3: 'We calculate the blue dollar using data from Binance P2P, a peer-to-peer cryptocurrency exchange platform. Specifically:\n\n• We collect public buy and sell offers for the USDT/BOB (Tether/Boliviano) pair\n• We take a representative sample of offers (approximately 20 per side)\n• We calculate the median of buy offers to get the sell price\n• We calculate the median of sell offers to get the buy price\n• We update this data every 15 minutes\n\nThe median is more robust than the average because it is not affected by extreme values.',
    faqQ4: 'Is it legal to exchange dollars in the parallel (blue) market?',
    faqA4: 'The parallel foreign exchange market exists in a legal gray area. While not explicitly prohibited in many cases, transactions may be subject to local regulations on exchange control. We recommend:\n\n• Consulting with a legal or financial advisor before making large transactions\n• Verifying current Central Bank of Bolivia regulations\n• Using official channels when possible\n\nThis site provides information for informational purposes only and does not constitute legal or financial advice.',
    faqQ5: 'Where can I exchange dollars in Bolivia?',
    faqA5: 'In Bolivia you can exchange dollars at:\n\n• Authorized banks (official exchange rate)\n• Authorized exchange houses (official or near-official exchange rate)\n• Parallel market (blue dollar) - through individuals, P2P platforms like Binance, or unofficial exchange houses\n\nThe official exchange rate is usually lower but may have restrictions. The blue dollar is usually higher but more accessible.',
    faqQ6: 'Why does the blue dollar go up or down?',
    faqA6: 'The blue dollar fluctuates based on several factors:\n\n• Supply and demand: If more people are looking for dollars than dollars available, the price goes up\n• Economic expectations: News about inflation, economic policies, or political stability affects the price\n• Official restrictions: If the BCB limits access to official dollars, the parallel market grows\n• External factors: International crises, commodity prices, or policy changes in other countries\n• Currency confidence: If there is concern about the value of the boliviano, demand for dollars increases\n\nWe follow economic and political news to understand these movements.',
    faqQ7: 'How often are the data updated?',
    faqA7: 'We update the data with the following frequency:\n\n• Exchange rate (buy/sell): Every 15 minutes from Binance P2P\n• Financial news: Every 5 minutes from multiple sources (Google News, Bolivian media, Twitter)\n• Sentiment analysis: In real-time when new news or tweets are published\n• Historical charts: Automatically updated with each new measurement\n\nThe system runs 24/7 without manual intervention.',
    faqQ8: 'Where do you get the news from?',
    faqA8: 'We collect news from multiple reliable sources:\n\n• Google News with specific searches about Bolivian economy, Rodrigo Paz, and exchange rate\n• Bolivian media: El Deber, Página Siete, Los Tiempos, La Razón, Opinion.com.bo\n• Twitter/X: Tweets from verified accounts with high relevance about Bolivian economy\n• Official sources: Communications from the Central Bank of Bolivia and government\n\nWe filter news to include only content relevant to Bolivia, economy, finance, and the presidency of Rodrigo Paz.',
    faqQ9: 'What is Binance P2P?',
    faqA9: 'Binance P2P is a peer-to-peer (person-to-person) exchange platform operated by Binance, one of the world\'s largest cryptocurrency exchanges. It allows users to buy and sell cryptocurrencies (such as USDT, which is pegged to the dollar) directly with other users using local currency (in this case, bolivianos).\n\n• Users post buy or sell offers\n• Other users can accept these offers\n• Transactions are made directly between users\n• Binance acts as an intermediary and guarantees security\n\nWe use Binance P2P because it is a transparent and public source of data on the parallel foreign exchange market.',
    faqQ10: 'What is sentiment analysis and how does it work?',
    faqA10: 'Sentiment analysis uses artificial intelligence (OpenAI GPT-4o-mini) to determine whether a news article or tweet suggests the dollar will rise, fall, or have no significant effect.\n\nThe system:\n\n• Reads the full content of the article or tweet\n• Analyzes the context and economic implications\n• Classifies sentiment as:\n  - Bullish (↗️): Suggests the dollar will rise\n  - Bearish (↘️): Suggests the dollar will fall\n  - Neutral (⚪): Does not indicate a clear movement\n\nThis helps users understand the context behind exchange rate movements.',
    faqQ11: 'What does Rodrigo Paz have to do with the blue dollar?',
    faqA11: 'Rodrigo Paz is the current President of Bolivia. His economic policies, decisions on exchange control, and management of the national economy have a direct impact on the blue dollar exchange rate.\n\nFor example:\n\n• If he implements policies that increase confidence in the boliviano, the blue dollar may fall\n• If there are exchange restrictions or controls, the parallel market may grow\n• His communications and Central Bank decisions affect market expectations\n• Fiscal and monetary policies influence the supply and demand of dollars\n\nWe follow news about his presidency to understand how it affects the exchange market. You can read more on our dedicated Rodrigo Paz page.',
    faqQ12: 'How do I use the currency calculator?',
    faqA12: 'The calculator is simple to use:\n\n1. Go to the "Calculator" page\n2. Enter the amount you want to convert\n3. Select the conversion direction (USD to BOB or BOB to USD)\n4. The calculator automatically uses the most recent blue dollar rates\n5. You can click the swap button (↔️) to change direction\n\nThe calculator automatically updates every 15 minutes with the most recent rates.',
    faqStillHaveQuestions: 'Still have questions?',
    faqStillHaveQuestionsDesc: 'If you didn\'t find the answer you were looking for, you can read more information on our other pages or contact us.',
    faqLearnMore: 'Learn More',
    faqAboutRodrigoPaz: 'About Rodrigo Paz',
    
    // Rodrigo Paz Page
    rodrigoPazPageTitle: 'Rodrigo Paz - Presidencia y Economía Boliviana',
    rodrigoPazIntro: 'Rodrigo Paz es el actual Presidente del Estado Plurinacional de Bolivia. Su presidencia marca un período significativo en la historia económica del país, con políticas que tienen un impacto directo en el mercado cambiario y el tipo de cambio del dólar blue.',
    rodrigoPazIntro2: 'Esta página proporciona contexto sobre su presidencia, políticas económicas, y cómo estas decisiones afectan el mercado cambiario boliviano que rastreamos en Bolivia Blue con Paz.',
    rodrigoPazPresidencyTitle: 'Presidencia y Contexto Histórico',
    rodrigoPazTimeline1Title: 'Inicio de Presidencia',
    rodrigoPazTimeline1Desc: 'Rodrigo Paz asumió la presidencia de Bolivia en un momento de transición económica. Su administración heredó desafíos relacionados con el control cambiario, la estabilidad monetaria, y las expectativas del mercado sobre el futuro del boliviano.',
    rodrigoPazTimeline2Title: 'Contexto Económico',
    rodrigoPazTimeline2Desc: 'Bolivia ha mantenido históricamente un tipo de cambio fijo o controlado por el Banco Central. Sin embargo, la presión del mercado, la demanda de dólares, y factores externos han llevado al desarrollo de un mercado paralelo (dólar blue) que refleja la oferta y demanda real.',
    rodrigoPazEconomicPoliciesTitle: 'Políticas Económicas y Cambiarias',
    rodrigoPazEconomicPoliciesDesc: 'Las decisiones de la administración de Rodrigo Paz sobre política monetaria, control cambiario, y gestión fiscal tienen un impacto directo en el tipo de cambio del dólar blue. A continuación, exploramos las principales áreas de política:',
    rodrigoPazPolicy1Title: 'Control Cambiario',
    rodrigoPazPolicy1Desc: 'El Banco Central de Bolivia, bajo la supervisión del gobierno de Paz, mantiene controles sobre el tipo de cambio oficial. Las restricciones en el acceso a dólares oficiales pueden aumentar la demanda en el mercado paralelo, afectando el precio del dólar blue.',
    rodrigoPazPolicy2Title: 'Política Monetaria',
    rodrigoPazPolicy2Desc: 'Las decisiones sobre tasas de interés, emisión monetaria, y reservas internacionales influyen en la confianza en el boliviano. Si hay preocupación sobre la estabilidad monetaria, la demanda de dólares aumenta, presionando al alza el dólar blue.',
    rodrigoPazPolicy3Title: 'Política Fiscal',
    rodrigoPazPolicy3Desc: 'El gasto público, la inversión gubernamental, y la gestión del déficit fiscal afectan las expectativas económicas. Políticas que generan confianza pueden fortalecer el boliviano, mientras que preocupaciones fiscales pueden debilitarlo.',
    rodrigoPazPolicy4Title: 'Relaciones Internacionales',
    rodrigoPazPolicy4Desc: 'Los acuerdos comerciales, relaciones con organismos internacionales, y acceso a financiamiento externo influyen en la disponibilidad de dólares y las expectativas del mercado sobre el futuro económico del país.',
    rodrigoPazBlueRateTitle: 'Impacto en el Dólar Blue',
    rodrigoPazBlueRateDesc: 'Las políticas y decisiones de la administración de Rodrigo Paz tienen un impacto directo en el tipo de cambio del dólar blue. Entender este contexto es fundamental para interpretar los movimientos del mercado paralelo.',
    rodrigoPazBlueRateFactorsTitle: 'Factores que Conectan la Presidencia con el Dólar Blue',
    rodrigoPazBlueRateFactor1: 'Comunicados oficiales sobre política económica y cambiaria',
    rodrigoPazBlueRateFactor2: 'Decisiones del Banco Central sobre reservas y tipo de cambio oficial',
    rodrigoPazBlueRateFactor3: 'Anuncios sobre políticas fiscales y monetarias',
    rodrigoPazBlueRateFactor4: 'Relaciones internacionales y acceso a financiamiento',
    rodrigoPazBlueRateFactor5: 'Estabilidad política y expectativas del mercado',
    rodrigoPazBlueRateConclusion: 'Seguimos las noticias sobre la presidencia de Rodrigo Paz para entender cómo sus decisiones afectan el mercado cambiario. Nuestro sistema de análisis de sentimiento con IA ayuda a identificar cuando las noticias sugieren que el dólar subirá o bajará basándose en estas políticas.',
    rodrigoPazRecentChangesTitle: 'Cambios Recientes e Iniciativas',
    rodrigoPazRecentChangesDesc: 'La administración de Rodrigo Paz ha implementado o propuesto varias iniciativas que pueden afectar el mercado cambiario:',
    rodrigoPazChange1Title: 'Gestión del Banco Central',
    rodrigoPazChange1Desc: 'Las decisiones sobre la gestión de reservas internacionales, políticas de intervención en el mercado cambiario, y comunicación sobre la política monetaria tienen un impacto inmediato en las expectativas del mercado.',
    rodrigoPazChange2Title: 'Políticas de Estabilización',
    rodrigoPazChange2Desc: 'Iniciativas para estabilizar la economía, controlar la inflación, y mantener la confianza en el boliviano pueden influir en la demanda de dólares y el precio del dólar blue.',
    rodrigoPazChange3Title: 'Reformas Estructurales',
    rodrigoPazChange3Desc: 'Propuestas de reformas económicas, cambios en regulaciones, y nuevas políticas pueden generar expectativas que afectan el mercado cambiario a corto y largo plazo.',
    rodrigoPazConnectionTitle: 'Conexión con Bolivia Blue con Paz',
    rodrigoPazConnectionDesc: 'En Bolivia Blue con Paz, rastreamos en tiempo real cómo las políticas y decisiones de la presidencia de Rodrigo Paz afectan el tipo de cambio del dólar blue. Nuestro sistema de noticias y análisis de sentimiento con IA te ayuda a entender el contexto detrás de cada movimiento del mercado.',
    rodrigoPazViewDashboard: 'Ver Dashboard',
    rodrigoPazViewNews: 'Ver Noticias',
    
    // Footer
    footerText: 'Made with open data for transparency.',
    footerUpdates: 'Updates every 15 minutes',
    
    // Loading & Errors
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    noData: 'No data available',
    
    // Navigation
    navDashboard: 'Dashboard',
    navDashboardShort: 'Home',
    navCommunity: 'Community',
    navCalculator: 'Calculator',
    navBuyDollars: 'Buy Dollars',
    navNews: 'News',
    navRodrigoPaz: 'Rodrigo Paz',
    navAbout: 'About',
    navContact: 'Contact',
    navFAQ: 'FAQ',
    navBlog: 'Blog',
    navBancos: 'Banks',
    navPlataformas: 'Platforms',
    navEquipo: 'Team',
    navPrivacy: 'Privacy',
    navTerms: 'Terms',
    navCorrections: 'Corrections',
    navEditorial: 'Editorial Policy',
    learnMore: 'Learn More',
    
    // Twitter/X Section
    twitterSection: 'On Twitter/X',
    
    // Sentiment Legend
    sentimentIndicators: 'Indicators:',
    sentimentUp: 'Up',
    sentimentDown: 'Down',
    sentimentNeutral: 'Neutral',
    sentimentAI: '(AI)',
    sentimentUSDUp: 'USD ↑',
    sentimentUSDDown: 'USD ↓',
    sentimentKeyIndicators: '🔑 Indicators:',
    sentimentUSDRising: 'USD Rising',
    sentimentUSDFalling: 'USD Falling',
    
    // News
    latestNews: 'Latest news:',
    loadingNews: 'Loading news...',
    errorLoadingNews: 'Error loading news',
    noNewsAvailable: 'No news available',
    readMore: 'Read more',
    economicNews: 'Economic News',
    newsSubtitle: 'Latest news about Bolivia\'s economy, politics and finance',
    
    // Tweets
    errorLoadingTweets: 'Failed to load tweets',
    noTweetsAvailable: 'No tweets available',
    
    // Calculator
    currencyCalculator: 'Currency Calculator',
    bolivianos: 'Bolivianos (BOB)',
    dollars: 'Dollars (USD)',
    swapCurrencies: 'Swap currencies',
    unofficialRates: 'Unofficial Rates',
    officialRates: 'Official Rates',
    exchangeRates: 'Exchange Rates',
    official: 'Official',
    unofficial: 'Unofficial',
    inverse: 'Inverse',
    loadingRates: 'Loading rates...',
    
    // Binance Banner
    buyDollarsBinance: 'Buy dollars on Binance',
    binanceDescription: 'Secure, fast and low fees',
    goToBinance: 'Go to Binance',
    goToBinanceAria: 'Go to Binance (opens in new window)',
    
    // Chart
    spread: 'Spread',
    historicalPriceChart: 'Historical Price Chart',
    chartTypeArea: 'Area',
    chartTypeCandlestick: 'Candlestick',
    
    // Breadcrumbs
    breadcrumbHome: 'Home',
    
    // Time formatting
    lessThanHourAgo: 'Less than 1 hour ago',
    hoursAgo: '{hours} hour ago | {hours} hours ago',
    daysAgo: '{days} day ago | {days} days ago',
    
    // Sentiment tooltips
    neutralTooltip: 'Neutral - No clear currency impact',
    upTooltip: 'Dollar Rising - Boliviano Weakening',
    downTooltip: 'Dollar Falling - Boliviano Strengthening',
    
    // Daily Sentiment Summary
    dailySentimentTitle: 'Today\'s Sentiment',
    dailySentimentTotal: 'Total',
    dailySentimentArticles: 'articles',
    dailySentimentPositive: 'Positive',
    dailySentimentNegative: 'Negative',
    dailySentimentTrendUp: 'Bullish Trend',
    dailySentimentTrendDown: 'Bearish Trend',
    dailySentimentNeutral: 'Neutral',
    
    // Buy Dollars Page
    buyDollarsPageTitle: 'How to Buy Dollars in Bolivia',
    buyDollarsPageSubtitle: 'Complete guide to buy dollars using Binance P2P safely',
    buyDollarsCurrentRates: 'Current Rates',
    buyDollarsWhatIsP2P: 'What is Binance P2P?',
    buyDollarsP2PDesc1: 'Binance P2P (Peer-to-Peer) is a platform that connects buyers and sellers directly, allowing you to exchange cryptocurrencies like USDT for local currencies like the Boliviano.',
    buyDollarsP2PDesc2: 'Unlike traditional markets, Binance acts as a secure intermediary, escrowing funds until both parties confirm the transaction.',
    buyDollarsP2PAdvantage1: 'Competitive parallel market rates',
    buyDollarsP2PAdvantage2: 'Secure process with Binance guarantee',
    buyDollarsP2PAdvantage3: 'Available 24/7',
    buyDollarsP2PAdvantage4: 'No need for physical intermediaries',
    buyDollarsStepByStep: 'Step-by-Step Guide',
    buyDollarsStep1Title: 'Create Binance account',
    buyDollarsStep1Desc: 'Sign up on Binance.com with your email or phone number. Verify your identity by completing the KYC (Know Your Customer) process with your ID document.',
    buyDollarsStep2Title: 'Buy USDT',
    buyDollarsStep2Desc: 'Buy USDT (Tether) using your credit/debit card or bank transfer. USDT is a stablecoin pegged to the US dollar (1 USDT ≈ 1 USD).',
    buyDollarsStep3Title: 'Go to Binance P2P',
    buyDollarsStep3Desc: 'Navigate to Binance P2P section from the main menu. Select "Sell" USDT and "Buy" BOB (Bolivianos). You will see a list of available buyers.',
    buyDollarsStep4Title: 'Select buyer',
    buyDollarsStep4Desc: 'Choose a buyer with good reputation (check completion percentage and reviews). Review minimum and maximum transaction limits and the offered rate.',
    buyDollarsStep5Title: 'Complete transaction',
    buyDollarsStep5Desc: 'Enter the amount of USDT you want to sell. Confirm the transaction and wait for Binance to escrow the funds. Transfer bolivianos to the buyer as instructed. Once the buyer confirms receipt, you will receive the released USDT in your account.',
    buyDollarsSafetyTips: 'Safety Tips',
    buyDollarsSafetyTip1: 'Only trade with verified users with high reputation (minimum 95% completion rate)',
    buyDollarsSafetyTip2: 'Never complete a transaction outside the Binance P2P platform',
    buyDollarsSafetyTip3: 'Verify that bank details match exactly before transferring',
    buyDollarsSafetyTip4: 'Communicate only through Binance P2P official chat',
    buyDollarsSafetyTip5: 'If something seems suspicious, cancel the transaction and report the user',
    buyDollarsReadyToStart: 'Ready to get started?',
    buyDollarsReadyDesc: 'Join millions of users who trust Binance P2P to exchange currencies safely.',
    buyDollarsCreateAccount: 'Create Binance Account',
    buyDollarsGoToP2P: 'Go to Binance P2P',
    buyDollarsFAQ: 'Frequently Asked Questions',
    buyDollarsFAQ1Q: 'How long does a P2P transaction take?',
    buyDollarsFAQ1A: 'P2P transactions typically complete in 15-30 minutes, depending on the buyer\'s response speed and bank transfer confirmation.',
    buyDollarsFAQ2Q: 'Are there transaction limits?',
    buyDollarsFAQ2A: 'Yes, each buyer sets minimum and maximum limits. Typical limits range from 100 BOB to several thousand bolivianos. Check limits before starting a transaction.',
    buyDollarsFAQ3Q: 'Is it safe to use Binance P2P?',
    buyDollarsFAQ3A: 'Binance P2P is safe when you follow best practices: verify user reputation, never complete transactions outside the platform, and communicate only through official chat. Binance acts as intermediary and escrows funds until both parties confirm.',
    buyDollarsFAQ4Q: 'What happens if there\'s a problem with the transaction?',
    buyDollarsFAQ4A: 'If any issue arises, you can use Binance\'s dispute system. A moderator will review the case and resolve it based on provided evidence. Always keep screenshots of your bank transfers as proof.'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Default to Spanish
    const saved = localStorage.getItem('language');
    return saved || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Update HTML lang attribute for SEO and accessibility
    document.documentElement.lang = language;
    // Also update html tag if it exists
    const htmlTag = document.querySelector('html');
    if (htmlTag) {
      htmlTag.setAttribute('lang', language);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'es' ? 'en' : 'es';
      // Track language switch
      trackLanguageSwitched({ from_language: prev, to_language: newLang });
      return newLang;
    });
  };

  const t = (key) => {
    if (!key) return '';
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Ensure t is always defined
  const contextValue = {
    language,
    toggleLanguage,
    t: t || ((key) => key) // Fallback if t is somehow undefined
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback instead of throwing to prevent crashes
    console.warn('useLanguage called outside LanguageProvider, using fallback');
    return {
      language: 'es',
      toggleLanguage: () => {},
      t: (key) => key || '' // Safe fallback that returns the key itself
    };
  }
  // Ensure t is always a function
  if (!context.t || typeof context.t !== 'function') {
    console.warn('LanguageContext t() is not a function, using fallback');
    return {
      ...context,
      t: (key) => key || ''
    };
  }
  return context;
}

