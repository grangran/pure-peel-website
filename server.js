import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { body, param, query, validationResult } from 'express-validator'
import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'
import { saveOrder, getAllOrders, getOrderById, updateOrderStatus, getOrderStats, markEmailSent, hasEmailBeenSent, updateOrderTracking } from './utils/orderStorage.js'
import { hasSubscriber, addSubscriber, getSubscribers } from './utils/subscriberStorage.js'
import { sendOrderConfirmation, sendShippingNotification, sendAdminNotification, sendContactForm, sendWelcomeEmail, getOrderConfirmationPreview, getWelcomeEmailPreview } from './utils/emailService.js'
import { createCanadaPostLabel } from './utils/canadaPostShipping.js'
import { getAllProducts, getProductById, saveProduct, updateProduct, deleteProduct, bulkSaveProducts } from './utils/productStorage.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy - required for rate limiting behind reverse proxies (Render, Vercel, etc.)
// Set to 1 to trust the first proxy (Render)
app.set('trust proxy', 1)

// CORS configuration - restrict to your domains only
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'https://purepeelco.com',
      'https://www.purepeelco.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5178',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5178',
      'http://127.0.0.1:3000'
    ]
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

// ============================================
// ENHANCED RATE LIMITING (IP + User-Based)
// Following OWASP best practices
// ============================================

// Custom key generator for user-based rate limiting
// Combines IP address with user identifier (email) when available
const generateRateLimitKey = (req) => {
  const ip = req.ip || req.connection.remoteAddress
  // Try to get user identifier from request body (email) for user-based limiting
  let userIdentifier = ''
  if (req.body?.shippingInfo?.email) {
    userIdentifier = req.body.shippingInfo.email.toLowerCase().trim()
  } else if (req.body?.email) {
    userIdentifier = req.body.email.toLowerCase().trim()
  }
  
  // Return combined key for user-based limiting, or IP-only fallback
  return userIdentifier ? `${ip}:${userIdentifier}` : ip
}

// Graceful 429 response handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) || 900, // seconds until reset
    limit: req.rateLimit.limit,
    remaining: req.rateLimit.remaining,
    reset: new Date(req.rateLimit.resetTime).toISOString()
  })
}

// General API rate limiter - 100 requests per 15 minutes per IP/user
// Following OWASP recommendation: 100-200 requests per 15 minutes for general APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP/user to 100 requests per windowMs
  keyGenerator: generateRateLimitKey, // Use custom key generator for user-based limiting
  handler: rateLimitHandler, // Graceful 429 response
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, not just failures
  skipFailedRequests: false, // Count failed requests too
  // Note: trustProxy is handled by Express's app.set('trust proxy', 1) above
})

// Stricter rate limiter for checkout - 5 attempts per 15 minutes per IP/user
// Following OWASP recommendation: 5-10 attempts per 15 minutes for sensitive operations
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP/user to 5 checkout attempts per 15 minutes
  keyGenerator: generateRateLimitKey, // User-based limiting
  handler: rateLimitHandler, // Graceful 429 response
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
})

// Stricter rate limiter for shipping rates - 20 requests per 15 minutes per IP/user
const shippingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP/user to 20 shipping rate requests per 15 minutes
  keyGenerator: generateRateLimitKey, // User-based limiting
  handler: rateLimitHandler, // Graceful 429 response
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
})

// Webhook rate limiter - Stripe webhooks should be rate limited but more lenient
// Following OWASP: 200 requests per 15 minutes for webhooks
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 webhook requests per 15 minutes (Stripe can send many)
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
})

// Order lookup rate limiter - 10 attempts per 15 minutes per IP/user
// Prevents enumeration attacks
const orderLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP/user to 10 order lookup attempts per 15 minutes
  keyGenerator: generateRateLimitKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
})

// Health check rate limiter - Very lenient for monitoring
const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(cors(corsOptions))

// IMPORTANT: Webhook endpoint must be BEFORE express.json() middleware
// Stripe webhooks require the raw body for signature verification
// Apply rate limiting to webhook endpoint (following OWASP best practices)
app.post('/api/webhook', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
    })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('⚠️  STRIPE_WEBHOOK_SECRET not set - webhook signature verification disabled')
    return res.status(400).send('Webhook secret not configured')
  }

  let event

  try {
    // Verify webhook signature using raw body
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    console.log('✅ Webhook signature verified:', event.type)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      console.log('📦 Checkout session completed:', session.id)
      console.log('   Payment status:', session.payment_status)
      console.log('   Customer email:', session.customer_email)
      
      try {
        // Retrieve full session details to get line items
        // Retrieve full session with line items expanded
        // Note: shipping_details is included by default when shipping_address_collection is enabled
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items']
        })

        // Debug logging for shipping address (webhook handler)
        console.log('📦 Shipping address debug (webhook):', {
          sessionId: fullSession.id,
          hasShippingDetails: !!fullSession.shipping_details,
          shippingDetailsName: fullSession.shipping_details?.name,
          shippingDetailsAddress: fullSession.shipping_details?.address,
          addressLine1: fullSession.shipping_details?.address?.line1,
          addressCity: fullSession.shipping_details?.address?.city,
          addressState: fullSession.shipping_details?.address?.state,
          addressProvince: fullSession.shipping_details?.address?.province,
          addressPostalCode: fullSession.shipping_details?.address?.postal_code,
          addressCountry: fullSession.shipping_details?.address?.country,
          fullShippingDetails: JSON.stringify(fullSession.shipping_details, null, 2),
          // Also check the original session object from the event
          eventSessionHasShipping: !!session.shipping_details,
          eventSessionShipping: session.shipping_details ? JSON.stringify(session.shipping_details, null, 2) : 'null',
          shippingAddressCollection: fullSession.shipping_address_collection
        })

        // For free orders (total = 0), payment_status might be 'no_payment_required' instead of 'paid'
        const isFreeOrder = (fullSession.amount_total || 0) === 0
        const isPaidOrFree = fullSession.payment_status === 'paid' || 
                            (isFreeOrder && (fullSession.payment_status === 'no_payment_required' || fullSession.payment_status === 'unpaid'))

        // Check if order already exists by Stripe session ID
        const allOrders = getAllOrders()
        const existingOrder = allOrders.find(o => o.stripeSessionId === fullSession.id)

        if (!existingOrder && isPaidOrFree) {
          // Use order_id from metadata (set during checkout session creation)
          const orderIdFromMetadata = fullSession.metadata?.order_id || session.metadata?.order_id
          
          if (!orderIdFromMetadata) {
            console.error('⚠️ WARNING: order_id not found in session metadata (webhook handler)!')
            console.error('   FullSession metadata:', JSON.stringify(fullSession.metadata, null, 2))
            console.error('   Event metadata:', JSON.stringify(session.metadata, null, 2))
          }
          
          // Generate order ID from timestamp (8 digits) to match frontend format
          // ONLY if not found in metadata (should always be there)
          const orderId = orderIdFromMetadata || `PP-${Date.now().toString().slice(-8)}`
          
          console.log('📋 Order ID resolution (webhook):', {
            fromFullSessionMetadata: fullSession.metadata?.order_id,
            fromEventMetadata: session.metadata?.order_id,
            finalOrderId: orderId,
            wasGenerated: !orderIdFromMetadata
          })
          
          // Extract order information
          const orderData = {
            id: orderId,
            stripeSessionId: fullSession.id,
            stripePaymentIntentId: fullSession.payment_intent,
            language: fullSession.metadata?.language || 'en',
            timezone: fullSession.metadata?.timezone || 'America/Toronto',
            metadata: { 
              language: fullSession.metadata?.language || 'en',
              timezone: fullSession.metadata?.timezone || 'America/Toronto'
            },
            customer: {
              name: fullSession.metadata?.customer_name || fullSession.customer_details?.name || 'N/A',
              email: fullSession.customer_email || fullSession.customer_details?.email || 'N/A',
              phone: fullSession.metadata?.customer_phone || fullSession.customer_details?.phone || 'N/A',
            },
            shipping: {
              name: fullSession.shipping_details?.name || fullSession.customer_details?.name || fullSession.metadata?.customer_name || 'N/A',
              address: (() => {
                // First try Stripe's shipping_details address
                let addr = fullSession.shipping_details?.address || fullSession.shipping?.address || {}
                
                // If address is empty (common for free orders), use address from form metadata
                if ((!addr.line1 && !addr.line_1) || Object.keys(addr).length === 0) {
                  console.log('📋 Using shipping address from form metadata (Stripe address missing)')
                  addr = {
                    line1: fullSession.metadata?.shipping_address_line1 || '',
                    line2: fullSession.metadata?.shipping_address_line2 || '',
                    city: fullSession.metadata?.shipping_address_city || '',
                    province: fullSession.metadata?.shipping_address_province || '',
                    state: fullSession.metadata?.shipping_address_province || '',
                    postal_code: fullSession.metadata?.shipping_address_postal || '',
                    postalCode: fullSession.metadata?.shipping_address_postal || '',
                    country: fullSession.metadata?.shipping_address_country || 'Canada'
                  }
                  
                  // Log if we're using fallback address
                  if (addr.line1) {
                    console.log('✅ Using form address as fallback:', { city: addr.city, province: addr.province, postal: addr.postal_code })
                  } else {
                    console.error('⚠️ WARNING: Both Stripe and form addresses are missing!')
                  }
                }
                
                return addr
              })(),
              method: fullSession.shipping_cost?.display_name || fullSession.shipping_options?.[0]?.shipping_rate?.display_name || 'Standard Shipping'
            },
            items: fullSession.line_items?.data?.map(item => ({
              name: item.description || item.price_data?.product_data?.name || 'Unknown',
              variant: item.description?.split(' - ')[1] || 'N/A',
              quantity: item.quantity,
              price: item.price.unit_amount / 100,
              total: (item.price.unit_amount * item.quantity) / 100
            })) || [],
            subtotal: (fullSession.amount_subtotal || 0) / 100,
            shippingCost: (fullSession.shipping_cost?.amount_total || 0) / 100,
            tax: (fullSession.total_details?.amount_tax || 0) / 100,
            total: (fullSession.amount_total || 0) / 100,
            currency: fullSession.currency?.toUpperCase() || 'CAD',
            notes: fullSession.metadata?.order_notes || '',
            paymentStatus: fullSession.payment_status,
            paymentMethod: fullSession.payment_method_types?.[0] || 'card'
          }
          const savedOrder = saveOrder(orderData)
          console.log('Order saved:', savedOrder.id)
          
          // Automatically create Canada Post shipping label (if enabled)
          const autoCreateLabels = process.env.AUTO_CREATE_SHIPPING_LABELS !== 'false' // Default to true
          if (autoCreateLabels) {
            console.log('📦 Attempting to create Canada Post shipping label for order:', savedOrder.id)
            try {
              const labelResult = await createCanadaPostLabel(savedOrder)
              if (labelResult.success && labelResult.trackingNumber) {
                // Update order with tracking information
                updateOrderTracking(savedOrder.id, {
                  trackingNumber: labelResult.trackingNumber,
                  labelUrl: labelResult.labelUrl,
                  shipmentId: labelResult.shipmentId,
                  pin: labelResult.pin
                })
                console.log('✅ Canada Post label created successfully:', labelResult.trackingNumber)
                
                // Reload order to get updated tracking info
                const updatedOrder = getOrderById(savedOrder.id)
                
                // Send shipping notification email with tracking number
                const shippingSent = hasEmailBeenSent(savedOrder.id, 'shipping')
                if (!shippingSent) {
                  try {
                    const shippingEmailResult = await sendShippingNotification(updatedOrder, labelResult.trackingNumber)
                    if (shippingEmailResult.success) {
                      markEmailSent(savedOrder.id, 'shipping')
                      console.log('✅ Shipping notification email sent successfully')
                    } else {
                      console.log('⚠️  Shipping notification email not sent:', shippingEmailResult.reason || shippingEmailResult.error)
                    }
                  } catch (shippingEmailError) {
                    console.error('❌ Error sending shipping notification email:', shippingEmailError.message)
                  }
                }
              } else {
                console.log('⚠️  Canada Post label creation failed:', labelResult.error || 'Unknown error')
                console.log('   Order will be saved without tracking number. Label can be created manually later.')
                console.log('   To disable automatic label creation, set AUTO_CREATE_SHIPPING_LABELS=false')
              }
            } catch (labelError) {
              console.error('❌ Error creating Canada Post label:', labelError.message)
              console.log('   Order will be saved without tracking number. Label can be created manually later.')
              console.log('   To disable automatic label creation, set AUTO_CREATE_SHIPPING_LABELS=false')
            }
          } else {
            console.log('ℹ️  Automatic label creation is disabled (AUTO_CREATE_SHIPPING_LABELS=false)')
          }
          
          // Send email notifications (only if not already sent)
          console.log('📧 Attempting to send email notifications for order:', savedOrder.id)
          console.log('   Customer email:', savedOrder.customer?.email)
          
          const confirmationSent = hasEmailBeenSent(savedOrder.id, 'confirmation')
          const adminSent = hasEmailBeenSent(savedOrder.id, 'admin')
          
          if (!confirmationSent) {
            try {
              const emailResult = await sendOrderConfirmation(savedOrder)
              if (emailResult.success) {
                markEmailSent(savedOrder.id, 'confirmation')
                console.log('✅ Customer email sent successfully')
              } else {
                console.log('⚠️  Customer email not sent:', emailResult.reason || emailResult.error)
              }
            } catch (emailError) {
              console.error('❌ Error sending customer email:', emailError.message)
            }
          } else {
            console.log('ℹ️  Customer confirmation email already sent, skipping')
          }
          
          if (!adminSent) {
            try {
              const adminResult = await sendAdminNotification(savedOrder)
              if (adminResult.success) {
                markEmailSent(savedOrder.id, 'admin')
                console.log('✅ Admin email sent successfully')
              } else {
                console.log('⚠️  Admin email not sent:', adminResult.reason || adminResult.error)
              }
            } catch (emailError) {
              console.error('❌ Error sending admin email:', emailError.message)
            }
          } else {
            console.log('ℹ️  Admin notification email already sent, skipping')
          }
        } else {
          console.log('Order already exists:', fullSession.id.replace('cs_', 'PP-'))
        }
      } catch (error) {
        console.error('Error saving order from webhook:', error)
      }
      break
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log('✅ PaymentIntent succeeded:', paymentIntent.id)
      console.log('   Customer email:', paymentIntent.metadata?.customer_email)
      
      try {
        // Check if order already exists
        const existingOrder = getOrderById(paymentIntent.id.replace('pi_', 'PP-'))
        
        // For free orders, status might be 'succeeded' even with $0 amount
        const isFreeOrder = (paymentIntent.amount || 0) === 0
        const isSucceededOrFree = paymentIntent.status === 'succeeded' || isFreeOrder
        
        if (!existingOrder && isSucceededOrFree) {
          // Extract order information from Payment Intent
          // Parse items - handle both object format and compact array format
          let items = []
          try {
            const itemsData = JSON.parse(paymentIntent.metadata?.items || '[]')
            // If array of arrays (compact format), convert to objects
            if (Array.isArray(itemsData) && itemsData.length > 0 && Array.isArray(itemsData[0])) {
              items = itemsData.map(item => ({
                id: item[0] || '',
                name: item[1] || '',
                variant: item[2] || '',
                quantity: item[3] || 0,
                price: parseFloat(item[4] || 0)
              }))
            } else if (Array.isArray(itemsData) && itemsData.length > 0 && typeof itemsData[0] === 'object') {
              // Object format with shortened keys - expand them
              items = itemsData.map(item => ({
                id: item.i || item.id || '',
                name: item.n || item.name || '',
                variant: item.v || item.variant || '',
                quantity: item.q || item.quantity || 0,
                price: parseFloat(item.p || item.price || 0)
              }))
            } else {
              items = itemsData
            }
          } catch (error) {
            console.error('Error parsing items from metadata:', error)
            items = []
          }
          const orderData = {
            stripePaymentIntentId: paymentIntent.id,
            language: paymentIntent.metadata?.language || 'en',
            timezone: paymentIntent.metadata?.timezone || 'America/Toronto',
            metadata: { 
              language: paymentIntent.metadata?.language || 'en',
              timezone: paymentIntent.metadata?.timezone || 'America/Toronto'
            },
            customer: {
              name: paymentIntent.metadata?.customer_name || paymentIntent.shipping?.name || 'N/A',
              email: paymentIntent.metadata?.customer_email || 'N/A',
              phone: paymentIntent.metadata?.customer_phone || 'N/A',
            },
            shipping: {
              name: paymentIntent.shipping?.name || paymentIntent.metadata?.customer_name || 'N/A',
              address: paymentIntent.shipping?.address || {},
              method: paymentIntent.metadata?.shipping_method || 'Standard Shipping'
            },
            items: items,
            subtotal: (paymentIntent.amount - (parseFloat(paymentIntent.metadata?.shipping_cost || 0) * 100)) / 100,
            shippingCost: parseFloat(paymentIntent.metadata?.shipping_cost || 0),
            tax: 0,
            total: paymentIntent.amount / 100,
            currency: paymentIntent.currency?.toUpperCase() || 'CAD',
            notes: paymentIntent.metadata?.order_notes || '',
            paymentStatus: paymentIntent.status,
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'card'
          }
          const savedOrder = saveOrder(orderData)
          console.log('Order saved from Payment Intent:', savedOrder.id)
          
          // Automatically create Canada Post shipping label (if enabled)
          const autoCreateLabels = process.env.AUTO_CREATE_SHIPPING_LABELS !== 'false'
          if (autoCreateLabels) {
            console.log('📦 Attempting to create Canada Post shipping label for order:', savedOrder.id)
            try {
              const labelResult = await createCanadaPostLabel(savedOrder)
              if (labelResult.success && labelResult.trackingNumber) {
                updateOrderTracking(savedOrder.id, {
                  trackingNumber: labelResult.trackingNumber,
                  labelUrl: labelResult.labelUrl,
                  shipmentId: labelResult.shipmentId,
                  pin: labelResult.pin
                })
                console.log('✅ Canada Post label created successfully:', labelResult.trackingNumber)
                
                const updatedOrder = getOrderById(savedOrder.id)
                const shippingSent = hasEmailBeenSent(savedOrder.id, 'shipping')
                if (!shippingSent) {
                  try {
                    const shippingEmailResult = await sendShippingNotification(updatedOrder, labelResult.trackingNumber)
                    if (shippingEmailResult.success) {
                      markEmailSent(savedOrder.id, 'shipping')
                      console.log('✅ Shipping notification email sent successfully')
                    }
                  } catch (shippingEmailError) {
                    console.error('❌ Error sending shipping notification email:', shippingEmailError.message)
                  }
                }
              } else {
                console.log('⚠️  Canada Post label creation failed:', labelResult.error || 'Unknown error')
              }
            } catch (labelError) {
              console.error('❌ Error creating Canada Post label:', labelError.message)
            }
          }
          
          // Send email notifications (only if not already sent)
          const confirmationSent = hasEmailBeenSent(savedOrder.id, 'confirmation')
          const adminSent = hasEmailBeenSent(savedOrder.id, 'admin')
          
          if (!confirmationSent) {
            try {
              const emailResult = await sendOrderConfirmation(savedOrder)
              if (emailResult.success) {
                markEmailSent(savedOrder.id, 'confirmation')
                console.log('✅ Customer email sent successfully')
              }
            } catch (emailError) {
              console.error('❌ Error sending customer email:', emailError.message)
            }
          }
          
          if (!adminSent) {
            try {
              const adminResult = await sendAdminNotification(savedOrder)
              if (adminResult.success) {
                markEmailSent(savedOrder.id, 'admin')
                console.log('✅ Admin email sent successfully')
              }
            } catch (emailError) {
              console.error('❌ Error sending admin email:', emailError.message)
            }
          }
        } else {
          console.log('Order already exists:', paymentIntent.id.replace('pi_', 'PP-'))
        }
      } catch (error) {
        console.error('Error saving order from Payment Intent:', error)
      }
      break
    case 'payment_intent.payment_failed':
      console.log('❌ PaymentIntent failed')
      break
    case 'charge.refunded':
      console.log('💰 Charge refunded')
      try {
        const charge = event.data.object
        const refund = event.data.object.refunds?.data?.[0] || event.data.object
        
        // Find order by charge ID or payment intent
        const orders = getAllOrders()
        const order = orders.find(o => 
          o.stripeChargeId === charge.id || 
          o.stripePaymentIntentId === charge.payment_intent ||
          o.stripeSessionId === charge.metadata?.session_id
        )
        
        if (order) {
          // Update order with refund information
          const refundAmount = refund.amount ? refund.amount / 100 : charge.amount_refunded / 100
          const refundData = {
            refundId: refund.id || `refund_${Date.now()}`,
            amount: refundAmount,
            currency: refund.currency || charge.currency || 'cad',
            reason: refund.reason || 'requested_by_customer',
            status: refund.status || 'succeeded',
            createdAt: new Date(refund.created * 1000).toISOString()
          }
          
          // Add refund to order
          if (!order.refunds) {
            order.refunds = []
          }
          order.refunds.push(refundData)
          
          // Update order status if fully refunded
          const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0)
          if (totalRefunded >= order.total) {
            order.status = 'refunded'
            order.refundStatus = 'full'
          } else if (totalRefunded > 0) {
            order.refundStatus = 'partial'
          }
          
          order.updatedAt = new Date().toISOString()
          
          // Save updated order
          const allOrders = getAllOrders()
          const orderIndex = allOrders.findIndex(o => o.id === order.id)
          if (orderIndex !== -1) {
            allOrders[orderIndex] = order
            const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(allOrders, null, 2))
            console.log('✅ Order updated with refund information:', order.id)
          }
        } else {
          console.log('⚠️  Order not found for refunded charge:', charge.id)
        }
      } catch (error) {
        console.error('❌ Error processing refund webhook:', error)
      }
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// Now apply JSON parsing for all other routes
app.use(express.json({ limit: '10mb' })) // Limit request body size

// Apply rate limiting to API routes
app.use('/api/', apiLimiter)

// Initialize Stripe with your secret key
// Get this from https://dashboard.stripe.com/apikeys
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// Resend client for welcome email (subscribe flow)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// ============================================
// INPUT VALIDATION & SANITIZATION
// Following OWASP best practices for input validation
// ============================================

// Validation result handler - returns formatted error responses
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Return 400 Bad Request with validation errors
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data provided',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    })
  }
  next()
}

// Helper function to reject unexpected fields (OWASP: strict input validation)
const rejectUnexpectedFields = (allowedFields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      const bodyKeys = Object.keys(req.body)
      const unexpectedFields = bodyKeys.filter(key => !allowedFields.includes(key))
      
      if (unexpectedFields.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Unexpected fields in request body',
          unexpectedFields: unexpectedFields,
          allowedFields: allowedFields
        })
      }
    }
    next()
  }
}

// Legacy validation helpers (kept for backward compatibility)
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePostalCode = (postalCode, country = 'Canada') => {
  if (country === 'United States') {
    // US ZIP code: 5 digits or 5+4 format
    return /^\d{5}(-\d{4})?$/.test(postalCode)
  } else {
    // Canadian postal code
    return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode)
  }
}

// ============================================
// VALIDATION SCHEMAS
// Following OWASP: schema-based validation with type checks and length limits
// ============================================

// Checkout session validation schema
const validateCheckoutSession = [
  // Validate currency
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }).isUppercase()
    .isIn(['CAD', 'USD']).withMessage('Currency must be CAD or USD'),
  
  // Validate exchange rate (if USD)
  body('exchangeRate').optional().isFloat({ min: 0.1, max: 2.0 })
    .withMessage('Exchange rate must be between 0.1 and 2.0'),
  
  // Validate items array
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.name').trim().isLength({ min: 1, max: 200 }).withMessage('Item name must be 1-200 characters'),
  body('items.*.variant').trim().isLength({ min: 1, max: 100 }).withMessage('Item variant must be 1-100 characters'),
  body('items.*.price').isFloat({ min: 0.01, max: 10000 }).withMessage('Item price must be between 0.01 and 10000'),
  body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Item quantity must be between 1 and 100'),
  body('items.*.description').optional().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('items.*.image').optional().custom((value) => {
    // Allow empty string, null, undefined, or valid URL
    if (!value || value === '') return true
    // Check if it's a valid URL
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }).withMessage('Image must be a valid URL if provided'),
  
  // Validate shipping info
  body('shippingInfo').notEmpty().withMessage('Shipping information is required'),
  body('shippingInfo.email').trim().isEmail().normalizeEmail().isLength({ max: 255 })
    .withMessage('Valid email address is required (max 255 characters)'),
  body('shippingInfo.firstName').trim().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name must be 1-50 characters and contain only letters, spaces, hyphens, and apostrophes'),
  body('shippingInfo.lastName').trim().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name must be 1-50 characters and contain only letters, spaces, hyphens, and apostrophes'),
  body('shippingInfo.address').optional().trim().isLength({ max: 200 }).withMessage('Address must be max 200 characters'),
  body('shippingInfo.city').optional().trim().isLength({ min: 1, max: 100 }).matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('City must be 1-100 characters'),
  body('shippingInfo.province').optional().trim().isLength({ min: 2, max: 50 })
    .withMessage('Province must be 2-50 characters'),
  body('shippingInfo.postalCode').optional().trim().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$|^\d{5}(-\d{4})?$/)
    .withMessage('Postal code must be a valid Canadian or US format'),
  body('shippingInfo.phone').optional().trim().isLength({ max: 20 }).matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone must be max 20 characters and contain only digits, spaces, and common phone characters'),
  body('shippingInfo.selectedShipping').optional(),
  body('shippingInfo.selectedShipping.name').optional().trim().isLength({ max: 100 }),
  body('shippingInfo.selectedShipping.price').optional().isFloat({ min: 0, max: 1000 }),
  
  // Validate promo code
  body('promoCode').optional().custom((value) => {
    // Allow undefined, null, or empty string
    if (!value || value === '' || value === null) return true
    // If provided, must be valid format
    const trimmed = String(value).trim().toUpperCase()
    return trimmed.length <= 50 && /^[A-Z0-9]+$/.test(trimmed)
  }).withMessage('Promo code must be max 50 characters and contain only uppercase letters and numbers'),
  
  // Validate discount
  body('discount').optional().isFloat({ min: 0, max: 10000 })
    .withMessage('Discount must be between 0 and 10000'),
  
  // Validate total
  body('total').optional().isFloat({ min: 0, max: 50000 })
    .withMessage('Total must be between 0 and 50000'),
  
  // Reject unexpected fields
  rejectUnexpectedFields([
    'currency', 'exchangeRate', 'items', 'shippingInfo', 'promoCode', 'discount', 'total'
  ]),
  
  handleValidationErrors
]

// Shipping rates validation schema
// Note: Made more lenient to handle various input formats from frontend
const validateShippingRates = [
  body('destination').notEmpty().withMessage('Destination information is required'),
  body('destination.postalCode').trim().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$|^\d{5}(-\d{4})?$/)
    .withMessage('Valid postal code is required (Canadian or US format)'),
  body('destination.city').trim().isLength({ min: 1, max: 100 })
    .withMessage('City must be 1-100 characters'),
  // Make province validation more lenient - accept 2-50 characters (handles "Ontario", "ON", etc.)
  body('destination.province').trim().isLength({ min: 2, max: 50 })
    .withMessage('Province/State must be 2-50 characters'),
  body('destination.country').optional().trim().isLength({ max: 50 }),
  
  body('cartItems').isArray({ min: 1 }).withMessage('Cart items must be a non-empty array'),
  body('cartItems.*.variant').optional().trim().isLength({ max: 100 }),
  body('cartItems.*.quantity').optional().isInt({ min: 1, max: 100 }),
  
  rejectUnexpectedFields(['destination', 'cartItems']),
  handleValidationErrors
]

// Contact form validation schema
const validateContactForm = [
  body('name').trim().isLength({ min: 1, max: 100 }).matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name must be 1-100 characters and contain only letters, spaces, hyphens, and apostrophes'),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 255 })
    .withMessage('Valid email address is required (max 255 characters)'),
  body('inquiryType').trim().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z\s]+$/)
    .withMessage('Inquiry type must be 1-50 characters'),
  body('message').trim().isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
  
  rejectUnexpectedFields(['name', 'email', 'inquiryType', 'message']),
  handleValidationErrors
]

// Order lookup validation schema
const validateOrderLookup = [
  body('orderId').trim().isLength({ min: 1, max: 50 }).matches(/^[A-Z0-9\-]+$/)
    .withMessage('Order ID must be 1-50 characters and contain only uppercase letters, numbers, and hyphens'),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 255 })
    .withMessage('Valid email address is required'),
  
  rejectUnexpectedFields(['orderId', 'email']),
  handleValidationErrors
]

// Product ID parameter validation
const validateProductId = [
  param('id').trim().isLength({ min: 1, max: 100 }).matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Product ID must be 1-100 characters and contain only alphanumeric characters, hyphens, and underscores'),
  handleValidationErrors
]

// Payment Intent ID parameter validation
const validatePaymentIntentId = [
  param('paymentIntentId').trim().isLength({ min: 20, max: 200 }).matches(/^pi_[a-zA-Z0-9]+$/)
    .withMessage('Payment Intent ID must be a valid Stripe payment intent ID'),
  handleValidationErrors
]

// Checkout Session ID parameter validation
// Stripe session IDs format: cs_live_... or cs_test_... (can contain underscores)
const validateCheckoutSessionId = [
  param('sessionId').trim().isLength({ min: 20, max: 200 }).matches(/^cs_[a-zA-Z0-9_]+$/)
    .withMessage('Checkout Session ID must be a valid Stripe checkout session ID'),
  handleValidationErrors
]

// Helper function to get or create a discount coupon for promo codes
async function getOrCreateDiscountCoupon(promoCode, discountPercent) {
  if (!stripe) {
    console.error('Stripe not configured, cannot create coupon')
    return null
  }
  
  try {
    const couponId = promoCode.toUpperCase()
    
    // Try to retrieve existing coupon
    try {
      const existingCoupon = await stripe.coupons.retrieve(couponId)
      if (existingCoupon && !existingCoupon.deleted) {
        console.log(`✅ Using existing coupon: ${couponId}`)
        return existingCoupon.id
      }
    } catch (retrieveError) {
      // Coupon doesn't exist, we'll create it
      if (retrieveError.code !== 'resource_missing') {
        console.error('Error retrieving coupon:', retrieveError)
      }
    }
    
    // Create a new coupon
    const validPercent = Math.max(1, Math.min(100, Math.round(discountPercent)))
    
    console.log(`Creating new coupon: ${couponId} with ${validPercent}% discount`)
    
    const coupon = await stripe.coupons.create({
      id: couponId,
      percent_off: validPercent,
      duration: 'once', // One-time use
      name: `Promo Code: ${promoCode}`,
    })
    
    console.log(`✅ Created coupon: ${coupon.id}`)
    return coupon.id
  } catch (error) {
    console.error('Error creating discount coupon:', error.message)
    return null
  }
}

// Create Checkout Session
// Following OWASP best practices: rate limiting + schema-based validation
app.post('/api/create-checkout-session', checkoutLimiter, validateCheckoutSession, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    // Get currency from request (default to CAD if not provided)
    // Input already validated and sanitized by validateCheckoutSession
    const requestedCurrency = (req.body.currency || 'CAD').toUpperCase()
    const stripeCurrency = (requestedCurrency === 'USD') ? 'usd' : 'cad'
    const useUSD = stripeCurrency === 'usd'
    
    // Get exchange rate from frontend (or use default if not provided)
    // This ensures the conversion matches what the user sees on the frontend
    // Already validated to be between 0.1 and 2.0
    const exchangeRate = useUSD ? (parseFloat(req.body.exchangeRate) || 0.73) : 1.0
    
    // Log currency info for debugging
    console.log('💱 Backend received currency:', {
      requestedCurrency: req.body.currency,
      normalizedCurrency: requestedCurrency,
      stripeCurrency,
      useUSD,
      exchangeRate,
      rawBodyCurrency: req.body.currency
    })

    const { items, shippingInfo, total } = req.body

    // Input validation is now handled by validateCheckoutSession middleware
    // All fields are validated, sanitized, and type-checked above
    
    // Normalize province to 2-letter code if full name is provided
    if (shippingInfo.province && shippingInfo.province.length > 2) {
      const provinceMap = {
        'ontario': 'ON', 'alberta': 'AB', 'british columbia': 'BC', 'bc': 'BC',
        'manitoba': 'MB', 'new brunswick': 'NB', 'newfoundland': 'NL', 'newfoundland and labrador': 'NL',
        'northwest territories': 'NT', 'nova scotia': 'NS', 'nunavut': 'NU',
        'prince edward island': 'PE', 'pei': 'PE', 'quebec': 'QC', 'saskatchewan': 'SK', 'yukon': 'YT'
      }
      const normalized = provinceMap[shippingInfo.province.toLowerCase().trim()]
      if (normalized) {
        shippingInfo.province = normalized
      }
    } else if (shippingInfo.province) {
      // Ensure it's uppercase if it's already a 2-letter code
      shippingInfo.province = shippingInfo.province.toUpperCase().trim()
    }

    // Create line items for Stripe
    // Note: item.price is in CAD, convert to selected currency if needed
    const lineItems = items.map(item => {
      const itemPriceCAD = parseFloat(item.price) || 0
      const itemQuantity = parseInt(item.quantity) || 0
      
      // Validate item data
      if (itemPriceCAD <= 0 || itemQuantity <= 0 || isNaN(itemPriceCAD) || isNaN(itemQuantity)) {
        throw new Error(`Invalid item data: price=${item.price}, quantity=${item.quantity}`)
      }
      
      // Convert price to selected currency (if USD, convert from CAD)
      const itemPriceInCurrency = useUSD ? itemPriceCAD * exchangeRate : itemPriceCAD
      const unitAmount = Math.max(1, Math.round(itemPriceInCurrency * 100)) // Convert to cents, ensure at least 1 cent
      
      // Create a short description for Stripe checkout (max 50 characters)
      const shortDescription = item.description 
        ? item.description.split('.')[0].substring(0, 50) + (item.description.split('.')[0].length > 50 ? '...' : '')
        : ''
      
      return {
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `${item.name} - ${item.variant} (${stripeCurrency.toUpperCase()})`, // Add currency code to product name
            description: shortDescription, // Short, concise description for Stripe checkout
            images: item.image ? [new URL(item.image, req.headers.origin || 'http://localhost:5173').href] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: itemQuantity,
      }
    })

    // Get shipping cost from request (selected shipping option)
    // Note: selectedShipping.price should be in CAD dollars (e.g., 12.00), we need to convert to cents
    console.log('📦 Shipping info received:', JSON.stringify({
      hasSelectedShipping: !!shippingInfo.selectedShipping,
      shippingPrice: shippingInfo.selectedShipping?.price,
      shippingPriceType: typeof shippingInfo.selectedShipping?.price,
      shippingName: shippingInfo.selectedShipping?.name,
      fullSelectedShipping: shippingInfo.selectedShipping
    }, null, 2))
    
    // Ensure we have a valid shipping price
    let shippingPrice = 12.00 // Default fallback
    if (shippingInfo.selectedShipping?.price) {
      shippingPrice = parseFloat(shippingInfo.selectedShipping.price)
      // Safety check: if price seems too high (likely already in cents or wrong currency), divide by 100
      if (shippingPrice > 1000) {
        console.warn('⚠️ Shipping price seems too high, dividing by 100:', shippingPrice)
        shippingPrice = shippingPrice / 100
      }
    }
    
    const shippingCostCents = Math.max(0, Math.round(shippingPrice * 100)) // Convert dollars to cents, ensure non-negative
    
    console.log('💰 Shipping cost calculated:', {
      originalPrice: shippingInfo.selectedShipping?.price,
      normalizedPrice: shippingPrice,
      priceInCents: shippingCostCents,
      priceInDollars: shippingCostCents / 100
    })
    
    // Validate and calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0
      const itemQuantity = parseInt(item.quantity) || 0
      if (itemPrice < 0 || itemQuantity < 0 || isNaN(itemPrice) || isNaN(itemQuantity)) {
        console.error('Invalid item price or quantity:', { price: item.price, quantity: item.quantity })
        return sum
      }
      return sum + Math.round(itemPrice * itemQuantity * 100)
    }, 0)
    
    // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
    // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
    const tax = 0 // 0% HST/GST - Products are zero-rated as unsweetened dried fruits
    
    // Apply promo code discount if provided (discountAmount is in dollars, convert to cents)
    const promoCode = req.body.promoCode || null
    const discountAmount = parseFloat(req.body.discount) || 0
    const discountAmountCents = Math.max(0, Math.round(discountAmount * 100)) // Ensure non-negative integer
    
    // Calculate order total to check if discount covers everything (including shipping)
    const orderTotalCents = subtotal + shippingCostCents + tax
    
    // Check if this is a free shipping code
    const promoCodeUpper = promoCode ? promoCode.toUpperCase().trim() : ''
    const isFreeShippingCode = promoCodeUpper === 'PEEL26FS' // 100% off shipping only
    console.log('🎟️ Promo code check:', {
      promoCode: promoCodeUpper || 'none',
      discountAmountCents,
      orderTotalCents,
      isFreeShippingCode
    })
    
    // Handle PEEL26FS code which gives 100% off shipping only
    let finalShippingCostCents = shippingCostCents
    let finalDiscountCents = discountAmountCents
    
    if (isFreeShippingCode) {
      // For free shipping codes, set shipping to 0 and don't apply discount to total
      // (discount is already applied by setting shipping to 0)
      finalShippingCostCents = 0
      finalDiscountCents = 0 // Don't subtract discount amount - shipping is already free
      console.log('🎁 Free shipping applied - shipping set to $0', {
        promoCode: promoCodeUpper,
        originalShipping: shippingCostCents,
        orderTotal: orderTotalCents,
        discountAmount: discountAmountCents
      })
    } else {
      console.log('💰 Regular discount or no discount - shipping remains:', {
        promoCode: promoCodeUpper || 'none',
        shippingCost: shippingCostCents,
        discountAmount: discountAmountCents
      })
    }
    
    // Calculate total: for free shipping codes, discount is already applied (shipping = 0, so only subtract item discounts if any)
    // For regular discounts, subtract discount amount from total
    // IMPORTANT: For free shipping codes, we set finalDiscountCents = 0, so only shipping is free, not the items
    const totalAmount = Math.max(0, subtotal + finalShippingCostCents + tax - finalDiscountCents) // For free shipping, this is subtotal + 0 + 0 - 0 = subtotal
    
    // Debug log for free shipping code scenario
    if (isFreeShippingCode) {
      console.log('🎁 Free shipping calculation:', {
        subtotal,
        finalShippingCostCents,
        tax,
        finalDiscountCents,
        totalAmount,
        note: 'Shipping is free, but items still cost money'
      })
    }
    
    // Validate all amounts are valid integers
    if (isNaN(shippingCostCents) || isNaN(subtotal) || isNaN(discountAmountCents)) {
      console.error('Invalid amount detected:', { shippingCostCents, subtotal, discountAmountCents })
      return res.status(400).json({ error: 'Invalid amount calculation. Please check your cart items and shipping.' })
    }

    // Log total amount for debugging
    console.log('💰 Order totals:', {
      subtotal,
      shippingCostCents: finalShippingCostCents,
      tax,
      discountAmountCents,
      totalAmount,
      totalInDollars: totalAmount / 100
    })

    // Calculate shipping cost in selected currency (finalShippingCostCents is in CAD)
    const shippingCostInCurrency = useUSD ? Math.round(finalShippingCostCents * exchangeRate) : finalShippingCostCents

    // Log currency info for debugging
    console.log('💰 Stripe session currency:', {
      requestedCurrency,
      stripeCurrency,
      useUSD,
      exchangeRate,
      shippingCostCAD: finalShippingCostCents,
      shippingCostInCurrency,
      lineItemsCount: lineItems.length,
      firstLineItemCurrency: lineItems[0]?.price_data?.currency
    })

    // Create Stripe Checkout Session (Hosted Checkout - redirects to Stripe)
    // Note: 'card' automatically enables Apple Pay and Google Pay when available
    // IMPORTANT: All line_items and shipping_options must use the SAME currency to prevent Stripe from showing a currency selector
    const origin = req.headers.origin || 'http://localhost:5173'
    const sessionConfig = {
      payment_method_types: ['card'], // Automatically enables Apple Pay, Google Pay, and Link when available
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      adaptive_pricing: {
        enabled: false, // Disable Adaptive Pricing to prevent currency selector
      },
      // Set locale based on currency to ensure proper currency display
      locale: stripeCurrency === 'usd' ? 'en' : 'en',
      // Add custom text to clarify currency - this appears near the payment button
      // Note: Stripe automatically formats currency symbols (USD shows as "$", CAD shows as "CA$")
      // We can't change this, but we can clarify with custom messages
      custom_text: {
        submit: {
          message: stripeCurrency === 'usd' 
            ? 'All prices shown are in USD ($)' 
            : 'All prices shown are in CAD (CA$)'
        }
      },
      customer_email: shippingInfo.email,
      // Always collect shipping address - required for Canada Post label creation
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'],
      },
      phone_number_collection: {
        enabled: false,
      },
      metadata: {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
        order_notes: shippingInfo.notes || '',
        language: shippingInfo.language || 'en', // Store language preference
        timezone: shippingInfo.timezone || 'America/Toronto', // Store customer timezone
        promo_code: promoCode || '',
        // IMPORTANT: Use order_id from frontend - this ensures frontend and backend use the same order ID
        order_id: shippingInfo.order_id || `PP-${Date.now().toString().slice(-8)}`, // Use order_id from frontend or generate one
        // Store shipping address from form as fallback (in case Stripe doesn't collect it for free orders)
        shipping_address_line1: shippingInfo.address || '',
        shipping_address_line2: shippingInfo.address2 || '',
        shipping_address_city: shippingInfo.city || '',
        shipping_address_province: shippingInfo.province || shippingInfo.state || '',
        shipping_address_postal: shippingInfo.postalCode || '',
        shipping_address_country: shippingInfo.country || 'Canada',
      },
      // Add shipping cost (finalShippingCostCents is in CAD cents, convert to selected currency if needed)
      // Always provide a shipping option (even if $0) when shipping_address_collection is enabled
      // Note: For free orders, Stripe may not collect shipping address, so labels will need to be created manually
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: shippingCostInCurrency, // Can be 0 for free shipping
            currency: stripeCurrency,
          },
          display_name: finalShippingCostCents > 0 
            ? `${shippingInfo.selectedShipping?.name || 'Standard Shipping'} (${stripeCurrency.toUpperCase()})` // Add currency code to shipping name
            : 'Free Shipping',
        },
      }],
    }

    // Apply discount if promo code is used (but NOT for free shipping codes - shipping is already free)
    // Free shipping codes are handled by setting finalShippingCostCents = 0, not by discount coupon
    if (promoCode && discountAmountCents > 0 && !isFreeShippingCode) {
      try {
        // Calculate discount percentage based on order total
        const orderTotalForDiscount = subtotal + finalShippingCostCents + tax
        const discountPercent = orderTotalForDiscount > 0 
          ? Math.max(1, Math.min(100, Math.round((discountAmountCents / orderTotalForDiscount) * 100)))
          : 100 // If total is $0, discount is 100%
        
        console.log('🎟️ Applying promo code discount coupon:', {
          promoCode,
          discountAmountCents,
          originalOrderTotal: subtotal + shippingCostCents + tax,
          finalOrderTotal: orderTotalForDiscount,
          finalShipping: finalShippingCostCents,
          discountPercent: `${discountPercent}%`
        })
        
        // Get or create discount coupon
        const couponId = await getOrCreateDiscountCoupon(promoCode, discountPercent)
        if (couponId) {
          sessionConfig.discounts = [{ coupon: couponId }]
          console.log('✅ Discount coupon applied to checkout session:', couponId)
        } else {
          console.error('❌ Failed to create discount coupon, discount will not be applied in Stripe')
        }
      } catch (error) {
        console.error('❌ Error applying discount:', error.message || error)
        console.error('Failed to apply discount, continuing without discount')
      }
    } else if (isFreeShippingCode) {
      console.log('🎁 Free shipping code applied - no discount coupon needed (shipping is already $0)')
    }

    try {
    const session = await stripe.checkout.sessions.create(sessionConfig)

      console.log('✅ Stripe Checkout Session created:', {
        sessionId: session.id,
        url: session.url,
        mode: session.mode,
        status: session.status,
        paymentStatus: session.payment_status
      })

      // Return the checkout session URL - frontend will redirect to this
      // Note: session.url can be null for embedded checkout, but we're using hosted checkout
      if (!session.url) {
        console.error('⚠️ Warning: Stripe session created but URL is null:', {
          sessionId: session.id,
          mode: session.mode,
          status: session.status,
          paymentStatus: session.payment_status
        })
        return res.status(500).json({ 
          error: 'Failed to create checkout session URL. Please try again.' 
        })
      }

    res.json({ 
      sessionId: session.id, 
        url: session.url // Redirect user to this URL for Stripe hosted checkout
      })
    } catch (stripeError) {
      console.error('❌ Stripe API Error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode
      })
      return res.status(500).json({ 
        error: stripeError.message || 'Failed to create checkout session. Please try again.' 
      })
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create Payment Intent for embedded Stripe Elements
app.post('/api/create-payment-intent', checkoutLimiter, validateCheckoutSession, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    // Input validation is now handled by validateCheckoutSession middleware
    // All fields are validated, sanitized, and type-checked above

    // Get currency from request (default to CAD if not provided)
    // Already validated to be CAD or USD
    const requestedCurrency = (req.body.currency || 'CAD').toUpperCase()
    const stripeCurrency = (requestedCurrency === 'USD') ? 'usd' : 'cad'
    const useUSD = stripeCurrency === 'usd'
    // Exchange rate already validated to be between 0.1 and 2.0
    const exchangeRate = useUSD ? (parseFloat(req.body.exchangeRate) || 0.73) : 1.0

    const { items, shippingInfo, total } = req.body

    // Calculate amounts (same logic as checkout session)
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0
      const itemQuantity = parseInt(item.quantity) || 0
      if (itemPrice < 0 || itemQuantity < 0 || isNaN(itemPrice) || isNaN(itemQuantity)) {
        return sum
      }
      return sum + Math.round(itemPrice * itemQuantity * 100)
    }, 0)

    const tax = 0 // Zero-rated
    let shippingPrice = 12.00
    if (shippingInfo.selectedShipping?.price) {
      shippingPrice = parseFloat(shippingInfo.selectedShipping.price)
      if (shippingPrice > 1000) {
        shippingPrice = shippingPrice / 100
      }
    }
    const shippingCostCents = Math.max(0, Math.round(shippingPrice * 100))

    // Handle promo codes
    const promoCode = req.body.promoCode || null
    const discountAmount = parseFloat(req.body.discount) || 0
    const discountAmountCents = Math.max(0, Math.round(discountAmount * 100))
    const promoCodeUpper = promoCode ? promoCode.toUpperCase().trim() : ''
    const isFreeShippingCode = promoCodeUpper === 'PEEL26FS' // 100% off shipping only
    const orderTotalCents = subtotal + shippingCostCents + tax
    const finalShippingCostCents = isFreeShippingCode ? 0 : shippingCostCents
    const totalAmountCAD = Math.max(0, subtotal + finalShippingCostCents + tax - discountAmountCents)
    
    // Convert to selected currency if needed
    const totalAmount = useUSD ? Math.round(totalAmountCAD * exchangeRate) : totalAmountCAD

    // Create Payment Intent following Stripe's best practices
    // automatic_payment_methods automatically enables card, Apple Pay, Google Pay, and Link
    // Cannot use both automatic_payment_methods and payment_method_types together
    
    // Enable customer creation for payment method reuse (saved payment methods)
    const customerEmail = shippingInfo.email
    let customerId = null
    
    // Try to find existing customer by email for payment method reuse
    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      })
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
        console.log('📧 Found existing customer for payment method reuse:', customerId)
      }
    } catch (error) {
      console.log('⚠️ Could not check for existing customer:', error.message)
    }
    
    // Create customer if doesn't exist (for payment method reuse)
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          phone: shippingInfo.phone || undefined,
          metadata: {
            first_order: 'true',
          },
        })
        customerId = customer.id
        console.log('✅ Created new customer for payment method reuse:', customerId)
      } catch (error) {
        console.log('⚠️ Could not create customer:', error.message)
        // Continue without customer - payment will still work
      }
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: stripeCurrency,
      customer: customerId || undefined, // Link to customer for payment method reuse
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Keep payment on page, no redirects
      },
      // Enable payment method saving (with customer consent)
      // Stripe Payment Element will show save checkbox automatically
      setup_future_usage: customerId ? 'off_session' : undefined, // Allow saving for future use
      metadata: {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        order_notes: shippingInfo.notes || '',
        language: shippingInfo.language || 'en',
        timezone: shippingInfo.timezone || 'America/Toronto',
        promo_code: promoCode || '',
        shipping_method: shippingInfo.selectedShipping?.name || 'Standard Shipping',
        shipping_cost: (finalShippingCostCents / 100).toFixed(2),
        // Create minimal items array (only essential fields) to stay under 500 char limit
        // Use ultra-compact array format: [id, name, variant, qty, price]
        items: (() => {
          // Use array format directly (most compact)
          const compactItems = items.map(item => [
            (item.id || '').substring(0, 20), // id, max 20 chars
            (item.name || '').substring(0, 15), // name, max 15 chars  
            (item.variant || '').substring(0, 15), // variant, max 15 chars
            item.quantity || 0, // quantity
            parseFloat(item.price || 0).toFixed(2) // price
          ])
          let itemsStr = JSON.stringify(compactItems)
          
          // If still too long, truncate item names/variants further
          if (itemsStr.length > 500) {
            const moreCompact = items.map(item => [
              (item.id || '').substring(0, 15),
              (item.name || '').substring(0, 10),
              (item.variant || '').substring(0, 10),
              item.quantity || 0,
              parseFloat(item.price || 0).toFixed(2)
            ])
            itemsStr = JSON.stringify(moreCompact)
          }
          
          // Final safety check - if still too long, use even shorter format
          if (itemsStr.length > 500) {
            const ultraCompact = items.map(item => [
              (item.id || '').substring(0, 12),
              (item.name || '').substring(0, 8),
              (item.variant || '').substring(0, 8),
              item.quantity || 0,
              parseFloat(item.price || 0).toFixed(2)
            ])
            itemsStr = JSON.stringify(ultraCompact)
          }
          
          // Absolute last resort - truncate the entire string
          if (itemsStr.length > 500) {
            console.warn(`⚠️ Items metadata is ${itemsStr.length} chars, truncating to 500`)
            // Try to keep at least first item complete
            const firstItemEnd = itemsStr.indexOf(']', itemsStr.indexOf('[') + 1)
            if (firstItemEnd > 0 && firstItemEnd < 450) {
              itemsStr = itemsStr.substring(0, 497) + '...]'
            } else {
              itemsStr = itemsStr.substring(0, 497) + '...'
            }
          }
          
          console.log(`📦 Items metadata length: ${itemsStr.length} chars`)
          return itemsStr
        })(),
      },
      shipping: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        address: {
          line1: shippingInfo.address || '',
          line2: shippingInfo.address2 || '',
          city: shippingInfo.city || '',
          state: shippingInfo.province || shippingInfo.state || '',
          postal_code: shippingInfo.postalCode || '',
          country: shippingInfo.country === 'United States' ? 'US' : 'CA',
        },
        phone: shippingInfo.phone || undefined,
      },
      description: `Order from Pure Peel Co. - ${items.length} item${items.length > 1 ? 's' : ''}`,
      receipt_email: shippingInfo.email,
    })

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: error.message })
  }
})

// Verify payment and get Payment Intent details
// Apply rate limiting and input validation
app.get('/api/payment-intent/:paymentIntentId', apiLimiter, validatePaymentIntentId, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.paymentIntentId)
    
    res.json(paymentIntent)
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    res.status(500).json({ error: error.message })
  }
})

// Verify payment and get session details (legacy - for Checkout Sessions)
// Apply rate limiting and input validation
app.get('/api/checkout-session/:sessionId', apiLimiter, validateCheckoutSessionId, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    // Note: shipping_details is included by default when shipping_address_collection is enabled, no need to expand
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['line_items']
    })
    
    // Check if order already exists by Stripe session ID
    const allOrders = getAllOrders()
    const existingOrder = allOrders.find(o => o.stripeSessionId === session.id)
    
    // If order doesn't exist and payment is successful (or free order), save it (fallback if webhook didn't fire)
    const isFreeOrder = (session.amount_total || 0) === 0
    const isPaidOrFree = session.payment_status === 'paid' || 
                        (isFreeOrder && (session.payment_status === 'no_payment_required' || session.payment_status === 'unpaid'))
    
    if (!existingOrder && isPaidOrFree) {
      try {
        // Use order_id from metadata (set during checkout session creation)
        const orderIdFromMetadata = session.metadata?.order_id
        
        if (!orderIdFromMetadata) {
          console.error('⚠️ WARNING: order_id not found in session metadata (checkout session handler)!')
          console.error('   Session metadata:', JSON.stringify(session.metadata, null, 2))
        }
        
        // Generate order ID from timestamp (8 digits) to match frontend format
        // ONLY if not found in metadata (should always be there)
        const orderId = orderIdFromMetadata || `PP-${Date.now().toString().slice(-8)}`
        
        console.log('📋 Order ID resolution (checkout session):', {
          fromMetadata: session.metadata?.order_id,
          finalOrderId: orderId,
          wasGenerated: !orderIdFromMetadata
        })
        
        // Debug logging for shipping address (checkout session handler)
        console.log('📦 Shipping address debug (checkout session):', {
          hasShippingDetails: !!session.shipping_details,
          shippingDetailsName: session.shipping_details?.name,
          shippingDetailsAddress: session.shipping_details?.address,
          addressLine1: session.shipping_details?.address?.line1,
          addressCity: session.shipping_details?.address?.city,
          addressState: session.shipping_details?.address?.state,
          addressPostalCode: session.shipping_details?.address?.postal_code,
          addressCountry: session.shipping_details?.address?.country,
          fullShippingDetails: JSON.stringify(session.shipping_details, null, 2)
        })

        const orderData = {
          id: orderId,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          language: session.metadata?.language || 'en', // Store language from metadata
          timezone: session.metadata?.timezone || 'America/Toronto', // Store customer timezone
          metadata: { 
            language: session.metadata?.language || 'en', // Also store in metadata for email service
            timezone: session.metadata?.timezone || 'America/Toronto' // Store timezone for email service
          },
          customer: {
            name: session.metadata?.customer_name || session.customer_details?.name || 'N/A',
            email: session.customer_email || session.customer_details?.email || 'N/A',
            phone: session.metadata?.customer_phone || session.customer_details?.phone || 'N/A',
          },
          shipping: {
            name: session.shipping_details?.name || session.metadata?.customer_name || 'N/A',
            address: (() => {
              // First try Stripe's shipping_details address
              let addr = session.shipping_details?.address || {}
              
              // If address is empty (common for free orders), use address from form metadata
              if ((!addr.line1 && !addr.line_1) || Object.keys(addr).length === 0) {
                console.log('📋 Using shipping address from form metadata (Stripe address missing - checkout session)')
                addr = {
                  line1: session.metadata?.shipping_address_line1 || '',
                  line2: session.metadata?.shipping_address_line2 || '',
                  city: session.metadata?.shipping_address_city || '',
                  province: session.metadata?.shipping_address_province || '',
                  state: session.metadata?.shipping_address_province || '',
                  postal_code: session.metadata?.shipping_address_postal || '',
                  postalCode: session.metadata?.shipping_address_postal || '',
                  country: session.metadata?.shipping_address_country || 'Canada'
                }
                
                // Log if we're using fallback address
                if (addr.line1) {
                  console.log('✅ Using form address as fallback (checkout session):', { city: addr.city, province: addr.province, postal: addr.postal_code })
                } else {
                  console.error('⚠️ WARNING: Both Stripe and form addresses are missing (checkout session)!')
                }
              }
              
              return addr
            })(),
            method: session.shipping_cost?.display_name || 'Standard Shipping'
          },
          items: session.line_items?.data?.map(item => ({
            name: item.description || item.price_data?.product_data?.name || 'Unknown',
            variant: item.description?.split(' - ')[1] || 'N/A',
            quantity: item.quantity,
            price: item.price.unit_amount / 100,
            total: (item.price.unit_amount * item.quantity) / 100
          })) || [],
          subtotal: (session.amount_subtotal || 0) / 100,
          shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
          tax: (session.total_details?.amount_tax || 0) / 100,
          total: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'CAD',
          notes: session.metadata?.order_notes || '',
          paymentStatus: session.payment_status,
          paymentMethod: session.payment_method_types?.[0] || 'card'
        }
        const savedOrder = saveOrder(orderData)
        
        // Send email notifications (only if not already sent)
        console.log('📧 Attempting to send email notifications for order:', savedOrder.id)
        console.log('   Customer email:', savedOrder.customer?.email)
        
        // Check if emails were already sent (prevent duplicates)
        const confirmationSent = hasEmailBeenSent(savedOrder.id, 'confirmation')
        const adminSent = hasEmailBeenSent(savedOrder.id, 'admin')
        
        if (!confirmationSent) {
          try {
            const emailResult = await sendOrderConfirmation(savedOrder)
            if (emailResult.success) {
              markEmailSent(savedOrder.id, 'confirmation')
              console.log('✅ Customer email sent successfully')
            } else {
              console.log('⚠️  Customer email not sent:', emailResult.reason || emailResult.error)
            }
          } catch (emailError) {
            console.error('❌ Error sending customer email:', emailError.message)
          }
        } else {
          console.log('ℹ️  Customer confirmation email already sent, skipping')
        }
        
        if (!adminSent) {
          try {
            const adminResult = await sendAdminNotification(savedOrder)
            if (adminResult.success) {
              markEmailSent(savedOrder.id, 'admin')
              console.log('✅ Admin email sent successfully')
            } else {
              console.log('⚠️  Admin email not sent:', adminResult.reason || adminResult.error)
            }
          } catch (emailError) {
            console.error('❌ Error sending admin email:', emailError.message)
          }
        } else {
          console.log('ℹ️  Admin notification email already sent, skipping')
        }
      } catch (saveError) {
        console.error('Error saving order from checkout verification:', saveError)
        // Don't fail the request if order save fails
      }
    }
    
    res.json(session)
  } catch (error) {
    console.error('Error retrieving session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Old webhook endpoint removed - now handled above before express.json()

// Get Canada Post Shipping Rates
// Following OWASP best practices: rate limiting + schema-based validation
app.post('/api/get-shipping-rates', shippingLimiter, validateShippingRates, async (req, res) => {
  try {
    const { destination, cartItems } = req.body

    // Input validation is now handled by validateShippingRates middleware
    // All fields are validated, sanitized, and type-checked above
    
    const country = destination.country || 'Canada'
    
    // Normalize province to 2-letter code for Canada Post API (e.g., "Ontario" -> "ON")
    // Handle various province formats from frontend
    let province = (destination.province || '').trim().toUpperCase()
    const provinceMap = {
      'ONTARIO': 'ON', 'QUEBEC': 'QC', 'QUEBÉC': 'QC', 'NOVA SCOTIA': 'NS',
      'NEW BRUNSWICK': 'NB', 'MANITOBA': 'MB', 'BRITISH COLUMBIA': 'BC',
      'PRINCE EDWARD ISLAND': 'PE', 'SASKATCHEWAN': 'SK', 'ALBERTA': 'AB',
      'NEWFOUNDLAND AND LABRADOR': 'NL', 'NEWFOUNDLAND': 'NL',
      'NORTHWEST TERRITORIES': 'NT', 'YUKON': 'YT', 'NUNAVUT': 'NU'
    }
    if (province.length > 2 && provinceMap[province]) {
      province = provinceMap[province]
    } else if (province.length > 2) {
      // Try to extract 2-letter code if it's embedded (e.g., "ON - Ontario")
      const match = province.match(/\b([A-Z]{2})\b/)
      if (match) province = match[1]
    }
    
    console.log('🌍 Shipping rate request - Country:', country, 'Postal Code:', destination.postalCode, 'Province:', province)

    // Your origin address (where you ship from)
    const origin = {
      postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE || 'M5H 2N2', // Default to Toronto
      city: process.env.SHIPPING_ORIGIN_CITY || 'Toronto',
      province: process.env.SHIPPING_ORIGIN_PROVINCE || 'ON'
    }

    // Calculate package weight
    // Product weights (measured weights in kg)
    // These are product-only weights - packaging is added separately
    const PRODUCT_WEIGHTS = {
      'small': 0.075,   // kg - Small Bag (measured: max 75g across all products)
      'medium': 0.14,   // kg - Medium Bag (measured: max 140g across all products)
      'large': 0.34,    // kg - Large Bag (calculated: max 340g based on proportional scaling)
      'clearbox': 0.165 // kg - Clear Box (measured: max 165g across all products)
    }

    // Box sizes with dimensions and packaging weights
    const BOX_SIZES = {
      small: {
        length: 23,   // cm - Measured box size
        width: 15,    // cm - Measured box size
        height: 13,   // cm - Measured box size
        packagingWeight: 0.1, // kg - Estimated (measure when available)
        maxItems: 5
      },
      large: {
        length: 27,   // cm - Measured box size
        width: 25,    // cm - Measured box size
        height: 15,   // cm - Measured box size
        packagingWeight: 0.2, // kg - Estimated (measure when available)
        maxItems: 999
      }
    }

    const calculateWeight = (items) => {
      // Calculate product weight
      let productWeight = 0
      items.forEach(item => {
        const variantLower = (item.variant || '').toLowerCase()
        let itemWeight = 0.1 // Default weight
        
        if (variantLower.includes('small')) itemWeight = PRODUCT_WEIGHTS.small
        else if (variantLower.includes('medium')) itemWeight = PRODUCT_WEIGHTS.medium
        else if (variantLower.includes('large')) itemWeight = PRODUCT_WEIGHTS.large
        else if (variantLower.includes('clear')) itemWeight = PRODUCT_WEIGHTS.clearbox
        
        productWeight += itemWeight * (item.quantity || 1)
      })

      // Select appropriate box size based on item count
      const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
      let boxSize
      if (itemsCount <= BOX_SIZES.small.maxItems) {
        boxSize = BOX_SIZES.small
      } else {
        boxSize = BOX_SIZES.large
      }

      // Total weight = Product weight + Packaging weight
      const totalWeight = productWeight + boxSize.packagingWeight

      return Math.max(totalWeight, 0.1)
    }

    const weight = calculateWeight(cartItems)
    const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    
    // Package dimensions (in cm) - uses BOX_SIZES defined above
    let dimensions
    if (itemsCount <= BOX_SIZES.small.maxItems) {
      dimensions = { length: BOX_SIZES.small.length, width: BOX_SIZES.small.width, height: BOX_SIZES.small.height }
    } else {
      dimensions = { length: BOX_SIZES.large.length, width: BOX_SIZES.large.width, height: BOX_SIZES.large.height }
    }

    // Log package calculation details
    console.log('📦 Shipping Rate Calculation Details:')
    console.log('   Cart Items:', cartItems.map(item => `${item.quantity}x ${item.variant || item.name}`).join(', '))
    console.log('   Total Items:', itemsCount)
    console.log('   Box Selected:', itemsCount <= BOX_SIZES.small.maxItems ? 'Small' : 'Large')
    console.log('   Package Weight:', `${weight.toFixed(3)} kg`)
    console.log('   Package Dimensions:', `${dimensions.length}×${dimensions.width}×${dimensions.height} cm`)
    console.log('   Origin:', `${origin.city}, ${origin.province} ${origin.postalCode}`)
    console.log('   Destination:', `${destination.city}, ${destination.province} ${destination.postalCode} (${country})`)

    // Helper functions for estimated rates - Updated for 2024 Canada Post rates
    const calculateEstimatedRate = (postalCode, weight, serviceType, country = 'Canada') => {
      if (country === 'United States') {
        // USPS rates (converted to CAD, approximate)
        // Base rates for packages under 1lb (0.45kg)
        const baseRates = {
          'first-class': 18.00,      // First-Class Package - 5-7 business days
          'priority': 25.00,          // Priority Mail - 2-3 business days
          'priority-express': 45.00  // Priority Mail Express - 1-2 business days
        }
        
        let rate = baseRates[serviceType] || 18.00
        
        // Weight-based pricing (convert kg to lbs: 1kg = 2.2lbs)
        const weightLbs = weight * 2.2
        if (weightLbs > 1 && weightLbs <= 2) {
          rate += 3.00
        } else if (weightLbs > 2 && weightLbs <= 4) {
          rate += 6.00
        } else if (weightLbs > 4) {
          rate += 6.00 + ((weightLbs - 4) / 1) * 2.00
        }
        
        return Math.round(rate * 100) / 100
      } else {
        // Canada Post rates
        const baseRates = {
          'regular': 12.00,      // Regular Parcel - standard delivery
          'expedited': 18.00,    // Expedited Parcel - faster delivery (50% more than regular)
          'xpresspost': 22.00    // Xpresspost - express delivery (83% more than regular)
        }
        
        let rate = baseRates[serviceType] || 10.00
        
        // Weight-based pricing (more accurate tier system)
        // Under 0.5kg: base rate
        // 0.5kg - 1kg: +$1.50
        // 1kg - 2kg: +$3.00
        // 2kg+: +$2 per additional 0.5kg
        if (weight > 0.5 && weight <= 1.0) {
          rate += 1.50
        } else if (weight > 1.0 && weight <= 2.0) {
          rate += 3.00
        } else if (weight > 2.0) {
          rate += 3.00 + ((weight - 2.0) / 0.5) * 2.00
        }
        
        // Remote area surcharge (Yukon, Northwest Territories, Nunavut)
        const firstChar = postalCode.charAt(0).toUpperCase()
        if (['Y', 'X'].includes(firstChar)) {
          rate *= 1.25  // 25% surcharge for remote areas
        }
        
        return Math.round(rate * 100) / 100
      }
    }

    const getEstimatedDays = (serviceName, country = 'Canada') => {
      if (country === 'United States') {
        // Canada Post US services
        const days = {
          'Tracked Packet - USA': 5.5,         // 4-7 business days
          'Xpresspost - USA': 3,              // 2-3 business days
          'Priority Worldwide - USA': 2       // 1-2 business days
        }
        return days[serviceName] || 7
      } else {
        const days = { 
          'Regular Parcel': 3,      // Updated from 5 - Ontario is typically 2-5 days
          'Expedited Parcel': 2,    // Updated from 3
          'Xpresspost': 1           // Updated from 2
        }
        return days[serviceName] || 3
      }
    }

    const getServiceDescription = (serviceName, country = 'Canada') => {
      if (country === 'United States') {
        // Canada Post US services
        const descriptions = {
          'Tracked Packet - USA': 'Standard delivery to US with tracking (4-7 business days)',
          'Xpresspost - USA': 'Faster delivery to US with tracking and insurance (2-3 business days)',
          'Priority Worldwide - USA': 'Express delivery to US with signature (1-2 business days)'
        }
        return descriptions[serviceName] || 'Standard delivery to US'
      } else {
        const descriptions = {
          'Regular Parcel': 'Standard delivery within Canada',
          'Expedited Parcel': 'Faster delivery with tracking',
          'Xpresspost': 'Express delivery with signature'
        }
        return descriptions[serviceName] || 'Standard delivery'
      }
    }

    // Helper function for estimated US rates (Canada Post services)
    const calculateEstimatedUSRate = (postalCode, weight, serviceType) => {
      // Base rates for Canada Post US services (in CAD)
      const baseRates = {
        'tracked-packet': 18.00,      // Tracked Packet - USA
        'xpresspost-usa': 28.00,      // Xpresspost - USA
        'priority-worldwide': 45.00  // Priority Worldwide - USA
      }
      
      let rate = baseRates[serviceType] || 18.00
      
      // Weight-based pricing (convert kg to lbs: 1kg = 2.2lbs)
      const weightLbs = weight * 2.2
      if (weightLbs > 1 && weightLbs <= 2) {
        rate += 3.00
      } else if (weightLbs > 2 && weightLbs <= 4) {
        rate += 6.00
      } else if (weightLbs > 4) {
        rate += 6.00 + ((weightLbs - 4) / 1) * 2.00
      }
      
      return Math.round(rate * 100) / 100
    }

    // Check if Canada Post credentials are configured
    const canadaPostUsername = process.env.CANADA_POST_USERNAME
    const canadaPostPassword = process.env.CANADA_POST_PASSWORD
    const canadaPostCustomerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER || '0001238590' // Your customer number from the portal

    // If credentials not set, use estimated rates
    if (!canadaPostUsername || !canadaPostPassword) {
      console.log('Canada Post credentials not configured, using estimated rates')
      
      if (country === 'United States') {
        // Estimated rates for US (Canada Post services)
        const baseRates = {
          'Tracked Packet - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'tracked-packet'),
          'Xpresspost - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'xpresspost-usa'),
          'Priority Worldwide - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'priority-worldwide')
        }

        const shippingOptions = Object.entries(baseRates).map(([name, price]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          price: price,
          estimatedDays: getEstimatedDays(name, country),
          description: getServiceDescription(name, country)
        }))

        return res.json({ options: shippingOptions })
      } else {
        // Estimated rates for Canada
        const baseRates = {
          'Regular Parcel': calculateEstimatedRate(destination.postalCode, weight, 'regular', country),
          'Expedited Parcel': calculateEstimatedRate(destination.postalCode, weight, 'expedited', country),
          'Xpresspost': calculateEstimatedRate(destination.postalCode, weight, 'xpresspost', country)
        }

        const shippingOptions = Object.entries(baseRates).map(([name, price]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          price: price,
          estimatedDays: getEstimatedDays(name, country),
          description: getServiceDescription(name, country)
        }))

        return res.json({ options: shippingOptions })
      }
    }

    // Real Canada Post API integration (supports both Canada and US)
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1308',message:'Canada Post API request - credentials check',data:{usernameSet:!!canadaPostUsername,usernamePrefix:canadaPostUsername?.substring(0,4)||'NONE',passwordSet:!!canadaPostPassword,passwordLength:canadaPostPassword?.length||0,customerNumber:canadaPostCustomerNumber,useProduction:process.env.CANADA_POST_USE_PRODUCTION,envUsername:process.env.CANADA_POST_USERNAME?.substring(0,4)||'NONE',envPasswordSet:!!process.env.CANADA_POST_PASSWORD},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const auth = Buffer.from(`${canadaPostUsername}:${canadaPostPassword}`).toString('base64')
      
      // Use development/sandbox endpoint for testing
      const apiUrl = process.env.CANADA_POST_USE_PRODUCTION === 'true'
        ? 'https://soa-gw.canadapost.ca/rs/ship/price'
        : 'https://ct.soa-gw.canadapost.ca/rs/ship/price'
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1315',message:'Canada Post API request - endpoint and auth',data:{apiUrl,useProduction:process.env.CANADA_POST_USE_PRODUCTION==='true',authHeaderPrefix:auth.substring(0,10)||'NONE',authLength:auth.length,customerNumberInXml:canadaPostCustomerNumber},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Build XML based on destination country
      let destinationXml
      if (country === 'United States') {
        // US destination - use united-states element
        destinationXml = `<united-states>
      <postal-code>${destination.postalCode.replace(/\s+/g, '').replace(/-/g, '').substring(0, 5)}</postal-code>
    </united-states>`
      } else {
        // Canadian destination - use domestic element
        destinationXml = `<domestic>
      <postal-code>${destination.postalCode.replace(/\s+/g, '')}</postal-code>
    </domestic>`
      }

      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <customer-number>${canadaPostCustomerNumber}</customer-number>
  <parcel-characteristics>
    <weight>${weight.toFixed(3)}</weight>
    <dimensions>
      <length>${dimensions.length}</length>
      <width>${dimensions.width}</width>
      <height>${dimensions.height}</height>
    </dimensions>
  </parcel-characteristics>
  <origin-postal-code>${origin.postalCode.replace(/\s+/g, '')}</origin-postal-code>
  <destination>
    ${destinationXml}
  </destination>
</mailing-scenario>`
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1345',message:'Canada Post API request - XML body',data:{xmlBodyLength:xmlBody.length,xmlContainsCustomerNumber:xmlBody.includes(canadaPostCustomerNumber),customerNumberInXml:canadaPostCustomerNumber,originPostalCode:origin.postalCode.replace(/\s+/g,''),destinationPostalCode:destination.postalCode.replace(/\s+/g,''),country},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // Add timeout to Canada Post API call (20 seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)
      
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1352',message:'Canada Post API request - before fetch',data:{apiUrl,method:'POST',hasAuthHeader:true,authHeaderPrefix:auth.substring(0,10)||'NONE',contentType:'application/vnd.cpc.ship.rate-v4+xml',xmlBodyLength:xmlBody.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
            'Accept': 'application/vnd.cpc.ship.rate-v4+xml'
          },
          body: xmlBody,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1365',message:'Canada Post API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,headers:Object.fromEntries(response.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        if (!response.ok) {
          const errorText = await response.text()
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:1368',message:'Canada Post API error response',data:{status:response.status,errorText:errorText.substring(0,500),errorTextLength:errorText.length,is401:response.status===401,is403:response.status===403,usernamePrefix:canadaPostUsername?.substring(0,4)||'NONE',customerNumber:canadaPostCustomerNumber,apiUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          console.error('❌ Canada Post API error:', response.status, errorText)
          
          // Enhanced error logging for 403 errors
          if (response.status === 403) {
            console.error('🚫 Authorization failed (403). Possible causes:')
            console.error('   1. Account not activated for production API access')
            console.error('   2. Account does not have permission for this endpoint')
            console.error('   3. Customer number does not have shipping API access')
            console.error('   4. Wrong endpoint URL or missing required path parameters')
            console.error('   5. Service code or options not enabled in your contract')
            console.error('   Full error:', errorText)
            console.error('   Contact Canada Post support: 1-866-511-0546')
          }
          
          // Enhanced error logging for 401 errors
          if (response.status === 401) {
            console.error('🔐 Authentication failed. Check:')
            console.error('   - Username:', canadaPostUsername ? `${canadaPostUsername.substring(0, 4)}...` : 'NOT SET')
            console.error('   - Password:', canadaPostPassword ? 'SET' : 'NOT SET')
            console.error('   - Customer Number:', canadaPostCustomerNumber)
            console.error('   - Use Production:', process.env.CANADA_POST_USE_PRODUCTION)
            console.error('   - Endpoint:', apiUrl)
            console.error('   - Possible causes:')
            console.error('     1. Credentials expired or rotated')
            console.error('     2. Account not activated (contact Canada Post support: 1-866-511-0546)')
            console.error('     3. Wrong credentials for environment (production vs development)')
          }
          
          throw new Error(`Canada Post API error: ${response.status} - ${errorText.substring(0, 200)}`)
        }

        const xmlData = await response.text()
        const packageDetails = {
          weight: weight,
          dimensions: dimensions,
          origin: origin,
          destination: destination,
          itemsCount: itemsCount,
          boxSize: itemsCount <= BOX_SIZES.small.maxItems ? 'Small' : 'Large'
        }
        let rates = parseCanadaPostResponse(xmlData, country, packageDetails)
        
        // Sort by service type priority (but keep exact prices from Canada Post)
        if (rates && rates.length > 0) {
          // Sort by service type priority
          const servicePriority = {
            'Regular Parcel': 1,
            'Expedited Parcel': 2,
            'Xpresspost': 3
          }
          
          rates.sort((a, b) => {
            const priorityA = servicePriority[a.name] || 999
            const priorityB = servicePriority[b.name] || 999
            return priorityA - priorityB
          })
          
          // Log the exact rates and package details for debugging
          console.log(`✅ Canada Post API returned ${rates.length} rates for ${country}`)
          console.log(`📦 Package details:`, {
            weight: `${weight.toFixed(3)} kg`,
            dimensions: `${dimensions.length}×${dimensions.width}×${dimensions.height} cm`,
            boxSize: packageDetails.boxSize,
            itemsCount: itemsCount,
            origin: `${origin.city}, ${origin.province} ${origin.postalCode}`,
            destination: `${destination.city}, ${destination.province} ${destination.postalCode}`,
            country: country
          })
          console.log(`💰 Exact Canada Post rates:`, rates.map(r => `${r.name}: $${r.price.toFixed(2)}`).join(', '))
          
          return res.json({ 
            options: rates,
            packageDetails: packageDetails // Include package details in response
          })
        }
        
        // Fall through to estimated rates if parsing failed
        console.log(`⚠️ Failed to parse Canada Post response for ${country}, using estimated rates`)
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          console.error('Canada Post API request timed out after 20 seconds')
          throw new Error('Canada Post API request timed out')
        }
        throw fetchError
      }
    } catch (apiError) {
      console.error('Canada Post API error:', apiError.message || apiError)
      console.error('Error details:', {
        username: canadaPostUsername ? 'set' : 'missing',
        password: canadaPostPassword ? 'set' : 'missing',
        customerNumber: canadaPostCustomerNumber,
        useProduction: process.env.CANADA_POST_USE_PRODUCTION
      })
      // Fall through to estimated rates
    }

    // Fallback to estimated rates if API call fails
    let baseRates
    if (country === 'United States') {
      baseRates = {
        'Tracked Packet - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'tracked-packet'),
        'Xpresspost - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'xpresspost-usa'),
        'Priority Worldwide - USA': calculateEstimatedUSRate(destination.postalCode, weight, 'priority-worldwide')
      }
    } else {
      baseRates = {
        'Regular Parcel': calculateEstimatedRate(destination.postalCode, weight, 'regular', country),
        'Expedited Parcel': calculateEstimatedRate(destination.postalCode, weight, 'expedited', country),
        'Xpresspost': calculateEstimatedRate(destination.postalCode, weight, 'xpresspost', country)
      }
    }

    const shippingOptions = Object.entries(baseRates).map(([name, price]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      price: price,
      estimatedDays: getEstimatedDays(name, country),
      description: getServiceDescription(name, country)
    }))

    res.json({ options: shippingOptions })
  } catch (error) {
    console.error('Error getting shipping rates:', error)
    res.status(500).json({ error: error.message })
  }
})

// Parse Canada Post XML response
function parseCanadaPostResponse(xml, country = 'Canada', packageDetails = null) {
  const rates = []
  
  try {
    // Service code mappings for Canada
    const canadaServiceMap = {
      'DOM.RP': { name: 'Regular Parcel', days: 3 },
      'DOM.EP': { name: 'Expedited Parcel', days: 2 },
      'DOM.XP': { name: 'Xpresspost', days: 1 },
      'DOM.PC': { name: 'Priority', days: 1 }
    }
    
    // Service code mappings for US
    const usServiceMap = {
      'USA.TP': { name: 'Tracked Packet - USA', days: 7 },
      'USA.EP': { name: 'Xpresspost - USA', days: 3 },
      'USA.PW': { name: 'Priority Worldwide - USA', days: 2 },
      'USA.PW.ENV': { name: 'Priority Worldwide - USA', days: 2 }
    }
    
    const serviceMap = country === 'United States' ? usServiceMap : canadaServiceMap
    
    // Extract price quotes from XML
    const priceQuoteRegex = /<price-quote>([\s\S]*?)<\/price-quote>/g
    let match
    
    while ((match = priceQuoteRegex.exec(xml)) !== null) {
      const quoteXml = match[1]
      
      // Extract service code
      const serviceCodeMatch = quoteXml.match(/<service-code>([^<]+)<\/service-code>/)
      if (!serviceCodeMatch) continue
      
      const serviceCode = serviceCodeMatch[1]
      
      // Skip Priority (DOM.PC) - only show original 3 options: Regular, Expedited, Xpresspost
      if (serviceCode === 'DOM.PC') {
        continue
      }
      
      const serviceInfo = serviceMap[serviceCode]
      if (!serviceInfo) {
        // Log unmapped service codes for debugging
        console.log(`Unmapped service code: ${serviceCode} for country: ${country}`)
        continue
      }
      
      // Extract price
      const priceMatch = quoteXml.match(/<base>([^<]+)<\/base>/)
      if (!priceMatch) continue
      
      const price = parseFloat(priceMatch[1])
      
      // Build description based on service name and country
      let description = 'Standard delivery'
      if (country === 'United States') {
        if (serviceInfo.name.includes('Tracked Packet')) {
          description = 'Standard delivery to US with tracking (4-7 business days)'
        } else if (serviceInfo.name.includes('Xpresspost')) {
          description = 'Faster delivery to US with tracking and insurance (2-3 business days)'
        } else if (serviceInfo.name.includes('Priority Worldwide')) {
          description = 'Express delivery to US with signature (1-2 business days)'
        }
      } else {
        if (serviceInfo.name.includes('Regular Parcel')) {
          description = 'Standard delivery within Canada'
        } else if (serviceInfo.name.includes('Expedited Parcel')) {
          description = 'Faster delivery with tracking'
        } else if (serviceInfo.name.includes('Xpresspost')) {
          description = 'Express delivery with signature'
        }
      }
      
      const rateObj = {
        id: serviceInfo.name.toLowerCase().replace(/\s+/g, '-'),
        name: serviceInfo.name,
        price: price,
        estimatedDays: serviceInfo.days,
        description: description,
        serviceCode: serviceCode
      }
      
      // Include package details if provided (for debugging/transparency)
      if (packageDetails) {
        rateObj._packageDetails = packageDetails
      }
      
      rates.push(rateObj)
    }
    
    // Sort by price (cheapest first)
    rates.sort((a, b) => a.price - b.price)
    
  } catch (error) {
    console.error('Error parsing Canada Post XML:', error)
  }
  
  return rates
}

// Health check endpoint
// Health check endpoint
// Apply rate limiting (lenient for monitoring)
app.get('/api/health', healthLimiter, (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    stripeConfigured: !!stripe,
    canadaPostConfigured: !!(process.env.CANADA_POST_USERNAME && process.env.CANADA_POST_PASSWORD),
    resendConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
  })
})

// Email template preview (view in browser; safe for local dev)
app.get('/api/preview-email', (req, res) => {
  // Disable in production launch builds.
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).send('Not found')
  }

  const template = (req.query.template || 'order').toLowerCase()
  const lang = (req.query.lang || 'en').toLowerCase()
  const language = lang === 'fr' ? 'fr' : 'en'
  let html
  if (template === 'welcome' || template === 'welcome-popup') {
    html = getWelcomeEmailPreview(language, 'popup')
  } else if (template === 'welcome-list') {
    html = getWelcomeEmailPreview(language, 'inline')
  } else {
    html = getOrderConfirmationPreview(language)
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
})

// Check Resend email delivery status
app.get('/api/check-email/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Status</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .info { background: #e3f2fd; border: 1px solid #90caf9; color: #1565c0; padding: 20px; border-radius: 8px; }
          a { color: #1976d2; }
        </style>
      </head>
      <body>
        <div class="info">
          <h1>Email Status Check</h1>
          <p><strong>Message ID:</strong> ${messageId}</p>
          <p>To check email delivery status:</p>
          <ol>
            <li>Go to <a href="https://resend.com/emails" target="_blank">Resend Dashboard</a></li>
            <li>Look for emails sent to your address</li>
            <li>Check delivery status and any errors</li>
          </ol>
          <p><strong>Note:</strong> Using <code>onboarding@resend.dev</code> may have delivery limitations. Verify your own domain in Resend for better delivery.</p>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Test email endpoint (GET for easy browser testing)
app.get('/api/test-email', async (req, res) => {
  try {
    const email = req.query.email || process.env.ADMIN_EMAIL || 'mattgranato2004@gmail.com'
    if (!email) {
      return res.status(400).json({ error: 'Email address required. Add ?email=your@email.com to the URL' })
    }

    console.log('🧪 Testing email to:', email)
    
    // Create a test order
    const testOrder = {
      id: 'TEST-ORDER',
      customer: {
        name: 'Test Customer',
        email: email
      },
      items: [{ name: 'Test Product', variant: 'Test', quantity: 1, total: 10.00 }],
      subtotal: 10.00,
      shippingCost: 5.00,
      tax: 1.30,
      total: 16.30,
      currency: 'CAD',
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    const result = await sendOrderConfirmation(testOrder)
    
    if (result.success) {
      console.log('✅ Test email sent successfully!')
      console.log('   Resend Message ID:', result.messageId)
      console.log('   Check Resend dashboard: https://resend.com/emails')
      const resendLink = result.messageId ? `https://resend.com/emails/${result.messageId}` : 'https://resend.com/emails'
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Test - Success</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Test Email Sent Successfully!</h1>
            <p><strong>Sent to:</strong> ${email}</p>
            <p><strong>Message ID:</strong> ${result.messageId || 'N/A'}</p>
            <p><strong>From:</strong> ${process.env.RESEND_FROM_EMAIL || 'N/A'}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p><strong>⚠️ Important:</strong></p>
            <ul style="text-align: left; max-width: 500px; margin: 10px auto;">
              <li>Check your <strong>spam/junk folder</strong></li>
              <li>If using <code>onboarding@resend.dev</code>, emails may have delivery issues</li>
              <li>Verify your domain in Resend for better delivery</li>
              <li>Check <a href="https://resend.com/emails" target="_blank">Resend Dashboard</a> to see email status</li>
            </ul>
            <p><a href="/api/test-email?email=${email}">Send another test email</a></p>
          </div>
        </body>
        </html>
      `)
    } else {
      console.log('❌ Test email failed:', result.error || result.reason)
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Test - Failed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; }
            h1 { margin-top: 0; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Test Email Failed</h1>
            <p><strong>Error:</strong> ${result.error || result.reason || 'Unknown error'}</p>
            <p><strong>Sent to:</strong> ${email}</p>
            <p>Check your server terminal for more details.</p>
            <p><a href="/api/test-email?email=${email}">Try again</a></p>
          </div>
        </body>
        </html>
      `)
    }
  } catch (error) {
    console.error('❌ Test email error:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Test - Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; }
          h1 { margin-top: 0; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Server Error</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <pre>${error.stack}</pre>
        </div>
      </body>
      </html>
    `)
  }
})

// Admin API Routes
// Simple password protection - in production, use proper authentication
// SECURITY: Always use environment variable for admin password in production
// Following OWASP best practices: no hardcoded credentials
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Log admin password status on server start (without revealing the actual password)
if (ADMIN_PASSWORD) {
  console.log('✅ Admin password loaded from environment variable (length:', ADMIN_PASSWORD.length, 'chars)')
} else {
  console.error('❌ SECURITY WARNING: ADMIN_PASSWORD not set in environment variables!')
  console.error('   Admin dashboard access is DISABLED until ADMIN_PASSWORD is configured.')
  console.error('   Set ADMIN_PASSWORD in your .env file or environment variables for production.')
}

const authenticateAdmin = (req, res, next) => {
  // SECURITY: Admin password must be set via environment variable
  // Following OWASP: no default passwords, fail securely
  if (!ADMIN_PASSWORD) {
    console.error('❌ SECURITY: Admin authentication attempted but ADMIN_PASSWORD not configured')
    return res.status(503).json({ 
      error: 'Admin authentication is not configured. Contact administrator.',
      message: 'Admin dashboard is disabled until ADMIN_PASSWORD is set in environment variables.'
    })
  }

  // Get password from query param (URL decoded) or header
  const providedPassword = req.query.password 
    ? decodeURIComponent(req.query.password) 
    : req.headers['x-admin-password']

  // Trim whitespace from provided password
  const trimmedProvided = providedPassword ? providedPassword.trim() : ''
  const trimmedAdmin = ADMIN_PASSWORD.trim()

  // Debug logging (only log on failure to avoid exposing password)
  // Following OWASP: log authentication failures for security monitoring
  if (trimmedProvided !== trimmedAdmin) {
    console.log('🔒 Admin authentication failed:', {
      providedLength: trimmedProvided.length,
      expectedLength: trimmedAdmin.length,
      providedFirstChar: trimmedProvided.charAt(0),
      expectedFirstChar: trimmedAdmin.charAt(0),
      hasQueryParam: !!req.query.password,
      hasHeader: !!req.headers['x-admin-password'],
      envVarSet: !!process.env.ADMIN_PASSWORD
    })
  }
  
  if (trimmedProvided === trimmedAdmin && trimmedAdmin.length > 0) {
    console.log('✅ Admin authentication successful')
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized. Invalid admin password.' })
  }
}

// Get email list subscribers (admin only)
app.get('/api/admin/subscribers', authenticateAdmin, (req, res) => {
  try {
    Promise.resolve(getSubscribers())
      .then((subscribers) => res.json({ subscribers }))
      .catch((error) => {
        console.error('Error fetching subscribers:', error)
        res.status(500).json({ error: error.message })
      })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all orders (admin only)
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const { status, limit } = req.query
    let orders = getAllOrders()
    
    if (status) {
      orders = orders.filter(order => order.status === status)
    }
    
    if (limit) {
      orders = orders.slice(0, parseInt(limit))
    }
    
    res.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get order by ID (admin only)
app.get('/api/admin/orders/:orderId', authenticateAdmin, (req, res) => {
  try {
    const order = getOrderById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update order status (admin only)
app.patch('/api/admin/orders/:orderId/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }
    
    const order = updateOrderStatus(req.params.orderId, status)
    
    // If order is being marked as shipped, send shipping notification (only if not already sent)
    if (status === 'shipped') {
      const shippingSent = hasEmailBeenSent(order.id, 'shipping')
      if (!shippingSent) {
        try {
          const result = await sendShippingNotification(order, trackingNumber || null)
          if (result.success) {
            markEmailSent(order.id, 'shipping')
            console.log('✅ Shipping notification email sent')
          }
        } catch (emailError) {
          console.error('Error sending shipping notification:', emailError)
          // Don't fail the request if email fails
        }
      } else {
        console.log('ℹ️  Shipping notification email already sent, skipping')
      }
    }
    
    res.json({ order })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get order statistics (admin only)
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const stats = getOrderStats()
    res.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create a refund (admin only)
app.post('/api/admin/orders/:orderId/refund', authenticateAdmin, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured' })
    }

    const order = getOrderById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const { amount, reason } = req.body
    const refundAmount = amount ? Math.round(amount * 100) : null // Convert to cents, null = full refund
    const refundReason = reason || 'requested_by_customer'

    // Get the charge ID from the order
    let chargeId = order.stripeChargeId
    
    // If no charge ID, try to get it from payment intent or session
    if (!chargeId && order.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)
        chargeId = paymentIntent.latest_charge
      } catch (error) {
        console.error('Error retrieving payment intent:', error)
      }
    }

    if (!chargeId) {
      return res.status(400).json({ error: 'No Stripe charge ID found for this order. Cannot process refund.' })
    }

    // Create refund in Stripe
    const refundParams = {
      charge: chargeId,
      reason: refundReason
    }

    if (refundAmount) {
      refundParams.amount = refundAmount
    }

    console.log('🔄 Creating refund for order:', order.id, 'Amount:', refundAmount ? `$${(refundAmount / 100).toFixed(2)}` : 'Full refund')

    const refund = await stripe.refunds.create(refundParams)

    // Update order with refund information
    if (!order.refunds) {
      order.refunds = []
    }

    const refundData = {
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      createdAt: new Date(refund.created * 1000).toISOString()
    }

    order.refunds.push(refundData)

    // Calculate total refunded
    const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0)
    
    // Update order status
    if (totalRefunded >= order.total) {
      order.status = 'refunded'
      order.refundStatus = 'full'
    } else if (totalRefunded > 0) {
      order.refundStatus = 'partial'
    }

    order.updatedAt = new Date().toISOString()

    // Save updated order
    const allOrders = getAllOrders()
    const orderIndex = allOrders.findIndex(o => o.id === order.id)
    if (orderIndex !== -1) {
      allOrders[orderIndex] = order
      const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(allOrders, null, 2))
    }

    console.log('✅ Refund created successfully:', refund.id)

    res.json({
      success: true,
      refund: refundData,
      order: order
    })
  } catch (error) {
    console.error('Error creating refund:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create refund',
      stripeError: error.type || null
    })
  }
})

// Get refund information for an order (admin only)
app.get('/api/admin/orders/:orderId/refunds', authenticateAdmin, (req, res) => {
  try {
    const order = getOrderById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({
      refunds: order.refunds || [],
      totalRefunded: order.refunds ? order.refunds.reduce((sum, r) => sum + r.amount, 0) : 0,
      refundStatus: order.refundStatus || 'none'
    })
  } catch (error) {
    console.error('Error fetching refunds:', error)
    res.status(500).json({ error: error.message })
  }
})

// Contact form submission
// Following OWASP best practices: rate limiting + schema-based validation
app.post('/api/contact', apiLimiter, validateContactForm, async (req, res) => {
  try {
    // Input validation is now handled by validateContactForm middleware
    // All fields are validated, sanitized, and type-checked above
    const { name, email, inquiryType, message } = req.body

    console.log('📧 Contact form submission received:', { name, email, inquiryType, messageLength: message.length })

    // Send email using Resend
    const result = await sendContactForm(name.trim(), email.trim(), inquiryType.trim(), message.trim())

    if (result.success) {
      console.log('✅ Contact form email sent successfully')
      res.json({ 
        success: true, 
        message: 'Thank you for your message! We\'ll get back to you soon.',
        messageId: result.messageId 
      })
    } else {
      console.error('❌ Failed to send contact form email:', result.error || result.reason)
      res.status(500).json({ 
        error: 'Failed to send message. Please try again or email us directly at purepeel11@gmail.com',
        details: result.error || result.reason
      })
    }
  } catch (error) {
    console.error('Error processing contact form:', error)
    res.status(500).json({ 
      error: 'Something went wrong. Please try again or email us directly at purepeel11@gmail.com',
      details: error.message
    })
  }
})

// Customer order lookup (public endpoint, but requires order ID and email)
// Following OWASP best practices: rate limiting + schema-based validation
// Rate limiting prevents enumeration attacks
app.post('/api/order-lookup', orderLookupLimiter, validateOrderLookup, async (req, res) => {
  try {
    // Input validation is now handled by validateOrderLookup middleware
    // All fields are validated, sanitized, and type-checked above
    const { orderId, email } = req.body

    console.log('🔍 Order lookup request:', { orderId, email: email ? email.substring(0, 3) + '***' : 'missing' })

    // Normalize order ID (remove spaces, ensure uppercase)
    const normalizedOrderId = orderId.trim().toUpperCase()

    // Try exact match first
    let order = getOrderById(normalizedOrderId)
    
    // If not found, try with different formats
    if (!order) {
      // Try with original format
      order = getOrderById(orderId.trim())
      
      // If still not found, try searching all orders for partial match
      if (!order) {
        const allOrders = getAllOrders()
        order = allOrders.find(o => 
          o.id?.toUpperCase() === normalizedOrderId ||
          o.id?.replace(/[^A-Z0-9-]/g, '').toUpperCase() === normalizedOrderId.replace(/[^A-Z0-9-]/g, '').toUpperCase()
        )
      }
    }

    if (!order) {
      console.log('❌ Order not found:', normalizedOrderId)
      console.log('   Total orders in database:', getAllOrders().length)
      console.log('   Recent order IDs:', getAllOrders().slice(0, 5).map(o => o.id))
      return res.status(404).json({ 
        error: 'Order not found. Please check your order number and try again. If you just placed the order, it may take a few moments to appear.' 
      })
    }

    // Verify email matches order email (case-insensitive)
    if (order.customer?.email?.toLowerCase() !== email.toLowerCase()) {
      console.log('❌ Email mismatch:', {
        provided: email.substring(0, 3) + '***',
        expected: order.customer?.email ? order.customer.email.substring(0, 3) + '***' : 'missing'
      })
      return res.status(403).json({ error: 'Email does not match this order. Please use the email address you used when placing the order.' })
    }

    console.log('✅ Order lookup successful:', order.id)
    console.log('   Shipping address available:', !!(order.shipping?.address && (order.shipping.address.line1 || order.shipping.address.city)))

    // Return order details (without sensitive info)
    res.json({ order })
  } catch (error) {
    console.error('❌ Error looking up order:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// PRODUCT MANAGEMENT API ENDPOINTS
// ============================================

// Simple API key authentication for product management
// Following OWASP best practices: API keys stored in environment variables only
// Set PRODUCT_API_KEY in environment variables
const authenticateProductAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey
  const expectedKey = process.env.PRODUCT_API_KEY
  
  if (!expectedKey) {
    console.error('❌ SECURITY: PRODUCT_API_KEY not configured - product API endpoints disabled')
    return res.status(500).json({ error: 'Product API key not configured on server' })
  }
  
  if (!apiKey || apiKey !== expectedKey) {
    // Log failed authentication attempt (for security monitoring)
    console.warn('⚠️  Failed API key authentication attempt from IP:', req.ip)
    return res.status(401).json({ error: 'Invalid API key' })
  }
  
  next()
}

// Get all products (public endpoint)
app.get('/api/products', apiLimiter, (req, res) => {
  try {
    const products = getAllProducts()
    res.json({ products, count: products.length })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get product by ID (public endpoint)
// Apply input validation
app.get('/api/products/:id', apiLimiter, validateProductId, (req, res) => {
  try {
    const product = getProductById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create or update a product (requires API key)
app.post('/api/products', authenticateProductAPI, apiLimiter, (req, res) => {
  try {
    const productData = req.body
    
    // Validate required fields
    if (!productData.id) {
      return res.status(400).json({ error: 'Product ID is required' })
    }
    
    if (!productData.name) {
      return res.status(400).json({ error: 'Product name is required' })
    }
    
    if (!productData.variants || !Array.isArray(productData.variants) || productData.variants.length === 0) {
      return res.status(400).json({ error: 'Product must have at least one variant' })
    }
    
    // Validate variants
    for (const variant of productData.variants) {
      if (!variant.id || !variant.label || !variant.option || typeof variant.price !== 'number') {
        return res.status(400).json({ error: 'Each variant must have id, label, option, and price' })
      }
    }
    
    const product = saveProduct(productData)
    res.json({ product, message: 'Product saved successfully' })
  } catch (error) {
    console.error('Error saving product:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update a product (requires API key)
app.put('/api/products/:id', authenticateProductAPI, apiLimiter, (req, res) => {
  try {
    const productId = req.params.id
    const updates = req.body
    
    // Don't allow changing the ID
    if (updates.id && updates.id !== productId) {
      return res.status(400).json({ error: 'Cannot change product ID' })
    }
    
    const product = updateProduct(productId, updates)
    res.json({ product, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Error updating product:', error)
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: error.message })
  }
})

// Delete a product (requires API key)
app.delete('/api/products/:id', authenticateProductAPI, apiLimiter, (req, res) => {
  try {
    const productId = req.params.id
    deleteProduct(productId)
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: error.message })
  }
})

// Bulk upload products (requires API key)
app.post('/api/products/bulk', authenticateProductAPI, apiLimiter, (req, res) => {
  try {
    const products = req.body.products || req.body
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array' })
    }
    
    if (products.length === 0) {
      return res.status(400).json({ error: 'Products array cannot be empty' })
    }
    
    // Validate all products
    for (const product of products) {
      if (!product.id || !product.name) {
        return res.status(400).json({ error: 'Each product must have id and name' })
      }
      if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
        return res.status(400).json({ error: `Product ${product.id} must have at least one variant` })
      }
    }
    
    const savedProducts = bulkSaveProducts(products)
    res.json({ 
      products: savedProducts, 
      count: savedProducts.length,
      message: `Successfully saved ${savedProducts.length} products` 
    })
  } catch (error) {
    console.error('Error bulk saving products:', error)
    res.status(500).json({ error: error.message })
  }
})

// Email list subscription (Resend + in-code templates; subscribers stored locally)
app.post('/api/subscribe', apiLimiter, async (req, res) => {
  const { email, language, source } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const normalizedLanguage = language === 'fr' ? 'fr' : 'en'
  const subscribeSource = source === 'popup' ? 'popup' : 'inline'

  // Skip sending if already subscribed (prevents duplicate emails)
  const alreadySubscribed = await hasSubscriber(email)
  if (alreadySubscribed) {
    return res.json({ success: true })
  }

  try {
    console.log('Subscribe: sending welcome email to', email, '| template:', subscribeSource === 'popup' ? 'popup (10% off)' : 'list')
    const welcomeResult = await sendWelcomeEmail(email, { language: normalizedLanguage, source: subscribeSource })
    if (!welcomeResult.success) {
      return res.status(500).json({ error: welcomeResult.error || welcomeResult.reason || 'Email not configured' })
    }
    await addSubscriber(email, { language: normalizedLanguage, source: subscribeSource })
    return res.json({ success: true })
  } catch (err) {
    console.error('❌ Welcome email error:', err.message)
    return res.status(500).json({ error: 'Subscription failed' })
  }
})

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health\n`)
  
  if (stripe) {
    console.log('✓ Stripe configured')
  } else {
    console.log('⚠ Stripe not configured - set STRIPE_SECRET_KEY in .env for payment processing')
  }
  
  if (process.env.CANADA_POST_USERNAME) {
    console.log('✓ Canada Post API credentials detected - real-time rates enabled')
  } else {
    console.log('⚠ Canada Post API credentials not set - using estimated rates')
  }
  
  // Check email configuration
  if (process.env.RESEND_API_KEY) {
    console.log('✓ Resend email service configured')
    console.log('  From email:', process.env.RESEND_FROM_EMAIL || 'not set')
    console.log('  Admin email:', process.env.ADMIN_EMAIL || 'not set')
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('✓ Email service configured (Gmail/SMTP)')
  } else {
    console.log('⚠ Email not configured - emails will not be sent')
    console.log('  Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env for Resend')
    console.log('  Or add EMAIL_USER and EMAIL_PASSWORD for Gmail/SMTP')
  }
  console.log('')
})

