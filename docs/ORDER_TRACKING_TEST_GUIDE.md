# Order Tracking Verification Guide

## How Order Tracking Works

The order tracking system allows customers to look up their orders using:
- **Order ID** (format: `PP-XXXXXXXX` - 8 digits)
- **Email address** (must match the email used when placing the order)

### System Architecture

1. **Order Storage**: Orders are stored in `data/orders.json` file
2. **API Endpoint**: `/api/order-lookup` (POST request)
3. **Frontend**: `/order-tracking` page
4. **Security**: Email verification ensures only the order owner can view their order

---

## How to Verify Order Tracking Works

### Method 1: Using Existing Orders (Recommended)

1. **Check if you have existing orders:**
   ```bash
   # View orders file
   cat data/orders.json
   ```

2. **Find an order ID and email:**
   - Look for an order with `id` field (e.g., `PP-12345678`)
   - Note the `customer.email` field

3. **Test on the website:**
   - Go to: `https://purepeelco.com/order-tracking`
   - Enter the order ID
   - Enter the matching email address
   - Click "Track Order"
   - You should see the order details

### Method 2: Create a Test Order

1. **Place a test order:**
   - Go through the checkout process
   - Use a test email you can access
   - Complete payment (use Stripe test mode)
   - Note the order ID from the confirmation page

2. **Verify the order was saved:**
   ```bash
   # Check the orders file
   cat data/orders.json | grep -A 5 "your-order-id"
   ```

3. **Test tracking:**
   - Go to `/order-tracking`
   - Enter the order ID and email
   - Verify it displays correctly

### Method 3: Direct API Testing

You can test the API directly using curl or a tool like Postman:

```bash
# Replace with actual order ID and email
curl -X POST https://your-backend-url.com/api/order-lookup \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "PP-12345678",
    "email": "customer@example.com"
  }'
```

**Expected Response (Success):**
```json
{
  "order": {
    "id": "PP-12345678",
    "status": "pending",
    "customer": {
      "name": "John Doe",
      "email": "customer@example.com"
    },
    "items": [...],
    "total": 25.99,
    ...
  }
}
```

**Expected Response (Error - Wrong Email):**
```json
{
  "error": "Email does not match this order"
}
```

**Expected Response (Error - Order Not Found):**
```json
{
  "error": "Order not found"
}
```

---

## Verification Checklist

### ✅ Frontend Verification

- [ ] Navigate to `/order-tracking` page
- [ ] Form displays correctly
- [ ] Can enter order ID and email
- [ ] Submit button works
- [ ] Loading state shows while searching
- [ ] Error messages display for invalid inputs
- [ ] Order details display correctly when found
- [ ] Order status badge shows correct color/icon
- [ ] All order information is visible (items, totals, shipping info)

### ✅ Backend Verification

- [ ] Server is running
- [ ] `/api/order-lookup` endpoint responds
- [ ] Valid order ID + email returns order data
- [ ] Wrong email returns 403 error
- [ ] Invalid order ID returns 404 error
- [ ] Missing parameters return 400 error
- [ ] Server logs show lookup attempts

### ✅ Security Verification

- [ ] Cannot access order with wrong email
- [ ] Email matching is case-insensitive
- [ ] Order data doesn't expose sensitive payment info
- [ ] API endpoint is publicly accessible (as intended)

---

## Common Issues & Solutions

### Issue: "Order not found"
**Possible Causes:**
- Order ID is incorrect
- Order hasn't been created yet
- Orders file is empty or corrupted

**Solution:**
1. Check `data/orders.json` file exists and has orders
2. Verify order ID format: `PP-XXXXXXXX` (8 digits)
3. Check server logs for errors

### Issue: "Email does not match this order"
**Possible Causes:**
- Email address doesn't match the one used during checkout
- Email has extra spaces or typos

**Solution:**
1. Verify the exact email used during checkout
2. Check for case sensitivity (should be case-insensitive, but verify)
3. Check server logs to see what email was expected

### Issue: "Unable to connect to server"
**Possible Causes:**
- Backend server is not running
- `VITE_API_URL` environment variable is incorrect
- Network/firewall issues

**Solution:**
1. Verify backend server is running
2. Check `VITE_API_URL` in Vercel environment variables
3. Test API endpoint directly with curl

### Issue: Order tracking page shows nothing
**Possible Causes:**
- JavaScript errors in browser console
- API URL not configured
- CORS issues

**Solution:**
1. Open browser developer console (F12)
2. Check for JavaScript errors
3. Check Network tab for failed API requests
4. Verify `VITE_API_URL` is set correctly

---

## Testing with Admin Panel

You can also verify orders exist using the Admin panel:

1. Go to `/admin` (requires password)
2. View all orders
3. Copy an order ID and customer email
4. Use those to test order tracking

---

## Server Logs

The server logs helpful information for debugging:

```
🔍 Order lookup request: { orderId: 'PP-12345678', email: 'cus***' }
✅ Order lookup successful: PP-12345678
   Shipping address available: true
```

Or for errors:
```
❌ Order not found: PP-12345678
❌ Email mismatch: { provided: 'cus***', expected: 'diff***' }
```

Check your server logs (Render, Railway, etc.) to see these messages.

---

## Quick Test Script

Create a test file `test-order-tracking.js`:

```javascript
const API_URL = process.env.API_URL || 'http://localhost:3001'

async function testOrderTracking(orderId, email) {
  try {
    const response = await fetch(`${API_URL}/api/order-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Order found!')
      console.log('Order ID:', data.order.id)
      console.log('Status:', data.order.status)
      console.log('Total:', data.order.total)
    } else {
      console.log('❌ Error:', data.error)
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message)
  }
}

// Test with your order
testOrderTracking('PP-12345678', 'your-email@example.com')
```

Run it:
```bash
node test-order-tracking.js
```

---

## Next Steps After Verification

Once you've verified order tracking works:

1. ✅ Test with a real order from your store
2. ✅ Share the tracking page URL with customers
3. ✅ Add tracking link to order confirmation emails
4. ✅ Monitor server logs for any issues
5. ✅ Test edge cases (wrong email, invalid order ID, etc.)

---

## Need Help?

If order tracking isn't working:
1. Check server logs for errors
2. Verify `data/orders.json` has orders
3. Test API endpoint directly with curl
4. Check browser console for frontend errors
5. Verify `VITE_API_URL` environment variable is set correctly
