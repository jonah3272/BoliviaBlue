import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import PageMeta from '../components/PageMeta';
import { useLanguage } from '../contexts/LanguageContext';

function NotFound() {
  const language = useLanguage()?.language || 'es';
  const es = language === 'es';

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900">
      <PageMeta
        title={es ? 'Página no encontrada | Bolivia Blue' : 'Page not found | Bolivia Blue'}
        description={es
          ? 'Esa URL no existe en Bolivia Blue. Volvé al inicio o a la cotización del dólar blue.'
          : 'That URL does not exist on Bolivia Blue. Go home or to the blue dollar quote.'}
        canonical="/404"
        noindex
      />
      <Header />
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center" data-seo-shell="404">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {es ? 'Página no encontrada' : 'Page not found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3">
          {es
            ? 'Esa URL no existe. Volvé al inicio o a la cotización del dólar blue hoy.'
            : 'That URL does not exist. Go back home or to today’s blue dollar quote.'}
        </p>
        <nav className="flex flex-wrap justify-center gap-3 mt-6" aria-label={es ? 'Enlaces' : 'Links'}>
          <Link to="/" className="text-blue-600 dark:text-blue-400 font-medium">{es ? 'Inicio' : 'Home'}</Link>
          <Link to="/dolar-blue-hoy" className="text-blue-600 dark:text-blue-400 font-medium">
            {es ? 'Dólar blue hoy' : 'Blue dollar today'}
          </Link>
          <Link to="/euro-a-boliviano" className="text-blue-600 dark:text-blue-400 font-medium">Euro blue</Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
