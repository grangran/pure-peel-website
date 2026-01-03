# Canada Post Shipping Integration Setup

## Overview

The checkout system now includes Canada Post shipping rate calculation. Currently, it uses estimated rates based on destination and package weight. To use real-time rates from Canada Post's API, you'll need to set up API credentials.

## Current Implementation

The system currently provides **estimated shipping rates** for:
- **Regular Parcel** - Standard delivery (5 business days)
- **Expedited Parcel** - Faster delivery with tracking (3 business days)
- **Xpresspost** - Express delivery with signature (2 business days)

Rates are calculated based on:
- Package weight (estimated from cart items)
- Package dimensions (based on item count)
- Destination postal code (remote areas have higher rates)

## Setting Up Real Canada Post API

### Step 1: Register for Canada Post Developer Account

1. Go to https://www.canadapost-postescanada.ca/cpc/en/commercial/integrate-apis.page
2. Click "Register for the Developer Program"
3. Complete the registration form
4. You'll receive API credentials via email

### Step 2: Get Your API Credentials

After registration, you'll receive:
- **Username** (API key)
- **Password** (API secret)
- **Customer Number** (your Canada Post account number)

### Step 3: Add Credentials to Environment Variables

Add these to your `.env` file or Render environment variables:

**For Development/Testing:**
```env
CANADA_POST_USERNAME=39fd860bcf7eff08
CANADA_POST_PASSWORD=6204a45981dc9fd6e826ec
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=false
```

**For Production:**
```env
CANADA_POST_USERNAME=h9e4989e8c7da2594
CANADA_POST_PASSWORD=9fa07857e4f3b920f75fbd
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=true
```

**Your shipping origin address:**
```env
SHIPPING_ORIGIN_POSTAL_CODE=M5H 2N2
SHIPPING_ORIGIN_CITY=Toronto
SHIPPING_ORIGIN_PROVINCE=ON
```

### Step 4: Update Server Code

The server code in `server.js` has a placeholder for Canada Post API integration. Once you have credentials, the code will automatically use real API rates instead of estimates.

## How It Works

### Frontend (Checkout.jsx)

1. User enters shipping address (postal code, city, province)
2. System automatically fetches shipping rates when address is complete
3. User selects preferred shipping method
4. Selected shipping cost is included in order total

### Backend (server.js)

1. Receives destination address and cart items
2. Calculates package weight and dimensions
3. Calls Canada Post API (or uses estimates if credentials not set)
4. Returns available shipping options with prices

## Package Weight Calculation

The system estimates weight based on product variants:
- **Mini Bag**: 0.05 kg (50g)
- **Small Bag**: 0.1 kg (100g)
- **Medium Bag**: 0.2 kg (200g)
- **Large Bag**: 0.35 kg (350g)
- **Clear Box**: 0.2 kg (200g)

You can adjust these values in `server.js` in the `calculateWeight` function.

## Package Dimensions

Dimensions are estimated based on item count:
- **1-3 items**: 20cm × 15cm × 5cm
- **4-8 items**: 25cm × 20cm × 8cm
- **9+ items**: 30cm × 25cm × 10cm

Update these in `server.js` if your actual package sizes differ.

## Testing

### Without Canada Post API

The system will work with estimated rates. Test the checkout flow:
1. Add items to cart
2. Go to checkout
3. Enter a Canadian address
4. Shipping options should appear automatically
5. Select a shipping method
6. Continue to payment

### With Canada Post API

Once credentials are set:
1. Rates will be fetched from Canada Post in real-time
2. More accurate pricing based on actual destination
3. Additional shipping options may be available

## Troubleshooting

### Shipping rates not appearing

- Check that postal code, city, and province are all filled
- Check browser console for API errors
- Verify backend server is running
- Check that `VITE_API_URL` is set correctly

### Rates seem incorrect

- Verify package weight calculations match your products
- Check package dimensions are accurate
- For remote areas (Yukon, Northwest Territories), rates are higher

### Canada Post API errors

- Verify credentials are correct in `.env`
- Check that your Canada Post account is active
- Ensure you're using test credentials for development
- Review Canada Post API documentation for rate limits

## Next Steps

1. **Get Canada Post API credentials** for real-time rates
2. **Adjust weight/dimension calculations** to match your products
3. **Set your shipping origin address** in environment variables
4. **Test with various destinations** to verify accuracy
5. **Consider adding** shipping label generation after order completion

## Additional Features to Consider

- **Address validation** using Canada Post Address Complete API
- **Shipping label generation** after payment
- **Tracking number** integration
- **International shipping** (if applicable)
- **Free shipping thresholds** (already partially implemented)

