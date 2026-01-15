# Production Deployment Guide

This guide will walk you through deploying your Pure Peel Co. website to production.

## Overview

Your website has two parts:
1. **Frontend** (React/Vite) - Deploy to Vercel
2. **Backend** (Express server) - Deploy to Railway or Render

---

## Step 1: Prepare Your Code

### 1.1 Create a `.gitignore` file (if you don't have one)

Make sure `.env` is in your `.gitignore`:

```bash
# In your project root
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
```

### 1.2 Test your build locally

```bash
cd pure-peel
npm run build
```

If the build succeeds, you're ready to deploy!

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Push to GitHub

1. Create a new repository on GitHub (if you haven't already)
2. Push your code:

```bash
cd /Users/matthewgranato/Downloads/Pure\ Peel\ Co.\ Website/pure-peel
git init
git add .
git commit -m "Initial commit - ready for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel will auto-detect your settings (it should see `vercel.json`)
6. **Don't deploy yet** - we need to set environment variables first!

### 2.3 Add Frontend Environment Variables

In Vercel project settings, go to **Settings → Environment Variables** and add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (your Stripe publishable key)
VITE_API_URL=https://your-backend-url.railway.app (we'll set this after backend deployment)
```

**Important:** 
- Use `pk_live_...` for production (not `pk_test_...`)
- The `VITE_API_URL` will be your backend URL (we'll get this in Step 3)

### 2.4 Deploy

Click **"Deploy"** - Vercel will build and deploy your site!

You'll get a URL like: `https://your-project.vercel.app`

---

## Step 3: Deploy Backend to Railway (Recommended)

### 3.1 Sign up for Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository

### 3.2 Configure Railway

1. Railway will detect your `server.js`
2. Click on your service → **Settings**
3. Set the **Start Command** to: `node server.js`
4. Set the **Root Directory** to: `pure-peel` (if your repo has the pure-peel folder)

### 3.3 Add Backend Environment Variables

In Railway, go to **Variables** and add all your `.env` variables:

```
STRIPE_SECRET_KEY=sk_live_... (your Stripe secret key - LIVE mode!)
STRIPE_WEBHOOK_SECRET=whsec_... (your Stripe webhook secret)
RESEND_API_KEY=re_... (your Resend API key)
RESEND_FROM_EMAIL=orders@purepeelco.com
ADMIN_EMAIL=purepeel11@gmail.com
# Canada Post API Credentials
# For Development/Testing:
CANADA_POST_USERNAME=39fd860bcf7eff08
CANADA_POST_PASSWORD=6204a45981dc9fd6e826ec
# For Production (set CANADA_POST_USE_PRODUCTION=true):
# CANADA_POST_USERNAME=e66359fc2eb7d4c2
# CANADA_POST_PASSWORD=14d81da04ebb17bb918d48
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=true
SHIPPING_ORIGIN_POSTAL_CODE=YOUR_POSTAL_CODE (e.g., M5H 2N2)
SHIPPING_ORIGIN_CITY=YOUR_CITY (e.g., Toronto)
SHIPPING_ORIGIN_PROVINCE=YOUR_PROVINCE (e.g., ON)
PORT=3001 (Railway will set this automatically, but good to have)
```

**Important:**
- Use **LIVE** Stripe keys (not test keys)
- Make sure your domain is verified in Resend before using `orders@purepeelco.com`
- **Canada Post credentials above are for PRODUCTION** - these will enable real-time shipping rates
- Replace `YOUR_POSTAL_CODE`, `YOUR_CITY`, and `YOUR_PROVINCE` with your actual shipping origin address

### 3.4 Deploy

Railway will automatically deploy. Once deployed:

1. Click on your service → **Settings** → **Generate Domain**
2. Copy the domain (e.g., `your-app.railway.app`)
3. This is your backend URL!

### 3.5 Update Frontend API URL

Go back to Vercel:

1. **Settings** → **Environment Variables**
2. Update `VITE_API_URL` to: `https://your-app.railway.app`
3. **Redeploy** your Vercel project (Settings → Deployments → Redeploy)

---

## Step 4: Configure Stripe Webhooks

### 4.1 Get Your Backend Webhook URL

Your webhook URL will be: `https://your-app.railway.app/api/webhook`

### 4.2 Configure in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://your-app.railway.app/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Add Your Custom Domain

### 5.1 Add Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Add your domain: `purepeelco.com` (or `www.purepeelco.com`)
3. Vercel will give you DNS records to add

### 5.2 Update DNS Records

Go to your domain registrar and add:

**For root domain (purepeelco.com):**
- Type: `A`
- Name: `@`
- Value: Vercel's IP (shown in Vercel dashboard)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com` (or what Vercel shows)

### 5.3 Wait for DNS Propagation

- Usually takes 5-60 minutes
- Check with: `nslookup purepeelco.com`

---

## Step 6: Final Checklist

Before going live, verify:

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] All environment variables set (frontend + backend)
- [ ] Using **LIVE** Stripe keys (not test)
- [ ] Stripe webhook configured and working
- [ ] Domain connected and working
- [ ] Test a purchase end-to-end
- [ ] Test email delivery
- [ ] Test order tracking
- [ ] Test admin panel
- [ ] Test Canada Post shipping rates (enter a Canadian address in checkout)

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** `Node`
6. Add all environment variables (same as Railway)
7. Deploy!

---

## Troubleshooting

### "Cannot connect to server"
- Check that backend is running on Railway/Render
- Verify `VITE_API_URL` in Vercel matches your backend URL
- Check backend logs in Railway/Render dashboard

### "Stripe payment fails"
- Make sure you're using **LIVE** keys (not test)
- Verify webhook is configured correctly
- Check Stripe dashboard for error logs

### "Emails not sending"
- Verify Resend domain is verified
- Check `RESEND_FROM_EMAIL` matches verified domain
- Check backend logs for email errors

### "Canada Post shipping rates not working"
- Verify all Canada Post environment variables are set in Railway/Render:
  - `CANADA_POST_USERNAME=e66359fc2eb7d4c2`
  - `CANADA_POST_PASSWORD=14d81da04ebb17bb918d48`
  - `CANADA_POST_CUSTOMER_NUMBER=0001238590`
  - `CANADA_POST_USE_PRODUCTION=true`
- Check backend logs for "Canada Post API error" messages
- If API fails, the system will fall back to estimated rates (shipping will still work)
- Verify your shipping origin address is set correctly:
  - `SHIPPING_ORIGIN_POSTAL_CODE`
  - `SHIPPING_ORIGIN_CITY`
  - `SHIPPING_ORIGIN_PROVINCE`

### "Domain not working"
- Wait for DNS propagation (can take up to 48 hours)
- Check DNS records are correct
- Verify domain is added in Vercel

---

## Need Help?

Check the other README files in the `docs/` folder:
- `README_STRIPE_SETUP.md` - Stripe configuration
- `README_EMAIL_SETUP.md` - Email setup
- `README_DOMAIN_SETUP.md` - Domain configuration

