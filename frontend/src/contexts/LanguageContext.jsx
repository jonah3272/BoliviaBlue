import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  es: {
    // Header
    title: 'Bolivia Blue con Paz',
    subtitle: 'Siguiendo el pulso del Boliviano bajo el Presidente Paz',
    
    // Rate Cards
    buy: 'COMPRAR',
    sell: 'VENDER',
    perUSD: 'Bs. por USD',
    updated: 'Actualizado',
    stale: 'Desactualizado',
    change24h: '24h',
    blueMarketTitle: 'Mercado Paralelo (Dólar Blue) - Binance P2P',
    officialRateTitle: 'Tipo de Cambio Oficial - Banco Central de Bolivia',
    
    // Chart
    chartTitle: 'Histórico del Dólar Blue',
    timeRanges: {
      '1D': '1D',
      '1W': '1S',
      '1M': '1M',
      '1Y': '1A',
      'ALL': 'Todo'
    },
    blueRate: 'Dólar Blue',
    officialRate: 'Oficial',
    collectingData: 'Recopilando datos históricos...',
    collectingDataDesc: 'El sistema actualiza cada 15 minutos. Los datos históricos se acumularán con el tiempo.',
    fewDataPoints: '📊 Datos recientes',
    fewDataPointsDesc: 'punto | puntos. El gráfico mejorará a medida que se acumulen más datos cada 15 minutos.',
    chartBuy: 'Compra',
    chartSell: 'Venta',
    
    // News
    newsTitle: 'Noticias Económicas',
    newsLoading: 'Cargando noticias...',
    newsError: 'No se pudieron cargar las noticias',
    newsEmpty: 'No hay noticias disponibles en este momento',
    newsSentiment: {
      up: 'Alcista',
      down: 'Bajista',
      neutral: 'Neutral'
    },
    
    // About
    aboutTitle: 'Acerca de Bolivia Blue con Paz',
    aboutMethodology: 'Metodología',
    aboutMethodologyDesc: 'Este sitio rastrea dos tipos de cambio en Bolivia:',
    aboutBlueMarket: 'Mercado Paralelo (Dólar Blue):',
    aboutBlueMarketDesc: 'Datos de ofertas públicas de Binance P2P para el par USDT/BOB. Calculamos la mediana de las ofertas de compra y venta para obtener una estimación representativa del mercado informal.',
    aboutOfficialRate: 'Tipo de Cambio Oficial:',
    aboutOfficialRateDesc: 'Tasa controlada por el Banco Central de Bolivia (BCB), utilizada por bancos y casas de cambio autorizadas. Esta tasa es típicamente fija o se ajusta con muy poca frecuencia.',
    aboutDataSources: 'Fuentes de datos',
    aboutDataSource1: 'Dólar Blue: Binance P2P API (USDT/BOB)',
    aboutDataSource2: 'Tipo de Cambio Oficial: Banco Central de Bolivia / APIs de mercado',
    aboutDataSource3: 'Noticias: Medios bolivianos verificados (El Deber, Página Siete, La Razón, etc.)',
    aboutDataSource4: 'Frecuencia de actualización: cada 15 minutos',
    aboutCaveats: 'Advertencias importantes',
    aboutCaveatsTitle: 'El dólar blue refleja el mercado informal.',
    aboutCaveatsDesc: 'Los tipos de cambio del mercado paralelo pueden variar significativamente del tipo de cambio oficial del Banco Central de Bolivia. La diferencia (spread) entre ambos indica la presión del mercado y puede reflejar escasez de divisas, expectativas de devaluación, o restricciones cambiarias. Use esta información únicamente como referencia. No nos hacemos responsables de decisiones financieras tomadas con base en estos datos.',
    aboutTransparency: 'Transparencia',
    aboutTransparencyDesc: 'Este es un proyecto de código abierto creado para proporcionar visibilidad sobre el mercado cambiario boliviano durante la presidencia de Rodrigo Paz. El código fuente está disponible públicamente para revisión y auditoría.',
    aboutLastUpdate: 'Última actualización del sistema: Noviembre 2025',
    aboutRepo: 'Ver código en GitHub',
    
    // Footer
    footerText: 'Hecho con datos abiertos para transparencia.',
    footerUpdates: 'Actualizaciones cada 15 minutos',
    
    // Loading & Errors
    loading: 'Cargando...',
    error: 'Error al cargar datos',
    retry: 'Reintentar',
    noData: 'Sin datos disponibles'
  },
  
  en: {
    // Header
    title: 'Bolivia Blue with Peace',
    subtitle: 'Tracking the Boliviano\'s pulse under President Paz',
    
    // Rate Cards
    buy: 'BUY',
    sell: 'SELL',
    perUSD: 'Bs. per USD',
    updated: 'Updated',
    stale: 'Stale',
    change24h: '24h',
    blueMarketTitle: 'Parallel Market (Blue Dollar) - Binance P2P',
    officialRateTitle: 'Official Exchange Rate - Central Bank of Bolivia',
    
    // Chart
    chartTitle: 'Blue Dollar History',
    timeRanges: {
      '1D': '1D',
      '1W': '1W',
      '1M': '1M',
      '1Y': '1Y',
      'ALL': 'All'
    },
    blueRate: 'Blue Dollar',
    officialRate: 'Official',
    collectingData: 'Collecting historical data...',
    collectingDataDesc: 'The system updates every 15 minutes. Historical data will accumulate over time.',
    fewDataPoints: '📊 Recent data',
    fewDataPointsDesc: 'point | points. The chart will improve as more data accumulates every 15 minutes.',
    chartBuy: 'Buy',
    chartSell: 'Sell',
    
    // News
    newsTitle: 'Economic News',
    newsLoading: 'Loading news...',
    newsError: 'Failed to load news',
    newsEmpty: 'No news available at this time',
    newsSentiment: {
      up: 'Bullish',
      down: 'Bearish',
      neutral: 'Neutral'
    },
    
    // About
    aboutTitle: 'About Bolivia Blue with Peace',
    aboutMethodology: 'Methodology',
    aboutMethodologyDesc: 'This site tracks two types of exchange rates in Bolivia:',
    aboutBlueMarket: 'Parallel Market (Blue Dollar):',
    aboutBlueMarketDesc: 'Data from public Binance P2P offers for the USDT/BOB pair. We calculate the median of buy and sell offers to obtain a representative estimate of the informal market.',
    aboutOfficialRate: 'Official Exchange Rate:',
    aboutOfficialRateDesc: 'Rate controlled by the Central Bank of Bolivia (BCB), used by banks and authorized exchange houses. This rate is typically fixed or adjusted very infrequently.',
    aboutDataSources: 'Data sources',
    aboutDataSource1: 'Blue Dollar: Binance P2P API (USDT/BOB)',
    aboutDataSource2: 'Official Exchange Rate: Central Bank of Bolivia / market APIs',
    aboutDataSource3: 'News: Verified Bolivian media (El Deber, Página Siete, La Razón, etc.)',
    aboutDataSource4: 'Update frequency: every 15 minutes',
    aboutCaveats: 'Important warnings',
    aboutCaveatsTitle: 'The blue dollar reflects the informal market.',
    aboutCaveatsDesc: 'Parallel market exchange rates may vary significantly from the official exchange rate of the Central Bank of Bolivia. The difference (spread) between both indicates market pressure and may reflect foreign currency shortages, devaluation expectations, or exchange restrictions. Use this information only as a reference. We are not responsible for financial decisions made based on this data.',
    aboutTransparency: 'Transparency',
    aboutTransparencyDesc: 'This is an open source project created to provide visibility into the Bolivian exchange market during the presidency of Rodrigo Paz. The source code is publicly available for review and audit.',
    aboutLastUpdate: 'Last system update: November 2025',
    aboutRepo: 'View code on GitHub',
    
    // Footer
    footerText: 'Made with open data for transparency.',
    footerUpdates: 'Updates every 15 minutes',
    
    // Loading & Errors
    loading: 'Loading...',
    error: 'Error loading data',
    retry: 'Retry',
    noData: 'No data available'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Default to Spanish
    const saved = localStorage.getItem('language');
    return saved || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

