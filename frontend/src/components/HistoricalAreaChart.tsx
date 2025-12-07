/**
 * Historical Area Chart Component
 * 
 * Professional dual area/line chart using TradingView Lightweight Charts
 * for displaying Buy and Sell price series over time.
 * 
 * Usage:
 *   <HistoricalAreaChart
 *     buyData={buyDataArray}
 *     sellData={sellDataArray}
 *     height={400}
 *     timeframe="1D"
 *   />
 * 
 * Data Format:
 *   buyData and sellData should be arrays of time-value pairs:
 *   [
 *     { time: '2025-12-07T10:00:00', value: 9.51 },
 *     { time: '2025-12-07T11:00:00', value: 9.52 },
 *     ...
 *   ]
 * 
 * The component automatically:
 * - Converts time strings to Unix timestamps
 * - Handles window resizing with ResizeObserver
 * - Applies dark theme styling
 * - Shows tooltip with Buy, Sell, and spread percentage on hover
 * - Uses two area series with subtle gradients for professional look
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';

export interface TimeValuePoint {
  time: string | number; // ISO string or Unix timestamp
  value: number;
}

export interface HistoricalAreaChartProps {
  /** Array of Buy price data points */
  buyData: TimeValuePoint[];
  /** Array of Sell price data points */
  sellData: TimeValuePoint[];
  /** Chart height in pixels */
  height?: number;
  /** Chart width (defaults to 100% of container) */
  width?: number;
  /** Timeframe label for display (e.g., "1D", "1W", "ALL") */
  timeframe?: string;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className for the container */
  className?: string;
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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    time: string;
    buy: number;
    sell: number;
    spread: number;
    spreadPercent: number;
  } | null>(null);

  // Convert time string to Unix timestamp
  const timeToUnix = (time: string | number): number => {
    if (typeof time === 'number') return time;
    return Math.floor(new Date(time).getTime() / 1000);
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1F2937' }, // dark:bg-gray-800
        textColor: '#D1D5DB', // dark:text-gray-300
      },
      grid: {
        vertLines: {
          color: '#374151', // dark:border-gray-700
          style: 1, // Solid
          visible: true,
        },
        horzLines: {
          color: '#374151',
          style: 1,
          visible: true,
        },
      },
      width: width || chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#4B5563', // dark:border-gray-600
        // Better time formatting based on timeframe
        ...(timeframe === '1D' || timeframe === '1W' 
          ? { 
              tickMarkFormatter: (time: number) => {
                const date = new Date(time * 1000);
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              }
            }
          : {
              tickMarkFormatter: (time: number) => {
                const date = new Date(time * 1000);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }
        ),
      },
      rightPriceScale: {
        borderColor: '#4B5563',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      localization: {
        priceFormatter: (price: number) => price.toFixed(2) + ' Bs',
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: '#6B7280',
          width: 1,
          style: 2, // Dashed
        },
        horzLine: {
          color: '#6B7280',
          width: 1,
          style: 2, // Dashed
        },
      },
    });

    // Add Buy area series (green)
    const buySeries = chart.addSeries(AreaSeries, {
      lineColor: '#10B981', // green-500
      topColor: 'rgba(16, 185, 129, 0.3)', // green-500 with opacity
      bottomColor: 'rgba(16, 185, 129, 0.05)', // green-500 with low opacity
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    // Add Sell area series (red)
    const sellSeries = chart.addSeries(AreaSeries, {
      lineColor: '#EF4444', // red-500
      topColor: 'rgba(239, 68, 68, 0.3)', // red-500 with opacity
      bottomColor: 'rgba(239, 68, 68, 0.05)', // red-500 with low opacity
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });

    chartRef.current = chart;
    buySeriesRef.current = buySeries;
    sellSeriesRef.current = sellSeries;

    // Handle resize with ResizeObserver for better container tracking
    let handleResize: (() => void) | null = null;
    
    if (chartContainerRef.current && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (chartRef.current && entry.target === chartContainerRef.current) {
            const { width: containerWidth, height: containerHeight } = entry.contentRect;
            chartRef.current.applyOptions({
              width: width || containerWidth,
              height: height || containerHeight,
            });
          }
        }
      });
      resizeObserverRef.current.observe(chartContainerRef.current);
    } else {
      // Fallback to window resize for older browsers
      handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: width || chartContainerRef.current.clientWidth,
            height: height,
          });
        }
      };
      window.addEventListener('resize', handleResize);
    }

    // Handle crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (param.point === undefined || !param.time || param.point.x < 0 || param.point.x > chartContainerRef.current!.clientWidth || param.point.y < 0 || param.point.y > chartContainerRef.current!.clientHeight) {
        setTooltipData(null);
        return;
      }

      const buyDataPoint = param.seriesData.get(buySeries);
      const sellDataPoint = param.seriesData.get(sellSeries);
      
      if (buyDataPoint && sellDataPoint && 'value' in buyDataPoint && 'value' in sellDataPoint) {
        const buy = buyDataPoint.value as number;
        const sell = sellDataPoint.value as number;
        const spread = buy - sell;
        const spreadPercent = (spread / sell) * 100;
        
        const timestamp = (param.time as number) * 1000;
        const date = new Date(timestamp);
        
        // Format time based on timeframe
        let timeString: string;
        if (timeframe === '1D' || timeframe === '1W') {
          timeString = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        } else {
          timeString = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        
        setTooltipData({
          time: timeString,
          buy,
          sell,
          spread,
          spreadPercent,
        });
      } else {
        setTooltipData(null);
      }
    });

    return () => {
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
        resizeObserverRef.current.disconnect();
      }
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      chart.remove();
    };
  }, [height, width, timeframe]);

  // Update chart data when data props change
  useEffect(() => {
    if (!buySeriesRef.current || !sellSeriesRef.current) return;

    // Convert and set buy data
    if (buyData && buyData.length > 0) {
      const buyChartData = buyData.map(point => ({
        time: timeToUnix(point.time) as Time,
        value: point.value,
      }));
      buySeriesRef.current.setData(buyChartData);
    }

    // Convert and set sell data
    if (sellData && sellData.length > 0) {
      const sellChartData = sellData.map(point => ({
        time: timeToUnix(point.time) as Time,
        value: point.value,
      }));
      sellSeriesRef.current.setData(sellChartData);
    }

    // Fit content to show all data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [buyData, sellData]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  if ((!buyData || buyData.length === 0) && (!sellData || sellData.length === 0)) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-400">No chart data available</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip - positioned on left to avoid y-axis labels */}
      {tooltipData && (
        <div 
          className="absolute z-10 bg-gray-800 border-2 border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            top: '8px',
            left: '8px',
            maxWidth: '220px',
          }}
        >
          <div className="text-xs text-gray-400 mb-2 font-medium">{tooltipData.time}</div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Buy:</span>
              <span className="font-mono font-semibold text-green-400">{tooltipData.buy.toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Sell:</span>
              <span className="font-mono font-semibold text-red-400">{tooltipData.sell.toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-700">
              <span className="text-gray-300">Spread:</span>
              <span className="font-mono font-semibold text-gray-200">
                {tooltipData.spread.toFixed(2)} Bs ({tooltipData.spreadPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Chart container */}
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ width: width || '100%', height, minHeight: height }} 
      />
    </div>
  );
}

