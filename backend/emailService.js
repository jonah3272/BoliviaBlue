import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Zoho Mail SMTP Configuration
const ZOHO_HOST = process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com';
const ZOHO_PORT = parseInt(process.env.ZOHO_SMTP_PORT || '587', 10);
const ZOHO_USER = process.env.ZOHO_EMAIL;
const ZOHO_PASSWORD = process.env.ZOHO_APP_PASSWORD;
const ZOHO_FROM_EMAIL = process.env.ZOHO_FROM_EMAIL || process.env.ZOHO_EMAIL;
const ZOHO_FROM_NAME = process.env.ZOHO_FROM_NAME || 'Bolivia Blue con Paz';

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter with Zoho SMTP
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!ZOHO_USER || !ZOHO_PASSWORD) {
    console.warn('⚠️  Zoho Mail not configured. Set ZOHO_EMAIL and ZOHO_APP_PASSWORD in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: ZOHO_HOST,
    port: ZOHO_PORT,
    secure: ZOHO_PORT === 465, // true for 465, false for other ports
    auth: {
      user: ZOHO_USER,
      pass: ZOHO_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  return transporter;
}

/**
 * Send email using Zoho Mail
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} options.text - Plain text email body (optional)
 * @returns {Promise<boolean>} - Success status
 */
export async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  
  if (!transport) {
    console.warn('⚠️  Email transporter not initialized. Skipping email send.');
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: `"${ZOHO_FROM_NAME}" <${ZOHO_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return false;
  }
}

/**
 * Verify Zoho SMTP connection
 * @returns {Promise<boolean>} - Connection status
 */
export async function verifyConnection() {
  const transport = getTransporter();
  
  if (!transport) {
    return false;
  }

  try {
    await transport.verify();
    console.log('✅ Zoho SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Zoho SMTP connection failed:', error.message);
    return false;
  }
}

