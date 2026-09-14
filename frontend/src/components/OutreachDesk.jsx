import { useEffect, useState } from 'react';
import {
  DIRECTORIES,
  GUEST_COLUMN_ES,
  NEWSROOMS,
  WEEKLY_ACTIONS,
  encodeMail,
  pitchFor,
} from '../data/newsrooms';

function weekKey() {
  const d = new Date();
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `bb-outreach-${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function OutreachDesk({ liveLine, language = 'es' }) {
  const es = language !== 'en';
  const [copied, setCopied] = useState('');
  const [done, setDone] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(weekKey());
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (id) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(weekKey(), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      /* ignore */
    }
  };

  const btn =
    'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-5 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {es ? 'Esta semana (5 envíos)' : 'This week (5 sends)'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {es
            ? 'Los backlinks no se generan solos. Marcá cada envío. El checklist se reinicia cada semana en este navegador.'
            : 'Backlinks do not appear on their own. Check each send. This list resets each week in this browser.'}
        </p>
        <ul className="space-y-2">
          {WEEKLY_ACTIONS.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
              <input
                id={`wk-${item.id}`}
                type="checkbox"
                className="mt-1"
                checked={Boolean(done[item.id])}
                onChange={() => toggle(item.id)}
              />
              <label htmlFor={`wk-${item.id}`}>{item.label}</label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {es ? 'Redacciones: copiá y mandá' : 'Newsrooms: copy and send'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {es
            ? 'Solo incluimos el email si está publicado en su web (p. ej. Cadecocruz). En el resto, abrí su sitio y pegá el pitch en el formulario de contacto o en Gmail con el Para vacío.'
            : 'Emails are included only when published on their site. Otherwise open their site and paste the pitch.'}
        </p>
        <div className="space-y-4">
          {NEWSROOMS.map((outlet) => {
            const body = pitchFor(outlet, liveLine);
            const subject = `Datos del dólar paralelo en Bolivia (fuente gratuita) — ${outlet.name}`;
            const mail = encodeMail(subject, body, outlet.email || '');
            return (
              <article
                key={outlet.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {outlet.name}
                    <span className="ml-2 text-xs font-normal text-gray-500">{outlet.city}</span>
                    {outlet.priority ? (
                      <span className="ml-2 text-xs font-semibold text-amber-700 dark:text-amber-300">prioridad</span>
                    ) : null}
                  </h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{outlet.why}</p>
                <div className="flex flex-wrap gap-2">
                  <a className={btn} href={mail.gmail} target="_blank" rel="noopener noreferrer">
                    Gmail
                  </a>
                  <a className={btn} href={mail.mailto}>
                    {es ? 'Mail' : 'Email'}
                  </a>
                  <a className={btn} href={outlet.contactUrl} target="_blank" rel="noopener noreferrer">
                    {es ? 'Sitio / contacto' : 'Site / contact'}
                  </a>
                  <button type="button" className={btn} onClick={() => copy(body, outlet.id)}>
                    {copied === outlet.id ? (es ? 'Pitch copiado' : 'Pitch copied') : es ? 'Copiar pitch' : 'Copy pitch'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {es ? 'Columna lista para ofrecer' : 'Ready guest column'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {es
            ? 'Mandala como “columna de datos / cómo leer el paralelo”. Pedí el enlace a /dolar-blue-hoy y /fuente-de-datos.'
            : 'Offer this as a data column. Ask for links to /dolar-blue-hoy and /fuente-de-datos.'}
        </p>
        <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {GUEST_COLUMN_ES}
        </pre>
        <button type="button" className={`${btn} bg-blue-600 text-white border-blue-600`} onClick={() => copy(GUEST_COLUMN_ES, 'col')}>
          {copied === 'col' ? (es ? 'Copiado' : 'Copied') : es ? 'Copiar columna' : 'Copy column'}
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {es ? 'Directorios (un envío cada uno)' : 'Directories (one submission each)'}
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {DIRECTORIES.map((d) => (
            <li key={d.name}>
              <a className="text-blue-600 hover:underline" href={d.url} target="_blank" rel="noopener noreferrer">
                {d.name}
              </a>
              {' — '}
              {d.note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
