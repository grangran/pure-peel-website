# Email Flow and Structure Guide

**Last Updated:** January 2025

---

## 📧 Email Flow Overview

Your website sends **3 types of emails**:

1. **Order Confirmation** - Sent immediately after payment
2. **Shipping Notification** - Sent when package ships
3. **Admin Notification** - Sent to you when a new order is placed

---

## 1️⃣ Order Confirmation Email

### **When is it sent?**
- ✅ **Automatically** when payment is successful
- ✅ Sent via Stripe webhook (`checkout.session.completed` event)
- ✅ Sent immediately after customer completes payment

### **What triggers it?**
- Customer completes payment on Stripe checkout page
- Stripe sends webhook to your backend
- Backend processes payment and sends confirmation email

### **Email Structure:**

**Subject:** `Order Confirmation - [ORDER_ID] | Pure Peel Co.`

**Content includes:**
- ✅ Order number
- ✅ Order date and time (in customer's timezone)
- ✅ Order status
- ✅ **Items ordered** (name, variant, quantity, price)
- ✅ **Price breakdown:**
  - Subtotal
  - Shipping cost
  - Tax (if applicable)
  - **Total**
- ✅ **Shipping address** (full address)
- ✅ **Shipping method** (e.g., "Tracked Packet - USA")
- ✅ **Tracking number** (if available at time of order)
- ✅ **Track Your Order** button (links to order tracking page)
- ✅ Message: *"We'll send you another email when your order ships with tracking information."*

**Language Support:**
- English (default)
- French (if customer selected French during checkout)

**Template Location:** `utils/emailService.js` - `orderConfirmationTemplateEN()` and `orderConfirmationTemplateFR()`

---

## 2️⃣ Shipping Notification Email

### **When is it sent?**

The shipping notification email is sent in **TWO scenarios**:

#### **Scenario A: Automatic (Requires Commercial Account)**
⚠️ **When:** Canada Post shipping label is automatically created  
⚠️ **Requires:** Commercial Canada Post account with contract number  
✅ **Trigger:** `AUTO_CREATE_SHIPPING_LABELS=true` (default)  
✅ **Timing:** Immediately after label creation (usually within seconds of order confirmation)

**How it works:**
1. Customer completes payment
2. Order confirmation email is sent
3. Backend automatically creates Canada Post shipping label (requires commercial account)
4. **If label creation succeeds** → Shipping notification email is sent automatically
5. **If label creation fails** → No shipping email (you'll need to send manually)

**Note:** If you don't have a commercial account, set `AUTO_CREATE_SHIPPING_LABELS=false` and use manual workflow (Scenario B).

#### **Scenario B: Manual (Admin Dashboard)**
✅ **When:** You manually update order status to "shipped" in admin dashboard  
✅ **Trigger:** Admin action via `/api/admin/orders/:orderId/status` endpoint  
✅ **Timing:** When you click "Mark as Shipped" in admin panel

**How it works:**
1. You log into admin dashboard
2. Find the order
3. Update status to "shipped"
4. Optionally add tracking number
5. Shipping notification email is sent automatically

### **Email Structure:**

**Subject:** `Your Order Has Shipped - [ORDER_ID] | Pure Peel Co.`

**Content includes:**
- ✅ Order number
- ✅ **Tracking number** (if available)
- ✅ Estimated delivery: 3-5 business days
- ✅ **Track Your Order** button (links to order tracking page)
- ✅ Message: *"Great news! Your order has been shipped and is on its way to you."*

**Template Location:** `utils/emailService.js` - `shippingNotificationTemplate()`

---

## 🔍 How to Verify Shipping Emails Are Working

### **Check 1: Automatic Label Creation**

1. **Verify environment variable:**
   ```bash
   # In Render dashboard, check:
   AUTO_CREATE_SHIPPING_LABELS=true
   ```

2. **Check server logs after an order:**
   - Look for: `📦 Attempting to create Canada Post shipping label`
   - Success: `✅ Canada Post label created successfully: [TRACKING_NUMBER]`
   - Then: `✅ Shipping notification email sent via Resend`

3. **If label creation fails:**
   - You'll see: `⚠️  Canada Post label creation failed`
   - **No shipping email will be sent automatically**
   - You'll need to send it manually via admin dashboard

### **Check 2: Manual Shipping Notification**

1. **Go to Admin Dashboard:**
   - Navigate to `/admin`
   - Login with admin password

2. **Find an order:**
   - Look for orders with status "pending" or "processing"

3. **Mark as shipped:**
   - Click "Update Status"
   - Select "shipped"
   - Optionally add tracking number
   - Click "Update"

4. **Verify email sent:**
   - Check server logs: `✅ Shipping notification email sent`
   - Check customer's email inbox

### **Check 3: Email Duplication Prevention**

The system prevents duplicate shipping emails:
- Uses `hasEmailBeenSent(orderId, 'shipping')` to check
- If already sent, it won't send again
- Logs: `ℹ️  Shipping notification email already sent, skipping`

---

## 📋 Email Configuration Checklist

### **Required Environment Variables (Render):**

- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `RESEND_FROM_EMAIL` - `orders@purepeelco.com` (must be verified in Resend)
- ✅ `ADMIN_EMAIL` - `purepeel11@gmail.com` (for admin notifications)
- ✅ `AUTO_CREATE_SHIPPING_LABELS` - `true` (enables automatic label creation)

### **Canada Post Configuration (for automatic shipping emails):**

- ✅ `CANADA_POST_USERNAME` - Production credentials
- ✅ `CANADA_POST_PASSWORD` - Production credentials
- ✅ `CANADA_POST_CUSTOMER_NUMBER` - Your customer number
- ✅ `CANADA_POST_USE_PRODUCTION` - `true`

---

## 🎨 Email Template Customization

### **Order Confirmation Email**

**File:** `utils/emailService.js`  
**Functions:** `orderConfirmationTemplateEN()` and `orderConfirmationTemplateFR()`

**What you can customize:**
- Colors (currently amber/orange gradient)
- Logo/branding
- Message content
- Layout/structure

**Current design:**
- Header: Amber gradient with "🍁 Order Confirmed!"
- Order details box: White with amber left border
- Items list: Clean list format
- Total box: Yellow background
- Shipping address: White box
- Track button: Amber button

### **Shipping Notification Email**

**File:** `utils/emailService.js`  
**Function:** `shippingNotificationTemplate()`

**What you can customize:**
- Colors (currently green gradient)
- Estimated delivery time
- Message content
- Layout/structure

**Current design:**
- Header: Green gradient with "📦 Your Order Has Shipped!"
- Info box: White with green left border
- Track button: Green button

---

## 🚨 Troubleshooting

### **Problem: Shipping email not sent automatically**

**Possible causes:**
1. ❌ `AUTO_CREATE_SHIPPING_LABELS=false` or not set
2. ❌ Canada Post label creation failed (check logs)
3. ❌ Canada Post credentials incorrect
4. ❌ Email already sent (duplicate prevention)

**Solution:**
- Check Render logs for Canada Post errors
- Verify Canada Post credentials
- Send manually via admin dashboard

### **Problem: Order confirmation email not sent**

**Possible causes:**
1. ❌ Stripe webhook not configured
2. ❌ Webhook endpoint not receiving events
3. ❌ Resend API key not configured
4. ❌ Email domain not verified in Resend

**Solution:**
- Check Stripe Dashboard → Webhooks → Events
- Verify webhook endpoint: `https://pure-peel-website.onrender.com/api/webhook`
- Check Resend dashboard for email delivery status

### **Problem: Emails going to spam**

**Solutions:**
1. ✅ Verify domain in Resend dashboard
2. ✅ Use verified sender email (`orders@purepeelco.com`)
3. ✅ Add SPF/DKIM records (Resend provides these)
4. ✅ Warm up your domain (send test emails first)

---

## 📊 Email Tracking

### **Resend Dashboard:**
- Go to [Resend Dashboard](https://resend.com/emails)
- View all sent emails
- Check delivery status
- See open rates (if enabled)

### **Server Logs:**
- Look for: `✅ Shipping notification email sent via Resend to: [EMAIL]`
- Message ID: `[MESSAGE_ID]`
- Check delivery at: `https://resend.com/emails`

---

## 🔄 Email Flow Diagram

```
Customer Completes Payment
         ↓
Stripe Webhook Received
         ↓
Order Saved to Database
         ↓
Order Confirmation Email Sent ✅
         ↓
Admin Notification Email Sent ✅
         ↓
AUTO_CREATE_SHIPPING_LABELS = true?
         ↓ YES
Create Canada Post Label
         ↓
Label Created Successfully?
         ↓ YES
Shipping Notification Email Sent ✅
         ↓
Order Status = "shipped"
```

**Alternative Flow (Manual):**
```
Admin Dashboard
         ↓
Update Order Status to "shipped"
         ↓
Shipping Notification Email Sent ✅
```

---

## 📝 Summary

**Order Confirmation:**
- ✅ Sent automatically after payment
- ✅ Includes full order details
- ✅ Bilingual (EN/FR)

**Shipping Notification:**
- ✅ Sent automatically when label is created (if enabled)
- ✅ OR sent manually when you mark order as "shipped"
- ✅ Includes tracking number
- ✅ Prevents duplicates

**Admin Notification:**
- ✅ Sent automatically for every new order
- ✅ Sent to `ADMIN_EMAIL`

---

**Questions?** Check server logs or Resend dashboard for email delivery status.
