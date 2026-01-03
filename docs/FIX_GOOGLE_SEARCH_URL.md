# Fix Google Search Showing Wrong URL (www vs non-www, HTTP vs HTTPS)

## The Problem

Google search results are showing:
- `http://www.purepeelco.com` ❌

But you want:
- `https://purepeelco.com` ✅

## Why This Happens

Google has cached the old URL in its index. It takes time for Google to:
1. Re-crawl your site
2. Discover the new canonical URL
3. Update search results

## Solution: Request Re-Indexing in Google Search Console

### Step 1: Go to Google Search Console

1. Go to: https://search.google.com/search-console
2. Select your property: `https://purepeelco.com`

### Step 2: Request Indexing for Homepage

1. Click **"URL Inspection"** in the left sidebar
2. Enter: `https://purepeelco.com`
3. Click **"Test Live URL"**
4. Wait for it to check (should show "URL is on Google")
5. Click **"Request Indexing"**
6. Google will re-crawl your homepage

### Step 3: Request Indexing for Important Pages

Repeat for these pages:
- `https://purepeelco.com/orange`
- `https://purepeelco.com/pink-orange`
- `https://purepeelco.com/lime`
- `https://purepeelco.com/lemon`
- `https://purepeelco.com/apple`

### Step 4: Submit Updated Sitemap

1. Go to **"Sitemaps"** in the left sidebar
2. You should see `sitemap.xml` already submitted
3. Click **"Resubmit"** or **"Test sitemap"** → **"Request indexing"**
4. This tells Google to re-crawl all pages

### Step 5: Set Preferred Domain (If Available)

1. Go to **"Settings"** → **"Site Settings"**
2. Look for **"Preferred domain"** option
3. If available, select: `https://purepeelco.com` (without www)
4. Save changes

**Note:** This setting might not be available for all properties, but if it is, it helps Google know which version to show.

## Verify Redirects Are Working

### Test These URLs:

1. **HTTP to HTTPS:**
   - Visit: `http://purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

2. **WWW to Non-WWW:**
   - Visit: `https://www.purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

3. **HTTP WWW to HTTPS Non-WWW:**
   - Visit: `http://www.purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

**All of these should redirect correctly!**

## How Long Does It Take?

- **Re-indexing request:** Usually 1-3 days
- **Search results update:** Can take 1-2 weeks
- **Full index update:** Can take several weeks

**Be patient!** Google doesn't update instantly.

## Monitor Progress

### Check in Google Search Console:

1. Go to **"Coverage"** → **"Valid"**
2. See which pages are indexed
3. Check **"URL Inspection"** to see when pages were last crawled

### Check Search Results:

1. Search: `site:purepeelco.com`
2. See which URLs Google is showing
3. Over time, you should see more `https://purepeelco.com` results

## Additional Steps (Optional)

### 1. Add Canonical URL to All Pages

Your site already has canonical URLs set correctly in:
- `index.html` (line 49)
- `SEO.jsx` component (dynamically updates)

This tells Google which URL is the "official" version.

### 2. Check HTTP to HTTPS Redirect

Make sure Vercel is redirecting HTTP to HTTPS:
- Vercel should do this automatically
- Test: `http://purepeelco.com` → should redirect to `https://purepeelco.com`

### 3. Monitor in Google Search Console

Check these regularly:
- **"Coverage"** - See if pages are being indexed
- **"Performance"** - See which URLs are showing in search
- **"URL Inspection"** - Check individual pages

## What to Expect

### Week 1:
- Google starts re-crawling
- Some pages might update

### Week 2-3:
- More pages show correct URL
- Search results gradually update

### Week 4+:
- Most/all pages show `https://purepeelco.com`
- Old `www` URLs fade away

## Troubleshooting

### Issue: Still showing www after 2 weeks

**Check:**
1. Are redirects working? (Test the URLs above)
2. Is canonical URL correct? (View page source, check `<link rel="canonical">`)
3. Did you request indexing? (Check Google Search Console)

### Issue: Still showing HTTP instead of HTTPS

**Check:**
1. Is HTTPS working? (Visit `https://purepeelco.com`)
2. Is HTTP redirecting? (Visit `http://purepeelco.com`)
3. Vercel should handle this automatically

### Issue: Google not indexing pages

**Check:**
1. Google Search Console → Coverage → Are there errors?
2. robots.txt - Is it blocking anything? (Should be fine)
3. Sitemap - Is it submitted and valid?

## Summary

**To fix the URL in Google search:**

1. ✅ Request indexing in Google Search Console (homepage + important pages)
2. ✅ Re-submit sitemap
3. ✅ Verify redirects are working
4. ✅ Wait 1-2 weeks for Google to update
5. ✅ Monitor progress in Google Search Console

**Your site is already configured correctly** - you just need to tell Google to re-crawl it!

