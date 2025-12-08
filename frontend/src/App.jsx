import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Home from './pages/Home';
import Redirect from './components/Redirect';

// Lazy load routes for code splitting
const Calculator = lazy(() => import('./pages/Calculator'));
const News = lazy(() => import('./pages/News'));
    const About = lazy(() => import('./pages/About'));
    const Contact = lazy(() => import('./pages/Contact'));
    const FAQ = lazy(() => import('./pages/FAQ'));
    const Privacy = lazy(() => import('./pages/Privacy'));
    const RodrigoPaz = lazy(() => import('./pages/RodrigoPaz'));
    const BuyDollars = lazy(() => import('./pages/BuyDollars'));
    const Blog = lazy(() => import('./pages/Blog'));
    const BoliviaBlueRate = lazy(() => import('./pages/BoliviaBlueRate'));
    const CotizaDolarParalelo = lazy(() => import('./pages/CotizaDolarParalelo'));
    const Comparison = lazy(() => import('./pages/Comparison'));
    const Bancos = lazy(() => import('./pages/Bancos'));
    const DolarBlueLaPaz = lazy(() => import('./pages/DolarBlueLaPaz'));
    const DolarBlueSantaCruz = lazy(() => import('./pages/DolarBlueSantaCruz'));
    const DolarBlueCochabamba = lazy(() => import('./pages/DolarBlueCochabamba'));
    const DolarBlueHoy = lazy(() => import('./pages/DolarBlueHoy'));
    const QueEsDolarBlue = lazy(() => import('./pages/QueEsDolarBlue'));
    const CuantoEstaDolarBolivia = lazy(() => import('./pages/CuantoEstaDolarBolivia'));
    const CuantoEstaDolarBoliviaHoy = lazy(() => import('./pages/CuantoEstaDolarBoliviaHoy'));
    const BinanceP2PBolivia = lazy(() => import('./pages/BinanceP2PBolivia'));
    const UsdtBolivia = lazy(() => import('./pages/UsdtBolivia'));
    const DolarParaleloBoliviaEnVivo = lazy(() => import('./pages/DolarParaleloBoliviaEnVivo'));
    const EuroToBoliviano = lazy(() => import('./pages/EuroToBoliviano'));
    const RealToBoliviano = lazy(() => import('./pages/RealToBoliviano'));
    const BolivianBlue = lazy(() => import('./pages/BolivianBlue'));
    const BlueDolarBolivia = lazy(() => import('./pages/BlueDolarBolivia'));
    const BlueDollarBolivia = lazy(() => import('./pages/BlueDollarBolivia'));
    const BlueRateBolivia = lazy(() => import('./pages/BlueRateBolivia'));
    const CambioBlueBolivia = lazy(() => import('./pages/CambioBlueBolivia'));

// Loading fallback component
// IMPORTANT: This component signals to the AdSense loader that we're in a loading state
// The data-loading-state and data-adsense-block attributes prevent ads from loading
// until actual page content is rendered (per AdSense policy)
function LoadingFallback() {
  return (
    <div 
      className="min-h-screen bg-brand-bg dark:bg-gray-900 flex items-center justify-center"
      data-loading-state="true"
      data-adsense-block="loading-screen"
    >
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Spanish URL Aliases (Primary for SEO) */}
          <Route path="/calculadora" element={<Calculator />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/acerca-de" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
          <Route path="/politica-de-privacidad" element={<Privacy />} />
          <Route path="/comparacion" element={<Comparison />} />
          <Route path="/comprar-dolares" element={<BuyDollars />} />
          
          {/* English URLs - Redirect to Spanish for SEO */}
          <Route path="/calculator" element={<Redirect to="/calculadora" />} />
          <Route path="/news" element={<Redirect to="/noticias" />} />
          <Route path="/about" element={<Redirect to="/acerca-de" />} />
          <Route path="/contact" element={<Redirect to="/contacto" />} />
          <Route path="/faq" element={<Redirect to="/preguntas-frecuentes" />} />
          <Route path="/comparison" element={<Redirect to="/comparacion" />} />
          <Route path="/buy-dollars" element={<Redirect to="/comprar-dolares" />} />
          
          {/* Other pages (already in Spanish) */}
          <Route path="/rodrigo-paz" element={<RodrigoPaz />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          
          {/* Canonical: /bolivia-blue-rate (redirect duplicates) */}
          <Route path="/bolivia-blue-rate" element={<BoliviaBlueRate />} />
          <Route path="/bolivia-blue-rate-hoy" element={<Redirect to="/bolivia-blue-rate" />} />
          <Route path="/bolivia-blue-rate-actual" element={<Redirect to="/bolivia-blue-rate" />} />
          <Route path="/tipo-cambio-blue-bolivia" element={<Redirect to="/bolivia-blue-rate" />} />
          
          {/* Canonical: /cuanto-esta-dolar-bolivia (redirect duplicate) */}
          <Route path="/cuanto-esta-dolar-bolivia" element={<CuantoEstaDolarBolivia />} />
          <Route path="/cuanto-esta-dolar-bolivia-hoy" element={<Redirect to="/cuanto-esta-dolar-bolivia" />} />
          
          <Route path="/cotiza-dolar-paralelo" element={<CotizaDolarParalelo />} />
          <Route path="/bancos" element={<Bancos />} />
          <Route path="/dolar-blue-la-paz" element={<DolarBlueLaPaz />} />
          <Route path="/dolar-blue-santa-cruz" element={<DolarBlueSantaCruz />} />
          <Route path="/dolar-blue-cochabamba" element={<DolarBlueCochabamba />} />
          <Route path="/dolar-blue-hoy" element={<DolarBlueHoy />} />
          <Route path="/que-es-dolar-blue" element={<QueEsDolarBlue />} />
          <Route path="/binance-p2p-bolivia" element={<BinanceP2PBolivia />} />
          <Route path="/usdt-bolivia" element={<UsdtBolivia />} />
          <Route path="/dolar-paralelo-bolivia-en-vivo" element={<DolarParaleloBoliviaEnVivo />} />
          <Route path="/bolivian-blue" element={<BolivianBlue />} />
          <Route path="/blue-dolar-bolivia" element={<BlueDolarBolivia />} />
          <Route path="/blue-dollar-bolivia" element={<BlueDollarBolivia />} />
          <Route path="/blue-rate-bolivia" element={<BlueRateBolivia />} />
          <Route path="/cambio-blue-bolivia" element={<CambioBlueBolivia />} />
          
          {/* Currency conversion pages */}
          <Route path="/euro-a-boliviano" element={<EuroToBoliviano />} />
          <Route path="/real-a-boliviano" element={<RealToBoliviano />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

