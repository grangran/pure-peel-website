# Fix Vercel Auto-Deployment Not Working

## Quick Fix Steps

### Step 1: Check Repository Connection

1. Go to: https://vercel.com/dashboard
2. Select your **pure-peel-website** project
3. Go to **Settings** → **Git**
4. Check:
   - ✅ Repository is connected (should show your GitHub repo)
   - ✅ Branch is set to **`main`** (or your default branch)
   - ✅ **"Automatic deployments from Git"** is **ENABLED**

### Step 2: Reconnect Repository (If Needed)

If repository shows as disconnected:

1. Go to **Settings** → **Git**
2. Click **"Disconnect"** (if connected)
3. Click **"Connect Git Repository"**
4. Select your repository: `grangran/pure-peel-website`
5. Click **"Import"**
6. Make sure:
   - **Production Branch:** `main`
   - **Automatic deployments:** ✅ Enabled

### Step 3: Check GitHub Webhook

1. Go to GitHub: https://github.com/grangran/pure-peel-website
2. Click **Settings** → **Webhooks**
3. Look for a Vercel webhook (should have `vercel.com` in the URL)
4. If missing, Vercel will create it when you reconnect

### Step 4: Verify Branch Settings

In Vercel Dashboard → Settings → Git:

- **Production Branch:** Should be `main`
- **Preview Branches:** Can be `*` (all branches) or specific branches
- **Automatic deployments:** ✅ **ENABLED**

### Step 5: Test Manual Deployment

To verify everything works:

1. Go to **Deployments** tab
2. Click **"Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. This should trigger a deployment

If manual deploy works but auto-deploy doesn't, it's a webhook/connection issue.

### Step 6: Recreate Webhook (If Needed)

If webhook is missing or broken:

1. In Vercel → Settings → Git
2. Click **"Disconnect"** repository
3. Wait 10 seconds
4. Click **"Connect Git Repository"** again
5. Select your repo and reconnect
6. This will recreate the webhook

### Step 7: Check Vercel Project Settings

1. Go to **Settings** → **General**
2. Check:
   - **Project Name:** Should match your repo name
   - **Framework Preset:** Should be **Vite** (or auto-detected)
   - **Root Directory:** Should be empty (or `.` if needed)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 8: Verify Git Push is Working

Make sure your pushes are actually going to GitHub:

```bash
git log --oneline -3
git remote -v
```

You should see your recent commits and the GitHub remote URL.

## Common Issues & Solutions

### Issue: "Repository not connected"
**Solution:** Reconnect in Vercel Settings → Git

### Issue: "Webhook not found"
**Solution:** Disconnect and reconnect the repository in Vercel

### Issue: "Wrong branch"
**Solution:** Set Production Branch to `main` in Vercel Settings → Git

### Issue: "Automatic deployments disabled"
**Solution:** Enable it in Vercel Settings → Git

### Issue: "Build fails on deploy"
**Solution:** Check Build Logs for errors, fix them, then redeploy

## Alternative: Use Vercel CLI

If auto-deploy still doesn't work, you can deploy manually using CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Still Not Working?

1. **Check Vercel Status:** https://www.vercel-status.com/
2. **Check GitHub Status:** https://www.githubstatus.com/
3. **Contact Vercel Support:** support@vercel.com
4. **Check Vercel Dashboard** for any error messages

## Verify It's Working

After fixing, test by:

1. Making a small change to a file
2. Committing and pushing:
   ```bash
   git commit --allow-empty -m "Test auto-deploy"
   git push
   ```
3. Check Vercel Dashboard → Deployments
4. Should see a new deployment starting within 30 seconds


