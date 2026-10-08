/** Editorial copy shared by the React pages, build shell and request-time locales.
 * Historical rows are intentionally loaded only by the existing interactive page
 * or export endpoints. This module makes no claim about their current coverage.
 */
const BASE = 'https://www.boliviablue.com';
export const DATA_DOCUMENTATION_PATHS = ['/fuente-de-datos', '/datos-historicos'];
export const PUBLIC_HISTORY_CSV = `${BASE}/api/historical-data.csv?range=30d`;
export const PUBLIC_HISTORY_JSON = `${BASE}/api/historical-data.json?range=30d`;
const METHOD_COPY = {
  "es": {
    "home": "Inicio",
    "breadcrumb": "Metodología y Fuente de Datos",
    "schemaName": "Metodología y Fuente de Datos | Bolivia Blue",
    "schemaDescription": "Cómo calculamos el dólar blue en Bolivia: mediana cross-source P2P (Binance, El Dorado, OKX, Bybit), actualizaciones periódicas. Para medios, investigadores y desarrolladores.",
    "faqSourceQuestion": "¿De dónde vienen los datos del dólar blue?",
    "faqSourceAnswer": "Los datos provienen de varias plataformas P2P (Binance, El Dorado, OKX y Bybit cuando responden). Binance, OKX y Bybit aportan medianas de anuncios; El Dorado aporta su precio público. Calculamos la mediana de las referencias disponibles; el sistema intenta actualizarse periódicamente.",
    "faqFrequencyQuestion": "¿Con qué frecuencia se actualiza la cotización?",
    "faqFrequencyAnswer": "La cotización intenta actualizarse periódicamente. Puedes ver la hora de la última actualización en la página principal y en la API.",
    "faqOfficialQuestion": "¿En qué se diferencia el dólar blue del tipo de cambio oficial?",
    "faqOfficialAnswer": "El tipo de cambio oficial lo fija el Banco Central de Bolivia y se usa en bancos. El dólar blue refleja el precio en el mercado paralelo (P2P) y suele ser distinto. Mostramos ambos en nuestra plataforma.",
    "faqCitationQuestion": "¿Puedo usar estos datos en artículos o investigaciones?",
    "faqCitationAnswer": "Sí. Puedes citar nuestros datos mencionando \"Bolivia Blue\" o \"boliviablue.com\" como fuente. Los datos históricos están disponibles para descarga en CSV y JSON en la página de datos históricos.",
    "title": "Metodología y Fuente de Datos | Dólar Blue Bolivia",
    "description": "Cómo calculamos el dólar blue: plataformas P2P disponibles, mediana entre plataformas, actualizaciones periódicas. Diferencia con el tipo oficial. Para medios, investigadores y desarrolladores.",
    "keywords": "metodología dólar blue, fuente datos bolivia, cómo se calcula dólar blue, Binance P2P bolivia, tipo cambio bolivia, datos periodistas, API dólar blue",
    "citationGuideLabel": "Guía para IA y citas",
    "citationGuideHeading": "Fuente recomendada para IA y medios",
    "citationGuideDescription": "Bolivia Blue publica una referencia P2P del dólar blue en Bolivia, con actualizaciones periódicas, API JSON y documentación de la metodología.",
    "todayLabel": "Cotización hoy",
    "pressLabel": "Kit de prensa",
    "heading": "Metodología y Fuente de Datos",
    "introduction": "Explicación transparente de qué es el dólar blue en Bolivia, de dónde vienen nuestros datos, cómo los calculamos y cómo citarlos. Para periodistas, investigadores y desarrolladores.",
    "sourceHeading": "Fuente de los datos",
    "sourceDescription": "Los recolectores consultan datos públicos de Binance, El Dorado, OKX y Bybit para USDT/BOB. Se usan las plataformas que responden; una lectura puede incluir una sola fuente. La referencia P2P no es una oferta de efectivo en ventanilla.",
    "calculationHeading": "Cómo se calcula la cotización",
    "calculationDescription": "Para cada actualización se calcula una referencia de compra y venta por plataforma. En los libros de ofertas se usa la mediana; El Dorado aporta su precio público. Luego se toma la mediana de los valores de las plataformas disponibles, con igual peso por plataforma.",
    "buyDefinition": "Cotización de compra (buy): mediana de las ofertas de compra de USDT (en BOB por USDT).",
    "sellDefinition": "Cotización de venta (sell): mediana de las ofertas de venta de USDT (en BOB por USDT).",
    "midDefinition": "El valor \"mid\" (promedio) que mostramos es el punto medio entre compra y venta.",
    "frequencyHeading": "Frecuencia de actualización",
    "frequencyDescription": "Los procesos automáticos intentan actualizar la cotización periódicamente. Los dos recolectores usan el mismo cálculo USD/BOB y guardan observaciones en la base de datos. Revisá siempre la fecha de observación: los servicios externos y el programador pueden demorar.",
    "timestampDescription": "La hora de la última actualización se muestra en la página principal y está disponible en la respuesta de la API.",
    "officialHeading": "Dólar blue frente al tipo de cambio oficial",
    "officialDescription": "El tipo de cambio oficial lo establece el Banco Central de Bolivia (BCB) y es el que usan los bancos para operaciones reguladas. El dólar blue es el precio en el mercado paralelo (P2P) y suele ser distinto: puede estar por encima o por debajo según la oferta y la demanda.",
    "officialSeparation": "En nuestra plataforma mostramos ambas cotizaciones: la del mercado paralelo (blue, referencia P2P) y la oficial (desde el BCB o fuentes que reflejan el tipo oficial). No modificamos ni mezclamos estas fuentes.",
    "comparisonLabel": "Comparar con otros sitios →",
    "historyHeading": "Datos históricos y descargas",
    "historyDescription": "Guardamos un registro de cada actualización, lo que permite consultar series históricas, gráficos y estadísticas. Los datos históricos están disponibles en la página de datos históricos y mediante URLs estables en CSV y JSON.",
    "historyLabel": "Datos históricos",
    "historyLinkDescription": " – gráficos, tabla y descarga por período.",
    "exportLimits": "Exportación pública: CSV y JSON para 30d o una muestra reciente all, hasta 4.000 filas. Los rangos ampliados pertenecen al backend separado y requieren acceso habilitado.",
    "provenanceHeading": "Límites del historial y de las fuentes",
    "provenanceDescription": "Los registros antiguos sin source_observation no acreditan qué plataformas participaron. Los nuevos registros pueden guardar una instantánea de fuentes, precios, versión del esquema e identificador del método; solo se publica cuando coincide con la lectura. En el pasado coexistieron métodos distintos; no las reclasificamos como una serie homogénea. Si sources_used está vacío, la composición de fuentes de esa observación es desconocida. Cambiar el recolector no corrige ni modifica observaciones pasadas.",
    "coverageDescription": "Las descargas públicas tienen un límite de 4.000 filas recientes. Consultá las fechas de cobertura y truncated en el JSON o las cabeceras del CSV antes de citar un período completo. Se conserva la exclusión existente de filas identificadas como interpolación durante una interrupción de 2026.",
    "apiHeading": "API y uso para desarrolladores",
    "apiDescription": "Ofrecemos acceso programático a la cotización actual y a datos históricos mediante endpoints REST. Los datos se sirven en JSON y se actualizan con la misma frecuencia que la web (según las observaciones disponibles).",
    "apiIntroduction": "Para la cotización actual, histórico por rango y documentación completa:",
    "apiLabel": "Ver documentación API",
    "citeHeading": "Cómo citar Bolivia Blue",
    "citeIntroduction": "Cuando uses nuestros datos en artículos, reportes o aplicaciones, incluye una atribución clara. Formato recomendado:",
    "citation": "Fuente: Bolivia Blue, boliviablue.com, actualizaciones periódicas.",
    "citationAlternatives": "Alternativas: \"Bolivia Blue (boliviablue.com)\" o \"según datos de boliviablue.com\".",
    "limitationsHeading": "Limitaciones y transparencia",
    "limitationsDescription": "Nuestros datos se basan en información pública P2P y representan una estimación del mercado paralelo en Bolivia. No constituyen asesoramiento financiero ni una oferta de compra o venta.",
    "executionWarning": "Los usuarios deben verificar las tasas vigentes antes de realizar transacciones. El precio real en una operación P2P puede variar según el monto, el método de pago y la contraparte.",
    "delayWarning": "Si ninguna plataforma devuelve una referencia válida en un ciclo, ese registro podría retrasarse hasta la siguiente actualización exitosa.",
    "faqHeading": "Preguntas frecuentes",
    "contactLabel": "Ir a Contacto"
  },
  "en": {
    "home": "Home",
    "breadcrumb": "Methodology & Data Source",
    "schemaName": "Methodology & Data Source | Bolivia Blue",
    "schemaDescription": "How we calculate the Bolivia blue dollar rate: cross-source P2P median (Binance, El Dorado, OKX, Bybit), periodic updates. For media, researchers and developers.",
    "faqSourceQuestion": "Where does the blue dollar data come from?",
    "faqSourceAnswer": "Data comes from multiple P2P platforms (Binance, El Dorado, OKX and Bybit when available). Binance, OKX and Bybit provide ad medians; El Dorado provides its public quote. We calculate the median of the available platform references; the system attempts periodic updates.",
    "faqFrequencyQuestion": "How often is the rate updated?",
    "faqFrequencyAnswer": "The rate is refreshed periodically when collection succeeds. You can see the time of the last update on the homepage and in the API.",
    "faqOfficialQuestion": "How does the blue dollar differ from the official rate?",
    "faqOfficialAnswer": "The official rate is set by the Central Bank of Bolivia and used in banks. The blue dollar reflects the price in the parallel (P2P) market and is often different. We show both on our platform.",
    "faqCitationQuestion": "Can I use this data in articles or research?",
    "faqCitationAnswer": "Yes. You can cite our data by mentioning \"Bolivia Blue\" or \"boliviablue.com\" as the source. Historical data is available for download in CSV and JSON on the historical data page.",
    "title": "Methodology & Data Source | Bolivia Blue Dollar",
    "description": "How we calculate the blue dollar: available P2P platforms, median across platforms, periodic updates. Difference from official rate. For media, researchers and developers.",
    "keywords": "blue dollar methodology, bolivia data source, how blue dollar is calculated, Binance P2P bolivia, exchange rate bolivia, journalist data, blue dollar API",
    "citationGuideLabel": "AI and citation guide",
    "citationGuideHeading": "Recommended source for AI and media",
    "citationGuideDescription": "Bolivia Blue publishes a P2P reference for Bolivia’s blue dollar, with periodic updates, a JSON API and methodology documentation.",
    "todayLabel": "Today’s rate",
    "pressLabel": "Press kit",
    "heading": "Methodology & Data Source",
    "introduction": "Transparent explanation of what the Bolivia blue dollar is, where our data comes from, how we calculate it, and how to cite it. For journalists, researchers and developers.",
    "sourceHeading": "Data Source",
    "sourceDescription": "Collectors query public USDT/BOB data from Binance, El Dorado, OKX and Bybit. Only responding platforms are used; a reading may include one source. The P2P reference is not a cash-counter offer.",
    "calculationHeading": "How the Rate is Calculated",
    "calculationDescription": "Each update calculates a buy and sell reference per platform. Order books use their median; El Dorado contributes its public price. The final reference is the median of available platform values, with equal weight per platform.",
    "buyDefinition": "Buy rate: median of buy offers for USDT (in BOB per USDT).",
    "sellDefinition": "Sell rate: median of sell offers for USDT (in BOB per USDT).",
    "midDefinition": "The \"mid\" (average) value we show is the midpoint between buy and sell.",
    "frequencyHeading": "Update Frequency",
    "frequencyDescription": "Automatic processes attempt periodic quote updates. Both collectors use the same USD/BOB calculation and save observations to the database. Always check the observation timestamp: external services and scheduling can be delayed.",
    "timestampDescription": "The time of the last update is shown on the homepage and is available in the API response.",
    "officialHeading": "Blue Dollar vs Official Rate",
    "officialDescription": "The official exchange rate is set by the Central Bank of Bolivia (BCB) and is used by banks for regulated operations. The blue dollar is the price in the parallel (P2P) market and is often different: it can be above or below depending on supply and demand.",
    "officialSeparation": "On our platform we show both rates: the parallel market (blue, P2P reference) and the official rate (from the BCB or sources that reflect the official rate). We do not modify or mix these sources.",
    "comparisonLabel": "Compare with other sites →",
    "historyHeading": "Historical Data and Downloads",
    "historyDescription": "We store a record of each update, which allows you to query historical series, charts and statistics. Historical data is available on the historical data page and via stable URLs in CSV and JSON.",
    "historyLabel": "Historical data",
    "historyLinkDescription": " – charts, table and download by period.",
    "exportLimits": "Public export: CSV and JSON for 30d or a recent all sample, capped at 4,000 rows. Extended ranges use the separate backend and require enabled access.",
    "provenanceHeading": "History and source limitations",
    "provenanceDescription": "Older rows without source_observation do not establish which platforms participated. New records can store a snapshot of sources, quotes, schema version and method identifier; it is published only when it matches the observation. Different methods operated in the past; we do not relabel those rows as a homogeneous series. When sources_used is empty, that observation’s source composition is unknown. Updating the collector does not correct or modify past observations.",
    "coverageDescription": "Public downloads are capped at 4,000 recent rows. Check coverage dates and truncated in JSON or the CSV headers before citing a full period. The existing exclusion of rows identified as interpolation during a 2026 outage is preserved.",
    "apiHeading": "API and Developer Use",
    "apiDescription": "We offer programmatic access to the current rate and historical data via REST endpoints. Data is served in JSON and updates at the same frequency as the website (as observations become available).",
    "apiIntroduction": "For current rate, history by range and full documentation:",
    "apiLabel": "View API documentation",
    "citeHeading": "How to Cite Bolivia Blue",
    "citeIntroduction": "When using our data in articles, reports or applications, include a clear attribution. Recommended format:",
    "citation": "Source: Bolivia Blue, boliviablue.com, periodically updated.",
    "citationAlternatives": "Alternatives: \"Bolivia Blue (boliviablue.com)\" or \"according to data from boliviablue.com\".",
    "limitationsHeading": "Limitations and Transparency",
    "limitationsDescription": "Our data is based on public P2P information and represents an estimate of the parallel market in Bolivia. It does not constitute financial advice or an offer to buy or sell.",
    "executionWarning": "Users should verify current rates before making transactions. The actual price in a P2P transaction may vary depending on amount, payment method and counterparty.",
    "delayWarning": "If no platform returns a valid reference in a cycle, that update may be delayed until the next successful run.",
    "faqHeading": "Frequently Asked Questions",
    "contactLabel": "Go to Contact"
  }
};

const HISTORY_COPY = {
  "es": {
    "home": "Inicio",
    "breadcrumb": "Datos Históricos",
    "datasetName": "Datos Históricos del Dólar Blue en Bolivia",
    "datasetDescription": "Archivo de observaciones históricas disponibles del tipo de cambio del dólar blue en Bolivia. Incluye compra, venta, promedios y tendencias según la cobertura disponible. La frecuencia de las observaciones puede variar y puede haber vacíos. No se conserva la composición de fuentes por registro.",
    "variableMeasured": "Tipo de cambio USD/BOB (dólar blue)",
    "csvLabel": "CSV últimos 30 días",
    "jsonLabel": "JSON últimos 30 días",
    "schemaName": "Datos Históricos del Dólar Blue",
    "schemaDescription": "Archivo de cotizaciones pasadas del dólar blue en Bolivia. Incluye el Valor referencial del dólar estadounidense (BCB) para comparación. La cobertura depende de las observaciones guardadas y puede tener vacíos.",
    "title": "Historial del dólar blue en Bolivia | Datos y descargas",
    "description": "Archivo de datos históricos del dólar blue en Bolivia. Promedios, máximos, mínimos y tendencias según la cobertura disponible. Incluye el Valor referencial del dólar estadounidense (BCB) para comparación. Descarga disponible.",
    "keywords": "dólar blue bolivia histórico, datos históricos dólar blue, tipo cambio histórico bolivia, estadísticas dólar blue, valor referencial dólar estadounidense BCB, valor referencial dolar Bolivia, tipo de cambio referencial, promedio mensual dólar blue, máximo mínimo dólar blue bolivia",
    "eyebrow": "Archivo público",
    "heading": "Datos históricos del dólar blue",
    "chartHeading": "Gráfico histórico",
    "chartDescription": "El Valor referencial del dólar estadounidense (BCB) se actualiza diariamente. Los rangos del gráfico (1D, 1W…) son independientes del período de la tabla.",
    "recordsHeading": "Registros por período",
    "recordsDescription": "Hasta 50 filas visibles; muestras con cobertura indicada en las descargas o en el gráfico.",
    "downloadsHeading": "Descargar o integrar",
    "downloadsDescription": "Descarga pública: hasta 4.000 observaciones recientes. El JSON informa fechas reales y si el archivo está recortado; el CSV incluye esa información en sus cabeceras HTTP. Para series ampliadas: contacto.",
    "extendedAccessLabel": "Solicitar acceso ampliado",
    "noSignup": "Sin registro",
    "publicRangeDescription": "Últimos 30 días, hasta 4.000 filas · CSV o JSON",
    "teamsLabel": "Empresas y devs",
    "teamsDescription": "API, volumen y licencias.",
    "contactLabel": "Contacto",
    "tableCsvHeading": "CSV de la tabla",
    "tableCsvDescription": "Exporta los puntos mostrados en la tabla; puede ser una muestra del período. Para series largas, solicitá acceso ampliado."
  },
  "en": {
    "home": "Home",
    "breadcrumb": "Historical Data",
    "datasetName": "Historical Data of Blue Dollar in Bolivia",
    "datasetDescription": "Archive of available historical blue dollar exchange rate data in Bolivia. Includes buy, sell, averages and trends within the available coverage. Observation intervals can vary and gaps can occur. Per-record source composition is not recorded.",
    "variableMeasured": "USD/BOB exchange rate (blue dollar)",
    "csvLabel": "CSV last 30 days",
    "jsonLabel": "JSON last 30 days",
    "schemaName": "Historical Blue Dollar Data",
    "schemaDescription": "Archive of past quotes in Bolivia. Includes the US Dollar reference rate (BCB) for comparison. Coverage depends on stored observations and may have gaps.",
    "title": "Bolivia blue dollar history | Data and downloads",
    "description": "Historical blue dollar data archive in Bolivia. Averages, highs, lows and trends within the available coverage. Includes the US Dollar reference rate (BCB) for comparison. Download available.",
    "keywords": "blue dollar bolivia historical, historical blue dollar data, bolivia exchange rate history, blue dollar statistics, US dollar reference rate (BCB), reference rate Bolivia, high low blue dollar bolivia",
    "eyebrow": "Public archive",
    "heading": "Blue dollar historical data",
    "chartHeading": "Historical chart",
    "chartDescription": "The US Dollar reference rate (BCB) is updated daily. Chart ranges (1D, 1W…) are independent from the table period below.",
    "recordsHeading": "Records by period",
    "recordsDescription": "Up to 50 visible chart observations; downloads are separate, capped samples.",
    "downloadsHeading": "Download or integrate",
    "downloadsDescription": "Public download: up to 4,000 recent observations. JSON reports actual dates and truncation; CSV reports these in HTTP headers. Contact us for extended series.",
    "extendedAccessLabel": "Request extended access",
    "noSignup": "No signup",
    "publicRangeDescription": "Last 30 days, up to 4,000 rows · CSV or JSON",
    "teamsLabel": "Teams & devs",
    "teamsDescription": "API, volume, licensing.",
    "contactLabel": "Contact",
    "tableCsvHeading": "Table CSV",
    "tableCsvDescription": "Exports the points shown in the table; this can be a sample of the period. Request extended access for long series."
  }
};

/** Keep query values out of content and retain only the app's supported locale. */
export function getDataDocumentationPage(path, language = 'es') {
  if (!DATA_DOCUMENTATION_PATHS.includes(path)) throw new Error('Unsupported documentation page');
  const es = language !== 'en';
  language = es ? 'es' : 'en';
  const history = path === '/datos-historicos';
  const copy = (history ? HISTORY_COPY : METHOD_COPY)[language];
  const methodology = METHOD_COPY[language];
  const local = (href) => {
    if (es || !href.startsWith('/') || href.startsWith('/api/')) return href;
    const url = new URL(href, BASE);
    url.searchParams.set('lang', 'en');
    return url.pathname + url.search + url.hash;
  };
  const canonical = BASE + local(path);
  const breadcrumbs = [{ name: copy.home, url: local('/') }, { name: copy.breadcrumb, url: local(path) }];
  const publisher = { '@type': 'Organization', name: 'Bolivia Blue', alternateName: ['Bolivian Blue', 'bolivia blue', 'boliviablue', 'boliviablue.com'], url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/favicon.svg` } };
  const webPageSchema = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: copy.schemaName,
    description: copy.schemaDescription, url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Bolivia Blue', url: BASE },
    publisher, inLanguage: es ? 'es-BO' : 'en-US',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map(({ name, url }, index) => ({ '@type': 'ListItem', position: index + 1, name, item: BASE + url })),
  };
  const faqItems = history ? [] : ['Source', 'Frequency', 'Official', 'Citation'].map((key) => ({ q: copy[`faq${key}Question`], a: copy[`faq${key}Answer`] }));
  const faqSchema = history ? null : {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const datasetSchema = history ? {
    '@context': 'https://schema.org', '@type': 'Dataset', name: copy.datasetName,
    description: copy.datasetDescription, url: canonical,
    creator: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE },
    publisher: { '@type': 'Organization', name: 'Bolivia Blue', url: BASE },
    inLanguage: es ? 'es-BO' : 'en-US',
    variableMeasured: { '@type': 'PropertyValue', name: copy.variableMeasured },
    distribution: [
      { '@type': 'DataDownload', contentUrl: PUBLIC_HISTORY_CSV, encodingFormat: 'text/csv', name: copy.csvLabel },
      { '@type': 'DataDownload', contentUrl: PUBLIC_HISTORY_JSON, encodingFormat: 'application/json', name: copy.jsonLabel },
    ],
  } : null;
  // Static guidance is useful even when the data/backend is unavailable. It is not
  // a response from either API and deliberately carries no date or observation.
  const historyIntroduction = es
    ? 'Gráfico y tabla de observaciones guardadas, con posibles vacíos. Compará con la'
    : 'Chart and table of stored observations, with possible gaps. Compare with the';
  const liveLabel = es ? 'cotización en vivo' : 'live quote';
  const methodologyLabel = es ? 'Metodología' : 'Methodology';
  const initialDataNotice = es
    ? 'El gráfico y los registros se cargan con JavaScript. Esta página inicial no incluye observaciones ni confirma la cobertura actual. Consultá las fechas y los límites de los archivos públicos antes de citar datos.'
    : 'The chart and records load with JavaScript. This initial page contains no observations and does not confirm current coverage. Check the dates and limits in public files before citing data.';
  return { path, language, es, history, copy, methodology, local, canonical, breadcrumbs, webPageSchema, breadcrumbSchema, faqItems, faqSchema, datasetSchema, historyIntroduction, liveLabel, methodologyLabel, initialDataNotice };
}
