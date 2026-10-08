import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { getDataDocumentationPage } from '../data/dataDocumentation';
import { DATA_INQUIRY_PATH, getDataInquiry } from '../data/dataInquiry';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import LazyErrorBoundary from '../components/LazyErrorBoundary';
import BinanceBanner from '../components/BinanceBanner';

const BlueChart = lazy(() => import('../components/BlueChart'));
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { Link } from 'react-router-dom';
import { fetchBlueHistory } from '../utils/api';
import { historicalTableData, checkExtendedExportService } from '../utils/historicalTable';
import { BASE_URL } from '../utils/seoSchema';
import { getApiEndpoint } from '../utils/apiUrl';
import {
  trackChartRangeChanged,
  trackHistoricalDownloadCsv,
  trackHistoricalDownloadJson,
  trackRelatedLinkClicked,
  trackFreeDownloadClicked,
  trackExtendedDownloadStarted,
  trackExtendedDownloadUnlocked,
  trackExportLeadSubmitted,
  trackCommercialAccessClicked,
} from '../utils/analyticsEvents';

const EXPORT_TOKEN_STORAGE_KEY = 'bb_data_export_token_v1';
/** Server export ranges that require a signed token */
const HAS_EXTENDED_EXPORT_BACKEND = Boolean(import.meta.env.VITE_API_URL);
const EXTENDED_API_RANGES = new Set(['90d', '1y', 'all']);
/** Page chart/table ranges that need unlock for client CSV snapshot */
const EXTENDED_PAGE_RANGES = new Set(['3M', '1Y', 'ALL']);

function DatosHistoricos() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const page = getDataDocumentationPage('/datos-historicos', language);
  const { copy } = page;
  const inquiry = getDataInquiry(language);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const rangeAnalyticsRef = useRef('1M');
  const [exportToken, setExportToken] = useState('');
  const [exportEmail, setExportEmail] = useState('');
  const [exportConsent, setExportConsent] = useState(false);
  const [exportSubmitting, setExportSubmitting] = useState(false);
  const [exportFormMessage, setExportFormMessage] = useState(null);
  const [exportFormError, setExportFormError] = useState(null);
  const [showOfficial, setShowOfficial] = useState(false);
  const [extendedExportAvailable, setExtendedExportAvailable] = useState(false);
  const [exportServiceCheck, setExportServiceCheck] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    let cancelled = false;
    checkExtendedExportService(import.meta.env.VITE_API_URL, { signal: controller.signal }).then((available) => {
      if (!cancelled) setExtendedExportAvailable(available);
    });
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, [exportServiceCheck]);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(EXPORT_TOKEN_STORAGE_KEY);
      if (t) setExportToken(t);
    } catch {
      /* ignore */
    }
  }, []);

  const selectHistoricalRange = (value) => {
    const prev = rangeAnalyticsRef.current;
    if (prev !== value) {
      trackChartRangeChanged({
        language,
        range_previous: prev,
        range_selected: value,
        chart_context: 'historical_page',
      });
      rangeAnalyticsRef.current = value;
    }
    setSelectedRange(value);
  };

  const buildServerExportHref = (format, rangeParam) => {
    const base = EXTENDED_API_RANGES.has(rangeParam) && HAS_EXTENDED_EXPORT_BACKEND
      ? getApiEndpoint(`/api/historical-data.${format}`) : `${BASE_URL}/api/historical-data.${format}`;
    const path = `${base}?range=${encodeURIComponent(rangeParam)}`;
    if (EXTENDED_API_RANGES.has(rangeParam) && exportToken) {
      return `${path}&token=${encodeURIComponent(exportToken)}`;
    }
    return path;
  };

  const onServerHistoricalDownload = (format, rangeParam) => {
    const source =
      EXTENDED_API_RANGES.has(rangeParam) && exportToken ? 'server_api_extended' : 'server_api';
    if (rangeParam === '30d') {
      trackFreeDownloadClicked({ language, format, range: rangeParam });
    }
    if (format === 'csv') {
      trackHistoricalDownloadCsv({ language, range: rangeParam, source });
    } else {
      trackHistoricalDownloadJson({ language, range: rangeParam, source });
    }
  };

  const handleExportLeadSubmit = async (e) => {
    e.preventDefault();
    setExportFormError(null);
    setExportFormMessage(null);
    if (!exportEmail || !exportEmail.includes('@')) {
      setExportFormError(
        language === 'es' ? 'Ingresa un email válido.' : 'Please enter a valid email.'
      );
      return;
    }
    if (!exportConsent) {
      setExportFormError(
        language === 'es'
          ? 'Debes aceptar recibir información ocasional y las condiciones de uso de la descarga.'
          : 'Please accept occasional updates and the download terms.'
      );
      return;
    }
    trackExtendedDownloadStarted({ language });
    setExportSubmitting(true);
    try {
      const res = await fetch(getApiEndpoint('/api/data-export/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          email: exportEmail.trim(),
          language,
          consent: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExportFormError(data.message || (language === 'es' ? 'Error al registrar.' : 'Registration failed.'));
        return;
      }
      if (data.token) {
        try {
          sessionStorage.setItem(EXPORT_TOKEN_STORAGE_KEY, data.token);
        } catch {
          /* ignore */
        }
        setExportToken(data.token);
        trackExportLeadSubmitted({ language, source: 'historical_extended_download' });
        trackExtendedDownloadUnlocked({ language });
        setExportFormMessage(data.message || '');
        setExportEmail('');
        setExportConsent(false);
      }
    } catch {
      setExportFormError(
        language === 'es'
          ? 'No se pudo conectar. Intenta de nuevo.'
          : 'Could not connect. Please try again.'
      );
    } finally {
      setExportSubmitting(false);
    }
  };

  const clientCsvNeedsUnlock = EXTENDED_PAGE_RANGES.has(selectedRange) && !exportToken;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHistoryData(null);
    fetchBlueHistory(selectedRange)
      .then((data) => { if (!cancelled) setHistoryData(historicalTableData(data)); })
      .catch((error) => { if (!cancelled) console.error('Error loading history:', error); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedRange]);

  const { breadcrumbs, datasetSchema, webPageSchema, breadcrumbSchema } = page;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: language === 'es' ? '¿Cómo descargo datos históricos del dólar blue?' : 'How do I download historical blue dollar data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            language === 'es'
              ? `Podés bajar una muestra CSV o JSON de hasta 4.000 observaciones recientes sin registro. ${extendedExportAvailable ? 'El formulario de email habilita rangos ampliados con un máximo de 50.000 filas; consultá la cobertura real del archivo.' : 'La descarga ampliada automática no está disponible aquí; consultá disponibilidad y condiciones, sujetas a revisión manual.'}`
              : `You can download a CSV or JSON sample of up to 4,000 recent observations without signing up. ${extendedExportAvailable ? 'The email form unlocks extended ranges capped at 50,000 rows; check the file’s actual coverage.' : 'Extended automatic downloads are unavailable here; ask about availability and terms, subject to manual review.'}`,
        },
      },
      {
        '@type': 'Question',
        name: language === 'es' ? '¿Hay API para empresas o desarrolladores?' : 'Is there an API for businesses or developers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            language === 'es'
              ? 'La API pública está documentada en /api-docs. En /contacto#data-request podés consultar otros períodos, integraciones y condiciones; la disponibilidad requiere revisión manual.'
              : 'The public API is documented at /api-docs. At /contacto#data-request you can ask about other periods, integrations and terms; availability requires manual review.',
        },
      },
      {
        '@type': 'Question',
        name:
          language === 'es'
            ? '¿Qué es el valor referencial del dólar estadounidense (BCB)?'
            : 'What is the US Dollar reference rate (BCB)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            language === 'es'
              ? 'El Banco Central de Bolivia (BCB) publica diariamente el valor referencial del dólar estadounidense (Compra/Venta) como referencia del sistema formal. En esta página lo mostramos junto al dólar blue para comparación.'
              : 'The Central Bank of Bolivia (BCB) publishes daily the US Dollar reference rate (buy/sell) as a benchmark for the formal system. On this page we display it alongside the blue dollar for comparison.',
        },
      },
    ],
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
        title={copy.title}
        description={copy.description}
        keywords={copy.keywords}
        canonical="/datos-historicos"
        structuredData={[webPageSchema, breadcrumbSchema, datasetSchema, faqSchema]}
      />

      <Header />
      <Navigation />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10 md:py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero + period stats — single surface */}
        <header className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/90">
          <div className="border-b border-gray-100 px-5 py-8 dark:border-gray-700 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {copy.heading}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
              {page.historyIntroduction}{' '}
              <Link to="/" onClick={() => trackRelatedLinkClicked({ language, destination: '/', link_label: 'hero_live_rate', page_type: 'historical' })} className="font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400">
                {page.liveLabel}
              </Link>.{' '}
              <Link to="/fuente-de-datos" onClick={() => trackRelatedLinkClicked({ language, destination: '/fuente-de-datos', link_label: 'hero_methodology', page_type: 'historical' })} className="font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400">
                {page.methodologyLabel}
              </Link>.
            </p>
          </div>
          {stats && (
            <div className="grid divide-y divide-gray-100 bg-slate-50/80 dark:divide-gray-700 dark:bg-gray-900/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {language === 'es' ? 'Promedio' : 'Average'}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white sm:text-[1.65rem]">
                  {stats.avg.toFixed(2)}{' '}
                  <span className="text-base font-semibold text-gray-500 dark:text-gray-400">BOB</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {language === 'es' ? `${stats.count} puntos en el período` : `${stats.count} points in range`}
                </p>
              </div>
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {language === 'es' ? 'Máximo' : 'High'}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400 sm:text-[1.65rem]">
                  {stats.max.toFixed(2)} <span className="text-base font-semibold opacity-80">BOB</span>
                </p>
                {stats.maxDate && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(stats.maxDate).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US')}
                  </p>
                )}
              </div>
              <div className="px-5 py-4 sm:px-6 sm:py-5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {language === 'es' ? 'Mínimo' : 'Low'}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-[1.65rem]">
                  {stats.min.toFixed(2)} <span className="text-base font-semibold opacity-80">BOB</span>
                </p>
                {stats.minDate && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(stats.minDate).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US')}
                  </p>
                )}
              </div>
            </div>
          )}
        </header>

        <section id="cobertura" className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{page.methodology.provenanceHeading}</h2>
          <p className="text-gray-700 dark:text-gray-300">{copy.datasetDescription}</p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{page.methodology.provenanceDescription}</p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{page.methodology.coverageDescription}</p>
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/90 sm:p-6"
          aria-labelledby="historical-chart-heading"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="historical-chart-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
              {copy.chartHeading}
            </h2>
            <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
              <input
                type="checkbox"
                checked={showOfficial}
                onChange={(e) => setShowOfficial(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {language === 'es' ? 'Incluir valor referencial (BCB)' : 'Include US Dollar reference (BCB)'}
            </label>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30 dark:border-gray-600 dark:bg-gray-900/30">
            <LazyErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex min-h-[280px] items-center justify-center bg-white dark:bg-gray-800">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'es' ? 'Cargando gráfico…' : 'Loading chart…'}
                      </p>
                    </div>
                  </div>
                }
              >
                <BlueChart showOfficial={showOfficial} />
              </Suspense>
            </LazyErrorBoundary>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {copy.chartDescription}
          </p>
        </section>

        <BinanceBanner />

        {/* Table + period — one card, segmented control */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/90">
          <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-700 sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {copy.recordsHeading}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {copy.recordsDescription}
                </p>
              </div>
              <div
                className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-900/90 dark:ring-1 dark:ring-gray-600"
                role="group"
                aria-label={language === 'es' ? 'Período de la tabla' : 'Table period'}
              >
                {[
                  { value: '1D', label: language === 'es' ? '24 h' : '24h' },
                  { value: '1W', label: language === 'es' ? '7 d' : '7d' },
                  { value: '1M', label: language === 'es' ? '1 mes' : '1M' },
                  { value: '3M', label: language === 'es' ? '3 meses' : '3M' },
                  { value: '1Y', label: language === 'es' ? '1 año' : '1Y' },
                  { value: 'ALL', label: language === 'es' ? 'Todo' : 'All' },
                ].map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => selectHistoricalRange(range.value)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                      selectedRange === range.value
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="px-5 py-16 text-center sm:px-6">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Cargando datos…' : 'Loading data…'}
              </p>
            </div>
          ) : historyData && historyData.history && historyData.history.length > 0 ? (
            <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-gray-700 dark:bg-gray-900/50">
                    <th className="sticky left-0 z-10 bg-gray-50/95 py-3 pl-5 pr-3 text-left font-semibold text-gray-900 backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
                      {language === 'es' ? 'Fecha' : 'Date'}
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white">
                      {language === 'es' ? 'Compra' : 'Buy'}
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white">
                      {language === 'es' ? 'Venta' : 'Sell'}
                    </th>
                    <th className="py-3 pr-5 pl-3 text-right font-semibold text-gray-900 dark:text-white">
                      {language === 'es' ? 'Prom.' : 'Avg'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                  {historyData.history.slice(0, 50).map((entry, index) => {
                    const avg = (entry.buy + entry.sell) / 2;
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors even:bg-gray-50/40 dark:even:bg-gray-800/30"
                      >
                        <td className="sticky left-0 z-[1] whitespace-nowrap bg-white/95 py-2.5 pl-5 pr-3 text-gray-700 backdrop-blur-sm dark:bg-gray-800/95 dark:text-gray-300">
                          {new Date(entry.timestamp).toLocaleDateString(language === 'es' ? 'es-BO' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                          {entry.buy.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                          {entry.sell.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-5 pl-3 text-right tabular-nums font-medium text-gray-900 dark:text-white">
                          {avg.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {historyData.history.length > 50 && (
              <p className="border-t border-gray-100 px-5 py-3 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {language === 'es'
                  ? `Mostrando 50 de ${historyData.history.length} registros en este período.`
                  : `Showing 50 of ${historyData.history.length} rows in this period.`}
              </p>
            )}
            </>
        ) : (
          <div className="border-t border-gray-100 px-5 py-14 text-center dark:border-gray-700 sm:px-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'es' 
                ? 'No hay datos para este período.'
                : 'No data for this period.'}
            </p>
          </div>
        )}
        </div>

        {/* Downloads & monetization — immediately after data */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-blue-200/70 bg-white shadow-md dark:border-blue-900/50 dark:bg-gray-800/90 sm:shadow-lg">
          <div className="border-b border-blue-100/80 bg-gradient-to-r from-blue-50/90 to-white px-5 py-6 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-gray-900/80 sm:px-8">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {copy.downloadsHeading}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              {copy.downloadsDescription}
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            {extendedExportAvailable ? <div className="rounded-xl border-2 border-indigo-300/80 bg-indigo-50/60 p-5 dark:border-indigo-700 dark:bg-indigo-950/30 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {language === 'es' ? 'Más valor — mismo precio (gratis)' : 'More value — still free'}
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {language === 'es' ? 'Rangos ampliados: hasta 50.000 filas' : 'Extended ranges: up to 50,000 rows'}
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {language === 'es'
                ? 'Dejá tu email y desbloqueamos CSV/JSON en este navegador. Te avisamos de tasas y novedades; podés darte de baja en un clic.'
                : 'Enter your email and we unlock CSV/JSON in this browser. We’ll send rates and updates; one-click unsubscribe.'}
            </p>
            {!exportToken ? (
              <form onSubmit={handleExportLeadSubmit} className="space-y-3 max-w-md">
                <input
                  type="email"
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  placeholder={language === 'es' ? 'tu@email.com' : 'you@email.com'}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoComplete="email"
                />
                <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConsent}
                    onChange={(e) => setExportConsent(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <span>
                    {language === 'es'
                      ? 'Acepto recibir correos ocasionales de Bolivia Blue (tasas, novedades) y usar estos datos con atribución a boliviablue.com. No revendo datos personales.'
                      : 'I agree to receive occasional Bolivia Blue emails (rates, updates) and to use this data with attribution to boliviablue.com. We do not sell personal data.'}
                  </span>
                </label>
                {exportFormError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{exportFormError}</p>
                )}
                <button
                  type="submit"
                  disabled={exportSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {exportSubmitting
                    ? language === 'es'
                      ? 'Enviando…'
                      : 'Sending…'
                    : language === 'es'
                      ? 'Desbloquear descargas ampliadas'
                      : 'Unlock extended downloads'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                {exportFormMessage ||
                  (language === 'es'
                    ? 'Descargas ampliadas activas en este navegador.'
                    : 'Extended downloads are active in this browser.')}
              </p>
            )}
            {exportToken && (
              <div className="flex flex-wrap gap-3 items-center mt-4">
                {['90d', '1y', 'all'].map((r) => (
                  <span key={r} className="flex flex-wrap gap-2 items-center">
                    <a
                      href={buildServerExportHref('csv', r)}
                      onClick={() => onServerHistoricalDownload('csv', r)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      download
                    >
                      CSV ({r})
                    </a>
                    <a
                      href={buildServerExportHref('json', r)}
                      onClick={() => onServerHistoricalDownload('json', r)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      download
                    >
                      JSON ({r})
                    </a>
                  </span>
                ))}
              </div>
            )}
            </div> : (
              <p className="rounded-xl bg-blue-50 p-4 text-sm text-gray-700 dark:bg-blue-950/30 dark:text-gray-300">
                {language === 'es'
                  ? 'La descarga automática ampliada no está disponible aquí. Los archivos públicos son muestras limitadas, no el historial completo. '
                  : 'Extended automatic downloads are unavailable here. Public files are bounded samples, not the full archive. '}
                <Link to={inquiry.href} onClick={() => trackCommercialAccessClicked({ language, destination: DATA_INQUIRY_PATH, link_label: 'datos_historicos_unavailable_inquiry' })} className="text-blue-600 underline">{copy.extendedAccessLabel}</Link>
                {' '}{inquiry.limitation}
                {HAS_EXTENDED_EXPORT_BACKEND && <button type="button" onClick={() => setExportServiceCheck((value) => value + 1)} className="ml-3 text-blue-600 underline">{language === 'es' ? 'Reintentar conexión' : 'Retry connection'}</button>}
              </p>
            )}

            <div className="grid gap-5 border-t border-gray-200/80 pt-6 dark:border-gray-700 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4 dark:border-gray-600 dark:bg-gray-900/40">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {copy.noSignup}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {copy.publicRangeDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={buildServerExportHref('csv', '30d')}
                    onClick={() => onServerHistoricalDownload('csv', '30d')}
                    className="inline-flex rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-gray-800 dark:text-blue-300"
                    download
                  >
                    CSV
                  </a>
                  <a
                    href={buildServerExportHref('json', '30d')}
                    onClick={() => onServerHistoricalDownload('json', '30d')}
                    className="inline-flex rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
                    download
                  >
                    JSON
                  </a>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4 dark:border-gray-600 dark:bg-gray-900/40">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {copy.teamsLabel}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {copy.teamsDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={page.local('/api-docs')}
                    onClick={() =>
                      trackCommercialAccessClicked({
                        language,
                        destination: '/api-docs',
                        link_label: 'datos_historicos_api_grid',
                      })
                    }
                    className="inline-flex rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-gray-900"
                  >
                    API
                  </Link>
                  <Link
                    to={inquiry.href}
                    onClick={() =>
                      trackCommercialAccessClicked({
                        language,
                        destination: DATA_INQUIRY_PATH,
                        link_label: 'datos_historicos_contact_grid',
                      })
                    }
                    className="inline-flex rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:border-gray-300 dark:text-white"
                  >
                    {copy.contactLabel}
                  </Link>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-600 dark:bg-gray-800/60 md:col-span-2 lg:col-span-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {copy.tableCsvHeading}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {copy.tableCsvDescription}
                </p>
                {clientCsvNeedsUnlock && (
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    {language === 'es' ? 'Período largo: consultá disponibilidad y condiciones.' : 'Long range: ask about availability and terms.'}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (historyData && historyData.history && !clientCsvNeedsUnlock) {
                      trackHistoricalDownloadCsv({
                        language,
                        range: selectedRange,
                        source: 'client_generated',
                      });
                      const csv = [
                        ['Fecha', 'Compra', 'Venta', 'Promedio'],
                        ...historyData.history.map((e) => [
                          new Date(e.timestamp).toISOString(),
                          e.buy.toFixed(2),
                          e.sell.toFixed(2),
                          ((e.buy + e.sell) / 2).toFixed(2),
                        ]),
                      ]
                        .map((row) => row.join(','))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `dolar-blue-bolivia-${selectedRange}-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }
                  }}
                  className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!historyData || !historyData.history || clientCsvNeedsUnlock}
                >
                  {language === 'es' ? 'Descargar CSV de la tabla' : 'Download table CSV'}
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {language === 'es' ? (
                <>
                  Creative Commons · cita <span className="font-medium text-gray-700 dark:text-gray-300">boliviablue.com</span>.{' '}
                  <Link
                    to="/fuente-de-datos"
                    className="font-medium text-blue-600 underline decoration-blue-600/25 underline-offset-2 hover:decoration-blue-600 dark:text-blue-400"
                  >
                    Metodología
                  </Link>
                  {' · '}
                  <Link to="/calculadora" className="font-medium text-blue-600 underline decoration-blue-600/25 underline-offset-2 dark:text-blue-400">
                    Calculadora
                  </Link>
                </>
              ) : (
                <>
                  Creative Commons · cite <span className="font-medium text-gray-700 dark:text-gray-300">boliviablue.com</span>.{' '}
                  <Link
                    to="/fuente-de-datos"
                    className="font-medium text-blue-600 underline decoration-blue-600/25 underline-offset-2 dark:text-blue-400"
                  >
                    Methodology
                  </Link>
                  {' · '}
                  <Link to="/calculadora" className="font-medium text-blue-600 underline decoration-blue-600/25 underline-offset-2 dark:text-blue-400">
                    Calculator
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>

        <section id="citar" className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{page.methodology.citeHeading}</h2>
          <p className="text-gray-700 dark:text-gray-300">{page.methodology.citeIntroduction}</p>
          <p className="mt-3 rounded-lg bg-white p-4 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-white">{page.methodology.citation}</p>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{page.methodology.citationAlternatives}</p>
          <Link to="/fuente-de-datos#citar" className="mt-3 inline-block font-medium text-blue-600 underline dark:text-blue-400">{page.methodologyLabel}</Link>
        </section>

        <details className="group mb-6 overflow-hidden rounded-xl border border-gray-200/80 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
          <summary className="cursor-pointer list-none px-4 py-3 font-medium text-gray-800 dark:text-gray-200 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex w-full items-center justify-between gap-2">
              {language === 'es' ? 'Más contexto (SEO)' : 'More context (SEO)'}
              <span className="text-gray-400 group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <div className="border-t border-gray-100 px-4 py-3 text-gray-600 dark:border-gray-700 dark:text-gray-300">
            {language === 'es' ? (
              <p>
                Archivo del <strong>dólar blue en Bolivia</strong> y del <strong>bolivian blue rate</strong>: compra, venta y
                promedio según la cobertura disponible, alineado con la cotización en vivo. Los datos no son asesoría financiera; sirven para
                tendencias y análisis con atribución a boliviablue.com.
              </p>
            ) : (
              <p>
                Archive of the <strong>blue dollar in Bolivia</strong> and <strong>bolivian blue rate</strong>: buy, sell, and
                mid within the available coverage, aligned with the live quote. Data is not financial advice; use for trends and analysis with
                attribution to boliviablue.com.
              </p>
            )}
          </div>
        </details>
      </main>

      <Footer />
    </div>
  );
}

export default DatosHistoricos;

