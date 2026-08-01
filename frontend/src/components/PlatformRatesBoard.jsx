import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ELDORADO_REFERRAL_LINK,
  TAKENOS_REFERRAL_LINK,
  AIRTM_REFERRAL_LINK,
  BINANCE_REFERRAL_LINK,
} from '../config/referrals';
import { trackReferralClicked } from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

const META = {
  eldorado: {
    href: ELDORADO_REFERRAL_LINK,
    theme: 'eldorado',
    accent: 'from-amber-500/20 via-transparent to-transparent border-amber-400/40',
    btn: 'bg-amber-500 text-stone-950 hover:bg-amber-400',
    btnSecondary: 'border-amber-400/50 text-amber-200 hover:bg-amber-500/10',
    cta: { es: 'Descargar App', en: 'Download App' },
    cta2: { es: 'Tu cuenta en dólares', en: 'Your USD account' },
  },
  takenos: {
    href: TAKENOS_REFERRAL_LINK,
    theme: 'takenos',
    accent: 'from-violet-500/20 via-transparent to-transparent border-violet-400/40',
    btn: 'bg-violet-600 text-white hover:bg-violet-500',
    btnSecondary: 'border-violet-400/50 text-violet-200 hover:bg-violet-500/10',
    cta: { es: 'Conocer más', en: 'Learn more' },
    cta2: { es: 'Abrir Takenos', en: 'Open Takenos' },
  },
  airtm: {
    href: AIRTM_REFERRAL_LINK,
    theme: 'airtm',
    accent: 'from-sky-500/20 via-transparent to-transparent border-sky-400/40',
    btn: 'bg-sky-500 text-white hover:bg-sky-400',
    btnSecondary: 'border-sky-400/50 text-sky-200 hover:bg-sky-500/10',
    cta: { es: 'Conocer más', en: 'Learn more' },
    cta2: { es: 'Crear cuenta', en: 'Create account' },
  },
  binance: {
    href: BINANCE_REFERRAL_LINK,
    theme: 'binance',
    accent: 'from-yellow-500/20 via-transparent to-transparent border-yellow-400/40',
    btn: 'bg-[#F0B90B] text-stone-950 hover:bg-yellow-300',
    btnSecondary: 'border-yellow-400/50 text-yellow-200 hover:bg-yellow-500/10',
    cta: { es: 'Crear cuenta', en: 'Create account' },
    cta2: { es: 'Ir a P2P', en: 'Go to P2P' },
  },
};

function fmt(n) {
  if (!Number.isFinite(n)) return '—';
  return formatRate(n, 'USD');
}

/**
 * Competitor-style live USDT/BOB board for recommended platforms.
 */
export default function PlatformRatesBoard({ placement = 'buy_page_platforms' }) {
  const language = useLanguage()?.language || 'es';
  const es = language === 'es';
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/platform-rates', { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed');
      }
    };
    load();
    const id = window.setInterval(load, 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const onClick = (id, href, label) => {
    trackReferralClicked({
      language,
      partner: id,
      placement,
      destination: href,
      link_label: label,
    });
  };

  const verifiedLabel = (() => {
    if (!data?.verified_at) return null;
    try {
      const d = new Date(data.verified_at);
      return d.toLocaleString(es ? 'es-BO' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  })();

  const platforms = data?.platforms || [];

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {es ? 'Exchanges digitales' : 'Digital exchanges'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {es ? 'Lecturas verificadas USDT/BOB' : 'Verified USDT/BOB readings'}
          </p>
        </div>
        {verifiedLabel && (
          <span className="inline-flex w-fit items-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 text-xs font-medium px-3 py-1">
            {es ? 'Lectura verificada' : 'Verified'}: {verifiedLabel}
          </span>
        )}
      </div>

      {error && !platforms.length && (
        <p className="px-5 py-8 text-sm text-center text-gray-500">
          {es ? 'No se pudieron cargar las cotizaciones ahora.' : 'Could not load quotes right now.'}
        </p>
      )}

      {!data && !error && (
        <div className="grid gap-4 p-5 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
          ))}
        </div>
      )}

      {platforms.length > 0 && (
        <div className="p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 mb-3">
            {es ? 'Plataformas recomendadas' : 'Recommended platforms'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platforms.map((p) => {
              const meta = META[p.id];
              if (!meta) return null;
              const mid = p.mid ?? (Number.isFinite(p.buy) && Number.isFinite(p.sell) ? (p.buy + p.sell) / 2 : null);
              return (
                <article
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border bg-gradient-to-br ${meta.accent} bg-gray-50 dark:bg-gray-900/80 p-4 sm:p-5`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {p.live
                          ? es
                            ? 'Cotización en vivo'
                            : 'Live quote'
                          : es
                            ? 'Abrí la app para la tasa'
                            : 'Open app for live rate'}
                      </p>
                    </div>
                    {p.live && (
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5">
                        Live
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {es ? 'Promedio' : 'Average'}
                    </p>
                    <p className="font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                      {mid != null ? (
                        <>
                          <span className="text-base font-semibold text-gray-500 dark:text-gray-400">Bs </span>
                          {fmt(mid)}
                        </>
                      ) : (
                        '—'
                      )}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-white/70 dark:bg-black/30 px-2.5 py-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {es ? 'Compra' : 'Buy'}
                        </p>
                        <p className="font-mono font-semibold tabular-nums text-gray-900 dark:text-white">
                          {p.buy != null ? `Bs ${fmt(p.buy)}` : '—'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-black/30 px-2.5 py-2">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {es ? 'Venta' : 'Sell'}
                        </p>
                        <p className="font-mono font-semibold tabular-nums text-gray-900 dark:text-white">
                          {p.sell != null ? `Bs ${fmt(p.sell)}` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <a
                      href={meta.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => onClick(p.id, meta.href, `platform_board_primary_${p.id}`)}
                      className={`inline-flex h-10 items-center justify-center rounded-xl text-sm font-bold transition ${meta.btn}`}
                    >
                      {meta.cta[es ? 'es' : 'en']}
                    </a>
                    <a
                      href={meta.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => onClick(p.id, meta.href, `platform_board_secondary_${p.id}`)}
                      className={`inline-flex h-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${meta.btnSecondary}`}
                    >
                      {meta.cta2[es ? 'es' : 'en']}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            {es
              ? 'El Dorado y Binance se leen en vivo. Takenos y Airtm aún no publican una API de tasa estable — la cotización aparece al abrir la app. Las tasas son referenciales y pueden variar por monto y método.'
              : 'El Dorado and Binance are read live. Takenos and Airtm do not publish a stable public rate API yet — the quote appears in-app. Rates are referential and can vary by amount and method.'}
          </p>
        </div>
      )}
    </section>
  );
}
