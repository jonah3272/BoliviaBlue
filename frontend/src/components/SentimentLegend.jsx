import { useLanguage } from '../contexts/LanguageContext';

function SentimentLegend() {
  const { language } = useLanguage();

  const legends = [
    {
      icon: '↗️',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      titleEs: 'Dólar Subiendo',
      titleEn: 'Dollar Rising',
      descEs: 'El dólar se fortalece contra el boliviano',
      descEn: 'Dollar strengthening against boliviano'
    },
    {
      icon: '↘️',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      titleEs: 'Dólar Bajando',
      titleEn: 'Dollar Falling',
      descEs: 'El dólar se debilita contra el boliviano',
      descEn: 'Dollar weakening against boliviano'
    },
    {
      icon: '⚪',
      color: 'text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
      titleEs: 'Sin Impacto',
      titleEn: 'No Impact',
      descEs: 'Sin efecto claro en el tipo de cambio',
      descEn: 'No clear impact on exchange rate'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {language === 'es' ? '🔑 Indicadores de Sentimiento' : '🔑 Sentiment Indicators'}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {language === 'es' 
          ? 'Cada artículo tiene un indicador que muestra su impacto en el tipo de cambio, analizado por IA:'
          : 'Each article has an indicator showing its impact on the exchange rate, analyzed by AI:'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {legends.map((legend, index) => (
          <div 
            key={index}
            className={`${legend.bgColor} ${legend.borderColor} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{legend.icon}</span>
              <div>
                <h4 className={`font-semibold ${legend.color}`}>
                  {language === 'es' ? legend.titleEs : legend.titleEn}
                </h4>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {language === 'es' ? legend.descEs : legend.descEn}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
        {language === 'es' 
          ? '💡 Análisis impulsado por OpenAI GPT-4 para precisión'
          : '💡 Powered by OpenAI GPT-4 for accuracy'}
      </p>
    </div>
  );
}

export default SentimentLegend;

