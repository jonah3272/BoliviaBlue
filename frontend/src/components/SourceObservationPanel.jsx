import { Link } from 'react-router-dom';
import { sourceObservationModel, observationLabel, formatObservationRate } from '../utils/sourceObservation';
import { homeSourceComparison, HOME_SOURCE_CLASS } from '../utils/homeSourceComparison';

function HomeSourceComparison({ rate, language, loading, error }) {
  const m = homeSourceComparison(rate, language), c = m.copy;
  return <section data-home-source-comparison aria-labelledby="home-source-comparison-heading" className={HOME_SOURCE_CLASS}>
    <h2 id="home-source-comparison-heading" className="text-lg font-bold">{c.heading}</h2>
    {/* Keep a stable element: browser translation can detach raw React text nodes. */}
    <p className="text-sm"><span>{m.sources.observedAt ? <time dateTime={m.sources.observedAt}>{m.observation}</time> : m.observation}</span>{(m.sources.stale || error) && <strong className="block text-amber-700 dark:text-amber-300">{c.stale}</strong>}</p>
    {loading && !rate ? <p role="status">{c.loading}</p> : m.sources.available ? <>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left tabular-nums"><caption className="text-left pb-2">{c.caption}</caption><thead><tr>{[c.platform, c.buy, c.sell].map(label => <th key={label} scope="col" className="py-2 pr-3 align-bottom">{label}</th>)}</tr></thead><tbody>{m.rows.map(p => <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700"><th scope="row" className="py-2 pr-3 font-medium">{p.name}</th><td className="py-2 pr-3">{p.buy}</td><td className="py-2">{p.sell}</td></tr>)}</tbody></table></div>
      <p className="text-xs">{c.method}</p>
    </> : <p className="text-sm">{c.missing}</p>}
    <p className="text-xs">{c.caveat}</p>
    <div data-home-official-reference className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
      <h3 className="font-semibold">{c.officialHeading}</h3>
      {m.singleOfficial ? <>
        <p className="font-semibold tabular-nums">{m.officialValue} Bs/USD</p>
        {m.official.stale && <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{c.officialStale}</p>}
        <p className="text-xs">{c.officialDate}: <time dateTime={m.official.official_source_date}>{m.official.official_source_date}</time></p>
        <p className="text-xs">{c.officialRetrieved}: <time dateTime={m.official.official_observed_at}>{m.officialObservation}</time></p>
        <a className="text-sm text-blue-700 dark:text-blue-300 underline" href={m.official.official_observation.source_url}>{c.officialSource}</a>
      </> : <p className="text-sm">{c.officialMissing}</p>}
      <p className="text-xs">{c.officialCaveat}</p>
    </div>
    <nav data-home-source-links className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300">{m.links.map(link => <Link key={link.href} to={link.href}>{link.label}</Link>)}</nav>
  </section>;
}

export default function SourceObservationPanel({ rate, language = 'es', loading = false, error = null, homepage = false }) {
  if (homepage) return <HomeSourceComparison rate={rate} language={language} loading={loading} error={error} />;
  const m = sourceObservationModel(rate); const es = language === 'es';
  return <section aria-labelledby="source-observation-heading" className="rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-4 sm:p-6 space-y-3 text-gray-700 dark:text-gray-200">
    <h2 id="source-observation-heading" className="text-lg font-bold">{es ? 'Qué respalda esta cotización' : 'What backs this quote'}</h2>
    <p className="text-sm"><time dateTime={m.observedAt || undefined}>{observationLabel(m.observedAt, language)}</time>{(m.stale || error) && <strong className="block text-amber-700 dark:text-amber-300">{es ? 'Última lectura disponible; actualización pendiente.' : 'Last available observation; update pending.'}</strong>}</p>
    {loading && !rate ? <p role="status">{es ? 'Cargando lectura…' : 'Loading observation…'}</p> : m.available ? <>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left tabular-nums"><caption className="text-left pb-2">{es ? 'Referencias guardadas con esta lectura · BOB por USDT' : 'Quotes stored with this observation · BOB per USDT'}</caption><thead><tr><th className="py-2">{es ? 'Plataforma' : 'Platform'}</th><th>{es ? 'Compra' : 'Buy'}</th><th>{es ? 'Venta' : 'Sell'}</th></tr></thead><tbody>{m.platforms.map(p => <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700"><th scope="row" className="py-2 font-medium">{p.name}</th><td>{formatObservationRate(p.buy)}</td><td>{formatObservationRate(p.sell)}</td></tr>)}</tbody></table></div>
      <p className="text-xs">{es ? 'Esquema de instantánea v1; método: mediana de referencias por plataforma, por separado para compra y venta. Se muestran únicamente los aportes guardados, no todas las plataformas consultadas.' : 'Snapshot schema v1; method: median of platform quotes, separately for buy and sell. Only stored contributions are shown, not every platform queried.'}</p>
    </> : <p className="text-sm">{es ? 'Desglose de fuentes no disponible para este registro. No equivale a cero plataformas consultadas.' : 'Source breakdown unavailable for this record. This does not mean zero platforms were queried.'}</p>}
    <p className="text-xs">{es ? 'Valores mostrados redondeados; el JSON conserva la precisión guardada.' : 'Displayed values are rounded; JSON retains the stored precision.'}</p>
    <p className="text-xs">{es ? 'Cotizaciones de referencia, no precios de operación garantizados. USDT/BOB es una referencia P2P: no es dólar físico ni tipo oficial del BCB.' : 'Reference quotes, not guaranteed transaction prices. USDT/BOB is a P2P reference, not physical dollars or the BCB official rate.'}</p>
    <nav className="flex flex-wrap gap-4 text-sm text-blue-700 dark:text-blue-300"><Link to="/fuente-de-datos">{es ? 'Método y límites' : 'Method and limits'}</Link><Link to="/datos-historicos">{es ? 'Historial y descargas' : 'History and downloads'}</Link><Link to="/prensa#corte-informativo">{es ? 'Citar esta lectura' : 'Cite this observation'}</Link></nav>
  </section>;
}
