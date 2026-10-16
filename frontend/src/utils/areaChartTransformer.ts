/**
 * Area Chart Data Transformer
 * 
 * Transforms historical rate data into time-value pairs for area/line charts.
 * Handles data resampling and aggregation for different timeframes.
 * 
 * Usage:
 *   const { buyData, sellData } = transformToAreaChartData(rawData, '1D');
 */

export interface RateDataPoint {
  t: string; // ISO timestamp
  buy: number;
  sell: number;
  official_buy?: number | null;
  official_sell?: number | null;
}

export interface TimeValuePoint {
  time: string; // ISO timestamp
  value?: number;
}

export type Timeframe = '1D' | '1W' | '1M' | '1Y' | 'ALL';

/**
 * Transforms rate data into separate buy and sell arrays for area chart
 * @param data - Array of rate data points with timestamps
 * @param timeframe - Timeframe for data display
 * @param showOfficial - Whether to use official rates or blue market rates
 * @returns Object with buyData and sellData arrays
 */
export function transformToAreaChartData(
  data: RateDataPoint[],
  timeframe: Timeframe = '1D',
  showOfficial: boolean = false
): { buyData: TimeValuePoint[]; sellData: TimeValuePoint[] } {
  if (data.length === 0) {
    return { buyData: [], sellData: [] };
  }

  // Keep whitespace at missing official observations, including gap boundaries
  // during resampling. Never bridge a gap with a P2P or zero price.
  if (showOfficial) {
    const step = data.length > 1000 && (timeframe === 'ALL' || timeframe === '1Y') ? Math.ceil(data.length / 1000) : 1;
    const side = (key: 'official_buy' | 'official_sell'): TimeValuePoint[] => {
      const valid = (p: RateDataPoint) => typeof p?.[key] === 'number' && Number.isFinite(p[key]) && p[key]! > 0;
      if (!data.some(valid)) return [];
      return data.filter((point, index) => index % step === 0 || index === data.length - 1
        || valid(point) !== valid(data[index - 1]) || valid(point) !== valid(data[index + 1]))
        .map(point => valid(point) ? { time: point.t, value: point[key]! } : { time: point.t });
    };
    return { buyData: side('official_buy'), sellData: side('official_sell') };
  }

  // Preserve the existing P2P resampling policy.
  if (data.length > 1000 && (timeframe === 'ALL' || timeframe === '1Y')) {
    const step = Math.ceil(data.length / 1000);
    const resampled = data.filter((_, index) => index % step === 0 || index === data.length - 1);
    return {
      buyData: resampled.map(point => ({ time: point.t, value: point.buy || 0 })),
      sellData: resampled.map(point => ({ time: point.t, value: point.sell || 0 })),
    };
  }

  // Use data directly (dedupe identical second-level stamps for the chart lib)
  const buyData = data.map(point => ({
    time: point.t,
    value: point.buy || 0,
  })).filter(point => point.value > 0);

  const sellData = data.map(point => ({
    time: point.t,
    value: point.sell || 0,
  })).filter(point => point.value > 0);

  return { buyData, sellData };
}

