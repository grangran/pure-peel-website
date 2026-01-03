# Fix: "Site Can't Be Reached" - Domain Not Working

## The Problem

When you visit `https://purepeelco.com`, you get "site can't be reached" or "could not resolve host".

**This means:**
- The domain isn't connected to your hosting (Vercel)
- OR DNS records aren't set up correctly
- OR the site isn't deployed yet

---

## Quick Checklist

**Check these in order:**

1. ✅ **Is your site deployed to Vercel?**
   - Go to: https://vercel.com
   - Check if you have a project deployed
   - Does it have a `.vercel.app` URL? (e.g., `your-project.vercel.app`)

2. ✅ **Is your domain added in Vercel?**
   - Vercel project → **Settings** → **Domains**
   - Is `purepeelco.com` listed?
   - What's the status? (Valid, Pending, Error)

3. ✅ **Are DNS records configured?**
   - Go to your DNS provider (Cloudflare, Namecheap, etc.)
   - Are the DNS records from Vercel added?

---

## Step-by-Step Fix

### Step 1: Check Vercel Deployment

1. **Go to Vercel Dashboard:** https://vercel.com
2. **Check if you have a project:**
   - If no project → You need to deploy first (see below)
   - If you have a project → Check if it's deployed successfully

3. **Check deployment status:**
   - Look for green checkmark ✅
   - If there's an error → Fix it first

**If you haven't deployed yet:**
- Follow the deployment guide: `docs/DEPLOYMENT_GUIDE.md`
- Deploy your site to Vercel first
- Get a `.vercel.app` URL working before adding custom domain

---

### Step 2: Add Domain to Vercel

**If your site is deployed but domain isn't connected:**

1. **In Vercel:**
   - Go to your project
   - Click **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter: `purepeelco.com`
   - Click **"Add"**

2. **Vercel will show you DNS records:**
   - It will give you specific records to add
   - Copy these exactly

**Example DNS records Vercel might give you:**

**For root domain (purepeelco.com):**
```
Type: A
Name: @
Value: 76.76.21.21 (example - Vercel will give you the real IP)
```

**OR it might use CNAME:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 3: Add DNS Records

**Go to your DNS provider and add the records Vercel gave you:**

#### If using Cloudflare:

1. **Go to Cloudflare Dashboard**
2. **Select your domain:** `purepeelco.com`
3. **Go to DNS → Records**
4. **Add the records Vercel gave you:**
   - Click **"Add record"**
   - Enter Type, Name, and Value exactly as Vercel shows
   - Click **"Save"**

5. **Important in Cloudflare:**
   - Make sure **Proxy status is OFF (DNS only)** for the A/CNAME records
   - Click the orange cloud to turn it gray (DNS only)
   - This is important for Vercel to work correctly

#### If using Namecheap:

1. **Go to Namecheap Dashboard**
2. **Domain List** → Click **"Manage"** on your domain
3. **Advanced DNS** tab
4. **Add the records Vercel gave you**
5. **Save**

#### If using other providers:

- Google Domains/Squarespace
- GoDaddy
- Any other registrar
- Add the DNS records in their DNS management section

---

### Step 4: Wait for DNS Propagation

**After adding DNS records:**

1. **Wait 5-60 minutes** (usually works within 15 minutes)
2. **Check if it's working:**
   - Visit: `https://purepeelco.com`
   - Should load your site!

3. **If still not working after 1 hour:**
   - Check DNS records are correct
   - Make sure you saved them
   - Check Vercel dashboard for any errors

---

## Troubleshooting

### "Domain not found in Vercel"

**Solution:**
- Add the domain in Vercel first (Step 2 above)
- Make sure you own the domain
- Check domain spelling

### "DNS records not working"

**Check:**
1. Are records added correctly?
2. Did you save them?
3. Is the Type correct? (A or CNAME)
4. Is the Name correct? (`@` for root, `www` for subdomain)
5. Is the Value correct? (exact IP or CNAME from Vercel)

**For Cloudflare specifically:**
- Make sure Proxy is OFF (gray cloud, not orange)
- Vercel needs direct DNS, not proxied

### "Site loads but shows Vercel error page"

**This means DNS is working but site isn't deployed:**
- Check Vercel deployment status
- Make sure build succeeded
- Check for deployment errors

### "Can access .vercel.app but not custom domain"

**This means:**
- Site is deployed ✅
- Domain DNS not configured ❌
- Follow Step 3 above to add DNS records

---

## Quick Test

**Test if your site is accessible:**

1. **Check Vercel URL:**
   - Go to Vercel dashboard
   - Find your project's URL (e.g., `your-project.vercel.app`)
   - Visit that URL in browser
   - Does it work? ✅

2. **Check custom domain:**
   - Visit: `https://purepeelco.com`
   - Does it work? ❌ (if not, follow steps above)

---

## Common Issues

### Issue 1: Domain Not Added to Vercel

**Symptom:** Domain doesn't appear in Vercel dashboard

**Fix:**
- Add domain in Vercel (Settings → Domains → Add Domain)
- Follow DNS setup instructions

### Issue 2: DNS Records Wrong

**Symptom:** Domain added but site doesn't load

**Fix:**
- Double-check DNS records match Vercel's instructions exactly
- Make sure you saved them
- Wait 15-30 minutes for propagation

### Issue 3: Cloudflare Proxy Enabled

**Symptom:** Site doesn't load with Cloudflare

**Fix:**
- In Cloudflare DNS records
- Click the orange cloud icon
- Turn it gray (DNS only, no proxy)
- Wait 5-10 minutes

### Issue 4: Site Not Deployed

**Symptom:** Nothing works, no Vercel URL

**Fix:**
- Deploy site to Vercel first
- Get `.vercel.app` URL working
- Then add custom domain

---

## Need Help?

**Check:**
1. Vercel dashboard - is site deployed?
2. Vercel domains - is domain added?
3. DNS provider - are records added?
4. Wait time - did you wait 15-30 minutes?

**If still not working:**
- Check Vercel documentation: https://vercel.com/docs/concepts/projects/domains
- Check your DNS provider's documentation
- Contact Vercel support if domain is added but not working

---

## Summary

**To fix "site can't be reached":**

1. ✅ Deploy site to Vercel (if not done)
2. ✅ Add domain in Vercel (Settings → Domains)
3. ✅ Add DNS records from Vercel to your DNS provider
4. ✅ Wait 15-30 minutes for DNS propagation
5. ✅ Test: Visit `https://purepeelco.com`

**Most common issue:** DNS records not added or configured incorrectly!


