/**
 * Backend API origin for browser fetch calls.
 *
 * Production site (e.g. purepeelco.com on Vercel) is static — there is no /api on the same
 * origin unless you proxy explicitly. Checkout/email flows must hit the Node server (Render).
 *
 * Priority: VITE_API_URL (set in Vercel/CI) → localhost in dev → production API fallback.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') {
    const h = window.location.hostname
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3001'
  }
  return 'https://pure-peel-website.onrender.com'
}
