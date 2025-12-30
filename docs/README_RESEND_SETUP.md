# Resend Email Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### Step 2: Get Your API Key

1. Once logged in, go to **API Keys** in the sidebar
2. Click **Create API Key**
3. Give it a name (e.g., "Pure Peel Co Production")
4. Copy the API key (starts with `re_`)

### Step 3: Configure Your Domain (Optional for Testing)

**For Testing (Quick Start):**
- You can use Resend's test domain: `onboarding@resend.dev`
- This works immediately, no setup needed

**For Production:**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `purepeelco.com`)
4. Add the DNS records they provide to your domain
5. Wait for verification (usually a few minutes)
6. Use your verified domain: `noreply@yourdomain.com`

### Step 4: Update Your `.env` File

Open your `.env` file and update these values:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # Or your verified domain email
ADMIN_EMAIL=your-email@gmail.com  # Where you want to receive admin notifications
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `re_your_actual_api_key_here` with your actual Resend API key
- `your-email@gmail.com` with your email address

### Step 5: Restart Your Server

```bash
# Stop your server (Ctrl+C)
npm run server
```

## Testing

1. Place a test order on your website
2. Check your email inbox (and spam folder)
3. You should receive:
   - Order confirmation email (to customer email)
   - Admin notification email (to ADMIN_EMAIL)

## Benefits of Resend

✅ **No App Passwords** - Just an API key  
✅ **Better Deliverability** - Professional email service  
✅ **Free Tier** - 3,000 emails/month  
✅ **Easy Setup** - Works in minutes  
✅ **Analytics** - Track email opens, clicks, etc.  
✅ **Production Ready** - Used by thousands of companies  

## Troubleshooting

### Emails not sending?
- Check that `RESEND_API_KEY` is correct (starts with `re_`)
- Verify `RESEND_FROM_EMAIL` is set
- Check server logs for error messages
- Make sure server was restarted after updating `.env`

### Using test domain?
- `onboarding@resend.dev` works immediately
- Perfect for development and testing
- For production, verify your own domain

### Need help?
- Resend Docs: https://resend.com/docs
- Resend Dashboard: https://resend.com/emails (view sent emails)

