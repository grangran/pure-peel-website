# Email Testing & Production Setup

## Current Issue: Test Domain Limitations

You're currently using `onboarding@resend.dev`, which is Resend's test domain. This domain has delivery limitations:

- ✅ Emails are sent successfully from your server
- ❌ May not deliver to all email addresses
- ❌ Often blocked by email providers
- ❌ Not suitable for production

## Solutions

### Option 1: Verify Your Own Domain (Recommended for Production)

1. **Go to Resend Dashboard**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter your domain** (e.g., `purepeelco.com` or `mail.purepeelco.com`)
4. **Add DNS records** that Resend provides:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. **Wait for verification** (usually 5-15 minutes)
6. **Update `.env`**:
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   # or
   RESEND_FROM_EMAIL=hello@purepeelco.com
   ```

### Option 2: Check Resend Dashboard for Email Status

Even with the test domain, you can see if emails are being sent:

1. Go to: https://resend.com/emails
2. Log in to your Resend account
3. Check the "Emails" section
4. Look for:
   - ✅ **Sent**: Email was sent successfully
   - ⚠️ **Delivered**: Email reached recipient (may still be in spam)
   - ❌ **Bounced**: Email was rejected
   - ❌ **Failed**: Email couldn't be sent

### Option 3: Use Gmail/SMTP for Testing (Temporary)

If you need emails working immediately for testing, you can temporarily use Gmail:

1. **Update `.env`**:
   ```env
   # Comment out Resend
   # RESEND_API_KEY=...
   # RESEND_FROM_EMAIL=...

   # Use Gmail instead
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ADMIN_EMAIL=mattgranato2004@gmail.com
   ```

2. **Restart your server**

Note: Gmail has sending limits (500 emails/day for free accounts).

## Testing Email Delivery

### Test Endpoint
```
http://localhost:3001/api/test-email?email=your@email.com
```

### Check Server Logs
When you send a test email, check your server terminal for:
- ✅ `Order confirmation email sent via Resend to: ...`
- ✅ `Message ID: ...`
- ❌ Any error messages

### Check Spam Folder
Even with a verified domain, always check spam/junk folders.

## Production Checklist

Before going live:
- [ ] Verify your own domain in Resend
- [ ] Update `RESEND_FROM_EMAIL` to use your domain
- [ ] Test email delivery to multiple addresses
- [ ] Check spam folder delivery
- [ ] Set up DMARC policy (optional but recommended)
- [ ] Monitor Resend dashboard for delivery rates

## Current Configuration

Your current `.env` settings:
- **From Email**: `onboarding@resend.dev` (test domain)
- **Admin Email**: `mattgranato2004@gmail.com`
- **Service**: Resend (with test domain limitations)

## Next Steps

1. **For immediate testing**: Check Resend dashboard to see if emails are at least being sent
2. **For production**: Verify your own domain in Resend
3. **Alternative**: Use Gmail/SMTP temporarily if you need emails working right now

