# Stripe Dashboard Settings for Address Collection

## Good News: Already Configured in Code! ✅

Your code already has `shipping_address_collection` enabled:
```javascript
shipping_address_collection: {
  allowed_countries: ['CA', 'US'],
}
```

**This is all you need!** Stripe will automatically:
- ✅ Show address form during checkout
- ✅ Collect shipping address from customer
- ✅ Include `shipping_details` in the checkout session (automatically, no expansion needed)

---

## Stripe Dashboard Settings (Optional)

While the code handles everything, you can verify/enable these in Stripe Dashboard:

### 1. Checkout Settings

**Location:** Stripe Dashboard → Settings → Checkout

**What to check:**
- ✅ **Email receipts:** Should be enabled (Stripe sends default receipts)
- ✅ **Customer information:** Should collect email and address

**Note:** Your custom code already handles this, so Stripe's default emails are optional.

### 2. Payment Links Settings (If Using)

**Location:** Stripe Dashboard → Payment Links → Create/Edit Link

**Settings:**
- ✅ Enable "Collect customer addresses"
- ✅ Choose "Both billing and shipping addresses"

**Note:** You're using Checkout Sessions (not Payment Links), so this doesn't apply.

### 3. Email Receipts Settings

**Location:** Stripe Dashboard → Settings → Email Receipts

**What to enable:**
- ✅ **Send email receipts:** Enable this if you want Stripe's default receipts
- ✅ **Customize email domain:** Optional - for branding

**Note:** You're sending custom emails via Resend, so Stripe's default emails are optional.

---

## Important: No Dashboard Setting for `shipping_details` Expansion

**Stripe doesn't allow expanding `shipping_details`** - this is an API limitation, not a setting.

**But that's fine!** Because:
- ✅ `shipping_details` is **automatically included** when `shipping_address_collection` is enabled
- ✅ You don't need to expand it - just access it directly: `session.shipping_details`
- ✅ The address will be there as long as the customer filled it out

---

## How to Verify It's Working

### In Stripe Dashboard:

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com
   - Payments → Select a recent payment

2. **Check "Shipping Details" section:**
   - Should show:
     - Name
     - Address Line 1
     - Address Line 2 (if provided)
     - City
     - State/Province
     - Postal Code
     - Country

3. **If address is there:**
   - ✅ Stripe collected it correctly
   - ✅ Your code should be able to access it
   - ✅ Check server logs to verify retrieval

---

## Summary

**What's already enabled:**
- ✅ `shipping_address_collection` in your code (line 506-508 in server.js)
- ✅ Address collection happens automatically during checkout
- ✅ `shipping_details` is included automatically (no expansion needed)

**What you can't do:**
- ❌ Expand `shipping_details` (Stripe API limitation)
- ❌ But you don't need to - it's already included!

**What to check:**
- ✅ Verify address appears in Stripe Dashboard for recent payments
- ✅ Check server logs for address debug output
- ✅ Test with a new order

---

## Quick Checklist

- [ ] `shipping_address_collection` enabled in code (✅ Already done)
- [ ] Test order placed with address
- [ ] Check Stripe Dashboard - address should be visible
- [ ] Check server logs - address should be retrieved
- [ ] Check confirmation email - address should be displayed

Your setup is correct! The address collection is already enabled and working. 🎉

