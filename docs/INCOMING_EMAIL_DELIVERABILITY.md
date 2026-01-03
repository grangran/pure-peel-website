# Fixing Incoming Email Deliverability (Alias Forwarding)

## The Problem

When customers email your business at aliases like:
- `info@purepeelco.com`
- `support@purepeelco.com`
- `hello@purepeelco.com`

These emails are forwarded via **Cloudflare Email Routing** to your Gmail (`purepeel11@gmail.com`), but they're landing in **spam**.

## Why This Happens

1. **Email Forwarding Looks Suspicious** - Gmail sees emails forwarded from Cloudflare as potentially spam
2. **Missing Authentication** - Forwarded emails may lose some authentication headers
3. **Sender Reputation** - The original sender's reputation affects deliverability
4. **New Domain** - Your domain is new, so Gmail is more cautious

## Quick Fixes (Do These First)

### 1. Mark Emails as "Not Spam" in Gmail

**This trains Gmail's filter:**

1. Go to your Gmail spam folder
2. Find the forwarded email from your alias
3. Select it and click **"Not spam"**
4. Do this for a few emails over the next few days

**Gmail will learn** that these forwarded emails are legitimate.

### 2. Create a Gmail Filter (Recommended)

**Automatically move forwarded emails to inbox:**

1. In Gmail, click the **search box** (top search bar)
2. Click the **filter icon** (funnel icon) on the right
3. In "From" field, enter: `@purepeelco.com`
4. Click **"Create filter"**
5. Check these boxes:
   - ✅ **Never send it to Spam**
   - ✅ **Always mark it as important**
   - ✅ **Star it** (optional)
   - ✅ **Apply the label** → Create new label "Business Emails" (optional)
6. Click **"Create filter"**

**Result:** All emails from `@purepeelco.com` will go directly to your inbox, never spam.

### 3. Add Cloudflare Forwarding Address to Contacts

**This helps Gmail trust the forwarded emails:**

1. In Gmail, go to **Contacts** (or Google Contacts)
2. Click **"Create contact"**
3. Add:
   - **Name:** Pure Peel Co. Email Routing
   - **Email:** `info@purepeelco.com` (or the forwarding address Cloudflare uses)
4. Save

**Note:** You may need to check Cloudflare Email Routing to see what address it uses for forwarding.

## Advanced Solutions

### Option A: Use Gmail "Send mail as" (You Already Set This Up)

If you've configured "Send mail as" in Gmail:
- ✅ You can reply from `info@purepeelco.com`
- ⚠️ But incoming emails still go through Cloudflare forwarding

**The filter above will fix the spam issue.**

### Option B: Use Google Workspace (Best Long-term Solution)

**For production businesses, consider Google Workspace:**

1. **Sign up for Google Workspace:**
   - Go to: https://workspace.google.com
   - Plans start at $6/user/month
   - Includes professional email (`info@purepeelco.com`)

2. **Benefits:**
   - ✅ Direct email (no forwarding)
   - ✅ Better deliverability
   - ✅ Professional appearance
   - ✅ Full Gmail features with your domain
   - ✅ No spam issues

3. **Setup:**
   - Google will provide MX records
   - Add them to Cloudflare DNS
   - Remove Cloudflare Email Routing
   - Emails go directly to Google Workspace

**This is the best solution for a business**, but costs $6-12/month.

### Option C: Use Cloudflare Email Routing with Better Configuration

**Improve Cloudflare Email Routing settings:**

1. **Go to Cloudflare Dashboard:**
   - Email → Email Routing → Settings

2. **Check these settings:**
   - ✅ **Catch-all address** - Forward all emails to your Gmail
   - ✅ **SPF record** - Should be set automatically
   - ✅ **DKIM** - Should be set automatically

3. **Verify DNS Records:**
   - Go to Cloudflare → DNS → Records
   - Check that MX records are correct
   - Check that SPF/DKIM records are present

4. **Contact Cloudflare Support:**
   - If issues persist, contact Cloudflare support
   - They can help optimize email routing

## Testing Your Fix

### Test Incoming Email

1. **Send a test email** from a different email address (not Gmail) to:
   - `info@purepeelco.com`
   - Or any alias you've set up

2. **Check your Gmail:**
   - ✅ Should arrive in **Inbox** (not spam)
   - ✅ Should be marked as **important** (if you set up the filter)
   - ✅ Should have the label (if you added one)

3. **If it still goes to spam:**
   - Mark it as "Not spam"
   - Check your Gmail filter is working
   - Wait 24-48 hours for Gmail to learn

## Current Setup

**Your current configuration:**
- ✅ **Domain:** `purepeelco.com`
- ✅ **Email Routing:** Cloudflare Email Routing
- ✅ **Forwarding to:** `purepeel11@gmail.com`
- ✅ **Aliases:** `info@`, `support@`, `hello@`, etc.
- ⚠️ **Issue:** Emails going to spam

## Recommended Action Plan

### Immediate (Do Now):
1. ✅ **Create Gmail filter** (5 minutes) - Most important!
2. ✅ **Mark existing spam emails as "Not spam"**
3. ✅ **Add forwarding address to contacts**

### Short-term (This Week):
1. Monitor if emails still go to spam
2. Continue marking as "Not spam" if needed
3. Test with different sender addresses

### Long-term (Consider):
1. **Google Workspace** - Best for business (costs $6-12/month)
2. **Microsoft 365** - Alternative to Google Workspace
3. **Zoho Mail** - Free option (limited features)

## Troubleshooting

### Emails Still Going to Spam After Filter?

1. **Check filter is active:**
   - Gmail → Settings → Filters and Blocked Addresses
   - Verify your filter is listed and enabled

2. **Check sender's reputation:**
   - Some senders have poor reputation
   - Their emails may always go to spam
   - This is not your fault

3. **Wait 24-48 hours:**
   - Gmail filters take time to learn
   - Be patient and keep marking as "Not spam"

4. **Check Cloudflare Email Routing logs:**
   - Cloudflare Dashboard → Email → Email Routing
   - See if emails are being forwarded correctly

### Can't Find Cloudflare Forwarding Address?

1. **Check Cloudflare Dashboard:**
   - Email → Email Routing → Destination Addresses
   - This shows where emails are forwarded

2. **Check email headers:**
   - Open a forwarded email in Gmail
   - Click "Show original" (three dots menu)
   - Look for "Return-Path" or "X-Forwarded-For"
   - This shows the forwarding address

## Additional Tips

### Improve Sender Reputation

**For customers emailing you:**

1. **Ask customers to:**
   - Add `info@purepeelco.com` to their contacts
   - Reply to your emails (shows engagement)
   - Not mark your emails as spam

2. **For your outgoing emails:**
   - Use Resend (already set up) ✅
   - Verify your domain (already done) ✅
   - Follow email best practices ✅

### Monitor Email Health

**Check regularly:**
- Gmail spam folder (mark legitimate emails as "Not spam")
- Cloudflare Email Routing logs
- Customer feedback about email delivery

---

## Summary

**Quick Fix (5 minutes):**
1. Create Gmail filter for `@purepeelco.com` → Never send to spam
2. Mark existing spam emails as "Not spam"
3. Add forwarding address to contacts

**This should fix 90% of spam issues!**

**Long-term Solution:**
- Consider Google Workspace for direct email (no forwarding)
- Better deliverability and professional appearance
- Costs $6-12/month but worth it for a business


