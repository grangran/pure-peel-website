# Email Deliverability Guide - Getting Emails to Inbox Instead of Spam

## Current Status ✅

Your domain `purepeelco.com` is **verified** in Resend:
- ✅ **DKIM** - Verified (Domain authentication)
- ✅ **SPF** - Verified (Sender authentication)
- ⏳ **MX** - Pending (Only needed for receiving emails, not sending)

**You're ready to send emails!** The MX record being pending won't affect your ability to send order confirmations.

## Why Emails Go to Spam

Even with verified domains, emails can land in spam due to:

1. **Domain Reputation** - New domains have no reputation yet
2. **Content Issues** - Spam trigger words, poor formatting
3. **Sender Reputation** - Low sending volume initially
4. **Recipient Filters** - Gmail/Outlook have strict filters
5. **Missing DMARC** - Optional but helps with deliverability

## Steps to Improve Deliverability

### 1. Complete DMARC Setup (Recommended)

Your DMARC record is already added but set to `p=none`. For better deliverability:

1. **Go to Resend Dashboard** → Domains → `purepeelco.com`
2. **Find the DMARC record** (Type: TXT, Name: `_dmarc`)
3. **Update the policy** in your DNS:
   - Change from: `v=DMARC1; p=none;`
   - To: `v=DMARC1; p=quarantine; rua=mailto:dmarc@purepeelco.com;`
   - Or for stricter: `v=DMARC1; p=reject; rua=mailto:dmarc@purepeelco.com;`

**Note:** Start with `p=quarantine` for a few weeks, then move to `p=reject` once you're confident.

### 2. Warm Up Your Domain (Important for New Domains)

**Week 1-2:**
- Send 10-20 emails per day
- Focus on real customers (not test emails)
- Monitor Resend dashboard for bounces/complaints

**Week 3-4:**
- Gradually increase to 50-100 emails per day
- Continue monitoring

**After 1 month:**
- You can send at full capacity
- Domain reputation will be established

### 3. Email Content Best Practices

✅ **DO:**
- Use clear, professional subject lines
- Include your business name in "From" field
- Keep HTML emails simple and clean
- Include unsubscribe links (required by law)
- Personalize with customer name
- Use plain text alternatives

❌ **DON'T:**
- Use ALL CAPS in subject lines
- Use spam trigger words: "FREE", "URGENT", "CLICK NOW", "LIMITED TIME"
- Use excessive exclamation marks!!!
- Send from `noreply@` (use `hello@` or `orders@` instead)
- Include too many links or images
- Use URL shorteners (bit.ly, etc.)

### 4. Update Your From Email Address

Currently using: `noreply@purepeelco.com`

**Better options:**
- `hello@purepeelco.com` (more personal, better deliverability)
- `orders@purepeelco.com` (clear purpose)
- `support@purepeelco.com` (if you have customer support)

**To update:**
1. Edit `.env` file:
   ```env
   RESEND_FROM_EMAIL=hello@purepeelco.com
   ```
2. Restart your server

### 5. Monitor and Maintain

**Check Resend Dashboard Weekly:**
- Go to: https://resend.com/emails
- Look for:
  - ✅ **Delivered** - Good!
  - ⚠️ **Bounced** - Check why (invalid email, etc.)
  - ⚠️ **Complaints** - Someone marked as spam (very bad)
  - ❌ **Failed** - Technical issues

**If emails are bouncing:**
- Remove invalid email addresses
- Don't send to purchased email lists
- Only send to people who opted in

**If someone marks as spam:**
- This hurts your reputation
- Remove them from your list immediately
- Consider using double opt-in (confirm email before subscribing)

### 6. Test Email Deliverability

**Tools to test:**
1. **Mail Tester** - https://www.mail-tester.com
   - Send a test email to their address
   - Get a score (aim for 8+/10)
   - See what's causing issues

2. **MXToolbox** - https://mxtoolbox.com
   - Check your domain's SPF, DKIM, DMARC records
   - Verify they're set up correctly

3. **Send Test Emails:**
   - Send to Gmail, Outlook, Yahoo
   - Check if they land in inbox or spam
   - Adjust content if needed

### 7. Build Sender Reputation

**Ways to improve:**
- Send consistently (not in bursts)
- Keep bounce rate below 5%
- Keep complaint rate below 0.1%
- Respond to customer emails promptly
- Use consistent "From" name and email

## Quick Wins (Do These First)

1. ✅ **Change From Email** - Use `hello@purepeelco.com` instead of `noreply@`
2. ✅ **Update DMARC** - Change from `p=none` to `p=quarantine`
3. ✅ **Monitor Dashboard** - Check Resend weekly for issues
4. ✅ **Test Content** - Use Mail Tester to check your emails

## Current Configuration

Your `.env` should have:
```env
RESEND_API_KEY=re_WCe7Mf9b_D7jyDwV8WNfSyeJrvumDCxpm
RESEND_FROM_EMAIL=noreply@purepeelco.com  # Consider changing to hello@purepeelco.com
ADMIN_EMAIL=mattgranato2004@gmail.com
```

## Expected Results

**After implementing these changes:**
- **Week 1-2:** 60-70% inbox rate (normal for new domain)
- **Week 3-4:** 75-85% inbox rate (improving)
- **Month 2+:** 85-95% inbox rate (established reputation)

**Note:** 100% inbox rate is unrealistic. Even major brands have 5-10% go to spam.

## Troubleshooting

**If emails still go to spam after 2 weeks:**

1. **Check Resend Dashboard:**
   - Are emails being sent? (Status: Sent)
   - Any bounces or complaints?

2. **Test with Mail Tester:**
   - Send test email
   - Check score and fix issues

3. **Verify DNS Records:**
   - SPF, DKIM, DMARC all verified?
   - Check with MXToolbox

4. **Review Email Content:**
   - Remove spam trigger words
   - Simplify HTML
   - Add plain text version

5. **Contact Resend Support:**
   - They can help diagnose deliverability issues
   - May need to warm up domain more slowly

## Additional Resources

- **Resend Deliverability Guide:** https://resend.com/docs/deliverability
- **DMARC Guide:** https://dmarc.org/wiki/FAQ
- **SPF Record Checker:** https://mxtoolbox.com/spf.aspx
- **Email Deliverability Best Practices:** https://www.campaignmonitor.com/resources/guides/email-deliverability/

---

**Remember:** Email deliverability improves over time. Be patient, monitor regularly, and follow best practices. Your domain is verified, so you're on the right track! 🚀

