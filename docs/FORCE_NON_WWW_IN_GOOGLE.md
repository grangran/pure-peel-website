# How to Get Google to Use https://purepeelco.com (Non-WWW)

## The Goal

Make sure Google shows `https://purepeelco.com` in search results, not `http://www.purepeelco.com` or any www version.

---

## Step 1: Redirects Are Set Up ✅

**I've already added redirects to `vercel.json`:**
- `www.purepeelco.com` → redirects to `https://purepeelco.com`
- `http://purepeelco.com` → redirects to `https://purepeelco.com`

**After deploying, test these:**
- Visit `https://www.purepeelco.com` → should redirect to `https://purepeelco.com`
- Visit `http://purepeelco.com` → should redirect to `https://purepeelco.com`

---

## Step 2: Use Correct Property in Google Search Console

**Important:** Google treats www and non-www as different properties.

1. **Go to Google Search Console:**
   - https://search.google.com/search-console

2. **Make sure you're using the correct property:**
   - Select: `https://purepeelco.com/` (URL prefix property)
   - **NOT** `purepeelco.com` (domain property)
   - **NOT** `https://www.purepeelco.com`

3. **If you don't have the non-www property:**
   - Click "Add Property"
   - Enter: `https://purepeelco.com`
   - Choose "URL prefix" method
   - Verify ownership (HTML tag, file, or DNS)

---

## Step 3: Request Re-Indexing

**This tells Google to re-crawl your site with the correct URLs:**

### For Homepage:
1. In Google Search Console, click **"URL Inspection"** (left sidebar)
2. Enter: `https://purepeelco.com`
3. Click **"Test Live URL"**
4. Wait for it to check
5. Click **"Request Indexing"**

### For Important Pages:
Repeat the above for:
- `https://purepeelco.com/orange`
- `https://purepeelco.com/pink-orange`
- `https://purepeelco.com/lime`
- `https://purepeelco.com/lemon`
- `https://purepeelco.com/apple`

---

## Step 4: Resubmit Sitemap

**Your sitemap already uses non-www URLs, but resubmit it:**

1. In Google Search Console, go to **"Sitemaps"** (left sidebar)
2. If `sitemap.xml` is already submitted:
   - Click **"Resubmit"** or **"Test sitemap"**
3. If not submitted:
   - Enter: `sitemap.xml`
   - Click **"Submit"**

**This tells Google to re-crawl all pages with the correct URLs.**

---

## Step 5: Set Preferred Domain (If Available)

**Some Google Search Console properties have this option:**

1. Go to **"Settings"** → **"Site Settings"**
2. Look for **"Preferred domain"** option
3. If available, select: `https://purepeelco.com` (without www)
4. Save changes

**Note:** This setting might not be available for all properties, but if it is, it helps Google know which version to show.

---

## Step 6: Verify Canonical URLs

**Your site already has canonical URLs set correctly:**
- All pages use: `<link rel="canonical" href="https://purepeelco.com/...">`
- This tells Google which URL is the "official" version

**To verify:**
1. Visit any page on your site
2. View page source (right-click → View Page Source)
3. Look for: `<link rel="canonical" href="https://purepeelco.com/...">`
4. Should show `https://purepeelco.com` (not www)

---

## Step 7: Wait and Monitor

**Google needs time to re-crawl and update:**

1. **Wait 1-2 weeks** for Google to re-crawl
2. **Monitor in Google Search Console:**
   - Go to "Performance" → "Search Results"
   - Check which URLs are showing in search
3. **Test in Google Search:**
   - Search: `site:purepeelco.com`
   - Check if results show `https://purepeelco.com` (not www)

---

## Step 8: If www Still Shows Up

**If after 2 weeks Google still shows www:**

1. **Add www as separate property (optional):**
   - Add `https://www.purepeelco.com` as a property
   - This lets you monitor both versions
   - But focus on non-www for indexing

2. **Request removal of www URLs:**
   - In Google Search Console (www property)
   - Go to "Removals" → "New Request"
   - Request removal of www URLs
   - This is temporary (90 days), but helps during transition

3. **Continue requesting indexing:**
   - Keep requesting indexing for non-www URLs
   - Google will eventually switch over

---

## Quick Checklist

- [ ] Redirects added to `vercel.json` (already done)
- [ ] Deploy changes to Vercel
- [ ] Test redirects work (www → non-www, http → https)
- [ ] Use `https://purepeelco.com/` property in Google Search Console
- [ ] Request indexing for homepage and product pages
- [ ] Resubmit sitemap.xml
- [ ] Set preferred domain (if available)
- [ ] Verify canonical URLs are correct
- [ ] Wait 1-2 weeks for Google to update
- [ ] Monitor in Google Search Console

---

## Summary

**To get Google to use `https://purepeelco.com`:**

1. ✅ **Redirects are set up** (www → non-www, http → https)
2. ✅ **Canonical URLs are correct** (already using non-www)
3. ✅ **Sitemap uses non-www** (already updated)
4. ⏳ **Request re-indexing** in Google Search Console
5. ⏳ **Wait for Google to re-crawl** (1-2 weeks)

**The redirects will force all traffic to non-www, and Google will eventually update its index to match.**

