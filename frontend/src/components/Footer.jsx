import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Footer() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  // Important pages for Google Sitelinks
  const importantLinks = [
    { path: '/calculator', label: language === 'es' ? 'Calculadora' : 'Calculator' },
    { path: '/buy-dollars', label: language === 'es' ? 'Comprar Dólares' : 'Buy Dollars' },
    { path: '/bolivia-blue-rate', label: language === 'es' ? 'Bolivia Blue Rate' : 'Bolivia Blue Rate' },
    { path: '/news', label: language === 'es' ? 'Noticias' : 'News' },
    { path: '/blog', label: language === 'es' ? 'Blog' : 'Blog' },
    { path: '/bancos', label: language === 'es' ? 'Bancos' : 'Banks' },
    { path: '/about', label: language === 'es' ? 'Acerca de' : 'About' },
    { path: '/faq', label: language === 'es' ? 'FAQ' : 'FAQ' },
    { path: '/comparison', label: language === 'es' ? 'Comparación' : 'Comparison' },
    { path: '/contact', label: language === 'es' ? 'Contacto' : 'Contact' }
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Footer Links for Google Sitelinks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          {importantLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              {t('footerUpdates')}
            </p>
            <p className="mb-4">
              {t('footerText')}
            </p>
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              &copy; 2025 {t('title')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

