import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { fetchBlueHistory } from '../utils/api';

function DatosHistoricos() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const [selectedRange, setSelectedRange] = useState('1M');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchBlueHistory(selectedRange);
        setHistoryData(data);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [selectedRange]);

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Datos Históricos' : 'Historical Data', url: '/datos-historicos' }
  ];

  // Dataset schema for structured data
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": language === 'es' 
      ? "Datos Históricos del Dólar Blue en Bolivia"
      : "Historical Data of Blue Dollar in Bolivia",
    "description": language === 'es'
      ? "Archivo completo de datos históricos del tipo de cambio del dólar blue en Bolivia. Incluye promedios mensuales, máximos, mínimos y tendencias desde 2024."
      : "Complete archive of historical data on the blue dollar exchange rate in Bolivia. Includes monthly averages, highs, lows and trends since 2024.",
    "url": "https://boliviablue.com/datos-historicos",
    "keywords": language === 'es'
      ? "dólar blue bolivia histórico, datos históricos dólar blue, tipo cambio histórico bolivia, estadísticas dólar blue"
      : "blue dollar bolivia historical, historical blue dollar data, bolivia exchange rate history, blue dollar statistics",
    "creator": {
      "@type": "Organization",
      "name": "Bolivia Blue con Paz",
      "url": "https://boliviablue.com"
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "CSV",
      "contentUrl": "https://boliviablue.com/api/historical-data.csv"
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!historyData || !historyData.history || historyData.history.length === 0) {
      return null;
    }

    const rates = historyData.history.map(h => (h.buy + h.sell) / 2);
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const maxDate = historyData.history[rates.indexOf(max)]?.timestamp;
    const minDate = historyData.history[rates.indexOf(min)]?.timestamp;

    return { max, min, avg, maxDate, minDate, count: rates.length };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Datos Históricos del Dólar Blue Bolivia | Archivo Completo 2024-2025'
          : 'Historical Data of Blue Dollar Bolivia | Complete Archive 2024-2025'}
        description={language === 'es'
          ? 'Archivo completo de datos históricos del dólar blue en Bolivia. Promedios mensuales, máximos, mínimos, tendencias y análisis desde 2024. Datos disponibles para descarga.'
          : 'Complete archive of historical blue dollar data in Bolivia. Monthly averages, highs, lows, trends and analysis since 2024. Data available for download.'}
        keywords={language === 'es'
          ? 'dólar blue bolivia histórico, datos históricos dólar blue, tipo cambio histórico bolivia, estadísticas dólar blue, promedio mensual dólar blue, máximo mínimo dólar blue bolivia'
          : 'blue dollar bolivia historical, historical blue dollar data, bolivia exchange rate history, blue dollar statistics, monthly average blue dollar, high low blue dollar bolivia'}
        canonical="/datos-historicos"
        structuredData={[datasetSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '📊 Datos Históricos del Dólar Blue'
              : '📊 Historical Blue Dollar Data'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {language === 'es'
              ? 'Archivo completo de datos históricos del tipo de cambio del dólar blue en Bolivia. Analiza tendencias, promedios mensuales y estadísticas desde 2024.'
              : 'Complete archive of historical data on the blue dollar exchange rate in Bolivia. Analyze trends, monthly averages and statistics since 2024.'}
          </p>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Promedio' : 'Average'}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.avg.toFixed(2)} BOB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {language === 'es' ? `${stats.count} puntos de datos` : `${stats.count} data points`}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Máximo' : 'Maximum'}
              </h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.max.toFixed(2)} BOB
              </p>
              {stats.maxDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(stats.maxDate).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US')}
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {language === 'es' ? 'Mínimo' : 'Minimum'}
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.min.toFixed(2)} BOB
              </p>
              {stats.minDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(stats.minDate).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? 'Seleccionar Período' : 'Select Period'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: '1D', label: language === 'es' ? 'Últimas 24 horas' : 'Last 24 hours' },
              { value: '1W', label: language === 'es' ? 'Última semana' : 'Last week' },
              { value: '1M', label: language === 'es' ? 'Último mes' : 'Last month' },
              { value: '3M', label: language === 'es' ? 'Últimos 3 meses' : 'Last 3 months' },
              { value: '1Y', label: language === 'es' ? 'Último año' : 'Last year' },
              { value: 'ALL', label: language === 'es' ? 'Todo' : 'All time' }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es' ? 'Cargando datos históricos...' : 'Loading historical data...'}
            </p>
          </div>
        ) : historyData && historyData.history && historyData.history.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'es' ? 'Datos Detallados' : 'Detailed Data'}
            </h2>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Fecha' : 'Date'}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Compra' : 'Buy'}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Venta' : 'Sell'}
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Promedio' : 'Average'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyData.history.slice(0, 50).map((entry, index) => {
                  const avg = (entry.buy + entry.sell) / 2;
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(entry.timestamp).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {entry.buy.toFixed(2)} BOB
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {entry.sell.toFixed(2)} BOB
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                        {avg.toFixed(2)} BOB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {historyData.history.length > 50 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                {language === 'es' 
                  ? `Mostrando 50 de ${historyData.history.length} registros. Usa el gráfico histórico para ver todos los datos.`
                  : `Showing 50 of ${historyData.history.length} records. Use the historical chart to view all data.`}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'es' 
                ? 'No hay datos históricos disponibles para este período.'
                : 'No historical data available for this period.'}
            </p>
          </div>
        )}

        {/* How to Read Historical Data Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Cómo Leer e Interpretar los Datos Históricos' : 'How to Read and Interpret Historical Data'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {language === 'es'
              ? <>Los datos históricos del dólar blue en Bolivia proporcionan información valiosa sobre las tendencias del mercado cambiario. Al analizar estos datos, puedes identificar patrones, predecir tendencias futuras y tomar decisiones financieras más informadas. Cada punto de datos representa una instantánea del mercado en un momento específico, capturando las fluctuaciones naturales del <strong>bolivian blue rate</strong> a lo largo del tiempo.</>
              : <>Historical data on the blue dollar in Bolivia provides valuable information about exchange market trends. By analyzing this data, you can identify patterns, predict future trends, and make more informed financial decisions. Each data point represents a snapshot of the market at a specific moment, capturing the natural fluctuations of the <strong>bolivian blue rate</strong> over time.</>}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '📈 Identificar Tendencias' : '📈 Identifying Trends'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Observa si el dólar blue está en una tendencia alcista (subiendo), bajista (bajando), o lateral (estable). Las tendencias pueden durar días, semanas o meses, y entenderlas te ayuda a decidir cuándo realizar transacciones.'
                  : 'Observe if the blue dollar is in an upward trend (rising), downward trend (falling), or sideways trend (stable). Trends can last days, weeks, or months, and understanding them helps you decide when to make transactions.'}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '📊 Analizar Volatilidad' : '📊 Analyzing Volatility'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'La diferencia entre el máximo y mínimo en un período muestra la volatilidad del mercado. Períodos de alta volatilidad pueden indicar incertidumbre económica, mientras que períodos estables sugieren confianza en el mercado.'
                  : 'The difference between the maximum and minimum in a period shows market volatility. Periods of high volatility may indicate economic uncertainty, while stable periods suggest market confidence.'}
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '🎯 Encontrar Patrones' : '🎯 Finding Patterns'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Algunos patrones pueden repetirse, como aumentos durante ciertos meses del año o correlaciones con eventos económicos específicos. Identificar estos patrones puede ayudarte a anticipar movimientos futuros.'
                  : 'Some patterns may repeat, such as increases during certain months of the year or correlations with specific economic events. Identifying these patterns can help you anticipate future movements.'}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'es' ? '💡 Usar Promedios' : '💡 Using Averages'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'El promedio mensual o anual te da una visión general del comportamiento del dólar blue. Compara el promedio actual con promedios históricos para entender si el mercado está por encima o por debajo de lo normal.'
                  : 'The monthly or annual average gives you an overview of blue dollar behavior. Compare the current average with historical averages to understand if the market is above or below normal.'}
              </p>
            </div>
          </div>
        </section>

        {/* What Historical Data Tells Us Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Qué Nos Dicen los Datos Históricos sobre el Mercado' : 'What Historical Data Tells Us About the Market'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {language === 'es'
              ? <>Los datos históricos del <strong>Bolivian Blue</strong> revelan información importante sobre la salud del mercado cambiario boliviano. Cuando analizas estos datos a lo largo del tiempo, puedes identificar:</>
              : <>Historical data on the <strong>Bolivian Blue</strong> reveals important information about the health of the Bolivian exchange market. When you analyze this data over time, you can identify:</>}
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-indigo-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '1. Estabilidad del Mercado' : '1. Market Stability'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Períodos de estabilidad relativa indican confianza en la economía y políticas gubernamentales. Por el contrario, períodos de alta volatilidad pueden señalar incertidumbre o cambios en las políticas económicas.'
                  : 'Periods of relative stability indicate confidence in the economy and government policies. Conversely, periods of high volatility may signal uncertainty or changes in economic policies.'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '2. Impacto de Eventos Económicos' : '2. Impact of Economic Events'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Los datos históricos muestran cómo eventos como cambios en políticas monetarias, anuncios gubernamentales, o crisis económicas internacionales afectan el <strong>bolivian blue rate</strong>. Esto te ayuda a entender la sensibilidad del mercado a diferentes factores.'
                  : 'Historical data shows how events such as changes in monetary policies, government announcements, or international economic crises affect the <strong>bolivian blue rate</strong>. This helps you understand the market\'s sensitivity to different factors.'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '3. Estacionalidad' : '3. Seasonality'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {language === 'es'
                  ? 'Algunos períodos del año pueden mostrar patrones consistentes. Por ejemplo, ciertos meses pueden tener mayor demanda de dólares debido a importaciones estacionales o remesas. Identificar estos patrones puede ayudarte a planificar mejor tus transacciones.'
                  : 'Some periods of the year may show consistent patterns. For example, certain months may have higher dollar demand due to seasonal imports or remittances. Identifying these patterns can help you better plan your transactions.'}
              </p>
            </div>
          </div>
        </section>

        {/* Using Data for Decisions Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Cómo Usar los Datos Históricos para Tomar Decisiones' : 'How to Use Historical Data to Make Decisions'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {language === 'es'
              ? <>Los datos históricos del <strong>Bolivian Blue</strong> son más que números; son herramientas para tomar decisiones financieras inteligentes. Aquí te explicamos cómo puedes utilizarlos:</>
              : <>Historical data on the <strong>Bolivian Blue</strong> is more than numbers; they are tools for making smart financial decisions. Here's how you can use them:</>}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Para Importadores' : '✅ For Importers'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? 'Analiza las tendencias para planificar tus compras internacionales. Si el dólar está en tendencia alcista, considera adelantar tus compras. Si está bajando, podrías esperar un mejor momento.'
                    : 'Analyze trends to plan your international purchases. If the dollar is in an upward trend, consider advancing your purchases. If it\'s falling, you might wait for a better time.'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Para Quienes Reciben Remesas' : '✅ For Those Receiving Remittances'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? 'Observa los promedios mensuales para entender cuándo es mejor recibir tus remesas. Si el promedio del mes está por encima del histórico, podría ser un buen momento para cambiar.'
                    : 'Observe monthly averages to understand when it\'s best to receive your remittances. If the month\'s average is above the historical average, it might be a good time to exchange.'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Para Inversores' : '✅ For Investors'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? 'La volatilidad histórica te ayuda a entender el riesgo. Períodos de alta volatilidad pueden ofrecer oportunidades, pero también mayor riesgo. Usa los datos para evaluar si el riesgo es aceptable para tu estrategia.'
                    : 'Historical volatility helps you understand risk. Periods of high volatility may offer opportunities, but also greater risk. Use the data to evaluate if the risk is acceptable for your strategy.'}
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'es' ? '✅ Para Planificación Financiera' : '✅ For Financial Planning'}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'es'
                    ? 'Los promedios históricos te ayudan a crear presupuestos más realistas. Si planeas una compra grande en dólares, usa el promedio histórico como referencia, pero siempre considera un margen para la volatilidad.'
                    : 'Historical averages help you create more realistic budgets. If you plan a large purchase in dollars, use the historical average as a reference, but always consider a margin for volatility.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '📥 Descargar Datos' : '📥 Download Data'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {language === 'es'
              ? 'Los datos históricos están disponibles para descarga en formato CSV para análisis y uso en investigaciones, reportes y aplicaciones.'
              : 'Historical data is available for download in CSV format for analysis and use in research, reports and applications.'}
          </p>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Formato CSV' : 'CSV Format'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {language === 'es'
                  ? 'Datos en formato CSV con columnas: Fecha, Compra, Venta, Promedio'
                  : 'Data in CSV format with columns: Date, Buy, Sell, Average'}
              </p>
              <button
                onClick={() => {
                  if (historyData && historyData.history) {
                    const csv = [
                      ['Fecha', 'Compra', 'Venta', 'Promedio'],
                      ...historyData.history.map(e => [
                        new Date(e.timestamp).toISOString(),
                        e.buy.toFixed(2),
                        e.sell.toFixed(2),
                        ((e.buy + e.sell) / 2).toFixed(2)
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dolar-blue-bolivia-${selectedRange}-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                disabled={!historyData || !historyData.history}
              >
                {language === 'es' ? 'Descargar CSV' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '📋 Guía de Uso' : '📋 Usage Guidelines'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Para Investigadores y Analistas' : 'For Researchers and Analysts'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Los datos históricos están disponibles bajo licencia Creative Commons. Puedes usar estos datos para análisis, investigaciones y reportes. Por favor, incluye una atribución a boliviablue.com cuando uses estos datos.'
                  : 'Historical data is available under Creative Commons license. You can use this data for analysis, research and reports. Please include attribution to boliviablue.com when using this data.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Para Desarrolladores' : 'For Developers'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Si necesitas acceso programático a estos datos, consulta nuestra documentación de API o contáctanos para discutir opciones de integración.'
                  : 'If you need programmatic access to this data, check our API documentation or contact us to discuss integration options.'}
              </p>
              <Link
                to="/api-docs"
                className="inline-block mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {language === 'es' ? 'Ver Documentación API →' : 'View API Documentation →'}
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? 'Para Medios de Comunicación' : 'For Media'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Los datos están disponibles para uso en artículos y reportes. Por favor, menciona "boliviablue.com" como fuente cuando cites nuestros datos.'
                  : 'Data is available for use in articles and reports. Please mention "boliviablue.com" as the source when citing our data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🔗 Páginas Relacionadas' : '🔗 Related Pages'}
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/bolivian-blue"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📈 Gráficos Históricos' : '📈 Historical Charts'}
            </Link>
            <Link
              to="/fuente-de-datos"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📊 Fuente de Datos' : '📊 Data Source'}
            </Link>
            <Link
              to="/acerca-de"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? 'ℹ️ Metodología' : 'ℹ️ Methodology'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DatosHistoricos;

