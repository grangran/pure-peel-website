# Complete SEO Guide - Getting Your Website on Google

## Current Status ✅

Your website already has:
- ✅ **Meta tags** (title, description, keywords)
- ✅ **Open Graph tags** (for social sharing)
- ✅ **Sitemap.xml** (`/sitemap.xml`)
- ✅ **Structured data** (Schema.org)
- ✅ **robots.txt** (allows search engines)

**You're already 70% there!** Now let's get Google to find and index your site.

---

## Step 1: Google Search Console (MOST IMPORTANT) ⭐

**This is the #1 way to get Google to index your site.**

### 1.1 Set Up Google Search Console

**Important: www vs non-www**

Google treats `https://purepeelco.com` and `https://www.purepeelco.com` as **different properties**. 

**Your site is configured to use:** `https://purepeelco.com` (non-www)

**What to do:**
1. **Go to:** https://search.google.com/search-console
2. **Sign in** with your Google account
3. **Add Property:**
   - Click "Add Property"
   - Enter: `https://purepeelco.com` (without www)
   - Choose "URL prefix" method

**Optional (Recommended):**
- Also add `https://www.purepeelco.com` as a separate property
- This way you can track both versions
- Set up redirects so www redirects to non-www (see below)

**Which one to use?**
- Your site is configured for: `https://purepeelco.com` (non-www) ✅
- All your URLs, sitemap, and canonical tags use non-www
- **Use `https://purepeelco.com` in Google Search Console**
- If `www.purepeelco.com` also works, add it as a separate property and set up redirects

### 1.2 Verify Ownership

**Option A: HTML File (Easiest)**
1. Google will give you an HTML file to download
2. Upload it to your website's root: `public/google-xxxxx.html`
3. Make sure it's accessible at: `https://purepeelco.com/google-xxxxx.html`
4. Click "Verify" in Google Search Console

**Option B: HTML Tag (Alternative)**
1. Google will give you a meta tag
2. Add it to your `index.html` in the `<head>` section
3. Click "Verify" in Google Search Console

**Option C: DNS Record (If you have domain access)**
1. Add a TXT record to your DNS (Cloudflare)
2. Google will verify automatically

### 1.3 Submit Your Sitemap

**Once verified:**
1. In Google Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Google will start crawling your site within 24-48 hours

**Result:** Google will discover and index all your pages!

### 1.4 Set Up www Redirect (Important!)

**If both www and non-www work, you need to redirect one to the other:**

**Why?**
- Google sees `www.purepeelco.com` and `purepeelco.com` as different sites
- This can cause duplicate content issues
- You want one canonical version (non-www in your case)

**How to set up redirect:**

**Option A: Vercel Redirects (If using Vercel)**
1. Create/edit `vercel.json` in your project root:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.purepeelco.com"
        }
      ],
      "destination": "https://purepeelco.com/:path*",
      "permanent": true
    }
  ]
}
```

**Option B: Cloudflare Redirect (If using Cloudflare)**
1. Go to Cloudflare Dashboard → Rules → Redirect Rules
2. Create rule:
   - If: Hostname equals `www.purepeelco.com`
   - Then: Redirect to `https://purepeelco.com/$1` (301 Permanent)

**Option C: DNS CNAME (Simpler)**
1. In your DNS settings, make sure:
   - `www` CNAME points to your hosting (Vercel)
   - Root domain (`@`) A record points to your hosting
2. Vercel/your host should handle the redirect automatically

**Test it:**
- Visit `https://www.purepeelco.com`
- Should automatically redirect to `https://purepeelco.com`
- Check with: https://www.redirect-checker.org

---

## Step 2: Update Your Sitemap

**Your sitemap exists but may need updates:**

### Current Sitemap Location
- File: `public/sitemap.xml`
- URL: `https://purepeelco.com/sitemap.xml`

### Add Missing Pages

Check if these pages are in your sitemap:
- ✅ Homepage (`/`)
- ✅ Product pages (`/orange`, `/pink-orange`, `/lime`, `/lemon`, `/apple`)
- ✅ Information pages (`/shipping-returns`, `/privacy`, `/terms`)
- ❓ Checkout page (usually `noindex` - don't add)
- ❓ Order tracking (usually `noindex` - don't add)

**Update `lastmod` dates** when you make changes to pages.

---

## Step 3: Google Analytics (Track Visitors)

**See who's visiting your site:**

1. **Go to:** https://analytics.google.com
2. **Create Account** (if you don't have one)
3. **Set up Property:**
   - Property name: "Pure Peel Co."
   - Website URL: `https://purepeelco.com`
   - Industry: Food & Beverage
   - Time zone: Your timezone

4. **Get Tracking ID:**
   - Copy your Measurement ID (looks like `G-XXXXXXXXXX`)

5. **Add to Your Website:**
   - Create file: `public/analytics.js`
   - Add Google Analytics script
   - Or use Google Tag Manager (recommended)

**This helps you:**
- See how many people visit
- Which pages are popular
- Where visitors come from
- What they search for

---

## Step 4: Content Optimization

### 4.1 Page Titles (Already Good!)

**Your current titles are good, but optimize each page:**

**Homepage:**
```
Pure Peel Co. | Premium Dehydrated Citrus Slices | Made in Canada
```

**Product Pages:**
```
[Product Name] Dehydrated Slices | Pure Peel Co. | Premium Citrus
```

**Example:**
```
Orange Dehydrated Slices | Pure Peel Co. | Premium Citrus Garnish
```

### 4.2 Meta Descriptions

**Make them compelling and include keywords:**

**Homepage:**
```
Premium dehydrated citrus slices made in Canada. 100% Natural • No Preservatives • Perfect for cocktails, tea, and gourmet garnishes. Shop Orange, Pink Orange, Lime, Lemon, and Apple slices.
```

**Product Pages:**
```
Shop premium dehydrated [product] slices. Made in Canada, 100% natural, no preservatives. Perfect for cocktails, tea, charcuterie boards, and gourmet garnishes. Free shipping available.
```

### 4.3 Add More Content

**Google loves content! Add:**

1. **Blog Section** (if possible):
   - "How to Use Dehydrated Citrus in Cocktails"
   - "5 Creative Ways to Use Dried Orange Slices"
   - "The Benefits of Natural Food Garnishes"
   - "Canadian-Made Gourmet Ingredients"

2. **Product Descriptions:**
   - Make them longer (200-300 words)
   - Include keywords naturally
   - Add usage ideas
   - Include benefits

3. **About Page:**
   - Tell your story
   - Include location (for local SEO)
   - Add "Made in Canada" content

---

## Step 5: Local SEO (If Applicable)

**If you have a physical location or serve specific areas:**

### 5.1 Google Business Profile

1. **Go to:** https://www.google.com/business
2. **Create/Claim Business:**
   - Business name: Pure Peel Co.
   - Category: Food & Beverage Store / Online Store
   - Address: Your address (or service area)
   - Phone: Your phone number
   - Website: `https://purepeelco.com`

3. **Add Information:**
   - Business hours
   - Photos of products
   - Description
   - Products/services

### 5.2 Local Keywords

**Add location-based keywords:**
- "dehydrated citrus Canada"
- "Canadian made citrus slices"
- "Toronto dehydrated citrus" (if applicable)
- "Ontario gourmet garnish" (if applicable)

---

## Step 6: Image SEO

**Optimize your product images:**

### 6.1 Image File Names

**Use descriptive names:**
- ❌ `IMG_1234.jpg`
- ✅ `dehydrated-orange-slices-canada.jpg`
- ✅ `premium-citrus-garnish-cocktail.jpg`

### 6.2 Alt Text

**Add alt text to all images:**
```html
<img 
  src="/images/orange-product.jpg" 
  alt="Premium dehydrated orange slices in clear packaging, perfect for cocktails and tea garnishes"
/>
```

**Good alt text:**
- Describes what's in the image
- Includes relevant keywords
- Natural and readable

---

## Step 7: Page Speed (Important for SEO)

**Google ranks faster sites higher:**

### 7.1 Check Your Speed

1. **Google PageSpeed Insights:**
   - Go to: https://pagespeed.web.dev
   - Enter: `https://purepeelco.com`
   - Check scores (aim for 90+)

2. **GTmetrix:**
   - Go to: https://gtmetrix.com
   - Test your site
   - See what needs optimization

### 7.2 Optimize Images

**Your images might be too large:**

1. **Compress images:**
   - Use tools like TinyPNG or Squoosh
   - Reduce file size by 50-70%
   - Keep quality high

2. **Use WebP format:**
   - Modern format, smaller files
   - Better compression
   - Supported by all modern browsers

3. **Lazy loading:**
   - Already implemented ✅
   - Images load as user scrolls

---

## Step 8: Backlinks (Get Other Sites to Link to You)

**Google sees backlinks as "votes" for your site:**

### 8.1 Free Backlink Opportunities

1. **Social Media:**
   - Instagram bio link
   - Facebook page link
   - LinkedIn company page
   - Pinterest boards

2. **Business Directories:**
   - Yelp (if applicable)
   - Yellow Pages
   - Canadian business directories
   - Local chamber of commerce

3. **Product Directories:**
   - Etsy (if you sell there)
   - Amazon (if applicable)
   - Canadian food directories

4. **Blog/Content:**
   - Guest posts on food blogs
   - Cocktail recipe sites
   - Foodie Instagram accounts
   - Recipe sharing sites

### 8.2 Outreach

**Reach out to:**
- Food bloggers
- Cocktail recipe sites
- Canadian food websites
- Local news/media
- Influencers in food/cocktail space

**Ask them to:**
- Review your products
- Feature in recipes
- Link to your site

---

## Step 9: Social Media Integration

**Social signals help SEO:**

### 9.1 Social Media Links

**Add to your website:**
- Instagram: `https://www.instagram.com/purepeelco/`
- Facebook (if you have one)
- Pinterest (if applicable)
- TikTok (if applicable)

### 9.2 Share Buttons

**Add share buttons to:**
- Product pages
- Blog posts (if you add a blog)
- Homepage

**Makes it easy for people to share your content.**

---

## Step 10: Mobile Optimization

**Google prioritizes mobile-friendly sites:**

### 10.1 Test Mobile Friendliness

1. **Google Mobile-Friendly Test:**
   - Go to: https://search.google.com/test/mobile-friendly
   - Enter: `https://purepeelco.com`
   - Should pass ✅

2. **Check on Real Devices:**
   - Test on iPhone
   - Test on Android
   - Make sure everything works

### 10.2 Responsive Design

**Your site should already be responsive, but check:**
- ✅ Text is readable
- ✅ Buttons are clickable
- ✅ Images load properly
- ✅ Forms work correctly
- ✅ Navigation is easy

---

## Step 11: Schema Markup (Structured Data)

**You already have this! ✅**

**Check it's working:**
1. **Google Rich Results Test:**
   - Go to: https://search.google.com/test/rich-results
   - Enter: `https://purepeelco.com`
   - Should show structured data

2. **Add More Schema:**
   - Product schema (for each product)
   - Review schema (if you have reviews)
   - FAQ schema (if you have FAQs)
   - Breadcrumb schema

---

## Step 12: Monitor and Improve

### 12.1 Track Your Progress

**Check weekly:**
- Google Search Console → Performance
- See which keywords people search
- See which pages get traffic
- See click-through rates

### 12.2 Fix Issues

**Google Search Console will show:**
- ❌ Pages with errors
- ❌ Broken links
- ❌ Mobile issues
- ❌ Speed issues

**Fix these immediately!**

---

## Quick Action Checklist

**Do These First (This Week):**

1. ✅ **Set up Google Search Console** (30 minutes)
   - Verify ownership
   - Submit sitemap

2. ✅ **Set up Google Analytics** (15 minutes)
   - Get tracking code
   - Add to website

3. ✅ **Check sitemap** (10 minutes)
   - Make sure all pages are included
   - Update lastmod dates

4. ✅ **Optimize images** (1-2 hours)
   - Compress large images
   - Add alt text

5. ✅ **Test mobile friendliness** (5 minutes)
   - Use Google's tool
   - Fix any issues

**Do These Next (This Month):**

6. ⏳ **Add more content**
   - Expand product descriptions
   - Add blog posts (if possible)

7. ⏳ **Get backlinks**
   - Social media links
   - Business directories
   - Reach out to bloggers

8. ⏳ **Set up Google Business Profile** (if applicable)
   - Claim your business
   - Add information

9. ⏳ **Monitor performance**
   - Check Search Console weekly
   - Track improvements

---

## Expected Timeline

**When will you see results?**

- **Week 1-2:** Google starts crawling (if Search Console is set up)
- **Week 2-4:** First pages get indexed
- **Month 2-3:** Start seeing organic traffic
- **Month 3-6:** Steady growth in rankings
- **Month 6+:** Established rankings

**Important:** SEO takes time! Be patient and consistent.

---

## Tools You'll Need

**Free Tools:**
- Google Search Console (free)
- Google Analytics (free)
- Google PageSpeed Insights (free)
- Google Mobile-Friendly Test (free)
- GTmetrix (free tier)

**Paid Tools (Optional):**
- Ahrefs (backlink analysis)
- SEMrush (keyword research)
- Screaming Frog (site audit)

**For now, free tools are enough!**

---

## Common Mistakes to Avoid

❌ **Don't:**
- Stuff keywords unnaturally
- Buy backlinks (Google penalizes this)
- Ignore mobile users
- Forget to update sitemap
- Use duplicate content
- Ignore page speed

✅ **Do:**
- Write naturally
- Focus on user experience
- Update content regularly
- Monitor Search Console
- Be patient
- Provide value

---

## Need Help?

**Resources:**
- Google Search Central: https://developers.google.com/search
- Google Search Console Help: https://support.google.com/webmasters
- Moz Beginner's Guide: https://moz.com/beginners-guide-to-seo

**Your website is already well-optimized!** Just need to:
1. Set up Google Search Console
2. Submit sitemap
3. Wait for Google to index
4. Monitor and improve

**Start with Step 1 (Google Search Console) - it's the most important!** 🚀

