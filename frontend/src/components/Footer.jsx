import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Footer hubs aligned with typical Google sitelinks:
 * About · Advertise · Press · Terms · Privacy (+ product tools).
 */
function Footer() {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';
  const es = language === 'es';

  const columns = [
    {
      title: es ? 'Bolivia Blue' : 'Bolivia Blue',
      links: [
        { path: '/acerca-de', label: es ? 'Sobre Bolivia Blue' : 'About Bolivia Blue' },
        { path: '/contacto', label: es ? 'Contacto' : 'Contact' },
        { path: '/preguntas-frecuentes', label: 'FAQ' },
        { path: '/fuente-de-datos', label: es ? 'Fuente de datos' : 'Data source' },
      ],
    },
    {
      title: es ? 'Cotización' : 'Rates',
      links: [
        { path: '/dolar-blue-hoy', label: es ? 'Dólar blue hoy' : 'Blue dollar today' },
        { path: '/dolar-paralelo-bolivia-en-vivo', label: es ? 'En vivo' : 'Live' },
        { path: '/calculadora', label: es ? 'Calculadora' : 'Calculator' },
        { path: '/datos-historicos', label: es ? 'Datos históricos' : 'Historical data' },
      ],
    },
    {
      title: es ? 'Medios y partners' : 'Media & partners',
      links: [
        { path: '/prensa', label: es ? 'Prensa' : 'Press kit' },
        { path: '/publicitar', label: es ? 'Publicitar' : 'Advertise' },
        { path: '/widget', label: 'Widget' },
        { path: '/api-docs', label: 'API' },
      ],
    },
    {
      title: es ? 'Legal' : 'Legal',
      links: [
        { path: '/terminos', label: es ? 'Términos' : 'Terms' },
        { path: '/politica-de-privacidad', label: es ? 'Privacidad' : 'Privacy' },
        { path: '/politica-editorial', label: es ? 'Política editorial' : 'Editorial policy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800 pt-6">
          <p>&copy; 2026 Bolivia Blue</p>
          <p className="mt-2">
            {es
              ? 'Cotización del dólar blue / paralelo en Bolivia. Hecho con datos abiertos para transparencia.'
              : 'Bolivia blue / parallel dollar rates. Made with open data for transparency.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
