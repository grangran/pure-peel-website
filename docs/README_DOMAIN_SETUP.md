# Domain Setup Guide for Pure Peel Co.

## Step 1: Purchase a Domain

### Recommended Domain Registrars

1. **Namecheap** (Recommended - Easy to use, good prices)
   - Website: https://www.namecheap.com
   - Price: ~$10-15/year for `.com` domains
   - Search for: `purepeelco.com` or `purepeel.com`

2. **Google Domains** (Now Squarespace Domains)
   - Website: https://domains.squarespace.com
   - Price: ~$12/year for `.com` domains

3. **Cloudflare Registrar** (Cheapest, but requires Cloudflare account)
   - Website: https://www.cloudflare.com/products/registrar
   - Price: ~$8-10/year (at-cost pricing)

4. **GoDaddy** (Popular, but more expensive)
   - Website: https://www.godaddy.com
   - Price: ~$12-20/year

### Domain Name Suggestions

- `purepeelco.com` (matches your brand)
- `purepeel.com` (shorter)
- `purepeel.ca` (Canadian domain)
- `getpurepeel.com`
- `purepeelproducts.com`

**Recommendation:** `purepeelco.com` - matches your Instagram handle @purepeelco

### How to Purchase

1. Go to one of the registrars above
2. Search for your desired domain name
3. Add to cart and checkout
4. Complete the purchase (usually takes 5-10 minutes to activate)

---

## Step 2: Verify Domain in Resend

Once you have your domain:

### 1. Add Domain to Resend

1. Go to: **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `purepeelco.com`)
4. Click **"Add"**

### 2. Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain registrar:

**Example DNS Records (Resend will give you exact values):**

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [Resend will provide this long string]

Type: CNAME (optional, for tracking)
Name: resend
Value: [Resend will provide]
```

### 3. Add DNS Records in Your Domain Registrar

**For Namecheap:**
1. Log in to Namecheap
2. Go to **Domain List** → Click **Manage** on your domain
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Add each record Resend provides
6. Save

**For Google Domains/Squarespace:**
1. Log in to your account
2. Select your domain
3. Go to **DNS** settings
4. Add the records Resend provides

**For Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add the records Resend provides

### 4. Wait for Verification

- Usually takes **5-15 minutes** for DNS to propagate
- Resend will show status: **Pending** → **Verified**
- You'll get an email when it's verified

---

## Step 3: Update Your Configuration

Once your domain is verified in Resend:

### 1. Update `.env` file

```env
# Update this line:
RESEND_FROM_EMAIL=noreply@purepeelco.com
# or
RESEND_FROM_EMAIL=hello@purepeelco.com
# or
RESEND_FROM_EMAIL=orders@purepeelco.com
```

**Note:** The email address must use your verified domain (the part after `@` must match your domain).

### 2. Restart Your Server

```bash
# Stop your server (Ctrl+C)
# Then restart:
npm run server
```

### 3. Test Email

```
http://localhost:3001/api/test-email?email=mattgranato2004@gmail.com
```

---

## Step 4: Optional - Set Up Your Website Hosting

After you have a domain, you'll want to:

### Option A: Deploy to Vercel (Recommended - Free)

1. Push your code to GitHub
2. Go to: https://vercel.com
3. Import your GitHub repository
4. Add environment variables (Stripe keys, Resend keys, etc.)
5. Vercel will give you a URL, then you can add your custom domain

### Option B: Deploy to Netlify (Free)

1. Push your code to GitHub
2. Go to: https://netlify.com
3. Import your repository
4. Add environment variables
5. Add your custom domain

### Option C: Deploy to Your Own Server

- Use services like DigitalOcean, AWS, or Heroku
- Point your domain's A record to your server IP

---

## Quick Checklist

- [ ] Purchase domain from registrar
- [ ] Add domain to Resend
- [ ] Add DNS records to your registrar
- [ ] Wait for Resend verification (5-15 minutes)
- [ ] Update `RESEND_FROM_EMAIL` in `.env`
- [ ] Restart server
- [ ] Test email delivery
- [ ] (Optional) Set up website hosting

---

## Cost Estimate

- **Domain:** $10-15/year
- **Resend:** Free tier (3,000 emails/month)
- **Hosting:** Free (Vercel/Netlify) or $5-10/month (VPS)

**Total:** ~$10-15/year for domain (hosting can be free)

---

## Need Help?

- **Domain purchase issues:** Contact your registrar's support
- **DNS setup:** Check Resend's documentation: https://resend.com/docs/dashboard/domains/introduction
- **Email delivery:** Check Resend dashboard for delivery status

---

## Current Status

- ✅ Resend API key configured
- ✅ Server sending emails
- ⏳ Need to purchase domain
- ⏳ Need to verify domain in Resend
- ⏳ Need to update `RESEND_FROM_EMAIL`

