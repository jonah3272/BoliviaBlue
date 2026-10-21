/**
 * P2P midpoint vs card estimate vs BCB reference; these are not cash-counter quotes.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCardRates } from '../utils/api';
import { formatRate } from '../utils/formatters';
import { officialRateModel } from '../utils/officialRate';
import OfficialRateNote from './OfficialRateNote';
import useCardFee from '../hooks/useCardFee';
import { paymentComparison } from '../utils/paymentComparison';

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
  officialMid,
  officialObservation,
  language = 'es',
  updatedAt = null,
  cardRate: cardRateProp = null,
  cardUpdatedAt = null,
}) {
  const es = language === 'es';
  const [fetchedCard, setFetchedCard] = useState(null);
  const [feeId, setFeeId] = useCardFee();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    if (cardRateProp != null) return undefined;
    let cancelled = false;
    const refresh = () => fetchCardRates()
      .then((row) => {
        if (!cancelled) setFetchedCard(row);
      })
      .catch(() => {
        if (!cancelled) setFetchedCard(null);
      });
    refresh();
    const refreshTimer = setInterval(refresh, 60000);
    return () => {
      clearInterval(refreshTimer);
      cancelled = true;
    };
  }, [cardRateProp]);

  const blueMid =
    Number.isFinite(buy) && Number.isFinite(sell) ? (buy + sell) / 2 : Number.isFinite(buy) ? buy : null;
  const official = officialRateModel({
    official_buy: officialBuy, official_sell: officialSell, official_mid: officialMid,
    official_observation: officialObservation,
  }, language);
  const bcbMid = official.official_mid;
  const cardRate =
    Number.isFinite(cardRateProp) && cardRateProp > 0
      ? cardRateProp
      : cardBobPerUsd(fetchedCard);
  const fee = Number(feeId) / 100;
  const comparison = paymentComparison({ blue: blueMid, card: cardRate, fee, blueAt: updatedAt, cardAt: cardRateProp != null ? cardUpdatedAt : fetchedCard?.t, now });
  const effectiveCard = comparison.effective;

  // Higher Bs per USD ⇒ foreign USD card spends fewer dollars on the same BOB price.
  const cardVsBluePct =
    effectiveCard != null && blueMid != null && blueMid > 0
      ? ((effectiveCard - blueMid) / blueMid) * 100
      : null;
  const bcbVsBluePct =
    bcbMid != null && blueMid != null && blueMid > 0
      ? ((bcbMid - blueMid) / blueMid) * 100
      : null;

  const cells = [
    {
      key: 'blue',
      label: es ? 'Dólar blue / digital' : 'Blue / digital dollar',
      note: es ? 'Referencia USDT. Lo que te ofrecen por efectivo puede ser distinto.' : 'USDT reference. Your cash exchange offer may differ.',
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
      label: es ? 'Tarjeta: tasa estimada' : 'Estimated card rate',
      note: es ? 'Tu banco puede aplicar otra tasa y comisiones.' : 'Your bank’s final rate and fees may differ.',
      value: effectiveCard,
      sub: es
        ? `Estimación red / Wise · comisión FX del ${feeId}% incluida`
        : `Network / Wise estimate · ${feeId}% FX fee included`,
      accent: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40',
      valueClass: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      key: 'bcb',
      label: es ? 'Referencia del BCB' : 'BCB reference',
      note: es ? 'Referencia del Banco Central; no garantiza la tasa de tu tarjeta.' : 'Central bank reference, not a guaranteed card rate.',
      value: bcbMid,
      sub: <OfficialRateNote rate={official} language={language} />,
      accent: 'border-gray-400 bg-gray-50 dark:bg-gray-800/60',
      valueClass: 'text-gray-800 dark:text-gray-100',
    },
  ];

  const headerBlock = (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {es ? '¿Efectivo o tarjeta: qué sale más barato?' : 'Cash or card: which costs less?'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
          {es
            ? 'Para el mismo precio en bolivianos, más Bs por dólar significa gastar menos dólares. Compará tu oferta de cambio de efectivo con la tasa de tu tarjeta, incluyendo comisiones.'
            : 'For the same price in bolivianos, more Bs per dollar means spending fewer dollars. Compare your cash exchange offer with your card’s rate, including fees.'}
        </p>
      </div>
    </div>
  );

  const bodyBlock = (
    <>
      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40 px-4 py-3">
        <div aria-live="polite" data-daily-payment-result>
          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {comparison.status === 'cash' ? (es ? `Hoy, efectivo al blue costaría ${comparison.savings.toFixed(1)}% menos que tarjeta` : `Today, cash at the blue rate would cost ${comparison.savings.toFixed(1)}% less than card`)
              : comparison.status === 'card' ? (es ? `Hoy, tarjeta costaría ${comparison.savings.toFixed(1)}% menos que efectivo al blue` : `Today, card would cost ${comparison.savings.toFixed(1)}% less than cash at the blue rate`)
              : comparison.status === 'tie' ? (es ? 'Hoy, efectivo al blue y tarjeta cuestan prácticamente lo mismo' : 'Today, cash at the blue rate and card cost about the same')
              : comparison.status === 'stale' ? (es ? 'Datos desactualizados: no hay recomendación para hoy' : 'Rates need updating: no recommendation for today')
              : (es ? 'Faltan tasas para comparar hoy' : 'Rates unavailable for today’s comparison')}
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            {es ? 'Estimación para el mismo gasto en Bs, suponiendo que recibís la referencia blue en efectivo, neta de cargos. El blue es USDT P2P, no una oferta de billetes. Confirmá tu cambio real.' : 'Estimate for the same Bs purchase, assuming your cash exchange matches the blue reference after cash fees. Blue is USDT P2P, not a banknote offer. Check your actual cash quote.'}
          </p>
          {['cash', 'card', 'tie'].includes(comparison.status) && <p className="mt-2 text-sm font-mono">
            {es ? 'Efectivo supuesto' : 'Assumed cash'}: {formatRate(blueMid)} Bs/USD · {es ? 'Tarjeta neta' : 'Card after fee'}: {formatRate(effectiveCard)} Bs/USD
          </p>}
        </div>
        <label className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {es ? 'Tu comisión FX de tarjeta' : 'Your card’s FX fee'}
          <select value={feeId} onChange={e => setFeeId(e.target.value)} className="rounded border border-gray-300 bg-white dark:bg-gray-800 p-2">
            <option value="0">0%</option><option value="2.7">2.7%</option><option value="3">3%</option>
          </select>
        </label>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{es ? '0% es el supuesto inicial, no la comisión verificada de tu banco. Cambialo para recalcular.' : '0% is the starting assumption, not your bank’s verified fee. Change it to recalculate.'}</p>
        <Link
          to="/"
          className="mt-3 inline-block text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          onClick={(e) => {
            window.dispatchEvent(new CustomEvent('bolivia-blue:set-rate-mode', { detail: 'card' }));
            const el = document.querySelector('[data-rate-mode-tabs]');
            if (el) {
              e.preventDefault();
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        >
          {es ? 'Revisar mi comisión de tarjeta →' : 'Check my card fee →'}
        </Link>
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 md:mx-0 md:px-0 hide-scrollbar">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`snap-center shrink-0 w-[82%] sm:w-[70%] md:w-auto md:shrink rounded-xl border-l-4 ${c.accent} px-4 py-3`}
          >
            <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
              {c.label}
            </div>
            <div className={`mt-1 font-mono text-3xl font-bold tabular-nums ${c.valueClass}`}>
              {c.value != null ? formatRate(c.value) : '—'}
              <span className="text-sm font-semibold ml-1 opacity-70">{c.key === 'blue' ? 'Bs/USDT' : 'Bs/USD'}</span>
            </div>
            <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">{c.note}</p>
            {c.sub && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-snug">{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {official.available && !official.stale && bcbMid > 0 && blueMid > 0 && ['cash', 'card', 'tie'].includes(comparison.status) && (
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          {es ? 'Si tu banco usa BCB: ' : 'If your bank uses BCB: '}
          {formatRate(bcbMid / (1 + fee))} Bs/USD {es ? `tras ${feeId}% de comisión FX` : `after a ${feeId}% FX fee`}.
          {' '}{es ? 'Es un escenario de referencia, no la tasa confirmada de tu tarjeta.' : 'This is a benchmark scenario, not your confirmed card rate.'}
        </p>
      )}

      <details className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <summary className="cursor-pointer font-semibold">{es ? 'Ver comparación de referencias' : 'View reference comparison'}</summary>
        <p className="mt-2 mb-2">{es
          ? 'El blue mostrado es el punto medio P2P de USDT, no una cotización de billetes. Esta diferencia de tasas no es el porcentaje de ahorro en dólares mostrado arriba.'
          : 'The blue rate shown is the USDT P2P midpoint, not a banknote quote. This rate difference is not the USD-cost savings percentage shown above.'}</p>
        {cardVsBluePct != null && (
          <div className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {es ? 'Tarjeta vs P2P' : 'Card vs P2P'}:{' '}
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
      </details>

      {updatedAt && (
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-500">
          {es ? 'Lectura P2P' : 'P2P observation'}:{' '}
          {new Date(updatedAt).toLocaleString(es ? 'es-BO' : 'en-US', { timeZone: 'America/La_Paz' })}
          {es ? ' (hora de Bolivia)' : ' (Bolivia time)'}
        </p>
      )}
    </>
  );

  return (
    <section
      className="rounded-2xl border-2 border-emerald-200/80 dark:border-emerald-800/50 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm ring-1 ring-emerald-500/10"
      aria-label={es ? 'Comparar efectivo y tarjeta' : 'Compare cash and card'}
    >
      {headerBlock}
      {bodyBlock}
      <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label={es ? 'Contexto de las referencias' : 'Reference context'}>
        <Link to={es ? '/guia-dinero-bolivia' : '/bolivia-money-guide'} className="text-blue-600 dark:text-blue-400 underline">{es ? 'Guía de dinero para viajeros' : 'Traveler money guide'}</Link>
        <Link to={`/fuente-de-datos${es ? '' : '?lang=en'}`} className="text-blue-600 dark:text-blue-400 underline">{es ? 'Cómo se calcula la referencia P2P' : 'How the P2P reference is calculated'}</Link>
      </nav>
    </section>
  );
}
