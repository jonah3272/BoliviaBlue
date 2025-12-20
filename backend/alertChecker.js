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

    // Build HTML email content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .rate-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .rate-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Alerta de Tipo de Cambio</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>El tipo de cambio <strong>${rateType}</strong> ${directionText} a <strong>${rateValue.toFixed(2)} BOB</strong>.</p>
            
            <div class="rate-box">
              <div style="color: #666; font-size: 14px;">Tu umbral configurado:</div>
              <div class="rate-value">${alert.threshold.toFixed(2)} BOB</div>
              <div style="color: #666; font-size: 14px; margin-top: 10px;">Tasa actual:</div>
              <div style="font-size: 24px; font-weight: bold; color: #333; margin-top: 5px;">${rateValue.toFixed(2)} BOB</div>
            </div>

            <p style="text-align: center;">
              <a href="${BASE_URL}" class="button">Ver Detalles</a>
            </p>

            <div class="footer">
              <p>Visita <a href="${BASE_URL}">${BASE_URL}</a> para ver más detalles y gráficos históricos.</p>
              <p style="margin-top: 20px;">
                <a href="${unsubscribeUrl}" style="color: #999; text-decoration: none;">Cancelar esta alerta</a>
              </p>
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

