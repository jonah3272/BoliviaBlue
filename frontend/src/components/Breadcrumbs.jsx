import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Breadcrumbs({ items }) {
  // BreadcrumbList JSON-LD is emitted only via PageMeta (single source of truth). This component renders the visual nav only.

  return (
    <>
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
