import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ReplyForm from './ReplyForm';

// Simple time ago function (fallback if date-fns not available)
function formatTimeAgo(date, language) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (language === 'es') {
    if (seconds < 60) return 'hace unos segundos';
    if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return `hace ${days} día${days > 1 ? 's' : ''}`;
  } else {
    if (seconds < 60) return 'a few seconds ago';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export default function MessageCard({ message, onLike, onFlag, onReply, isReply = false }) {
  const { language } = useLanguage() || { language: 'es' };
  const [showReplyForm, setShowReplyForm] = useState(false);

  const timeAgo = formatTimeAgo(message.created_at, language);

  const getCategoryLabel = (category) => {
    const labels = {
      'exchange-locations': language === 'es' ? 'Lugares' : 'Locations',
      'street-rates': language === 'es' ? 'Tasas' : 'Rates',
      'tips': language === 'es' ? 'Consejos' : 'Tips',
      'binance-p2p': 'Binance P2P',
      'general': language === 'es' ? 'General' : 'General'
    };
    return labels[category] || category;
  };

  const handleReply = (content) => {
    if (onReply) {
      onReply(message.id, content);
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 rounded-xl p-3 sm:p-4 ${isReply ? 'ml-2 sm:ml-6 border-l-2 border-blue-200 dark:border-blue-800' : ''}`}>
      <div className="flex gap-2 sm:gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
            {message.anonymous_username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
              {message.anonymous_username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          
          {/* Content */}
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-2 leading-relaxed break-words">
            {message.content}
          </p>
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            {message.location_hint && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 truncate max-w-full">
                📍 {message.location_hint}
              </span>
            )}
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300">
              {getCategoryLabel(message.category)}
            </span>
            {message.rate_mentioned && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300">
                💰 {message.rate_mentioned} BOB/USD
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button
              onClick={() => onLike && onLike(message.id, message.has_user_liked ? 'unlike' : 'like')}
              className={`flex items-center gap-1 text-xs sm:text-sm transition-transform hover:scale-110 active:scale-95 ${
                message.has_user_liked
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <span>❤️</span>
              <span>{message.likes || 0}</span>
            </button>
            
            {!isReply && onReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={language === 'es' ? 'Responder' : 'Reply'}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{message.reply_count || (message.replies?.length || 0)}</span>
              </button>
            )}
            <button
              onClick={() => onFlag && onFlag(message.id)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              title={language === 'es' ? 'Reportar' : 'Report'}
            >
              {language === 'es' ? 'Reportar' : 'Report'}
            </button>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && !isReply && (
            <ReplyForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              parentUsername={message.anonymous_username}
            />
          )}
          
          {/* Replies */}
          {message.replies && message.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.replies.map((reply) => (
                <MessageCard
                  key={reply.id}
                  message={reply}
                  onLike={onLike}
                  onFlag={onFlag}
                  onReply={null}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
