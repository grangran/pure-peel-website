#!/usr/bin/env node

/**
 * Order Tracking Test Script
 * 
 * This script tests the order tracking API endpoint to verify it's working correctly.
 * 
 * Usage:
 *   node scripts/test-order-tracking.js [orderId] [email]
 * 
 * Example:
 *   node scripts/test-order-tracking.js PP-53989314 mattgranato2004@gmail.com
 */

const API_URL = process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3001'

// Get command line arguments
const orderId = process.argv[2]
const email = process.argv[3]

if (!orderId || !email) {
  console.log('❌ Usage: node scripts/test-order-tracking.js [orderId] [email]')
  console.log('')
  console.log('Example:')
  console.log('  node scripts/test-order-tracking.js PP-53989314 mattgranato2004@gmail.com')
  console.log('')
  console.log('Or set environment variables:')
  console.log('  VITE_API_URL=https://your-backend.com node scripts/test-order-tracking.js PP-53989314 email@example.com')
  process.exit(1)
}

async function testOrderTracking() {
  console.log('🧪 Testing Order Tracking API...')
  console.log('')
  console.log('Configuration:')
  console.log(`  API URL: ${API_URL}`)
  console.log(`  Order ID: ${orderId}`)
  console.log(`  Email: ${email.substring(0, 3)}***`)
  console.log('')
  
  try {
    console.log('📡 Sending request to /api/order-lookup...')
    
    const response = await fetch(`${API_URL}/api/order-lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId.trim(),
        email: email.trim()
      })
    })
    
    const data = await response.json()
    
    console.log('')
    console.log('📥 Response:')
    console.log(`  Status: ${response.status} ${response.statusText}`)
    console.log('')
    
    if (response.ok && data.order) {
      console.log('✅ SUCCESS! Order found!')
      console.log('')
      console.log('Order Details:')
      console.log(`  Order ID: ${data.order.id}`)
      console.log(`  Status: ${data.order.status}`)
      console.log(`  Customer: ${data.order.customer?.name || 'N/A'}`)
      console.log(`  Email: ${data.order.customer?.email || 'N/A'}`)
      console.log(`  Total: $${data.order.total?.toFixed(2) || '0.00'} ${data.order.currency || 'CAD'}`)
      console.log(`  Items: ${data.order.items?.length || 0}`)
      console.log(`  Created: ${data.order.createdAt ? new Date(data.order.createdAt).toLocaleString() : 'N/A'}`)
      console.log(`  Shipping Method: ${data.order.shipping?.method || 'N/A'}`)
      
      if (data.order.trackingNumber) {
        console.log(`  Tracking Number: ${data.order.trackingNumber}`)
      }
      
      console.log('')
      console.log('✅ Order tracking is working correctly!')
      process.exit(0)
    } else {
      console.log('❌ ERROR:')
      console.log(`  ${data.error || 'Unknown error'}`)
      console.log('')
      
      if (response.status === 404) {
        console.log('💡 This means the order ID was not found in the database.')
        console.log('   Make sure:')
        console.log('   - The order ID is correct (format: PP-XXXXXXXX)')
        console.log('   - The order exists in data/orders.json')
        console.log('   - The backend server has access to the orders file')
      } else if (response.status === 403) {
        console.log('💡 This means the email does not match the order.')
        console.log('   Make sure:')
        console.log('   - You\'re using the exact email address from the order')
        console.log('   - Email matching is case-insensitive, but verify the address')
      } else if (response.status === 400) {
        console.log('💡 This means the request was invalid.')
        console.log('   Make sure:')
        console.log('   - Both orderId and email are provided')
        console.log('   - The request format is correct')
      }
      
      process.exit(1)
    }
  } catch (error) {
    console.log('')
    console.log('❌ CONNECTION ERROR:')
    console.log(`  ${error.message}`)
    console.log('')
    console.log('💡 Possible issues:')
    console.log('   - Backend server is not running')
    console.log('   - API_URL is incorrect')
    console.log('   - Network/firewall blocking the connection')
    console.log('   - CORS issues')
    console.log('')
    console.log('   Check:')
    console.log(`   - Is the server running at ${API_URL}?`)
    console.log('   - Can you access the server in your browser?')
    console.log('   - Are there any firewall rules blocking the connection?')
    process.exit(1)
  }
}

// Run the test
testOrderTracking()
