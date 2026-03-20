/**
 * ORDER STORAGE UTILITY 
 * 
 * Purpose: Manages order data in a JSON file (acts like a simple database)
 * This is the "Order CRUD + Business Logic" layer for the backend 
 * 
 * Key Responsibilities: 
 * - Store customer orders (after Stripe payment succeeds) 
 * - Track order status (pending -> processing -> shipped -> delivered) 
 * - Prevent duplicate order creation (checks Stripe session ID) 
 * - Track with emails have been sent (confirmation, admin, shipping) 
 * -Store tracking numbers and shipping labels 
 * -Generate order statistics for admin dashboard 
 *  
 * Data Storage: 
 * -Location: /data/orders.json 
 * -Format: JSON array of order objects
 * File-based (simple, but should migrate to database when scaling)
 * 
 * Used By: 
 * -server.js webhook handler (creates orders when payment succeeds)
 * -server.js admin API endpoints (view/update orders)
 * -server.js order lookup endpoint (customers check order status)
 * 
 * Related Files: 
 * -productStorage.js (similar pattern for products)
 * -emailService.js (reads emailsSent tracking to prevent duplicates)
 * -chitchatsShipping.js (updates orders with tracking info)
 * -server.js (uses all these functions) 
 * 
 */

import fs from 'fs'   //File system operations 
import path from 'path' //Path manipulatiion 
import { fileURLToPath } from 'url' //ES module compatibility 

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to orders JSON file (in project root/data directory)
//Uses process.cwd() instead of __dirname to ensure correct path regardless of where server runs from 
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')


//===========================================
//FILE INITIALIZATION 
//===========================================
/**
 * Ensure data directory exists 
 * Creates /data folder if it doesn't exist 
 */
const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true }) //recursive: creates parent dirs if needed 
  }
}
/**
 * Initialize orders file if it doesn't exist 
 * Creates empty orders.json file on first run 
 * 
 * Why: Prevents "file not found" errors when starting fresh server 
 */
const initializeOrdersFile = () => {
  ensureDataDirectory()
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2)) //Empty array, pretty formatted 
  }
}

//===========================================
//READ OPERATIONS 
//===========================================
/**
 * Read all orders from the JSON file 
 * 
 * @returns {Array} Array of order objects (newest first)
 * Used by: 
 * -GET /api/admin/orders (admin dashboard) - view all orders) 
 * - saveOrder (to check for duplicates)
 *  -getOrderStats (to calculate statistics)
 * 
 * Example return: 
 * [
 * {
 * id: "PP-12345678",
 * stripeSessionId: "cs_test_...", 
 * customer: {name: "John Doe", email: "john@example.com},
 * items: [...],
 * total 36.00,
 * status: "shipped",
 * trackingNumber "1234567890",
 * emailsSent: { confirmation: true, admin: true, shipping: true},
 * createdAt: "2024-01-01-01T00:00:00.000Z", 
 * updatedAt: "20254-01-02T00:00:00.000Z"
 * }
 * ]
 */
export const getAllOrders = () => {
  try {
    initializeOrdersFile() //Ensure file exists
    const data = fs.readFileSync(ORDERS_FILE, 'utf8') 
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading orders:', error)
    return [] //Return empty array on error
  }
}

//===========================================
// WRITE OPERATIONS (CREATE) 
//===========================================
/**
 * Save a new order (usually from Stripe webhook)
 * 
 * @param {Object} orderData - Order data from Stripe checkout session 
 * @returns {Object} Saved order object 
 * 
 * Used by: 
 * -POST /api/webhook (Stripe webhook - when payment succeeds)
 * -GET /api/checkout-session/:sessionId (fallback if webhook missed)
 * 
 * Duplicate prevention:
 * - Checks if order with same Stripe sessions ID already exists
 * -Returns existing order instead of creating duplicate
 * -Important: Stripe can send webhooks multiple times!
 * 
 * Order ID Generation: 
 * - Uses provided ID if available (from frontend metadata) 
 * - Falls back to: PP-[8-digit timestamp]
 * - Example: PP-12345678
 * 
 * Email Tracking: 
 * - Initiaizes emailsSent object to prevent duplicate emails 
 * - {confirmationL false, admin: false, shipping: false }
 * 
 * Example usage: 
 * saveOrder ({
 * stripeSessionId: "cs_test...",
 * customer: {name: "John Doe", email: "john@example.com"},
 * items: [...],
 * total: 36.00
 * })
 */

export const saveOrder = (orderData) => {
  try {
    initializeOrdersFile()
    const orders = getAllOrders()
  
    //===========================================
    //DUPLICATE PREVENTION
    //Check if order with same Stripe session ID already exists 
    //===========================================
    if (orderData.stripeSessionId) {
      const existingOrder = orders.find(o => o.stripeSessionId === orderData.stripeSessionId)
      if (existingOrder) {
        console.log('Order already exists:', existingOrder.id)
        return existingOrder //Return existing order instead of creating duplicate 
      }
    }
    
 
    //Generate order ID if not provided 
    //Frontend should provide ID in metadata, but this is fallback 
    const orderId = orderData.id || `PP-${Date.now().toString().slice(-8)}` //PP-12345678
    
    //Create new order obejct with defaults
    const newOrder = {
      id: orderId,
      ...orderData, //Spread all order data from Stripe
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending', // pending, processing, shipped, delivered, cancelled
      
      //Email tracking (prevents sending duplicate emails)
      emailsSent: {
        confirmation: false,  //Customer order confirmation email
        admin: false,         //Admin notification email
        shipping: false       //Customer shipping notification email
      }
    }

    //Add to beginning of array (newest orders first)
    orders.unshift(newOrder) // unshift = add to start, push = add to end 
    
    //Write entire orders array back to file
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
    console.log('Order saved:', newOrder.id)
    return newOrder
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}

//===========================================
//READ OPERATIONS (SINGLE ORDER) 
//===========================================
/**
 * Get a single order by its ID
 * @param {string} orderId - Order ID (e.g. PP-12345678)
 * @returns {Object|undefined} Order object or undefined if not found
 * 
 * Used by: 
 * - GET /api/admin/orders/:orderId (admin view order details) 
 * - POST /api/order-lookup (customer lookup their order)
 * -updateOrderStatus (to find order before updating) 
 * -hasEmailBeenSent (to check email status) 
 * 
 * Example: 
 * getOrderById("PP-12345678") -> { id: "PP-12345678", ...}
 * getOrderById("invalid") -> undefined 
 */


export const getOrderById = (orderId) => {
  const orders = getAllOrders()
  return orders.find(order => order.id === orderId)
}

//===========================================
//UPDATE OPERATIONS (ORDER STATUS) 
//===========================================
export const updateOrderStatus = (orderId, status) => {
  try {
    const orders = getAllOrders()
    const orderIndex = orders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) {
      throw new Error('Order not found')
    }
    orders[orderIndex].status = status
    orders[orderIndex].updatedAt = new Date().toISOString()
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
    return orders[orderIndex]
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// Update order with tracking information
export const updateOrderTracking = (orderId, trackingData) => {
  try {
    const orders = getAllOrders()
    const orderIndex = orders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) {
      throw new Error('Order not found')
    }
    orders[orderIndex].trackingNumber = trackingData.trackingNumber
    orders[orderIndex].trackingUrl = trackingData.trackingUrl
    orders[orderIndex].shippingCarrier = trackingData.carrier
    orders[orderIndex].labelUrl = trackingData.labelUrl
    orders[orderIndex].shipmentId = trackingData.shipmentId
    orders[orderIndex].pin = trackingData.pin
    orders[orderIndex].status = 'processing' // Update status to processing when label is created
    orders[orderIndex].updatedAt = new Date().toISOString()
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
    console.log('✅ Order tracking updated:', orderId, trackingData.trackingNumber)
    return orders[orderIndex]
  } catch (error) {
    console.error('Error updating order tracking:', error)
    throw error
  }
}

// Mark email as sent for an order
export const markEmailSent = (orderId, emailType) => {
  try {
    const orders = getAllOrders()
    const orderIndex = orders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) {
      throw new Error('Order not found')
    }
    if (!orders[orderIndex].emailsSent) {
      orders[orderIndex].emailsSent = {
        confirmation: false,
        admin: false,
        shipping: false
      }
    }
    orders[orderIndex].emailsSent[emailType] = true
    orders[orderIndex].updatedAt = new Date().toISOString()
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
    return orders[orderIndex]
  } catch (error) {
    console.error('Error marking email as sent:', error)
    throw error
  }
}

// Check if email was already sent
export const hasEmailBeenSent = (orderId, emailType) => {
  try {
    const order = getOrderById(orderId)
    if (!order || !order.emailsSent) {
      return false
    }
    return order.emailsSent[emailType] === true
  } catch (error) {
    console.error('Error checking email status:', error)
    return false
  }
}

// Get orders by status
export const getOrdersByStatus = (status) => {
  const orders = getAllOrders()
  return orders.filter(order => order.status === status)
}

// Get order statistics
export const getOrderStats = () => {
  const orders = getAllOrders()
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  }
}

