import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key from https://dashboard.stripe.com/apikeys
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

export default stripePromise


