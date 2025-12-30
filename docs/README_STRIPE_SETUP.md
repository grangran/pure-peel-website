# Stripe Payment Integration Setup Guide

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard: https://dashboard.stripe.com/apikeys

## Installation Steps

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install --save-dev express cors stripe dotenv
```

### 2. Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Stripe keys to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (optional for now)
   ```

### 3. Start the Backend Server

In a separate terminal, start the Express server:

```bash
node server.js
```

The server will run on `http://localhost:3001`

### 4. Update API URL (if needed)

If your backend runs on a different port or URL, update the API URL in `src/pages/Checkout.jsx`:

```javascript
const response = await fetch('http://localhost:3001/api/create-checkout-session', {
```

### 5. Start the Frontend

```bash
npm run dev
```

## Testing

### Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Test Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Click "Pay Securely"
5. You'll be redirected to Stripe Checkout
6. Use a test card to complete payment
7. You'll be redirected back with order confirmation

## Production Setup

### 1. Switch to Live Keys

- Get live API keys from Stripe Dashboard
- Update `.env` with live keys
- Make sure `VITE_STRIPE_PUBLISHABLE_KEY` uses `pk_live_...` (not `pk_test_...`)

### 2. Set Up Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret to `.env`

### 3. Deploy Backend

Options:
- **Vercel**: Create `api/` folder with serverless functions
- **Netlify**: Create `netlify/functions/` folder
- **Heroku**: Deploy Express server
- **Railway/Render**: Deploy Node.js app

### 4. Update Frontend API URL

Update the API URL in `Checkout.jsx` to point to your production backend.

## Security Notes

- ✅ Never commit `.env` file to git
- ✅ Never expose secret keys in frontend code
- ✅ Always verify payments server-side via webhooks
- ✅ Use HTTPS in production
- ✅ Validate amounts on backend

## Troubleshooting

### "Failed to create checkout session"
- Check that backend server is running
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check browser console for errors

### "Stripe is not defined"
- Make sure `@stripe/stripe-js` is installed
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set

### Payment succeeds but no confirmation
- Check webhook endpoint is configured
- Verify webhook secret in `.env`
- Check backend logs for webhook events

## Next Steps

- Set up order management system
- Configure email receipts
- Add order tracking
- Implement inventory management
- Add analytics

