# How Shipping Works on Your Website

## Overview

Your website uses **dynamic shipping rate calculation** based on the customer's address and cart contents. Rates are calculated in real-time when customers enter their shipping information at checkout.

## How It Works - Step by Step

### 1. Customer Adds Items to Cart
- Customer browses products and adds items to cart
- Each product variant has a weight assigned (Mini: 0.05kg, Small: 0.1kg, Medium: 0.2kg, Large: 0.35kg, Clear Box: 0.2kg)

### 2. Customer Goes to Checkout
- Customer clicks "Checkout" or "View Cart" → "Checkout"
- Checkout page loads with form fields

### 3. Customer Enters Shipping Address
- Customer fills in:
  - **First Name, Last Name**
  - **Email, Phone**
  - **Address**
  - **City**
  - **Country** (Canada or United States)
  - **Province/State**
  - **Postal Code/ZIP**

### 4. Shipping Rates Are Fetched Automatically
**When shipping rates are calculated:**
- ✅ Customer enters **postal code**
- ✅ Customer selects **province/state**
- ✅ Customer enters **city**
- ✅ Customer selects **country**
- ✅ Cart has items

**What happens:**
1. Frontend sends request to: `/api/get-shipping-rates`
2. Backend receives:
   - Destination address (postal code, city, province, country)
   - Cart items (to calculate weight)
3. Backend calculates:
   - **Package weight** (sum of all items)
   - **Package dimensions** (based on item count)
   - **Shipping origin** (from environment variables)

### 5. Shipping Options Appear
**Shipping options are shown only after:**
- ✅ All shipping address fields are filled
- ✅ Valid postal code entered
- ✅ Rates successfully fetched

**Two shipping options appear (Canada and US each have two tiers):**
- **Canada:** Tracked Parcel and Expedited Tracked (estimates from `utils/chitchatsShipping.js`)
- **United States:** Standard (USPS) and Expedited (USPS Priority) — fulfilled via Chit Chats, delivered by USPS

### 6. Customer Selects Shipping Method
- Customer clicks on preferred shipping option
- Selected shipping cost is added to order total
- Customer proceeds to payment

## Shipping Cost Calculation

### Factors That Affect Shipping Cost

1. **Package Weight** (Primary Factor)
   - Calculated from cart items
   - Weight tiers:
     - **0 - 0.5kg:** Base rate
     - **0.5 - 1kg:** Base + $1.50
     - **1 - 2kg:** Base + $3.00
     - **2kg+:** Base + $3.00 + ($2 per 0.5kg)

2. **Destination** (Location)
   - **Standard areas:** Regular rates
   - **Remote areas (Yukon, NWT, Nunavut):** +25% surcharge
   - **United States:** Different rate structure

3. **Service Type** (Speed)
   - **Regular Parcel:** $12 base
   - **Expedited Parcel:** $18 base
   - **Xpresspost:** $22 base

### Example Calculation

**Scenario:** Customer orders 2 Medium Bags (0.2kg each = 0.4kg total) to Toronto, ON

1. **Weight:** 0.4kg (under 0.5kg tier)
2. **Destination:** Toronto (standard area, no surcharge)
3. **Service:** Regular Parcel
4. **Cost:** $12.00 CAD (base rate, no weight surcharge)

**Scenario:** Customer orders 5 Large Bags (0.35kg each = 1.75kg total) to Whitehorse, YT

1. **Weight:** 1.75kg (1-2kg tier = +$3.00)
2. **Destination:** Yukon (remote area = +25% surcharge)
3. **Service:** Regular Parcel
4. **Cost:** ($12.00 + $3.00) × 1.25 = **$18.75 CAD**

## Shipping rate source

Checkout rates come from **`getShippingRates()`** in `utils/chitchatsShipping.js`: flat **estimates** by destination country and cart weight (not live API quotes). Adjust those numbers there if your Chit Chats costs change.

**Labels after payment:** `createChitChatsLabel()` in the same file (Stripe webhooks in `server.js`) when `AUTO_CREATE_SHIPPING_LABELS` is not `false`.

**Environment variables (Chit Chats):**
```env
CHITCHATS_ACCESS_TOKEN=...
CHITCHATS_CLIENT_ID=...
# Optional: SHIPPING_ORIGIN_* — see file header in chitchatsShipping.js
```

## Shipping Options by Destination

### Canada

1. **Regular Parcel**
   - Cost: $12+ CAD (weight-based)
   - Time: 2-5 business days
   - Features: Standard delivery, tracking available

2. **Expedited Parcel**
   - Cost: $18+ CAD (weight-based)
   - Time: 1-3 business days
   - Features: Faster delivery, tracking included

3. **Xpresspost**
   - Cost: $22+ CAD (weight-based)
   - Time: Next business day
   - Features: Express delivery, signature required

### United States

1. **Tracked Packet - USA**
   - Cost: $18+ CAD (weight-based)
   - Time: 4-7 business days
   - Features: Standard delivery with tracking

2. **Xpresspost - USA**
   - Cost: $28+ CAD (weight-based)
   - Time: 2-3 business days
   - Features: Faster delivery with tracking and insurance

3. **Priority Worldwide - USA**
   - Cost: $45+ CAD (weight-based)
   - Time: 1-2 business days
   - Features: Express delivery with signature

## Order Processing & Shipping

### Processing Time
- **Orders placed before 2:00 PM EST:** Processed within 24 hours
- **Orders placed after 2:00 PM EST:** Processed next business day
- **Weekend orders:** Processed the following Monday
- **Processing days:** Monday-Friday (excluding holidays)

### Shipping Timeline Example

**Order placed Monday 10:00 AM EST:**
- ✅ Processed: Monday (same day)
- ✅ Shipped: Monday or Tuesday
- ✅ Delivery: 
  - Xpresspost: Tuesday (next business day)
  - Expedited: Tuesday-Thursday (1-3 days)
  - Regular: Wednesday-Friday (2-5 days)

**Order placed Friday 3:00 PM EST:**
- ✅ Processed: Monday (next business day)
- ✅ Shipped: Monday or Tuesday
- ✅ Delivery: 
  - Xpresspost: Tuesday (next business day)
  - Expedited: Tuesday-Thursday
  - Regular: Wednesday-Friday

## Technical Details

### Frontend (Checkout.jsx)

**Shipping rate fetching:**
- Triggered when: postal code, province, city, country are all filled
- API call: `POST /api/get-shipping-rates`
- Request includes: destination address + cart items
- Response: Array of shipping options with prices

**State management:**
- Shipping options stored in state
- Selected shipping option saved to localStorage
- Form data persisted across page refreshes

### Backend (server.js)

**Shipping rate endpoint:**
- Route: `/api/get-shipping-rates`
- Method: POST
- Rate limiting: 20 requests per 15 minutes per IP

**Calculation process:**
1. Validates destination address (middleware)
2. Calls `getShippingRates(destination, cartItems)` in `utils/chitchatsShipping.js`
3. Returns the option list (flat estimates by country + weight)

### Weight Calculation

**Per item weights:**
- Mini Bag: 0.05 kg (50g)
- Small Bag: 0.1 kg (100g)
- Medium Bag: 0.2 kg (200g)
- Large Bag: 0.35 kg (350g)
- Clear Box: 0.2 kg (200g)

**Total weight:** Sum of (item weight × quantity) for all items

### Dimension Calculation

**Based on item count:**
- 1-3 items: 20cm × 15cm × 5cm
- 4-8 items: 25cm × 20cm × 8cm
- 9+ items: 30cm × 25cm × 10cm

## User Experience Flow

1. **Customer adds items** → Cart
2. **Clicks checkout** → Checkout page
3. **Fills shipping form** → Name, email, address, etc.
4. **Enters postal code** → System waits for complete address
5. **Completes address** → Shipping rates automatically fetch
6. **Sees shipping options** → 3 options with prices and times
7. **Selects shipping method** → Cost added to total
8. **Proceeds to payment** → Stripe checkout

## Important Features

### ✅ Automatic Rate Fetching
- No "Calculate Shipping" button needed
- Rates appear automatically when address is complete
- Real-time calculation

### ✅ Address Validation
- Canadian postal code format validation
- US ZIP code format validation
- Province/state required

### ✅ Weight-Based Pricing
- Accurate costs based on actual package weight
- Fair pricing for customers

### ✅ Remote Area Handling
- Automatic 25% surcharge for Yukon, NWT, Nunavut
- Transparent pricing

### ✅ Multiple Destinations
- Canada: 3 shipping options
- United States: 3 shipping options
- Different rate structures for each country

### ✅ State Persistence
- Shipping address saved to localStorage
- Selected shipping option remembered
- Survives page refreshes

## Shipping Cost Breakdown

### Canada - Regular Parcel Example

**Base Rate:** $12.00 CAD

**Weight Adjustments:**
- 0-0.5kg: +$0.00
- 0.5-1kg: +$1.50
- 1-2kg: +$3.00
- 2kg+: +$3.00 + ($2 per 0.5kg)

**Remote Surcharge:**
- Y/X postal codes: +25%

**Final Cost = (Base + Weight Adjustment) × (1 + Remote Surcharge)**

## Summary

**Your shipping system:**
- ✅ **Dynamic:** Rates calculated in real-time
- ✅ **Accurate:** Based on weight, destination, and service
- ✅ **Automatic:** No manual calculation needed
- ✅ **Flexible:** Supports Canada and US
- ✅ **Transparent:** Shows all options with prices and times

**Key Points:**
- Rates appear automatically when address is complete
- Costs vary by weight, destination, and service type
- Remote areas (Yukon, NWT, Nunavut) have 25% surcharge
- Processing time: 1-2 business days (orders before 2 PM EST processed same day)
- Shipping time: 1-5 business days depending on service

---

**Need to adjust shipping rates?** Update the base rates in `server.js` in the `calculateEstimatedRate` function.
