# Quick Order Tracking Test

## ✅ You Have Existing Orders!

I found orders in your `data/orders.json` file. Here's how to test order tracking right now:

## Method 1: Test on Your Website (Easiest)

1. **Go to your order tracking page:**
   - Production: `https://purepeelco.com/order-tracking`
   - Local: `http://localhost:5173/order-tracking`

2. **Use one of your existing orders:**
   - **Order ID:** `PP-53989314`
   - **Email:** `mattgranato2004@gmail.com`

3. **Enter the order ID and email, then click "Track Order"**

4. **You should see:**
   - Order details
   - Order status (pending/processing/shipped/delivered)
   - Items ordered
   - Shipping information
   - Order total

## Method 2: Test with Script

Run the test script I created:

```bash
cd pure-peel
node scripts/test-order-tracking.js PP-53989314 mattgranato2004@gmail.com
```

**For production backend:**
```bash
VITE_API_URL=https://your-backend-url.com node scripts/test-order-tracking.js PP-53989314 mattgranato2004@gmail.com
```

## Method 3: Test API Directly

Use curl to test the API endpoint:

```bash
curl -X POST https://your-backend-url.com/api/order-lookup \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "PP-53989314",
    "email": "mattgranato2004@gmail.com"
  }'
```

## What to Look For

### ✅ Success Indicators:
- Order details display correctly
- All order information is visible
- Status badge shows correct color
- No error messages

### ❌ Failure Indicators:
- "Order not found" → Order ID doesn't exist
- "Email does not match" → Wrong email address
- "Unable to connect to server" → Backend not running or wrong API URL

## Verify Backend is Running

The order tracking requires your backend server to be running. Check:

1. **Is your backend deployed?**
   - Check Render/Railway/your hosting service
   - Verify the server is running

2. **Is VITE_API_URL set correctly?**
   - In Vercel: Settings → Environment Variables
   - Should be: `https://your-backend-url.com`
   - No trailing slash!

3. **Can you access the API?**
   - Try: `https://your-backend-url.com/api/order-lookup` (should return an error, not 404)

## Quick Checklist

- [ ] Backend server is running
- [ ] `VITE_API_URL` is set in Vercel
- [ ] Orders exist in `data/orders.json`
- [ ] Can access `/order-tracking` page
- [ ] Can enter order ID and email
- [ ] Order details display correctly

## Need to Test with a New Order?

1. Place a test order through your checkout
2. Note the order ID from confirmation page
3. Use that order ID and email to test tracking

## Troubleshooting

**"Order not found"**
- Check `data/orders.json` has the order
- Verify order ID format: `PP-XXXXXXXX` (8 digits)
- Make sure backend can read the orders file

**"Email does not match"**
- Use the exact email from the order
- Check for typos or extra spaces
- Email matching is case-insensitive

**"Unable to connect to server"**
- Verify backend is running
- Check `VITE_API_URL` environment variable
- Test API endpoint directly with curl

---

**Your test order:**
- Order ID: `PP-53989314`
- Email: `mattgranato2004@gmail.com`
- Status: `pending`
- Total: `$17.00 CAD`

Try it now! 🚀
