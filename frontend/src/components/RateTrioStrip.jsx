/**
 * Parallel vs card vs BCB — surfaces when paying by card beats cash (or the reverse).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRate } from '../utils/formatters';
import { fetchCardRates } from '../utils/api';

function cardBobPerUsd(row) {
  if (!row) return null;
  const n =
    row.visa_bob_per_usd ??
    row.mastercard_bob_per_usd ??
    row.amex_bob_per_usd ??
    null;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function RateTrioStrip({
  buy,
  sell,
  officialBuy,
  officialSell,
  language = 'es',
  updatedAt = null,
  cardRate: cardRateProp = null,
}) {
  const es = language === 'es';
  const [fetchedCard, setFetchedCard] = useState(null);

  useEffect(() => {
    if (cardRateProp != null) return undefined;
    let cancelled = false;
    fetchCardRates()
      .then((row) => {
        if (!cancelled) setFetchedCard(cardBobPerUsd(row));
      })
      .catch(() => {
        if (!cancelled) setFetchedCard(null);
      });
    return () => {
      cancelled = true;
    };
  }, [cardRateProp]);

  const blueMid =
    Number.isFinite(buy) && Number.isFinite(sell) ? (buy + sell) / 2 : Number.isFinite(buy) ? buy : null;
  const bcbMid =
    Number.isFinite(officialBuy) && Number.isFinite(officialSell)
      ? (officialBuy + officialSell) / 2
      : Number.isFinite(officialBuy)
        ? officialBuy
        : null;
  const cardRate =
    Number.isFinite(cardRateProp) && cardRateProp > 0
      ? cardRateProp
      : fetchedCard;

  // Higher Bs per USD ⇒ foreign USD card spends fewer dollars on the same BOB price.
  const cardVsBluePct =
    cardRate != null && blueMid != null && blueMid > 0
      ? ((cardRate - blueMid) / blueMid) * 100
      : null;
  const bcbVsBluePct =
    bcbMid != null && blueMid != null && blueMid > 0
      ? ((bcbMid - blueMid) / blueMid) * 100
      : null;

  const arb = (() => {
    if (cardVsBluePct == null) return null;
    const abs = Math.abs(cardVsBluePct).toFixed(1);
    if (cardVsBluePct >= 0.3) {
      return {
        tone: 'card',
        title: es ? 'Hoy conviene más la tarjeta' : 'Card wins today',
        body: es
          ? `La tarjeta rinde ~${abs}% más Bs por dólar que el cash blue (${formatRate(cardRate)} vs ${formatRate(blueMid)}). Si pagas en comercios con tarjeta en USD, suele salir mejor que cambiar billetes al paralelo.`
          : `Card yields ~${abs}% more Bs per dollar than cash blue (${formatRate(cardRate)} vs ${formatRate(blueMid)}). Paying by USD card in shops often beats changing cash at the parallel rate.`,
      };
    }
    if (cardVsBluePct <= -0.3) {
      return {
        tone: 'cash',
        title: es ? 'Hoy el cash blue está más caro' : 'Cash blue is richer today',
        body: es
          ? `El paralelo está ~${abs}% por encima de la tarjeta. Cambiar billetes al blue te da más Bs por USD que la tasa de tarjeta (revisa comisiones FX de tu emisor).`
          : `Parallel is ~${abs}% above card. Cash blue pays more Bs per USD than card (check your issuer FX fees).`,
      };
    }
    return {
      tone: 'flat',
      title: es ? 'Tarjeta y paralelo casi empatados' : 'Card and parallel nearly tied',
      body: es
        ? 'La brecha es chica. Gana el canal más cómodo — y ojo a la comisión FX de tu banco (0–3%).'
        : 'The gap is small. Pick whichever is easier — and watch issuer FX fees (0–3%).',
    };
  })();

  const cells = [
    {
      key: 'blue',
      label: es ? 'Paralelo (cash blue)' : 'Parallel (cash blue)',
      value: blueMid,
      sub:
        Number.isFinite(buy) && Number.isFinite(sell)
          ? `${es ? 'Compra' : 'Buy'} ${formatRate(buy)} · ${es ? 'Venta' : 'Sell'} ${formatRate(sell)}`
          : null,
      accent: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40',
      valueClass: 'text-blue-700 dark:text-blue-300',
    },
    {
      key: 'card',
      label: es ? 'Tarjeta (USD→BOB)' : 'Card (USD→BOB)',
      value: cardRate,
      sub: es
        ? 'Estimación red / Wise · sin comisión FX del emisor'
        : 'Network / Wise estimate · before issuer FX fee',
      accent: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40',
      valueClass: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      key: 'bcb',
      label: es ? 'BCB (oficial)' : 'BCB (official)',
      value: bcbMid,
      sub: es ? 'Referencia Banco Central' : 'Central Bank reference',
      accent: 'border-gray-400 bg-gray-50 dark:bg-gray-800/60',
      valueClass: 'text-gray-800 dark:text-gray-100',
    },
  ];

  const arbTone =
    arb?.tone === 'card'
      ? 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-800 dark:bg-emerald-950/50'
      : arb?.tone === 'cash'
        ? 'border-blue-300 bg-blue-50/90 dark:border-blue-800 dark:bg-blue-950/50'
        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm"
      aria-label={es ? 'Paralelo vs tarjeta vs oficial' : 'Parallel vs card vs official'}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {es ? '¿Tarjeta o cash?' : 'Card or cash?'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            {es
              ? 'Tres precios del dólar: paralelo (billetes), tarjeta USD→BOB, y BCB. La brecha es la oportunidad.'
              : 'Three dollar prices: parallel cash, USD→BOB card, and BCB. The gap is the opportunity.'}
          </p>
        </div>
        {cardVsBluePct != null && (
          <div className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {es ? 'Tarjeta vs blue' : 'Card vs blue'}:{' '}
            <span
              className={
                cardVsBluePct >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-blue-600 dark:text-blue-400'
              }
            >
              {cardVsBluePct >= 0 ? '+' : ''}
              {cardVsBluePct.toFixed(1)}%
            </span>
            {bcbVsBluePct != null && (
              <span className="text-gray-400 dark:text-gray-500 ml-2">
                · BCB {bcbVsBluePct >= 0 ? '+' : ''}
                {bcbVsBluePct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {arb && (
        <div className={`mb-4 rounded-xl border px-4 py-3 ${arbTone}`}>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{arb.title}</p>
          <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-snug">
            {arb.body}{' '}
            <Link
              to="/"
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              onClick={(e) => {
                window.dispatchEvent(new CustomEvent('bolivia-blue:set-rate-mode', { detail: 'card' }));
                const el = document.querySelector('[data-rate-mode-tabs]');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              {es ? 'Probar con tu comisión FX →' : 'Try with your FX fee →'}
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cells.map((c) => (
          <div key={c.key} className={`rounded-xl border-l-4 ${c.accent} px-4 py-3`}>
            <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
              {c.label}
            </div>
            <div className={`mt-1 font-mono text-3xl font-bold tabular-nums ${c.valueClass}`}>
              {c.value != null ? formatRate(c.value) : '—'}
              <span className="text-sm font-semibold ml-1 opacity-70">Bs</span>
            </div>
            {c.sub && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-snug">{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {updatedAt && (
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-500">
          {es ? 'Lectura paralelo' : 'Parallel reading'}:{' '}
          {new Date(updatedAt).toLocaleString(es ? 'es-BO' : 'en-US')}
        </p>
      )}
    </section>
  );
}
