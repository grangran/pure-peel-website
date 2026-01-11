# Google Merchant Center Shipping Costs Configuration

## How Your Shipping Costs Are Calculated

Based on your current setup, shipping costs depend on **multiple factors**:

### 1. **Service Type** (Base Rate)
- **Regular Parcel:** $12.00 CAD (starting)
- **Expedited Parcel:** $18.00 CAD (starting)
- **Xpresspost:** $22.00 CAD (starting)

### 2. **Weight** (Primary Factor)
- **Under 0.5kg:** Base rate
- **0.5kg - 1kg:** Base rate + $1.50
- **1kg - 2kg:** Base rate + $3.00
- **2kg+:** Base rate + $3.00 + ($2 per additional 0.5kg)

### 3. **Destination** (Remote Areas)
- **Yukon, Northwest Territories, Nunavut:** +25% surcharge
- **All other areas:** Standard rates

## Recommended Google Merchant Center Configuration

Since your shipping depends on **weight + destination + service type**, you have two options:

### Option 1: Weight-Based (Simplest) ⭐ Recommended

**This is the easiest and most accurate for most cases:**

1. **Shipping Cost Type:** Select **"Weight"**
2. **Currency:** **CAD** ✅
3. **Destination Type:** **"Postal Codes"** or **"Regions"**

**Set up weight tiers:**

**For Regular Parcel:**
- 0 - 0.5 kg: $12.00 CAD
- 0.5 - 1 kg: $13.50 CAD ($12 + $1.50)
- 1 - 2 kg: $15.00 CAD ($12 + $3.00)
- 2+ kg: $15.00 + ($2 per 0.5kg) CAD

**For Expedited Parcel:**
- 0 - 0.5 kg: $18.00 CAD
- 0.5 - 1 kg: $19.50 CAD ($18 + $1.50)
- 1 - 2 kg: $21.00 CAD ($18 + $3.00)
- 2+ kg: $21.00 + ($2 per 0.5kg) CAD

**For Xpresspost:**
- 0 - 0.5 kg: $22.00 CAD
- 0.5 - 1 kg: $23.50 CAD ($22 + $1.50)
- 1 - 2 kg: $25.00 CAD ($22 + $3.00)
- 2+ kg: $25.00 + ($2 per 0.5kg) CAD

**Remote Area Surcharge:**
- Create separate zone for: **Y, X postal codes**
- Add 25% to all rates

### Option 2: Advanced Cost Table (Most Accurate)

**If you want to account for all factors:**

1. **Shipping Cost Type:** Select **"Advanced cost table (uncommon)"**
2. **Currency:** **CAD** ✅
3. **Set up table with:**
   - **Weight ranges** (rows)
   - **Destination zones** (columns)
   - **Service types** (separate tables)

**This is more complex but most accurate.**

## Quick Setup Guide

### Step 1: Basic Configuration

1. **Currency:** **CAD** ✅
2. **Order value conditions:** 
   - ❌ Don't select "Free shipping over a specific order value" (unless you offer this)
   - ❌ Don't select "No shipping below a specific order value"

### Step 2: Shipping Cost Type

**Select: "Weight"** ⭐ (Recommended)

**Why Weight?**
- Your rates are primarily weight-based
- Google can calculate this automatically
- Easier to maintain

### Step 3: Destination Setup

**Option A: Postal Codes (More Accurate)**

1. **Destination Type:** **"Postal Codes"**
2. **Create zones:**
   - **Zone 1 (Standard):** All postal codes EXCEPT Y and X
   - **Zone 2 (Remote):** Postal codes starting with Y, X

**Option B: Regions (Simpler)**

1. **Destination Type:** **"Regions"**
2. **Create zones:**
   - **Zone 1 (Standard):** All provinces EXCEPT Yukon, NWT, Nunavut
   - **Zone 2 (Remote):** Yukon, Northwest Territories, Nunavut

### Step 4: Set Up Weight Tiers

**For each shipping service, create weight tiers:**

**Regular Parcel - Standard Zone:**
```
Weight Range        | Cost
0 - 0.5 kg         | $12.00 CAD
0.5 - 1.0 kg       | $13.50 CAD
1.0 - 2.0 kg       | $15.00 CAD
2.0 - 2.5 kg       | $17.00 CAD
2.5 - 3.0 kg       | $19.00 CAD
3.0+ kg            | $19.00 + $2 per 0.5kg
```

**Regular Parcel - Remote Zone (25% surcharge):**
```
Weight Range        | Cost
0 - 0.5 kg         | $15.00 CAD ($12 × 1.25)
0.5 - 1.0 kg       | $16.88 CAD ($13.50 × 1.25)
1.0 - 2.0 kg       | $18.75 CAD ($15.00 × 1.25)
2.0+ kg            | $18.75 + ($2.50 per 0.5kg)
```

**Repeat for Expedited and Xpresspost with their base rates.**

## Simplified Configuration (Easier)

**If the above is too complex, use a simplified approach:**

### Use Flat Rate for Each Service

1. **Shipping Cost Type:** **"Flat rate"**
2. **Set up 3 shipping services:**

**Service 1: Regular Parcel**
- Cost: **$12.00 CAD** (minimum)
- Note: Actual cost varies by weight, but this shows starting price

**Service 2: Expedited Parcel**
- Cost: **$18.00 CAD** (minimum)

**Service 3: Xpresspost**
- Cost: **$22.00 CAD** (minimum)

**Note:** This doesn't show weight-based pricing, but it's simpler and Google will show "Starting at $12 CAD" which is accurate.

## Recommended: Weight-Based Setup

**Here's what I recommend:**

1. ✅ **Currency:** CAD
2. ✅ **Shipping Cost Type:** **Weight**
3. ✅ **Destination Type:** **Regions** (simpler) or **Postal Codes** (more accurate)
4. ✅ **Set up weight tiers** for each service
5. ✅ **Create remote zone** for Yukon/NWT/Nunavut with 25% surcharge

## Example Configuration

**Regular Parcel - Canada (Standard):**
- 0-0.5kg: $12.00
- 0.5-1kg: $13.50
- 1-2kg: $15.00
- 2kg+: $15.00 + $2 per 0.5kg

**Regular Parcel - Remote Areas (Y, X postal codes):**
- 0-0.5kg: $15.00 (25% surcharge)
- 0.5-1kg: $16.88
- 1-2kg: $18.75
- 2kg+: $18.75 + $2.50 per 0.5kg

## Free Shipping (Optional)

**If you want to offer free shipping:**

1. ✅ Check **"Free shipping over a specific order value"**
2. Enter threshold: **$X CAD** (e.g., $50, $75, $100)
3. Set cost: **$0.00 CAD** for orders above threshold

**Note:** Your current setup doesn't show free shipping, so you can skip this unless you plan to offer it.

## Important Notes

1. **Minimum Shipping:** Your base rate is $12 CAD (Regular Parcel)
2. **Weight Calculation:** Google will use product weights from your feed
3. **Remote Areas:** Don't forget the 25% surcharge for Y/X postal codes
4. **Multiple Services:** Set up separate configurations for Regular, Expedited, and Xpresspost

## Update Your Product Feed

After configuring shipping in Merchant Center, make sure your product feed includes:
- Product weights (if available)
- Shipping information in the feed

The feed generation script already includes basic shipping info, but you may want to add weight data.

## Quick Answer

**For the form you're filling out:**

1. **Currency:** **CAD** ✅
2. **Order value conditions:** Leave unchecked (unless you offer free shipping)
3. **Shipping cost type:** **Weight** ⭐ (Recommended)
4. **Destination:** **Regions** or **Postal Codes**
5. **Set up weight tiers** starting at $12 CAD for Regular Parcel

**Or use simplified:**
- **Shipping cost type:** **Flat rate**
- **Cost:** **$12.00 CAD** (for Regular Parcel)
- Set up 3 separate services with different flat rates

---

**The weight-based approach is more accurate, but flat rate is simpler to set up initially.**
