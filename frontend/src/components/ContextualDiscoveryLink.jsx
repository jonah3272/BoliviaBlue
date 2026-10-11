import { Link } from 'react-router-dom';

const linkClass = 'text-blue-600 dark:text-blue-400 underline underline-offset-2';

export default function ContextualDiscoveryLink({ link, className = 'mt-3 text-sm text-gray-700 dark:text-gray-300' }) {
  return <p className={className} data-contextual-discovery={link.id}>
    {link.before}
    {link.fullNavigation
      ? <a href={link.href} className={linkClass}>{link.label}</a>
      : <Link to={link.href} className={linkClass}>{link.label}</Link>}
    {link.after}
  </p>;
}
