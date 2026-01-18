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

// Email templates - English
const orderConfirmationTemplateEN = (order, trackingUrl) => {
  const customerName = order.customer?.name || 'Customer'
  const customerEmail = order.customer?.email || ''
  const shippingName = order.shipping?.name || customerName
  const shippingAddress = order.shipping?.address || {}
  // Use customer's timezone if available, otherwise default to America/Toronto
  const customerTimezone = order.timezone || order.metadata?.timezone || 'America/Toronto'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .items { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .total { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: right; }
    .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍁 Order Confirmed!</h1>
      <p>Thank you for your order with Pure Peel Co.</p>
    </div>
    
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <p>We're excited to let you know that we've received your order and payment has been confirmed!</p>
      
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
        <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span></p>
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
      
      <p>If you have any questions, please don't hesitate to reach out to us.</p>
      
      <p>Thank you for choosing Pure Peel Co. 🍁</p>
    </div>

    <div class="footer">
      <p>Pure Peel Co. | Made in Canada</p>
      <p>This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Email templates - French
const orderConfirmationTemplateFR = (order, trackingUrl) => {
  const customerName = order.customer?.name || 'Client'
  const customerEmail = order.customer?.email || ''
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
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .items { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .total { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: right; }
    .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍁 Commande Confirmée !</h1>
      <p>Merci pour votre commande chez Pure Peel Co.</p>
    </div>
    
    <div class="content">
      <p>Bonjour ${customerName},</p>
      
      <p>Nous sommes ravis de vous informer que nous avons reçu votre commande et que le paiement a été confirmé !</p>
      
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
        <p><strong>Statut :</strong> <span style="color: #f59e0b; font-weight: bold;">${(order.status || 'en attente').charAt(0).toUpperCase() + (order.status || 'en attente').slice(1)}</span></p>
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
      <p>Pure Peel Co. | Fabriqué au Canada</p>
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

