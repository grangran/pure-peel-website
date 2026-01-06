# Canada Post Automatic Shipping Label Creation

## Overview

The system now automatically creates Canada Post shipping labels when a Stripe payment is completed. This eliminates the need to manually create labels for each order.

## How It Works

1. **Customer places order** → Stripe processes payment
2. **Stripe webhook fires** → `checkout.session.completed` event
3. **Order is saved** → Order data stored in `data/orders.json`
4. **Label is created automatically** → Canada Post API creates shipping label
5. **Tracking number saved** → Added to order record
6. **Emails sent** → Customer receives confirmation with tracking number

## Setup Requirements

### 1. Canada Post API Credentials

You need the same credentials used for shipping rate calculation:

```env
CANADA_POST_USERNAME=your_username
CANADA_POST_PASSWORD=your_password
CANADA_POST_CUSTOMER_NUMBER=your_customer_number
CANADA_POST_USE_PRODUCTION=true
```

### 2. Shipping Origin Address

**Required:** Canada Post needs a shipping origin postal code. All other fields have defaults.

**Minimum Required:**
```env
SHIPPING_ORIGIN_POSTAL_CODE=M5H 2N2
```

**Optional (has defaults if not set):**
```env
SHIPPING_ORIGIN_CITY=Toronto          # Default: Toronto
SHIPPING_ORIGIN_PROVINCE=ON           # Default: ON
SHIPPING_ORIGIN_ADDRESS_LINE1=123 Main St  # Default: 123 Main St
SHIPPING_ORIGIN_PHONE=1-800-000-0000      # Default: 1-800-000-0000
```

**Note:** If you don't want to share your exact address, you can:
- Use a generic business address or PO Box
- Use your city's main postal code (e.g., downtown area)
- The defaults will work for testing, but Canada Post may validate the postal code

### 3. Enable/Disable Automatic Labels

By default, automatic label creation is **enabled**. To disable it:

```env
AUTO_CREATE_SHIPPING_LABELS=false
```

## What Happens When a Label is Created

### Success:
- ✅ Shipping label created via Canada Post API
- ✅ Tracking number saved to order
- ✅ Order status updated to "processing"
- ✅ Shipping notification email sent to customer
- ✅ Label PDF URL saved (for manual download if needed)

### Failure:
- ⚠️ Order is still saved successfully
- ⚠️ Order status remains "pending"
- ⚠️ No tracking number assigned
- ⚠️ Label can be created manually later
- ⚠️ Error logged for debugging

## Order Data Structure

After label creation, orders include:

```json
{
  "id": "PP-12345678",
  "trackingNumber": "1234567890123456",
  "labelUrl": "https://...",
  "shipmentId": "123456789",
  "pin": "12345678",
  "status": "processing",
  ...
}
```

## Email Notifications

### Order Confirmation Email
- Includes tracking number (if available)
- Links to Canada Post tracking
- Links to order tracking page

### Shipping Notification Email
- Sent automatically when label is created
- Includes tracking number
- Links to tracking pages

## Manual Label Creation

If automatic label creation fails or is disabled, you can:

1. **Access order in admin dashboard** → `/admin`
2. **View order details** → See shipping address
3. **Create label manually** → Use Canada Post portal or API
4. **Update order** → Add tracking number manually

## Troubleshooting

### Label Creation Fails

**Check:**
1. Canada Post credentials are correct
2. Shipping origin address is configured
3. Shipping address from Stripe is complete
4. Canada Post API is accessible
5. Check server logs for specific error messages

### Common Errors

**"Canada Post credentials not configured"**
- Set `CANADA_POST_USERNAME` and `CANADA_POST_PASSWORD` in environment variables

**"Invalid shipping address"**
- Ensure Stripe collected complete shipping address
- Check that address fields are not empty

**"API timeout"**
- Canada Post API may be slow
- Label creation has 30-second timeout
- Order will still be saved, label can be created manually

## Testing

### Test Mode (Development)

Set in environment:
```env
CANADA_POST_USE_PRODUCTION=false
```

This uses Canada Post's test/sandbox environment.

### Production Mode

Set in environment:
```env
CANADA_POST_USE_PRODUCTION=true
```

This uses Canada Post's live production API.

## API Endpoints

The label creation happens automatically in the webhook handler:
- `POST /api/webhook` → Stripe webhook endpoint
- Automatically creates labels for paid orders

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify Canada Post API credentials
3. Test with a small order first
4. Contact Canada Post support if API issues persist

