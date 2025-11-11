import { useLanguage } from '../contexts/LanguageContext';

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle language"
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {language === 'es' ? '🇧🇴 ES' : '🇺🇸 EN'}
        </span>
      </div>
    </button>
  );
}

export default LanguageToggle;

