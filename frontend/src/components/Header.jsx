import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import CurrencyToggle from './CurrencyToggle';
import { BINANCE_REFERRAL_LINK, AIRTM_REFERRAL_LINK } from '../config/referrals';

function Header() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0 flex-1">
            <picture>
              <source 
                srcSet="/header-og-image-320w.webp 320w, /header-og-image-640w.webp 640w, /header-og-image-1280w.webp 1280w"
                type="image/webp"
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
              />
              <img 
                src="/header-og-image.jpg" 
                alt="Bolivia Blue con Paz - Logo del sitio web de tipo de cambio del dólar boliviano" 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 rounded-lg object-cover"
                loading="eager"
                width="56"
                height="56"
              />
            </picture>
            <div className="flex flex-col min-w-0">
              <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                <span className="sm:hidden">{t('titleShort')}</span>
                <span className="hidden sm:inline">{t('title')}</span>
              </div>
              <p className="hidden md:block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </Link>
          
          {/* CTAs and Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Buy Dollars CTA - Binance (Subtle Outlined Style) */}
            <a
              href={BINANCE_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={language === 'es' ? 'Comprar dólares con Binance' : 'Buy dollars with Binance'}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-yellow-500/70 dark:border-yellow-400/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-600 dark:hover:border-yellow-400 transition-all duration-200 text-sm font-medium whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              <span className="hidden lg:inline">
                Binance
              </span>
            </a>
            
            {/* Buy Bolivianos CTA - Airtm (Subtle Outlined Style) */}
            <a
              href={AIRTM_REFERRAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={language === 'es' ? 'Comprar bolivianos con Airtm' : 'Buy bolivianos with Airtm'}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-cyan-500/70 dark:border-cyan-400/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 hover:border-cyan-600 dark:hover:border-cyan-400 transition-all duration-200 text-sm font-medium whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="hidden lg:inline">
                Airtm
              </span>
            </a>
            
            <CurrencyToggle />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

