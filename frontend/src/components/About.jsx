import { useLanguage } from '../contexts/LanguageContext';

function About() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        {t('aboutTitle')}
      </h2>
      
      <div className="space-y-4 text-gray-600 dark:text-gray-300">
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('aboutMethodology')}</h3>
          <p className="text-sm leading-relaxed mb-3">
            {t('aboutMethodologyDesc')}
          </p>
          <ul className="text-sm space-y-2 ml-4">
            <li><strong>{t('aboutBlueMarket')}</strong> {t('aboutBlueMarketDesc')}</li>
            <li><strong>{t('aboutOfficialRate')}</strong> {t('aboutOfficialRateDesc')}</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('aboutDataSources')}</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>{t('aboutDataSource1')}</li>
            <li>{t('aboutDataSource2')}</li>
            <li>{t('aboutDataSource3')}</li>
            <li>{t('aboutDataSource4')}</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('aboutCaveats')}</h3>
          <p className="text-sm leading-relaxed bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3">
            <strong>{t('aboutCaveatsTitle')}</strong> {t('aboutCaveatsDesc')}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('aboutTransparency')}</h3>
          <p className="text-sm leading-relaxed">
            {t('aboutTransparencyDesc')}
          </p>
        </section>

        <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('aboutLastUpdate')}
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;

