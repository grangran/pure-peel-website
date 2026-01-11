# Stripe Refunds Setup Guide

## Overview

Your website now has full Stripe refund functionality integrated. You can issue full or partial refunds directly from the admin panel, and refunds are automatically tracked in your order system.

## Features

✅ **Full Refunds** - Refund the entire order amount  
✅ **Partial Refunds** - Refund a specific amount  
✅ **Automatic Tracking** - Refunds are saved to order records  
✅ **Webhook Integration** - Refunds from Stripe Dashboard are automatically synced  
✅ **Admin Panel** - Easy refund interface for order management  
✅ **Refund History** - View all refunds for each order  

## How It Works

### 1. Admin Panel Refunds

**To issue a refund:**

1. Go to `/admin` and log in
2. Find the order you want to refund
3. Click **"Refund"** button (or click "View" then "Issue Refund")
4. Choose:
   - **Full refund:** Leave amount field empty
   - **Partial refund:** Enter the amount to refund
5. Select refund reason (optional)
6. Click **"Confirm Refund"**

**Refund Reasons:**
- `requested_by_customer` - Customer requested refund
- `duplicate` - Duplicate charge
- `fraudulent` - Fraudulent transaction

### 2. Automatic Webhook Sync

**If you refund from Stripe Dashboard:**
- Refund is automatically detected via webhook
- Order is updated with refund information
- Order status changes to "refunded" if fully refunded
- Partial refunds are tracked separately

### 3. Refund Tracking

**Each order stores:**
- Refund ID (Stripe refund ID)
- Refund amount
- Refund currency
- Refund reason
- Refund status
- Refund date

**Order Status:**
- `refunded` - Order fully refunded
- `partial` - Order partially refunded (refundStatus field)
- Original status - If no refunds

## API Endpoints

### Create Refund

**POST** `/api/admin/orders/:orderId/refund`

**Headers:**
```
x-admin-password: your-admin-password
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 25.50,  // Optional: null or omit for full refund
  "reason": "requested_by_customer"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "refund": {
    "refundId": "re_1234567890",
    "amount": 25.50,
    "currency": "cad",
    "reason": "requested_by_customer",
    "status": "succeeded",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "order": { ... }
}
```

### Get Refunds

**GET** `/api/admin/orders/:orderId/refunds`

**Headers:**
```
x-admin-password: your-admin-password
```

**Response:**
```json
{
  "refunds": [
    {
      "refundId": "re_1234567890",
      "amount": 25.50,
      "currency": "cad",
      "reason": "requested_by_customer",
      "status": "succeeded",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalRefunded": 25.50,
  "refundStatus": "partial"
}
```

## Webhook Events

### charge.refunded

**When:** A refund is created in Stripe (via API or Dashboard)

**What happens:**
1. Webhook receives refund event
2. Finds order by charge ID or payment intent
3. Adds refund to order's refunds array
4. Updates order status if fully refunded
5. Saves updated order

**Order matching:**
- Matches by `stripeChargeId`
- Matches by `stripePaymentIntentId`
- Matches by `stripeSessionId` (from metadata)

## Testing Refunds

### Test Mode

1. **Create a test order** in Stripe test mode
2. **Go to admin panel** (`/admin`)
3. **Find the test order**
4. **Click "Refund"**
5. **Issue full or partial refund**
6. **Check Stripe Dashboard** to verify refund

### Test Refund Scenarios

**Full Refund:**
- Order total: $50.00
- Refund amount: (leave empty)
- Result: Full $50.00 refunded

**Partial Refund:**
- Order total: $50.00
- Refund amount: $25.00
- Result: $25.00 refunded, order status = "partial"

**Multiple Refunds:**
- Order total: $50.00
- First refund: $20.00
- Second refund: $30.00
- Result: Fully refunded, order status = "refunded"

## Important Notes

### Refund Processing Time

- **Credit cards:** 5-10 business days
- **Debit cards:** 5-10 business days
- **Bank transfers:** 5-10 business days

Stripe processes refunds immediately, but funds take time to appear in customer's account.

### Refund Limits

- **Full refund:** Cannot exceed order total
- **Partial refund:** Cannot exceed remaining balance
- **Multiple refunds:** Total cannot exceed order total

### Refund Status

- `succeeded` - Refund processed successfully
- `pending` - Refund is being processed
- `failed` - Refund failed (check Stripe Dashboard)
- `canceled` - Refund was canceled

## Troubleshooting

### "No Stripe charge ID found"

**Problem:** Order doesn't have a Stripe charge ID

**Solution:**
- Check if order was created via Stripe Checkout
- Verify `stripeChargeId` or `stripePaymentIntentId` exists in order
- Older orders may not have these fields

### Refund fails in admin panel

**Problem:** Error when creating refund

**Possible causes:**
1. **Stripe not configured** - Check `STRIPE_SECRET_KEY` in environment
2. **Invalid charge ID** - Charge may have been refunded already
3. **Amount exceeds balance** - Check remaining refundable amount
4. **Network error** - Check server logs

**Solution:**
- Check server logs for detailed error
- Verify Stripe credentials
- Check order in Stripe Dashboard

### Webhook not updating orders

**Problem:** Refunds from Stripe Dashboard don't appear in orders

**Solution:**
1. **Check webhook endpoint** - Verify `/api/webhook` is configured
2. **Check webhook events** - Ensure `charge.refunded` is enabled
3. **Check order matching** - Verify order has `stripeChargeId` or `stripePaymentIntentId`
4. **Check server logs** - Look for webhook processing errors

### Refund not showing in admin panel

**Problem:** Refund created but not visible

**Solution:**
1. **Refresh admin panel** - Click refresh or reload page
2. **Check order details** - Click "View" to see refunds
3. **Check server logs** - Verify refund was saved
4. **Check Stripe Dashboard** - Verify refund exists in Stripe

## Best Practices

### 1. Always Verify Before Refunding

- Check order details
- Confirm customer request
- Verify refund amount

### 2. Document Refund Reasons

- Use appropriate reason codes
- Add notes if needed
- Keep records for accounting

### 3. Monitor Refunds

- Check refund status regularly
- Review refund patterns
- Investigate unusual refunds

### 4. Customer Communication

- Notify customer of refund
- Provide refund timeline
- Confirm refund completion

## Security

### Admin Authentication

- Refunds require admin password
- Never expose admin password
- Use strong passwords in production

### Rate Limiting

- Refund endpoints are rate-limited
- Prevents abuse
- Protects against brute force

### Webhook Security

- Webhooks verify Stripe signatures
- Only process verified events
- Reject invalid requests

## Production Checklist

Before going live:

- [ ] Set `ADMIN_PASSWORD` in environment variables
- [ ] Set `STRIPE_SECRET_KEY` (production key)
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Enable `charge.refunded` webhook event
- [ ] Test refund flow in test mode
- [ ] Test webhook sync
- [ ] Verify refund tracking
- [ ] Set up monitoring/alerts

## Support

**Stripe Refund Documentation:**
- https://stripe.com/docs/refunds

**Stripe API Reference:**
- https://stripe.com/docs/api/refunds

**Common Issues:**
- Check server logs
- Check Stripe Dashboard
- Review webhook events

---

**Need help?** Check server logs for detailed error messages and refer to Stripe's refund documentation.
