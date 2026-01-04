# How to Get Alerts When Orders Come In

## How It Works

Your system **already sends email alerts** when orders are placed! Here's what happens:

1. **Customer places order** → Payment processed via Stripe
2. **Order is saved** → Backend saves order details
3. **Two emails are sent automatically:**
   - ✅ **Customer email:** Order confirmation to customer
   - ✅ **Admin email:** Alert to you (sent to `ADMIN_EMAIL`)

## What You Need to Configure

### Step 1: Set Admin Email in Render

1. Go to: https://dashboard.render.com
2. Select your **pure-peel-website** service
3. Go to **Environment** → **Environment Variables**
4. Add or update:
   ```
   ADMIN_EMAIL=your-email@gmail.com
   ```
   (Replace with your actual email address)

5. **Also make sure you have:**
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=orders@purepeelco.com
   ```

6. Click **Save Changes**
7. Render will automatically redeploy

### Step 2: Verify Email Setup

After adding `ADMIN_EMAIL`, test it:

1. Place a test order on your website
2. Check your email inbox (and spam folder)
3. You should receive:
   - **Subject:** `🛒 New Order: [ORDER_ID] - $[AMOUNT] CAD`
   - **Content:** Order details, customer info, items, shipping address

## What the Admin Email Contains

The admin notification email includes:

- ✅ **Order Number**
- ✅ **Customer Name, Email, Phone**
- ✅ **Order Total**
- ✅ **All Items** (with quantities and prices)
- ✅ **Shipping Address**
- ✅ **Payment Status**
- ✅ **Order Notes** (if any)

## Email Delivery

**The email is sent via Resend** to your `ADMIN_EMAIL` address.

**Make sure:**
- ✅ `ADMIN_EMAIL` is set in Render
- ✅ `RESEND_API_KEY` is set in Render
- ✅ `RESEND_FROM_EMAIL` is set in Render
- ✅ Your domain is verified in Resend (optional but recommended)

## Troubleshooting

### Issue: Not receiving order alerts

**Check:**
1. `ADMIN_EMAIL` is set correctly in Render
2. `RESEND_API_KEY` is set in Render
3. `RESEND_FROM_EMAIL` is set in Render
4. Check your spam folder
5. Check Render logs for email errors

### Issue: Emails going to spam

**Solution:**
1. Verify your domain in Resend
2. Use verified domain email (e.g., `orders@purepeelco.com`)
3. Mark Resend emails as "Not spam" in Gmail
4. Add Resend to your contacts

### Issue: Want multiple email addresses

**Current setup:** Sends to one `ADMIN_EMAIL`

**Options:**
1. Use a Gmail filter to forward to multiple addresses
2. Use a group email (e.g., `orders@purepeelco.com` → forwards to multiple people)
3. Modify code to send to multiple addresses (requires code change)

## Alternative: Check Orders in Admin Panel

You can also check orders manually:

1. Go to: `https://purepeelco.com/admin`
2. View all orders
3. See order details, status, etc.

But **email alerts are automatic** - you'll know immediately when an order comes in!

## Summary

**To get order alerts:**

1. ✅ Set `ADMIN_EMAIL=your-email@gmail.com` in Render
2. ✅ Make sure Resend is configured (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
3. ✅ That's it! You'll automatically receive email alerts for every order

**The system already does this** - you just need to configure the `ADMIN_EMAIL` environment variable!

