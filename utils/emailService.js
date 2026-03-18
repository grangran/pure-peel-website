import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Log Resend initialization status
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend initialized with API key:', process.env.RESEND_API_KEY.substring(0, 10) + '...')
} else {
  console.log('⚠️  Resend not initialized - RESEND_API_KEY not found in environment')
}

// Create reusable transporter
const createTransporter = () => {
  // Option 1: Gmail (requires app password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App password, not regular password
      }
    })
  }

  // Option 2: SMTP (works with most email providers)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  // Option 3: Development - log emails to console
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  })
}

// Get transporter (lazy initialization)
const getTransporter = () => {
  return createTransporter()
}

// Shared theme tokens (matches site: cream, dark, gold, Cormorant/Jost)
const emailTheme = {
  cream: '#faf7f2',
  creamDark: '#f2ece0',
  dark: '#0f0a04',
  gold: '#c85a08',
  goldLight: '#e8c84a',
  border: 'rgba(15,10,4,0.08)',
  textMid: 'rgba(15,10,4,0.5)',
  textLight: 'rgba(15,10,4,0.35)',
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Jost', 'Segoe UI', Arial, sans-serif"
}

// Email templates - English (Order confirmation + thank you)
const orderConfirmationTemplateEN = (order, trackingUrl) => {
  const customerName = order.customer?.name || 'Customer'
  const customerEmail = order.customer?.email || ''
  const shippingName = order.shipping?.name || customerName
  const shippingAddress = order.shipping?.address || {}
  const customerTimezone = order.timezone || order.metadata?.timezone || 'America/Toronto'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.6; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1a1208 0%, #2a1e08 100%); color: #f5f0e8; padding: 36px 32px; text-align: center; border-radius: 14px 14px 0 0; }
    .header h1 { font-family: ${emailTheme.serif}; font-size: 28px; font-weight: 300; font-style: italic; margin: 0 0 8px; }
    .header p { font-family: ${emailTheme.sans}; font-size: 14px; opacity: 0.85; margin: 0; }
    .content { background: ${emailTheme.cream}; padding: 32px; border: 1px solid ${emailTheme.border}; border-top: none; border-radius: 0 0 14px 14px; }
    .order-info { background: #fff; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid ${emailTheme.gold}; }
    .items { background: #fff; padding: 20px; margin: 20px 0; border-radius: 10px; border: 1px solid ${emailTheme.border}; }
    .total { background: ${emailTheme.creamDark}; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: right; }
    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%); color: ${emailTheme.dark}; text-decoration: none; border-radius: 12px; font-family: ${emailTheme.sans}; font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; margin: 20px 0; }
    .footer { text-align: center; padding: 24px; color: ${emailTheme.textLight}; font-size: 12px; font-family: ${emailTheme.sans}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed</h1>
      <p>Thank you for your order — we're so glad you're here.</p>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <p>Thank you for your order. We've received it and payment is confirmed. Here are the details:</p>
      
      <div class="order-info">
        <h2 style="margin-top: 0;">Order Details</h2>
        <p><strong>Order Number:</strong> ${order.id || 'N/A'}</p>
        <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-CA', { 
          timeZone: customerTimezone,
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : new Date().toLocaleString('en-CA', { timeZone: customerTimezone })}</p>
        <p><strong>Status:</strong> <span style="color: ${emailTheme.gold}; font-weight: bold;">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span></p>
      </div>

      <div class="items">
        <h3 style="margin-top: 0;">Items Ordered:</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${(order.items || []).map(item => {
            // Format item name - if variant is already in name, don't duplicate it
            let itemDisplay = item.name || 'Item'
            if (item.variant && !itemDisplay.includes(item.variant)) {
              itemDisplay += ` - ${item.variant}`
            }
            return `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              ${itemDisplay} - Qty: ${item.quantity || 1} - $${(item.total || item.price * (item.quantity || 1) || 0).toFixed(2)}
            </li>`
          }).join('')}
        </ul>
      </div>

      <div class="total">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${(order.subtotal || 0).toFixed(2)} ${order.currency || 'CAD'}</p>
        <p style="margin: 5px 0;"><strong>Shipping:</strong> $${(order.shippingCost || 0).toFixed(2)} ${order.currency || 'CAD'}</p>
        <p style="margin: 5px 0;"><strong>Tax:</strong> $${(order.tax || 0).toFixed(2)} ${order.currency || 'CAD'}</p>
        <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">Total: $${(order.total || 0).toFixed(2)} ${order.currency || 'CAD'}</p>
      </div>

      <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin-top: 0;">Shipping Address:</h3>
        <p style="margin: 8px 0;">
          <strong>${shippingName}</strong><br>
          ${shippingAddress.line1 || ''}<br>
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
          ${shippingAddress.city || ''}${shippingAddress.city && (shippingAddress.state || shippingAddress.province) ? ', ' : ''} ${shippingAddress.state || shippingAddress.province || ''} ${shippingAddress.postal_code || shippingAddress.postalCode || ''}<br>
          ${shippingAddress.country || ''}
        </p>
        <p style="margin: 8px 0;"><strong>Shipping Method:</strong> ${order.shipping?.method || 'Standard Shipping'}</p>
      </div>

      ${order.trackingNumber ? `
      <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0;">Tracking Information</h3>
        <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
        <p style="margin-top: 10px;"><a href="https://www.canadapost.ca/trackweb/en#/search?searchFor=${order.trackingNumber}" target="_blank" style="color: #10b981; text-decoration: none;">Track with Canada Post →</a></p>
      </div>
      ` : ''}
      ${trackingUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackingUrl}" class="button">Track Your Order</a>
      </div>
      ` : ''}

      <p>We'll send you another email when your order ships with tracking information.</p>
      
      <p>If you have any questions, reach out anytime.</p>
      
      <p>Thank you for choosing Pure Peel Co.</p>
    </div>

    <div class="footer">
      <p>Pure Peel Co. · Made in Canada</p>
      <p>This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Email templates - French (Order confirmation)
const orderConfirmationTemplateFR = (order, trackingUrl) => {
  const customerName = order.customer?.name || 'Client'
  const customerEmail = order.customer?.email || ''
  const shippingName = order.shipping?.name || customerName
  const shippingAddress = order.shipping?.address || {}
  const customerTimezone = order.timezone || order.metadata?.timezone || 'America/Toronto'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.6; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1a1208 0%, #2a1e08 100%); color: #f5f0e8; padding: 36px 32px; text-align: center; border-radius: 14px 14px 0 0; }
    .header h1 { font-family: ${emailTheme.serif}; font-size: 28px; font-weight: 300; font-style: italic; margin: 0 0 8px; }
    .header p { font-family: ${emailTheme.sans}; font-size: 14px; opacity: 0.85; margin: 0; }
    .content { background: ${emailTheme.cream}; padding: 32px; border: 1px solid ${emailTheme.border}; border-top: none; border-radius: 0 0 14px 14px; }
    .order-info { background: #fff; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid ${emailTheme.gold}; }
    .items { background: #fff; padding: 20px; margin: 20px 0; border-radius: 10px; border: 1px solid ${emailTheme.border}; }
    .total { background: ${emailTheme.creamDark}; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: right; }
    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%); color: ${emailTheme.dark}; text-decoration: none; border-radius: 12px; font-family: ${emailTheme.sans}; font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; margin: 20px 0; }
    .footer { text-align: center; padding: 24px; color: ${emailTheme.textLight}; font-size: 12px; font-family: ${emailTheme.sans}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Commande confirmée</h1>
      <p>Merci pour votre commande — nous sommes ravis de vous compter parmi nous.</p>
    </div>
    
    <div class="content">
      <p>Bonjour ${customerName},</p>
      
      <p>Merci pour votre commande. Nous l'avons bien reçue et le paiement est confirmé. Voici les détails :</p>
      
      <div class="order-info">
        <h2 style="margin-top: 0;">Détails de la Commande</h2>
        <p><strong>Numéro de Commande :</strong> ${order.id || 'N/A'}</p>
        <p><strong>Date de Commande :</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('fr-CA', { 
          timeZone: customerTimezone,
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : new Date().toLocaleString('fr-CA', { timeZone: customerTimezone })}</p>
        <p><strong>Statut :</strong> <span style="color: ${emailTheme.gold}; font-weight: bold;">${(order.status || 'en attente').charAt(0).toUpperCase() + (order.status || 'en attente').slice(1)}</span></p>
      </div>

      <div class="items">
        <h3 style="margin-top: 0;">Articles Commandés :</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${(order.items || []).map(item => {
            // Format item name - if variant is already in name, don't duplicate it
            let itemDisplay = item.name || 'Article'
            if (item.variant && !itemDisplay.includes(item.variant)) {
              itemDisplay += ` - ${item.variant}`
            }
            return `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              ${itemDisplay} - Qté : ${item.quantity || 1} - ${(item.total || item.price * (item.quantity || 1) || 0).toFixed(2)} $
            </li>`
          }).join('')}
        </ul>
      </div>

      <div class="total">
        <p style="margin: 5px 0;"><strong>Sous-total :</strong> ${(order.subtotal || 0).toFixed(2)} $ ${order.currency || 'CAD'}</p>
        <p style="margin: 5px 0;"><strong>Expédition :</strong> ${(order.shippingCost || 0).toFixed(2)} $ ${order.currency || 'CAD'}</p>
        <p style="margin: 5px 0;"><strong>Taxe :</strong> ${(order.tax || 0).toFixed(2)} $ ${order.currency || 'CAD'}</p>
        <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">Total : ${(order.total || 0).toFixed(2)} $ ${order.currency || 'CAD'}</p>
      </div>

      <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin-top: 0;">Adresse de Livraison :</h3>
        <p style="margin: 8px 0;">
          <strong>${shippingName}</strong><br>
          ${shippingAddress.line1 || ''}<br>
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
          ${shippingAddress.city || ''}${shippingAddress.city && (shippingAddress.state || shippingAddress.province) ? ', ' : ''} ${shippingAddress.state || shippingAddress.province || ''} ${shippingAddress.postal_code || shippingAddress.postalCode || ''}<br>
          ${shippingAddress.country || ''}
        </p>
        <p style="margin: 8px 0;"><strong>Méthode d'Expédition :</strong> ${order.shipping?.method || 'Expédition Standard'}</p>
      </div>

      ${order.trackingNumber ? `
      <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0;">Informations de Suivi</h3>
        <p><strong>Numéro de Suivi :</strong> ${order.trackingNumber}</p>
        <p style="margin-top: 10px;"><a href="https://www.canadapost.ca/trackweb/fr#/search?searchFor=${order.trackingNumber}" target="_blank" style="color: #10b981; text-decoration: none;">Suivre avec Postes Canada →</a></p>
      </div>
      ` : ''}
      ${trackingUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackingUrl}" class="button">Suivre Votre Commande</a>
      </div>
      ` : ''}

      <p>Nous vous enverrons un autre e-mail lorsque votre commande sera expédiée avec les informations de suivi.</p>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      
      <p>Merci d'avoir choisi Pure Peel Co. 🍁</p>
    </div>

    <div class="footer">
      <p>Pure Peel Co. · Fabriqué au Canada</p>
      <p>Ceci est un e-mail automatisé. Veuillez ne pas répondre directement à ce message.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Language-aware template selector
const orderConfirmationTemplate = (order, trackingUrl, language = 'en') => {
  return language === 'fr' 
    ? orderConfirmationTemplateFR(order, trackingUrl)
    : orderConfirmationTemplateEN(order, trackingUrl)
}

// Welcome email (10% off) - English
const welcomeEmailTemplateEN = (promoCode = 'WELCOME10') => {
  const shopUrl = process.env.FRONTEND_URL || 'https://purepeelco.com'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.6; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: ${emailTheme.cream}; padding: 48px 40px 32px; text-align: left; }
    .eyebrow { font-family: ${emailTheme.sans}; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(200,90,8,0.7); margin-bottom: 20px; }
    h1 { font-family: ${emailTheme.serif}; font-size: 32px; font-weight: 300; font-style: italic; color: ${emailTheme.dark}; margin: 0 0 16px; line-height: 1.3; }
    .content { background: ${emailTheme.cream}; padding: 0 40px 48px; }
    .lead { font-size: 16px; color: ${emailTheme.dark}; margin: 0 0 28px; line-height: 1.7; font-weight: 300; }
    .code-box { background: #fff; border: 1px solid rgba(232,200,74,0.4); border-radius: 12px; padding: 24px 32px; text-align: center; margin: 0 0 32px; }
    .code-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: ${emailTheme.textMid}; margin: 0 0 8px; }
    .code { font-family: 'Courier New', monospace; font-size: 26px; font-weight: 700; color: ${emailTheme.dark}; letter-spacing: 0.12em; margin: 0 0 8px; }
    .code-desc { font-size: 13px; color: ${emailTheme.gold}; margin: 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%); color: ${emailTheme.dark}; text-align: center; padding: 16px 32px; border-radius: 100px; font-family: ${emailTheme.sans}; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; margin: 0 0 40px; }
    .footer { border-top: 1px solid ${emailTheme.border}; padding: 24px 40px; font-size: 12px; color: ${emailTheme.textLight}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="eyebrow">Welcome to Pure Peel Co.</p>
      <h1>A little something<br/>for joining us.</h1>
    </div>
    <div class="content">
      <p class="lead">Thanks for signing up. Here's your welcome discount — use it on your first order:</p>
      <div class="code-box">
        <p class="code-label">Your discount code</p>
        <p class="code">${promoCode}</p>
        <p class="code-desc">10% off your first order</p>
      </div>
      <div style="text-align: center;">
        <a href="${shopUrl}" class="cta">Shop Now</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">You're receiving this because you signed up at purepeelco.com.</p>
      <p style="margin: 8px 0 0 0;">Pure Peel Co. — Premium dehydrated citrus, made in Canada.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Welcome email (10% off) - French
const welcomeEmailTemplateFR = (promoCode = 'WELCOME10') => {
  const shopUrl = process.env.FRONTEND_URL || 'https://purepeelco.com'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.6; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: ${emailTheme.cream}; padding: 48px 40px 32px; text-align: left; }
    .eyebrow { font-family: ${emailTheme.sans}; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(200,90,8,0.7); margin-bottom: 20px; }
    h1 { font-family: ${emailTheme.serif}; font-size: 32px; font-weight: 300; font-style: italic; color: ${emailTheme.dark}; margin: 0 0 16px; line-height: 1.3; }
    .content { background: ${emailTheme.cream}; padding: 0 40px 48px; }
    .lead { font-size: 16px; color: ${emailTheme.dark}; margin: 0 0 28px; line-height: 1.7; font-weight: 300; }
    .code-box { background: #fff; border: 1px solid rgba(232,200,74,0.4); border-radius: 12px; padding: 24px 32px; text-align: center; margin: 0 0 32px; }
    .code-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: ${emailTheme.textMid}; margin: 0 0 8px; }
    .code { font-family: 'Courier New', monospace; font-size: 26px; font-weight: 700; color: ${emailTheme.dark}; letter-spacing: 0.12em; margin: 0 0 8px; }
    .code-desc { font-size: 13px; color: ${emailTheme.gold}; margin: 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%); color: ${emailTheme.dark}; text-align: center; padding: 16px 32px; border-radius: 100px; font-family: ${emailTheme.sans}; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; margin: 0 0 40px; }
    .footer { border-top: 1px solid ${emailTheme.border}; padding: 24px 40px; font-size: 12px; color: ${emailTheme.textLight}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="eyebrow">Bienvenue chez Pure Peel Co.</p>
      <h1>Un petit quelque chose<br/>pour vous remercier.</h1>
    </div>
    <div class="content">
      <p class="lead">Merci de vous être inscrit. Voici votre réduction de bienvenue — à utiliser sur votre première commande :</p>
      <div class="code-box">
        <p class="code-label">Votre code promo</p>
        <p class="code">${promoCode}</p>
        <p class="code-desc">10 % de réduction sur votre première commande</p>
      </div>
      <div style="text-align: center;">
        <a href="${shopUrl}" class="cta">Magasiner</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Vous recevez ceci car vous vous êtes inscrit sur purepeelco.com.</p>
      <p style="margin: 8px 0 0 0;">Pure Peel Co. — Agrumes déshydratés, fabriqués au Canada.</p>
    </div>
  </div>
</body>
</html>
  `
}

// "THE LIST" / inline capture — relationship-building, one idea per email. Not transactional.
const welcomeListEmailTemplateEN = () => {
  const shopUrl = process.env.FRONTEND_URL || 'https://purepeelco.com'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.7; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: ${emailTheme.cream}; padding: 40px 40px 24px; text-align: left; }
    .content { background: ${emailTheme.cream}; padding: 0 40px 48px; }
    .p { font-size: 16px; color: ${emailTheme.dark}; margin: 0 0 20px; font-weight: 300; }
    .tip { background: #fff; border-left: 3px solid ${emailTheme.gold}; padding: 20px 24px; margin: 28px 0; border-radius: 0 8px 8px 0; font-size: 15px; color: ${emailTheme.dark}; }
    .tip strong { font-weight: 600; }
    .soft-cta { font-size: 15px; color: ${emailTheme.dark}; margin: 28px 0 0; font-weight: 300; }
    .soft-cta a { color: ${emailTheme.gold}; text-decoration: none; font-weight: 500; }
    .soft-cta a:hover { text-decoration: underline; }
    .footer { border-top: 1px solid ${emailTheme.border}; padding: 24px 40px; font-size: 12px; color: ${emailTheme.textLight}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="p" style="margin: 0;">Last weekend I was making cocktails for eight people and realized I'd forgotten to buy limes. Turns out a few dehydrated lime slices in the shaker — and one on the rim — worked even better. No last-minute run to the store, and everyone asked where they came from.</p>
    </div>
    <div class="content">
      <p class="p">So here's the one thing I'd tell you first: keep a small jar of dehydrated citrus by the bar. Orange for old fashioneds, lime for g&t's and margaritas, grapefruit if you're feeling fancy. They rehydrate in the drink in seconds and look (and taste) like you actually planned ahead.</p>
      <div class="tip">
        <strong>This week's move:</strong> Drop 2–3 dried lime slices into your next gin and tonic. Let them sit for 30 seconds. Then taste. You'll get why we keep a bag in the cupboard.
      </div>
      <p class="soft-cta">We use our lime slices for exactly this — <a href="${shopUrl}">grab a bag if you're running low</a>.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">You're on THE LIST — seasonal ideas, one at a time. Pure Peel Co.</p>
    </div>
  </div>
</body>
</html>
  `
}

const welcomeListEmailTemplateFR = () => {
  const shopUrl = process.env.FRONTEND_URL || 'https://purepeelco.com'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: ${emailTheme.sans}; line-height: 1.7; color: ${emailTheme.dark}; margin: 0; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: ${emailTheme.cream}; padding: 40px 40px 24px; text-align: left; }
    .content { background: ${emailTheme.cream}; padding: 0 40px 48px; }
    .p { font-size: 16px; color: ${emailTheme.dark}; margin: 0 0 20px; font-weight: 300; }
    .tip { background: #fff; border-left: 3px solid ${emailTheme.gold}; padding: 20px 24px; margin: 28px 0; border-radius: 0 8px 8px 0; font-size: 15px; color: ${emailTheme.dark}; }
    .tip strong { font-weight: 600; }
    .soft-cta { font-size: 15px; color: ${emailTheme.dark}; margin: 28px 0 0; font-weight: 300; }
    .soft-cta a { color: ${emailTheme.gold}; text-decoration: none; font-weight: 500; }
    .soft-cta a:hover { text-decoration: underline; }
    .footer { border-top: 1px solid ${emailTheme.border}; padding: 24px 40px; font-size: 12px; color: ${emailTheme.textLight}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="p" style="margin: 0;">La fin de semaine dernière, je préparais des cocktails pour huit et je me suis rendu compte qu'il n'y avait plus de citrons verts. Quelques tranches de lime déshydratées dans le shaker — et une sur le bord du verre — ont fait encore mieux. Pas de course au magasin, et tout le monde a demandé d'où ça venait.</p>
    </div>
    <div class="content">
      <p class="p">Donc le premier conseil que je vous donne : gardez un petit pot d'agrumes déshydratés près du bar. Orange pour les old fashioneds, lime pour g&t et margaritas, pamplemousse si vous voulez faire les choses en grand. Ils se réhydratent en quelques secondes dans le verre et donnent l'impression que vous aviez tout prévu.</p>
      <div class="tip">
        <strong>L'astuce de la semaine :</strong> Mettez 2–3 tranches de lime séchées dans votre prochain gin tonic. Laissez reposer 30 secondes. Puis goûtez. Vous comprendrez pourquoi on garde toujours un sachet dans le placard.
      </div>
      <p class="soft-cta">On utilise nos tranches de lime exactement pour ça — <a href="${shopUrl}">prenez un sachet si vous en manquez</a>.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">Vous êtes sur LA LISTE — une idée à la fois. Pure Peel Co.</p>
    </div>
  </div>
</body>
</html>
  `
}

const shippingNotificationTemplate = (order, trackingNumber) => {
  const customerName = order.customer?.name || 'Customer'
  const customerEmail = order.customer?.email || ''
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Your Order Has Shipped!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      <div class="info-box">
        <h2 style="margin-top: 0;">Shipping Information</h2>
        <p><strong>Order Number:</strong> ${order.id || 'N/A'}</p>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking?orderId=${order.id || ''}&email=${encodeURIComponent(customerEmail)}" class="button">Track Your Order</a>
      </div>

      <p>You can track your order status at any time using the link above.</p>
      
      <p>Thank you for your purchase!</p>
    </div>

    <div class="footer">
      <p>Pure Peel Co. | Made in Canada</p>
    </div>
  </div>
</body>
</html>
  `
}

const adminNotificationTemplate = (order) => {
  const customerName = order.customer?.name || 'N/A'
  const customerEmail = order.customer?.email || 'N/A'
  const customerPhone = order.customer?.phone || 'N/A'
  const shippingName = order.shipping?.name || customerName
  const shippingAddress = order.shipping?.address || {}

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .alert { background: #fef3c7; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Order Received</h1>
    </div>
    
    <div class="content">
      <div class="alert">
        <strong>New Order Alert!</strong> A new order has been placed and payment has been confirmed.
      </div>
      
      <div class="info-box">
        <h2 style="margin-top: 0;">Order Summary</h2>
        <p><strong>Order Number:</strong> ${order.id || 'N/A'}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Total:</strong> $${(order.total || (order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)} ${order.currency || 'CAD'}</p>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0;">Items:</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${(order.items || []).map(item => {
            // Format item name - if variant is already in name, don't duplicate it
            let itemDisplay = item.name || 'Item'
            if (item.variant && !itemDisplay.includes(item.variant)) {
              itemDisplay += ` - ${item.variant}`
            }
            return `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              ${itemDisplay} - Qty: ${item.quantity || 1} - $${(item.total || item.price * (item.quantity || 1) || 0).toFixed(2)}
            </li>`
          }).join('')}
        </ul>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0;">Shipping Address:</h3>
        <p style="margin: 8px 0;">
          <strong>${shippingName}</strong><br>
          ${shippingAddress.line1 ? shippingAddress.line1 + '<br>' : ''}
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
          ${shippingAddress.city || ''}${shippingAddress.city && (shippingAddress.state || shippingAddress.province || shippingAddress.postal_code || shippingAddress.postalCode) ? ', ' : ''}${shippingAddress.state || shippingAddress.province || ''} ${shippingAddress.postal_code || shippingAddress.postalCode || ''}<br>
          ${shippingAddress.country || ''}
        </p>
        <p style="margin: 8px 0;"><strong>Shipping Method:</strong> ${order.shipping?.method || 'Standard Shipping'}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// Send order confirmation email to customer
export const sendOrderConfirmation = async (order) => {
  try {
    const customerEmail = order.customer?.email || ''
    // Build tracking URL - include tracking number if available
    let trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking?orderId=${order.id || ''}&email=${encodeURIComponent(customerEmail)}`
    if (order.trackingNumber) {
      trackingUrl += `&tracking=${encodeURIComponent(order.trackingNumber)}`
    }
    
    // Detect language from order metadata or default to 'en'
    const language = order.metadata?.language || order.language || 'en'
    const htmlContent = orderConfirmationTemplate(order, trackingUrl, language)
    const subject = language === 'fr' 
      ? `Confirmation de Commande - ${order.id} | Pure Peel Co.`
      : `Order Confirmation - ${order.id} | Pure Peel Co.`
    
    // Use Resend if configured
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        console.log('📧 Attempting to send email via Resend...')
        console.log('   From:', process.env.RESEND_FROM_EMAIL)
        const customerEmail = order.customer?.email || 'unknown'
        console.log('   To:', customerEmail)
        
            const { data, error } = await resend.emails.send({
          from: `Pure Peel Co. <${process.env.RESEND_FROM_EMAIL}>`,
          to: customerEmail,
          replyTo: process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL,
          subject: subject,
          html: htmlContent,
          headers: {
            'X-Entity-Ref-ID': order.id || 'unknown',
            'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL || 'support@purepeelco.com'}?subject=Unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            'X-Auto-Response-Suppress': 'All'
          },
          tags: [
            { name: 'order-confirmation', value: order.id || 'unknown' }
          ]
        })

        if (error) {
          console.error('❌ Resend error:', JSON.stringify(error, null, 2))
          return { success: false, error: error.message || JSON.stringify(error) }
        }

        console.log('✅ Order confirmation email sent via Resend to:', customerEmail)
        console.log('   Message ID:', data?.id)
        console.log('   Check delivery status at: https://resend.com/emails')
        
        // Return more details for debugging
        return { 
          success: true, 
          messageId: data?.id,
          resendData: data,
          note: 'Check your spam folder. If using onboarding@resend.dev, verify your domain in Resend for better delivery.'
        }
      } catch (err) {
        console.error('❌ Exception sending email via Resend:', err)
        return { success: false, error: err.message }
      }
    }

    // Fallback to nodemailer (Gmail/SMTP)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      const customerEmail = order.customer?.email || 'unknown'
      console.log('⚠️  Email not configured. Order confirmation email would be sent to:', customerEmail)
      console.log('   To enable emails, add RESEND_API_KEY and RESEND_FROM_EMAIL to your .env file')
      console.log('   Or use Gmail/SMTP with EMAIL_USER and EMAIL_PASSWORD')
      console.log('   See README_EMAIL_SETUP.md for instructions')
      return { success: false, reason: 'Email not configured' }
    }

    const mailOptions = {
      from: `"Pure Peel Co." <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: subject,
      html: htmlContent
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail(mailOptions)
    
    // In development mode with streamTransport, log the email
    if (process.env.EMAIL_SERVICE !== 'gmail' && !process.env.SMTP_HOST) {
      console.log('📧 Email would be sent (email not configured):')
      console.log('To:', mailOptions.to)
      console.log('Subject:', mailOptions.subject)
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log('Preview URL:', previewUrl)
      }
    } else {
      console.log('✅ Order confirmation email sent to:', customerEmail)
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send shipping notification to customer
export const sendShippingNotification = async (order, trackingNumber = null) => {
  try {
    const htmlContent = shippingNotificationTemplate(order, trackingNumber)
    const subject = `Your Order Has Shipped - ${order.id} | Pure Peel Co.`
    
    // Use Resend if configured
    if (resend && process.env.RESEND_FROM_EMAIL) {
      const customerEmail = order.customer?.email || ''
      if (!customerEmail) {
        console.error('❌ No customer email found in order')
        return { success: false, error: 'Customer email is required' }
      }
      
      const { data, error } = await resend.emails.send({
        from: `Pure Peel Co. <${process.env.RESEND_FROM_EMAIL}>`,
        to: customerEmail,
        replyTo: process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL,
        subject: subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': order.id || 'unknown',
          'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL || 'support@purepeelco.com'}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Auto-Response-Suppress': 'All'
        },
        tags: [
          { name: 'shipping-notification', value: order.id || 'unknown' }
        ]
      })

      if (error) {
        console.error('❌ Resend error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Shipping notification email sent via Resend to:', customerEmail)
      return { success: true, messageId: data?.id }
    }

    // Fallback to nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured. Shipping notification would be sent to:', customerEmail)
      return { success: false, reason: 'Email not configured' }
    }

    const mailOptions = {
      from: `"Pure Peel Co." <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: subject,
      html: htmlContent
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail(mailOptions)
    
    if (process.env.EMAIL_SERVICE !== 'gmail' && !process.env.SMTP_HOST) {
      console.log('📧 Shipping notification would be sent (email not configured)')
    } else {
      console.log('✅ Shipping notification email sent to:', customerEmail)
    }
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending shipping notification:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new order
export const sendAdminNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL?.split('<')[1]?.replace('>', '') || process.env.EMAIL_USER
    
    if (!adminEmail) {
      console.log('Admin email not configured. New order notification would be sent.')
      return { success: false, reason: 'Admin email not configured' }
    }

    const htmlContent = adminNotificationTemplate(order)
    const subject = `🛒 New Order: ${order.id} - $${order.total.toFixed(2)} ${order.currency}`
    
    // Use Resend if configured
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        console.log('📧 Attempting to send admin notification via Resend...')
        console.log('   From:', process.env.RESEND_FROM_EMAIL)
        console.log('   To:', adminEmail)
        
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: adminEmail,
          subject: subject,
          html: htmlContent,
          headers: {
            'X-Entity-Ref-ID': order.id || 'unknown'
          },
          tags: [
            { name: 'admin-notification', value: order.id || 'unknown' }
          ]
        })

        if (error) {
          console.error('❌ Resend error:', JSON.stringify(error, null, 2))
          return { success: false, error: error.message || JSON.stringify(error) }
        }

        console.log('✅ Admin notification email sent via Resend to:', adminEmail)
        console.log('   Message ID:', data?.id)
        return { success: true, messageId: data?.id }
      } catch (err) {
        console.error('❌ Exception sending admin email via Resend:', err)
        return { success: false, error: err.message }
      }
    }

    // Fallback to nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Admin email not configured. New order notification would be sent.')
      return { success: false, reason: 'Admin email not configured' }
    }

    const mailOptions = {
      from: `"Pure Peel Co. Orders" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: htmlContent
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail(mailOptions)
    
    if (process.env.EMAIL_SERVICE !== 'gmail' && !process.env.SMTP_HOST) {
      console.log('📧 Admin notification would be sent (email not configured)')
    } else {
      console.log('✅ Admin notification email sent to:', adminEmail)
    }
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error: error.message }
  }
}

// Contact form email template
const contactFormTemplate = (name, email, inquiryType, message) => {
  const inquiryTypeLabels = {
    'general': 'General Inquiry',
    'support': 'Product Issue & Support',
    'shipping': 'Shipping Inquiry',
    'bulk': 'Bulk Order Inquiry'
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
        .value { color: #1f2937; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb; }
        .message { white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0;">Pure Peel Co. Website</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <span class="label">Inquiry Type:</span>
            <div class="value">${inquiryTypeLabels[inquiryType] || inquiryType}</div>
          </div>
          <div class="field">
            <span class="label">Message:</span>
            <div class="value message">${message}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from the contact form on purepeelco.com</p>
          <p>Reply directly to this email to respond to ${name}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send contact form submission
export const sendContactForm = async (name, email, inquiryType, message) => {
  try {
    // Normalize inquiryType to lowercase to ensure matching
    const normalizedInquiryType = (inquiryType || '').toLowerCase().trim()
    
    // Route to appropriate email alias based on inquiry type
    const emailAliases = {
      'general': 'info@purepeelco.com',
      'support': 'support@purepeelco.com',
      'shipping': 'shipping@purepeelco.com',
      'bulk': 'orders@purepeelco.com'
    }
    
    const adminEmail = emailAliases[normalizedInquiryType] || emailAliases['general']
    
    // Log routing decision for debugging
    console.log('📧 Contact form routing:', {
      inquiryType: inquiryType,
      normalizedInquiryType: normalizedInquiryType,
      routingTo: adminEmail,
      availableTypes: Object.keys(emailAliases)
    })
    
    if (!adminEmail) {
      console.log('Admin email not configured. Contact form submission would be sent.')
      return { success: false, reason: 'Admin email not configured' }
    }

    const inquiryTypeLabels = {
      'general': 'General Inquiry',
      'support': 'Product Issue & Support',
      'shipping': 'Shipping Inquiry',
      'bulk': 'Bulk Order Inquiry'
    }
    
    const htmlContent = contactFormTemplate(name, email, normalizedInquiryType, message)
    const subject = `📧 ${inquiryTypeLabels[normalizedInquiryType] || 'Contact Form'}: ${name}`
    
    // Use Resend if configured
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        // Send FROM the same alias as TO, so the sender matches the inquiry type
        // Format: "Display Name <email@domain.com>"
        const fromEmail = `Pure Peel Co. <${adminEmail}>`
        
        console.log('📧 Attempting to send contact form via Resend...')
        console.log('   From:', fromEmail)
        console.log('   To:', adminEmail)
        console.log('   Customer:', email)
        console.log('   Inquiry Type:', normalizedInquiryType)
        
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          replyTo: email, // Allow replying directly to customer
          subject: subject,
          html: htmlContent,
          headers: {
            'X-Entity-Ref-ID': `contact-${Date.now()}`
          },
          tags: [
            { name: 'contact-form', value: 'submission' }
          ]
        })

        if (error) {
          console.error('❌ Resend error:', JSON.stringify(error, null, 2))
          return { success: false, error: error.message || JSON.stringify(error) }
        }

        console.log('✅ Contact form email sent via Resend to:', adminEmail)
        console.log('   Message ID:', data?.id)
        return { success: true, messageId: data?.id }
      } catch (err) {
        console.error('❌ Exception sending contact email via Resend:', err)
        return { success: false, error: err.message }
      }
    }

    // Fallback to nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email not configured. Contact form submission would be sent.')
      return { success: false, reason: 'Email not configured' }
    }

    const mailOptions = {
      from: `"Pure Peel Co. Contact Form" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: subject,
      html: htmlContent
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail(mailOptions)
    
    if (process.env.EMAIL_SERVICE !== 'gmail' && !process.env.SMTP_HOST) {
      console.log('📧 Contact form would be sent (email not configured)')
    } else {
      console.log('✅ Contact form email sent to:', adminEmail)
    }
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error: error.message }
  }
}

// Preview helpers (for viewing templates in browser)
const mockOrder = {
  id: 'PP-12345678',
  status: 'pending',
  createdAt: new Date().toISOString(),
  customer: { name: 'Jordan Smith', email: 'jordan@example.com' },
  shipping: {
    name: 'Jordan Smith',
    method: 'Regular Parcel',
    address: { line1: '123 Main St', city: 'Toronto', province: 'ON', postalCode: 'M5V 1A1', country: 'CA' }
  },
  items: [
    { name: 'Pure Peel Orange', variant: 'Small Bag - 20 pcs', quantity: 1, total: 9, price: 9 },
    { name: 'Pure Peel Lemon', variant: 'Large Bag - 40 pcs', quantity: 1, total: 14, price: 14 }
  ],
  subtotal: 23,
  shippingCost: 12,
  tax: 0,
  total: 35,
  currency: 'CAD',
  metadata: { language: 'en' }
}

export const getOrderConfirmationPreview = (language = 'en') => {
  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking?orderId=PP-12345678&email=jordan%40example.com`
  return orderConfirmationTemplate(mockOrder, trackingUrl, language)
}

export const getWelcomeEmailPreview = (language = 'en', source = 'popup') => {
  const isPopup = source === 'popup'
  if (isPopup) {
    const promoCode = process.env.WELCOME_PROMO_CODE || 'WELCOME10'
    return language === 'fr' ? welcomeEmailTemplateFR(promoCode) : welcomeEmailTemplateEN(promoCode)
  }
  return language === 'fr' ? welcomeListEmailTemplateFR() : welcomeListEmailTemplateEN()
}

// Send welcome email to new subscribers (template depends on source: popup = 10% off, inline = list confirmation)
export const sendWelcomeEmail = async (email, options = {}) => {
  const { language = 'en', source = 'inline', promoCode = process.env.WELCOME_PROMO_CODE || 'WELCOME10' } = options
  const isPopup = source === 'popup'
  try {
    const htmlContent = isPopup
      ? (language === 'fr' ? welcomeEmailTemplateFR(promoCode) : welcomeEmailTemplateEN(promoCode))
      : (language === 'fr' ? welcomeListEmailTemplateFR() : welcomeListEmailTemplateEN())
    const subject = isPopup
      ? (language === 'fr' ? 'Votre code 10 % de réduction vous attend | Pure Peel Co.' : 'Your 10% off code is inside | Pure Peel Co.')
      : (language === 'fr'
          ? (process.env.LIST_WELCOME_SUBJECT_FR || 'La garniture qui a sauvé mon souper')
          : (process.env.LIST_WELCOME_SUBJECT_EN || 'The garnish that saved my dinner party'))

    if (resend && process.env.RESEND_FROM_EMAIL) {
      const fromDisplay = process.env.RESEND_FROM_EMAIL.includes('<') ? process.env.RESEND_FROM_EMAIL : `Pure Peel Co. <${process.env.RESEND_FROM_EMAIL}>`
      const { data, error } = await resend.emails.send({
        from: fromDisplay,
        to: email,
        subject,
        html: htmlContent,
        headers: { 'X-Entity-Ref-ID': `welcome-${Date.now()}` },
        tags: [{ name: 'welcome', value: isPopup ? '10-off-popup' : 'list' }]
      })
      if (error) {
        console.error('❌ Welcome email Resend error:', error.message || JSON.stringify(error))
        return { success: false, error: error.message }
      }
      console.log('✅ Welcome email sent via Resend to:', email, '| Message ID:', data?.id)
      return { success: true, messageId: data?.id }
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email not configured. Welcome email would be sent to:', email)
      return { success: false, reason: 'Email not configured' }
    }

    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: `"Pure Peel Co." <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent
    })
    console.log('✅ Welcome email sent to:', email)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

