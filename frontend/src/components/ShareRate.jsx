import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRate } from '../contexts/RateContext';
import { rateShareModel } from '../utils/rateShare';
import { trackSocialShare } from '../utils/analytics';

export default function ShareRate({ compact = false, placement = 'rate' }) {
  const { language = 'es' } = useLanguage(); const { rateData } = useRate(); const es = language !== 'en';
  const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false);
  const model = rateShareModel(rateData, language);
  const act = async (kind) => {
    const snapshot = rateShareModel(rateData, language);
    try {
      if (kind === 'copy') { await navigator.clipboard.writeText(snapshot.text); setStatus(es ? 'Cotización y hora copiadas.' : 'Quote and time copied.'); }
      else { setBusy(true); const { downloadRateCard } = await import('../utils/rateCardImage'); await downloadRateCard(snapshot, language); setStatus(es ? 'Imagen descargada. Lista para compartir.' : 'Image downloaded. Ready to share.'); }
      trackSocialShare(kind === 'copy' ? 'copy' : 'png_download', 'dated_rate', placement);
    } catch { setStatus(es ? 'No se pudo completar. Podés seleccionar y copiar el texto de abajo.' : 'Could not complete. You can select and copy the text below.'); }
    finally { setBusy(false); }
  };
  const button = 'min-h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold hover:bg-sky-50 dark:hover:bg-gray-700 disabled:opacity-50';
  return <section aria-label={es ? 'Compartir cotización fechada' : 'Share a dated quote'} className={`${compact ? '' : 'rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-800 p-4'} text-gray-900 dark:text-white`}>
    {!compact && <h2 className="font-semibold mb-2">{es ? 'Compartí la cotización con su hora' : 'Share the quote with its timestamp'}</h2>}
    <div className="flex flex-wrap justify-center gap-2">
      <a className={`${button} bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800`} href={`https://wa.me/?text=${encodeURIComponent(model.text)}`} target="_blank" rel="noopener noreferrer" onClick={event => { event.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(rateShareModel(rateData, language).text)}`; trackSocialShare('whatsapp', 'dated_rate', placement); }}>WhatsApp</a>
      <button type="button" className={button} onClick={() => act('copy')}>{es ? 'Copiar cotización' : 'Copy dated rate'}</button>
      <button type="button" className={button} disabled={!model.available || busy} onClick={() => act('image')}>{busy ? (es ? 'Preparando…' : 'Preparing…') : (es ? 'Descargar imagen' : 'Download image')}</button>
    </div>
    <p role="status" className="text-xs mt-2" aria-live="polite">{status}</p>
    {!compact && <details className="mt-2 text-xs text-gray-600 dark:text-gray-300"><summary className="cursor-pointer py-2">{es ? 'Ver texto para compartir' : 'View share text'}</summary><p className="whitespace-pre-line select-text">{model.text}</p></details>}
  </section>;
}
