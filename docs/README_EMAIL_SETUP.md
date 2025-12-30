# Email Notifications Setup

## Overview

The email notification system sends automated emails to customers and admins for:
- Order confirmations
- Shipping notifications
- Admin alerts for new orders

## Configuration

### Option 1: Gmail (Easiest for Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Copy the 16-character password

3. Add to your `.env` file:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM="Pure Peel Co. <your-email@gmail.com>"
ADMIN_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

### Option 2: SMTP (Any Email Provider)

Works with most email providers (Outlook, Yahoo, custom SMTP, etc.)

Add to your `.env` file:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM="Pure Peel Co. <your-email@domain.com>"
ADMIN_EMAIL=your-email@domain.com
FRONTEND_URL=http://localhost:5173
```

### Option 3: Development Mode (No Email Sent)

If email credentials are not configured, emails will be logged to the console instead of being sent. This is useful for development.

## Email Services

### Recommended Production Services

1. **Resend** (Recommended)
   - Free tier: 3,000 emails/month
   - Easy setup, great deliverability
   - SMTP settings available

2. **SendGrid**
   - Free tier: 100 emails/day
   - Reliable, widely used
   - SMTP settings available

3. **Mailgun**
   - Free tier: 5,000 emails/month
   - Good for transactional emails
   - SMTP settings available

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_SERVICE` | Set to `gmail` for Gmail | No |
| `SMTP_HOST` | SMTP server hostname | No* |
| `SMTP_PORT` | SMTP server port (usually 587 or 465) | No* |
| `SMTP_SECURE` | Use SSL/TLS (true for port 465) | No* |
| `EMAIL_USER` | Your email address | Yes |
| `EMAIL_PASSWORD` | Email password or app password | Yes |
| `EMAIL_FROM` | Display name and email for sender | No |
| `ADMIN_EMAIL` | Email to receive admin notifications | No (defaults to EMAIL_USER) |
| `FRONTEND_URL` | Your website URL (for tracking links) | Yes |

*Required if using SMTP (not Gmail)

## Testing

1. Make a test purchase
2. Check your email inbox for:
   - Order confirmation email (customer)
   - New order notification (admin)
3. In admin dashboard, mark order as "shipped"
4. Check email for shipping notification

## Troubleshooting

### Emails not sending
- Check that credentials are correct
- Verify SMTP settings match your provider
- Check server logs for error messages
- For Gmail: Make sure you're using an App Password, not your regular password

### Emails going to spam
- Use a professional email service (Resend, SendGrid)
- Set up SPF/DKIM records for your domain
- Use a custom domain email address

### Development mode
- If email credentials aren't set, emails are logged to console
- This is intentional for development/testing

## Email Templates

Email templates are located in `utils/emailService.js`:
- `orderConfirmationTemplate` - Sent to customers after payment
- `shippingNotificationTemplate` - Sent when order is marked as shipped
- `adminNotificationTemplate` - Sent to admin for new orders

You can customize these templates to match your brand.

