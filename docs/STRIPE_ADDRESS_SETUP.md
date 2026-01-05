# Stripe Address Collection Setup Guide

## Current Status ✅

Your Stripe checkout is **already configured** to collect shipping addresses! Here's what's set up:

### 1. Address Collection Enabled

In `server.js`, your Stripe checkout session includes:
```javascript
shipping_address_collection: {
  allowed_countries: ['CA', 'US'],
}
```

This tells Stripe to:
- ✅ Collect shipping address during checkout
- ✅ Only allow addresses from Canada and US
- ✅ Include address in the checkout session

### 2. Address Retrieval

Your code retrieves addresses from Stripe in two places:

**A. Webhook Handler** (`/api/webhook`):
```javascript
const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ['line_items', 'shipping_details'] // ✅ Expands shipping_details
})

// Address is saved:
shipping: {
  name: fullSession.shipping_details?.name || ...,
  address: fullSession.shipping_details?.address || {}, // ✅ Address object
  method: ...
}
```

**B. Checkout Session Handler** (`/api/checkout-session/:sessionId`):
```javascript
const session = await stripe.checkout.sessions.retrieve(sessionId, {
  expand: ['line_items', 'shipping_details'] // ✅ Expands shipping_details
})

// Address is saved:
shipping: {
  name: session.shipping_details?.name || ...,
  address: session.shipping_details?.address || {}, // ✅ Address object
  method: ...
}
```

### 3. Email Templates

Your email templates (`utils/emailService.js`) are already set up to display addresses:

```javascript
const shippingAddress = order.shipping?.address || {}

// In email template:
${shippingAddress.line1 || ''}<br>
${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
${shippingAddress.city || ''}${shippingAddress.city && (shippingAddress.state || shippingAddress.province) ? ', ' : ''} ${shippingAddress.state || shippingAddress.province || ''} ${shippingAddress.postal_code || shippingAddress.postalCode || ''}<br>
${shippingAddress.country || ''}
```

---

## Stripe Address Format

Stripe returns addresses in this format:
```javascript
{
  line1: "123 Main Street",
  line2: "Apt 4B", // Optional
  city: "Toronto",
  state: "ON", // For US: "CA", "NY", etc. For Canada: "ON", "BC", etc.
  postal_code: "M5H 2N2", // ZIP code for US
  country: "CA" // ISO country code: "CA" or "US"
}
```

**Note:** Stripe uses `state` for both US states and Canadian provinces.

---

## How to Verify It's Working

### Step 1: Test a Checkout

1. **Go through checkout:**
   - Add items to cart
   - Fill out shipping form
   - Complete payment in Stripe

2. **Check server logs** (in Render):
   - Look for: `📦 Shipping address debug (webhook):`
   - Should show:
     ```json
     {
       "hasShippingDetails": true,
       "addressLine1": "123 Main St",
       "addressCity": "Toronto",
       "addressState": "ON",
       "addressPostalCode": "M5H 2N2",
       "addressCountry": "CA"
     }
     ```

### Step 2: Check Order Confirmation Email

After placing an order, check the confirmation email. It should show:

```
Shipping Address:
John Doe
123 Main Street
Apt 4B
Toronto, ON M5H 2N2
Canada
```

### Step 3: Check Admin Dashboard

1. Go to `/admin`
2. View the order
3. Check if shipping address is displayed

---

## Troubleshooting: Address Not Showing in Emails

### Issue 1: Address Not Collected by Stripe

**Symptoms:**
- Server logs show: `hasShippingDetails: false`
- Email shows empty address

**Fix:**
1. **Verify `shipping_address_collection` is enabled:**
   - Check `server.js` line 505-507
   - Should have: `shipping_address_collection: { allowed_countries: ['CA', 'US'] }`

2. **Check Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com
   - Check a recent checkout session
   - Look for "Shipping Details" section
   - Should show the address if collected

3. **Verify customer filled address:**
   - Stripe checkout form should ask for address
   - Customer must complete the address form

### Issue 2: Address Not Retrieved from Stripe

**Symptoms:**
- Stripe has address, but server logs show empty

**Fix:**
1. **Verify `expand` includes `shipping_details`:**
   ```javascript
   // In server.js, both webhook and checkout session handlers:
   const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
     expand: ['line_items', 'shipping_details'] // ✅ Must include 'shipping_details'
   })
   ```

2. **Check debug logs:**
   - Look for: `📦 Shipping address debug`
   - Check if `fullSession.shipping_details` exists
   - Check if `fullSession.shipping_details.address` exists

### Issue 3: Address Not Saved to Order

**Symptoms:**
- Address retrieved but not in database/email

**Fix:**
1. **Verify order data structure:**
   ```javascript
   // In server.js, when saving order:
   shipping: {
     name: fullSession.shipping_details?.name || ...,
     address: fullSession.shipping_details?.address || {}, // ✅ Must save address object
     method: ...
   }
   ```

2. **Check order storage:**
   - Verify `saveOrder()` function saves the address
   - Check if address is in the order object

### Issue 4: Address Not Displayed in Email

**Symptoms:**
- Address saved but email shows empty

**Fix:**
1. **Check email template:**
   - Verify `order.shipping?.address` exists
   - Check field names match Stripe format:
     - `line1` (not `addressLine1`)
     - `line2` (not `addressLine2`)
     - `city` (not `addressCity`)
     - `state` or `province`
     - `postal_code` or `postalCode`
     - `country`

2. **Test email template:**
   - Add console.log in email service:
     ```javascript
     console.log('📧 Email address data:', JSON.stringify(shippingAddress, null, 2))
     ```

---

## Testing Address Collection

### Test 1: Place Test Order

1. **Use Stripe test mode:**
   - Use test card: `4242 4242 4242 4242`
   - Fill out complete address in Stripe checkout
   - Complete payment

2. **Check results:**
   - ✅ Server logs show address
   - ✅ Email shows address
   - ✅ Admin dashboard shows address

### Test 2: Check Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com
   - Payments → Select a payment
   - Check "Shipping Details" section

2. **Verify address fields:**
   - Name
   - Address Line 1
   - Address Line 2 (if provided)
   - City
   - State/Province
   - Postal Code
   - Country

---

## Common Issues & Solutions

### Issue: "Address not showing in email"

**Check:**
1. ✅ Is `shipping_address_collection` enabled? (Yes, line 505)
2. ✅ Is `expand: ['shipping_details']` included? (Yes, line 129, 602)
3. ✅ Is address saved to order? (Check server logs)
4. ✅ Does email template access `order.shipping?.address`? (Yes, line 61, 167)

**If all yes, check:**
- Did customer actually fill out address in Stripe?
- Check Stripe dashboard to confirm address was collected
- Check server logs for debug output

### Issue: "Address fields are empty"

**Possible causes:**
1. Customer didn't complete address form in Stripe
2. Stripe didn't collect address (check Stripe dashboard)
3. Address not expanded when retrieving session

**Fix:**
- Ensure `expand: ['shipping_details']` is in both handlers
- Check Stripe dashboard to verify address was collected
- Add more debug logging

### Issue: "Wrong address format"

**Stripe uses:**
- `line1`, `line2` (not `addressLine1`)
- `state` (for both US states and Canadian provinces)
- `postal_code` (not `postalCode` or `zipCode`)
- `country` (ISO code: "CA" or "US")

**Your email template handles both:**
- `state` OR `province`
- `postal_code` OR `postalCode`

This is correct! ✅

---

## Summary

**Your setup is already correct!** ✅

1. ✅ Address collection enabled in Stripe
2. ✅ Address retrieval with `expand: ['shipping_details']`
3. ✅ Address saved to order data
4. ✅ Address displayed in email templates

**If addresses aren't showing:**
1. Check server logs for debug output
2. Verify customer completed address in Stripe
3. Check Stripe dashboard to confirm address was collected
4. Test with a new order

---

## Quick Checklist

- [ ] `shipping_address_collection` enabled in `server.js` (✅ Already done)
- [ ] `expand: ['shipping_details']` in both handlers (✅ Already done)
- [ ] Address saved to order data (✅ Already done)
- [ ] Email template displays address (✅ Already done)
- [ ] Test order placed with address
- [ ] Check server logs for address debug output
- [ ] Verify address in order confirmation email
- [ ] Check Stripe dashboard for address

---

## Need More Help?

If addresses still aren't showing:

1. **Check server logs** for `📦 Shipping address debug`
2. **Check Stripe dashboard** to verify address was collected
3. **Test with a new order** and watch the logs
4. **Check email template** output in server logs

The setup is correct - the issue is likely that the address needs to be collected during checkout, or there's a timing issue with when the address is retrieved.

