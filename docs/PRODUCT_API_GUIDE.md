# Product Management API Guide

## Overview

The Product Management API allows you to programmatically manage products on your website. This is useful for:
- Uploading large numbers of products
- Making frequent product updates
- Integrating with external systems (Google Merchant Center, inventory management, etc.)
- Automating product management

## Setup

### 1. Set API Key

Add to your `.env` file (backend):

```env
PRODUCT_API_KEY=your-secure-api-key-here
```

**Generate a secure key:**
- Use a long random string (at least 32 characters)
- Don't commit this to git
- Use different keys for development and production

### 2. API Base URL

**Development:**
```
http://localhost:3001/api/products
```

**Production:**
```
https://your-backend-url.com/api/products
```

## Authentication

All write operations (create, update, delete, bulk) require an API key.

**Include API key in request:**
- **Header:** `X-API-Key: your-api-key`
- **Query parameter:** `?apiKey=your-api-key`

**Example:**
```bash
curl -H "X-API-Key: your-api-key" https://your-backend-url.com/api/products
```

## Endpoints

### 1. Get All Products (Public)

**GET** `/api/products`

**No authentication required**

**Response:**
```json
{
  "products": [
    {
      "id": "orange",
      "name": "Orange",
      "description": "Sweet, zesty, and aromatic...",
      "variants": [
        {
          "id": "orange-mini",
          "label": "Mini Bag — 10 pcs",
          "option": "Mini Bag (10 pcs)",
          "price": 5,
          "image": "/images/orange-product.jpg"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Get Product by ID (Public)

**GET** `/api/products/:id`

**Example:**
```bash
curl https://your-backend-url.com/api/products/orange
```

**Response:**
```json
{
  "product": {
    "id": "orange",
    "name": "Orange",
    "description": "...",
    "variants": [...]
  }
}
```

### 3. Create or Update Product (Requires API Key)

**POST** `/api/products`

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Body:**
```json
{
  "id": "orange",
  "name": "Orange",
  "description": "Sweet, zesty, and aromatic. Ideal for classic cocktails...",
  "showBulkInquiry": true,
  "variants": [
    {
      "id": "orange-mini",
      "label": "Mini Bag — 10 pcs",
      "option": "Mini Bag (10 pcs)",
      "price": 5,
      "image": "/images/orange-product.jpg"
    },
    {
      "id": "orange-small",
      "label": "Small Bag — 20 pcs",
      "option": "Small Bag (20 pcs)",
      "price": 9,
      "image": "/images/orange-product.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "product": {
    "id": "orange",
    "name": "Orange",
    ...
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Product saved successfully"
}
```

**Note:** If a product with the same ID exists, it will be updated.

### 4. Update Product (Requires API Key)

**PUT** `/api/products/:id`

**Example:**
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"name": "Updated Orange Name", "price": 10}' \
  https://your-backend-url.com/api/products/orange
```

**Response:**
```json
{
  "product": {
    "id": "orange",
    "name": "Updated Orange Name",
    ...
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Product updated successfully"
}
```

### 5. Delete Product (Requires API Key)

**DELETE** `/api/products/:id`

**Example:**
```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  https://your-backend-url.com/api/products/orange
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

### 6. Bulk Upload Products (Requires API Key)

**POST** `/api/products/bulk`

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Body:**
```json
{
  "products": [
    {
      "id": "orange",
      "name": "Orange",
      "description": "...",
      "variants": [...]
    },
    {
      "id": "lime",
      "name": "Lime",
      "description": "...",
      "variants": [...]
    }
  ]
}
```

**Or:**
```json
[
  {
    "id": "orange",
    "name": "Orange",
    ...
  },
  {
    "id": "lime",
    "name": "Lime",
    ...
  }
]
```

**Response:**
```json
{
  "products": [...],
  "count": 2,
  "message": "Successfully saved 2 products"
}
```

## Product Schema

### Required Fields

- `id` (string): Unique product identifier (e.g., "orange", "lime")
- `name` (string): Product name
- `variants` (array): At least one variant required

### Optional Fields

- `description` (string): Product description
- `showBulkInquiry` (boolean): Show bulk inquiry button
- `createdAt` (string): ISO timestamp (auto-generated)
- `updatedAt` (string): ISO timestamp (auto-updated)

### Variant Schema

Each variant must have:
- `id` (string): Unique variant identifier
- `label` (string): Display label (e.g., "Mini Bag — 10 pcs")
- `option` (string): Option text (e.g., "Mini Bag (10 pcs)")
- `price` (number): Price in CAD dollars
- `image` (string): Image path (e.g., "/images/orange-product.jpg")

## Examples

### Using cURL

**Create a product:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "id": "orange",
    "name": "Orange",
    "description": "Sweet, zesty, and aromatic.",
    "variants": [
      {
        "id": "orange-mini",
        "label": "Mini Bag — 10 pcs",
        "option": "Mini Bag (10 pcs)",
        "price": 5,
        "image": "/images/orange-product.jpg"
      }
    ]
  }' \
  https://your-backend-url.com/api/products
```

**Bulk upload:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d @products.json \
  https://your-backend-url.com/api/products/bulk
```

### Using JavaScript/Node.js

```javascript
const API_KEY = 'your-api-key'
const API_URL = 'https://your-backend-url.com/api/products'

// Create a product
async function createProduct(productData) {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify(productData)
  })
  
  return await response.json()
}

// Bulk upload
async function bulkUploadProducts(products) {
  const response = await fetch(`${API_URL}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ products })
  })
  
  return await response.json()
}

// Example usage
const product = {
  id: 'orange',
  name: 'Orange',
  description: 'Sweet, zesty, and aromatic.',
  variants: [
    {
      id: 'orange-mini',
      label: 'Mini Bag — 10 pcs',
      option: 'Mini Bag (10 pcs)',
      price: 5,
      image: '/images/orange-product.jpg'
    }
  ]
}

createProduct(product).then(result => console.log(result))
```

### Using Python

```python
import requests

API_KEY = 'your-api-key'
API_URL = 'https://your-backend-url.com/api/products'

# Create a product
def create_product(product_data):
    response = requests.post(
        API_URL,
        json=product_data,
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

# Bulk upload
def bulk_upload_products(products):
    response = requests.post(
        f'{API_URL}/bulk',
        json={'products': products},
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

# Example usage
product = {
    'id': 'orange',
    'name': 'Orange',
    'description': 'Sweet, zesty, and aromatic.',
    'variants': [
        {
            'id': 'orange-mini',
            'label': 'Mini Bag — 10 pcs',
            'option': 'Mini Bag (10 pcs)',
            'price': 5,
            'image': '/images/orange-product.jpg'
        }
    ]
}

result = create_product(product)
print(result)
```

## Error Handling

### Common Errors

**401 Unauthorized:**
```json
{
  "error": "Invalid API key"
}
```

**400 Bad Request:**
```json
{
  "error": "Product ID is required"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Error message"
}
```

## Rate Limiting

- **Public endpoints:** 100 requests per 15 minutes per IP
- **Authenticated endpoints:** 100 requests per 15 minutes per IP
- Rate limit headers included in responses

## Data Storage

Products are stored in: `data/products.json`

**Backup regularly!**

## Security Best Practices

1. **Use strong API keys:**
   - At least 32 characters
   - Random and unpredictable
   - Different keys for dev/prod

2. **Keep API keys secret:**
   - Never commit to git
   - Use environment variables
   - Rotate keys periodically

3. **Use HTTPS:**
   - Always use HTTPS in production
   - Never send API keys over HTTP

4. **Monitor usage:**
   - Check server logs
   - Monitor for suspicious activity
   - Set up alerts for failed auth attempts

## Integration Examples

### Google Merchant Center

You can use this API to sync products with Google Merchant Center:

1. Fetch products from API
2. Transform to Google Merchant Center format
3. Upload via Google Merchant Center API

### Inventory Management

Sync products with inventory systems:

1. Inventory system updates stock
2. Calls product API to update prices/availability
3. Website reflects changes automatically

## Next Steps

1. Set `PRODUCT_API_KEY` in environment variables
2. Test API with a single product
3. Bulk upload your existing products
4. Integrate with external systems as needed

---

**Need help?** Check server logs for detailed error messages.
