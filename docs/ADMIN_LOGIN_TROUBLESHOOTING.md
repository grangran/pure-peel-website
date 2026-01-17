# Admin Login Troubleshooting

**Issue:** Password `080925` not working after setting in Render

---

## 🔍 Debugging Steps

### **Step 1: Check Render Logs**

1. Go to Render Dashboard → Your service → **Logs**
2. Look for this message when server starts:
   ```
   ✅ Admin password loaded from environment variable (length: 6 chars)
   ```
3. If you see:
   - `⚠️  Using default admin password` → Variable not set correctly
   - `length: 6 chars` → Variable is set (should match your password length)

### **Step 2: Verify Environment Variable in Render**

1. Go to Render Dashboard → Your service → **Environment**
2. Check for `ADMIN_PASSWORD`
3. Verify:
   - ✅ Key is exactly: `ADMIN_PASSWORD` (no spaces)
   - ✅ Value is exactly: `080925` (no spaces before/after)
   - ✅ No quotes around the value
   - ✅ Case-sensitive (should be uppercase for key)

**Common mistakes:**
- ❌ `ADMIN_PASSWORD = 080925` (spaces around =)
- ❌ `ADMIN_PASSWORD="080925"` (quotes)
- ❌ `ADMIN_PASSWORD= 080925` (space after =)
- ❌ `admin_password=080925` (wrong case)

**Correct format:**
- ✅ `ADMIN_PASSWORD=080925` (no spaces, no quotes)

### **Step 3: Restart/Redeploy Server**

After setting/changing environment variables:
1. **Option A:** Click "Manual Deploy" → "Deploy latest commit"
2. **Option B:** Click "Relaunch" button
3. **Option C:** Make a small code change and push to trigger redeploy

**Important:** Environment variables only take effect after server restart!

### **Step 4: Check Server Logs for Authentication Attempts**

When you try to login, check Render logs for:
```
🔒 Admin authentication failed: {
  providedLength: 6,
  expectedLength: 6,
  providedFirstChar: '0',
  expectedFirstChar: '0',
  ...
}
```

This will tell you:
- If password length matches
- If first character matches
- If environment variable is set

### **Step 5: Test with Default Password**

Temporarily test with default password to verify system works:
1. Remove `ADMIN_PASSWORD` from Render (or set to empty)
2. Redeploy
3. Try logging in with: `admin123`
4. If that works → Issue is with your password setup
5. If that doesn't work → Issue is with authentication system

---

## 🐛 Common Issues & Fixes

### **Issue 1: Password Has Leading Zero**

**Problem:** Password `080925` starts with `0`
- Some systems might interpret this as octal (base 8)
- But in this case, it's a string comparison, so should be fine

**Fix:** Try wrapping in quotes (though shouldn't be needed):
```env
ADMIN_PASSWORD="080925"
```

### **Issue 2: Environment Variable Not Loaded**

**Problem:** Server didn't restart after setting variable

**Fix:**
1. Set variable in Render
2. **Relaunch/Redeploy** the service
3. Check logs to confirm variable loaded

### **Issue 3: Spaces in Password**

**Problem:** Password has invisible spaces

**Fix:**
1. Delete the variable in Render
2. Re-add it carefully:
   - Click "Add Environment Variable"
   - Key: `ADMIN_PASSWORD`
   - Value: `080925` (type it fresh, don't copy-paste)
   - Save
3. Redeploy

### **Issue 4: Wrong Service**

**Problem:** Set variable in wrong service (frontend instead of backend)

**Fix:**
- Make sure you set it in **backend service** (Render)
- NOT in Vercel (frontend)
- Backend is where `server.js` runs

### **Issue 5: Password Encoding Issues**

**Problem:** Special characters or encoding

**Fix:**
- Password `080925` is all numbers, should be fine
- If still issues, try a different password like `admin080925` to test

---

## ✅ Quick Fix Checklist

1. [ ] Go to Render Dashboard → Your backend service
2. [ ] Click "Environment" tab
3. [ ] Check `ADMIN_PASSWORD` exists
4. [ ] Verify value is exactly `080925` (no spaces, no quotes)
5. [ ] Click "Relaunch" or "Manual Deploy"
6. [ ] Wait for deployment to complete
7. [ ] Check logs for: `✅ Admin password loaded from environment variable (length: 6 chars)`
8. [ ] Try logging in again
9. [ ] Check logs when you try to login (should show authentication attempt)

---

## 🔧 Manual Test

You can test the API directly:

```bash
# Test with curl (replace with your backend URL)
curl "https://pure-peel-website.onrender.com/api/admin/orders?password=080925"
```

**Expected response:**
- ✅ `200 OK` with orders JSON → Password works!
- ❌ `401 Unauthorized` → Password doesn't match

---

## 📝 What to Check in Render Logs

When server starts, you should see:
```
✅ Admin password loaded from environment variable (length: 6 chars)
```

When you try to login, you should see:
```
🔒 Admin authentication failed: {
  providedLength: 6,
  expectedLength: 6,
  providedFirstChar: '0',
  expectedFirstChar: '0',
  hasQueryParam: true,
  hasHeader: false,
  envVarSet: true
}
```

**If `envVarSet: false`** → Environment variable not loaded
**If `expectedLength: 0`** → Password is empty
**If lengths match but still fails** → Password value mismatch (spaces, encoding, etc.)

---

## 🚨 Still Not Working?

If after all this it still doesn't work:

1. **Try a different password:**
   ```env
   ADMIN_PASSWORD=test123
   ```
   Redeploy and test. If this works, issue is with `080925` specifically.

2. **Check for hidden characters:**
   - Delete the variable completely
   - Re-add it by typing fresh (don't copy-paste)
   - Make sure no invisible characters

3. **Verify backend URL:**
   - Make sure `VITE_API_URL` in Vercel points to correct backend
   - Test that backend is accessible

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Check the request to `/api/admin/orders`
   - See what password is being sent

---

## 💡 Quick Solution

**Most likely issue:** Server didn't restart after setting variable.

**Quick fix:**
1. Go to Render → Your service
2. Click "Relaunch" button (top right)
3. Wait for restart
4. Try logging in again

If that doesn't work, check the logs for the authentication debug info!
