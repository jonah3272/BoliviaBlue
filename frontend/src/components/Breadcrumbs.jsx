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
  // Support both 'name'/'url' and 'label'/'path' property formats
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => {
      // Support both property name formats: 'name' or 'label', 'url' or 'path'
      const itemName = item.name || item.label || '';
      const itemUrl = item.url || item.path || '';
      
      // Ensure name is not empty - this is required by Schema.org
      if (!itemName) {
        console.warn(`Breadcrumb item at position ${index + 1} is missing a name/label`);
      }
      
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": itemName,
        "item": toAbsoluteUrl(itemUrl)
      };
    }).filter(item => item.name) // Filter out items without names
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => {
            // Support both property name formats: 'name' or 'label', 'url' or 'path'
            const itemName = item.name || item.label || '';
            const itemUrl = item.url || item.path || '';
            
            if (!itemName) return null; // Skip items without names
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 dark:text-gray-600 mx-2">/</span>}
                {index === items.length - 1 ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {itemName}
                  </span>
                ) : (
                  <Link
                    to={itemUrl}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {itemName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
