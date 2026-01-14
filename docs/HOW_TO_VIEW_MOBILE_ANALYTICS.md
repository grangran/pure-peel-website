# How to View Mobile Analytics

## Overview

Your website now tracks mobile devices explicitly in both Google Analytics and Vercel Speed Insights. This guide shows you exactly where to find mobile analytics data.

---

## Google Analytics - Viewing Mobile Data

### Method 1: Device Category Report (Easiest)

1. **Go to Google Analytics**
   - Visit: https://analytics.google.com
   - Select your **Pure Peel Co.** property

2. **Navigate to Reports**
   - Click **Reports** in the left sidebar
   - Go to **Tech** → **Technology** → **Device category**

3. **View Mobile Data**
   - You'll see breakdown by:
     - **Mobile** (phones)
     - **Desktop** (computers)
     - **Tablet** (tablets)
   - Click on **Mobile** to see detailed mobile metrics

### Method 2: Audience → Technology → Device Category

1. **Go to Reports**
2. **Click**: **Audience** → **Technology** → **Device category**
3. **Filter by Mobile** to see:
   - Number of mobile users
   - Sessions from mobile
   - Bounce rate on mobile
   - Average session duration on mobile

### Method 3: Real-Time Mobile Users

1. **Go to Reports**
2. **Click**: **Real-time**
3. **Scroll down** to see:
   - **Device category** breakdown
   - **Mobile** users currently on site
   - **Mobile** page views in real-time

### Method 4: Custom Reports with Device Type

After the latest update, all events now include:
- `device_type`: "mobile", "tablet", or "desktop"
- `is_mobile`: "yes" or "no"
- `screen_width` and `screen_height`

You can create custom reports using these dimensions.

---

## Vercel Speed Insights - Mobile Performance

### Step 1: Access Speed Insights

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in and select your **Pure Peel Co.** project

2. **Navigate to Analytics**
   - Click on your project
   - Go to **Analytics** tab (top navigation)
   - Click **Speed Insights** in the left sidebar

### Step 2: Filter for Mobile

1. **Look for Device Filter**
   - At the top of the Speed Insights page
   - Find **Device Type** dropdown or filter
   - Select **Mobile**

2. **If no filter is visible:**
   - Mobile data may be shown automatically
   - Look for tabs: **Mobile** | **Desktop**
   - Or check the chart legend for device breakdown

### Step 3: View Mobile Metrics

You should see:
- **LCP (Largest Contentful Paint)** for mobile
- **FID/INP (Interaction to Next Paint)** for mobile
- **CLS (Cumulative Layout Shift)** for mobile
- **FCP (First Contentful Paint)** for mobile
- **TTFB (Time to First Byte)** for mobile

---

## Troubleshooting: No Mobile Data Showing

### Google Analytics - No Mobile Data

**Possible Causes:**
1. Not enough mobile traffic yet
2. Mobile users blocking analytics
3. Analytics not properly initialized on mobile

**Solutions:**

1. **Verify Analytics is Working:**
   - Open your site on a mobile device
   - Open browser DevTools (if possible) or use Chrome Remote Debugging
   - Check Network tab for `google-analytics.com` or `googletagmanager.com` requests
   - Check Console for any errors

2. **Test Mobile Tracking:**
   - Visit your site on a real mobile device (not emulator)
   - Navigate through a few pages
   - Wait 24-48 hours for data to appear in Google Analytics

3. **Check Real-Time Reports:**
   - Go to **Real-time** in Google Analytics
   - Visit your site on mobile
   - You should see yourself appear in real-time (may take 30 seconds)

4. **Verify Environment Variable:**
   - Check Vercel: Settings → Environment Variables
   - Ensure `VITE_GA_MEASUREMENT_ID` is set
   - Should be format: `G-XXXXXXXXXX`

### Vercel Speed Insights - No Mobile Data

**Possible Causes:**
1. Not enough mobile traffic
2. Speed Insights needs more time to collect data
3. Mobile users not triggering the tracking

**Solutions:**

1. **Wait for Data Collection:**
   - Speed Insights needs **actual mobile user visits**
   - Desktop emulation doesn't count
   - Wait 24-48 hours after mobile visits

2. **Verify Implementation:**
   - Check `src/main.jsx` has:
     ```jsx
     import { SpeedInsights } from '@vercel/speed-insights/react'
     <SpeedInsights sampleRate={1} />
     ```
   - ✅ Already implemented!

3. **Check Package Version:**
   - Run: `npm list @vercel/speed-insights`
   - Should be version `^1.3.1` or higher
   - ✅ Already up to date!

4. **Test on Real Mobile Device:**
   - Visit your site on a real phone
   - Navigate through multiple pages
   - Wait 24-48 hours for data to appear

5. **Check Vercel Project Settings:**
   - Go to Project Settings → Analytics
   - Ensure Speed Insights is enabled
   - Verify you're on a plan that supports it (Hobby plan+)

---

## What Was Just Fixed

I've enhanced your analytics to explicitly track mobile devices:

### ✅ Google Analytics Enhancements

1. **Device Type Detection:**
   - Automatically detects: mobile, tablet, or desktop
   - Tracks screen width and height
   - Sends device info with every event

2. **Mobile-Specific Tracking:**
   - All page views include `device_type` and `is_mobile`
   - All events include device information
   - Can filter reports by mobile devices

3. **Custom Dimensions:**
   - `device_type`: "mobile", "tablet", "desktop"
   - `is_mobile`: "yes" or "no"
   - Screen dimensions for better insights

### ✅ Vercel Speed Insights

- Already properly configured
- Tracks both desktop and mobile automatically
- Sample rate set to 100% (all visits tracked)

---

## Quick Verification Steps

### 1. Test Mobile Tracking Right Now

1. **Open your site on a mobile device**
2. **Navigate to a few pages**
3. **Wait 30 seconds**
4. **Check Google Analytics Real-Time:**
   - Go to: Reports → Real-time
   - You should see your mobile visit
   - Check "Device category" - should show "Mobile"

### 2. Check Speed Insights

1. **Visit your site on mobile**
2. **Wait 24-48 hours**
3. **Check Vercel Speed Insights:**
   - Filter by Mobile
   - Should see Core Web Vitals for mobile

### 3. Verify in Browser Console

On mobile (or using Chrome DevTools mobile emulation):

1. **Open browser console**
2. **Look for:**
   ```
   GA Page View: { url: '/', title: '...', deviceType: 'mobile', isMobile: true }
   ```
3. **Check Network tab:**
   - Should see requests to `googletagmanager.com`
   - Should see requests to `vercel-insights.com` (for Speed Insights)

---

## Expected Timeline

- **Real-time data**: Appears within 30 seconds
- **Standard reports**: 24-48 hours delay
- **Speed Insights**: 24-48 hours after mobile visits
- **Custom dimensions**: May take 24-48 hours to populate

---

## Still Not Seeing Mobile Data?

If after 48 hours you still don't see mobile data:

1. **Verify mobile visits:**
   - Check Real-time reports while on mobile
   - If you don't appear, analytics may be blocked

2. **Check for ad blockers:**
   - Some mobile browsers block analytics
   - Test in incognito/private mode
   - Try different mobile browsers

3. **Verify environment variables:**
   - `VITE_GA_MEASUREMENT_ID` must be set in Vercel
   - Redeploy after adding/changing variables

4. **Check browser console:**
   - Look for JavaScript errors
   - Verify analytics scripts are loading

5. **Contact support:**
   - Google Analytics: https://support.google.com/analytics
   - Vercel: https://vercel.com/support

---

## Next Steps

1. ✅ **Test on mobile device** - Visit your site now
2. ✅ **Check Real-time** - Verify you appear in Google Analytics
3. ✅ **Wait 24-48 hours** - For full reports to populate
4. ✅ **Review mobile metrics** - Compare mobile vs desktop performance
5. ✅ **Optimize based on data** - Improve mobile experience

---

**Your analytics are now enhanced to track mobile devices explicitly!** 🚀
