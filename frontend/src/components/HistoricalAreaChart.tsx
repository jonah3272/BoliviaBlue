/**
 * Dual buy/sell area chart (TradingView Lightweight Charts).
 * Uses real UTC timestamps (local labels via tickMarkFormatter) and dedupes
 * same-second points so setData never throws.
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time, UTCTimestamp } from 'lightweight-charts';

export interface TimeValuePoint {
  time: string | number;
  value: number;
}

export interface HistoricalAreaChartProps {
  buyData: TimeValuePoint[];
  sellData: TimeValuePoint[];
  height?: number;
  width?: number;
  timeframe?: string;
  isLoading?: boolean;
  className?: string;
}

function toUnixSeconds(time: string | number): number {
  if (typeof time === 'number') return Math.floor(time);
  const ms = Date.parse(String(time));
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : NaN;
}

/** Dedupe by UTC second — Lightweight Charts rejects duplicate times. */
function toUniqueSeries(points: TimeValuePoint[] | undefined) {
  const byTime = new Map<number, number>();
  for (const point of points || []) {
    if (!Number.isFinite(point.value) || point.value <= 0) continue;
    const t = toUnixSeconds(point.time);
    if (!Number.isFinite(t)) continue;
    byTime.set(t, point.value);
  }
  return [...byTime.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({ time: time as UTCTimestamp, value }));
}

function readIsDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function HistoricalAreaChart({
  buyData,
  sellData,
  height = 400,
  width,
  timeframe = '1D',
  isLoading = false,
  className = '',
}: HistoricalAreaChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const buySeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const sellSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const buyDataRef = useRef(buyData);
  const sellDataRef = useRef(sellData);
  buyDataRef.current = buyData;
  sellDataRef.current = sellData;

  const [tooltipData, setTooltipData] = useState<{
    time: string;
    buy: number;
    sell: number;
    spread: number;
    spreadPercent: number;
  } | null>(null);
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const applySeriesData = () => {
    if (!buySeriesRef.current || !sellSeriesRef.current || !chartRef.current) return;
    try {
      const buy = toUniqueSeries(buyDataRef.current);
      const sell = toUniqueSeries(sellDataRef.current);
      if (buy.length) buySeriesRef.current.setData(buy);
      if (sell.length) sellSeriesRef.current.setData(sell);
      // Refit both axes so 1D vs 1W vs 1M show that period's own movement
      chartRef.current.priceScale('right').applyOptions({ autoScale: true });
      chartRef.current.timeScale().fitContent();
    } catch (err) {
      console.error('[HistoricalAreaChart] setData failed:', err);
    }
  };

  // Keep the chart container mounted so init/resize always have a real node.
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const dark = readIsDark();
    const initialWidth = Math.max(width || el.clientWidth || el.parentElement?.clientWidth || 320, 1);

    const chart = createChart(el, {
      layout: {
        background: { color: dark ? '#1F2937' : '#FFFFFF' },
        textColor: dark ? '#D1D5DB' : '#374151',
      },
      grid: {
        vertLines: { color: dark ? '#374151' : '#E5E7EB', style: 1, visible: true },
        horzLines: { color: dark ? '#374151' : '#E5E7EB', style: 1, visible: true },
      },
      width: initialWidth,
      height,
      timeScale: {
        timeVisible: timeframe === '1D' || timeframe === '1W',
        secondsVisible: false,
        borderColor: dark ? '#4B5563' : '#D1D5DB',
        tickMarkFormatter: (time: Time) => {
          const date = new Date(Number(time) * 1000);
          if (timeframe === '1D') {
            return date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }
          if (timeframe === '1W') {
            return date.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }
          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        },
      },
      rightPriceScale: {
        borderColor: dark ? '#4B5563' : '#D1D5DB',
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      localization: {
        priceFormatter: (price: number) => `${price.toFixed(2)} Bs`,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#9CA3AF', width: 1, style: 2 },
        horzLine: { color: '#9CA3AF', width: 1, style: 2 },
      },
    });

    const buySeries = chart.addSeries(AreaSeries, {
      lineColor: '#10B981',
      topColor: 'rgba(16, 185, 129, 0.28)',
      bottomColor: 'rgba(16, 185, 129, 0.04)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    const sellSeries = chart.addSeries(AreaSeries, {
      lineColor: '#EF4444',
      topColor: 'rgba(239, 68, 68, 0.28)',
      bottomColor: 'rgba(239, 68, 68, 0.04)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    chartRef.current = chart;
    buySeriesRef.current = buySeries;
    sellSeriesRef.current = sellSeries;
    applySeriesData();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartRef.current) return;
      const nextWidth = Math.round(entry.contentRect.width);
      if (nextWidth < 2) return; // ignore collapsed/hidden layout frames
      chartRef.current.applyOptions({
        width: width || nextWidth,
        height,
      });
    });
    resizeObserver.observe(el);

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > el.clientWidth ||
        param.point.y < 0 ||
        param.point.y > el.clientHeight
      ) {
        setTooltipData(null);
        return;
      }

      const buyPoint = param.seriesData.get(buySeries);
      const sellPoint = param.seriesData.get(sellSeries);
      if (
        !buyPoint ||
        !sellPoint ||
        !('value' in buyPoint) ||
        !('value' in sellPoint)
      ) {
        setTooltipData(null);
        return;
      }

      const buy = buyPoint.value as number;
      const sell = sellPoint.value as number;
      const spread = buy - sell;
      const spreadPercent = sell ? (spread / sell) * 100 : 0;
      const date = new Date(Number(param.time) * 1000);
      const timeString =
        timeframe === '1D' || timeframe === '1W'
          ? date.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : date.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

      setTooltipData({ time: timeString, buy, sell, spread, spreadPercent });
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      buySeriesRef.current = null;
      sellSeriesRef.current = null;
    };
  }, [height, width, timeframe, isDark]);

  useEffect(() => {
    applySeriesData();
  }, [buyData, sellData]);

  const empty = (!buyData || buyData.length === 0) && (!sellData || sellData.length === 0);

  return (
    <div className={`relative ${className}`}>
      {(isLoading || empty) && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-sm"
          style={{ height }}
        >
          {isLoading ? 'Cargando datos...' : 'No chart data available'}
        </div>
      )}

      {tooltipData && (
        <div
          className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{ top: 8, left: 8, maxWidth: 220 }}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {tooltipData.time}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Compra</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-green-400">
                {tooltipData.buy.toFixed(2)} Bs
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Venta</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-red-400">
                {tooltipData.sell.toFixed(2)} Bs
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Spread</span>
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                {tooltipData.spread.toFixed(2)} Bs ({tooltipData.spreadPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        ref={chartContainerRef}
        className="w-full"
        style={{ width: width || '100%', height, minHeight: height }}
      />
    </div>
  );
}
