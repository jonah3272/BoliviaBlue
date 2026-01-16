import { useState } from 'react';
import { createMessage, toggleLike, flagMessage } from '../utils/chatApi';
import { sanitizeContent, validateContent } from '../utils/contentSanitizer';

/**
 * Hook for chat actions (post, like, flag)
 */
export function useChatActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postMessage = async (content, category, locationHint, parentId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Validate
      const validation = validateContent(content);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Sanitize
      const sanitized = sanitizeContent(content);

      const result = await createMessage(sanitized, category, locationHint, parentId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const likeMessage = async (messageId, action = 'like') => {
    try {
      // Don't set loading for likes - we want instant feedback
      setError(null);
      const result = await toggleLike(messageId, action);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const flagMessageForModeration = async (messageId, reason = 'other') => {
    try {
      setLoading(true);
      setError(null);
      const result = await flagMessage(messageId, reason);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    postMessage,
    likeMessage,
    flagMessage: flagMessageForModeration,
    loading,
    error
  };
}
