# How to Test Without Paying Money

## Option 1: Use Stripe Test Mode (Recommended - Safest)

### Step 1: Switch to Test Keys

**Frontend (Vercel):**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Find `VITE_STRIPE_PUBLISHABLE_KEY`
4. Change it from `pk_live_...` to `pk_test_...` (your test publishable key)
5. Save and redeploy

**Backend (Render):**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service → Environment
3. Find `STRIPE_SECRET_KEY`
4. Change it from `sk_live_...` to `sk_test_...` (your test secret key)
5. Also update `STRIPE_WEBHOOK_SECRET` to your test webhook secret
6. Render will auto-redeploy

**To get your test keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "View test data" toggle (top right)
3. Go to Developers → API keys
4. Copy the test keys (pk_test_... and sk_test_...)

**To get your test webhook secret:**
1. In Stripe Dashboard (test mode)
2. Go to Developers → Webhooks
3. Click on your webhook endpoint (or create one for test mode)
4. Copy the "Signing secret" (starts with `whsec_`)

---

### Step 2: Test Everything

1. **Go to your website** (`https://purepeelco.com`)
2. **Add items to cart**
3. **Go to checkout**
4. **Apply promo code** `PEEL26FS`
   - ✅ Verify shipping shows $0.00
   - ✅ Verify total = subtotal (not $0.00)
5. **Fill out checkout form**
6. **Use Stripe test card:**
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/25`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP/Postal:** Any valid code (e.g., `12345`)
7. **Complete payment**
8. **Verify:**
   - ✅ Confirmation screen shows with order number
   - ✅ Order confirmation email received (check spam)
   - ✅ Admin notification email received
   - ✅ Order appears in admin dashboard (`/admin`)
   - ✅ Order tracking works
   - ✅ Email doesn't have duplicate item names

---

### Optional: True $0 checkout (test mode only)

With **`sk_test_`** on Render, checkout sessions **allow promotion codes** on Stripe’s hosted page **only when** your site did not attach its own discount coupon (e.g. you skip percentage promos; `PEEL26FS` is OK—it does not use `session.discounts`).

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Test mode** → **Product catalog** → **Coupons** → create a coupon (e.g. **100% off**, once or repeating).
2. Add a **Promotion code** customers can type (e.g. `TESTFREE100`).
3. Run checkout as usual; on the **Stripe** payment page, click **Add promotion code** and enter that code. If the total is **$0**, Stripe completes with **no card** (or **no payment required**).
4. Your **`checkout.session.completed`** webhook still runs: order is saved, **confirmation + admin emails** fire, and **Chit Chats** runs if configured (see below).

---

### Test order confirmation email + Chit Chats tracking

These only run after a **real checkout** completes and the **webhook** processes the session (not the dev-only “Complete free test order” link in local Vite—that never hits Stripe or Render).

| What you want | What to do |
|----------------|------------|
| **Confirmation email** | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on Render; complete checkout; check inbox/spam. |
| **Chit Chats label + tracking** | `CHITCHATS_ACCESS_TOKEN`, `CHITCHATS_CLIENT_ID`, ship-from env vars; **`AUTO_CREATE_SHIPPING_LABELS`** not set to `false` (default is on). Use a **real CA/US-style address** at checkout. |
| **Shipping notification email** | Sent **after** a label is created successfully (separate from confirmation). |
| **Debug** | Render **Logs** for `Chit Chats label`, `Order saved`, `email sent`. Chit Chats staging: optional `CHITCHATS_USE_STAGING=true` if you use their staging API. |

If label creation fails, the order is still saved; confirmation email can still send; check logs for the Chit Chats error message.

---

### Step 3: Switch Back to Live Keys

**Important:** After testing, switch back to LIVE keys for production!

**Frontend (Vercel):**
- Change `VITE_STRIPE_PUBLISHABLE_KEY` back to `pk_live_...`
- Save and redeploy

**Backend (Render):**
- Change `STRIPE_SECRET_KEY` back to `sk_live_...`
- Change `STRIPE_WEBHOOK_SECRET` back to live webhook secret
- Render will auto-redeploy

---

## Option 2: Make a Small Test Purchase (Alternative)

If you don't want to switch keys, you can:

1. **Make a real purchase** (cheapest product ~$9 CAD)
2. **Test everything** (promo code, confirmation, emails, etc.)
3. **Refund it** after testing:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) → Payments
   - Find your test payment
   - Click "Refund" → "Refund full amount"
   - Done!

**Note:** This requires an actual payment, but you get it refunded.

---

## Option 3: Use Stripe Test Mode Locally (For Development)

If you want to test locally without deploying:

1. **Create a `.env.local` file** in your project root:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_API_URL=http://localhost:3001
   ```

2. **Create a `.env` file** in your project root (for backend):
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   # ... other env vars
   ```

3. **Run locally:**
   ```bash
   # Terminal 1 - Backend
   node server.js
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Test at** `http://localhost:5173`

5. **Use test card:** `4242 4242 4242 4242`

---

## What to Test

### ✅ Promo Code Fix
- [ ] Apply `PEEL26FS` at checkout
- [ ] Verify shipping shows $0.00
- [ ] Verify total = subtotal (not $0.00)

### ✅ Confirmation Screen Fix
- [ ] After payment, verify confirmation screen appears
- [ ] Verify order number is displayed
- [ ] Verify no "empty cart" message

### ✅ Email Duplicate Fix
- [ ] Check order confirmation email
- [ ] Verify items don't have duplicate names
- [ ] Verify admin notification email also looks good

### ✅ Order ID Consistency
- [ ] Verify order number in confirmation = order number in admin dashboard
- [ ] Verify order number in email = order number on screen

---

## Quick Test Checklist

**Before Testing:**
- [ ] Switched to test keys (or ready to refund)
- [ ] Test webhook secret configured (if using test mode)
- [ ] Backend redeployed (if using Render)
- [ ] Frontend redeployed (if using Vercel)

**During Testing:**
- [ ] Add item to cart
- [ ] Apply promo code `PEEL26FS`
- [ ] Verify shipping = $0.00, total = subtotal
- [ ] Complete payment with test card
- [ ] Verify confirmation screen appears
- [ ] Check emails for duplicate items
- [ ] Check admin dashboard for order

**After Testing:**
- [ ] Switch back to live keys (if using test mode)
- [ ] Redeploy frontend and backend
- [ ] Verify live site is working

---

## Troubleshooting

### "Invalid card number" error
- Make sure you're using test card in test mode
- Or you're using live card in live mode

### Promo code still makes order free
- Clear browser cache
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check backend logs for free shipping code detection

### Confirmation screen not showing
- Check browser console for errors
- Verify `success=true&session_id=...` in URL after payment
- Check backend logs for session retrieval

### Emails not sending
- Check spam folder
- Verify Resend domain is verified
- Check backend logs for email errors

---

## Recommended: Use Option 1 (Test Mode)

**Why:**
- ✅ Completely free (no charges)
- ✅ No refunds needed
- ✅ Can test multiple times
- ✅ No risk of accidental live charges

**Time needed:** 10-15 minutes (switch keys, test, switch back)
