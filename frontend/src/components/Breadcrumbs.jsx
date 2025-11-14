import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Breadcrumbs({ items }) {
  const languageContext = useLanguage();
  const language = languageContext?.language || 'es';

  // Base URL for absolute URLs in structured data
  // Always use non-www version for consistency (canonical URL)
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Normalize to non-www version for structured data consistency
      // Remove www. if present: https://www.boliviablue.com -> https://boliviablue.com
      return origin.replace(/^https?:\/\/www\./, 'https://');
    }
    return 'https://boliviablue.com';
  };

  const baseUrl = getBaseUrl();

  // Convert relative URL to absolute URL
  const toAbsoluteUrl = (url) => {
    if (!url) return baseUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Normalize to non-www version for consistency
      return url.replace(/^https?:\/\/www\./, 'https://');
    }
    // Remove leading slash if present, then add it back
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  // Generate structured data for breadcrumbs with absolute URLs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": toAbsoluteUrl(item.url)
    }))
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="text-gray-400 dark:text-gray-600 mx-2">/</span>}
              {index === items.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
