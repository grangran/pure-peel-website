# Enable Stripe Email Receipts

## Yes! Stripe Can Send Receipts Directly to Customers

Stripe has built-in email receipt functionality that sends receipts automatically to customers after successful payments.

---

## Option 1: Enable in Stripe Dashboard (Easiest) ⭐

### Step 1: Go to Stripe Settings

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com
   - Log in to your account

2. **Navigate to Email Settings:**
   - Click **"Settings"** (gear icon in left sidebar)
   - Click **"Customer emails"** or **"Email Receipts"**

### Step 2: Enable Email Receipts

**Enable these options:**
- ✅ **"Successful payments"** - Send receipt when payment succeeds
- ✅ **"Failed payments"** (optional) - Send email if payment fails
- ✅ **"Refunds"** (optional) - Send email when refunded

**What customers receive:**
- Transaction details
- Payment amount
- Payment method
- Transaction date
- Receipt number
- Link to view receipt online

---

## Option 2: Enable in Code (More Control)

You can also enable receipts in your checkout session code:

### Add to Checkout Session

In `server.js`, when creating the checkout session, you can add:

```javascript
const sessionConfig = {
  // ... existing config
  customer_email: shippingInfo.email, // ✅ Already set
  // Stripe automatically sends receipts when customer_email is set
  // No additional code needed!
}
```

**Note:** Stripe automatically sends receipts when `customer_email` is set (which you already have on line 505).

---

## Option 3: Enable Invoice Creation (PDF Receipts)

If you want PDF invoices/receipts:

### Add to Checkout Session

```javascript
const sessionConfig = {
  // ... existing config
  invoice_creation: {
    enabled: true,
    invoice_data: {
      description: `Order from Pure Peel Co.`,
      metadata: {
        order_id: orderId,
      },
    },
  },
}
```

**What this does:**
- Creates an invoice for the payment
- Sends email with PDF invoice attached
- Customer gets both receipt and invoice

---

## Current Setup

**You're already set up for Stripe receipts:**
- ✅ `customer_email` is set in checkout session (line 505)
- ✅ Stripe should automatically send receipts

**But you might need to enable it in Dashboard:**
- Go to Settings → Customer emails
- Enable "Successful payments"

---

## Stripe Receipts vs. Your Custom Emails

**You'll have BOTH:**

1. **Stripe Receipt** (automatic):
   - Sent by Stripe
   - Basic transaction details
   - Receipt number
   - Payment confirmation

2. **Your Custom Email** (via Resend):
   - Sent by your backend
   - Full order details
   - Shipping address
   - Tracking information
   - Custom branding

**Both are useful:**
- Stripe receipt = Official payment confirmation
- Your email = Full order details and shipping info

---

## Customize Stripe Receipts

### Add Your Branding

1. **Go to Stripe Dashboard:**
   - Settings → Branding

2. **Customize:**
   - Upload your logo
   - Set brand colors
   - Add business information

**This affects:**
- Email receipts
- Receipt pages
- Invoice PDFs

---

## Test It

1. **Place a test order**
2. **Check customer email:**
   - Should receive Stripe receipt (if enabled in Dashboard)
   - Should receive your custom confirmation email (via Resend)

---

## Summary

**To enable Stripe email receipts:**

1. ✅ **In Dashboard:** Settings → Customer emails → Enable "Successful payments"
2. ✅ **In Code:** Already set (customer_email is configured)
3. ✅ **Optional:** Add invoice_creation for PDF invoices

**Result:**
- Customers get Stripe receipt automatically
- Customers also get your custom confirmation email
- Both emails serve different purposes

---

## Quick Checklist

- [ ] Go to Stripe Dashboard → Settings → Customer emails
- [ ] Enable "Successful payments"
- [ ] (Optional) Add branding (logo, colors)
- [ ] (Optional) Enable invoice_creation in code for PDFs
- [ ] Test with a new order
- [ ] Verify customer receives both emails

