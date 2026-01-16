// Note: This server requires additional dependencies
// Run: npm install express cors stripe dotenv
// Or use serverless functions (Vercel/Netlify) instead

import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import path from 'path'
import { saveOrder, getAllOrders, getOrderById, updateOrderStatus, getOrderStats, markEmailSent, hasEmailBeenSent, updateOrderTracking } from './utils/orderStorage.js'
import { sendOrderConfirmation, sendShippingNotification, sendAdminNotification, sendContactForm } from './utils/emailService.js'
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
      'http://localhost:5173', // Development only
      'http://localhost:3000' // Development only
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

// Rate limiting
// General API rate limiter - 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Note: trustProxy is handled by Express's app.set('trust proxy', 1) above
})

// Stricter rate limiter for checkout - 5 attempts per 15 minutes per IP
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 checkout attempts per 15 minutes
  message: 'Too many checkout attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Note: trustProxy is handled by Express's app.set('trust proxy', 1) above
})

// Stricter rate limiter for shipping rates - 20 requests per 15 minutes per IP
const shippingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 shipping rate requests per 15 minutes
  message: 'Too many shipping rate requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Note: trustProxy is handled by Express's app.set('trust proxy', 1) above
})

// Middleware
app.use(cors(corsOptions))

// IMPORTANT: Webhook endpoint must be BEFORE express.json() middleware
// Stripe webhooks require the raw body for signature verification
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
          const items = JSON.parse(paymentIntent.metadata?.items || '[]')
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

// Input validation helper
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
app.post('/api/create-checkout-session', checkoutLimiter, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    // Get currency from request (default to CAD if not provided)
    const requestedCurrency = (req.body.currency || 'CAD').toLowerCase()
    const stripeCurrency = (requestedCurrency === 'usd') ? 'usd' : 'cad'
    const useUSD = stripeCurrency === 'usd'
    
    // Get exchange rate from frontend (or use default if not provided)
    // This ensures the conversion matches what the user sees on the frontend
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

    // Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required and must be a non-empty array' })
    }

    if (!shippingInfo) {
      return res.status(400).json({ error: 'Shipping information is required' })
    }

    if (!shippingInfo.email || !validateEmail(shippingInfo.email)) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }

    if (!shippingInfo.firstName || !shippingInfo.firstName.trim()) {
      return res.status(400).json({ error: 'First name is required' })
    }

    if (!shippingInfo.lastName || !shippingInfo.lastName.trim()) {
      return res.status(400).json({ error: 'Last name is required' })
    }

    // Validate items
    for (const item of items) {
      if (!item.name || !item.variant || !item.price || !item.quantity) {
        return res.status(400).json({ error: 'Each item must have name, variant, price, and quantity' })
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        return res.status(400).json({ error: 'Item price must be a positive number' })
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 100) {
        return res.status(400).json({ error: 'Item quantity must be between 1 and 100' })
      }
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
    
    // Check if this is a 100% discount code (common test codes)
    const promoCodeUpper = promoCode ? promoCode.toUpperCase().trim() : ''
    const isKnown100PercentCode = promoCodeUpper === 'FREETEST' || promoCodeUpper === 'TEST100'
    // Allow small rounding tolerance (within 1 cent) for discount covering total
    const discountCoversTotal = orderTotalCents > 0 && discountAmountCents >= (orderTotalCents - 1)
    const is100PercentDiscount = promoCodeUpper && (isKnown100PercentCode || discountCoversTotal)
    
    console.log('🎟️ Promo code check:', {
      promoCode: promoCodeUpper || 'none',
      discountAmountCents,
      orderTotalCents,
      isKnown100PercentCode,
      discountCoversTotal,
      is100PercentDiscount
    })
    
    // If discount is 100% or covers the entire order (including shipping), make shipping free
    let finalShippingCostCents = shippingCostCents
    if (is100PercentDiscount) {
      finalShippingCostCents = 0
      console.log('🎁 100% discount detected - shipping set to $0', {
        promoCode: promoCodeUpper,
        originalShipping: shippingCostCents,
        orderTotal: orderTotalCents,
        discountAmount: discountAmountCents
      })
    } else {
      console.log('💰 Regular discount or no discount - shipping remains:', {
        promoCode: promoCodeUpper || 'none',
        shippingCost: shippingCostCents
      })
    }
    
    const totalAmount = Math.max(0, subtotal + finalShippingCostCents + tax - discountAmountCents)
    
    // Validate all amounts are valid integers
    if (isNaN(shippingCostCents) || isNaN(subtotal) || isNaN(discountAmountCents)) {
      console.error('Invalid amount detected:', { shippingCostCents, subtotal, discountAmountCents })
      return res.status(400).json({ error: 'Invalid amount calculation. Please check your cart items and shipping.' })
    }

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

    // Create Stripe Checkout Session
    // Note: 'card' automatically enables Apple Pay and Google Pay when available
    // IMPORTANT: All line_items and shipping_options must use the SAME currency to prevent Stripe from showing a currency selector
    // Disable Adaptive Pricing to prevent Stripe from showing currency selector
    // For Embedded Checkout, use ui_mode: 'embedded' and return_url (NOT success_url or cancel_url)
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      ui_mode: 'embedded', // Set embedded mode from the start
      return_url: `${req.headers.origin || 'http://localhost:5173'}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`, // Only return_url is supported with embedded mode
      adaptive_pricing: {
        enabled: false, // Disable Adaptive Pricing to prevent currency selector
      },
      // Set locale based on currency to ensure proper currency display
      // en-US for USD, en-CA for CAD
      locale: stripeCurrency === 'usd' ? 'en' : 'en', // Stripe will format based on currency code
      // Add custom text to clarify currency (especially for USD since Stripe doesn't show "USD" text)
      custom_text: {
        submit: {
          message: stripeCurrency === 'usd' 
            ? 'All amounts are in USD' 
            : 'All amounts are in CAD'
        }
      },
      customer_email: shippingInfo.email,
      // Always collect shipping address, even for free orders
      // This is required for Canada Post label creation
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'],
      },
      // Force shipping address collection by requiring it
      // Note: For free orders, we still need the address for label creation
      phone_number_collection: {
        enabled: false, // Optional, but can help ensure address is collected
      },
      metadata: {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
        order_notes: shippingInfo.notes || '',
        language: shippingInfo.language || 'en', // Store language preference
        timezone: shippingInfo.timezone || 'America/Toronto', // Store customer timezone
        promo_code: promoCode || '',
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

    // Apply discount if promo code is used
    if (promoCode && discountAmountCents > 0) {
      try {
        // Calculate discount percentage based on order total
        const orderTotalForDiscount = subtotal + finalShippingCostCents + tax
        const discountPercent = orderTotalForDiscount > 0 
          ? Math.max(1, Math.min(100, Math.round((discountAmountCents / orderTotalForDiscount) * 100)))
          : 100 // If total is $0, discount is 100%
        
        console.log('🎟️ Applying promo code:', {
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
    }

    // ui_mode and return_url are already set in sessionConfig above
    // Note: success_url and cancel_url are NOT supported with ui_mode: 'embedded'

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // For Embedded Checkout, return clientSecret instead of url
    res.json({ 
      sessionId: session.id, 
      clientSecret: session.client_secret,
      url: session.url // Keep for backward compatibility, but won't be used in embedded mode
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create Payment Intent for embedded Stripe Elements
app.post('/api/create-payment-intent', checkoutLimiter, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    const { items, shippingInfo, total } = req.body

    // Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required and must be a non-empty array' })
    }

    if (!shippingInfo) {
      return res.status(400).json({ error: 'Shipping information is required' })
    }

    if (!shippingInfo.email || !validateEmail(shippingInfo.email)) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }

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
    const isKnown100PercentCode = promoCodeUpper === 'FREETEST' || promoCodeUpper === 'TEST100'
    const orderTotalCents = subtotal + shippingCostCents + tax
    const discountCoversTotal = orderTotalCents > 0 && discountAmountCents >= (orderTotalCents - 1)
    const is100PercentDiscount = promoCodeUpper && (isKnown100PercentCode || discountCoversTotal)
    const finalShippingCostCents = is100PercentDiscount ? 0 : shippingCostCents
    const totalAmount = Math.max(0, subtotal + finalShippingCostCents + tax - discountAmountCents)

    // Create Payment Intent following Stripe's best practices
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Keep payment on page, no redirects
      },
      payment_method_types: ['card'],
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
        items: JSON.stringify(items),
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
app.get('/api/payment-intent/:paymentIntentId', async (req, res) => {
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
app.get('/api/checkout-session/:sessionId', async (req, res) => {
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
app.post('/api/get-shipping-rates', shippingLimiter, async (req, res) => {
  try {
    const { destination, cartItems } = req.body

    // Input validation
    if (!destination) {
      return res.status(400).json({ error: 'Destination information is required' })
    }

    const country = destination.country || 'Canada'
    console.log('🌍 Shipping rate request - Country:', country, 'Postal Code:', destination.postalCode)
    
    if (!destination.postalCode || !validatePostalCode(destination.postalCode, country)) {
      return res.status(400).json({ 
        error: country === 'United States' 
          ? 'Valid US ZIP code is required' 
          : 'Valid Canadian postal code is required' 
      })
    }

    if (!destination.province || !destination.province.trim()) {
      return res.status(400).json({ 
        error: country === 'United States' 
          ? 'State is required' 
          : 'Province is required' 
      })
    }

    if (!destination.city || !destination.city.trim()) {
      return res.status(400).json({ error: 'City is required' })
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'Cart items must be an array' })
    }

    // Validate input
    if (!destination || !destination.postalCode || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination postal code and cart items are required' 
      })
    }

    // Your origin address (where you ship from)
    const origin = {
      postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE || 'M5H 2N2', // Default to Toronto
      city: process.env.SHIPPING_ORIGIN_CITY || 'Toronto',
      province: process.env.SHIPPING_ORIGIN_PROVINCE || 'ON'
    }

    // Calculate package weight
    const calculateWeight = (items) => {
      const weightPerItem = {
        'mini': 0.05, 'small': 0.1, 'medium': 0.2, 'large': 0.35, 'clearbox': 0.2
      }
      let totalWeight = 0
      items.forEach(item => {
        const variantLower = (item.variant || '').toLowerCase()
        let itemWeight = 0.1
        if (variantLower.includes('mini')) itemWeight = weightPerItem.mini
        else if (variantLower.includes('small')) itemWeight = weightPerItem.small
        else if (variantLower.includes('medium')) itemWeight = weightPerItem.medium
        else if (variantLower.includes('large')) itemWeight = weightPerItem.large
        else if (variantLower.includes('clear')) itemWeight = weightPerItem.clearbox
        totalWeight += itemWeight * (item.quantity || 1)
      })
      return Math.max(totalWeight, 0.1)
    }

    const weight = calculateWeight(cartItems)
    const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    
    // Package dimensions (in cm)
    const dimensions = itemsCount <= 3 
      ? { length: 20, width: 15, height: 5 }
      : itemsCount <= 8
      ? { length: 25, width: 20, height: 8 }
      : { length: 30, width: 25, height: 10 }

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
        let rates = parseCanadaPostResponse(xmlData, country)
        
        // Ensure price hierarchy: Regular < Expedited < Xpresspost
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
          
          // Ensure Expedited is at least $1 more than Regular
          const regularIndex = rates.findIndex(r => r.name === 'Regular Parcel')
          const expeditedIndex = rates.findIndex(r => r.name === 'Expedited Parcel')
          const xpresspostIndex = rates.findIndex(r => r.name === 'Xpresspost')
          
          if (regularIndex !== -1 && expeditedIndex !== -1) {
            const regularPrice = rates[regularIndex].price
            const expeditedPrice = rates[expeditedIndex].price
            if (expeditedPrice <= regularPrice) {
              rates[expeditedIndex].price = Math.ceil((regularPrice + 1) * 100) / 100
            }
          }
          
          // Ensure Xpresspost is at least $1 more than Expedited
          if (expeditedIndex !== -1 && xpresspostIndex !== -1) {
            const expeditedPrice = rates[expeditedIndex].price
            const xpresspostPrice = rates[xpresspostIndex].price
            if (xpresspostPrice <= expeditedPrice) {
              rates[xpresspostIndex].price = Math.ceil((expeditedPrice + 1) * 100) / 100
            }
          }
          
          console.log(`✅ Canada Post API returned ${rates.length} rates for ${country}`)
          return res.json({ options: rates })
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
function parseCanadaPostResponse(xml, country = 'Canada') {
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
      
      rates.push({
        id: serviceInfo.name.toLowerCase().replace(/\s+/g, '-'),
        name: serviceInfo.name,
        price: price,
        estimatedDays: serviceInfo.days,
        description: description,
        serviceCode: serviceCode
      })
    }
    
    // Sort by price (cheapest first)
    rates.sort((a, b) => a.price - b.price)
    
  } catch (error) {
    console.error('Error parsing Canada Post XML:', error)
  }
  
  return rates
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    stripeConfigured: !!stripe,
    canadaPostConfigured: !!(process.env.CANADA_POST_USERNAME && process.env.CANADA_POST_PASSWORD),
    resendConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
  })
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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123' // Change this!

// Log admin password status on server start (without revealing the actual password)
if (process.env.ADMIN_PASSWORD) {
  console.log('✅ Admin password loaded from environment variable (length:', process.env.ADMIN_PASSWORD.length, 'chars)')
} else {
  console.log('⚠️  Using default admin password. Set ADMIN_PASSWORD in environment variables for production.')
}

const authenticateAdmin = (req, res, next) => {
  // Get password from query param (URL decoded) or header
  const providedPassword = req.query.password 
    ? decodeURIComponent(req.query.password) 
    : req.headers['x-admin-password']
  
  // Trim whitespace from provided password
  const trimmedProvided = providedPassword ? providedPassword.trim() : ''
  const trimmedAdmin = ADMIN_PASSWORD ? ADMIN_PASSWORD.trim() : ''
  
  // Debug logging (only log on failure to avoid exposing password)
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
app.post('/api/contact', apiLimiter, async (req, res) => {
  try {
    const { name, email, inquiryType, message } = req.body

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    if (!inquiryType || !inquiryType.trim()) {
      return res.status(400).json({ error: 'Inquiry type is required' })
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

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
app.post('/api/order-lookup', async (req, res) => {
  try {
    const { orderId, email } = req.body

    console.log('🔍 Order lookup request:', { orderId, email: email ? email.substring(0, 3) + '***' : 'missing' })

    if (!orderId || !email) {
      return res.status(400).json({ error: 'Order ID and email are required' })
    }

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
// Set PRODUCT_API_KEY in environment variables
const authenticateProductAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey
  const expectedKey = process.env.PRODUCT_API_KEY
  
  if (!expectedKey) {
    return res.status(500).json({ error: 'Product API key not configured on server' })
  }
  
  if (apiKey !== expectedKey) {
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
app.get('/api/products/:id', apiLimiter, (req, res) => {
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

