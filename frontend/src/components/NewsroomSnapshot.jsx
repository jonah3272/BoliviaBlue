import { useState } from 'react';
import SourceObservationPanel from './SourceObservationPanel';
import { newsroomReport } from '../utils/sourceObservation';

function download(text, type, name) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function NewsroomSnapshot({ rate, language = 'es', loading, error }) {
  const report = newsroomReport(rate, language); const es = language === 'es';
  const [status, setStatus] = useState('');
  const copy = async () => { try { await navigator.clipboard.writeText(report.text); setStatus(es ? 'Corte copiado.' : 'Snapshot copied.'); } catch { setStatus(es ? 'No se pudo copiar. Usá la descarga de texto.' : 'Could not copy. Use the text download.'); } };
  const slug = report.observedAt ? new Date(report.observedAt).toISOString().replaceAll(':', '-') : 'sin-lectura';
  return <section id="corte-informativo" className="space-y-4 text-gray-800 dark:text-gray-200">
    <h2 className="text-2xl font-bold">{es ? 'Corte informativo para citar' : 'Snapshot for citation'}</h2>
    <p className="text-sm">{es ? 'Una lectura fechada para tu nota. No es un cierre diario: cambia cuando llega una nueva observación. Descargá el corte para conservar los datos que citaste.' : 'A timestamped observation for your story. This is not a daily close: it changes when a new observation arrives. Download the snapshot to retain the data you cited.'}</p>
    <SourceObservationPanel rate={rate} language={language} loading={loading} error={error} />
    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-4 text-sm whitespace-pre-line">{report.text}</div>
    <p className="text-xs text-gray-600 dark:text-gray-400">{es ? 'Notas de método: mediana de referencias por plataforma; esquema de instantánea v1. Una lectura no acredita una tendencia diaria o semanal. Las etiquetas compra/venta conservan las convenciones de la fuente; verificá el sentido de una operación directamente en la plataforma.' : 'Method notes: median of platform references; snapshot schema v1. One observation does not establish a daily or weekly trend. Buy/sell labels preserve source conventions; verify the direction of a trade directly with the venue.'} <a href="/fuente-de-datos" className="underline">{es ? 'Metodología completa' : 'Full methodology'}</a></p>
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={copy} className="rounded-lg bg-blue-600 text-white px-4 py-3">{es ? 'Copiar corte' : 'Copy snapshot'}</button>
      <button type="button" onClick={() => download(report.text, 'text/plain;charset=utf-8', `boliviablue-${slug}.txt`)} className="rounded-lg border border-gray-300 px-4 py-3">{es ? 'Descargar texto' : 'Download text'}</button>
      <button type="button" onClick={() => download(JSON.stringify({ observation_time: report.observedAt, is_stale: report.stale, buy: report.buy, sell: report.sell, quote_asset: 'USDT', fiat: 'BOB', source_provenance: report.available ? 'persisted_observation' : 'unavailable_for_stored_row', source_observation: report.observation, citation: report.text }, null, 2), 'application/json', `boliviablue-${slug}.json`)} className="rounded-lg border border-gray-300 px-4 py-3">{es ? 'Descargar corte JSON' : 'Download snapshot JSON'}</button>
    </div>
    <p role="status" className="text-sm">{status}</p>
    <p className="text-sm">{es ? 'Para gráficos exploratorios y series descargables, usá el historial existente. No atribuyas variaciones a un mercado comparable cuando faltan fuentes por registro.' : 'For exploratory charts and downloadable series, use the existing history. Do not attribute changes to a comparable market when per-record sources are missing.'} <a href="/datos-historicos" className="text-blue-600 underline">{es ? 'Ver gráfico e historial' : 'View chart and history'}</a> · <a href="/api/historical-data.csv?range=30d" className="text-blue-600 underline">CSV 30d</a> · <a href="/api/historical-data.json?range=30d" className="text-blue-600 underline">JSON 30d</a></p>
  </section>;
}
