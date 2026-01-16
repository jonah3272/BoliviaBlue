import { useState, useEffect, useCallback } from 'react';
import { getMessages, getLatestMessages } from '../utils/chatApi';

/**
 * Hook to fetch and manage chat messages
 */
export function useChatMessages(filters = {}, autoRefresh = false) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMessages(filters);
      setMessages(result.messages);
      setHasMore(result.has_more);
      if (result.messages.length > 0) {
        setLastTimestamp(result.messages[0].created_at);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const fetchLatest = useCallback(async () => {
    if (!lastTimestamp) return;

    try {
      const result = await getLatestMessages(lastTimestamp);
      if (result.messages.length > 0) {
        setMessages(prev => [...result.messages, ...prev]);
        setLastTimestamp(result.latest_timestamp);
        return result.messages;
      }
    } catch (err) {
      console.error('Failed to fetch latest messages:', err);
    }
    return [];
  }, [lastTimestamp]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh for new messages
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLatest();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLatest]);

  // Optimistic update function - handles nested messages (replies)
  const updateMessageOptimistically = useCallback((messageId, updates) => {
    setMessages(prev => prev.map(msg => {
      // Check if this is the message to update
      if (msg.id === messageId) {
        // If updating replies, merge with existing replies
        if (updates.replies !== undefined) {
          return { ...msg, ...updates, replies: updates.replies };
        }
        return { ...msg, ...updates };
      }
      // Check if any reply matches (for updating replies themselves)
      if (msg.replies && msg.replies.length > 0) {
        const updatedReplies = msg.replies.map(reply => 
          reply.id === messageId ? { ...reply, ...updates } : reply
        );
        // Check if replies actually changed
        const repliesChanged = updatedReplies.some((reply, idx) => {
          const oldReply = msg.replies[idx];
          return !oldReply || reply.id !== oldReply.id || JSON.stringify(reply) !== JSON.stringify(oldReply);
        });
        if (repliesChanged) {
          return { ...msg, replies: updatedReplies };
        }
      }
      return msg;
    }));
  }, []);

  return {
    messages,
    setMessages,
    loading,
    error,
    hasMore,
    refresh: fetchMessages,
    fetchLatest,
    updateMessageOptimistically
  };
}
