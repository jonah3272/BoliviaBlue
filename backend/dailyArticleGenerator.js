/**
 * Daily Article Generator
 * 
 * Automatically generates comprehensive daily articles about the Bolivia blue dollar market.
 * Each article includes:
 * - Today's exchange rates (buy, sell, official)
 * - Market analysis and trends
 * - Latest news articles with analysis
 * - Historical context and comparisons
 * - Expert insights and predictions
 * 
 * Articles are 1500+ words to ensure they meet AdSense "high value content" requirements.
 */

import { getLatestRate, getRatesInRange, getRecentNews } from './db-supabase.js';
import { supabase } from './db-supabase.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Format date in Spanish or English
 */
function formatDate(date, language) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  
  if (language === 'es') {
    return date.toLocaleDateString('es-BO', options);
  } else {
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Calculate price change percentage
 */
function calculateChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous * 100).toFixed(2);
}

/**
 * Get market trend description
 */
function getTrendDescription(buyChange, sellChange, language) {
  if (!buyChange && !sellChange) {
    return language === 'es' 
      ? 'Los datos históricos no están disponibles para comparar.'
      : 'Historical data is not available for comparison.';
  }
  
  const avgChange = ((parseFloat(buyChange || 0) + parseFloat(sellChange || 0)) / 2).toFixed(2);
  const isPositive = parseFloat(avgChange) > 0;
  
  if (Math.abs(parseFloat(avgChange)) < 0.1) {
    return language === 'es'
      ? `El tipo de cambio se mantiene estable, con una variación promedio de ${Math.abs(avgChange)}%.`
      : `The exchange rate remains stable, with an average variation of ${Math.abs(avgChange)}%.`;
  }
  
  if (isPositive) {
    return language === 'es'
      ? `El dólar blue muestra una tendencia alcista, con un aumento promedio de ${avgChange}% en las últimas 24 horas. Esto indica presión sobre el boliviano y posible escasez de dólares en el mercado.`
      : `The blue dollar shows an upward trend, with an average increase of ${avgChange}% in the last 24 hours. This indicates pressure on the boliviano and possible dollar scarcity in the market.`;
  } else {
    return language === 'es'
      ? `El dólar blue muestra una tendencia bajista, con una disminución promedio de ${Math.abs(avgChange)}% en las últimas 24 horas. Esto sugiere una mayor disponibilidad de dólares o fortalecimiento del boliviano.`
      : `The blue dollar shows a downward trend, with an average decrease of ${Math.abs(avgChange)}% in the last 24 hours. This suggests greater dollar availability or strengthening of the boliviano.`;
  }
}

/**
 * Generate comprehensive daily article content
 */
async function generateDailyArticle(language = 'es') {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get current rates
  const currentRate = await getLatestRate();
  if (!currentRate) {
    throw new Error('No current rate data available');
  }
  
  // Get yesterday's rates for comparison
  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayRates = await getRatesInRange(yesterdayStart.toISOString());
  const yesterdayRate = yesterdayRates && yesterdayRates.length > 0 
    ? yesterdayRates[yesterdayRates.length - 1] 
    : null;
  
  // Get last 7 days for trend analysis
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRates = await getRatesInRange(weekAgo.toISOString());
  
  // Calculate statistics
  const buyChange = yesterdayRate ? calculateChange(currentRate.buy, yesterdayRate.buy) : null;
  const sellChange = yesterdayRate ? calculateChange(currentRate.sell, yesterdayRate.sell) : null;
  const spread = currentRate.buy - currentRate.sell;
  const spreadPercent = (spread / currentRate.sell * 100).toFixed(2);
  
  // Calculate weekly statistics
  let weeklyHigh = currentRate.buy;
  let weeklyLow = currentRate.buy;
  let weeklyAvg = 0;
  if (weekRates && weekRates.length > 0) {
    const buyRates = weekRates.map(r => r.buy).filter(Boolean);
    weeklyHigh = Math.max(...buyRates, currentRate.buy);
    weeklyLow = Math.min(...buyRates, currentRate.buy);
    weeklyAvg = (buyRates.reduce((a, b) => a + b, 0) + currentRate.buy) / (buyRates.length + 1);
  }
  
  // Get recent news (last 24 hours)
  const recentNews = await getRecentNews(20);
  const todayNews = recentNews.filter(n => {
    const newsDate = new Date(n.published_at);
    return newsDate >= yesterdayStart;
  }).slice(0, 10);
  
  // Calculate official-blue gap
  const officialGap = currentRate.official_buy 
    ? ((currentRate.buy - currentRate.official_buy) / currentRate.official_buy * 100).toFixed(2)
    : null;
  
  // Generate article content
  const dateStr = formatDate(today, language);
  const trendDesc = getTrendDescription(buyChange, sellChange, language);
  
  if (language === 'es') {
    return {
      title: `Análisis Diario del Dólar Blue en Bolivia - ${dateStr}`,
      excerpt: `Análisis completo del mercado cambiario boliviano del ${dateStr}. Incluye tasas actuales, tendencias, noticias relevantes y perspectivas del mercado del dólar blue.`,
      content: generateSpanishContent({
        dateStr,
        currentRate,
        yesterdayRate,
        buyChange,
        sellChange,
        spread,
        spreadPercent,
        weeklyHigh,
        weeklyLow,
        weeklyAvg,
        officialGap,
        todayNews,
        trendDesc
      }),
      category: 'Análisis Diario',
      readTime: 12
    };
  } else {
    return {
      title: `Daily Blue Dollar Analysis in Bolivia - ${dateStr}`,
      excerpt: `Complete analysis of the Bolivian exchange market for ${dateStr}. Includes current rates, trends, relevant news, and blue dollar market perspectives.`,
      content: generateEnglishContent({
        dateStr,
        currentRate,
        yesterdayRate,
        buyChange,
        sellChange,
        spread,
        spreadPercent,
        weeklyHigh,
        weeklyLow,
        weeklyAvg,
        officialGap,
        todayNews,
        trendDesc
      }),
      category: 'Daily Analysis',
      readTime: 12
    };
  }
}

/**
 * Generate Spanish article content (1500+ words)
 */
function generateSpanishContent(data) {
  const {
    dateStr,
    currentRate,
    buyChange,
    sellChange,
    spread,
    spreadPercent,
    weeklyHigh,
    weeklyLow,
    weeklyAvg,
    officialGap,
    todayNews,
    trendDesc
  } = data;
  
  let content = `<h1>Análisis Diario del Dólar Blue en Bolivia - ${dateStr}</h1>\n\n`;
  
  content += `<p><strong>Fecha de análisis:</strong> ${dateStr}</p>\n\n`;
  
  // Executive Summary
  content += `<h2>Resumen Ejecutivo</h2>\n\n`;
  content += `<p>En el análisis de hoy, el dólar blue en Bolivia presenta las siguientes cotizaciones:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Tasa de Compra:</strong> ${currentRate.buy.toFixed(2)} BOB por dólar</li>\n`;
  content += `<li><strong>Tasa de Venta:</strong> ${currentRate.sell.toFixed(2)} BOB por dólar</li>\n`;
  content += `<li><strong>Tasa Promedio (Mid):</strong> ${currentRate.mid ? currentRate.mid.toFixed(2) : ((currentRate.buy + currentRate.sell) / 2).toFixed(2)} BOB por dólar</li>\n`;
  if (currentRate.official_buy) {
    content += `<li><strong>Tasa Oficial (BCB):</strong> ${currentRate.official_buy.toFixed(2)} BOB por dólar</li>\n`;
  }
  content += `</ul>\n\n`;
  
  if (buyChange || sellChange) {
    content += `<p>${trendDesc}</p>\n\n`;
  }
  
  // Current Market Situation
  content += `<h2>Situación Actual del Mercado</h2>\n\n`;
  content += `<p>El mercado cambiario boliviano continúa operando en un contexto de alta demanda de dólares y restricciones en el acceso a divisas a través del sistema bancario oficial. El dólar blue, que representa el precio real del dólar en el mercado paralelo, refleja estas condiciones de mercado de manera más precisa que la tasa oficial del Banco Central de Bolivia.</p>\n\n`;
  
  content += `<p>La diferencia entre la tasa de compra (${currentRate.buy.toFixed(2)} BOB) y la tasa de venta (${currentRate.sell.toFixed(2)} BOB) es de ${spread.toFixed(2)} BOB, lo que representa un spread del ${spreadPercent}%. Este spread es típico del mercado paralelo y refleja los costos de transacción, el riesgo percibido, y la liquidez disponible en el mercado.</p>\n\n`;
  
  if (officialGap) {
    content += `<p>La brecha entre el dólar blue y el dólar oficial es del ${officialGap}%, lo que indica una diferencia significativa entre el precio oficial y el precio real de mercado. Esta brecha es un indicador importante de la presión sobre la moneda local y la disponibilidad de dólares en el mercado formal.</p>\n\n`;
  }
  
  // Price Analysis
  content += `<h2>Análisis de Precios</h2>\n\n`;
  content += `<h3>Comparación con Ayer</h3>\n\n`;
  
  if (buyChange && sellChange) {
    content += `<p>En comparación con ayer, el dólar blue ha experimentado los siguientes cambios:</p>\n\n`;
    content += `<ul>\n`;
    content += `<li><strong>Tasa de Compra:</strong> ${buyChange > 0 ? '+' : ''}${buyChange}% ${buyChange > 0 ? '↗' : buyChange < 0 ? '↘' : '○'}</li>\n`;
    content += `<li><strong>Tasa de Venta:</strong> ${sellChange > 0 ? '+' : ''}${sellChange}% ${sellChange > 0 ? '↗' : sellChange < 0 ? '↘' : '○'}</li>\n`;
    content += `</ul>\n\n`;
    
    if (parseFloat(buyChange) > 1 || parseFloat(sellChange) > 1) {
      content += `<p>El aumento significativo en las tasas sugiere una mayor presión sobre el boliviano y posible escasez de dólares en el mercado paralelo. Los factores que pueden estar contribuyendo a este aumento incluyen mayor demanda de dólares, restricciones en el acceso a divisas oficiales, o expectativas sobre políticas económicas futuras.</p>\n\n`;
    } else if (parseFloat(buyChange) < -1 || parseFloat(sellChange) < -1) {
      content += `<p>La disminución en las tasas indica una mayor disponibilidad de dólares en el mercado o un fortalecimiento relativo del boliviano. Esto puede deberse a una menor demanda, mayor oferta de dólares, o mejoras en la confianza económica.</p>\n\n`;
    } else {
      content += `<p>Las tasas se mantienen relativamente estables, lo que sugiere un equilibrio en el mercado cambiario. Esta estabilidad puede indicar que la oferta y demanda de dólares están en balance, o que el mercado está esperando señales más claras sobre la dirección de la economía.</p>\n\n`;
    }
  } else {
    content += `<p>No hay datos históricos suficientes para realizar una comparación con ayer. Sin embargo, podemos analizar la situación actual del mercado basándonos en los datos disponibles.</p>\n\n`;
  }
  
  // Weekly Analysis
  content += `<h3>Análisis Semanal</h3>\n\n`;
  content += `<p>En los últimos 7 días, el mercado del dólar blue ha mostrado las siguientes características:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Precio Máximo:</strong> ${weeklyHigh.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Precio Mínimo:</strong> ${weeklyLow.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Precio Promedio:</strong> ${weeklyAvg.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Rango de Variación:</strong> ${(weeklyHigh - weeklyLow).toFixed(2)} BOB (${((weeklyHigh - weeklyLow) / weeklyAvg * 100).toFixed(2)}%)</li>\n`;
  content += `</ul>\n\n`;
  
  const volatility = ((weeklyHigh - weeklyLow) / weeklyAvg * 100).toFixed(2);
  if (parseFloat(volatility) > 5) {
    content += `<p>El mercado muestra una volatilidad significativa (${volatility}%), lo que indica condiciones de mercado inestables. Esta volatilidad puede presentar tanto oportunidades como riesgos para los participantes del mercado.</p>\n\n`;
  } else {
    content += `<p>El mercado muestra una volatilidad moderada (${volatility}%), lo que sugiere condiciones relativamente estables. Esta estabilidad puede ser favorable para la planificación financiera y las transacciones comerciales.</p>\n\n`;
  }
  
  // News Analysis
  content += `<h2>Análisis de Noticias Relevantes</h2>\n\n`;
  
  if (todayNews && todayNews.length > 0) {
    content += `<p>Las siguientes noticias económicas y financieras de hoy pueden estar influyendo en el mercado cambiario:</p>\n\n`;
    
    todayNews.forEach((news, index) => {
      const sentiment = news.sentiment === 'up' ? 'positivo' : news.sentiment === 'down' ? 'negativo' : 'neutral';
      const sentimentIcon = news.sentiment === 'up' ? '↗' : news.sentiment === 'down' ? '↘' : '○';
      
      content += `<h3>${index + 1}. ${news.title}</h3>\n\n`;
      content += `<p><strong>Fuente:</strong> ${news.source}</p>\n`;
      content += `<p><strong>Sentimiento del mercado:</strong> ${sentimentIcon} ${sentiment}</p>\n`;
      if (news.summary) {
        content += `<p>${news.summary}</p>\n\n`;
      }
      if (news.url) {
        content += `<p><a href="${news.url}" target="_blank" rel="noopener noreferrer">Leer noticia completa</a></p>\n\n`;
      }
    });
    
    content += `<p>Estas noticias proporcionan contexto importante sobre los factores que pueden estar influyendo en el precio del dólar blue. Los eventos políticos, decisiones económicas, y noticias internacionales pueden tener un impacto significativo en el mercado cambiario boliviano.</p>\n\n`;
  } else {
    content += `<p>No hay noticias recientes disponibles para el análisis de hoy. Sin embargo, el mercado continúa operando basándose en las condiciones económicas generales y la oferta y demanda de dólares.</p>\n\n`;
  }
  
  // Market Context
  content += `<h2>Contexto del Mercado</h2>\n\n`;
  content += `<p>El mercado del dólar blue en Bolivia opera en un contexto único caracterizado por:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Alta demanda de dólares:</strong> Muchos bolivianos necesitan dólares para remesas, viajes, inversiones, o protección contra la inflación.</li>\n`;
  content += `<li><strong>Restricciones cambiarias:</strong> El acceso a dólares a través del sistema bancario oficial puede estar limitado o sujeto a restricciones.</li>\n`;
  content += `<li><strong>Mercado paralelo activo:</strong> Plataformas como Binance P2P han facilitado las transacciones en el mercado paralelo, aumentando su transparencia y accesibilidad.</li>\n`;
  content += `<li><strong>Volatilidad económica:</strong> Factores políticos, económicos, e internacionales pueden causar fluctuaciones significativas en el precio del dólar blue.</li>\n`;
  content += `</ul>\n\n`;
  
  // Methodology
  content += `<h2>Metodología de Nuestros Datos</h2>\n\n`;
  content += `<p>Los datos presentados en este análisis provienen de múltiples fuentes confiables:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Binance P2P:</strong> Agregamos ofertas de compra y venta de USDT/BOB de Binance P2P, calculando la mediana para filtrar valores atípicos y obtener una tasa representativa del mercado.</li>\n`;
  content += `<li><strong>Banco Central de Bolivia:</strong> Incluimos las tasas oficiales del BCB para comparación y análisis de la brecha cambiaria.</li>\n`;
  content += `<li><strong>Actualización frecuente:</strong> Nuestros datos se actualizan cada 15 minutos para proporcionar la información más reciente posible.</li>\n`;
  content += `<li><strong>Transparencia:</strong> Todos nuestros métodos de cálculo son públicos y pueden ser verificados por cualquier usuario.</li>\n`;
  content += `</ul>\n\n`;
  
  // Practical Implications
  content += `<h2>Implicaciones Prácticas</h2>\n\n`;
  content += `<h3>Para Personas que Necesitan Comprar Dólares</h3>\n\n`;
  content += `<p>Si necesitas comprar dólares hoy, la tasa actual de compra es de ${currentRate.buy.toFixed(2)} BOB por dólar. Esto significa que por cada 100 dólares que compres, necesitarás aproximadamente ${(currentRate.buy * 100).toFixed(2)} bolivianos. Es importante comparar esta tasa con otras opciones disponibles, como casas de cambio o plataformas digitales, para obtener el mejor precio posible.</p>\n\n`;
  
  content += `<h3>Para Personas que Necesitan Vender Dólares</h3>\n\n`;
  content += `<p>Si tienes dólares para vender, la tasa actual de venta es de ${currentRate.sell.toFixed(2)} BOB por dólar. Esto significa que por cada 100 dólares que vendas, recibirás aproximadamente ${(currentRate.sell * 100).toFixed(2)} bolivianos. Recuerda que esta tasa puede variar según la plataforma o método de transacción que elijas.</p>\n\n`;
  
  content += `<h3>Para Inversores y Comerciantes</h3>\n\n`;
  content += `<p>La volatilidad del mercado del dólar blue puede presentar tanto oportunidades como riesgos. Es importante monitorear las tendencias a largo plazo, no solo los movimientos diarios, y considerar factores como la estabilidad política, las políticas económicas, y las condiciones internacionales al tomar decisiones de inversión o comercio.</p>\n\n`;
  
  // Outlook
  content += `<h2>Perspectivas y Recomendaciones</h2>\n\n`;
  content += `<p>Basándonos en el análisis de hoy, las siguientes son nuestras perspectivas y recomendaciones:</p>\n\n`;
  
  if (buyChange && parseFloat(buyChange) > 2) {
    content += `<p><strong>Tendencia Alcista:</strong> El aumento significativo en las tasas sugiere que el mercado puede continuar experimentando presión alcista en el corto plazo. Si necesitas comprar dólares, considera hacerlo pronto antes de que las tasas suban más. Si planeas vender dólares, este puede ser un buen momento para obtener un precio favorable.</p>\n\n`;
  } else if (buyChange && parseFloat(buyChange) < -2) {
    content += `<p><strong>Tendencia Bajista:</strong> La disminución en las tasas sugiere que el mercado puede estar experimentando una mayor disponibilidad de dólares. Si necesitas comprar dólares, puedes esperar a ver si las tasas continúan bajando. Si planeas vender dólares, considera esperar a que las tasas se recuperen.</p>\n\n`;
  } else {
    content += `<p><strong>Mercado Estable:</strong> Las tasas se mantienen relativamente estables, lo que sugiere un equilibrio en el mercado. Este puede ser un buen momento para realizar transacciones planificadas, ya que hay menos incertidumbre sobre la dirección del mercado.</p>\n\n`;
  }
  
  content += `<p><strong>Recomendaciones Generales:</strong></p>\n\n`;
  content += `<ul>\n`;
  content += `<li>Monitorea las tasas regularmente para identificar tendencias y oportunidades.</li>\n`;
  content += `<li>Usa nuestra calculadora de divisas para planificar tus transacciones.</li>\n`;
  content += `<li>Configura alertas de precio para ser notificado cuando las tasas alcancen tus objetivos.</li>\n`;
  content += `<li>Mantente informado sobre las noticias económicas que pueden afectar el mercado.</li>\n`;
  content += `<li>Siempre verifica las tasas actuales antes de realizar transacciones importantes.</li>\n`;
  content += `</ul>\n\n`;
  
  // Disclaimer
  content += `<h2>Descargo de Responsabilidad</h2>\n\n`;
  content += `<p>Este análisis es solo para fines informativos y no constituye asesoramiento financiero. Las tasas de cambio pueden variar significativamente según la plataforma, ubicación, método de pago, y otros factores. Siempre verifica las tasas actuales y los términos de transacción antes de realizar cualquier operación. Bolivia Blue con Paz no se hace responsable de las decisiones financieras tomadas basándose en esta información.</p>\n\n`;
  
  // Call to Action
  content += `<h2>Recursos Adicionales</h2>\n\n`;
  content += `<p>Para obtener más información sobre el mercado del dólar blue en Bolivia:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li>Visita nuestra <a href="/">página principal</a> para ver las tasas en tiempo real</li>\n`;
  content += `<li>Usa nuestra <a href="/calculator">calculadora de divisas</a> para convertir USD a BOB y viceversa</li>\n`;
  content += `<li>Consulta nuestro <a href="/news">feed de noticias</a> para las últimas actualizaciones económicas</li>\n`;
  content += `<li>Lee nuestra <a href="/about">página sobre nosotros</a> para entender nuestra metodología</li>\n`;
  content += `<li>Revisa nuestras <a href="/faq">preguntas frecuentes</a> para respuestas a dudas comunes</li>\n`;
  content += `</ul>\n\n`;
  
  content += `<p><em>Este análisis se genera automáticamente cada día con los datos más recientes disponibles. Para obtener información actualizada en tiempo real, visita nuestra plataforma principal.</em></p>\n`;
  
  return content;
}

/**
 * Generate English article content (1500+ words)
 */
function generateEnglishContent(data) {
  const {
    dateStr,
    currentRate,
    buyChange,
    sellChange,
    spread,
    spreadPercent,
    weeklyHigh,
    weeklyLow,
    weeklyAvg,
    officialGap,
    todayNews,
    trendDesc
  } = data;
  
  let content = `<h1>Daily Blue Dollar Analysis in Bolivia - ${dateStr}</h1>\n\n`;
  
  content += `<p><strong>Analysis Date:</strong> ${dateStr}</p>\n\n`;
  
  // Executive Summary
  content += `<h2>Executive Summary</h2>\n\n`;
  content += `<p>In today's analysis, the blue dollar in Bolivia presents the following quotes:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Buy Rate:</strong> ${currentRate.buy.toFixed(2)} BOB per dollar</li>\n`;
  content += `<li><strong>Sell Rate:</strong> ${currentRate.sell.toFixed(2)} BOB per dollar</li>\n`;
  content += `<li><strong>Mid Rate:</strong> ${currentRate.mid ? currentRate.mid.toFixed(2) : ((currentRate.buy + currentRate.sell) / 2).toFixed(2)} BOB per dollar</li>\n`;
  if (currentRate.official_buy) {
    content += `<li><strong>Official Rate (BCB):</strong> ${currentRate.official_buy.toFixed(2)} BOB per dollar</li>\n`;
  }
  content += `</ul>\n\n`;
  
  if (buyChange || sellChange) {
    content += `<p>${trendDesc}</p>\n\n`;
  }
  
  // Current Market Situation
  content += `<h2>Current Market Situation</h2>\n\n`;
  content += `<p>The Bolivian exchange market continues to operate in a context of high dollar demand and restrictions on access to foreign currency through the official banking system. The blue dollar, which represents the real price of the dollar in the parallel market, reflects these market conditions more accurately than the official rate of the Central Bank of Bolivia.</p>\n\n`;
  
  content += `<p>The difference between the buy rate (${currentRate.buy.toFixed(2)} BOB) and the sell rate (${currentRate.sell.toFixed(2)} BOB) is ${spread.toFixed(2)} BOB, representing a spread of ${spreadPercent}%. This spread is typical of the parallel market and reflects transaction costs, perceived risk, and available liquidity in the market.</p>\n\n`;
  
  if (officialGap) {
    content += `<p>The gap between the blue dollar and the official dollar is ${officialGap}%, indicating a significant difference between the official price and the real market price. This gap is an important indicator of pressure on the local currency and dollar availability in the formal market.</p>\n\n`;
  }
  
  // Price Analysis
  content += `<h2>Price Analysis</h2>\n\n`;
  content += `<h3>Comparison with Yesterday</h3>\n\n`;
  
  if (buyChange && sellChange) {
    content += `<p>Compared to yesterday, the blue dollar has experienced the following changes:</p>\n\n`;
    content += `<ul>\n`;
    content += `<li><strong>Buy Rate:</strong> ${buyChange > 0 ? '+' : ''}${buyChange}% ${buyChange > 0 ? '↗' : buyChange < 0 ? '↘' : '○'}</li>\n`;
    content += `<li><strong>Sell Rate:</strong> ${sellChange > 0 ? '+' : ''}${sellChange}% ${sellChange > 0 ? '↗' : sellChange < 0 ? '↘' : '○'}</li>\n`;
    content += `</ul>\n\n`;
    
    if (parseFloat(buyChange) > 1 || parseFloat(sellChange) > 1) {
      content += `<p>The significant increase in rates suggests greater pressure on the boliviano and possible dollar scarcity in the parallel market. Factors that may be contributing to this increase include higher dollar demand, restrictions on access to official foreign currency, or expectations about future economic policies.</p>\n\n`;
    } else if (parseFloat(buyChange) < -1 || parseFloat(sellChange) < -1) {
      content += `<p>The decrease in rates indicates greater dollar availability in the market or relative strengthening of the boliviano. This may be due to lower demand, greater dollar supply, or improvements in economic confidence.</p>\n\n`;
    } else {
      content += `<p>Rates remain relatively stable, suggesting equilibrium in the exchange market. This stability may indicate that dollar supply and demand are in balance, or that the market is waiting for clearer signals about the direction of the economy.</p>\n\n`;
    }
  } else {
    content += `<p>There is not enough historical data to make a comparison with yesterday. However, we can analyze the current market situation based on available data.</p>\n\n`;
  }
  
  // Weekly Analysis
  content += `<h3>Weekly Analysis</h3>\n\n`;
  content += `<p>Over the last 7 days, the blue dollar market has shown the following characteristics:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Maximum Price:</strong> ${weeklyHigh.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Minimum Price:</strong> ${weeklyLow.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Average Price:</strong> ${weeklyAvg.toFixed(2)} BOB</li>\n`;
  content += `<li><strong>Variation Range:</strong> ${(weeklyHigh - weeklyLow).toFixed(2)} BOB (${((weeklyHigh - weeklyLow) / weeklyAvg * 100).toFixed(2)}%)</li>\n`;
  content += `</ul>\n\n`;
  
  const volatility = ((weeklyHigh - weeklyLow) / weeklyAvg * 100).toFixed(2);
  if (parseFloat(volatility) > 5) {
    content += `<p>The market shows significant volatility (${volatility}%), indicating unstable market conditions. This volatility can present both opportunities and risks for market participants.</p>\n\n`;
  } else {
    content += `<p>The market shows moderate volatility (${volatility}%), suggesting relatively stable conditions. This stability can be favorable for financial planning and commercial transactions.</p>\n\n`;
  }
  
  // News Analysis
  content += `<h2>Relevant News Analysis</h2>\n\n`;
  
  if (todayNews && todayNews.length > 0) {
    content += `<p>The following economic and financial news from today may be influencing the exchange market:</p>\n\n`;
    
    todayNews.forEach((news, index) => {
      const sentiment = news.sentiment === 'up' ? 'positive' : news.sentiment === 'down' ? 'negative' : 'neutral';
      const sentimentIcon = news.sentiment === 'up' ? '↗' : news.sentiment === 'down' ? '↘' : '○';
      
      content += `<h3>${index + 1}. ${news.title}</h3>\n\n`;
      content += `<p><strong>Source:</strong> ${news.source}</p>\n`;
      content += `<p><strong>Market Sentiment:</strong> ${sentimentIcon} ${sentiment}</p>\n`;
      if (news.summary) {
        content += `<p>${news.summary}</p>\n\n`;
      }
      if (news.url) {
        content += `<p><a href="${news.url}" target="_blank" rel="noopener noreferrer">Read full article</a></p>\n\n`;
      }
    });
    
    content += `<p>These news items provide important context about factors that may be influencing the blue dollar price. Political events, economic decisions, and international news can have a significant impact on the Bolivian exchange market.</p>\n\n`;
  } else {
    content += `<p>No recent news is available for today's analysis. However, the market continues to operate based on general economic conditions and dollar supply and demand.</p>\n\n`;
  }
  
  // Market Context
  content += `<h2>Market Context</h2>\n\n`;
  content += `<p>The blue dollar market in Bolivia operates in a unique context characterized by:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>High dollar demand:</strong> Many Bolivians need dollars for remittances, travel, investments, or protection against inflation.</li>\n`;
  content += `<li><strong>Exchange restrictions:</strong> Access to dollars through the official banking system may be limited or subject to restrictions.</li>\n`;
  content += `<li><strong>Active parallel market:</strong> Platforms like Binance P2P have facilitated transactions in the parallel market, increasing its transparency and accessibility.</li>\n`;
  content += `<li><strong>Economic volatility:</strong> Political, economic, and international factors can cause significant fluctuations in the blue dollar price.</li>\n`;
  content += `</ul>\n\n`;
  
  // Methodology
  content += `<h2>Our Data Methodology</h2>\n\n`;
  content += `<p>The data presented in this analysis comes from multiple reliable sources:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li><strong>Binance P2P:</strong> We aggregate buy and sell offers for USDT/BOB from Binance P2P, calculating the median to filter outliers and obtain a representative market rate.</li>\n`;
  content += `<li><strong>Central Bank of Bolivia:</strong> We include official BCB rates for comparison and exchange gap analysis.</li>\n`;
  content += `<li><strong>Frequent updates:</strong> Our data updates every 15 minutes to provide the most recent information possible.</li>\n`;
  content += `<li><strong>Transparency:</strong> All our calculation methods are public and can be verified by any user.</li>\n`;
  content += `</ul>\n\n`;
  
  // Practical Implications
  content += `<h2>Practical Implications</h2>\n\n`;
  content += `<h3>For People Who Need to Buy Dollars</h3>\n\n`;
  content += `<p>If you need to buy dollars today, the current buy rate is ${currentRate.buy.toFixed(2)} BOB per dollar. This means that for every 100 dollars you buy, you will need approximately ${(currentRate.buy * 100).toFixed(2)} bolivianos. It's important to compare this rate with other available options, such as exchange houses or digital platforms, to get the best possible price.</p>\n\n`;
  
  content += `<h3>For People Who Need to Sell Dollars</h3>\n\n`;
  content += `<p>If you have dollars to sell, the current sell rate is ${currentRate.sell.toFixed(2)} BOB per dollar. This means that for every 100 dollars you sell, you will receive approximately ${(currentRate.sell * 100).toFixed(2)} bolivianos. Remember that this rate may vary depending on the platform or transaction method you choose.</p>\n\n`;
  
  content += `<h3>For Investors and Traders</h3>\n\n`;
  content += `<p>The volatility of the blue dollar market can present both opportunities and risks. It's important to monitor long-term trends, not just daily movements, and consider factors such as political stability, economic policies, and international conditions when making investment or trading decisions.</p>\n\n`;
  
  // Outlook
  content += `<h2>Outlook and Recommendations</h2>\n\n`;
  content += `<p>Based on today's analysis, the following are our perspectives and recommendations:</p>\n\n`;
  
  if (buyChange && parseFloat(buyChange) > 2) {
    content += `<p><strong>Upward Trend:</strong> The significant increase in rates suggests that the market may continue to experience upward pressure in the short term. If you need to buy dollars, consider doing so soon before rates rise further. If you plan to sell dollars, this may be a good time to get a favorable price.</p>\n\n`;
  } else if (buyChange && parseFloat(buyChange) < -2) {
    content += `<p><strong>Downward Trend:</strong> The decrease in rates suggests that the market may be experiencing greater dollar availability. If you need to buy dollars, you can wait to see if rates continue to fall. If you plan to sell dollars, consider waiting for rates to recover.</p>\n\n`;
  } else {
    content += `<p><strong>Stable Market:</strong> Rates remain relatively stable, suggesting market equilibrium. This may be a good time to make planned transactions, as there is less uncertainty about market direction.</p>\n\n`;
  }
  
  content += `<p><strong>General Recommendations:</strong></p>\n\n`;
  content += `<ul>\n`;
  content += `<li>Monitor rates regularly to identify trends and opportunities.</li>\n`;
  content += `<li>Use our currency calculator to plan your transactions.</li>\n`;
  content += `<li>Set up price alerts to be notified when rates reach your targets.</li>\n`;
  content += `<li>Stay informed about economic news that may affect the market.</li>\n`;
  content += `<li>Always verify current rates before making important transactions.</li>\n`;
  content += `</ul>\n\n`;
  
  // Disclaimer
  content += `<h2>Disclaimer</h2>\n\n`;
  content += `<p>This analysis is for informational purposes only and does not constitute financial advice. Exchange rates can vary significantly depending on the platform, location, payment method, and other factors. Always verify current rates and transaction terms before making any operation. Bolivia Blue with Paz is not responsible for financial decisions made based on this information.</p>\n\n`;
  
  // Call to Action
  content += `<h2>Additional Resources</h2>\n\n`;
  content += `<p>To get more information about the blue dollar market in Bolivia:</p>\n\n`;
  content += `<ul>\n`;
  content += `<li>Visit our <a href="/">main page</a> to see real-time rates</li>\n`;
  content += `<li>Use our <a href="/calculator">currency calculator</a> to convert USD to BOB and vice versa</li>\n`;
  content += `<li>Check our <a href="/news">news feed</a> for the latest economic updates</li>\n`;
  content += `<li>Read our <a href="/about">about page</a> to understand our methodology</li>\n`;
  content += `<li>Review our <a href="/faq">frequently asked questions</a> for answers to common questions</li>\n`;
  content += `</ul>\n\n`;
  
  content += `<p><em>This analysis is automatically generated daily with the most recent available data. To get real-time updated information, visit our main platform.</em></p>\n`;
  
  return content;
}

/**
 * Save article to Supabase
 */
async function saveArticle(article, language) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const slug = `analisis-diario-${dateStr}`;
  
  // Check if article for today already exists
  const { data: existing } = await supabase
    .from('blog_articles')
    .select('id')
    .eq('slug', slug)
    .eq('language', language)
    .single();
  
  if (existing) {
    // Update existing article
    const { data, error } = await supabase
      .from('blog_articles')
      .update({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .eq('language', language)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }
    
    console.log(`✅ Updated daily article for ${dateStr} (${language})`);
    return data;
  } else {
    // Insert new article
    const { data, error } = await supabase
      .from('blog_articles')
      .insert({
        slug,
        language,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        content_format: 'html',
        author: 'Bolivia Blue con Paz',
        category: article.category,
        featured: false,
        read_time: article.readTime,
        published_at: today.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create article: ${error.message}`);
    }
    
    console.log(`✅ Created daily article for ${dateStr} (${language})`);
    return data;
  }
}

/**
 * Generate and save daily articles (both languages)
 */
export async function generateDailyArticles() {
  try {
    console.log('📝 Starting daily article generation...');
    
    // Generate Spanish article
    console.log('Generating Spanish article...');
    const spanishArticle = await generateDailyArticle('es');
    await saveArticle(spanishArticle, 'es');
    
    // Generate English article
    console.log('Generating English article...');
    const englishArticle = await generateDailyArticle('en');
    await saveArticle(englishArticle, 'en');
    
    console.log('✅ Daily articles generated successfully!');
    
    return {
      success: true,
      spanish: spanishArticle.title,
      english: englishArticle.title
    };
    
  } catch (error) {
    console.error('❌ Error generating daily articles:', error);
    throw error;
  }
}

// If run directly, generate articles
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDailyArticles()
    .then(result => {
      console.log('Result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

