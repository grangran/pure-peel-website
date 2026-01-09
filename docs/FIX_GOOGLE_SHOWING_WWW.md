# Fix: Google Showing www.purepeelco.com Instead of purepeelco.com

## The Problem

Google search results are showing:
- `https://www.purepeelco.com` ❌

But you want:
- `https://purepeelco.com` ✅

## Why This Happens

1. **Google has cached the www version** - Google indexed your site when it was accessible via www
2. **Both versions work** - Even though you redirect www → non-www, Google may have indexed both
3. **Canonical URLs need time** - Google needs to re-crawl to see your canonical tags

## Important: You Can't Remove Other Websites

**You cannot remove other websites from Google search results.** Those skincare/peel product results are separate websites that Google legitimately indexes. You can only:
- Improve your SEO to rank higher
- Use better keywords
- Get more backlinks
- Create better content

## Solution: Fix the www vs non-www Issue

### Step 1: Verify Both Properties in Google Search Console

1. **Go to:** https://search.google.com/search-console
2. **Add both properties** (if not already added):
   - `https://purepeelco.com` (non-www) - **This is your preferred version**
   - `https://www.purepeelco.com` (www) - Add this to track redirects

### Step 2: Set Preferred Domain (Non-WWW)

1. In Google Search Console, select **`https://purepeelco.com`** property
2. Go to **Settings** → **Site Settings**
3. Look for **"Preferred domain"** option
4. Select: **`purepeelco.com`** (without www)
5. **Save changes**

**Note:** This setting may not be available in newer versions of Search Console, but if it is, it helps Google know which version to show.

### Step 3: Request Re-Indexing for Non-WWW URLs

1. In Google Search Console, select **`https://purepeelco.com`** property
2. Click **"URL Inspection"** in the left sidebar
3. Enter: `https://purepeelco.com`
4. Click **"Test Live URL"**
5. Wait for it to check (should show "URL is on Google" or "URL is not on Google")
6. Click **"Request Indexing"**
7. Google will re-crawl your homepage with the non-www version

### Step 4: Request Re-Indexing for Important Pages

Repeat Step 3 for these pages:
- `https://purepeelco.com/orange`
- `https://purepeelco.com/pink-orange`
- `https://purepeelco.com/lime`
- `https://purepeelco.com/lemon`
- `https://purepeelco.com/apple`

### Step 5: Submit Updated Sitemap

1. In Google Search Console, go to **"Sitemaps"** (left sidebar)
2. You should see `sitemap.xml` already submitted
3. Click **"Resubmit"** or **"Test sitemap"** → **"Request indexing"**
4. This tells Google to re-crawl all pages with non-www URLs

### Step 6: Verify Redirects Are Working

Test these URLs to make sure redirects work:

1. **WWW to Non-WWW:**
   - Visit: `https://www.purepeelco.com`
   - Should automatically redirect to: `https://purepeelco.com`
   - Check with: https://www.redirect-checker.org

2. **HTTP to HTTPS:**
   - Visit: `http://purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

3. **HTTP WWW to HTTPS Non-WWW:**
   - Visit: `http://www.purepeelco.com`
   - Should redirect to: `https://purepeelco.com`

### Step 7: Check Your Current Setup

Your site already has:
- ✅ **Canonical URLs** set to `https://purepeelco.com` (non-www)
- ✅ **Redirects** in `vercel.json` (www → non-www)
- ✅ **Sitemap** uses non-www URLs
- ✅ **Meta tags** use non-www URLs

## How Long Will This Take?

- **Re-indexing requests:** 1-7 days
- **Search results update:** 1-4 weeks
- **Full transition:** 2-8 weeks

**Be patient!** Google needs time to:
1. Re-crawl your site
2. See the canonical URLs
3. Update search results

## Monitor Progress

### Check Search Results Weekly

1. Search: `site:purepeelco.com` in Google
2. Count how many results show `https://purepeelco.com` vs `https://www.purepeelco.com`
3. Over time, you should see more non-www results

### Check Google Search Console

1. Go to **Coverage** report
2. Check for any errors related to www vs non-www
3. Monitor indexing status

## Additional Tips to Rank Higher

Since you can't remove other websites, focus on ranking higher:

### 1. Improve SEO Keywords
- Use "dehydrated citrus slices" instead of just "pure peel"
- Add location: "dehydrated citrus Canada"
- Add use cases: "cocktail garnish dehydrated citrus"

### 2. Get Backlinks
- Reach out to food blogs
- Submit to Canadian food directories
- Partner with cocktail/bar websites

### 3. Create Content
- Blog posts about cocktail recipes
- How-to guides for using dehydrated citrus
- Canadian-made product features

### 4. Social Media
- Share on Instagram, Facebook
- Use relevant hashtags
- Engage with food/cocktail communities

## Current Status

**Your redirects are working:**
- ✅ `www.purepeelco.com` → redirects to `purepeelco.com`
- ✅ `http://` → redirects to `https://`

**Your canonical URLs are correct:**
- ✅ All pages use `https://purepeelco.com` as canonical

**What you need to do:**
- ⏳ Request re-indexing in Google Search Console
- ⏳ Wait for Google to update search results
- ⏳ Monitor progress weekly

## Quick Action Checklist

1. ✅ Verify `https://purepeelco.com` in Google Search Console
2. ✅ Set preferred domain to non-www (if option available)
3. ✅ Request indexing for homepage: `https://purepeelco.com`
4. ✅ Request indexing for product pages
5. ✅ Resubmit sitemap
6. ✅ Verify redirects are working
7. ⏳ Wait 1-4 weeks for results
8. ⏳ Monitor search results weekly

---

**Remember:** You can't remove other websites from Google, but you can improve your ranking and fix the www issue with these steps!
