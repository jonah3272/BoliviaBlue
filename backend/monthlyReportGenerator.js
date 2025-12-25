/**
 * Monthly Market Report Generator
 * 
 * Generates comprehensive monthly market reports with:
 * - Monthly average rates
 * - Highest/lowest rates
 * - Key events
 * - Trend analysis
 * - Predictions
 * - Data tables and charts
 */

import { getRatesInRange, getRecentNews } from './db-supabase.js';
import { saveMonthlyReport } from './db-supabase.js';
import { supabase } from './db-supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://boliviablue.com';

/**
 * Get month name in Spanish or English
 */
function getMonthName(month, language) {
  const monthsEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return language === 'es' ? monthsEs[month - 1] : monthsEn[month - 1];
}

/**
 * Calculate standard deviation (volatility)
 */
function calculateVolatility(values) {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Generate monthly report
 */
export async function generateMonthlyReport(month, year, language = 'es') {
  try {
    console.log(`📊 Generating monthly report for ${getMonthName(month, language)} ${year} (${language})...`);
    
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get all rates for the month
    const rates = await getRatesInRange(startDate.toISOString());
    const monthRates = rates.filter(r => {
      const rateDate = new Date(r.t);
      return rateDate >= startDate && rateDate <= endDate;
    });
    
    if (monthRates.length === 0) {
      console.warn(`⚠️  No rates found for ${getMonthName(month, language)} ${year}`);
      return null;
    }
    
    // Calculate statistics
    const buyRates = monthRates.map(r => r.buy).filter(Boolean);
    const sellRates = monthRates.map(r => r.sell).filter(Boolean);
    
    const avgBuy = buyRates.length > 0 
      ? parseFloat((buyRates.reduce((a, b) => a + b, 0) / buyRates.length).toFixed(4))
      : null;
    const avgSell = sellRates.length > 0
      ? parseFloat((sellRates.reduce((a, b) => a + b, 0) / sellRates.length).toFixed(4))
      : null;
    
    const highBuy = buyRates.length > 0 ? Math.max(...buyRates) : null;
    const highSell = sellRates.length > 0 ? Math.max(...sellRates) : null;
    const lowBuy = buyRates.length > 0 ? Math.min(...buyRates) : null;
    const lowSell = sellRates.length > 0 ? Math.min(...sellRates) : null;
    
    const volatility = calculateVolatility(buyRates);
    
    // Find dates for high/low
    const highBuyDate = monthRates.find(r => r.buy === highBuy)?.t;
    const lowBuyDate = monthRates.find(r => r.buy === lowBuy)?.t;
    
    // Get news from the month
    const allNews = await getRecentNews(100);
    const monthNews = allNews.filter(n => {
      if (!n.published_at) return false;
      const newsDate = new Date(n.published_at);
      return newsDate >= startDate && newsDate <= endDate;
    });
    
    // Identify key events (news with high impact keywords)
    const keyEvents = monthNews
      .filter(n => {
        const title = (n.title || '').toLowerCase();
        const keywords = ['bcb', 'banco central', 'reservas', 'dólar', 'dolar', 'tipo de cambio', 'política', 'economía'];
        return keywords.some(kw => title.includes(kw));
      })
      .slice(0, 10)
      .map(n => n.title);
    
    // Generate trend analysis
    const firstWeekAvg = monthRates.slice(0, Math.floor(monthRates.length / 4))
      .map(r => r.buy).filter(Boolean);
    const lastWeekAvg = monthRates.slice(-Math.floor(monthRates.length / 4))
      .map(r => r.buy).filter(Boolean);
    
    const firstWeekMean = firstWeekAvg.length > 0 
      ? firstWeekAvg.reduce((a, b) => a + b, 0) / firstWeekAvg.length
      : null;
    const lastWeekMean = lastWeekAvg.length > 0
      ? lastWeekAvg.reduce((a, b) => a + b, 0) / lastWeekAvg.length
      : null;
    
    const trend = firstWeekMean && lastWeekMean 
      ? (lastWeekMean > firstWeekMean ? 'upward' : 'downward')
      : 'stable';
    
    const trendPercentage = firstWeekMean && lastWeekMean
      ? Math.abs(((lastWeekMean - firstWeekMean) / firstWeekMean) * 100).toFixed(2)
      : '0';
    
    // Generate predictions for next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    let predictions = '';
    if (trend === 'upward') {
      predictions = language === 'es'
        ? `Basado en la tendencia alcista observada, se espera que el dólar blue continúe subiendo en ${getMonthName(nextMonth, language)} ${nextYear}, con posibles valores entre ${(avgBuy * 1.02).toFixed(4)} y ${(avgBuy * 1.05).toFixed(4)} BOB para compra.`
        : `Based on the upward trend observed, the blue dollar is expected to continue rising in ${getMonthName(nextMonth, language)} ${nextYear}, with possible values between ${(avgBuy * 1.02).toFixed(4)} and ${(avgBuy * 1.05).toFixed(4)} BOB for buy.`;
    } else if (trend === 'downward') {
      predictions = language === 'es'
        ? `Basado en la tendencia bajista observada, se espera que el dólar blue se estabilice o baje ligeramente en ${getMonthName(nextMonth, language)} ${nextYear}, con posibles valores entre ${(avgBuy * 0.98).toFixed(4)} y ${(avgBuy * 1.01).toFixed(4)} BOB para compra.`
        : `Based on the downward trend observed, the blue dollar is expected to stabilize or decrease slightly in ${getMonthName(nextMonth, language)} ${nextYear}, with possible values between ${(avgBuy * 0.98).toFixed(4)} and ${(avgBuy * 1.01).toFixed(4)} BOB for buy.`;
    } else {
      predictions = language === 'es'
        ? `Basado en la estabilidad observada, se espera que el dólar blue se mantenga relativamente estable en ${getMonthName(nextMonth, language)} ${nextYear}, con valores alrededor de ${avgBuy?.toFixed(4)} BOB para compra.`
        : `Based on the stability observed, the blue dollar is expected to remain relatively stable in ${getMonthName(nextMonth, language)} ${nextYear}, with values around ${avgBuy?.toFixed(4)} BOB for buy.`;
    }
    
    // Generate trend analysis text
    const trendAnalysis = language === 'es'
      ? `Durante ${getMonthName(month, language)} ${year}, el dólar blue mostró una tendencia ${trend === 'upward' ? 'alcista' : trend === 'downward' ? 'bajista' : 'estable'}, con una variación del ${trendPercentage}% entre la primera y última semana del mes. El promedio mensual fue de ${avgBuy?.toFixed(4)} BOB para compra y ${avgSell?.toFixed(4)} BOB para venta. La volatilidad fue de ${volatility.toFixed(4)}, ${volatility > 0.1 ? 'indicando movimientos significativos' : 'indicando relativa estabilidad'} en el mercado.`
      : `During ${getMonthName(month, language)} ${year}, the blue dollar showed a ${trend} trend, with a ${trendPercentage}% variation between the first and last week of the month. The monthly average was ${avgBuy?.toFixed(4)} BOB for buy and ${avgSell?.toFixed(4)} BOB for sell. Volatility was ${volatility.toFixed(4)}, ${volatility > 0.1 ? 'indicating significant movements' : 'indicating relative stability'} in the market.`;
    
    // Generate chart data (daily averages)
    const dailyData = {};
    monthRates.forEach(rate => {
      const date = new Date(rate.t).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { buy: [], sell: [] };
      }
      if (rate.buy) dailyData[date].buy.push(rate.buy);
      if (rate.sell) dailyData[date].sell.push(rate.sell);
    });
    
    const chartData = Object.entries(dailyData).map(([date, values]) => ({
      date,
      buy: values.buy.length > 0 ? (values.buy.reduce((a, b) => a + b, 0) / values.buy.length).toFixed(4) : null,
      sell: values.sell.length > 0 ? (values.sell.reduce((a, b) => a + b, 0) / values.sell.length).toFixed(4) : null
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Generate HTML content
    const monthName = getMonthName(month, language);
    const slug = language === 'es' 
      ? `reporte-mensual-dolar-blue-bolivia-${monthName.toLowerCase()}-${year}`
      : `monthly-report-blue-dollar-bolivia-${monthName.toLowerCase()}-${year}`;
    
    const title = language === 'es'
      ? `Reporte Mensual: Dólar Blue Bolivia ${monthName} ${year}`
      : `Monthly Report: Blue Dollar Bolivia ${monthName} ${year}`;
    
    const excerpt = language === 'es'
      ? `Análisis completo del mercado del dólar blue en Bolivia durante ${monthName} ${year}. Incluye promedios, máximos, mínimos, eventos clave y predicciones.`
      : `Complete analysis of the blue dollar market in Bolivia during ${monthName} ${year}. Includes averages, highs, lows, key events and predictions.`;
    
    const content = language === 'es' ? `
      <h1>Reporte Mensual: Dólar Blue Bolivia - ${monthName} ${year}</h1>
      
      <section>
        <h2>Resumen Ejecutivo</h2>
        <p>Durante ${monthName} ${year}, el dólar blue en Bolivia mostró una actividad ${trend === 'upward' ? 'alcista' : trend === 'downward' ? 'bajista' : 'estable'}, con un promedio mensual de <strong>${avgBuy?.toFixed(4)} BOB</strong> para compra y <strong>${avgSell?.toFixed(4)} BOB</strong> para venta.</p>
      </section>
      
      <section>
        <h2>Estadísticas Mensuales</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h3>Promedio Mensual</h3>
            <p style="font-size: 24px; font-weight: bold; color: #10B981;">Compra: ${avgBuy?.toFixed(4)} BOB</p>
            <p style="font-size: 24px; font-weight: bold; color: #EC4899;">Venta: ${avgSell?.toFixed(4)} BOB</p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h3>Extremos del Mes</h3>
            <p><strong>Máximo Compra:</strong> ${highBuy?.toFixed(4)} BOB${highBuyDate ? ` (${new Date(highBuyDate).toLocaleDateString('es-BO')})` : ''}</p>
            <p><strong>Mínimo Compra:</strong> ${lowBuy?.toFixed(4)} BOB${lowBuyDate ? ` (${new Date(lowBuyDate).toLocaleDateString('es-BO')})` : ''}</p>
            <p><strong>Volatilidad:</strong> ${volatility.toFixed(4)}</p>
          </div>
        </div>
      </section>
      
      <section>
        <h2>Análisis de Tendencias</h2>
        <p>${trendAnalysis}</p>
      </section>
      
      <section>
        <h2>Eventos Clave del Mes</h2>
        ${keyEvents.length > 0 ? `
          <ul>
            ${keyEvents.map(event => `<li>${event}</li>`).join('')}
          </ul>
        ` : '<p>No se identificaron eventos clave durante este mes.</p>'}
      </section>
      
      <section>
        <h2>Predicciones para ${getMonthName(nextMonth, language)} ${nextYear}</h2>
        <p>${predictions}</p>
        <p><em>Nota: Estas predicciones se basan en análisis de tendencias históricas y no constituyen asesoramiento financiero.</em></p>
      </section>
      
      <section>
        <h2>Datos Diarios del Mes</h2>
        <p>El mes contó con <strong>${monthRates.length}</strong> registros de tipo de cambio, actualizados cada 15 minutos.</p>
        <p>Para ver los datos completos y gráficos interactivos, visita <a href="${BASE_URL}/datos-historicos">nuestra página de datos históricos</a>.</p>
      </section>
      
      <section>
        <h2>Metodología</h2>
        <p>Este reporte se genera automáticamente utilizando datos de Binance P2P para el par USDT/BOB. Los valores representan la mediana de las ofertas de compra y venta, proporcionando una estimación representativa del mercado paralelo boliviano.</p>
        <p>Los datos se actualizan cada 15 minutos y este reporte incluye todos los registros del mes.</p>
      </section>
      
      <section>
        <h2>Recursos Adicionales</h2>
        <ul>
          <li><a href="${BASE_URL}">Dashboard Principal</a> - Ver tasas en tiempo real</li>
          <li><a href="${BASE_URL}/calculadora">Calculadora</a> - Convertir dólares a bolivianos</li>
          <li><a href="${BASE_URL}/noticias">Noticias</a> - Análisis de noticias con IA</li>
          <li><a href="${BASE_URL}/datos-historicos">Datos Históricos</a> - Ver todos los datos históricos</li>
        </ul>
      </section>
    ` : `
      <h1>Monthly Report: Blue Dollar Bolivia - ${monthName} ${year}</h1>
      
      <section>
        <h2>Executive Summary</h2>
        <p>During ${monthName} ${year}, the blue dollar in Bolivia showed ${trend} activity, with a monthly average of <strong>${avgBuy?.toFixed(4)} BOB</strong> for buy and <strong>${avgSell?.toFixed(4)} BOB</strong> for sell.</p>
      </section>
      
      <section>
        <h2>Monthly Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h3>Monthly Average</h3>
            <p style="font-size: 24px; font-weight: bold; color: #10B981;">Buy: ${avgBuy?.toFixed(4)} BOB</p>
            <p style="font-size: 24px; font-weight: bold; color: #EC4899;">Sell: ${avgSell?.toFixed(4)} BOB</p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h3>Monthly Extremes</h3>
            <p><strong>High Buy:</strong> ${highBuy?.toFixed(4)} BOB${highBuyDate ? ` (${new Date(highBuyDate).toLocaleDateString('en-US')})` : ''}</p>
            <p><strong>Low Buy:</strong> ${lowBuy?.toFixed(4)} BOB${lowBuyDate ? ` (${new Date(lowBuyDate).toLocaleDateString('en-US')})` : ''}</p>
            <p><strong>Volatility:</strong> ${volatility.toFixed(4)}</p>
          </div>
        </div>
      </section>
      
      <section>
        <h2>Trend Analysis</h2>
        <p>${trendAnalysis}</p>
      </section>
      
      <section>
        <h2>Key Events of the Month</h2>
        ${keyEvents.length > 0 ? `
          <ul>
            ${keyEvents.map(event => `<li>${event}</li>`).join('')}
          </ul>
        ` : '<p>No key events identified during this month.</p>'}
      </section>
      
      <section>
        <h2>Predictions for ${getMonthName(nextMonth, language)} ${nextYear}</h2>
        <p>${predictions}</p>
        <p><em>Note: These predictions are based on historical trend analysis and do not constitute financial advice.</em></p>
      </section>
      
      <section>
        <h2>Daily Data for the Month</h2>
        <p>The month had <strong>${monthRates.length}</strong> exchange rate records, updated every 15 minutes.</p>
        <p>To see complete data and interactive charts, visit <a href="${BASE_URL}/datos-historicos">our historical data page</a>.</p>
      </section>
      
      <section>
        <h2>Methodology</h2>
        <p>This report is automatically generated using data from Binance P2P for the USDT/BOB pair. Values represent the median of buy and sell offers, providing a representative estimate of the Bolivian parallel market.</p>
        <p>Data is updated every 15 minutes and this report includes all records for the month.</p>
      </section>
      
      <section>
        <h2>Additional Resources</h2>
        <ul>
          <li><a href="${BASE_URL}">Main Dashboard</a> - View real-time rates</li>
          <li><a href="${BASE_URL}/calculadora">Calculator</a> - Convert dollars to bolivianos</li>
          <li><a href="${BASE_URL}/noticias">News</a> - AI-powered news analysis</li>
          <li><a href="${BASE_URL}/datos-historicos">Historical Data</a> - View all historical data</li>
        </ul>
      </section>
    `;
    
    // Save to database
    const reportData = {
      month,
      year,
      language,
      slug,
      title,
      excerpt,
      content,
      average_buy_rate: avgBuy,
      average_sell_rate: avgSell,
      highest_buy_rate: highBuy,
      highest_sell_rate: highSell,
      lowest_buy_rate: lowBuy,
      lowest_sell_rate: lowSell,
      volatility,
      key_events: keyEvents,
      trend_analysis: trendAnalysis,
      predictions,
      chart_data: chartData,
      published_at: endDate.toISOString()
    };
    
    const savedReport = await saveMonthlyReport(reportData);
    
    console.log(`✅ Monthly report generated and saved: ${slug}`);
    return savedReport;
    
  } catch (error) {
    console.error(`❌ Error generating monthly report for ${month}/${year}:`, error);
    throw error;
  }
}

/**
 * Generate report for previous month (called on 1st of each month)
 */
export async function generatePreviousMonthReport(language = 'es') {
  const now = new Date();
  const previousMonth = now.getMonth(); // 0-indexed, so this is current month
  const previousYear = now.getFullYear();
  
  // If it's the 1st, generate report for previous month
  // Otherwise, this function shouldn't be called
  const month = previousMonth === 0 ? 12 : previousMonth;
  const year = previousMonth === 0 ? previousYear - 1 : previousYear;
  
  // Generate for both languages
  await generateMonthlyReport(month, year, 'es');
  await generateMonthlyReport(month, year, 'en');
}


