# Google Merchant Center Setup Guide

## Overview

Google Merchant Center allows you to upload product data so your products can appear in Google Shopping results. This guide shows you how to set up and use the Merchant API to add products programmatically.

## Prerequisites

1. **Google Merchant Center Account**
   - Sign up at: https://merchants.google.com
   - Verify your website ownership
   - Complete business information

2. **Google Cloud Project**
   - Create a project at: https://console.cloud.google.com
   - Enable "Content API for Shopping"
   - Create OAuth 2.0 credentials

## Step 1: Set Up Google Merchant Center

### 1.1 Create Account

1. Go to: https://merchants.google.com
2. Sign in with your Google account
3. Click **"Get Started"**
4. Enter your business information:
   - Business name: **Pure Peel Co.**
   - Website: **https://purepeelco.com**
   - Country: **Canada**

### 1.2 Verify Website Ownership

1. In Merchant Center, go to **Settings** → **Website**
2. Choose verification method:
   - **HTML file upload** (easiest)
   - **HTML tag** (add to your site)
   - **Google Analytics** (if connected)
3. Complete verification

### 1.3 Set Up Shipping & Tax

1. Go to **Settings** → **Shipping**
2. Add shipping service:
   - **Service name:** Standard Shipping
   - **Country:** Canada
   - **Rate:** $12.00 CAD (or your actual rate)
   - **Delivery time:** 3-7 business days

3. Go to **Settings** → **Tax**
   - Set tax settings for Canada
   - Note: Your products are zero-rated (0% tax)

## Step 2: Set Up Google Cloud Project

### 2.1 Create Project

1. Go to: https://console.cloud.google.com
2. Click **"Create Project"**
3. Name: **Pure Peel Co. Merchant Center**
4. Click **"Create"**

### 2.2 Enable Content API for Shopping

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for: **"Content API for Shopping"**
3. Click **"Enable"**

### 2.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **Merchant Center API Client**
5. Authorized redirect URIs: `http://localhost:3001` (for testing)
6. Click **"Create"**
7. **Save the Client ID and Client Secret** (you'll need these)

## Step 3: Generate Product Feed

### 3.1 Using the Script

**Generate XML feed:**
```bash
node scripts/generateMerchantFeed.js xml
```

**Generate CSV feed:**
```bash
node scripts/generateMerchantFeed.js csv
```

**Output:**
- `merchant-center-feed.xml` (XML format)
- `merchant-center-feed.csv` (CSV format)

### 3.2 Manual Upload (Easiest)

1. **Generate feed:**
   ```bash
   node scripts/generateMerchantFeed.js xml
   ```

2. **In Google Merchant Center:**
   - Go to **Products** → **Feeds**
   - Click **"+"** to add feed
   - Name: **"Pure Peel Co. Products"**
   - Input method: **"Upload"**
   - Upload the generated `merchant-center-feed.xml` file
   - Click **"Save"**

3. **Schedule updates:**
   - Set feed to update daily or weekly
   - Or manually upload when products change

## Step 4: Use Merchant API (Advanced)

### 4.1 Install Dependencies

```bash
npm install googleapis
```

### 4.2 Create API Script

Create `scripts/uploadToMerchantCenter.js`:

```javascript
import { google } from 'googleapis'
import { getAllProducts } from '../utils/productStorage.js'
import { convertAllProductsToMerchantFormat } from '../utils/googleMerchantCenter.js'

// OAuth 2.0 credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3001'
const MERCHANT_ID = process.env.GOOGLE_MERCHANT_ID // Your Merchant Center ID

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

// Get authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/content'
})

console.log('Authorize this app by visiting:', authUrl)

// After authorization, you'll get a code
// Exchange code for tokens
// Then use the tokens to make API calls
```

### 4.3 Environment Variables

Add to `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_MERCHANT_ID=your-merchant-center-id
```

### 4.4 Upload Products via API

**Full example script** (create `scripts/uploadToMerchantCenter.js`):

```javascript
import { google } from 'googleapis'
import { getAllProducts } from '../utils/productStorage.js'
import { convertAllProductsToMerchantFormat } from '../utils/googleMerchantCenter.js'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const MERCHANT_ID = process.env.GOOGLE_MERCHANT_ID
const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN // Get from OAuth flow

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
oauth2Client.setCredentials({ access_token: ACCESS_TOKEN })

const shoppingContent = google.shoppingcontent({
  version: 'v2.1',
  auth: oauth2Client
})

async function uploadProducts() {
  try {
    // Get products
    const products = getAllProducts()
    const merchantProducts = convertAllProductsToMerchantFormat(products)
    
    // Upload each product
    for (const product of merchantProducts) {
      await shoppingContent.products.insert({
        merchantId: MERCHANT_ID,
        requestBody: {
          offerId: product.id,
          title: product.title,
          description: product.description,
          link: product.link,
          imageLink: product.image_link,
          contentLanguage: 'en',
          targetCountry: 'CA',
          channel: 'online',
          availability: product.availability,
          condition: product.condition,
          price: {
            value: product.price.replace(' CAD', ''),
            currency: 'CAD'
          },
          brand: product.brand,
          mpn: product.mpn,
          productType: product.product_type,
          googleProductCategory: product.google_product_category
        }
      })
      
      console.log(`✅ Uploaded: ${product.title}`)
    }
    
    console.log(`\n✅ Successfully uploaded ${merchantProducts.length} products`)
  } catch (error) {
    console.error('❌ Error uploading products:', error)
  }
}

uploadProducts()
```

## Step 5: Feed Requirements

### Required Fields

- `id` - Unique product identifier
- `title` - Product title (max 150 characters)
- `description` - Product description (max 5000 characters)
- `link` - Product URL
- `image_link` - Product image URL
- `price` - Price (format: "XX.XX CAD")
- `availability` - "in stock", "out of stock", or "preorder"
- `condition` - "new", "used", or "refurbished"

### Recommended Fields

- `brand` - Brand name
- `mpn` - Manufacturer Part Number
- `gtin` - Global Trade Item Number (if available)
- `product_type` - Product category
- `google_product_category` - Google's product category
- `shipping` - Shipping information
- `size` - Product size
- `material` - Product material

## Step 6: Feed Maintenance

### Update Products

**Option 1: Regenerate and Re-upload**
```bash
node scripts/generateMerchantFeed.js xml
# Then upload new file to Merchant Center
```

**Option 2: Use API**
```bash
node scripts/uploadToMerchantCenter.js
```

### Schedule Automatic Updates

1. In Merchant Center, go to **Products** → **Feeds**
2. Click on your feed
3. Set **"Fetch schedule"** to:
   - **Daily** (recommended)
   - **Weekly**
   - **Monthly**

### Monitor Feed Status

1. Go to **Products** → **Diagnostics**
2. Check for:
   - **Errors** - Fix immediately
   - **Warnings** - Review and fix
   - **Approved** - Products ready for Google Shopping

## Troubleshooting

### Common Issues

**1. Products not appearing:**
- Check feed status in Merchant Center
- Verify all required fields are present
- Check product approval status

**2. Image errors:**
- Ensure images are accessible (not behind login)
- Use HTTPS URLs
- Images must be at least 100x100 pixels

**3. Price format errors:**
- Use format: "XX.XX CAD" (not "$XX.XX")
- Include currency code

**4. Availability errors:**
- Use exact values: "in stock", "out of stock", "preorder"
- Keep availability updated

## Next Steps

1. ✅ Generate product feed
2. ✅ Upload to Merchant Center
3. ✅ Set up scheduled updates
4. ⏳ Wait for Google to process (24-48 hours)
5. ⏳ Monitor feed status
6. ⏳ Products appear in Google Shopping

## Resources

- **Google Merchant Center:** https://merchants.google.com
- **Content API Docs:** https://developers.google.com/merchant/api
- **Feed Specification:** https://support.google.com/merchants/answer/7052112
- **Product Data Spec:** https://support.google.com/merchants/answer/7052112

---

**Note:** The feed generation script uses your product API data. Make sure products are added via the Product Management API first!
