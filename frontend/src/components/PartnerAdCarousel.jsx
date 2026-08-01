import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPartnerAds } from '../config/referrals';
import { trackReferralClicked, trackBuyFunnelViewed } from '../utils/analyticsEvents';
import { formatRate } from '../utils/formatters';

const ROTATE_MS = 7000;

function qrUrl(href) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=10&data=${encodeURIComponent(href)}`;
}

/* ——— Brand marks (simple, sharp — not letter placeholders) ——— */
function LogoElDorado() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#F5C518] text-[#111] font-black text-lg leading-none shadow-sm">
      ◆
    </span>
  );
}
function LogoTakenos() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0EA5E9] text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 3c-2.8 2.2-4.5 4.8-4.5 7.6A4.5 4.5 0 0012 15a4.5 4.5 0 004.5-4.4C16.5 7.8 14.8 5.2 12 3z" />
        <path d="M7 16.5c1.4 1.7 3.1 2.7 5 2.7s3.6-1 5-2.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
function LogoAirtm() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C2FF] text-[#04212b] font-black text-sm tracking-tighter">
      AT
    </span>
  );
}
function LogoBinance() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0B90B] text-black shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 3.5l2.4 2.4-2.4 2.4-2.4-2.4L12 3.5zm0 12.2l2.4 2.4-2.4 2.4-2.4-2.4 2.4-2.4zM6.1 9.4L8.5 7l2.4 2.4-2.4 2.4L6.1 9.4zm9.4 0L17.9 7l2.4 2.4-2.4 2.4L15.5 9.4zM12 9.1l2.1 2.1-2.1 2.1-2.1-2.1L12 9.1z" />
      </svg>
    </span>
  );
}

const LOGOS = {
  eldorado: LogoElDorado,
  takenos: LogoTakenos,
  airtm: LogoAirtm,
  binance: LogoBinance,
};

/* ——— Per-slide product art (CSS/SVG — no stock photos) ——— */
function ArtElDorado() {
  return (
    <div className="relative h-full w-full flex items-center justify-center" aria-hidden>
      <div className="absolute inset-0 opacity-[0.12]" style={{
        backgroundImage: 'repeating-linear-gradient(115deg, #111 0 2px, transparent 2px 14px)',
      }} />
      <div className="relative flex items-end gap-3">
        <div className="h-28 w-20 rounded-md bg-gradient-to-b from-stone-200 to-stone-400 border border-stone-500/40 shadow-xl overflow-hidden">
          <div className="mt-3 mx-auto h-10 w-10 rounded-full bg-stone-600/30" />
          <div className="mt-4 mx-2 h-2 rounded bg-stone-600/40" />
          <div className="mt-1.5 mx-2 h-2 w-2/3 rounded bg-stone-600/30" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-stone-700/80">
            USD
          </div>
        </div>
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-emerald-600/50 bg-emerald-50 text-[10px] font-bold uppercase leading-tight text-emerald-800 text-center px-1 rotate-6 shadow-sm">
          Dólares<br />ready
        </div>
      </div>
    </div>
  );
}

function ArtTakenos() {
  return (
    <div className="relative h-full w-full flex items-center justify-center" aria-hidden>
      <div className="absolute inset-y-4 right-4 w-24 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-700 shadow-2xl rotate-6 opacity-90" />
      <div className="relative z-10 -ml-6 h-32 w-[9.5rem] rounded-2xl bg-slate-900 text-white shadow-2xl -rotate-3 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wide text-sky-300">TAKENOS</span>
          <span className="h-5 w-7 rounded bg-gradient-to-r from-amber-200 to-amber-400" />
        </div>
        <div>
          <div className="text-[10px] text-white/50">Saldo</div>
          <div className="font-mono text-lg font-bold tracking-tight">$1,280.00</div>
        </div>
        <div className="flex gap-1">
          {['USD', 'EUR', 'BOB'].map((c) => (
            <span key={c} className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/80">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtAirtm() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(0,194,255,0.35),transparent_55%)]" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative z-10 h-[7.5rem] w-[12rem] rounded-xl bg-gradient-to-br from-slate-100 via-white to-slate-200 shadow-2xl border border-white/40 p-3 -rotate-6">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider">AIRTM</span>
          <span className="text-[11px] font-black italic text-blue-700">VISA</span>
        </div>
        <div className="mt-5 h-6 w-8 rounded bg-amber-300/80" />
        <div className="mt-4 font-mono text-xs tracking-[0.2em] text-slate-600">•••• 4242</div>
        <div className="mt-1 text-[10px] uppercase text-slate-400">Virtual USD</div>
      </div>
    </div>
  );
}

function ArtBinance({ rateLabel }) {
  return (
    <div className="relative h-full w-full flex items-center justify-center" aria-hidden>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 30% 40%, #F0B90B55, transparent 50%)',
      }} />
      <div className="relative rounded-2xl border border-amber-500/40 bg-stone-950 text-amber-50 px-5 py-4 shadow-xl min-w-[9.5rem]">
        <div className="text-[10px] uppercase tracking-wider text-amber-200/70">USDT / BOB</div>
        <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-[#F0B90B]">
          {rateLabel || '—'}
        </div>
        <div className="mt-1 text-xs text-white/50">P2P · mercado</div>
      </div>
    </div>
  );
}

const ARTS = {
  eldorado: ArtElDorado,
  takenos: ArtTakenos,
  airtm: ArtAirtm,
  binance: ArtBinance,
};

/**
 * Rotating partner funnel.
 * Distinct creative per brand (not recolored clones); reserved height; crossfade.
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
  const progressRef = useRef(null);

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
    trackBuyFunnelViewed({ language, placement: `${placement}_${ad.partner}` });
  }, [ads, index, language, placement]);

  useEffect(() => {
    if (paused || ads.length < 2) return undefined;
    const id = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, ads.length, intervalMs, go, index]);

  // Restart progress animation when slide / pause changes
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.animation = 'none';
    // force reflow
    void el.offsetWidth;
    if (!paused) {
      el.style.animation = `partner-ad-progress ${intervalMs}ms linear forwards`;
    }
  }, [index, paused, intervalMs]);

  const rateLabel =
    midRate != null && Number.isFinite(Number(midRate))
      ? formatRate(midRate, 'USD')
      : null;

  if (!ads.length) return null;

  return (
    <div
      className="relative w-full"
      data-partner-carousel={placement}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <style>{`
        @keyframes partner-ad-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] min-h-[220px] sm:min-h-[200px]">
        {/* Progress */}
        <div className="absolute left-0 right-10 top-0 z-20 h-[3px] bg-black/5 dark:bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full origin-left bg-gray-900/70 dark:bg-white/70"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {ads.map((ad, i) => {
          const active = i === index;
          const Logo = LOGOS[ad.theme] || LogoElDorado;
          const Art = ARTS[ad.theme] || ArtElDorado;
          const isDark = ad.surface === 'dark';
          const showQr = ad.showQr !== false;

          const subText =
            ad.partner === 'binance' && rateLabel
              ? language === 'es'
                ? `Paralelo ~${rateLabel} Bs · operá en P2P a tasa de mercado`
                : `Parallel ~${rateLabel} Bs · trade P2P at market rate`
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
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                active ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!active}
            >
              <div
                className={`relative h-full min-h-[220px] sm:min-h-[200px] ${
                  isDark
                    ? 'bg-[#071018] text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                }`}
              >
                {/* Surface texture */}
                {!isDark && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.45]"
                    style={{
                      backgroundImage:
                        ad.theme === 'eldorado'
                          ? 'linear-gradient(135deg, #FFFBEB 0%, #ffffff 40%, #F8FAFC 100%)'
                          : ad.theme === 'takenos'
                            ? 'linear-gradient(135deg, #F0F9FF 0%, #ffffff 45%, #F8FAFC 100%)'
                            : 'linear-gradient(135deg, #FFFBEB 0%, #ffffff 50%, #FAFAF9 100%)',
                    }}
                    aria-hidden
                  />
                )}
                {isDark && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,194,255,0.22),transparent_50%)]"
                    aria-hidden
                  />
                )}

                <div className="relative grid h-full grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_auto] gap-0 pr-10 sm:pr-11">
                  {/* Copy */}
                  <div className="flex flex-col justify-center gap-3 p-5 sm:p-6 md:pr-2 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <Logo />
                      <span
                        className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                          isDark ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {ad.brand}
                      </span>
                    </div>

                    <h3 className="text-[1.35rem] sm:text-2xl md:text-[1.7rem] font-bold leading-[1.15] tracking-tight max-w-md">
                      {ad.highlight ? (
                        <>
                          <span
                            className={`box-decoration-clone px-1.5 py-0.5 ${
                              ad.theme === 'eldorado'
                                ? 'bg-[#F5C518] text-stone-950'
                                : ad.theme === 'takenos'
                                  ? 'bg-sky-400 text-slate-950'
                                  : ad.theme === 'binance'
                                    ? 'bg-[#F0B90B] text-stone-950'
                                    : 'bg-cyan-400 text-slate-950'
                            }`}
                          >
                            {ad.highlight}
                          </span>{' '}
                          <span className={isDark ? 'text-white' : ''}>{ad.headlineRest}</span>
                        </>
                      ) : (
                        ad.headline
                      )}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed max-w-md min-h-[2.5rem] ${
                        isDark ? 'text-white/70' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {subText}
                    </p>

                    <div className="pt-1">
                      <a
                        href={ad.href}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={onCta}
                        className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.99] ${
                          ad.theme === 'eldorado'
                            ? 'bg-stone-950 text-[#F5C518] hover:bg-stone-800'
                            : ad.theme === 'takenos'
                              ? 'bg-sky-500 text-white hover:bg-sky-400'
                              : ad.theme === 'airtm'
                                ? 'bg-[#00C2FF] text-[#04212b] hover:bg-cyan-300'
                                : 'bg-[#F0B90B] text-stone-950 hover:bg-yellow-300'
                        }`}
                      >
                        {ad.cta}
                      </a>
                    </div>
                  </div>

                  {/* Product art */}
                  <div className="hidden md:block relative min-h-[200px]">
                    <Art rateLabel={rateLabel} />
                  </div>

                  {/* QR — only when it aids conversion (desktop) */}
                  {showQr && (
                    <a
                      href={ad.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={onCta}
                      className="hidden lg:flex flex-col items-center justify-center gap-2 self-center pr-3 pl-1"
                      aria-label={ad.cta}
                    >
                      <div
                        className={`h-[7.5rem] w-[7.5rem] rounded-xl p-2 shadow-md ${
                          isDark ? 'bg-white' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <img
                          src={qrUrl(ad.href)}
                          alt=""
                          width={120}
                          height={120}
                          className="h-full w-full object-contain"
                          loading={active ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          isDark ? 'text-white/45' : 'text-gray-400'
                        }`}
                      >
                        {language === 'es' ? 'Abrir en el celu' : 'Open on phone'}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Edge next control */}
        {ads.length > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-11 flex items-center justify-center bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/10 dark:hover:bg-white/15 transition-colors border-l border-black/5 dark:border-white/10"
            aria-label={language === 'es' ? 'Siguiente oferta' : 'Next offer'}
          >
            <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* In-banner dots */}
        {ads.length > 1 && (
          <div className="absolute bottom-3 left-5 z-30 flex gap-1.5" role="tablist" aria-label="Partner ads">
            {ads.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={item.brand}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-6 bg-gray-900 dark:bg-white'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
