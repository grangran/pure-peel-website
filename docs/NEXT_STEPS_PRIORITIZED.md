# Next Steps - Prioritized Action Plan

**Last Updated:** January 2025  
**Status:** Pre-Launch - Focus on Critical Items

---

## 🔴 **TOP PRIORITY - Do These First**

### 1. **Product Weights & Dimensions** ⚠️ CRITICAL
**Why:** Without accurate weights/dimensions, shipping costs will be wrong, leading to:
- Overcharging customers (bad experience)
- Undercharging customers (you lose money)
- Incorrect shipping labels

**What to do:**
1. **Measure your products:**
   - Weigh each product type (Mini, Small, Medium, Large, Clear Box) in **kilograms**
   - Example: Mini Bag = 0.05kg, Small = 0.1kg, etc.

2. **Measure your boxes:**
   - Measure length, width, height in **centimeters**
   - Weigh empty box + padding + label + tape in **kilograms**
   - Determine max items per box

3. **Update the code:**
   - I can help you update `utils/canadaPostShipping.js` and `server.js` once you have the measurements

**Time needed:** 30-60 minutes (measuring) + 10 minutes (code update)

---

### 2. **Add Google Analytics to Vercel** ✅ EASY
**Why:** Track visitors, conversions, and e-commerce events

**What to do:**
1. Go to Vercel Dashboard → pure-peel-website → Settings → Environment Variables
2. Click "Add Environment Variable"
3. Key: `VITE_GA_MEASUREMENT_ID`
4. Value: `G-NM2RKDMKQ4`
5. Select "All Environments"
6. Save and redeploy

**Time needed:** 2 minutes

---

### 3. **Verify Stripe Webhook** ⚠️ IMPORTANT
**Why:** Webhooks process orders automatically. If not configured, orders won't be saved.

**What to do:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Check if webhook exists with endpoint: `https://pure-peel-website.onrender.com/api/webhook`
3. If missing, create it:
   - Click "Add endpoint"
   - URL: `https://pure-peel-website.onrender.com/api/webhook`
   - Events: Select `checkout.session.completed`
   - Copy the "Signing secret" (starts with `whsec_`)
   - Verify it matches `STRIPE_WEBHOOK_SECRET` in Render
4. Test with a test purchase

**Time needed:** 5-10 minutes

---

### 4. **Test Email Notifications** ⚠️ IMPORTANT
**Why:** Customers need order confirmations. You need admin alerts.

**What to do:**
1. **Verify Resend domain:**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Verify `purepeelco.com` is verified (green checkmark)

2. **Test emails:**
   - Make a test purchase (use Stripe test mode)
   - Check that order confirmation email arrives
   - Check that admin notification email arrives
   - Test contact form submission

**Time needed:** 10-15 minutes

---

## 🟡 **HIGH PRIORITY - Do Before Launch**

### 5. **Update Sitemap** 📈 SEO
**Why:** Helps Google find and index all your pages

**What to do:**
- I can update `public/sitemap.xml` to include all pages
- Then submit to Google Search Console

**Time needed:** 5 minutes (I can do this for you)

---

### 6. **Add Contact Information to Footer** 📞 TRUST
**Why:** Builds trust and makes it easy for customers to contact you

**What to do:**
- Add physical address (you have: 5100 Rutherford Rd, Woodbridge, ON L4H 2J2)
- Add phone number (if you have one)
- Add business hours (if applicable)
- Add email: orders@purepeelco.com

**Time needed:** 10 minutes (I can help update Footer.jsx)

---

### 7. **Verify Missing Environment Variables** 🔍
**Check in Render:**
- [ ] `SHIPPING_ORIGIN_PHONE` - Add your phone number
- [ ] `ADMIN_PASSWORD` - Verify it's set (for admin dashboard)

**Time needed:** 2 minutes

---

## 🟢 **MEDIUM PRIORITY - Can Do After Launch**

### 8. **End-to-End Test Purchase** 🧪
**Why:** Verify everything works before real customers

**What to do:**
1. Add product to cart
2. Go through checkout
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete purchase
5. Verify:
   - Order confirmation email received
   - Admin notification email received
   - Order appears in admin dashboard
   - Order tracking works

**Time needed:** 10 minutes

---

### 9. **Mobile Testing** 📱
**Why:** Most customers shop on mobile

**What to do:**
- Test checkout on your phone
- Test cart functionality
- Test all forms
- Verify images load properly

**Time needed:** 15-20 minutes

---

## 📋 **Recommended Order of Work**

### **Today (Before Launch):**
1. ✅ Add Google Analytics to Vercel (2 min)
2. ⚠️ Measure products & boxes (30-60 min)
3. ⚠️ Update weights/dimensions in code (10 min - I can help)
4. ⚠️ Verify Stripe webhook (5-10 min)
5. ⚠️ Test email notifications (10-15 min)
6. 📈 Update sitemap (5 min - I can do this)
7. 📞 Add contact info to footer (10 min - I can help)

### **Before First Real Customer:**
8. 🧪 Complete test purchase (10 min)
9. 📱 Test on mobile (15-20 min)
10. 🔍 Verify missing env variables (2 min)

---

## 🚀 **Quick Wins (I Can Help With These Now)**

If you want, I can help you with:
- ✅ Update sitemap.xml (add all pages)
- ✅ Add contact information to footer
- ✅ Update product weights/dimensions (once you provide measurements)
- ✅ Verify webhook configuration in code

**Just let me know which ones you want me to tackle!**

---

## ❓ **What Do You Want to Work On?**

**Option A:** Give me your product/box measurements → I'll update the code  
**Option B:** I'll update the sitemap and footer contact info now  
**Option C:** You handle the measurements, I'll help with everything else  
**Option D:** Focus on testing (webhook, emails, test purchase)

**What sounds good to you?**
