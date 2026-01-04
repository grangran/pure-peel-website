# How to Connect Vercel and Resend

## Understanding Your Setup

Your application has two parts:
- **Frontend (Vercel):** React app at `https://purepeelco.com`
- **Backend (Render):** Node.js/Express server at `https://pure-peel-website.onrender.com`

**Resend is used in the backend**, so you need to configure it in **Render**, not Vercel.

## Step 1: Get Your Resend API Key

1. Go to: https://resend.com
2. Sign in (or create an account)
3. Go to **API Keys** in the sidebar
4. Click **Create API Key**
5. Give it a name: "Pure Peel Co Production"
6. Copy the API key (starts with `re_`)

## Step 2: Configure Resend in Render (Backend)

Since your backend runs on Render, add Resend environment variables there:

1. Go to: https://dashboard.render.com
2. Select your **pure-peel-website** service
3. Go to **Environment** in the left sidebar
4. Scroll to **Environment Variables**
5. Add these variables:

```
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=orders@purepeelco.com
ADMIN_EMAIL=your-email@gmail.com
```

**Replace:**
- `re_your_actual_api_key_here` with your actual Resend API key
- `orders@purepeelco.com` with your verified Resend email (or `onboarding@resend.dev` for testing)
- `your-email@gmail.com` with your email address

6. Click **Save Changes**
7. Render will automatically redeploy with the new variables

## Step 3: Verify Your Domain in Resend (Optional but Recommended)

For better email deliverability:

1. Go to Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Enter: `purepeelco.com`
4. Add the DNS records Resend provides to your domain (Cloudflare)
5. Wait for verification (usually a few minutes)
6. Once verified, you can use: `orders@purepeelco.com`, `noreply@purepeelco.com`, etc.

## Step 4: Test Email Sending

1. Place a test order on your website
2. Check your email inbox (and spam folder)
3. You should receive:
   - Order confirmation email (to customer email)
   - Admin notification email (to ADMIN_EMAIL)

## Step 5: Monitor Email Delivery

1. Go to: https://resend.com/emails
2. You'll see all emails sent through Resend
3. Check delivery status, opens, clicks, etc.

## Vercel Configuration (Frontend)

Vercel doesn't need Resend directly, but make sure:

1. **VITE_API_URL** is set in Vercel:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `VITE_API_URL=https://pure-peel-website.onrender.com`
   - This tells your frontend where the backend (which uses Resend) is located

## Environment Variables Summary

### Render (Backend) - Needs Resend:
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@purepeelco.com
ADMIN_EMAIL=your-email@gmail.com
```

### Vercel (Frontend) - Needs Backend URL:
```
VITE_API_URL=https://pure-peel-website.onrender.com
```

## Troubleshooting

### Issue: Emails not sending
**Check:**
1. Resend API key is correct in Render
2. `RESEND_FROM_EMAIL` is set in Render
3. Domain is verified in Resend (if using custom domain)
4. Check Render logs for errors

### Issue: "Email not configured" error
**Solution:**
1. Make sure `RESEND_API_KEY` is set in Render
2. Make sure `RESEND_FROM_EMAIL` is set in Render
3. Redeploy Render service after adding variables

### Issue: Emails going to spam
**Solution:**
1. Verify your domain in Resend
2. Use your verified domain email (e.g., `orders@purepeelco.com`)
3. Avoid using `onboarding@resend.dev` in production
4. Set up SPF, DKIM, DMARC records (Resend provides these)

## Quick Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] `RESEND_API_KEY` added to Render environment variables
- [ ] `RESEND_FROM_EMAIL` added to Render environment variables
- [ ] `ADMIN_EMAIL` added to Render environment variables
- [ ] Domain verified in Resend (optional but recommended)
- [ ] Render service redeployed
- [ ] Test email sent successfully
- [ ] Check Resend dashboard for email status

## Summary

**Resend connects to Render (backend), not Vercel (frontend).**

- **Render:** Needs `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- **Vercel:** Needs `VITE_API_URL` (to know where backend is)

Once configured in Render, your backend will automatically use Resend to send emails when orders are placed!

