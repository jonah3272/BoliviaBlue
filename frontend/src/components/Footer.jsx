import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Footer() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  // Essential footer links with trust signals
  const footerLinks = [
    { path: '/dolar-blue-hoy', label: language === 'es' ? 'Dólar blue hoy' : 'Blue dollar today' },
    { path: '/dolar-paralelo-bolivia-en-vivo', label: language === 'es' ? 'En vivo' : 'Live' },
    { path: '/cuanto-esta-dolar-bolivia', label: language === 'es' ? '¿Cuánto está?' : 'How much?' },
    { path: '/datos-historicos', label: language === 'es' ? 'Datos históricos' : 'Historical data' },
    { path: '/calculadora', label: language === 'es' ? 'Calculadora' : 'Calculator' },
    { path: '/noticias', label: language === 'es' ? 'Noticias' : 'News' },
    { path: '/blog', label: 'Blog' },
    { path: '/preguntas-frecuentes', label: 'FAQ' },
    { path: '/fuente-de-datos', label: language === 'es' ? 'Fuente de datos' : 'Data source' },
    { path: '/acerca-de', label: language === 'es' ? 'Acerca de' : 'About' },
    { path: '/contacto', label: language === 'es' ? 'Contacto' : 'Contact' },
    { path: '/politica-de-privacidad', label: language === 'es' ? 'Privacidad' : 'Privacy' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple centered links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          <p>&copy; 2026 Bolivia Blue Rate con Paz</p>
          <p className="mt-2">{language === 'es' ? 'Hecho con datos abiertos para transparencia.' : 'Made with open data for transparency.'}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

