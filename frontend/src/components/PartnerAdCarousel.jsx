import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPartnerAds } from '../config/referrals';
import { trackReferralClicked, trackBuyFunnelViewed } from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

const ROTATE_MS = 6500;

const THEMES = {
  eldorado: {
    shell:
      'bg-[#0c0a09] text-white border border-amber-500/25',
    accent: 'bg-amber-400 text-stone-950',
    pill: 'bg-amber-400/15 text-amber-200 border border-amber-400/30',
    cta: 'bg-amber-400 text-stone-950 hover:bg-amber-300',
    glow: 'from-amber-500/20 via-transparent to-orange-600/10',
    mark: 'bg-amber-400 text-stone-950',
  },
  takenos: {
    shell:
      'bg-[#0b1220] text-white border border-sky-500/20',
    accent: 'bg-sky-400 text-slate-950',
    pill: 'bg-sky-400/15 text-sky-200 border border-sky-400/30',
    cta: 'bg-sky-400 text-slate-950 hover:bg-sky-300',
    glow: 'from-sky-500/20 via-transparent to-cyan-600/10',
    mark: 'bg-sky-400 text-slate-950',
  },
  airtm: {
    shell:
      'bg-[#071a24] text-white border border-cyan-500/25',
    accent: 'bg-cyan-400 text-slate-950',
    pill: 'bg-cyan-400/15 text-cyan-100 border border-cyan-400/30',
    cta: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    glow: 'from-cyan-500/25 via-transparent to-teal-600/10',
    mark: 'bg-cyan-400 text-slate-950',
  },
  binance: {
    shell:
      'bg-[#12100a] text-white border border-yellow-500/25',
    accent: 'bg-[#F0B90B] text-stone-950',
    pill: 'bg-[#F0B90B]/15 text-yellow-100 border border-yellow-500/30',
    cta: 'bg-[#F0B90B] text-stone-950 hover:bg-yellow-300',
    glow: 'from-yellow-500/20 via-transparent to-amber-700/10',
    mark: 'bg-[#F0B90B] text-stone-950',
  },
};

function qrUrl(href) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(href)}`;
}

function BrandMark({ brand, className }) {
  const letter = (brand || '?').slice(0, 1).toUpperCase();
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black tracking-tight ${className}`}
      aria-hidden
    >
      {letter}
    </span>
  );
}

/**
 * Full-bleed rotating partner funnel — El Dorado, Takenos, Airtm, Binance.
 * Fixed height to avoid CLS; auto-advances; pause on hover.
 */
export default function PartnerAdCarousel({
  placement = 'partner_carousel',
  midRate = null,
  intervalMs = ROTATE_MS,
}) {
  const language = useLanguage()?.language || 'es';
  const ads = getPartnerAds(language);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewed = useRef(new Set());

  const go = useCallback(
    (next) => {
      setIndex((i) => {
        const n = ads.length;
        return ((typeof next === 'number' ? next : i + next) + n) % n;
      });
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
    trackBuyFunnelViewed({
      language,
      placement: `${placement}_${ad.partner}`,
    });
  }, [ads, index, language, placement]);

  useEffect(() => {
    if (paused || ads.length < 2) return undefined;
    const id = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, ads.length, intervalMs, go]);

  const ad = ads[index];
  if (!ad) return null;
  const theme = THEMES[ad.theme] || THEMES.eldorado;

  const rateLabel =
    midRate != null && Number.isFinite(Number(midRate))
      ? formatRate(midRate, 'USD')
      : null;

  const subText =
    ad.partner === 'binance' && rateLabel
      ? language === 'es'
        ? `Paralelo ~${rateLabel} Bs. Operá P2P a tasa de mercado.`
        : `Parallel ~${rateLabel} Bs. Trade P2P at market rate.`
      : ad.sub;

  const onCta = () => {
    trackReferralClicked({
      language,
      partner: ad.partner,
      placement,
      destination: ad.href,
      link_label: `carousel_${ad.partner}`,
    });
  };

  return (
    <div
      className="relative w-full min-h-[13.5rem] sm:min-h-[12.5rem]"
      data-partner-carousel={placement}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl ${theme.shell} min-h-[13.5rem] sm:min-h-[12.5rem]`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-5 sm:p-6 md:p-7">
          <div className="flex flex-col justify-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5">
              <BrandMark brand={ad.brand} className={theme.mark} />
              <span className={`text-xs font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full ${theme.pill}`}>
                {ad.brand}
              </span>
              <span className="text-[11px] text-white/45 font-medium tabular-nums">
                {index + 1}/{ads.length}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl md:text-[1.65rem] font-bold leading-tight tracking-tight text-white max-w-xl">
                {ad.headline}
              </h3>
              <p className="mt-2 text-sm sm:text-[0.95rem] text-white/70 max-w-lg leading-relaxed min-h-[2.75rem]">
                {subText}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={ad.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={onCta}
                className={`inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-bold transition-colors ${theme.cta}`}
              >
                {ad.cta}
              </a>
              <span className="text-[11px] text-white/40 hidden sm:inline">
                {language === 'es' ? 'Link de referido · se abre en nueva pestaña' : 'Referral link · opens in a new tab'}
              </span>
            </div>
          </div>

          {/* Desktop QR — reserved box so layout never jumps */}
          <a
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={onCta}
            className="hidden md:flex flex-col items-center justify-center gap-2 self-center"
            aria-label={ad.cta}
          >
            <div className="h-[7.25rem] w-[7.25rem] rounded-xl bg-white p-2 shadow-lg shadow-black/30">
              <img
                src={qrUrl(ad.href)}
                alt=""
                width={116}
                height={116}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
              {language === 'es' ? 'Escaneá' : 'Scan'}
            </span>
          </a>
        </div>

        {/* Next control — competitor-style edge chevron */}
        {ads.length > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-0 top-0 bottom-0 w-10 sm:w-11 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors border-l border-white/10"
            aria-label={language === 'es' ? 'Siguiente oferta' : 'Next offer'}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {ads.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Partner ads">
          {ads.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={item.brand}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-7 bg-gray-800 dark:bg-gray-200' : 'w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
