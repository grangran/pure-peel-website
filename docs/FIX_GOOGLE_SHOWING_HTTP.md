# Fix: Google Showing http:// Instead of https://

## The Problem

Google search results are showing:
- `http://purepeelco.com` ❌ (HTTP, not secure)

But you want:
- `https://purepeelco.com` ✅ (HTTPS, secure)

## Why This Happens

1. **Google cached the HTTP version** - Google may have indexed your site when it was accessible via HTTP
2. **Old links/bookmarks** - If Google found HTTP links to your site, it may have indexed those
3. **Redirect timing** - Google may have crawled before HTTPS redirects were fully set up
4. **Canonical URLs** - Google needs to see HTTPS canonical URLs to update

## Solution: Force HTTPS Everywhere

### Step 1: Verify Redirects Are Working

Test these URLs to make sure they redirect to HTTPS:

1. **HTTP to HTTPS:**
   - Visit: `http://purepeelco.com`
   - Should automatically redirect to: `https://purepeelco.com`
   - Check with: https://www.redirect-checker.org

2. **HTTP WWW to HTTPS:**
   - Visit: `http://www.purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

### Step 2: Request Re-Indexing with HTTPS URLs

1. **Go to Google Search Console:**
   - https://search.google.com/search-console
   - Select property: `https://purepeelco.com/`

2. **Request Indexing for HTTPS Homepage:**
   - Click **"URL Inspection"** in left sidebar
   - Enter: `https://purepeelco.com`
   - Click **"Test Live URL"**
   - Wait for it to check
   - Click **"Request Indexing"**

3. **Request Indexing for Product Pages:**
   - Repeat for:
     - `https://purepeelco.com/orange`
     - `https://purepeelco.com/pink-orange`
     - `https://purepeelco.com/lime`
     - `https://purepeelco.com/lemon`
     - `https://purepeelco.com/apple`

### Step 3: Remove HTTP URLs from Google Index

1. **In Google Search Console:**
   - Go to **"Removals"** (under Indexing)
   - Click **"New Request"**
   - Enter: `http://purepeelco.com`
   - Select reason: **"Temporarily hide"** or **"Outdated content"**
   - Click **"Submit Request"**

2. **This tells Google:**
   - The HTTP version is outdated
   - Use HTTPS version instead
   - Remove HTTP from search results

### Step 4: Submit Updated Sitemap

1. **In Google Search Console:**
   - Go to **"Sitemaps"** (under Indexing)
   - Verify `sitemap.xml` is submitted
   - Click **"Resubmit"** or **"Test sitemap"** → **"Request indexing"**

2. **Verify sitemap uses HTTPS:**
   - Visit: `https://purepeelco.com/sitemap.xml`
   - All URLs should start with `https://`

### Step 5: Check Canonical URLs

**Your site already has:**
- ✅ Canonical URLs set to `https://purepeelco.com`
- ✅ All meta tags use HTTPS
- ✅ Sitemap uses HTTPS

**Verify:**
- Visit your homepage
- View page source (Right-click → View Page Source)
- Search for `canonical`
- Should see: `<link rel="canonical" href="https://purepeelco.com/" />`

### Step 6: Add HSTS Header (Already Added)

**HSTS (HTTP Strict Transport Security) forces browsers to use HTTPS:**
- Already added to `vercel.json`
- Header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- This tells browsers: "Always use HTTPS for this domain"

## How Long Will This Take?

- **Re-indexing requests:** 1-7 days
- **Removal requests:** 1-3 days
- **Search results update:** 1-4 weeks
- **Full transition:** 2-8 weeks

**Be patient!** Google needs time to:
1. Re-crawl your site with HTTPS
2. See the canonical URLs
3. Update search results
4. Remove old HTTP URLs

## Monitor Progress

### Check Search Results Weekly

1. **Search in Google:**
   - `site:purepeelco.com`
   - Count how many show `https://` vs `http://`
   - Over time, all should show `https://`

2. **Check Google Search Console:**
   - Go to **Coverage** report
   - Check for any HTTP URLs in the index
   - Monitor indexing status

### Test Redirects

**Use these tools:**
- https://www.redirect-checker.org
- https://httpstatus.io
- Enter: `http://purepeelco.com`
- Should show: **301 Permanent Redirect** → `https://purepeelco.com`

## Additional Security: HSTS Preload

**For maximum security, submit to HSTS Preload:**
1. Go to: https://hstspreload.org
2. Enter: `purepeelco.com`
3. Check requirements (must have HSTS header with `preload`)
4. Submit for inclusion in browser preload lists

**Benefits:**
- Browsers will **never** use HTTP for your domain
- Even first-time visitors get HTTPS
- Maximum security

## Quick Action Checklist

1. ✅ Verify redirects work: `http://purepeelco.com` → `https://purepeelco.com`
2. ✅ Request indexing for `https://purepeelco.com` in Search Console
3. ✅ Request indexing for all product pages (HTTPS)
4. ✅ Request removal of `http://purepeelco.com` from Google index
5. ✅ Resubmit sitemap
6. ✅ Verify canonical URLs use HTTPS
7. ⏳ Wait 1-4 weeks for results
8. ⏳ Monitor search results weekly

## Current Status

**Your redirects are configured:**
- ✅ HTTP → HTTPS redirect in `vercel.json`
- ✅ HSTS header added (forces HTTPS)
- ✅ All canonical URLs use HTTPS
- ✅ Sitemap uses HTTPS

**What you need to do:**
- ⏳ Request re-indexing with HTTPS URLs
- ⏳ Request removal of HTTP URLs
- ⏳ Wait for Google to update search results

---

**Remember:** Google may have cached the HTTP version. Request re-indexing with HTTPS URLs and removal of HTTP URLs to fix this!
