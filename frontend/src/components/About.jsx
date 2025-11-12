import { useLanguage } from '../contexts/LanguageContext';

function About() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('aboutTitle')}
      </h2>
      
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        {/* Exchange Rate Methodology */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('aboutMethodology')}</h3>
          <p className="text-sm leading-relaxed mb-3">
            {t('aboutMethodologyDesc')}
          </p>
          <ul className="text-sm space-y-2 ml-4">
            <li><strong className="text-gray-900 dark:text-white">{t('aboutBlueMarket')}</strong> {t('aboutBlueMarketDesc')}</li>
            <li><strong className="text-gray-900 dark:text-white">{t('aboutOfficialRate')}</strong> {t('aboutOfficialRateDesc')}</li>
          </ul>
        </section>

        {/* News Sources - Enhanced */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('aboutNewsSources')}</h3>
          <p className="text-sm leading-relaxed mb-4">
            {t('aboutNewsSourcesDesc')}
          </p>
          
          <div className="space-y-4 ml-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutNewsSourceRSS')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutNewsSourceRSSDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutNewsSourceTwitter')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutNewsSourceTwitterDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutNewsSourceFiltering')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutNewsSourceFilteringDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutNewsSourceDeduplication')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutNewsSourceDeduplicationDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* Sentiment Analysis - New Section */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('aboutSentimentAnalysis')}</h3>
          <p className="text-sm leading-relaxed mb-4">
            {t('aboutSentimentAnalysisDesc')}
          </p>
          
          <div className="space-y-4 ml-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm flex items-center gap-2">
                {t('aboutSentimentAI')}
                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  GPT-4o-mini
                </span>
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutSentimentAIDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutSentimentKeywords')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutSentimentKeywordsDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutSentimentWeighting')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutSentimentWeightingDesc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                {t('aboutSentimentUpdate')}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t('aboutSentimentUpdateDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{t('aboutDataSources')}</h3>
          <ul className="text-sm space-y-1 list-disc list-inside ml-4">
            <li>{t('aboutDataSource1')}</li>
            <li>{t('aboutDataSource2')}</li>
            <li>{t('aboutDataSource3')}</li>
            <li>{t('aboutDataSource4')}</li>
          </ul>
        </section>

        {/* Caveats */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{t('aboutCaveats')}</h3>
          <p className="text-sm leading-relaxed bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3">
            <strong className="text-gray-900 dark:text-white">{t('aboutCaveatsTitle')}</strong> {t('aboutCaveatsDesc')}
          </p>
        </section>

        {/* Transparency */}
        <section>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{t('aboutTransparency')}</h3>
          <p className="text-sm leading-relaxed">
            {t('aboutTransparencyDesc')}
          </p>
        </section>

        {/* Last Update */}
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
