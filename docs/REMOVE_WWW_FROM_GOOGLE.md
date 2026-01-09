# Remove www.purepeelco.com from Google Search Results

## The Problem

Google search results are showing:
- `https://www.purepeelco.com` ❌

But you want:
- `https://purepeelco.com` ✅ (non-www only)

## Why This Happens

1. **Google indexed both versions** - Google may have found and indexed both www and non-www
2. **Both URLs work** - Even though you redirect www → non-www, Google may have indexed both
3. **Canonical URLs need time** - Google needs to re-crawl to see your canonical tags pointing to non-www

## Solution: Remove www URLs from Google

### Step 1: Verify Redirects Are Working

**Test the redirect:**
1. Visit: `https://www.purepeelco.com`
2. Should automatically redirect to: `https://purepeelco.com`
3. Check with: https://www.redirect-checker.org

**Your redirect is already configured in `vercel.json`:**
- ✅ `www.purepeelco.com` → redirects to `purepeelco.com` (301 Permanent)

### Step 2: Add www Property to Google Search Console (If Not Already Added)

1. **Go to Google Search Console:**
   - https://search.google.com/search-console

2. **Add www property:**
   - Click **"+ Add Property"**
   - Select **"URL prefix"**
   - Enter: `https://www.purepeelco.com`
   - Click **"Continue"**
   - Verify ownership (if needed)

**Why?** You need access to the www property to request removal of www URLs.

### Step 3: Request Removal of www URLs

1. **In Google Search Console:**
   - Select property: `https://www.purepeelco.com`

2. **Go to Removals:**
   - Click **"Removals"** in left sidebar (under Indexing)
   - Click **"New Request"**

3. **Request removal:**
   - Enter: `https://www.purepeelco.com`
   - Select reason: **"Temporarily hide"** or **"Outdated content"**
   - Click **"Submit Request"**

4. **Request removal of www pages:**
   - Repeat for important pages:
     - `https://www.purepeelco.com/`
     - `https://www.purepeelco.com/orange`
     - `https://www.purepeelco.com/pink-orange`
     - `https://www.purepeelco.com/lime`
     - `https://www.purepeelco.com/lemon`
     - `https://www.purepeelco.com/apple`

### Step 4: Request Re-Indexing with Non-WWW URLs

**In the non-www property (`https://purepeelco.com/`):**

1. **Go to URL Inspection:**
   - Click **"URL Inspection"** in left sidebar
   - Enter: `https://purepeelco.com`
   - Click **"Test Live URL"**
   - Click **"Request Indexing"**

2. **Request indexing for product pages:**
   - Repeat for:
     - `https://purepeelco.com/orange`
     - `https://purepeelco.com/pink-orange`
     - `https://purepeelco.com/lime`
     - `https://purepeelco.com/lemon`
     - `https://purepeelco.com/apple`

### Step 5: Submit Updated Sitemap (Non-WWW Only)

1. **In Google Search Console (`https://purepeelco.com/` property):**
   - Go to **"Sitemaps"** (under Indexing)
   - Verify `sitemap.xml` is submitted
   - Click **"Resubmit"** or **"Test sitemap"** → **"Request indexing"**

2. **Verify sitemap uses non-www:**
   - Visit: `https://purepeelco.com/sitemap.xml`
   - All URLs should start with `https://purepeelco.com` (no www)

### Step 6: Set Preferred Domain (If Available)

1. **In Google Search Console (`https://purepeelco.com/` property):**
   - Go to **Settings** → **Site Settings**
   - Look for **"Preferred domain"** option
   - If available, select: **`purepeelco.com`** (without www)
   - **Save changes**

**Note:** This setting may not be available in newer versions, but if it is, it helps.

## How Long Will This Take?

- **Removal requests:** 1-3 days
- **Re-indexing requests:** 1-7 days
- **Search results update:** 1-4 weeks
- **Full transition:** 2-8 weeks

**Be patient!** Google needs time to:
1. Process removal requests
2. Re-crawl your site with non-www URLs
3. See the canonical URLs
4. Update search results

## Monitor Progress

### Check Search Results Weekly

1. **Search in Google:**
   - `site:purepeelco.com`
   - Count how many show `https://purepeelco.com` vs `https://www.purepeelco.com`
   - Over time, all should show non-www

2. **Check Google Search Console:**
   - Go to **Coverage** report (in both properties)
   - Check for any www URLs in the index
   - Monitor indexing status

### Test Redirects

**Use these tools:**
- https://www.redirect-checker.org
- https://httpstatus.io
- Enter: `https://www.purepeelco.com`
- Should show: **301 Permanent Redirect** → `https://purepeelco.com`

## Current Status

**Your redirects are working:**
- ✅ `www.purepeelco.com` → redirects to `purepeelco.com` (301)
- ✅ All canonical URLs use non-www
- ✅ Sitemap uses non-www URLs

**What you need to do:**
- ⏳ Add www property to Search Console (if not already added)
- ⏳ Request removal of www URLs
- ⏳ Request re-indexing with non-www URLs
- ⏳ Wait for Google to update search results

## Quick Action Checklist

1. ✅ Verify redirect works: `https://www.purepeelco.com` → `https://purepeelco.com`
2. ✅ Add `https://www.purepeelco.com` property to Search Console (if needed)
3. ✅ Request removal of `https://www.purepeelco.com` in Search Console
4. ✅ Request removal of www product pages
5. ✅ Request indexing for `https://purepeelco.com` (non-www)
6. ✅ Request indexing for non-www product pages
7. ✅ Resubmit sitemap (non-www property)
8. ✅ Set preferred domain to non-www (if option available)
9. ⏳ Wait 1-4 weeks for results
10. ⏳ Monitor search results weekly

## Alternative: Use Domain Property

**If you have a Domain property (`purepeelco.com`):**

1. **In Domain property:**
   - Go to **Settings** → **Domain Settings**
   - Set preferred domain: **`purepeelco.com`** (non-www)
   - This applies to both www and non-www

2. **Request removals:**
   - Go to **Removals**
   - Request removal of www URLs

**Note:** Domain properties can manage both www and non-www versions together.

---

**Remember:** Your redirects are already working. You just need to tell Google to remove the www version from search results and prioritize the non-www version!
