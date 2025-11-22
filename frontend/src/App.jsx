import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Home from './pages/Home';

// Lazy load routes for code splitting
const Calculator = lazy(() => import('./pages/Calculator'));
const News = lazy(() => import('./pages/News'));
    const About = lazy(() => import('./pages/About'));
    const FAQ = lazy(() => import('./pages/FAQ'));
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
    const BinanceP2PBolivia = lazy(() => import('./pages/BinanceP2PBolivia'));
    const UsdtBolivia = lazy(() => import('./pages/UsdtBolivia'));
    const DolarParaleloBoliviaEnVivo = lazy(() => import('./pages/DolarParaleloBoliviaEnVivo'));

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
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/rodrigo-paz" element={<RodrigoPaz />} />
              <Route path="/buy-dollars" element={<BuyDollars />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              <Route path="/bolivia-blue-rate" element={<BoliviaBlueRate />} />
              <Route path="/bolivia-blue-rate-hoy" element={<BoliviaBlueRate />} />
              <Route path="/bolivia-blue-rate-actual" element={<BoliviaBlueRate />} />
              <Route path="/tipo-cambio-blue-bolivia" element={<BoliviaBlueRate />} />
              <Route path="/cotiza-dolar-paralelo" element={<CotizaDolarParalelo />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/bancos" element={<Bancos />} />
              <Route path="/dolar-blue-la-paz" element={<DolarBlueLaPaz />} />
              <Route path="/dolar-blue-santa-cruz" element={<DolarBlueSantaCruz />} />
              <Route path="/dolar-blue-cochabamba" element={<DolarBlueCochabamba />} />
              <Route path="/dolar-blue-hoy" element={<DolarBlueHoy />} />
              <Route path="/que-es-dolar-blue" element={<QueEsDolarBlue />} />
              <Route path="/cuanto-esta-dolar-bolivia" element={<CuantoEstaDolarBolivia />} />
              <Route path="/binance-p2p-bolivia" element={<BinanceP2PBolivia />} />
              <Route path="/usdt-bolivia" element={<UsdtBolivia />} />
              <Route path="/dolar-paralelo-bolivia-en-vivo" element={<DolarParaleloBoliviaEnVivo />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

