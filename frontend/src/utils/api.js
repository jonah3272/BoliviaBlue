// Use Railway backend URL in production, local proxy in development
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

/**
 * Fetch current blue market rate
 */
export async function fetchBlueRate() {
  const response = await fetch(`${API_BASE}/blue-rate`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch historical blue market rates
 * @param {string} range - Time range: 1D, 1W, 1M, 1Y, ALL
 */
export async function fetchBlueHistory(range = '1W') {
  const response = await fetch(`${API_BASE}/blue-history?range=${range}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch recent news headlines
 */
export async function fetchNews() {
  const response = await fetch(`${API_BASE}/news`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch health status
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

