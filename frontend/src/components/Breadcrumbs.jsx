import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

/**
 * Breadcrumb navigation component with structured data
 */
export default function Breadcrumbs({ items }) {
  const { language, t } = useLanguage();
  const location = useLocation();
  const baseUrl = 'https://boliviablue.com';

  // Auto-generate breadcrumbs from route if items not provided
  const breadcrumbItems = items || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [
      { name: language === 'es' ? 'Inicio' : 'Home', path: '/' }
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      let name = segment;

      // Translate common paths
      if (segment === 'calculator') name = language === 'es' ? 'Calculadora' : 'Calculator';
      else if (segment === 'news') name = language === 'es' ? 'Noticias' : 'News';
      else if (segment === 'about') name = language === 'es' ? 'Acerca de' : 'About';
      else if (segment === 'faq') name = 'FAQ';
      else if (segment === 'rodrigo-paz') name = 'Rodrigo Paz';
      else name = segment.charAt(0).toUpperCase() + segment.slice(1);

      crumbs.push({ name, path });
    });

    return crumbs;
  })();

  // Generate BreadcrumbList structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.path}`
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <span key={item.path} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {index === breadcrumbItems.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

