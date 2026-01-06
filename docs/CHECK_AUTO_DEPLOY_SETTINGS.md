# Check Automatic Deployments in Vercel

## What to Check

Since your repository is connected (shown as "Connected 49s ago"), we need to verify that automatic deployments are enabled.

### Step 1: Check Production Branch Settings

1. In Vercel Dashboard → **Settings** → **Git**
2. Look for a section about **"Production Branch"** or **"Automatic Deployments"**
3. Make sure:
   - **Production Branch:** Set to `main`
   - **Automatic deployments:** Should be **ENABLED** (toggle ON)

### Step 2: Check GitHub Webhook (After Reconnect)

Since you just reconnected (49s ago), the webhook should have been created. Check:

1. Go to: https://github.com/grangran/pure-peel-website/settings/hooks
2. **Refresh the page** (sometimes it takes a moment to appear)
3. You should see a webhook with:
   - **Payload URL:** `https://api.vercel.com/v1/integrations/deploy/...`
   - **Status:** Active (green checkmark)
   - **Events:** "Just the push event" or similar

### Step 3: If Webhook Still Not There

If the webhook still doesn't appear after reconnecting:

1. **Disconnect again:**
   - Vercel → Settings → Git
   - Click **"Disconnect"**

2. **Wait 10 seconds**

3. **Reconnect:**
   - Click **"Connect Git Repository"**
   - Select `grangran/pure-peel-website`
   - Click **"Import"**
   - **Important:** When it asks about settings, make sure:
     - Production Branch: `main`
     - Automatic deployments: **ENABLED**

4. **Check GitHub Webhooks again:**
   - Go to GitHub → Settings → Webhooks
   - Refresh the page
   - Webhook should appear

### Step 4: Test Auto-Deploy

After verifying the webhook exists:

1. Make a test commit:
   ```bash
   git commit --allow-empty -m "Test auto-deploy"
   git push
   ```

2. Go to Vercel Dashboard → **Deployments**
3. Within 30-60 seconds, you should see a **new deployment starting automatically**
4. It should say "Triggered by GitHub push" (not "Manual deploy")

## Understanding the Difference

**Deploy Hooks (what you saw in the second screenshot):**
- These are **manual trigger URLs**
- You can call them via HTTP to trigger a deployment
- **Not needed for auto-deploy**
- Optional feature

**Webhooks (what we need):**
- These are **automatic triggers**
- GitHub sends a notification to Vercel when you push
- **Required for auto-deploy**
- Should be created automatically when repository is connected

## If It Still Doesn't Work

If the webhook still doesn't appear after reconnecting:

1. **Check GitHub Permissions:**
   - Go to GitHub → Settings → Applications → Authorized OAuth Apps
   - Look for **Vercel**
   - Make sure it has repository access

2. **Re-authorize Vercel:**
   - In Vercel → Settings → Git
   - Disconnect repository
   - Reconnect - you might be asked to re-authorize
   - Grant all permissions

3. **Contact Vercel Support:**
   - If webhook still doesn't appear after multiple reconnects
   - There might be an account-level issue


