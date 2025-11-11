import ThemeToggle from '../components/ThemeToggle';
import RateCards from '../components/RateCards';
import BlueChart from '../components/BlueChart';
import NewsFeed from '../components/NewsFeed';
import About from '../components/About';

function Home() {
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bolivia Blue
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bolivia Blue con Paz
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Tracking the Boliviano's pulse under President Paz
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Tipo de cambio del mercado paralelo en tiempo real
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Rate Cards */}
        <section>
          <RateCards />
        </section>

        {/* Chart */}
        <section>
          <BlueChart />
        </section>

        {/* News Feed */}
        <section>
          <NewsFeed />
        </section>

        {/* About */}
        <section>
          <About />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Datos actualizados cada 15 minutos desde el mercado P2P de Binance
            </p>
            <p className="mb-4">
              Este sitio proporciona información del mercado informal y no constituye asesoría financiera
            </p>
            <div className="flex items-center justify-center gap-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors"
              >
                Código fuente
              </a>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <a 
                href="mailto:info@example.com"
                className="hover:text-blue-500 transition-colors"
              >
                Contacto
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              &copy; 2025 Bolivia Blue con Paz. Hecho con transparencia para el pueblo boliviano.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

