# Fix: DNS_PROBE_FINISHED_NXDOMAIN Error

## The Problem

When you visit `purepeelco.com`, you get:
- **"This site can't be reached"**
- **"DNS_PROBE_FINISHED_NXDOMAIN"**

This means the domain DNS records aren't configured correctly.

---

## Quick Fix Steps

### Step 1: Check Vercel Domain Configuration

1. **Go to Vercel Dashboard:**
   - https://vercel.com
   - Log in and select your project

2. **Go to Settings → Domains:**
   - Check if `purepeelco.com` is listed
   - What's the status? (Valid ✅, Pending ⏳, or Error ❌)

3. **If domain is NOT listed:**
   - Click **"Add Domain"**
   - Enter: `purepeelco.com`
   - Click **"Add"**
   - Vercel will show you DNS records to add

4. **If domain IS listed but shows Error:**
   - Click on the domain
   - Check what DNS records Vercel wants
   - Copy the exact records shown

---

### Step 2: Add DNS Records to Your DNS Provider

**Vercel will give you one of these:**

#### Option A: A Record (IP Address)
```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.21.21 (example - use the IP Vercel gives you)
TTL: Auto (or 3600)
```

#### Option B: CNAME Record
```
Type: CNAME
Name: @ (or leave blank for root domain)
Value: cname.vercel-dns.com (or what Vercel shows)
TTL: Auto (or 3600)
```

---

### Step 3: Add Records to Your DNS Provider

#### If using Cloudflare:

1. **Go to Cloudflare Dashboard**
2. **Select domain:** `purepeelco.com`
3. **DNS → Records**
4. **Check if root domain record exists:**
   - Look for a record with Name: `@` or blank
   - If it exists, edit it
   - If it doesn't exist, click **"Add record"**

5. **Add/Edit the record:**
   - **Type:** A or CNAME (as Vercel shows)
   - **Name:** `@` (for root domain)
   - **Value:** (exact value from Vercel)
   - **Proxy status: OFF** (gray cloud, NOT orange) ⚠️ CRITICAL
   - Click **"Save"**

6. **Important:** The cloud icon must be **gray** (DNS only), not orange (proxied)

#### If using Namecheap:

1. **Go to Namecheap Dashboard**
2. **Domain List → Manage** (on `purepeelco.com`)
3. **Advanced DNS** tab
4. **Add/Edit the record:**
   - **Type:** A or CNAME
   - **Host:** `@` (for root domain)
   - **Value:** (from Vercel)
   - **TTL:** Automatic
   - **Save**

#### If using other providers (GoDaddy, Google Domains, etc.):

1. Log in to your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add the A or CNAME record Vercel provided
4. Name should be `@` for root domain
5. Save

---

### Step 4: Wait for DNS Propagation

**After adding DNS records:**

1. **Wait 5-60 minutes** (usually 15-30 minutes)
2. **Check if it's working:**
   - Visit: `https://purepeelco.com`
   - Should load your site!

3. **Test DNS propagation:**
   - Use: https://dnschecker.org
   - Enter: `purepeelco.com`
   - Check if DNS records are propagating globally

---

## Common Issues & Fixes

### Issue 1: Domain Not Added to Vercel

**Symptom:** Domain doesn't appear in Vercel dashboard

**Fix:**
- Add domain in Vercel (Settings → Domains → Add Domain)
- Follow DNS setup instructions Vercel provides

### Issue 2: DNS Records Wrong

**Symptom:** Domain added but site doesn't load

**Check:**
- ✅ Are records added correctly?
- ✅ Did you save them?
- ✅ Is the Type correct? (A or CNAME)
- ✅ Is the Name correct? (`@` for root domain)
- ✅ Is the Value correct? (exact IP or CNAME from Vercel)

### Issue 3: Cloudflare Proxy Enabled

**Symptom:** Site doesn't load with Cloudflare

**Fix:**
- In Cloudflare DNS records
- Click the **orange cloud** icon
- Turn it **gray** (DNS only, no proxy)
- Wait 5-10 minutes

### Issue 4: Multiple DNS Records Conflict

**Symptom:** Conflicting records

**Fix:**
- Remove any old/duplicate A or CNAME records for root domain
- Keep only the one Vercel wants
- Make sure there's only ONE record for `@` or root domain

---

## Quick Checklist

- [ ] Domain added to Vercel (Settings → Domains)
- [ ] DNS records copied from Vercel
- [ ] DNS records added to DNS provider
- [ ] Cloudflare proxy OFF (if using Cloudflare)
- [ ] Waited 15-30 minutes for propagation
- [ ] Tested at https://purepeelco.com

---

## Still Not Working?

1. **Check Vercel dashboard:**
   - Is domain status "Valid"?
   - Any error messages?

2. **Check DNS records:**
   - Use https://dnschecker.org
   - Enter `purepeelco.com`
   - Are records propagating?

3. **Contact support:**
   - Vercel support: https://vercel.com/support
   - Your DNS provider support

---

## Summary

**To fix DNS_PROBE_FINISHED_NXDOMAIN:**

1. ✅ Add domain to Vercel (if not added)
2. ✅ Get DNS records from Vercel
3. ✅ Add DNS records to your DNS provider
4. ✅ Make sure Cloudflare proxy is OFF (if using Cloudflare)
5. ✅ Wait 15-30 minutes
6. ✅ Test the domain

