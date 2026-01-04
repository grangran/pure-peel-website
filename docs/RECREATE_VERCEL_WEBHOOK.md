# How to Recreate Vercel Webhook in GitHub

## The Problem
- Manual deploy works ✅
- Auto-deploy doesn't work ❌
- No webhook in GitHub settings ❌

## Solution: Reconnect Repository in Vercel

When you reconnect the repository in Vercel, it will automatically create the webhook in GitHub.

### Step-by-Step Instructions

#### Step 1: Disconnect Repository in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **pure-peel-website** project
3. Go to **Settings** → **Git**
4. Scroll down to find your connected repository
5. Click **"Disconnect"** button next to the repository
6. Confirm the disconnection

#### Step 2: Reconnect Repository

1. Still in **Settings** → **Git**
2. Click **"Connect Git Repository"** button
3. You'll see a list of your repositories
4. Find and select: **`grangran/pure-peel-website`**
5. Click **"Import"** or **"Connect"**

#### Step 3: Configure Settings

When reconnecting, make sure:
- ✅ **Production Branch:** `main`
- ✅ **Automatic deployments from Git:** **ENABLED** (toggle should be ON)
- ✅ **Preview deployments:** Can be enabled or disabled (your choice)

#### Step 4: Verify Webhook Created

1. Go to GitHub: https://github.com/grangran/pure-peel-website
2. Click **Settings** (top right of repo)
3. Click **Webhooks** (left sidebar)
4. You should now see a webhook with:
   - **Payload URL:** Something like `https://api.vercel.com/v1/integrations/deploy/...`
   - **Content type:** `application/json`
   - **Events:** Should include "Just the push event" or "Let me select individual events"
   - **Active:** ✅ (green checkmark)

#### Step 5: Test Auto-Deploy

1. Make a small test change:
   ```bash
   git commit --allow-empty -m "Test auto-deploy after webhook fix"
   git push
   ```

2. Go to Vercel Dashboard → **Deployments**
3. Within 30-60 seconds, you should see a **new deployment automatically starting**
4. It should show "Triggered by GitHub push" or similar

## If Webhook Still Doesn't Appear

### Option 1: Check GitHub Permissions

1. Go to GitHub → **Settings** → **Applications** → **Authorized OAuth Apps**
2. Look for **Vercel**
3. Make sure it has the right permissions:
   - ✅ Repository access
   - ✅ Webhook permissions

### Option 2: Re-authorize Vercel

1. In Vercel → **Settings** → **Git**
2. Click **"Disconnect"** again
3. Click **"Connect Git Repository"**
4. You might be asked to re-authorize Vercel
5. Grant all necessary permissions
6. Complete the connection

### Option 3: Manually Create Webhook (Advanced)

If automatic webhook creation doesn't work:

1. Go to GitHub → Your Repo → **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. **Payload URL:** Get this from Vercel (contact support or check Vercel docs)
4. **Content type:** `application/json`
5. **Secret:** Leave empty (Vercel handles this)
6. **Events:** Select "Just the push event"
7. **Active:** ✅
8. Click **"Add webhook"**

**Note:** This is advanced and not recommended. The reconnect method should work.

## Verify It's Working

After reconnecting:

1. **Check GitHub Webhooks:**
   - Go to repo → Settings → Webhooks
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
   - Latest deployment should show "Triggered by GitHub push" or similar
   - Not "Manual deploy"

## Troubleshooting

### Issue: "Disconnect" button not visible
**Solution:** You might need to check a different section. Look for "Connected Git Repository" or "Repository" section.

### Issue: Webhook appears but auto-deploy still doesn't work
**Solution:** 
1. Check webhook is active (green checkmark)
2. Check webhook has "push" events enabled
3. Test webhook delivery in GitHub (click on webhook → Recent Deliveries)

### Issue: "Permission denied" when reconnecting
**Solution:**
1. Go to GitHub → Settings → Applications → Authorized OAuth Apps
2. Revoke Vercel access
3. Reconnect in Vercel (will ask for new authorization)
4. Grant all permissions

## Summary

**Quick Fix:**
1. Vercel Dashboard → Settings → Git
2. Click **"Disconnect"** repository
3. Click **"Connect Git Repository"**
4. Select your repo → **"Import"**
5. Enable **"Automatic deployments"**
6. Verify webhook appears in GitHub
7. Test with a push

This should fix the auto-deployment issue!

