# Fix: Cloudflare DNS for Vercel Domain

## The Problem

Your domain `purepeelco.com` is in Vercel but shows DNS_PROBE_FINISHED_NXDOMAIN error.

**This usually means:**
- DNS records in Cloudflare aren't configured correctly
- OR the root domain (@) record is missing
- OR Cloudflare proxy is enabled (should be DNS only)

---

## Step-by-Step Fix

### Step 1: Get DNS Records from Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com
   - Select your project
   - Go to **Settings → Domains**
   - Click on `purepeelco.com`

2. **Vercel will show you DNS records:**
   - It will show either an **A record** (IP address) or **CNAME record**
   - Copy the exact Type, Name, and Value

**Example of what Vercel might show:**
```
Type: A
Name: @
Value: 76.76.21.21
```

OR

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

### Step 2: Check Cloudflare DNS Records

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Select domain: `purepeelco.com`
   - Go to **DNS → Records**

2. **Look for root domain record:**
   - Find a record with **Name:** `@` or blank (for root domain)
   - Check what Type and Value it has

---

### Step 3: Fix the DNS Record

#### Option A: If root domain record EXISTS but is wrong

1. **Click the record to edit it**
2. **Update it to match Vercel:**
   - **Type:** A or CNAME (as Vercel shows)
   - **Name:** `@`
   - **IPv4 address** or **Target:** (exact value from Vercel)
   - **Proxy status:** Click the cloud icon to make it **GRAY** (DNS only) ⚠️ CRITICAL
   - **TTL:** Auto
   - Click **"Save"**

#### Option B: If root domain record DOESN'T exist

1. **Click "Add record"**
2. **Fill in:**
   - **Type:** A or CNAME (as Vercel shows)
   - **Name:** `@`
   - **IPv4 address** (if A record) or **Target** (if CNAME): (exact value from Vercel)
   - **Proxy status:** Make sure cloud is **GRAY** (DNS only) ⚠️ CRITICAL
   - **TTL:** Auto
   - Click **"Save"**

#### Option C: If you have multiple root domain records

1. **Remove all A and CNAME records for root domain (@)**
2. **Add only ONE record** matching what Vercel wants
3. **Make sure proxy is OFF (gray cloud)**

---

### Step 4: Verify Proxy Status

**CRITICAL:** The cloud icon must be **GRAY** (DNS only), not **ORANGE** (proxied)

- ✅ **Gray cloud** = DNS only (correct for Vercel)
- ❌ **Orange cloud** = Proxied (will break Vercel)

**To fix:**
- Click the orange cloud icon
- It should turn gray
- Save the record

---

### Step 5: Wait for DNS Propagation

1. **Wait 5-30 minutes** (usually 15 minutes)
2. **Test the domain:**
   - Visit: `https://purepeelco.com`
   - Should load your site!

3. **Check DNS propagation:**
   - Go to: https://dnschecker.org
   - Enter: `purepeelco.com`
   - Select record type: A or CNAME (as you configured)
   - Check if records are propagating globally

---

## Common Cloudflare Issues

### Issue 1: Proxy Enabled (Orange Cloud)

**Symptom:** Site doesn't load even with correct DNS

**Fix:**
- Click the orange cloud icon on the DNS record
- Turn it gray (DNS only)
- Wait 5-10 minutes

### Issue 2: Wrong Record Type

**Symptom:** Vercel wants A record but you have CNAME (or vice versa)

**Fix:**
- Delete the wrong record
- Add the correct type Vercel wants
- Make sure proxy is OFF

### Issue 3: Wrong Value

**Symptom:** Record exists but value doesn't match Vercel

**Fix:**
- Edit the record
- Update the Value to exactly match Vercel
- Save

### Issue 4: Multiple Root Domain Records

**Symptom:** Multiple A or CNAME records for @

**Fix:**
- Remove all root domain records
- Add only ONE matching Vercel's requirements
- Make sure proxy is OFF

---

## Quick Checklist

- [ ] Got DNS records from Vercel (Settings → Domains)
- [ ] Checked Cloudflare DNS records
- [ ] Root domain (@) record exists and matches Vercel
- [ ] Proxy is OFF (gray cloud, not orange)
- [ ] Only ONE root domain record exists
- [ ] Waited 15-30 minutes
- [ ] Tested at https://purepeelco.com

---

## Still Not Working?

1. **Double-check Vercel:**
   - Go to Settings → Domains
   - Click on `purepeelco.com`
   - What does it say? (Valid, Pending, Error?)
   - Copy the exact DNS records it shows

2. **Double-check Cloudflare:**
   - DNS → Records
   - Is there a record for `@`?
   - Does the Type and Value match Vercel exactly?
   - Is the cloud gray (not orange)?

3. **Check DNS propagation:**
   - https://dnschecker.org
   - Enter `purepeelco.com`
   - Are records showing up globally?

4. **Contact support:**
   - Vercel: https://vercel.com/support
   - Cloudflare: https://support.cloudflare.com

---

## Summary

**To fix DNS error with Cloudflare + Vercel:**

1. ✅ Get DNS records from Vercel (Settings → Domains)
2. ✅ Check Cloudflare DNS records (DNS → Records)
3. ✅ Add/Edit root domain (@) record to match Vercel
4. ✅ Make sure proxy is OFF (gray cloud)
5. ✅ Wait 15-30 minutes
6. ✅ Test the domain

