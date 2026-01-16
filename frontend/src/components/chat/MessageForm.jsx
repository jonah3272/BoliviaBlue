import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MessageForm({ onSubmit, loading, compact = false }) {
  const { language } = useLanguage() || { language: 'es' };
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [locationHint, setLocationHint] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      await onSubmit(content, category, locationHint || null);
      setContent('');
      setLocationHint('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to submit message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const categories = [
    { value: 'general', label: language === 'es' ? 'General' : 'General' },
    { value: 'exchange-locations', label: language === 'es' ? 'Lugares' : 'Locations' },
    { value: 'street-rates', label: language === 'es' ? 'Tasas' : 'Rates' },
    { value: 'tips', label: language === 'es' ? 'Consejos' : 'Tips' },
    { value: 'binance-p2p', label: 'Binance P2P' }
  ];

  return (
    <form onSubmit={handleSubmit} className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
      <div className="flex items-end gap-2 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'es' ? 'Escribe un mensaje...' : 'Write a message...'}
            className="w-full resize-none border-none focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
            rows={1}
            disabled={loading}
            maxLength={1000}
          />
          
          {!compact && (
            <div className="flex gap-2 mt-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              
              <input
                type="text"
                value={locationHint}
                onChange={(e) => setLocationHint(e.target.value)}
                placeholder={language === 'es' ? 'Ubicación (opcional)' : 'Location (optional)'}
                className="flex-1 px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {content.length}/1000 {language === 'es' ? 'caracteres' : 'characters'}
      </p>
    </form>
  );
}
