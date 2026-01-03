# Fix: www.purepeelco.com Works But purepeelco.com Doesn't

## The Problem

Your site works at:
- ✅ `https://www.purepeelco.com` (works!)

But doesn't work at:
- ❌ `https://purepeelco.com` (doesn't work)

**This means:**
- Your site IS deployed ✅
- www subdomain is configured ✅
- Root domain (non-www) is NOT configured ❌

---

## Quick Fix: Add Root Domain to Vercel

### Step 1: Add Root Domain in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com
   - Select your project

2. **Go to Settings → Domains**

3. **Add the root domain:**
   - Click **"Add Domain"**
   - Enter: `purepeelco.com` (without www)
   - Click **"Add"**

4. **Vercel will show you DNS records:**
   - It will give you an **A record** or **CNAME** for the root domain
   - Copy these exactly

---

### Step 2: Add DNS Record for Root Domain

**Vercel will give you one of these options:**

#### Option A: A Record (IP Address)
```
Type: A
Name: @
Value: 76.76.21.21 (example - Vercel will give you the real IP)
TTL: Auto (or 3600)
```

#### Option B: CNAME Record
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com (or what Vercel shows)
TTL: Auto (or 3600)
```

**Add this to your DNS provider:**

#### If using Cloudflare:

1. **Go to Cloudflare Dashboard**
2. **Select domain:** `purepeelco.com`
3. **DNS → Records**
4. **Add the record Vercel gave you:**
   - Click **"Add record"**
   - Type: A or CNAME (as Vercel shows)
   - Name: `@` (for root domain)
   - Value: (exact value from Vercel)
   - **Proxy status: OFF** (gray cloud, not orange) ⚠️ IMPORTANT
   - Click **"Save"**

5. **Important:** Make sure the cloud icon is **gray** (DNS only), not orange (proxied)

#### If using Namecheap:

1. **Go to Namecheap Dashboard**
2. **Domain List → Manage**
3. **Advanced DNS tab**
4. **Add the record:**
   - Type: A or CNAME
   - Host: `@`
   - Value: (from Vercel)
   - TTL: Automatic
   - Save

#### If using other providers:

- Add the A or CNAME record as Vercel instructs
- Name should be `@` for root domain

---

### Step 3: Wait for DNS Propagation

**After adding the DNS record:**
- Wait **15-30 minutes**
- Visit: `https://purepeelco.com`
- Should work now! ✅

---

## Optional: Set Up Redirect (Recommended)

**Since your site is configured for non-www, you should redirect www to non-www:**

This ensures:
- All traffic goes to one canonical URL
- Better SEO (no duplicate content)
- Consistent branding

### Option A: Redirect in Vercel (Easiest)

**Update `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
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

**Then:**
1. Commit and push the changes
2. Vercel will automatically redirect www to non-www

### Option B: Redirect in Cloudflare (If using Cloudflare)

1. **Go to Cloudflare Dashboard**
2. **Rules → Redirect Rules**
3. **Create rule:**
   - **If:** Hostname equals `www.purepeelco.com`
   - **Then:** Redirect to `https://purepeelco.com/$1`
   - **Status code:** 301 (Permanent)

---

## Current Status

**What works:**
- ✅ `https://www.purepeelco.com` (works!)

**What needs fixing:**
- ❌ `https://purepeelco.com` (needs DNS record)

**After fix:**
- ✅ `https://purepeelco.com` (will work)
- ✅ `https://www.purepeelco.com` → redirects to non-www (optional)

---

## Quick Action Steps

**Do this now:**

1. ✅ **Add root domain in Vercel:**
   - Settings → Domains → Add Domain
   - Enter: `purepeelco.com`

2. ✅ **Add DNS record:**
   - Copy the A or CNAME record from Vercel
   - Add it to your DNS provider
   - Name: `@` (for root domain)
   - **Important:** If using Cloudflare, turn proxy OFF (gray cloud)

3. ✅ **Wait 15-30 minutes**

4. ✅ **Test:**
   - Visit: `https://purepeelco.com`
   - Should work!

5. ✅ **Optional - Set up redirect:**
   - Update `vercel.json` to redirect www to non-www
   - Commit and push

---

## Troubleshooting

### "Still not working after adding DNS record"

**Check:**
1. Did you save the DNS record?
2. Is the Name correct? (`@` for root domain)
3. Is the Value correct? (exact from Vercel)
4. If using Cloudflare, is proxy OFF? (gray cloud)
5. Did you wait 15-30 minutes?

### "Vercel says domain already added"

**Check:**
- Go to Vercel → Settings → Domains
- Is `purepeelco.com` listed?
- What's the status?
- If it shows an error, click it to see what's wrong

### "DNS record type confusion"

**Vercel might give you:**
- **A record** (IP address) - Use this if given
- **CNAME record** (alias) - Use this if given
- Some DNS providers don't support CNAME for root domain
- If CNAME doesn't work, use A record instead

---

## Summary

**To fix `purepeelco.com` not working:**

1. Add root domain in Vercel (Settings → Domains)
2. Add DNS record (A or CNAME) for root domain
3. Wait 15-30 minutes
4. Test: `https://purepeelco.com`

**Then (optional):**
5. Set up redirect from www to non-www

**Most likely issue:** DNS record for root domain (`@`) not added yet!


