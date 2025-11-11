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
    aboutTitle: 'Acerca de',
    aboutMethodology: 'Metodología',
    aboutMethodologyDesc: 'Este dashboard rastrea el tipo de cambio del mercado paralelo boliviano ("dólar blue") mediante el análisis de ofertas P2P de Binance para USDT↔BOB. Calculamos la mediana de las 20 mejores ofertas de compra y venta cada 15 minutos.',
    aboutDataSources: 'Fuentes de Datos',
    aboutDataSourcesDesc: 'Los datos del mercado blue provienen de la API P2P de Binance. Las tasas oficiales se obtienen del Banco Central de Bolivia. Las noticias se recopilan de medios bolivianos confiables.',
    aboutCaveats: 'Advertencias',
    aboutCaveatsDesc: 'Esto refleja datos del mercado informal. Los precios reales pueden variar según la ubicación, el volumen y el método de pago. Este sitio es solo para fines informativos, no para asesoramiento financiero.',
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
    aboutTitle: 'About',
    aboutMethodology: 'Methodology',
    aboutMethodologyDesc: 'This dashboard tracks the Bolivian parallel market exchange rate ("blue dollar") by analyzing Binance P2P offers for USDT↔BOB. We compute the median of the top 20 buy and sell offers every 15 minutes.',
    aboutDataSources: 'Data Sources',
    aboutDataSourcesDesc: 'Blue market data comes from the Binance P2P API. Official rates are sourced from the Central Bank of Bolivia. News is aggregated from trusted Bolivian media outlets.',
    aboutCaveats: 'Caveats',
    aboutCaveatsDesc: 'This reflects informal market data. Actual prices may vary based on location, volume, and payment method. This site is for informational purposes only, not financial advice.',
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

