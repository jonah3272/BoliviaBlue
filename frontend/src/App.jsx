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
    const Contact = lazy(() => import('./pages/Contact'));
    const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));
    const Comparison = lazy(() => import('./pages/Comparison'));
    const Bancos = lazy(() => import('./pages/Bancos'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 flex items-center justify-center">
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
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/bancos" element={<Bancos />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

