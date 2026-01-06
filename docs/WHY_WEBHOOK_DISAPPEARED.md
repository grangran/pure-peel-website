# Why Did My Vercel Webhook Disappear?

## Common Reasons Webhooks Disappear

### 1. Repository Was Disconnected and Reconnected
- If you disconnected the repo in Vercel and reconnected it, sometimes the webhook doesn't get recreated automatically
- **Solution:** Reconnect the repository (see steps below)

### 2. GitHub Permissions Were Revoked
- If you revoked Vercel's access in GitHub → Settings → Applications
- The webhook gets deleted automatically
- **Solution:** Re-authorize Vercel and reconnect

### 3. Webhook Was Manually Deleted
- Someone might have deleted it from GitHub → Settings → Webhooks
- **Solution:** Reconnect repository in Vercel to recreate it

### 4. Vercel Integration Issue
- Sometimes Vercel's integration loses the webhook connection
- This can happen after Vercel updates or GitHub API changes
- **Solution:** Reconnect the repository

### 5. Repository Was Transferred or Renamed
- If the repository was moved or renamed, webhooks can break
- **Solution:** Reconnect with the new repository name

## How to Fix It

The good news: **Reconnecting the repository in Vercel will recreate the webhook automatically.**

### Quick Fix Steps:

1. **Vercel Dashboard** → Your Project → **Settings** → **Git**
2. Click **"Disconnect"** (if you see the option)
3. Click **"Connect Git Repository"**
4. Select your repository: `grangran/pure-peel-website`
5. Click **"Import"**
6. Make sure **"Automatic deployments"** is **ENABLED**
7. Check GitHub → Settings → Webhooks - webhook should appear!

## Why Manual Deploy Still Works

Manual deploy works because:
- Vercel is still **connected** to your GitHub account
- Vercel can still **read** your repository
- Vercel can still **deploy** when you click the button

But auto-deploy doesn't work because:
- The **webhook** (which tells Vercel about new pushes) is missing
- Without the webhook, Vercel doesn't know when you push new code
- So it can't automatically start a deployment

## Prevention

To prevent this from happening again:

1. **Don't manually delete webhooks** in GitHub
2. **Don't revoke Vercel's access** in GitHub → Settings → Applications
3. If you need to disconnect, **reconnect immediately** to recreate the webhook
4. **Check webhooks periodically** to make sure they're still there

## Verify It's Fixed

After reconnecting:

1. **Check GitHub Webhooks:**
   - Go to: https://github.com/grangran/pure-peel-website/settings/hooks
   - Should see Vercel webhook with green checkmark ✅

2. **Test Auto-Deploy:**
   ```bash
   git commit --allow-empty -m "Test auto-deploy"
   git push
   ```
   - Check Vercel Dashboard within 30 seconds
   - Should see new deployment starting automatically

3. **Check Deployment Source:**
   - In Vercel → Deployments
   - Should say "Triggered by GitHub push" (not "Manual deploy")


