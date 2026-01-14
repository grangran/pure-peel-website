# Vercel Speed Insights - Mobile Data Not Showing: Troubleshooting Guide

## Quick Checklist

If you're not seeing mobile speed analytics in Vercel Speed Insights, check these in order:

### ✅ 1. Verify Speed Insights is Enabled in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Analytics**
3. Ensure **Speed Insights** is **enabled**
4. Verify you're on a plan that supports it (Hobby plan and above)

### ✅ 2. Check Dashboard Filters

**This is the most common issue!**

1. Go to **Analytics** → **Speed Insights**
2. Look for **Device Type** filter or tabs at the top
3. Make sure you're viewing **Mobile** data (not Desktop or All)
4. Some views show "All Devices" by default - switch to Mobile

**Where to find the filter:**
- Usually at the top of the Speed Insights page
- May be a dropdown: "All Devices" → Select "Mobile"
- May be tabs: "Desktop" | "Mobile" | "Tablet"
- May be in a sidebar filter panel

### ✅ 3. Verify Implementation

Your code should have (already correct):
```jsx
import { SpeedInsights } from '@vercel/speed-insights/react'
<SpeedInsights sampleRate={1} />
```

**Location:** `src/main.jsx` ✅ Already implemented correctly!

### ✅ 4. Check Package Version

Current version: `@vercel/speed-insights@^1.3.1`

To update (if needed):
```bash
npm update @vercel/speed-insights @vercel/analytics
npm install
```

Then redeploy to Vercel.

### ✅ 5. Verify Mobile Traffic

Speed Insights needs **actual mobile user visits** to collect data:

- ❌ Desktop browser emulation doesn't count
- ❌ Chrome DevTools mobile emulation doesn't count
- ✅ Real mobile device visits count
- ✅ Real mobile browser (Safari on iPhone, Chrome on Android, etc.)

**Test:**
1. Visit your site on a real mobile device
2. Navigate through multiple pages
3. Wait 24-48 hours
4. Check Speed Insights again

### ✅ 6. Wait for Data Collection

**Timeline:**
- **Real-time data**: Not available for Speed Insights
- **First data**: 24-48 hours after mobile visits
- **Meaningful data**: After 7+ days with regular mobile traffic

**Why it takes time:**
- Vercel needs to collect enough samples for statistical significance
- Mobile data is collected separately from desktop
- Need sufficient mobile traffic volume

### ✅ 7. Check Browser Console on Mobile

To verify Speed Insights is loading on mobile:

1. **On iPhone (Safari):**
   - Connect to Mac
   - Open Safari on Mac → Develop → [Your iPhone] → [Your Site]
   - Open Console
   - Look for Speed Insights errors

2. **On Android (Chrome):**
   - Connect via USB
   - Open Chrome DevTools → Remote devices
   - Select your device
   - Check Console for errors

3. **What to look for:**
   - No errors related to `speed-insights`
   - Network requests to `vercel-insights.com` or `vitals.vercel-insights.com`
   - If you see errors, note them down

### ✅ 8. Verify CSP Headers

Your `vercel.json` already allows Speed Insights:
```json
"connect-src": "... https://*.vercel-insights.com https://*.vercel.com https://vitals.vercel-insights.com"
```

✅ This is correct!

### ✅ 9. Check Deployment

1. **Verify latest code is deployed:**
   - Go to Vercel Dashboard → Deployments
   - Ensure latest deployment includes Speed Insights
   - Check deployment logs for any errors

2. **Redeploy if needed:**
   - If you just added/changed Speed Insights, trigger a new deployment
   - Go to Deployments → Click "Redeploy" on latest

### ✅ 10. Check Vercel Status

Sometimes Vercel has service issues:
- Check: https://vercel-status.com
- Look for any incidents related to Analytics or Speed Insights

---

## Common Issues & Solutions

### Issue: "No data available" in Mobile view

**Possible causes:**
1. Not enough mobile traffic yet
2. Data collection hasn't started
3. Filters not set correctly

**Solutions:**
1. Wait 24-48 hours after mobile visits
2. Ensure you're filtering by "Mobile" device type
3. Check that you have actual mobile traffic (not emulated)

### Issue: Only Desktop data showing

**Possible causes:**
1. Most traffic is from desktop
2. Mobile filter not applied
3. Mobile data needs more time

**Solutions:**
1. Explicitly select "Mobile" filter in dashboard
2. Generate more mobile traffic
3. Wait longer for mobile data to accumulate

### Issue: Speed Insights script not loading

**Possible causes:**
1. CSP blocking the script
2. Ad blockers on mobile
3. Network issues

**Solutions:**
1. Check browser console for errors
2. Verify CSP allows `vercel-insights.com` (already configured ✅)
3. Test in incognito/private mode (disables some blockers)

---

## Step-by-Step: Finding Mobile Data in Vercel Dashboard

### Method 1: Speed Insights Page

1. **Go to Vercel Dashboard**
   - https://vercel.com
   - Select your **Pure Peel Co.** project

2. **Navigate to Analytics**
   - Click **Analytics** tab (top navigation)
   - Click **Speed Insights** (left sidebar)

3. **Find Device Filter**
   - Look at the top of the page
   - Find dropdown or tabs for device type
   - Options might be:
     - "All Devices" dropdown → Select "Mobile"
     - Tabs: "Desktop" | "Mobile" | "Tablet" → Click "Mobile"
     - Filter panel on the side → Check "Mobile"

4. **View Mobile Metrics**
   - Once Mobile is selected, you should see:
     - LCP (Largest Contentful Paint) for mobile
     - FID/INP (Interaction to Next Paint) for mobile
     - CLS (Cumulative Layout Shift) for mobile
     - FCP, TTFB, and other metrics

### Method 2: Analytics Overview

1. **Go to Analytics** → **Overview**
2. **Look for device breakdown**
   - May show charts with device type legend
   - Click on "Mobile" segment to filter

### Method 3: Custom Reports

1. **Go to Analytics** → **Speed Insights**
2. **Look for "Create Report" or "Custom View"**
3. **Set filter**: Device Type = Mobile
4. **Save the view**

---

## Testing Mobile Tracking Right Now

### Quick Test:

1. **Visit your site on a real mobile device:**
   - Use your phone's browser (Safari, Chrome, etc.)
   - Navigate to: https://purepeelco.com
   - Visit 3-5 different pages
   - Interact with the site (scroll, click buttons)

2. **Wait 24-48 hours**

3. **Check Vercel Speed Insights:**
   - Go to Analytics → Speed Insights
   - Filter by Mobile
   - You should see data appear

### Verify It's Working:

**Check Network Requests on Mobile:**
1. Open browser DevTools on mobile (via remote debugging)
2. Go to Network tab
3. Filter by "insights" or "vitals"
4. You should see requests to:
   - `vitals.vercel-insights.com`
   - `*.vercel-insights.com`

If you see these requests, Speed Insights is working!

---

## Still Not Working?

If after trying all the above you still don't see mobile data:

1. **Contact Vercel Support:**
   - Go to: https://vercel.com/support
   - Explain: "Speed Insights mobile data not appearing despite mobile traffic"
   - Include:
     - Your project name
     - When you started seeing mobile traffic
     - Screenshot of Speed Insights dashboard
     - Any console errors from mobile devices

2. **Check Vercel Community:**
   - https://github.com/vercel/vercel/discussions
   - Search for "speed insights mobile" issues
   - Post your question if not found

3. **Verify Plan:**
   - Ensure you're on Hobby plan or above
   - Free tier may have limitations
   - Check: Settings → Plan

---

## Expected Behavior

### What You Should See:

**After 24-48 hours with mobile traffic:**
- Mobile device filter available
- Mobile-specific Core Web Vitals
- Mobile performance metrics
- Comparison charts (Mobile vs Desktop)

**If you see:**
- "No data available" → Need more mobile traffic or wait longer
- Only desktop data → Check device filter
- Error messages → Check console and contact support

---

## Your Current Setup ✅

- ✅ Speed Insights package installed: `@vercel/speed-insights@^1.3.1`
- ✅ Properly imported and used in `src/main.jsx`
- ✅ Sample rate set to 100% (`sampleRate={1}`)
- ✅ CSP headers allow vercel-insights.com
- ✅ Analytics package also installed

**Everything is configured correctly!** The issue is likely:
1. Need to wait for data collection (24-48 hours)
2. Need more mobile traffic
3. Dashboard filter not set to Mobile

---

## Next Steps

1. ✅ **Verify dashboard filter** - Make sure "Mobile" is selected
2. ✅ **Generate mobile traffic** - Visit site on real mobile device
3. ✅ **Wait 24-48 hours** - For data to appear
4. ✅ **Check again** - Filter by Mobile in Speed Insights
5. ✅ **If still nothing** - Contact Vercel support with details

---

**Most Common Solution:** Make sure you're filtering by "Mobile" device type in the Speed Insights dashboard! The data might be there, but you're viewing "All Devices" or "Desktop" by default.
