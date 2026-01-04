# Resend: Sending vs Receiving Emails

## Quick Answer

**No, you don't need to enable receiving in Resend.**

Resend is for **sending emails (outgoing)** only. For receiving emails, you use your regular email provider (Gmail, Cloudflare Email Routing, etc.).

## How It Works

### Sending Emails (Resend) ✅

**What Resend does:**
- Sends order confirmation emails to customers
- Sends admin notification emails to you
- Handles email delivery and tracking

**What you need:**
- Resend API key
- Verified domain (optional but recommended)
- `RESEND_FROM_EMAIL` set in Render

**No special "receiving" setup needed** - Resend automatically handles sending.

### Receiving Emails (Your Email Provider) ✅

**What handles receiving:**
- Your email provider (Gmail, Cloudflare Email Routing, etc.)
- You already set this up with Cloudflare Email Routing

**What you have:**
- `orders@purepeelco.com` → forwards to your Gmail
- `info@purepeelco.com` → forwards to your Gmail
- `privacy@purepeelco.com` → forwards to your Gmail
- etc.

**No Resend configuration needed** for receiving.

## Your Current Setup

### Sending (Resend):
- ✅ Order confirmations sent via Resend
- ✅ Admin notifications sent via Resend
- ✅ Uses `orders@purepeelco.com` as "From" address

### Receiving (Cloudflare + Gmail):
- ✅ `orders@purepeelco.com` → forwards to Gmail
- ✅ `info@purepeelco.com` → forwards to Gmail
- ✅ All aliases forward to your Gmail

## What You Need to Do

**For Resend (Sending):**
1. ✅ Get Resend API key
2. ✅ Add to Render environment variables
3. ✅ Verify domain in Resend (optional but recommended)
4. ✅ That's it! No "receiving" setup needed

**For Receiving:**
- ✅ Already set up with Cloudflare Email Routing
- ✅ No additional setup needed

## Advanced: Resend Webhooks (Optional)

Resend does have a webhook feature for receiving email events (bounces, opens, clicks), but this is **optional** and not needed for basic email sending.

If you want to track email events:
1. Go to Resend Dashboard → Webhooks
2. Add webhook URL (your backend endpoint)
3. This is for analytics/tracking, not for receiving customer emails

**You don't need this for basic email sending.**

## Summary

- **Sending emails:** Use Resend (already configured in your backend)
- **Receiving emails:** Use your email provider (already set up with Cloudflare)
- **No "receiving" setup needed in Resend** - it's only for sending

Just add your Resend API key to Render and you're good to go!

