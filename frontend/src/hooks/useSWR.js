import useSWR from 'swr';
import { fetchBlueRate, fetchBlueHistory, fetchNews, fetchTweets } from '../utils/api';

/**
 * SWR Hook for Blue Rate Data
 * Auto-refreshes every 15 minutes, dedupes requests, caches responses
 */
export function useBlueRate() {
  const { data, error, isLoading, mutate } = useSWR(
    'blue-rate',
    fetchBlueRate,
    {
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      fallbackData: null
    }
  );

  return {
    rateData: data,
    isLoading,
    error,
    refetch: mutate
  };
}

/**
 * SWR Hook for Blue Rate History
 */
export function useBlueHistory(range = '1W') {
  const { data, error, isLoading } = useSWR(
    ['blue-history', range],
    () => fetchBlueHistory(range),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );

  return {
    historyData: data,
    isLoading,
    error
  };
}

/**
 * SWR Hook for News
 */
export function useNews(category = null, limit = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    ['news', category, limit],
    () => fetchNews(category, limit),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
      dedupingInterval: 30000
    }
  );

  return {
    news: data || [],
    isLoading,
    error,
    refetch: mutate
  };
}

/**
 * SWR Hook for Tweets
 */
export function useTweets(limit = 20) {
  const { data, error, isLoading } = useSWR(
    ['tweets', limit],
    () => fetchTweets(limit),
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes (tweets are more real-time)
      revalidateOnFocus: true,
      dedupingInterval: 30000
    }
  );

  return {
    tweets: data || [],
    isLoading,
    error
  };
}

