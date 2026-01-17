# Fix Admin Password Login Issue

**Issue:** Password `080925` not working even though it's loaded correctly (6 chars)

---

## ✅ What We Know

From your logs:
- ✅ Password is loaded: `✅ Admin password loaded from environment variable (length: 6 chars)`
- ✅ Backend is running: `https://pure-peel-website.onrender.com`
- ✅ Server started successfully

**So the backend password is correct!**

---

## 🔍 The Problem

The issue is likely that **the frontend is not connecting to the correct backend URL**, or there's a **CORS/connection issue**.

---

## 🛠️ Fix Steps

### **Step 1: Verify Frontend API URL**

1. Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**
2. Check if `VITE_API_URL` is set to:
   ```
   https://pure-peel-website.onrender.com
   ```
3. **Important:** Make sure there's NO trailing slash:
   - ✅ Correct: `https://pure-peel-website.onrender.com`
   - ❌ Wrong: `https://pure-peel-website.onrender.com/`

**⚠️ Common Issue:** Trailing slashes cause URL construction problems. The code uses `.replace(/\/$/, '')` to remove them, but it's better to set it correctly from the start.

### **Step 2: Redeploy Frontend**

After checking/updating `VITE_API_URL`:
1. Go to Vercel Dashboard
2. Click **"Redeploy"** or trigger a new deployment
3. Wait for deployment to complete
4. Try logging in again

### **Step 3: Test Backend Connection**

Open browser console (F12) on https://purepeelco.com/admin and check:

1. **Network Tab:**
   - Try logging in
   - Look for request to `/api/admin/orders`
   - Check the **Request URL** - should be:
     ```
     https://pure-peel-website.onrender.com/api/admin/orders?password=080925
     ```

2. **Console Tab:**
   - Look for any CORS errors
   - Look for connection errors
   - Check if API_URL is correct

### **Step 4: Test API Directly**

You can test if the backend password works by opening this URL in your browser:

```
https://pure-peel-website.onrender.com/api/admin/orders?password=080925
```

**Expected results:**
- ✅ If you see JSON with orders → Password works! (Frontend issue)
- ❌ If you see `{"error":"Unauthorized..."}` → Password doesn't match (Backend issue)

---

## 🐛 Common Issues

### **Issue 1: Frontend Using Wrong Backend URL**

**Check:**
- `VITE_API_URL` in Vercel should be `https://pure-peel-website.onrender.com`
- No trailing slash
- No `http://` (should be `https://`)

### **Issue 2: CORS Error**

If you see CORS errors in browser console:
- Backend needs to allow requests from `https://purepeelco.com`
- Check `server.js` CORS configuration

### **Issue 3: Frontend Not Redeployed**

After setting `VITE_API_URL`:
- Must redeploy Vercel
- Environment variables only work after rebuild

### **Issue 4: Browser Cache**

Try:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private window

---

## 🔧 Quick Test

**Test 1: Check if backend password works**
```bash
# Open in browser:
https://pure-peel-website.onrender.com/api/admin/orders?password=080925
```

**Test 2: Check frontend API URL**
1. Go to https://purepeelco.com/admin
2. Open browser console (F12)
3. Type: `import.meta.env.VITE_API_URL`
4. Should show: `https://pure-peel-website.onrender.com`

**Test 3: Check network request**
1. Open browser DevTools → Network tab
2. Try logging in
3. Find request to `/api/admin/orders`
4. Check the full URL being called

---

## 📝 Debug Checklist

- [ ] `ADMIN_PASSWORD=080925` set in Render (✅ Confirmed - 6 chars loaded)
- [ ] Render service restarted after setting password (✅ Confirmed - server running)
- [ ] `VITE_API_URL` set in Vercel to `https://pure-peel-website.onrender.com`
- [ ] Vercel frontend redeployed after setting `VITE_API_URL`
- [ ] No trailing slash in `VITE_API_URL`
- [ ] Backend accessible (test direct API call)
- [ ] No CORS errors in browser console
- [ ] Browser cache cleared (try incognito)

---

## 🚨 Most Likely Fix

**The frontend probably needs to be redeployed** after setting `VITE_API_URL`.

**Steps:**
1. Go to Vercel Dashboard
2. Verify `VITE_API_URL=https://pure-peel-website.onrender.com` (no trailing slash)
3. Click **"Redeploy"** → **"Redeploy"** (confirm)
4. Wait for deployment
5. Try logging in again

---

## 🔍 If Still Not Working

Check Render logs when you try to login. You should see:
```
🔒 Admin authentication failed: {
  providedLength: 6,
  expectedLength: 6,
  providedFirstChar: '0',
  expectedFirstChar: '0',
  hasQueryParam: true,
  envVarSet: true
}
```

**If you see this:**
- Lengths match (6 chars) ✅
- First chars match ('0') ✅
- But still fails → **Password value mismatch**

**Possible causes:**
- Invisible characters in password
- Encoding issues
- Password stored incorrectly

**Try:**
1. Delete `ADMIN_PASSWORD` in Render
2. Re-add it by typing fresh: `080925`
3. Redeploy Render
4. Try again

---

## 💡 Alternative: Test with Default Password

To verify the system works:
1. Temporarily remove `ADMIN_PASSWORD` from Render
2. Redeploy Render
3. Try logging in with: `admin123` (default)
4. If that works → Issue is with your password setup
5. If that doesn't work → Issue is with authentication system

---

**Let me know what you see when you test the direct API URL!**
