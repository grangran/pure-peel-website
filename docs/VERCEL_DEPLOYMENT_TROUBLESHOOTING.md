# Vercel Deployment Troubleshooting

## If Vercel Isn't Deploying

### Step 1: Check Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your **pure-peel-website** project
3. Click on **"Deployments"** tab
4. Check the latest deployment status:
   - ✅ **Ready** = Successfully deployed
   - ⏳ **Building** = Currently building
   - ❌ **Error** = Build failed (check logs)
   - ⏸️ **Queued** = Waiting to build

### Step 2: Check for Build Errors

If you see an error:

1. Click on the failed deployment
2. Check the **"Build Logs"** tab
3. Look for error messages (usually red text)
4. Common errors:
   - Missing dependencies
   - Build command failing
   - Environment variables missing
   - TypeScript/ESLint errors

### Step 3: Manually Trigger Deployment

If auto-deploy isn't working:

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click **"Redeploy"** button (three dots menu on latest deployment)
4. Or click **"Deploy"** → **"Deploy latest commit"**

### Step 4: Check GitHub Integration

Make sure Vercel is connected to your GitHub repo:

1. Go to Vercel Dashboard → **Settings** → **Git**
2. Check that your repository is connected
3. Verify the branch is set to **"main"** (or your default branch)
4. Check **"Production Branch"** is set correctly

### Step 5: Check Auto-Deploy Settings

1. Go to Vercel Dashboard → **Settings** → **Git**
2. Make sure **"Automatic deployments from Git"** is enabled
3. Check that **"Production Branch"** matches your branch name (usually `main`)

### Step 6: Verify Build Configuration

Your `vercel.json` should have:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

This is already set correctly in your project.

### Step 7: Check for Environment Variable Issues

If build fails due to missing env vars:

1. Go to Vercel Dashboard → **Settings** → **Environment Variables**
2. Make sure all required variables are set:
   - `VITE_API_URL` (should be your Render backend URL)
   - Any other variables your app needs

### Step 8: Force Redeploy

If nothing else works:

1. Go to Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Click **"Redeploy"** (three dots menu)
4. Select **"Use existing Build Cache"** = OFF (to force fresh build)
5. Click **"Redeploy"**

### Step 9: Check GitHub Webhook

If auto-deploy still doesn't work:

1. Go to GitHub → Your Repository → **Settings** → **Webhooks**
2. Check if there's a Vercel webhook
3. If missing, Vercel might need to reconnect to GitHub

### Step 10: Test Build Locally

Run this to see if build works:
```bash
npm run build
```

If this fails, fix the errors first before deploying.

## Common Issues

### Issue: "Build Command Not Found"
**Solution:** Make sure `package.json` has a `build` script:
```json
"scripts": {
  "build": "vite build"
}
```

### Issue: "Module Not Found"
**Solution:** 
1. Make sure `package.json` and `package-lock.json` are committed
2. Run `npm install` locally to verify dependencies
3. Check that `node_modules` is in `.gitignore` (it should be)

### Issue: "Environment Variable Missing"
**Solution:**
1. Add missing variables in Vercel Dashboard → Settings → Environment Variables
2. Redeploy after adding variables

### Issue: "Deployment Stuck"
**Solution:**
1. Cancel the stuck deployment
2. Manually trigger a new deployment
3. If still stuck, contact Vercel support

## Quick Fixes

### Force a New Deployment:
```bash
# Make a small change and commit
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

### Check Deployment Status:
- Visit: `https://vercel.com/dashboard`
- Look at the "Deployments" tab
- Check the latest deployment status

### View Build Logs:
1. Go to Vercel Dashboard
2. Click on the deployment
3. Click "Build Logs" tab
4. Look for errors (usually in red)

## Still Not Working?

1. **Check Vercel Status:** https://www.vercel-status.com/
2. **Check Vercel Dashboard** for any error messages
3. **Try manual redeploy** from Vercel dashboard
4. **Contact Vercel Support** if nothing works

## Verify Deployment

Once deployed, check:
- ✅ Site loads: `https://purepeelco.com`
- ✅ No console errors (F12 → Console)
- ✅ Analytics is working (check Vercel Analytics tab)
- ✅ All pages load correctly


