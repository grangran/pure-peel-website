# How to Test Shipping Rates

## Overview

Shipping rates are calculated in real-time when customers enter their shipping address at checkout. The system uses your actual product weights and box dimensions to calculate accurate shipping costs.

## Method 1: Test Through Website (Recommended)

### Step-by-Step Testing:

1. **Go to your website**
   - Visit: `https://purepeelco.com` (or your local dev URL)

2. **Add items to cart**
   - Add different combinations:
     - 1 Small Bag
     - 2 Medium Bags
     - 3 Large Bags
     - Mix of different products

3. **Go to Checkout**
   - Click "Checkout" or open cart and click "Checkout"

4. **Enter Shipping Address**
   - Fill in all required fields:
     - **First Name, Last Name**
     - **Email, Phone**
     - **Address**
     - **City**
     - **Country** (select Canada or United States)
     - **Province/State**
     - **Postal Code/ZIP**

5. **Watch for Shipping Options**
   - Shipping rates should appear automatically after you enter:
     - ✅ Postal code
     - ✅ Province/State
     - ✅ City
     - ✅ Country
   - You should see 3 shipping options (for Canada) or US options (for USA)

6. **Verify the Rates**
   - Check that rates make sense based on:
     - Number of items in cart
     - Destination (local vs remote)
     - Weight of items

### What to Check:

✅ **Shipping options appear** (should see 3 options for Canada)
✅ **Rates are reasonable** (not $0, not extremely high)
✅ **Different destinations show different rates** (test Toronto vs Vancouver vs remote areas)
✅ **Different cart sizes show different rates** (1 item vs 5 items)
✅ **US addresses show US shipping options**

---

## Method 2: Test API Directly (Advanced)

### Using cURL (Terminal):

**Test Canadian Address:**
```bash
curl -X POST https://pure-peel-website.onrender.com/api/get-shipping-rates \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {
      "postalCode": "M5H 2N2",
      "city": "Toronto",
      "province": "ON",
      "country": "Canada"
    },
    "cartItems": [
      {
        "id": "orange-small",
        "name": "Orange",
        "variant": "Small Bag (20 pcs)",
        "price": 9,
        "quantity": 2
      }
    ]
  }'
```

**Test US Address:**
```bash
curl -X POST https://pure-peel-website.onrender.com/api/get-shipping-rates \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {
      "postalCode": "10001",
      "city": "New York",
      "province": "NY",
      "country": "United States"
    },
    "cartItems": [
      {
        "id": "orange-medium",
        "name": "Orange",
        "variant": "Medium Bag (40 pcs)",
        "price": 17,
        "quantity": 1
      }
    ]
  }'
```

**Test Large Order:**
```bash
curl -X POST https://pure-peel-website.onrender.com/api/get-shipping-rates \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {
      "postalCode": "V6B 1A1",
      "city": "Vancouver",
      "province": "BC",
      "country": "Canada"
    },
    "cartItems": [
      {
        "id": "orange-large",
        "name": "Orange",
        "variant": "Large Bag (75 pcs)",
        "price": 32,
        "quantity": 3
      },
      {
        "id": "lemon-medium",
        "name": "Lemon",
        "variant": "Medium Bag (50 pcs)",
        "price": 20,
        "quantity": 2
      }
    ]
  }'
```

### Expected Response:

```json
{
  "options": [
    {
      "id": "regular",
      "name": "Regular Parcel",
      "price": 12.00,
      "estimatedDays": "2-5 business days",
      "description": "Standard delivery"
    },
    {
      "id": "expedited",
      "name": "Expedited Parcel",
      "price": 18.00,
      "estimatedDays": "1-3 business days",
      "description": "Faster delivery"
    },
    {
      "id": "xpresspost",
      "name": "Xpresspost",
      "price": 22.00,
      "estimatedDays": "Next business day",
      "description": "Express delivery"
    }
  ]
}
```

---

## Method 3: Test with Browser Developer Tools

1. **Open your website** in Chrome/Firefox
2. **Open Developer Tools** (F12 or Cmd+Option+I)
3. **Go to Network tab**
4. **Add items to cart and go to checkout**
5. **Enter shipping address**
6. **Watch for API call:**
   - Look for: `get-shipping-rates`
   - Click on it to see:
     - **Request** (what was sent)
     - **Response** (what was received)
     - **Status** (should be 200)

### What to Check in Network Tab:

✅ **Request URL:** Should be `/api/get-shipping-rates`
✅ **Request Method:** Should be `POST`
✅ **Request Payload:** Should include destination and cartItems
✅ **Response Status:** Should be `200 OK`
✅ **Response Body:** Should contain shipping options array

---

## Test Scenarios

### Scenario 1: Small Order (1-2 items)
- **Cart:** 1 Small Bag
- **Expected:** Small box (23×15×13 cm), weight ~0.175 kg
- **Rate:** Should be base rate (around $12-18 CAD)

### Scenario 2: Medium Order (3-5 items)
- **Cart:** 3 Medium Bags
- **Expected:** Small box (23×15×13 cm), weight ~0.52 kg
- **Rate:** Should include weight surcharge (+$1.50 for 0.5-1kg tier)

### Scenario 3: Large Order (6+ items)
- **Cart:** 5 Large Bags
- **Expected:** Large box (27×25×15 cm), weight ~1.9 kg
- **Rate:** Should include weight surcharge (+$3.00 for 1-2kg tier)

### Scenario 4: Remote Area (Yukon/NWT)
- **Cart:** 2 Medium Bags
- **Destination:** Whitehorse, YT (Y1A postal code)
- **Expected:** Base rate + 25% remote area surcharge

### Scenario 5: US Address
- **Cart:** 1 Large Bag
- **Destination:** New York, NY (10001)
- **Expected:** US shipping options (Tracked Packet, Xpresspost, Priority Worldwide)

---

## Troubleshooting

### Issue: No shipping options appear
**Check:**
- ✅ All address fields filled (postal code, city, province, country)
- ✅ Valid postal code format (A1A 1A1 for Canada, 12345 for US)
- ✅ Backend server is running
- ✅ Check browser console for errors
- ✅ Check Network tab for failed API calls

### Issue: Shipping rates seem wrong
**Check:**
- ✅ Product weights are correct in code
- ✅ Box dimensions are correct
- ✅ Canada Post API credentials (if using real-time rates)
- ✅ Origin postal code is set correctly in environment variables

### Issue: API returns error
**Check:**
- ✅ Backend logs (Render dashboard)
- ✅ Request format is correct
- ✅ All required fields are present
- ✅ Postal code validation is passing

---

## Verify Weight Calculations

The system calculates weight as:
1. **Product Weight:** Sum of all items × their individual weights
2. **Box Selection:** Based on item count (1-5 items = Small, 6+ = Large)
3. **Packaging Weight:** Added based on box size
4. **Total Weight:** Product + Packaging

**Example Calculation:**
- 2 Small Bags: `2 × 0.075 kg = 0.15 kg`
- Small box packaging: `+ 0.1 kg`
- **Total: 0.25 kg** → Under 0.5kg tier (base rate only)

---

## Check Backend Logs

To see what's happening on the backend:

1. **Go to Render Dashboard**
2. **Select your backend service**
3. **Click "Logs" tab**
4. **Look for:**
   - `🌍 Shipping rate request - Country: ...`
   - `📦 Package weight: ...`
   - `📏 Package dimensions: ...`
   - `💰 Shipping rate calculated: ...`

---

## Quick Test Checklist

- [ ] Test with 1 item (Small box)
- [ ] Test with 3 items (Small box)
- [ ] Test with 6 items (Large box)
- [ ] Test Canadian address (Toronto)
- [ ] Test Canadian remote address (Yukon)
- [ ] Test US address (New York)
- [ ] Verify rates change with different cart sizes
- [ ] Verify rates change with different destinations
- [ ] Check browser console for errors
- [ ] Check backend logs for calculation details

---

## Need Help?

If shipping rates aren't working:
1. Check browser console (F12 → Console tab)
2. Check Network tab for API calls
3. Check backend logs in Render
4. Verify environment variables are set correctly
5. Test API directly with cURL to isolate the issue
