import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';

function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  const currencies = [
    { code: 'USD', label: 'USD', flag: '🇺🇸' },
    { code: 'BRL', label: 'BRL', flag: '🇧🇷' },
    { code: 'EUR', label: 'EUR', flag: '🇪🇺' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
      {currencies.map((curr) => (
        <button
          key={curr.code}
          onClick={() => setCurrency(curr.code)}
          className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 min-w-[50px] flex items-center justify-center gap-1 ${
            currency === curr.code
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          aria-label={`${language === 'es' ? 'Cambiar a' : 'Switch to'} ${curr.label}`}
          title={`${language === 'es' ? 'Ver tasas en' : 'View rates in'} ${curr.label}`}
        >
          <span className="text-sm">{curr.flag}</span>
          <span className="hidden sm:inline">{curr.label}</span>
        </button>
      ))}
    </div>
  );
}

export default CurrencyToggle;

