# Pre-Launch Checklist for Pure Peel Co.

## 🔴 Critical (Must Fix Before Launch)

### 1. Product Weights & Dimensions
- [ ] Measure actual product weights (Mini, Small, Medium, Large, Clear Box)
- [ ] Measure actual box dimensions (Small, Medium, Large boxes)
- [ ] Update `PRODUCT_WEIGHTS` in `utils/canadaPostShipping.js`
- [ ] Update `BOX_SIZES` in `utils/canadaPostShipping.js`
- [ ] Update `PRODUCT_WEIGHTS` in `server.js` (line ~1438)
- [ ] Update `BOX_SIZES` in `server.js` (line ~1447)
- [ ] Test shipping cost calculations with real weights/dimensions

### 2. Environment Variables (Production)
**Frontend (Vercel):**
- [x] `VITE_STRIPE_PUBLISHABLE_KEY` - Use LIVE key (pk_live_...) ✓
- [x] `VITE_API_URL` - Backend production URL ✓ (No trailing slash!)
- [x] `VITE_GA_MEASUREMENT_ID` - Google Analytics 4 Measurement ID ✓

**Backend (Render/Railway):**
- [ ] `STRIPE_SECRET_KEY` - Use LIVE key (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `RESEND_FROM_EMAIL` - Verified sender email
- [ ] `ADMIN_EMAIL` - Admin notification email
- [ ] `CANADA_POST_USERNAME` - Production credentials
- [ ] `CANADA_POST_PASSWORD` - Production credentials
- [ ] `CANADA_POST_CUSTOMER_NUMBER` - Your customer number
- [ ] `CANADA_POST_USE_PRODUCTION` - Set to `true`
- [ ] `SHIPPING_ORIGIN_POSTAL_CODE` - Your postal code
- [ ] `SHIPPING_ORIGIN_CITY` - Your city
- [ ] `SHIPPING_ORIGIN_PROVINCE` - Your province (e.g., ON)
- [ ] `SHIPPING_ORIGIN_ADDRESS_LINE1` - Your address
- [ ] `SHIPPING_ORIGIN_PHONE` - Your phone number
- [x] `ADMIN_PASSWORD` - Secure admin password ✓ (Set to: 080925)

### 3. Google Analytics Setup
- [x] Create Google Analytics 4 property ✓
- [x] Get Measurement ID ✓ (`G-NM2RKDMKQ4`)
- [ ] Add `VITE_GA_MEASUREMENT_ID` to Vercel environment variables
  - **Value:** `G-NM2RKDMKQ4`
  - **Steps:**
    1. Go to Vercel Dashboard → pure-peel-website → Settings → Environment Variables
    2. Click "Add Environment Variable"
    3. Key: `VITE_GA_MEASUREMENT_ID`
    4. Value: `G-NM2RKDMKQ4`
    5. Select "All Environments"
    6. Save and redeploy
- [ ] Test that events are tracking in GA4 dashboard (after deployment)
- [ ] Verify e-commerce tracking (purchases, add to cart, etc.)

### 4. Email Configuration
- [ ] Verify domain in Resend dashboard
- [ ] Test order confirmation email
- [ ] Test shipping notification email
- [ ] Test admin notification email
- [ ] Test contact form email
- [ ] Verify email deliverability (check spam folders)

### 5. Stripe Webhook Configuration
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://your-backend-url.com/api/webhook`
- [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Copy webhook signing secret
- [ ] Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook with Stripe CLI or test payment

## 🟡 High Priority (Fix Soon)

### 6. Sitemap Updates
- [x] Add `/contact` to sitemap.xml ✓
- [x] Add `/faq` to sitemap.xml ✓
- [x] Add `/shipping-returns` to sitemap.xml ✓
- [x] Add `/terms` to sitemap.xml ✓
- [x] Add `/privacy` to sitemap.xml ✓
- [x] Update `lastmod` dates ✓
- [ ] Submit updated sitemap to Google Search Console (after deployment)

### 7. Social Media Links
- [ ] Add Facebook link (if available)
- [ ] Add TikTok link (if available)
- [ ] Add Twitter/X link (if available)
- [ ] Verify Instagram link is correct
- [ ] Test all social links open in new tab

### 8. Contact Information
- [x] Add email address to footer ✓ (orders@purepeelco.com)
- [x] Physical address - Not needed (user preference) ✓
- [x] Phone number - Not needed (user preference) ✓
- [ ] Verify contact form sends to correct email

### 9. Product Page SEO
- [ ] Review if product pages should be indexed
- [ ] If yes, remove `noindex: true` from product SEO data
- [ ] Add product structured data (JSON-LD)
- [ ] Ensure product images have alt text
- [ ] Add product descriptions optimized for SEO

### 10. Error Handling Testing
- [ ] Test checkout with invalid card
- [ ] Test checkout with network failure
- [ ] Test order tracking with invalid order ID
- [ ] Test contact form with invalid email
- [ ] Test shipping rate calculation with invalid postal code
- [ ] Verify all errors show user-friendly messages

## 🟢 Medium Priority (Improve UX)

### 11. Loading States
- [ ] Verify all API calls show loading spinners
- [ ] Test checkout redirect loading state
- [ ] Test order lookup loading state
- [ ] Test shipping rate loading state
- [ ] Ensure no "flash of unstyled content"

### 12. Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test checkout flow on mobile
- [ ] Test cart functionality on mobile
- [ ] Verify touch targets are at least 44x44px
- [ ] Test input fields (keyboard types, autocomplete)
- [ ] Test image loading and sizing

### 13. Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify color contrast ratios (WCAG AA minimum)
- [ ] Add skip-to-content link
- [ ] Ensure all images have descriptive alt text

### 14. Performance Optimization
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Minimize JavaScript bundle size
- [ ] Enable gzip/brotli compression
- [ ] Test page load times (< 3 seconds)
- [ ] Verify Core Web Vitals (LCP, FID, CLS)

### 15. Legal Compliance
- [ ] Review Privacy Policy for PIPEDA compliance
- [ ] Review Terms of Service completeness
- [ ] Add refund policy details
- [ ] Add shipping policy details
- [ ] Verify all legal pages are accessible
- [ ] Add business registration number (if applicable)

## 🔵 Nice to Have (Post-Launch)

### 16. Newsletter Signup
- [ ] Implement newsletter signup form
- [ ] Connect to email service (Mailchimp, ConvertKit, etc.)
- [ ] Add to footer and/or homepage

### 17. Product Reviews
- [ ] Research review platform (Trustpilot, Google Reviews, etc.)
- [ ] Add review widget to product pages
- [ ] Set up review collection process

### 18. Live Chat Support
- [ ] Research chat widget (Tawk.to, Intercom, etc.)
- [ ] Add chat widget to website
- [ ] Set up chat notifications

### 19. Content Marketing
- [ ] Plan blog content strategy
- [ ] Create blog section
- [ ] Write first blog post
- [ ] Set up blog SEO

### 20. Multi-Language Testing
- [ ] Test all French translations
- [ ] Verify language switcher works
- [ ] Test checkout in French
- [ ] Test email templates in French

## 📋 Pre-Launch Testing Checklist

### Functional Testing
- [ ] Complete test purchase (end-to-end)
- [ ] Test promo code "FREESHIP"
- [ ] Test currency switching (CAD/USD)
- [ ] Test order tracking
- [ ] Test contact form submission
- [ ] Test admin login and order management
- [ ] Test shipping rate calculation for CA and US
- [ ] Test checkout with different shipping methods

### Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)

### Payment Testing
- [ ] Test with Stripe test cards
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test refund process
- [ ] Verify webhook receives events

### Email Testing
- [ ] Order confirmation email
- [ ] Shipping notification email
- [ ] Admin order alert email
- [ ] Contact form confirmation email

## 🚀 Launch Day Checklist

- [ ] All critical items completed
- [ ] All environment variables set
- [ ] Stripe webhook configured and tested
- [ ] Email notifications working
- [ ] Google Analytics tracking
- [ ] Test purchase completed successfully
- [ ] All links working
- [ ] Mobile site tested
- [ ] SSL certificate active
- [ ] Domain DNS configured correctly
- [ ] Backup plan ready (rollback procedure)

## 📞 Support Resources

- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/support
- **Resend Support**: https://resend.com/support
- **Canada Post API**: https://www.canadapost-postescanada.ca/cpc/en/business/postal-services/developers.page

---

**Last Updated**: January 2025
**Status**: Pre-Launch Review
