import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import MessageFeed from '../components/chat/MessageFeed';
import MessageForm from '../components/chat/MessageForm';
import FilterBar from '../components/chat/FilterBar';
import { useAnonymousSession } from '../hooks/useAnonymousSession';
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatActions } from '../hooks/useChatActions';
import { getChatStats } from '../utils/chatApi';
import { useToast } from '../contexts/ToastContext';
import LazyErrorBoundary from '../components/LazyErrorBoundary';

export default function Chat() {
  const { language, t } = useLanguage() || { language: 'es', t: (key) => key };
  const toast = useToast();
  const { session, loading: sessionLoading } = useAnonymousSession();
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const chatMessages = useChatMessages(filters, true);
  const { messages, loading: messagesLoading, refresh, updateMessageOptimistically, setMessages } = chatMessages;
  const { postMessage, likeMessage, flagMessage, loading: actionsLoading, error } = useChatActions();

  useEffect(() => {
    // Load stats for filters
    getChatStats()
      .then(setStats)
      .catch(err => {
        console.error('Failed to load stats:', err);
        // Don't show error toast for stats - it's not critical
      });
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handlePostMessage = async (content, category, locationHint, parentId = null) => {
    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content,
      category: category || 'general',
      location_hint: locationHint,
      anonymous_username: session?.anonymous_username || 'Usuario...',
      likes: 0,
      reply_count: 0,
      has_user_liked: false,
      created_at: new Date().toISOString(),
      replies: [],
      is_optimistic: true
    };

    if (parentId) {
      // Add as reply optimistically
      const parentMessage = messages.find(m => m.id === parentId);
      if (parentMessage) {
        updateMessageOptimistically(parentId, {
          replies: [...(parentMessage.replies || []), optimisticMessage],
          reply_count: (parentMessage.reply_count || 0) + 1
        });
      }
    } else {
      // Add as new top-level message at the beginning
      setMessages(prev => [optimisticMessage, ...prev]);
    }

    try {
      const result = await postMessage(content, category, locationHint, parentId);
      toast.success(language === 'es' ? 'Mensaje enviado' : 'Message sent');
      
      // Replace optimistic message with real one
      if (parentId) {
        // Use functional update to ensure we have the latest state
        setMessages(prev => prev.map(msg => {
          if (msg.id === parentId) {
            // Replace the optimistic reply with the real one
            const updatedReplies = (msg.replies || []).map(r => 
              r.id === tempId ? { ...result.message, replies: [], parent_id: parentId } : r
            );
            return {
              ...msg,
              replies: updatedReplies,
              reply_count: updatedReplies.length
            };
          }
          return msg;
        }));
      } else {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => m.id === tempId ? { ...result.message, replies: [], reply_count: 0 } : m));
      }
      
      // Refresh after a short delay to get accurate data with nested replies
      setTimeout(() => refresh(), 500);
    } catch (err) {
      // Remove optimistic message on error - use functional update
      if (parentId) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === parentId) {
            const filteredReplies = (msg.replies || []).filter(r => r.id !== tempId);
            return {
              ...msg,
              replies: filteredReplies,
              reply_count: Math.max(0, filteredReplies.length)
            };
          }
          return msg;
        }));
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
      toast.error(err.message || (language === 'es' ? 'Error al enviar mensaje' : 'Failed to send message'));
      throw err;
    }
  };

  const handleLike = async (messageId, action) => {
    // Find the message to update optimistically (check both top-level and replies)
    let message = messages.find(m => m.id === messageId);
    let isReply = false;
    
    if (!message) {
      // Check in replies
      for (const msg of messages) {
        const reply = msg.replies?.find(r => r.id === messageId);
        if (reply) {
          message = reply;
          isReply = true;
          break;
        }
      }
    }
    
    if (!message) return;

    // Optimistic update - update UI immediately
    const wasLiked = message.has_user_liked;
    const currentLikes = message.likes || 0;
    const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    updateMessageOptimistically(messageId, {
      likes: newLikes,
      has_user_liked: action === 'like'
    });

    // Fire and forget - don't wait for response
    likeMessage(messageId, action).then(result => {
      // Silently update with server response if different
      if (result && (result.likes !== newLikes || result.has_user_liked !== (action === 'like'))) {
        updateMessageOptimistically(messageId, {
          likes: result.likes,
          has_user_liked: result.has_user_liked
        });
      }
    }).catch(err => {
      // Revert optimistic update on error
      updateMessageOptimistically(messageId, {
        likes: currentLikes,
        has_user_liked: wasLiked
      });
      toast.error(err.message || (language === 'es' ? 'Error al dar like' : 'Failed to like message'));
    });
  };

  const handleFlag = async (messageId) => {
    if (!window.confirm(language === 'es' ? '¿Reportar este mensaje?' : 'Report this message?')) {
      return;
    }

    try {
      await flagMessage(messageId, 'other');
      toast.success(language === 'es' ? 'Mensaje reportado' : 'Message reported');
    } catch (err) {
      toast.error(err.message || (language === 'es' ? 'Error al reportar' : 'Failed to report message'));
    }
  };

  const handleReply = async (parentId, content) => {
    // Replies inherit category from parent, no location hint needed
    await handlePostMessage(content, 'general', null, parentId);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={language === 'es' ? 'Comunidad - Bolivia Blue' : 'Community - Bolivia Blue'}
        description={language === 'es' 
          ? 'Comparte tasas, lugares y consejos sobre el dólar blue en Bolivia de forma anónima'
          : 'Share rates, locations and tips about the blue dollar in Bolivia anonymously'}
        canonical="/chat"
      />
      
      <Header />
      <Navigation />

      {/* Community Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {language === 'es' ? 'Comunidad' : 'Community'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            {language === 'es' 
              ? 'Comparte tasas, lugares y consejos de forma anónima'
              : 'Share rates, locations and tips anonymously'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <LazyErrorBoundary>
        <FilterBar onFilterChange={handleFilterChange} stats={stats} />
      </LazyErrorBoundary>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-6">
        <LazyErrorBoundary>
          <MessageFeed
            messages={messages}
            loading={messagesLoading}
            onLike={handleLike}
            onFlag={handleFlag}
            onReply={handleReply}
            autoScroll={false}
          />
        </LazyErrorBoundary>
      </main>

      {/* Message Form (Sticky) */}
      <div className="fixed sm:sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg z-20">
        <div className="max-w-4xl mx-auto p-2 sm:p-4">
          <LazyErrorBoundary>
            <MessageForm
              onSubmit={handlePostMessage}
              loading={actionsLoading}
            />
          </LazyErrorBoundary>
        </div>
      </div>

      <Footer />
    </div>
  );
}
