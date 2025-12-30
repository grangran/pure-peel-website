# Google Analytics Setup Guide

## Overview

This website uses Google Analytics 4 (GA4) to track website performance, user behavior, and e-commerce events. This guide will help you set up and configure Google Analytics.

## Getting Started

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **"Start measuring"** or **"Admin"** → **"Create Account"**
4. Enter account name: **"Pure Peel Co."**
5. Configure account settings and click **"Next"**

### Step 2: Create GA4 Property

1. Click **"Create Property"**
2. Enter property name: **"Pure Peel Co. Website"**
3. Select reporting time zone: **"Canada (Eastern Time)"**
4. Select currency: **"Canadian Dollar (CAD)"**
5. Click **"Next"** and complete business information
6. Click **"Create"**

### Step 3: Get Your Measurement ID

1. In your GA4 property, go to **Admin** → **Data Streams**
2. Click **"Add stream"** → **"Web"**
3. Enter website URL: **"https://purepeelco.com"** (or your domain)
4. Enter stream name: **"Pure Peel Co. Website"**
5. Click **"Create stream"**
6. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 4: Add Measurement ID to Environment Variables

1. Open your `.env` file in the project root
2. Add the following line:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

3. Restart your development server for changes to take effect

## Events Tracked

The website automatically tracks the following events:

### Page Views
- **Event**: Automatic page view tracking
- **When**: Every time a user navigates to a new page
- **Data**: Page path, page title, page location

### E-commerce Events

#### `view_item`
- **When**: User views a product page
- **Data**: Product ID, name, variant, price, category
- **Pages**: Orange, Pink Orange, Lime product pages

#### `add_to_cart`
- **When**: User adds an item to cart
- **Data**: Product ID, name, variant, price, quantity
- **Location**: Cart context

#### `remove_from_cart`
- **When**: User removes an item from cart
- **Data**: Product ID, name, variant, price, quantity
- **Location**: Cart context

#### `view_cart`
- **When**: User opens the cart
- **Data**: Cart items, total value
- **Location**: Cart context

#### `begin_checkout`
- **When**: User starts checkout process (after shipping info)
- **Data**: Cart items, total value, shipping cost
- **Location**: Checkout page

#### `purchase`
- **When**: Order is successfully completed
- **Data**: Transaction ID, order value, currency, tax, shipping, items
- **Location**: Checkout success page

### Custom Events

#### `contact_form_submit`
- **When**: User submits the contact form
- **Data**: Form name
- **Location**: Contact section

## Viewing Analytics Data

### Real-Time Reports
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **"Reports"** → **"Realtime"**
4. See live user activity, page views, and events

### E-commerce Reports
1. Go to **"Reports"** → **"Monetization"** → **"E-commerce purchases"**
2. View purchase data, revenue, and conversion rates

### Events Report
1. Go to **"Reports"** → **"Engagement"** → **"Events"**
2. See all tracked events and their parameters

## Testing

### Test in Development
1. Open browser console (F12)
2. Navigate through your website
3. Check console for GA event logs (only in development mode)
4. Events will show as: `GA Event: eventName { parameters }`

### Test in Production
1. Go to GA4 **Real-time** reports
2. Perform actions on your website:
   - View a product
   - Add item to cart
   - Start checkout
   - Complete a purchase
3. Verify events appear in Real-time reports within seconds

### Test Purchase Event
1. Use Stripe test mode
2. Complete a test purchase
3. Check GA4 Real-time reports for `purchase` event
4. Verify transaction ID, value, and items are correct

## Privacy & Compliance

### Cookie Policy
- Analytics cookies are mentioned in the Privacy Policy
- Users can control cookies through browser settings
- No personally identifiable information is collected

### GDPR/CCPA Compliance
- Consider adding a cookie consent banner for EU/CA users
- Google Analytics can be configured for IP anonymization
- Users can opt-out using browser extensions or settings

## Troubleshooting

### Events Not Showing Up

1. **Check Measurement ID**
   - Verify `VITE_GA_MEASUREMENT_ID` is set in `.env`
   - Restart development server after adding
   - Check browser console for errors

2. **Check Script Loading**
   - Open browser DevTools → Network tab
   - Look for requests to `googletagmanager.com`
   - Verify script loads successfully

3. **Check Real-time Reports**
   - Events may take a few seconds to appear
   - Use GA4 Real-time reports to verify
   - Check that you're viewing the correct property

4. **Development Mode**
   - Events are logged to console in development
   - Check browser console for `GA Event:` messages
   - Verify events are being called

### Common Issues

**Issue**: "Measurement ID not configured"
- **Solution**: Add `VITE_GA_MEASUREMENT_ID` to `.env` file

**Issue**: Events not firing
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Verify `window.gtag` is available

**Issue**: Purchase events missing data
- **Solution**: Check that order data is properly formatted
- **Solution**: Verify Stripe session data includes required fields

## Advanced Configuration

### Custom Dimensions (Optional)
You can add custom dimensions in GA4 to track additional data:
- Customer type (new vs returning)
- Product category
- Marketing source

### Enhanced E-commerce
The current implementation includes standard e-commerce events. You can enhance with:
- Product impressions
- Promotions
- Refunds
- Checkout progress tracking

### Conversion Goals
Set up conversion goals in GA4:
1. Go to **Admin** → **Events**
2. Mark important events as conversions:
   - `purchase` (already marked by default)
   - `begin_checkout`
   - `contact_form_submit`

## Support

For more information:
- [Google Analytics Help Center](https://support.google.com/analytics)
- [GA4 E-commerce Guide](https://support.google.com/analytics/answer/9327974)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)

## Current Configuration

- **Analytics Service**: Google Analytics 4 (GA4)
- **Measurement ID**: Set via `VITE_GA_MEASUREMENT_ID` environment variable
- **Script Loading**: Dynamic, async loading
- **Event Tracking**: Automatic for page views, manual for e-commerce events
- **Development Mode**: Events logged to console

