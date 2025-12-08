import { getActiveAlerts, markAlertTriggered, getLatestRate } from './db-supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const BASE_URL = process.env.BASE_URL || 'https://boliviablue.com';

/**
 * Send email notification using EmailJS
 */
async function sendAlertEmail(alert, currentRate) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('⚠️  EmailJS not configured. Skipping email send.');
    console.warn('Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in .env');
    return false;
  }

  try {
    const rateValue = alert.alert_type === 'buy' ? currentRate.buy : currentRate.sell;
    const rateType = alert.alert_type === 'buy' ? 'Compra' : 'Venta';
    const directionText = alert.direction === 'above' ? 'subió' : 'bajó';
    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${alert.unsubscribe_token}`;

    // EmailJS API endpoint
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: alert.email,
          rate_type: rateType,
          current_rate: rateValue.toFixed(2),
          threshold: alert.threshold.toFixed(2),
          direction: directionText,
          unsubscribe_url: unsubscribeUrl,
          site_url: BASE_URL
        }
      })
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.statusText}`);
    }

    console.log(`✅ Alert email sent to ${alert.email} for rate ${rateValue.toFixed(2)} BOB`);
    return true;

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

