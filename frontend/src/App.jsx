import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import News from './pages/News';
import About from './pages/About';
import FAQ from './pages/FAQ';
import RodrigoPaz from './pages/RodrigoPaz';
import BuyDollars from './pages/BuyDollars';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/rodrigo-paz" element={<RodrigoPaz />} />
        <Route path="/buy-dollars" element={<BuyDollars />} />
      </Routes>
    </Router>
  );
}

export default App;

