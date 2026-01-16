import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ReplyForm({ onSubmit, onCancel, parentUsername }) {
  const { language } = useLanguage() || { language: 'es' };
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim().length >= 10) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 pl-6 border-l-2 border-blue-300 dark:border-blue-700">
      <div className="mb-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={language === 'es' 
            ? `Responder a ${parentUsername}...` 
            : `Reply to ${parentUsername}...`}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {content.length}/1000
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              disabled={content.trim().length < 10}
              className="px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {language === 'es' ? 'Responder' : 'Reply'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
