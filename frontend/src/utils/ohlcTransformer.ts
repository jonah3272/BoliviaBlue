/**
 * OHLC Data Transformer
 * 
 * Transforms historical rate data into OHLC (Open, High, Low, Close) format
 * for candlestick charts. Groups data points by time buckets (hour, day, etc.)
 * 
 * Usage:
 *   const ohlcData = transformToOHLC(rawData, 'hour');
 *   // Returns: [{ time: '2025-12-07T10:00:00', open: 9.51, high: 9.54, low: 9.50, close: 9.53 }, ...]
 */

export interface RateDataPoint {
  t: string; // ISO timestamp
  buy: number;
  sell: number;
  mid?: number;
}

export interface OHLCDataPoint {
  time: string; // ISO timestamp or date string
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TimeBucket = 'minute' | 'hour' | 'day' | 'week' | 'month';

/**
 * Groups data points by time bucket and calculates OHLC for each group
 * @param data - Array of rate data points with timestamps
 * @param bucket - Time bucket size ('minute', 'hour', 'day', etc.)
 * @param useMid - Whether to use mid price (default: true) or buy price (false)
 * @returns Array of OHLC data points
 */
export function transformToOHLC(
  data: RateDataPoint[],
  bucket: TimeBucket = 'hour',
  useMid: boolean = true
): OHLCDataPoint[] {
  if (data.length === 0) return [];

  // Group data points by time bucket
  const buckets = new Map<string, RateDataPoint[]>();

  data.forEach((point) => {
    const date = new Date(point.t);
    const bucketKey = getBucketKey(date, bucket);
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey)!.push(point);
  });

  // Calculate OHLC for each bucket
  const ohlcData: OHLCDataPoint[] = [];

  // Sort buckets by time
  const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );

  sortedBuckets.forEach(([bucketKey, points]) => {
    if (points.length === 0) return;

    // Sort points within bucket by timestamp
    points.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());

    // Get price value (mid or buy)
    const getPrice = (point: RateDataPoint) => {
      if (useMid && point.mid !== undefined && point.mid !== null) {
        return point.mid;
      }
      return point.buy;
    };

    // First point's price is Open
    const open = getPrice(points[0]);
    
    // Last point's price is Close
    const close = getPrice(points[points.length - 1]);
    
    // High and Low are the max/min prices in the bucket
    const prices = points.map(getPrice);
    const high = Math.max(...prices);
    const low = Math.min(...prices);

    ohlcData.push({
      time: bucketKey,
      open,
      high,
      low,
      close,
    });
  });

  return ohlcData;
}

/**
 * Gets a bucket key string for grouping data points
 * @param date - Date object
 * @param bucket - Time bucket size
 * @returns Bucket key string (ISO format)
 */
function getBucketKey(date: Date, bucket: TimeBucket): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  switch (bucket) {
    case 'minute':
      return `${year}-${month}-${day}T${hour}:${minute}:00`;
    case 'hour':
      return `${year}-${month}-${day}T${hour}:00:00`;
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week':
      // Get Monday of the week
      const monday = new Date(date);
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      monday.setDate(diff);
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    case 'month':
      return `${year}-${month}-01`;
    default:
      return `${year}-${month}-${day}T${hour}:00:00`;
  }
}

/**
 * Converts OHLC data to TradingView Lightweight Charts format
 * @param ohlcData - Array of OHLC data points
 * @returns Array formatted for TradingView charts (with time as Unix timestamp)
 */
export function convertToTradingViewFormat(ohlcData: OHLCDataPoint[]): Array<{
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}> {
  return ohlcData.map((point) => ({
    time: new Date(point.time).getTime() / 1000, // Convert to Unix timestamp
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
  }));
}

