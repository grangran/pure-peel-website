# Fix: Vercel Speed Insights Mobile Data Not Showing

## Issue
Vercel Speed Insights dashboard shows "No data available" for mobile devices, even after mobile visits.

## Root Causes

Based on Vercel's documentation and common issues:

1. **Data is sent on page unload/blur** - Not on page load
2. **Ad blockers** can prevent the script from loading
3. **Package version** may need updating
4. **Need actual navigation** - Just refreshing doesn't send data

## Solutions Applied

### 1. Enhanced Implementation
- Added `route` prop to SpeedInsights for better tracking
- Ensures proper page-level data collection
- Package version `^1.3.1` is already the latest stable version

## How to Test & Generate Mobile Data

### Critical: Speed Insights sends data on page unload, not load!

**This is important:** The Speed Insights script sends performance data when:
- User navigates to a different page
- User switches tabs
- User closes the browser
- Page unloads (not on initial load)

### Testing Steps:

1. **Visit on real mobile device** (not emulator):
   - Open your site: https://purepeelco.com
   - Navigate through multiple pages (don't just refresh)
   - Click links, go to different routes
   - Switch tabs or close browser (this triggers data send)

2. **Wait for data collection:**
   - Data appears 24-48 hours after visits
   - Need multiple mobile visits for meaningful data

3. **Verify script is loading:**
   - Open browser console on mobile (via remote debugging)
   - Check Network tab for requests to `vitals.vercel-insights.com`
   - Should see requests when navigating between pages

### Common Mistakes:

❌ **Wrong:** Just refreshing the same page
✅ **Right:** Navigate to different pages (home → product → checkout)

❌ **Wrong:** Testing in desktop browser emulation
✅ **Right:** Use real mobile device

❌ **Wrong:** Expecting immediate data
✅ **Right:** Wait 24-48 hours after mobile visits

## Verify Implementation

Your `src/main.jsx` should have:
```jsx
import { SpeedInsights } from '@vercel/speed-insights/react'

<SpeedInsights 
  sampleRate={1}
  route={window.location.pathname}
/>
```

✅ This is now correctly implemented!

## Check Browser Console

On mobile device (via remote debugging):

1. **Open Console**
2. **Navigate between pages**
3. **Look for:**
   - Network requests to `vitals.vercel-insights.com`
   - No errors related to speed-insights
   - Requests should happen on page navigation, not initial load

## If Still Not Working

1. **Disable ad blockers** on mobile device
2. **Test in incognito/private mode** (disables some blockers)
3. **Check Vercel status**: https://vercel-status.com
4. **Contact Vercel support** with:
   - Screenshot of dashboard
   - Browser console logs from mobile
   - Network tab showing speed-insights requests (or lack thereof)

## Next Steps

1. ✅ Redeploy to Vercel (with route prop enhancement)
2. ✅ Visit site on real mobile device
3. ✅ **Navigate through multiple pages** (don't just refresh - this is critical!)
4. ✅ Switch tabs or close browser (triggers data send)
5. ✅ Wait 24-48 hours
6. ✅ Check Speed Insights dashboard again

---

**Key Point:** Speed Insights data is sent when users **navigate away** from pages, not when they load. Make sure you're actually navigating between pages on mobile, not just refreshing!
