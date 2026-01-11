import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key from https://dashboard.stripe.com/apikeys
// Note: The './en' module error is harmless - it's Stripe.js trying to load locale files
// Since we use Stripe Checkout (redirect), this doesn't affect functionality
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

export default stripePromise



