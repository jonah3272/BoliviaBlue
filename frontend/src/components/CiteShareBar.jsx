import { useState } from 'react';
import { SITE, telegramShare, whatsappShare } from '../data/newsrooms';

export default function CiteShareBar({
  liveLine,
  htmlCite,
  language = 'es',
  className = '',
}) {
  const es = language !== 'en';
  const [copied, setCopied] = useState('');
  const page = `${SITE}/dolar-blue-hoy`;
  const shareText = `${liveLine}\n${page}`;

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* ignore */
    }
  };

  const btn =
    'inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button type="button" className={`${btn} bg-sky-600 text-white border-sky-600 hover:bg-sky-500`} onClick={() => copy(liveLine, 'line')}>
        {copied === 'line' ? (es ? 'Copiado' : 'Copied') : es ? 'Copiar cita' : 'Copy quote'}
      </button>
      {htmlCite ? (
        <button type="button" className={btn} onClick={() => copy(htmlCite, 'html')}>
          {copied === 'html' ? (es ? 'HTML copiado' : 'HTML copied') : es ? 'Copiar HTML' : 'Copy HTML'}
        </button>
      ) : null}
      <a className={btn} href={whatsappShare(shareText)} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className={btn} href={telegramShare(page, liveLine)} target="_blank" rel="noopener noreferrer">
        Telegram
      </a>
    </div>
  );
}
