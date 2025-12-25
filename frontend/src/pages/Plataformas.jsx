import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useAdsenseReady } from '../hooks/useAdsenseReady';
import { trackNavigation } from '../utils/analytics';

function Plataformas() {
  // Signal to AdSense that this page has sufficient content
  useAdsenseReady();
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key) => key || '');
  const language = languageContext?.language || 'es';

  const breadcrumbs = [
    { name: language === 'es' ? 'Inicio' : 'Home', url: '/' },
    { name: language === 'es' ? 'Plataformas' : 'Platforms', url: '/plataformas' }
  ];

  // Platform comparison data
  const platforms = [
    {
      id: 'binance',
      name: 'Binance P2P',
      logo: '🟡',
      rating: 5,
      pros: language === 'es' ? [
        'Mayor liquidez y volumen',
        'Tasas más competitivas',
        'Sistema de garantía integrado',
        'Verificación de identidad (KYC)',
        'Soporte 24/7',
        'Múltiples métodos de pago'
      ] : [
        'Highest liquidity and volume',
        'Most competitive rates',
        'Built-in escrow system',
        'Identity verification (KYC)',
        '24/7 support',
        'Multiple payment methods'
      ],
      cons: language === 'es' ? [
        'Requiere verificación KYC',
        'Puede ser complejo para principiantes'
      ] : [
        'Requires KYC verification',
        'Can be complex for beginners'
      ],
      bestFor: language === 'es' ? 'Usuarios que buscan las mejores tasas y mayor seguridad' : 'Users seeking best rates and highest security',
      link: 'https://www.binance.com/en/p2p',
      referralLink: 'https://accounts.binance.com/register?ref=YOUR_REF_CODE',
      rate: language === 'es' ? 'Mejor tasa del mercado' : 'Best market rate',
      security: language === 'es' ? 'Muy alta' : 'Very high',
      speed: language === 'es' ? 'Rápido (5-15 min)' : 'Fast (5-15 min)',
      fees: language === 'es' ? 'Sin comisiones' : 'No fees',
      minAmount: language === 'es' ? '$10 USD' : '$10 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria, efectivo, otros' : 'Bank transfer, cash, others'
    },
    {
      id: 'airtm',
      name: 'Airtm',
      logo: '💳',
      rating: 4,
      pros: language === 'es' ? [
        'Fácil de usar',
        'Buen soporte al cliente',
        'Wallet integrado',
        'Acepta múltiples monedas',
        'App móvil disponible'
      ] : [
        'Easy to use',
        'Good customer support',
        'Integrated wallet',
        'Accepts multiple currencies',
        'Mobile app available'
      ],
      cons: language === 'es' ? [
        'Tasas ligeramente más altas',
        'Comisiones por transacción'
      ] : [
        'Slightly higher rates',
        'Transaction fees'
      ],
      bestFor: language === 'es' ? 'Usuarios que buscan facilidad de uso' : 'Users seeking ease of use',
      link: 'https://www.airtm.io',
      referralLink: 'https://app.airtm.io/ivt/dasyl1sfs6fzr',
      rate: language === 'es' ? 'Buena' : 'Good',
      security: language === 'es' ? 'Alta' : 'High',
      speed: language === 'es' ? 'Moderado (15-30 min)' : 'Moderate (15-30 min)',
      fees: language === 'es' ? '2-5% por transacción' : '2-5% per transaction',
      minAmount: language === 'es' ? '$5 USD' : '$5 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria, PayPal, otros' : 'Bank transfer, PayPal, others'
    },
    {
      id: 'wallbit',
      name: 'Wallbit',
      logo: '💵',
      rating: 4,
      pros: language === 'es' ? [
        'Interfaz simple',
        'Buenas tasas',
        'Proceso rápido',
        'Soporte en español'
      ] : [
        'Simple interface',
        'Good rates',
        'Fast process',
        'Spanish support'
      ],
      cons: language === 'es' ? [
        'Menor volumen que Binance',
        'Opciones de pago limitadas'
      ] : [
        'Lower volume than Binance',
        'Limited payment options'
      ],
      bestFor: language === 'es' ? 'Usuarios que prefieren plataformas locales' : 'Users preferring local platforms',
      link: 'https://wallbit.com',
      referralLink: 'https://wallbit.com',
      rate: language === 'es' ? 'Buena' : 'Good',
      security: language === 'es' ? 'Alta' : 'High',
      speed: language === 'es' ? 'Rápido (10-20 min)' : 'Fast (10-20 min)',
      fees: language === 'es' ? 'Bajas' : 'Low',
      minAmount: language === 'es' ? '$20 USD' : '$20 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria' : 'Bank transfer'
    },
    {
      id: 'eldoradop2p',
      name: 'ElDorado P2P',
      logo: '🏆',
      rating: 3,
      pros: language === 'es' ? [
        'Plataforma establecida',
        'Buen volumen de transacciones',
        'Sistema de reputación'
      ] : [
        'Established platform',
        'Good transaction volume',
        'Reputation system'
      ],
      cons: language === 'es' ? [
        'Tasas menos competitivas',
        'Interfaz menos moderna',
        'Soporte limitado'
      ] : [
        'Less competitive rates',
        'Less modern interface',
        'Limited support'
      ],
      bestFor: language === 'es' ? 'Usuarios experimentados' : 'Experienced users',
      link: 'https://eldoradop2p.com',
      referralLink: 'https://eldoradop2p.com',
      rate: language === 'es' ? 'Moderada' : 'Moderate',
      security: language === 'es' ? 'Media-Alta' : 'Medium-High',
      speed: language === 'es' ? 'Moderado (20-40 min)' : 'Moderate (20-40 min)',
      fees: language === 'es' ? 'Variables' : 'Variable',
      minAmount: language === 'es' ? '$50 USD' : '$50 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria' : 'Bank transfer'
    },
    {
      id: 'bitget',
      name: 'Bitget P2P',
      logo: '🟢',
      rating: 4,
      pros: language === 'es' ? [
        'Exchange establecido',
        'Buenas tasas',
        'Sistema de garantía',
        'App móvil'
      ] : [
        'Established exchange',
        'Good rates',
        'Escrow system',
        'Mobile app'
      ],
      cons: language === 'es' ? [
        'Menor volumen que Binance',
        'Menos opciones de pago'
      ] : [
        'Lower volume than Binance',
        'Fewer payment options'
      ],
      bestFor: language === 'es' ? 'Usuarios que buscan alternativas a Binance' : 'Users seeking Binance alternatives',
      link: 'https://www.bitget.com',
      referralLink: 'https://www.bitget.com',
      rate: language === 'es' ? 'Buena' : 'Good',
      security: language === 'es' ? 'Alta' : 'High',
      speed: language === 'es' ? 'Rápido (10-20 min)' : 'Fast (10-20 min)',
      fees: language === 'es' ? 'Bajas' : 'Low',
      minAmount: language === 'es' ? '$10 USD' : '$10 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria' : 'Bank transfer'
    },
    {
      id: 'bybit',
      name: 'Bybit P2P',
      logo: '🔵',
      rating: 4,
      pros: language === 'es' ? [
        'Exchange reconocido',
        'Buenas tasas',
        'Sistema seguro',
        'Soporte profesional'
      ] : [
        'Recognized exchange',
        'Good rates',
        'Secure system',
        'Professional support'
      ],
      cons: language === 'es' ? [
        'Volumen menor que Binance',
        'Menos popular en Bolivia'
      ] : [
        'Lower volume than Binance',
        'Less popular in Bolivia'
      ],
      bestFor: language === 'es' ? 'Usuarios que buscan diversificar' : 'Users seeking diversification',
      link: 'https://www.bybit.com',
      referralLink: 'https://www.bybit.com',
      rate: language === 'es' ? 'Buena' : 'Good',
      security: language === 'es' ? 'Alta' : 'High',
      speed: language === 'es' ? 'Rápido (10-25 min)' : 'Fast (10-25 min)',
      fees: language === 'es' ? 'Sin comisiones' : 'No fees',
      minAmount: language === 'es' ? '$10 USD' : '$10 USD',
      paymentMethods: language === 'es' ? 'Transferencia bancaria' : 'Bank transfer'
    }
  ];

  // Comparison schema for structured data
  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "ComparisonPage",
    "name": language === 'es' 
      ? "Mejores Plataformas para Comprar Dólares en Bolivia 2025"
      : "Best Platforms to Buy Dollars in Bolivia 2025",
    "description": language === 'es'
      ? "Comparación completa de las mejores plataformas P2P para comprar y vender dólares en Bolivia: Binance, Airtm, Wallbit, ElDorado P2P, Bitget y Bybit."
      : "Complete comparison of the best P2P platforms to buy and sell dollars in Bolivia: Binance, Airtm, Wallbit, ElDorado P2P, Bitget and Bybit.",
    "about": {
      "@type": "Thing",
      "name": language === 'es' ? "Plataformas P2P Bolivia" : "P2P Platforms Bolivia"
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 transition-colors">
      <PageMeta
        title={language === 'es' 
          ? 'Mejores Plataformas para Comprar Dólares en Bolivia 2025 | Comparación Completa'
          : 'Best Platforms to Buy Dollars in Bolivia 2025 | Complete Comparison'}
        description={language === 'es'
          ? 'Comparación completa de las mejores plataformas P2P para comprar dólares en Bolivia: Binance P2P, Airtm, Wallbit, ElDorado P2P, Bitget y Bybit. Tasas, seguridad, velocidad y más.'
          : 'Complete comparison of the best P2P platforms to buy dollars in Bolivia: Binance P2P, Airtm, Wallbit, ElDorado P2P, Bitget and Bybit. Rates, security, speed and more.'}
        keywords={language === 'es'
          ? 'mejores plataformas comprar dólares bolivia, binance p2p bolivia, airtm bolivia, wallbit bolivia, comparación plataformas p2p, dónde comprar dólares bolivia, plataformas cambio dólar bolivia'
          : 'best platforms buy dollars bolivia, binance p2p bolivia, airtm bolivia, wallbit bolivia, p2p platforms comparison, where to buy dollars bolivia, dollar exchange platforms bolivia'}
        canonical="/plataformas"
        structuredData={[comparisonSchema]}
      />

      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' 
              ? '🏆 Mejores Plataformas para Comprar Dólares en Bolivia'
              : '🏆 Best Platforms to Buy Dollars in Bolivia'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {language === 'es'
              ? 'Comparación completa de las principales plataformas P2P para comprar y vender dólares en Bolivia. Encuentra la mejor opción según tus necesidades.'
              : 'Complete comparison of the main P2P platforms to buy and sell dollars in Bolivia. Find the best option according to your needs.'}
          </p>
        </div>

        {/* Quick Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-12 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Comparación Rápida' : 'Quick Comparison'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Plataforma' : 'Platform'}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Calificación' : 'Rating'}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Tasa' : 'Rate'}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Seguridad' : 'Security'}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Velocidad' : 'Speed'}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {language === 'es' ? 'Comisiones' : 'Fees'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((platform) => (
                  <tr key={platform.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platform.logo}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {renderStars(platform.rating)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                      {platform.rate}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                      {platform.security}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                      {platform.speed}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                      {platform.fees}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Platform Cards */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? 'Análisis Detallado por Plataforma' : 'Detailed Analysis by Platform'}
          </h2>
          
          {platforms.map((platform, index) => (
            <div 
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Platform Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{platform.logo}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {platform.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {renderStars(platform.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({platform.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    <strong>{language === 'es' ? 'Mejor para:' : 'Best for:'}</strong> {platform.bestFor}
                  </p>

                  {/* Pros */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {language === 'es' ? 'Ventajas' : 'Advantages'}
                    </h4>
                    <ul className="space-y-1.5">
                      {platform.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      {language === 'es' ? 'Desventajas' : 'Disadvantages'}
                    </h4>
                    <ul className="space-y-1.5">
                      {platform.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Details & CTA */}
                <div className="md:w-80 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {language === 'es' ? 'Detalles' : 'Details'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Tasa:' : 'Rate:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Seguridad:' : 'Security:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.security}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Velocidad:' : 'Speed:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Comisiones:' : 'Fees:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.fees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Mínimo:' : 'Minimum:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.minAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'es' ? 'Pagos:' : 'Payments:'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-right max-w-[150px]">
                          {platform.paymentMethods}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={platform.referralLink || platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackNavigation(platform.link, platform.name, 'external')}
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                  >
                    {language === 'es' ? `Ir a ${platform.name}` : `Go to ${platform.name}`}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-12 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '💡 Nuestras Recomendaciones' : '💡 Our Recommendations'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '🥇 Para las mejores tasas:' : '🥇 For best rates:'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Binance P2P ofrece las tasas más competitivas del mercado gracias a su alta liquidez y volumen de transacciones. Es la mejor opción si buscas maximizar el valor de tu cambio.'
                  : 'Binance P2P offers the most competitive rates in the market thanks to its high liquidity and transaction volume. It\'s the best option if you want to maximize the value of your exchange.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '🎯 Para principiantes:' : '🎯 For beginners:'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Airtm es la opción más fácil de usar, con una interfaz intuitiva y buen soporte al cliente. Ideal si es tu primera vez usando plataformas P2P.'
                  : 'Airtm is the easiest to use option, with an intuitive interface and good customer support. Ideal if it\'s your first time using P2P platforms.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '⚡ Para transacciones rápidas:' : '⚡ For fast transactions:'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Binance P2P y Bitget P2P ofrecen las transacciones más rápidas, completándose en 5-20 minutos en promedio.'
                  : 'Binance P2P and Bitget P2P offer the fastest transactions, completing in 5-20 minutes on average.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '🔒 Para máxima seguridad:' : '🔒 For maximum security:'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Binance P2P, Bitget y Bybit tienen sistemas de garantía integrados que protegen tanto a compradores como vendedores durante las transacciones.'
                  : 'Binance P2P, Bitget and Bybit have integrated escrow systems that protect both buyers and sellers during transactions.'}
              </p>
            </div>
          </div>
        </div>

        {/* How to Choose Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {language === 'es' ? '📋 Cómo Elegir la Mejor Plataforma' : '📋 How to Choose the Best Platform'}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '1. Considera el monto de tu transacción' : '1. Consider your transaction amount'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Para montos pequeños ($10-50), Airtm es ideal. Para montos grandes ($100+), Binance P2P ofrece mejores tasas.'
                  : 'For small amounts ($10-50), Airtm is ideal. For large amounts ($100+), Binance P2P offers better rates.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '2. Evalúa tu experiencia' : '2. Evaluate your experience'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Si eres nuevo en P2P, comienza con Airtm o Wallbit. Si tienes experiencia, Binance P2P te dará las mejores opciones.'
                  : 'If you\'re new to P2P, start with Airtm or Wallbit. If you have experience, Binance P2P will give you the best options.'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '3. Revisa los métodos de pago' : '3. Check payment methods'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Asegúrate de que la plataforma acepte tu método de pago preferido (transferencia bancaria, efectivo, etc.).'
                  : 'Make sure the platform accepts your preferred payment method (bank transfer, cash, etc.).'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'es' ? '4. Compara las tasas en tiempo real' : '4. Compare rates in real-time'}
              </h3>
              <p>
                {language === 'es'
                  ? 'Las tasas cambian constantemente. Usa nuestra calculadora y compara las tasas actuales antes de decidir.'
                  : 'Rates change constantly. Use our calculator and compare current rates before deciding.'}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚠️</span>
            {language === 'es' ? 'Consejos de Seguridad' : 'Safety Tips'}
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
              <span>
                {language === 'es'
                  ? 'Siempre verifica la reputación del vendedor antes de realizar una transacción'
                  : 'Always verify the seller\'s reputation before making a transaction'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
              <span>
                {language === 'es'
                  ? 'Usa solo plataformas con sistema de garantía (escrow) integrado'
                  : 'Only use platforms with integrated escrow system'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
              <span>
                {language === 'es'
                  ? 'Nunca completes el pago fuera de la plataforma'
                  : 'Never complete payment outside the platform'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
              <span>
                {language === 'es'
                  ? 'Lee las reseñas y comentarios de otros usuarios'
                  : 'Read reviews and comments from other users'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
              <span>
                {language === 'es'
                  ? 'Comienza con transacciones pequeñas para familiarizarte con el proceso'
                  : 'Start with small transactions to familiarize yourself with the process'}
              </span>
            </li>
          </ul>
        </div>

        {/* Related Links */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'es' ? '🔗 Páginas Relacionadas' : '🔗 Related Pages'}
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/comprar-dolares"
              onClick={() => trackNavigation('/comprar-dolares', language === 'es' ? 'Comprar Dólares' : 'Buy Dollars', 'internal')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '📖 Guía: Cómo Comprar Dólares' : '📖 Guide: How to Buy Dollars'}
            </Link>
            <Link
              to="/binance-p2p-bolivia"
              onClick={() => trackNavigation('/binance-p2p-bolivia', 'Binance P2P Bolivia', 'internal')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '🟡 Binance P2P Bolivia' : '🟡 Binance P2P Bolivia'}
            </Link>
            <Link
              to="/calculadora"
              onClick={() => trackNavigation('/calculadora', language === 'es' ? 'Calculadora' : 'Calculator', 'internal')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '💱 Calculadora de Divisas' : '💱 Currency Calculator'}
            </Link>
            <Link
              to="/bancos"
              onClick={() => trackNavigation('/bancos', language === 'es' ? 'Bancos' : 'Banks', 'internal')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {language === 'es' ? '🏦 Restricciones Bancarias' : '🏦 Bank Restrictions'}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Plataformas;

