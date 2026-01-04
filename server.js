// Note: This server requires additional dependencies
// Run: npm install express cors stripe dotenv
// Or use serverless functions (Vercel/Netlify) instead

import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { saveOrder, getAllOrders, getOrderById, updateOrderStatus, getOrderStats, markEmailSent, hasEmailBeenSent } from './utils/orderStorage.js'
import { sendOrderConfirmation, sendShippingNotification, sendAdminNotification } from './utils/emailService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
})

// Stricter rate limiter for checkout - 5 attempts per 15 minutes per IP
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 checkout attempts per 15 minutes
  message: 'Too many checkout attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiter for shipping rates - 20 requests per 15 minutes per IP
const shippingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 shipping rate requests per 15 minutes
  message: 'Too many shipping rate requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(cors(corsOptions))
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

// Create Checkout Session
app.post('/api/create-checkout-session', checkoutLimiter, async (req, res) => {
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
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${item.name} - ${item.variant}`,
          description: item.description || '',
          images: item.image ? [new URL(item.image, req.headers.origin || 'http://localhost:5173').href] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Get shipping cost from request (selected shipping option)
    const shippingCost = shippingInfo.selectedShipping 
      ? Math.round(shippingInfo.selectedShipping.price * 100) // Convert to cents
      : (total >= 50 ? 0 : 1000) // Fallback: free over $50, else $10
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0)
    // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
    // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
    const tax = 0 // 0% HST/GST - Products are zero-rated as unsweetened dried fruits
    const totalAmount = subtotal + shippingCost + tax

    // Create Stripe Checkout Session
    // Note: 'card' automatically enables Apple Pay and Google Pay when available
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/checkout?canceled=true`,
      customer_email: shippingInfo.email,
      shipping_address_collection: {
        allowed_countries: ['CA'],
      },
      metadata: {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
        order_notes: shippingInfo.notes || '',
      },
      // Add shipping cost
      shipping_options: shippingCost > 0 ? [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: shippingCost,
            currency: 'cad',
          },
          display_name: shippingInfo.selectedShipping?.name || 'Standard Shipping',
        },
      }] : [],
    })

    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Verify payment and get session details
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
      })
    }

    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['line_items']
    })
    
    // Check if order already exists
    const existingOrder = getOrderById(session.metadata?.order_id || `PP-${Date.now().toString().slice(-8)}`)
    
    // If order doesn't exist and payment is successful, save it (fallback if webhook didn't fire)
    if (!existingOrder && session.payment_status === 'paid') {
      try {
        const orderData = {
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          customer: {
            name: session.metadata?.customer_name || session.customer_details?.name || 'N/A',
            email: session.customer_email || session.customer_details?.email || 'N/A',
            phone: session.metadata?.customer_phone || session.customer_details?.phone || 'N/A',
          },
          shipping: {
            name: session.shipping_details?.name || session.metadata?.customer_name || 'N/A',
            address: session.shipping_details?.address || {},
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

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file' 
    })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      console.log('Payment successful for session:', session.id)
      
      try {
        // Retrieve full session details to get line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items']
        })

        // Extract order information
        const orderData = {
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          customer: {
            name: session.metadata?.customer_name || session.customer_details?.name || 'N/A',
            email: session.customer_email || session.customer_details?.email || 'N/A',
            phone: session.metadata?.customer_phone || session.customer_details?.phone || 'N/A',
          },
          shipping: {
            name: session.shipping_details?.name || session.metadata?.customer_name || 'N/A',
            address: session.shipping_details?.address || {},
            method: session.shipping_cost?.display_name || 'Standard Shipping'
          },
          items: fullSession.line_items?.data?.map(item => ({
            name: item.description || item.price_data?.product_data?.name || 'Unknown',
            variant: item.description?.split(' - ')[1] || 'N/A',
            quantity: item.quantity,
            price: item.price.unit_amount / 100, // Convert from cents
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

        // Save order
        const savedOrder = saveOrder(orderData)
        console.log('Order saved successfully:', savedOrder.id)

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
      } catch (error) {
        console.error('Error saving order from webhook:', error)
      }
      break
    case 'payment_intent.succeeded':
      console.log('PaymentIntent succeeded')
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

// Get Canada Post Shipping Rates
app.post('/api/get-shipping-rates', shippingLimiter, async (req, res) => {
  try {
    const { destination, cartItems } = req.body

    // Input validation
    if (!destination) {
      return res.status(400).json({ error: 'Destination information is required' })
    }

    const country = destination.country || 'Canada'
    
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
          'Tracked Packet - USA': 7,           // 5-10 business days
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
          'Tracked Packet - USA': 'Standard delivery to US with tracking (5-10 business days)',
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
      const auth = Buffer.from(`${canadaPostUsername}:${canadaPostPassword}`).toString('base64')
      
      // Use development/sandbox endpoint for testing
      const apiUrl = process.env.CANADA_POST_USE_PRODUCTION === 'true'
        ? 'https://soa-gw.canadapost.ca/rs/ship/price'
        : 'https://ct.soa-gw.canadapost.ca/rs/ship/price'

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

      // Add timeout to Canada Post API call (20 seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)
      
      try {
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

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Canada Post API error:', response.status, errorText)
          throw new Error(`Canada Post API error: ${response.statusText}`)
        }

        const xmlData = await response.text()
        const rates = parseCanadaPostResponse(xmlData, country)
        
        // If we got rates from API, return them
        if (rates && rates.length > 0) {
          return res.json({ options: rates })
        }
        
        // Fall through to estimated rates if parsing failed
        console.log('Failed to parse Canada Post response, using estimated rates')
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
      
      // Get description based on country
      const description = country === 'United States' 
        ? getServiceDescription(serviceInfo.name, country)
        : getServiceDescription(serviceInfo.name, country)
      
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

const authenticateAdmin = (req, res, next) => {
  const providedPassword = req.headers['x-admin-password'] || req.query.password
  if (providedPassword === ADMIN_PASSWORD) {
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

// Customer order lookup (public endpoint, but requires order ID and email)
app.post('/api/order-lookup', async (req, res) => {
  try {
    const { orderId, email } = req.body

    if (!orderId || !email) {
      return res.status(400).json({ error: 'Order ID and email are required' })
    }

    const order = getOrderById(orderId)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Verify email matches order email (case-insensitive)
    if (order.customer?.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match this order' })
    }

    // Return order details (without sensitive info)
    res.json({ order })
  } catch (error) {
    console.error('Error looking up order:', error)
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

