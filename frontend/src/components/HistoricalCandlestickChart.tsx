/**
 * Historical Candlestick Chart Component
 * 
 * Professional candlestick chart using TradingView Lightweight Charts
 * for displaying OHLC (Open, High, Low, Close) price data.
 * 
 * Usage:
 *   <HistoricalCandlestickChart
 *     data={ohlcData}
 *     height={400}
 *     timeframe="1D"
 *   />
 * 
 * Data Format:
 *   data should be an array of OHLC objects:
 *   [
 *     { time: '2025-12-07T10:00:00', open: 9.51, high: 9.54, low: 9.50, close: 9.53 },
 *     ...
 *   ]
 * 
 * The component automatically:
 * - Converts time strings to Unix timestamps
 * - Handles window resizing
 * - Applies dark theme styling
 * - Shows tooltip with OHLC values on hover
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { OHLCDataPoint, convertToTradingViewFormat } from '../utils/ohlcTransformer';

export interface HistoricalCandlestickChartProps {
  /** Array of OHLC data points */
  data: OHLCDataPoint[];
  /** Chart height in pixels */
  height?: number;
  /** Chart width (defaults to 100% of container) */
  width?: number;
  /** Timeframe label for display (e.g., "1D", "1W") */
  timeframe?: string;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Optional className for the container */
  className?: string;
}

export default function HistoricalCandlestickChart({
  data,
  height = 400,
  width,
  timeframe,
  isLoading = false,
  className = '',
}: HistoricalCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

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
        },
        horzLines: {
          color: '#374151',
          style: 1,
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
    });

    // Add candlestick series
    // In lightweight-charts v5, use addSeries with CandlestickSeries definition
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981', // green-500
      downColor: '#EF4444', // red-500
      borderVisible: true,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
      borderUpColor: '#059669', // green-600
      borderDownColor: '#DC2626', // red-600
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

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

      const data = param.seriesData.get(candlestickSeries);
      if (data && 'open' in data) {
        const candleData = data as CandlestickData;
        const timestamp = (candleData.time as number) * 1000;
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
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
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

  // Update chart data when data prop changes
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;

    // Convert data to TradingView format
    const chartData = convertToTradingViewFormat(data);
    
    // Set data
    seriesRef.current.setData(chartData as any);

    // Fit content to show all data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
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
            maxWidth: '200px',
          }}
        >
          <div className="text-xs text-gray-400 mb-2 font-medium">{tooltipData.time}</div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Open:</span>
              <span className="font-mono font-semibold text-gray-200">{tooltipData.open.toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">High:</span>
              <span className="font-mono font-semibold text-green-400">{tooltipData.high.toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Low:</span>
              <span className="font-mono font-semibold text-red-400">{tooltipData.low.toFixed(2)} Bs</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Close:</span>
              <span className="font-mono font-semibold text-gray-200">{tooltipData.close.toFixed(2)} Bs</span>
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

