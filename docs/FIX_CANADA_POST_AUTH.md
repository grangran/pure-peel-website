# Fix Canada Post API Authentication Error (401)

## The Problem

You're seeing this error in Render logs:
```
Canada Post API error: 401
<code>E002</code>
<description>AAA Authentication Failure</description>
```

This means the Canada Post API is rejecting your credentials.

## Solution: Update Render Environment Variables

### Step 1: Go to Render Dashboard

1. Go to: https://dashboard.render.com
2. Click on your **pure-peel-website** service
3. Click **Environment** in the left sidebar
4. Scroll down to **Environment Variables**

### Step 2: Check Current Variables

Make sure these variables are set:

**Required Variables:**
- `CANADA_POST_USERNAME` - Should be your username
- `CANADA_POST_PASSWORD` - Should be your password
- `CANADA_POST_CUSTOMER_NUMBER` - Your Canada Post customer number
- `CANADA_POST_USE_PRODUCTION` - Set to `true` for production, `false` for development

### Step 3: Update with Your New Credentials

Based on the credentials you provided, update these in Render:

**For Production (Live Site):**
```
CANADA_POST_USERNAME=9e4989e8c7da2594
CANADA_POST_PASSWORD=9fa07857e4f3b920f75fbd
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=true
```

**For Development/Testing:**
```
CANADA_POST_USERNAME=39fd860bcf7eff08
CANADA_POST_PASSWORD=6204a45981dc9fd6e826ec
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=false
```

### Step 4: Important Notes

1. **Customer Number**: The customer number `0001238590` is currently hardcoded. If this is wrong, you need to:
   - Find your actual customer number in your Canada Post account
   - Update `CANADA_POST_CUSTOMER_NUMBER` in Render
   - Or update the default in `server.js` line 426

2. **No Spaces**: Make sure there are NO spaces before or after the values when you paste them

3. **Case Sensitive**: The values are case-sensitive, so copy them exactly

4. **Production vs Development**:
   - If `CANADA_POST_USE_PRODUCTION=true`, it uses production credentials and production API endpoint
   - If `CANADA_POST_USE_PRODUCTION=false`, it uses development credentials and sandbox endpoint
   - Make sure you're using the right credentials for the right environment!

### Step 5: Redeploy

After updating environment variables:

1. Click **Manual Deploy** → **Deploy latest commit** (or Render will auto-deploy)
2. Wait for deployment to complete
3. Check the logs again - the error should be gone

### Step 6: Verify It's Working

1. Go to your Render logs
2. Look for these messages (should be green checkmarks):
   ```
   ✓ Canada Post API credentials detected - real-time rates enabled
   ```

3. Test the checkout:
   - Go to your website
   - Add items to cart
   - Go to checkout
   - Enter a Canadian address
   - Shipping rates should appear (from real Canada Post API, not estimates)

## Common Issues

### Issue 1: Wrong Customer Number

**Symptom:** Still getting 401 errors after updating credentials

**Solution:**
- Log into your Canada Post developer portal
- Find your actual customer number
- Update `CANADA_POST_CUSTOMER_NUMBER` in Render

### Issue 2: Using Development Credentials in Production

**Symptom:** 401 errors when `CANADA_POST_USE_PRODUCTION=true`

**Solution:**
- Make sure you're using **production** credentials when `CANADA_POST_USE_PRODUCTION=true`
- Production credentials: `e66359fc2eb7d4c2` / `14d81da04ebb17bb918d48`

### Issue 3: Using Production Credentials in Development

**Symptom:** 401 errors when `CANADA_POST_USE_PRODUCTION=false`

**Solution:**
- Make sure you're using **development** credentials when `CANADA_POST_USE_PRODUCTION=false`
- Development credentials: `39fd860bcf7eff08` / `6204a45981dc9fd6e826ec`

### Issue 4: Credentials Not Saved

**Symptom:** Variables show in Render but still getting errors

**Solution:**
- Make sure you clicked **Save Changes** after updating
- Redeploy the service
- Check that variables are actually set (no typos in variable names)

## Still Not Working?

If you're still getting 401 errors after following these steps:

1. **Double-check credentials** in your Canada Post developer portal
2. **Verify customer number** is correct
3. **Check Render logs** for the exact error message
4. **Test with development credentials first** (set `CANADA_POST_USE_PRODUCTION=false`)
5. **Contact Canada Post support** if credentials are definitely correct

## Quick Checklist

- [ ] `CANADA_POST_USERNAME` is set correctly
- [ ] `CANADA_POST_PASSWORD` is set correctly (no spaces)
- [ ] `CANADA_POST_CUSTOMER_NUMBER` is correct
- [ ] `CANADA_POST_USE_PRODUCTION` matches the credentials you're using
- [ ] Variables are saved in Render
- [ ] Service has been redeployed
- [ ] Checked logs for success messages


