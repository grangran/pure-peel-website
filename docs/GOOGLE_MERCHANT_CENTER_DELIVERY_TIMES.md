# Google Merchant Center Delivery Times Configuration

## Your Current Shipping Setup

Based on your website configuration:

### Order Processing
- **Order Cutoff Time:** 2:00 PM EST (Toronto) ✅ (Correct!)
- **Processing Time:** 1-2 business days (Monday-Friday)
- **Orders placed after 2:00 PM:** Processed next business day
- **Weekend orders:** Processed the following Monday

### Actual Shipping Times (Canada)

1. **Regular Parcel:**
   - Transit time: **2-5 business days**
   - Average: **3 business days**

2. **Expedited Parcel:**
   - Transit time: **1-3 business days**
   - Average: **2 business days**

3. **Xpresspost:**
   - Transit time: **Next business day**
   - Average: **1 business day**

## Recommended Google Merchant Center Settings

### Option 1: Use Fastest Service (Xpresspost) - Recommended

**For best customer experience, use your fastest service:**

**Order Cutoff:**
- Time: **2:00 PM**
- Timezone: **(GMT-05:00) Eastern Standard Time (Toronto)** ✅

**Handling Time:**
- Min: **0** days
- Max: **1** day
- Fulfilled: **Mon – Sat** ✅

**Transit Time:**
- Min: **1** day (not 0!)
- Max: **1** day
- Shipped: **Mon – Fri**

**Total Delivery Time:**
- **1-2 business days** (handling 0-1 + transit 1)

### Option 2: Use Average Service (Expedited Parcel)

**More realistic for most customers:**

**Order Cutoff:**
- Time: **2:00 PM**
- Timezone: **(GMT-05:00) Eastern Standard Time (Toronto)** ✅

**Handling Time:**
- Min: **0** days
- Max: **1** day
- Fulfilled: **Mon – Sat** ✅

**Transit Time:**
- Min: **1** day
- Max: **3** days
- Shipped: **Mon – Fri**

**Total Delivery Time:**
- **1-4 business days** (handling 0-1 + transit 1-3)

### Option 3: Use Standard Service (Regular Parcel)

**Most conservative, covers all options:**

**Order Cutoff:**
- Time: **2:00 PM**
- Timezone: **(GMT-05:00) Eastern Standard Time (Toronto)** ✅

**Handling Time:**
- Min: **0** days
- Max: **1** day
- Fulfilled: **Mon – Sat** ✅

**Transit Time:**
- Min: **2** days
- Max: **5** days
- Shipped: **Mon – Fri**

**Total Delivery Time:**
- **2-6 business days** (handling 0-1 + transit 2-5)

## ⚠️ Issue with Your Current Settings

**You have:**
- Transit time: **0-0 days** ❌

**This is incorrect!** Even your fastest service (Xpresspost) takes **1 business day** for transit.

**Fix:**
- Change transit time to at least **1-1 days** (for Xpresspost)
- Or use **1-3 days** (for Expedited)
- Or use **2-5 days** (for Regular Parcel)

## Recommended Configuration

**For Google Merchant Center, I recommend Option 1 (Xpresspost):**

```
Order Cutoff: 2:00 PM EST (Toronto) ✅

Handling Time:
- Min: 0 days
- Max: 1 day
- Fulfilled: Mon – Sat ✅

Transit Time:
- Min: 1 day  ← CHANGE THIS FROM 0!
- Max: 1 day  ← CHANGE THIS FROM 0!
- Shipped: Mon – Fri

Total Delivery Time: 1-2 business days
```

## Why This Matters

**Google uses delivery times to:**
- Show accurate delivery estimates to customers
- Rank products in search results
- Build customer trust

**If you set transit time to 0-0:**
- Google may show "Same day delivery" (not accurate)
- Customers may be disappointed
- Could hurt your seller rating

## Multiple Shipping Services

**If you want to show different delivery times for different services:**

You can set up **multiple shipping services** in Merchant Center:

1. **Xpresspost (Fastest):**
   - Transit: 1-1 days
   - Total: 1-2 business days

2. **Expedited Parcel (Standard):**
   - Transit: 1-3 days
   - Total: 1-4 business days

3. **Regular Parcel (Economy):**
   - Transit: 2-5 days
   - Total: 2-6 business days

**Note:** Google Merchant Center allows you to set different transit times per shipping service in your feed.

## Update Your Feed

After fixing the delivery times in Merchant Center, regenerate your feed:

```bash
node scripts/generateFeedFromCodebase.js xml
```

The feed will include shipping information, but you'll need to update the delivery times in the Merchant Center dashboard.

## Quick Fix

**Change these settings NOW:**

1. **Transit Time:**
   - Min: **0** → Change to **1**
   - Max: **0** → Change to **1** (or 3 for Expedited, 5 for Regular)

2. **Total Delivery Time:**
   - Currently: **0-1 business days**
   - Should be: **1-2 business days** (for Xpresspost)
   - Or: **1-4 business days** (for Expedited)
   - Or: **2-6 business days** (for Regular)

## Summary

✅ **Keep:**
- Order cutoff: 2:00 PM EST
- Handling time: 0-1 days, Mon-Sat

❌ **Change:**
- Transit time: 0-0 → **1-1** (or 1-3, or 2-5)
- Total delivery: 0-1 → **1-2** (or 1-4, or 2-6)

---

**After making these changes, save and wait 24-48 hours for Google to update the delivery estimates in search results.**
