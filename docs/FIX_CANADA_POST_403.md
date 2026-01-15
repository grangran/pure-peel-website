# Fix Canada Post API 403 Error - Customer Number Mismatch

## The Problem

You're seeing this error:
```
403 Forbidden
<description>The customer number in the URL does not belong to the web service authorization provided in your request.</description>
```

This means:
- ✅ Your credentials (username/password) are **correct** (authentication passed)
- ❌ The **customer number** in the URL doesn't match your account

## Root Cause

The customer number `0001238590` in your environment variables doesn't match the account associated with your credentials:
- Username: `9e4989e8c7da2594`
- Password: `9fa07857e4f3b920f75fbd`

## Solution: Find Your Correct Customer Number

### Step 1: Log into Canada Post Developer Portal

1. Go to: https://www.canadapost-postescanada.ca/cpc/en/business/postal-network/developer-portal.page
2. Log in with your account credentials

### Step 2: Find Your Customer Number

Look for:
- **Customer Number** or **Account Number**
- It might be in:
  - Account Settings
  - API Credentials section
  - Contract Information
  - Account Details

**Note:** The customer number might be:
- Different from `0001238590`
- Without leading zeros (e.g., `1238590` instead of `0001238590`)
- A different format entirely

### Step 3: Update Render Environment Variable

1. Go to Render Dashboard → `pure-peel-website` → Environment
2. Find `CANADA_POST_CUSTOMER_NUMBER`
3. Update it with the **correct customer number** from your developer portal
4. Save and redeploy

### Step 4: Verify

After updating:
1. Place a test order
2. Check if the 403 error is resolved
3. Shipping label creation should work

## Alternative: Contact Canada Post Support

If you can't find your customer number:

1. **Call Canada Post Support**: 1-866-511-0546
2. Tell them:
   - You're getting a 403 error: "customer number in URL does not belong to web service authorization"
   - Your API username: `9e4989e8c7da2594`
   - Ask them for the correct customer number associated with this account

## Important Notes

- The customer number is used in:
  - URL path: `/rs/{customer-number}/{mobo}/shipment`
  - XML payload: `<contract-id>` and `<paid-by-customer>`
- All three must match your account
- The customer number format matters (with/without leading zeros)

## Current Configuration

**Production Credentials:**
- `CANADA_POST_USERNAME`: `9e4989e8c7da2594`
- `CANADA_POST_PASSWORD`: `9fa07857e4f3b920f75fbd`
- `CANADA_POST_CUSTOMER_NUMBER`: `0001238590` ← **This needs to be updated**
- `CANADA_POST_USE_PRODUCTION`: `true`
