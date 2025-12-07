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
  official_buy?: number;
  official_sell?: number;
}

export interface TimeValuePoint {
  time: string; // ISO timestamp
  value: number;
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

  // For most timeframes, use data directly (already 1 point per time unit)
  // Only resample if needed for very large datasets
  const shouldResample = data.length > 1000 && (timeframe === 'ALL' || timeframe === '1Y');
  
  if (shouldResample) {
    // Resample data to reduce points for better performance
    const step = Math.ceil(data.length / 1000);
    const resampled = data.filter((_, index) => index % step === 0 || index === data.length - 1);
    
    return {
      buyData: resampled.map(point => ({
        time: point.t,
        value: showOfficial ? (point.official_buy || point.buy || 0) : (point.buy || 0),
      })),
      sellData: resampled.map(point => ({
        time: point.t,
        value: showOfficial ? (point.official_sell || point.sell || 0) : (point.sell || 0),
      })),
    };
  }

  // Use data directly
  return {
    buyData: data.map(point => ({
      time: point.t,
      value: showOfficial ? (point.official_buy || point.buy || 0) : (point.buy || 0),
    })).filter(point => point.value > 0), // Filter out invalid data
    sellData: data.map(point => ({
      time: point.t,
      value: showOfficial ? (point.official_sell || point.sell || 0) : (point.sell || 0),
    })).filter(point => point.value > 0), // Filter out invalid data
  };
}

