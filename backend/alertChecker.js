import { getActiveAlerts, markAlertTriggered, getLatestRate } from './db-supabase.js';
import { sendEmail } from './emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://boliviablue.com';

/**
 * Send email notification using Zoho Mail
 */
async function sendAlertEmail(alert, currentRate) {
  try {
    const rateValue = alert.alert_type === 'buy' ? currentRate.buy : currentRate.sell;
    const rateType = alert.alert_type === 'buy' ? 'Compra' : 'Venta';
    const directionText = alert.direction === 'above' ? 'subió' : 'bajó';
    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${alert.unsubscribe_token}`;

    // Determine if rate went up or down for visual indicator
    const isIncrease = alert.direction === 'above' && rateValue >= alert.threshold;
    const trendIcon = isIncrease ? '📈' : '📉';
    const trendColor = isIncrease ? '#10B981' : '#EF4444';
    
    // Build HTML email content with enhanced branding
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .email-wrapper { 
            background-color: #f3f4f6; 
            padding: 20px 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); 
            color: white; 
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
          }
          .logo { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          .logo-icon {
            display: inline-block;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            margin-right: 8px;
            vertical-align: middle;
            text-align: center;
            line-height: 32px;
            font-size: 20px;
          }
          .header-subtitle {
            font-size: 14px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          .alert-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 16px;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
          }
          .alert-message {
            background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);
            border-left: 4px solid #2563eb;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
          }
          .alert-message-text {
            font-size: 16px;
            color: #1f2937;
            line-height: 1.8;
          }
          .rate-comparison {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .rate-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .rate-row:last-child {
            border-bottom: none;
          }
          .rate-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
          }
          .rate-value-large {
            font-size: 36px;
            font-weight: 700;
            color: #2563eb;
            letter-spacing: -0.5px;
          }
          .rate-value-current {
            font-size: 32px;
            font-weight: 700;
            color: ${trendColor};
            letter-spacing: -0.5px;
          }
          .trend-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: ${trendColor};
            font-weight: 600;
            margin-top: 8px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
            transition: transform 0.2s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(37, 99, 235, 0.4);
          }
          .features {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
          }
          .features-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            text-align: center;
          }
          .feature-item {
            font-size: 12px;
            color: #6b7280;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .footer { 
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .footer-link {
            color: #2563eb;
            text-decoration: none;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          .unsubscribe {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          .unsubscribe-link {
            color: #9ca3af;
            text-decoration: none;
            font-size: 12px;
          }
          .unsubscribe-link:hover {
            color: #6b7280;
            text-decoration: underline;
          }
          @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .rate-value-large, .rate-value-current { font-size: 28px; }
            .features-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <!-- Header with Branding -->
            <div class="header">
              <div class="logo">
                <span class="logo-icon">B</span>
                Bolivia Blue con Paz
              </div>
              <div class="header-subtitle">Tipo de Cambio en Tiempo Real</div>
              <div class="alert-badge">🔔 Alerta Activada</div>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="greeting">Hola,</div>
              
              <div class="alert-message">
                <div class="alert-message-text">
                  El tipo de cambio <strong>${rateType}</strong> ${directionText} a <strong>${rateValue.toFixed(2)} BOB</strong>.
                </div>
              </div>

              <!-- Rate Comparison Card -->
              <div class="rate-comparison">
                <div class="rate-row">
                  <div class="rate-label">Tu umbral configurado</div>
                  <div class="rate-value-large">${alert.threshold.toFixed(2)} BOB</div>
                </div>
                <div class="rate-row">
                  <div class="rate-label">Tasa actual ${trendIcon}</div>
                  <div>
                    <div class="rate-value-current">${rateValue.toFixed(2)} BOB</div>
                    <div class="trend-indicator">
                      ${isIncrease ? '↑ Subió' : '↓ Bajó'} ${Math.abs(rateValue - alert.threshold).toFixed(2)} BOB
                    </div>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${BASE_URL}" class="cta-button">Ver Detalles y Gráficos →</a>
              </div>

              <!-- Features -->
              <div class="features">
                <div class="features-title">✨ En Bolivia Blue encontrarás:</div>
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div>Gráficos históricos</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🧮</div>
                    <div>Calculadora gratuita</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📰</div>
                    <div>Noticias financieras</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-text">
                Visita <a href="${BASE_URL}" class="footer-link">boliviablue.com</a> para ver más detalles, gráficos históricos y herramientas útiles.
              </div>
              <div class="unsubscribe">
                <a href="${unsubscribeUrl}" class="unsubscribe-link">Cancelar esta alerta</a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `🔔 Bolivia Blue - Tasa de ${rateType} ${directionText} a ${rateValue.toFixed(2)} BOB`;

    const emailSent = await sendEmail({
      to: alert.email,
      subject,
      html,
    });

    if (emailSent) {
      console.log(`✅ Alert email sent to ${alert.email} for rate ${rateValue.toFixed(2)} BOB`);
    }

    return emailSent;

  } catch (error) {
    console.error(`❌ Error sending alert email to ${alert.email}:`, error.message);
    return false;
  }
}

/**
 * Check all active alerts and send notifications if thresholds are met
 */
export async function checkAlerts() {
  try {
    // Get current rate
    const currentRate = await getLatestRate();
    if (!currentRate) {
      console.log('⚠️  No current rate available, skipping alert check');
      return;
    }

    // Get all active alerts (gracefully handles missing table)
    let alerts;
    try {
      alerts = await getActiveAlerts();
    } catch (error) {
      // If alerts table doesn't exist, just skip alert checking
      console.warn('⚠️  Alert checking skipped:', error.message);
      return;
    }
    
    if (alerts.length === 0) {
      return; // No alerts to check
    }

    console.log(`🔔 Checking ${alerts.length} active alerts...`);

    let triggeredCount = 0;

    for (const alert of alerts) {
      let shouldTrigger = false;
      let rateValue = null;

      // Check if threshold is met based on alert type and direction
      if (alert.alert_type === 'buy') {
        rateValue = currentRate.buy;
        if (alert.direction === 'above' && rateValue >= alert.threshold) {
          shouldTrigger = true;
        } else if (alert.direction === 'below' && rateValue <= alert.threshold) {
          shouldTrigger = true;
        }
      } else if (alert.alert_type === 'sell') {
        rateValue = currentRate.sell;
        if (alert.direction === 'above' && rateValue >= alert.threshold) {
          shouldTrigger = true;
        } else if (alert.direction === 'below' && rateValue <= alert.threshold) {
          shouldTrigger = true;
        }
      } else if (alert.alert_type === 'both') {
        // For 'both', check if either buy or sell meets the threshold
        const buyMeets = alert.direction === 'above' 
          ? currentRate.buy >= alert.threshold 
          : currentRate.buy <= alert.threshold;
        const sellMeets = alert.direction === 'above'
          ? currentRate.sell >= alert.threshold
          : currentRate.sell <= alert.threshold;
        
        if (buyMeets || sellMeets) {
          shouldTrigger = true;
          rateValue = buyMeets ? currentRate.buy : currentRate.sell;
        }
      }

      if (shouldTrigger) {
        // Send email notification
        const emailSent = await sendAlertEmail(alert, currentRate);
        
        if (emailSent) {
          // Mark alert as triggered
          await markAlertTriggered(alert.id);
          triggeredCount++;
          console.log(`✅ Alert triggered for ${alert.email}: ${alert.alert_type} rate ${rateValue?.toFixed(2)} ${alert.direction} ${alert.threshold.toFixed(2)}`);
        }
      }
    }

    if (triggeredCount > 0) {
      console.log(`📧 Sent ${triggeredCount} alert notification(s)`);
    }

  } catch (error) {
    console.error('❌ Error checking alerts:', error);
  }
}

