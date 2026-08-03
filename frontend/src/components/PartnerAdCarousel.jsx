import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPartnerAds } from '../config/referrals';
import { trackReferralClicked, trackBuyFunnelViewed } from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

const ROTATE_MS = 6000;

function qrUrl(href) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=148x148&margin=6&data=${encodeURIComponent(href)}`;
}

function BrandMark({ theme }) {
  if (theme === 'takenos') {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 3c-2.8 2.2-4.5 4.8-4.5 7.6A4.5 4.5 0 0012 15a4.5 4.5 0 004.5-4.4C16.5 7.8 14.8 5.2 12 3z" />
        </svg>
      </span>
    );
  }
  if (theme === 'airtm') {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 text-xs font-black shadow-sm">
        AT
      </span>
    );
  }
  if (theme === 'meru') {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-black shadow-sm">
        M
      </span>
    );
  }
  if (theme === 'binance') {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0B90B] text-black text-sm font-black shadow-sm">
        B
      </span>
    );
  }
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5C518] text-stone-950 text-sm font-black shadow-sm">
      ◆
    </span>
  );
}

function ctaTone(theme) {
  if (theme === 'eldorado') return 'bg-stone-950 text-[#F5C518] group-hover:bg-stone-800';
  if (theme === 'takenos') return 'bg-sky-500 text-white group-hover:bg-sky-400';
  if (theme === 'airtm') return 'bg-cyan-400 text-slate-950 group-hover:bg-cyan-300';
  if (theme === 'meru') return 'bg-indigo-600 text-white group-hover:bg-indigo-500';
  return 'bg-[#F0B90B] text-stone-950 group-hover:bg-yellow-300';
}

function chipTone(theme) {
  if (theme === 'eldorado') return 'bg-[#F5C518] text-stone-950';
  if (theme === 'takenos') return 'bg-sky-400 text-slate-950';
  if (theme === 'airtm') return 'bg-cyan-400 text-slate-950';
  if (theme === 'meru') return 'bg-indigo-500 text-white';
  return 'bg-[#F0B90B] text-stone-950';
}

function surfaceClass(ad) {
  if (ad.surface === 'dark') return 'bg-[#061018] text-white';
  if (ad.theme === 'takenos') {
    return 'bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-white';
  }
  if (ad.theme === 'meru') {
    return 'bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-gray-900 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900 dark:text-white';
  }
  if (ad.theme === 'binance') {
    return 'bg-gradient-to-br from-amber-50 via-white to-yellow-50 text-gray-900 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 dark:text-white';
  }
  return 'bg-gradient-to-br from-amber-50/90 via-white to-stone-50 text-gray-900 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 dark:text-white';
}

function SlideArt({ theme, rateLabel }) {
  if (theme === 'binance') {
    return (
      <div className="rounded-xl border border-[#F0B90B]/35 bg-stone-950 px-5 py-3.5 text-center shadow-lg">
        <div className="text-[9px] uppercase tracking-wider text-amber-200/50">USDT/BOB</div>
        <div className="font-mono text-2xl font-bold text-[#F0B90B] tabular-nums">{rateLabel || '—'}</div>
      </div>
    );
  }
  if (theme === 'takenos') {
    return (
      <div className="h-[7.5rem] w-[5rem] rounded-[1.15rem] border-[3px] border-slate-800 bg-slate-900 p-2.5 text-white shadow-xl">
        <div className="text-[8px] font-semibold text-sky-300">Takenos</div>
        <div className="mt-2 text-[8px] text-white/40">Balance</div>
        <div className="font-mono text-sm font-bold">$1,289</div>
        <div className="mt-3 h-1.5 w-4/5 rounded-full bg-sky-500/80" />
      </div>
    );
  }
  if (theme === 'airtm') {
    return (
      <div className="h-24 w-40 -rotate-3 rounded-xl bg-gradient-to-br from-white to-slate-200 p-3 text-slate-800 shadow-xl ring-1 ring-black/5">
        <div className="flex justify-between text-[9px] font-bold">
          <span>AIRTM</span>
          <span className="italic text-blue-700">VISA</span>
        </div>
        <div className="mt-3 h-4 w-6 rounded bg-amber-300" />
        <div className="mt-2 font-mono text-[10px] tracking-widest">•••• 4242</div>
      </div>
    );
  }
  if (theme === 'meru') {
    return (
      <div className="rounded-xl border border-indigo-400/40 bg-indigo-950 px-4 py-3 text-center shadow-lg text-white">
        <div className="text-[9px] uppercase tracking-wider text-indigo-200/70">Meru</div>
        <div className="mt-1 font-mono text-xl font-bold text-indigo-200">+$5</div>
        <div className="mt-1 text-[10px] font-semibold tracking-wide text-white/80">NGPFPG</div>
      </div>
    );
  }
  return (
    <div className="h-[7.25rem] w-[4.75rem] rounded-md border border-stone-300 bg-gradient-to-b from-stone-50 to-stone-300 shadow-xl">
      <div className="mx-auto mt-3 h-8 w-8 rounded-full bg-stone-400/30" />
      <div className="mt-4 text-center text-[9px] font-black tracking-widest text-stone-700">USD</div>
    </div>
  );
}

/**
 * Whole banner is one link. Controls sit outside so they never steal the CTA.
 */
export default function PartnerAdCarousel({
  placement = 'partner_carousel',
  midRate = null,
  intervalMs = ROTATE_MS,
}) {
  const language = useLanguage()?.language || 'es';
  const ads = getPartnerAds(language);
  const [index, setIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const viewed = useRef(new Set());
  const pausedRef = useRef(false);
  const touchX = useRef(null);

  const go = useCallback(
    (deltaOrIndex, absolute = false) => {
      const n = ads.length;
      if (!n) return;
      setSlideDir(absolute ? 1 : deltaOrIndex >= 0 ? 1 : -1);
      setIndex((i) =>
        absolute ? ((deltaOrIndex % n) + n) % n : (i + deltaOrIndex + n) % n
      );
    },
    [ads.length]
  );

  useEffect(() => {
    trackBuyFunnelViewed({ language, placement });
  }, [language, placement]);

  useEffect(() => {
    const ad = ads[index];
    if (!ad || viewed.current.has(ad.id)) return;
    viewed.current.add(ad.id);
    trackBuyFunnelViewed({ language, placement: `${placement}_${ad.partner}` });
  }, [ads, index, language, placement]);

  useEffect(() => {
    if (ads.length < 2) return undefined;
    const id = window.setInterval(() => {
      if (!pausedRef.current) go(1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [ads.length, intervalMs, go, index]);

  const rateLabel =
    midRate != null && Number.isFinite(Number(midRate))
      ? formatRate(midRate, 'USD')
      : null;

  if (!ads.length) return null;

  const ad = ads[index];
  const isDark = ad.surface === 'dark';
  const subText =
    ad.partner === 'binance' && rateLabel
      ? language === 'es'
        ? `Paralelo ~${rateLabel} Bs · P2P a tasa de mercado`
        : `Parallel ~${rateLabel} Bs · P2P at market rate`
      : ad.sub;

  const openPartner = (e) => {
    e.preventDefault();
    trackReferralClicked({
      language,
      partner: ad.partner,
      placement,
      destination: ad.href,
      link_label: `carousel_${ad.partner}`,
    });
    window.open(ad.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative z-20 w-full isolate"
      data-partner-carousel={placement}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {/* Entire creative is the hit target — rotates silently, no dots/arrows/chrome */}
      <a
        href={ad.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={openPartner}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
          pausedRef.current = true;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          pausedRef.current = false;
          if (start == null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 70) {
            e.preventDefault();
            go(dx < 0 ? 1 : -1);
          }
        }}
        className={`group relative block overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] outline-none transition ring-offset-2 focus-visible:ring-2 focus-visible:ring-sky-500 ${surfaceClass(ad)}`}
        aria-label={`${ad.brand}: ${ad.cta}`}
      >
        {isDark && (
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(0,200,255,0.25),transparent_55%)]" />
        )}

        <span
          key={`${ad.id}-${index}`}
          className="relative grid grid-cols-1 items-center gap-5 p-6 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-6"
          style={{
            animation: `partnerIn 480ms cubic-bezier(0.22,1,0.36,1) both`,
            ['--partner-from']: slideDir >= 0 ? '1.75rem' : '-1.75rem',
          }}
        >
          <span className="flex min-w-0 flex-col gap-3">
            <span className="flex items-center gap-2.5">
              <BrandMark theme={ad.theme} />
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                  isDark ? 'text-white/55' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {ad.brand}
              </span>
            </span>

            <span className="block text-xl font-bold leading-snug tracking-tight sm:text-2xl">
              {ad.highlight ? (
                <>
                  <span className={`inline px-1.5 py-0.5 ${chipTone(ad.theme)}`}>{ad.highlight}</span>{' '}
                  {ad.headlineRest}
                </>
              ) : (
                ad.headline
              )}
            </span>

            <span
              className={`block text-sm leading-relaxed sm:text-[15px] ${
                isDark ? 'text-white/65' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {subText}
            </span>

            <span
              className={`mt-1 inline-flex h-12 w-full max-w-sm items-center justify-center rounded-xl px-6 text-sm font-bold shadow-md transition duration-200 group-hover:translate-x-0.5 group-active:scale-[0.98] sm:w-auto ${ctaTone(ad.theme)}`}
            >
              {ad.cta}
              <svg
                className="ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </span>

          <span className="hidden self-center md:flex" aria-hidden>
            <SlideArt theme={ad.theme} rateLabel={rateLabel} />
          </span>

          {ad.showQr && (
            <span className="hidden flex-col items-center justify-center gap-1.5 self-center lg:flex">
              <span className="block h-[6.75rem] w-[6.75rem] rounded-xl bg-white p-1.5 shadow-md ring-1 ring-black/5">
                <img
                  src={qrUrl(ad.href)}
                  alt=""
                  width={108}
                  height={108}
                  className="h-full w-full"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className={`text-[10px] ${isDark ? 'text-white/45' : 'text-gray-400'}`}>
                {language === 'es' ? 'Escaneá para abrir' : 'Scan to open'}
              </span>
            </span>
          )}
        </span>
      </a>

      <style>{`
        @keyframes partnerIn {
          from { opacity: 0; transform: translateX(var(--partner-from, 1.75rem)); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
