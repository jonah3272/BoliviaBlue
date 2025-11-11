/**
 * Calculate the median of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number|null} The median value or null if array is empty
 */
export function median(values) {
  if (!values || values.length === 0) {
    return null;
  }

  // Filter to finite numbers only
  const finiteValues = values.filter(v => Number.isFinite(v));
  
  if (finiteValues.length === 0) {
    return null;
  }

  // Sort numerically
  const sorted = finiteValues.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  // If odd length, return middle element
  // If even length, return average of two middle elements
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  } else {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
}

