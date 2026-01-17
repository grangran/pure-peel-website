# Canada Post Account Requirements for Automatic Label Creation

**Last Updated:** January 2025

---

## 🔍 Account Type Requirements

### **For Shipping Rate Calculation (API Rates):**
✅ **Developer Account is sufficient**
- You can get real-time shipping rates with just a **free Canada Post Developer account**
- No commercial account needed
- Works with sandbox (testing) and production credentials

### **For Automatic Shipping Label Creation:**
⚠️ **Commercial/Contract Account is typically required**
- Creating shipping labels via API usually requires a **commercial Canada Post account**
- This is a paid account with a contract number
- Allows you to pay by account (not credit card per label)

---

## 📋 What You Can Do Without a Commercial Account

### ✅ **Option 1: Use Estimated Shipping Rates (Current Setup)**
- System calculates shipping costs based on weight/dimensions
- No Canada Post API needed
- Works perfectly for checkout
- **You manually create labels** when orders come in

### ✅ **Option 2: Use Real-Time Rates (Developer Account)**
- Get accurate shipping rates from Canada Post API
- Requires free Developer account
- Still need to **manually create labels**

### ✅ **Option 3: Manual Label Creation**
- Create labels via Canada Post website or Shipping Manager
- Add tracking numbers manually in admin dashboard
- Send shipping notification emails manually

---

## 🚫 Disable Automatic Label Creation

If you don't have a commercial account, **disable automatic label creation**:

### **In Render Environment Variables:**
```env
AUTO_CREATE_SHIPPING_LABELS=false
```

This will:
- ✅ Still save orders when payment is received
- ✅ Still send order confirmation emails
- ✅ Still calculate shipping rates (if API configured)
- ❌ **Won't** try to create labels automatically
- ❌ **Won't** send automatic shipping notification emails

---

## 📦 Manual Label Creation Workflow

### **Step 1: Receive Order**
- Order comes in via Stripe
- Order confirmation email sent automatically
- Order saved in admin dashboard

### **Step 2: Create Label Manually**
1. Go to [Canada Post Shipping Manager](https://www.canadapost-postescanada.ca/cpc/en/business/manage-shipments/shipping-manager.page)
2. Or use Canada Post website
3. Enter shipping address from order
4. Select shipping method
5. Create and print label
6. Get tracking number

### **Step 3: Update Order in Admin Dashboard**
1. Go to `/admin`
2. Find the order
3. Update status to "shipped"
4. Add tracking number
5. **Shipping notification email will be sent automatically** ✅

---

## 💰 Getting a Commercial Canada Post Account

If you want automatic label creation, you'll need:

### **Requirements:**
- Business registration (if applicable)
- Canada Post commercial account application
- Contract number (provided after account setup)
- Monthly minimums may apply (check with Canada Post)

### **Benefits:**
- ✅ Automatic label creation via API
- ✅ Better shipping rates (negotiated)
- ✅ Pay by account (not per-label credit card)
- ✅ Bulk shipping discounts
- ✅ Integration with shipping software

### **How to Apply:**
1. Contact Canada Post Business Sales: **1-866-511-0546**
2. Or visit: https://www.canadapost-postescanada.ca/cpc/en/business/get-started.page
3. Request a commercial shipping account
4. They'll provide:
   - Customer number
   - Contract number (for API)
   - Account setup instructions

---

## 🔧 Current System Configuration

### **What Works Now (Without Commercial Account):**

✅ **Shipping Rate Calculation:**
- Uses estimated rates OR
- Uses real-time API rates (with Developer account)

✅ **Order Processing:**
- Orders saved automatically
- Order confirmation emails sent
- Admin notifications sent

✅ **Manual Label Creation:**
- Create labels via Canada Post website
- Update orders in admin dashboard
- Shipping notification emails sent when you mark as "shipped"

### **What Requires Commercial Account:**

❌ **Automatic Label Creation:**
- Creating labels via API automatically
- Getting tracking numbers without manual entry
- Fully automated shipping workflow

---

## 📝 Recommended Setup (Without Commercial Account)

### **Environment Variables (Render):**

```env
# Disable automatic label creation
AUTO_CREATE_SHIPPING_LABELS=false

# Keep these for shipping rate calculation (optional)
CANADA_POST_USERNAME=your_username
CANADA_POST_PASSWORD=your_password
CANADA_POST_CUSTOMER_NUMBER=your_customer_number
CANADA_POST_USE_PRODUCTION=true
```

### **Workflow:**
1. ✅ Customer places order → Payment processed
2. ✅ Order confirmation email sent automatically
3. ✅ You receive admin notification email
4. 📦 **You create label manually** (Canada Post website)
5. ✅ **You update order in admin dashboard** → Mark as "shipped" + add tracking
6. ✅ **Shipping notification email sent automatically** ✅

---

## 🎯 Summary

**You're correct** - automatic label creation typically requires a commercial account.

**But you can still:**
- ✅ Use the system without automatic labels
- ✅ Get shipping rates (estimated or API)
- ✅ Process orders automatically
- ✅ Send shipping emails (when you manually mark as shipped)
- ✅ Create labels manually and update tracking

**The system is designed to work either way!**

---

## 🔄 Next Steps

1. **Set `AUTO_CREATE_SHIPPING_LABELS=false`** in Render
2. **Test the manual workflow:**
   - Place a test order
   - Create label manually
   - Update order in admin dashboard
   - Verify shipping email is sent

3. **If you want automatic labels later:**
   - Apply for commercial Canada Post account
   - Get contract number
   - Set `CANADA_POST_CONTRACT_NUMBER` in Render
   - Set `AUTO_CREATE_SHIPPING_LABELS=true`

---

**Questions?** The system will work great either way - automatic labels are just a convenience feature!
