/**
 * Weekly Newsletter Generator
 * 
 * Generates and sends weekly newsletter digest to all active subscribers.
 * Includes:
 * - Current exchange rates
 * - Week's highlights and trends
 * - Top news articles
 * - Market analysis
 */

import { getLatestRate, getRatesInRange, getRecentNews } from './db-supabase.js';
import { getActiveNewsletterSubscribers, updateNewsletterLastSent } from './db-supabase.js';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://boliviablue.com';

/**
 * Format date in Spanish or English
 */
function formatDate(date, language) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long',
    timeZone: 'America/La_Paz'
  };
  
  if (language === 'es') {
    return date.toLocaleDateString('es-BO', options);
  } else {
    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Generate weekly newsletter HTML content
 */
async function generateNewsletterContent(language = 'es') {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Get current rate
  const currentRate = await getLatestRate();
  
  // Get rates from last week for comparison
  const weeklyRates = await getRatesInRange(weekAgo.toISOString());
  
  // Get recent news
  const news = await getRecentNews(10);
  
  // Calculate weekly statistics
  const buyRates = weeklyRates.map(r => r.buy).filter(Boolean);
  const sellRates = weeklyRates.map(r => r.sell).filter(Boolean);
  
  const avgBuy = buyRates.length > 0 
    ? (buyRates.reduce((a, b) => a + b, 0) / buyRates.length).toFixed(4)
    : null;
  const avgSell = sellRates.length > 0
    ? (sellRates.reduce((a, b) => a + b, 0) / sellRates.length).toFixed(4)
    : null;
  
  const highBuy = buyRates.length > 0 ? Math.max(...buyRates).toFixed(4) : null;
  const lowBuy = buyRates.length > 0 ? Math.min(...buyRates).toFixed(4) : null;
  
  const currentDate = formatDate(now, language);
  const weekStartDate = formatDate(weekAgo, language);
  
  if (language === 'es') {
    return {
      subject: `📊 Resumen Semanal: Dólar Blue Bolivia - ${currentDate}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .rate-card { background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .rate-value { font-size: 36px; font-weight: bold; color: #10B981; margin: 10px 0; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .news-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3B82F6; }
    .news-title { font-weight: bold; margin-bottom: 5px; }
    .news-source { font-size: 12px; color: #666; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Resumen Semanal</h1>
    <p>Dólar Blue Bolivia</p>
    <p style="font-size: 14px; opacity: 0.9;">${currentDate}</p>
  </div>
  
  <div class="content">
    <h2>💵 Tipo de Cambio Actual</h2>
    <div class="rate-card">
      <div style="color: #3B82F6; font-weight: bold; margin-bottom: 10px;">COMPRA</div>
      <div class="rate-value">${currentRate?.buy?.toFixed(4) || 'N/A'} BOB</div>
      <div style="color: #EC4899; font-weight: bold; margin-top: 20px;">VENTA</div>
      <div class="rate-value" style="color: #EC4899;">${currentRate?.sell?.toFixed(4) || 'N/A'} BOB</div>
      <p style="margin-top: 15px; color: #666; font-size: 14px;">Actualizado cada 15 minutos</p>
    </div>
    
    <h2>📈 Estadísticas de la Semana</h2>
    <p style="color: #666; margin-bottom: 15px;">Período: ${weekStartDate} - ${currentDate}</p>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-label">Promedio Compra</div>
        <div class="stat-value">${avgBuy || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Promedio Venta</div>
        <div class="stat-value">${avgSell || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Máximo Compra</div>
        <div class="stat-value">${highBuy || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Mínimo Compra</div>
        <div class="stat-value">${lowBuy || 'N/A'} BOB</div>
      </div>
    </div>
    
    <h2>📰 Noticias Destacadas</h2>
    ${news && news.length > 0 ? news.slice(0, 5).map(article => `
      <div class="news-item">
        <div class="news-title">${article.title || 'Sin título'}</div>
        <div class="news-source">${article.source || 'Fuente desconocida'}</div>
      </div>
    `).join('') : '<p>No hay noticias recientes.</p>'}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}" class="button">Ver Más en boliviablue.com</a>
    </div>
    
    <div class="footer">
      <p>Este es un resumen automático semanal de Bolivia Blue con Paz.</p>
      <p><a href="${BASE_URL}/unsubscribe?email={{email}}">Cancelar suscripción</a></p>
      <p style="margin-top: 10px; font-size: 11px; color: #999;">
        Bolivia Blue con Paz - Tipo de Cambio en Tiempo Real<br>
        Actualizado cada 15 minutos | Más rápido que bolivianblue.net
      </p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
RESUMEN SEMANAL - DÓLAR BLUE BOLIVIA
${currentDate}

TIPO DE CAMBIO ACTUAL:
Compra: ${currentRate?.buy?.toFixed(4) || 'N/A'} BOB
Venta: ${currentRate?.sell?.toFixed(4) || 'N/A'} BOB

ESTADÍSTICAS DE LA SEMANA (${weekStartDate} - ${currentDate}):
- Promedio Compra: ${avgBuy || 'N/A'} BOB
- Promedio Venta: ${avgSell || 'N/A'} BOB
- Máximo Compra: ${highBuy || 'N/A'} BOB
- Mínimo Compra: ${lowBuy || 'N/A'} BOB

NOTICIAS DESTACADAS:
${news && news.length > 0 ? news.slice(0, 5).map(a => `- ${a.title || 'Sin título'} (${a.source || 'Fuente desconocida'})`).join('\n') : 'No hay noticias recientes.'}

Ver más en: ${BASE_URL}

Cancelar suscripción: ${BASE_URL}/unsubscribe?email={{email}}
      `
    };
  } else {
    return {
      subject: `📊 Weekly Summary: Blue Dollar Bolivia - ${currentDate}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .rate-card { background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .rate-value { font-size: 36px; font-weight: bold; color: #10B981; margin: 10px 0; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .news-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3B82F6; }
    .news-title { font-weight: bold; margin-bottom: 5px; }
    .news-source { font-size: 12px; color: #666; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Weekly Summary</h1>
    <p>Blue Dollar Bolivia</p>
    <p style="font-size: 14px; opacity: 0.9;">${currentDate}</p>
  </div>
  
  <div class="content">
    <h2>💵 Current Exchange Rate</h2>
    <div class="rate-card">
      <div style="color: #3B82F6; font-weight: bold; margin-bottom: 10px;">BUY</div>
      <div class="rate-value">${currentRate?.buy?.toFixed(4) || 'N/A'} BOB</div>
      <div style="color: #EC4899; font-weight: bold; margin-top: 20px;">SELL</div>
      <div class="rate-value" style="color: #EC4899;">${currentRate?.sell?.toFixed(4) || 'N/A'} BOB</div>
      <p style="margin-top: 15px; color: #666; font-size: 14px;">Updated every 15 minutes</p>
    </div>
    
    <h2>📈 Weekly Statistics</h2>
    <p style="color: #666; margin-bottom: 15px;">Period: ${weekStartDate} - ${currentDate}</p>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-label">Avg Buy</div>
        <div class="stat-value">${avgBuy || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Sell</div>
        <div class="stat-value">${avgSell || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">High Buy</div>
        <div class="stat-value">${highBuy || 'N/A'} BOB</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Low Buy</div>
        <div class="stat-value">${lowBuy || 'N/A'} BOB</div>
      </div>
    </div>
    
    <h2>📰 Top News</h2>
    ${news && news.length > 0 ? news.slice(0, 5).map(article => `
      <div class="news-item">
        <div class="news-title">${article.title || 'No title'}</div>
        <div class="news-source">${article.source || 'Unknown source'}</div>
      </div>
    `).join('') : '<p>No recent news.</p>'}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}" class="button">See More at boliviablue.com</a>
    </div>
    
    <div class="footer">
      <p>This is an automatic weekly summary from Bolivia Blue with Paz.</p>
      <p><a href="${BASE_URL}/unsubscribe?email={{email}}">Unsubscribe</a></p>
      <p style="margin-top: 10px; font-size: 11px; color: #999;">
        Bolivia Blue with Paz - Real-Time Exchange Rate<br>
        Updated every 15 minutes | Faster than bolivianblue.net
      </p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
WEEKLY SUMMARY - BLUE DOLLAR BOLIVIA
${currentDate}

CURRENT EXCHANGE RATE:
Buy: ${currentRate?.buy?.toFixed(4) || 'N/A'} BOB
Sell: ${currentRate?.sell?.toFixed(4) || 'N/A'} BOB

WEEKLY STATISTICS (${weekStartDate} - ${currentDate}):
- Average Buy: ${avgBuy || 'N/A'} BOB
- Average Sell: ${avgSell || 'N/A'} BOB
- High Buy: ${highBuy || 'N/A'} BOB
- Low Buy: ${lowBuy || 'N/A'} BOB

TOP NEWS:
${news && news.length > 0 ? news.slice(0, 5).map(a => `- ${a.title || 'No title'} (${a.source || 'Unknown source'})`).join('\n') : 'No recent news.'}

See more at: ${BASE_URL}

Unsubscribe: ${BASE_URL}/unsubscribe?email={{email}}
      `
    };
  }
}

/**
 * Send weekly newsletter to all active subscribers
 */
export async function sendWeeklyNewsletter() {
  try {
    console.log('📧 Starting weekly newsletter send...');
    
    // Get all active subscribers
    const subscribers = await getActiveNewsletterSubscribers();
    
    if (subscribers.length === 0) {
      console.log('⚠️  No active subscribers found. Skipping newsletter send.');
      return { sent: 0, failed: 0 };
    }
    
    console.log(`📬 Found ${subscribers.length} active subscribers`);
    
    let sent = 0;
    let failed = 0;
    
    // Send to each subscriber in their preferred language
    for (const subscriber of subscribers) {
      try {
        const content = await generateNewsletterContent(subscriber.language || 'es');
        
        // Replace email placeholder in unsubscribe link
        const encodedEmail = encodeURIComponent(subscriber.email);
        const html = content.html.replace(/\{\{email\}\}/g, encodedEmail);
        const text = content.text.replace(/\{\{email\}\}/g, encodedEmail);
        
        const success = await sendEmail({
          to: subscriber.email,
          subject: content.subject,
          html,
          text
        });
        
        if (success) {
          await updateNewsletterLastSent(subscriber.email);
          sent++;
          console.log(`✅ Newsletter sent to ${subscriber.email}`);
        } else {
          failed++;
          console.error(`❌ Failed to send newsletter to ${subscriber.email}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failed++;
        console.error(`❌ Error sending newsletter to ${subscriber.email}:`, error.message);
      }
    }
    
    console.log(`✅ Weekly newsletter complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
    
  } catch (error) {
    console.error('❌ Error in weekly newsletter send:', error);
    return { sent: 0, failed: 0 };
  }
}


