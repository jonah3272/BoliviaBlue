import { useState, useEffect } from 'react';
import { initializeSession } from '../utils/chatApi';

/**
 * Hook to manage anonymous session
 */
export function useAnonymousSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true);
        const data = await initializeSession();
        setSession(data);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        // More detailed error logging
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Connection failed. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  return { session, loading, error };
}
