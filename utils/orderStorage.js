import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to orders JSON file (in project root/data directory)
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json')

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize orders file if it doesn't exist
const initializeOrdersFile = () => {
  ensureDataDirectory()
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2))
  }
}

// Read all orders
export const getAllOrders = () => {
  try {
    initializeOrdersFile()
    const data = fs.readFileSync(ORDERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading orders:', error)
    return []
  }
}

// Save a new order
export const saveOrder = (orderData) => {
  try {
    initializeOrdersFile()
    const orders = getAllOrders()
    
    // Check if order with same Stripe session ID already exists
    if (orderData.stripeSessionId) {
      const existingOrder = orders.find(o => o.stripeSessionId === orderData.stripeSessionId)
      if (existingOrder) {
        console.log('Order already exists:', existingOrder.id)
        return existingOrder
      }
    }
    
    // Generate order ID if not provided
    const orderId = orderData.id || `PP-${Date.now().toString().slice(-8)}`
    
    const newOrder = {
      id: orderId,
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending', // pending, processing, shipped, delivered, cancelled
      emailsSent: {
        confirmation: false,
        admin: false,
        shipping: false
      }
    }
    orders.unshift(newOrder) // Add to beginning (newest first)
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2))
    console.log('Order saved:', newOrder.id)
    return newOrder
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}

// Get order by ID
export const getOrderById = (orderId) => {
  const orders = getAllOrders()
  return orders.find(order => order.id === orderId)
}

// Update order status
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

