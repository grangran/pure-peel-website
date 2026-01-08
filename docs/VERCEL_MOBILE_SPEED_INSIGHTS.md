# Vercel Mobile Speed Insights Guide

## Overview

Your website has Vercel Speed Insights already integrated. This guide shows you how to access and interpret mobile-specific performance metrics.

## Accessing Mobile Speed Insights

### Step 1: Log into Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and log in
2. Select your **Pure Peel Co.** project

### Step 2: Navigate to Speed Insights
1. Click on your project
2. Go to the **Analytics** tab (top navigation)
3. Click on **Speed Insights** in the left sidebar

### Step 3: Filter for Mobile Devices
1. Look for a **Device Type** filter or dropdown
2. Select **Mobile** to view mobile-specific metrics
3. You can also filter by:
   - **Time Range** (Last 24 hours, 7 days, 30 days, etc.)
   - **Page** (Home, Product pages, Checkout, etc.)
   - **Country/Region**

## Key Mobile Performance Metrics

### Core Web Vitals (Mobile)

#### 1. **LCP (Largest Contentful Paint)** - Target: < 2.5s
- **What it measures**: Time until the largest content element is visible
- **Mobile target**: < 2.5 seconds
- **Good**: 0-2.5s (Green)
- **Needs improvement**: 2.5-4.0s (Orange)
- **Poor**: > 4.0s (Red)

#### 2. **FID/INP (Interaction to Next Paint)** - Target: < 200ms
- **What it measures**: Responsiveness to user interactions
- **Mobile target**: < 200 milliseconds
- **Good**: 0-200ms (Green)
- **Needs improvement**: 200-500ms (Orange)
- **Poor**: > 500ms (Red)

#### 3. **CLS (Cumulative Layout Shift)** - Target: < 0.1
- **What it measures**: Visual stability (how much content shifts)
- **Mobile target**: < 0.1
- **Good**: 0-0.1 (Green)
- **Needs improvement**: 0.1-0.25 (Orange)
- **Poor**: > 0.25 (Red)

### Additional Metrics

#### 4. **FCP (First Contentful Paint)** - Target: < 1.8s
- Time until first text/image is rendered
- Mobile target: < 1.8 seconds

#### 5. **TTFB (Time to First Byte)** - Target: < 600ms
- Time until server responds
- Mobile target: < 600 milliseconds

## Mobile-Specific Considerations

### Common Mobile Performance Issues

1. **Large Images**
   - Use optimized images (WebP format)
   - Implement lazy loading
   - Use responsive images (`srcset`)

2. **JavaScript Bundle Size**
   - Code splitting
   - Tree shaking
   - Minimize dependencies

3. **Network Conditions**
   - Mobile users often on slower connections
   - Consider offline capabilities
   - Optimize API calls

4. **Render Blocking Resources**
   - Minimize CSS/JS blocking initial render
   - Use `defer` or `async` for scripts

## Improving Mobile Performance

### Quick Wins

1. **Image Optimization**
   ```bash
   # Already using Vite, which optimizes images
   # Consider using WebP format for all product images
   ```

2. **Lazy Loading**
   - Already implemented for images below the fold
   - Consider lazy loading components

3. **Code Splitting**
   - Vite automatically code-splits
   - Consider route-based splitting for large pages

4. **Caching**
   - Vercel automatically caches static assets
   - Consider service worker for offline support

### Monitoring

- Check Speed Insights **daily** for the first week after deployment
- Monitor **weekly** after that
- Set up alerts for performance regressions (if available)

## Current Configuration

Your Speed Insights is configured with:
- **Package**: `@vercel/speed-insights/react` (v1.3.1 - latest)
- **Sample Rate**: 100% (`sampleRate={1}`)
- **Automatic tracking**: Enabled
- **Real User Monitoring (RUM)**: Active
- **Device tracking**: Both desktop and mobile (automatic detection)

## Troubleshooting

### If Mobile Metrics Show "No data available"

If you see "No data available. Make sure you are using the latest @vercel/speed-insights package" in the mobile view:

1. **Update the package** (if needed):
   ```bash
   npm update @vercel/speed-insights @vercel/analytics
   ```

2. **Verify the implementation** in `src/main.jsx`:
   ```jsx
   import { SpeedInsights } from '@vercel/speed-insights/react'
   
   // In your component tree:
   <SpeedInsights sampleRate={1} />
   ```

3. **Ensure you have mobile traffic**:
   - Speed Insights requires actual mobile user visits to collect data
   - Desktop data may appear first if most traffic is from desktop
   - Test on a real mobile device to generate initial data

4. **Check browser console** on mobile:
   - Open DevTools on a mobile device (or use Chrome DevTools mobile emulation)
   - Look for any errors related to `@vercel/speed-insights`
   - Verify the script is loading: Check Network tab for `speed-insights` requests

5. **Verify deployment**:
   - Ensure the latest code with Speed Insights is deployed to production
   - Check that the build includes the Speed Insights package
   - Redeploy if you just updated the package

6. **Wait for data collection**:
   - It can take 24-48 hours for mobile data to appear
   - Vercel needs sufficient mobile traffic to generate meaningful metrics
   - The sample rate is set to 100%, so all mobile visits should be tracked

7. **Check Vercel project settings**:
   - Go to Project Settings → Analytics
   - Ensure Speed Insights is enabled
   - Verify you're on a plan that supports Speed Insights (Hobby plan and above)

### If Mobile Metrics Aren't Showing (General)

1. **Wait 24-48 hours** after deployment for data to accumulate
2. **Check deployment**: Ensure latest code is deployed
3. **Verify integration**: Check browser console for Speed Insights errors
4. **Check Vercel project settings**: Ensure Analytics is enabled

### If Mobile Performance is Poor

1. **Run Lighthouse audit** (Chrome DevTools → Lighthouse → Mobile)
2. **Check Network tab** for slow resources
3. **Review bundle size** (Vite build output)
4. **Test on real devices** (not just emulators)

## Resources

- [Vercel Speed Insights Docs](https://vercel.com/docs/analytics/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Mobile Performance Best Practices](https://web.dev/fast/)

## Next Steps

1. ✅ Access Vercel Dashboard → Analytics → Speed Insights
2. ✅ Filter by Mobile devices
3. ✅ Review Core Web Vitals
4. ✅ Identify areas for improvement
5. ✅ Implement optimizations
6. ✅ Monitor improvements over time

