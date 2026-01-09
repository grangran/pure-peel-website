// Google Merchant Center product feed generator
// Converts products to Google Merchant Center format

/**
 * Convert a product variant to Google Merchant Center format
 * @param {Object} product - Product object
 * @param {Object} variant - Variant object
 * @param {string} baseUrl - Base URL of the website
 * @returns {Object} Google Merchant Center product entry
 */
export function convertToGoogleMerchantFormat(product, variant, baseUrl = 'https://purepeelco.com') {
  // Build product URL
  const productUrl = `${baseUrl}/${product.id}`
  
  // Build image URL
  const imageUrl = variant.image.startsWith('http') 
    ? variant.image 
    : `${baseUrl}${variant.image}`
  
  // Extract size from variant label (e.g., "Mini Bag — 10 pcs" -> "10 pcs")
  const sizeMatch = variant.label.match(/(\d+\s*(?:pcs|pieces?|count))?/i)
  const size = sizeMatch ? sizeMatch[1] : ''
  
  // Build title (Product Name - Variant)
  const title = `${product.name} - ${variant.option}`
  
  // Build description
  const description = product.description 
    ? `${product.description} Available in ${variant.option}.`
    : `${product.name} - ${variant.option}. Premium dehydrated citrus slices made in Canada.`
  
  // Google Merchant Center product entry
  const merchantProduct = {
    // Required fields
    'id': variant.id, // Unique identifier for this variant
    'title': title.substring(0, 150), // Max 150 characters
    'description': description.substring(0, 5000), // Max 5000 characters
    'link': productUrl,
    'image_link': imageUrl,
    'price': `${variant.price} CAD`,
    'availability': 'in stock', // or 'out of stock', 'preorder'
    'condition': 'new',
    
    // Product identifiers
    'brand': 'Pure Peel Co.',
    'gtin': '', // Leave empty if you don't have GTIN/UPC
    'mpn': variant.id, // Manufacturer Part Number (using variant ID)
    
    // Product details
    'product_type': 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    'google_product_category': 'Food, Beverages & Tobacco > Food Items > Fruits & Vegetables',
    
    // Shipping
    'shipping': JSON.stringify([
      {
        'country': 'CA',
        'service': 'Standard',
        'price': '12.00 CAD'
      }
    ]),
    
    // Additional attributes
    'custom_label_0': product.id, // Product type (orange, lime, etc.)
    'custom_label_1': size, // Size information
    'custom_label_2': 'Made in Canada',
    
    // Optional but recommended
    'age_group': '', // Not applicable
    'gender': '', // Not applicable
    'color': '', // Not applicable
    'size': size || '', // Size if available
    'material': 'Citrus Fruit',
    'pattern': '', // Not applicable
  }
  
  return merchantProduct
}

/**
 * Convert all products to Google Merchant Center format
 * @param {Array} products - Array of product objects
 * @param {string} baseUrl - Base URL of the website
 * @returns {Array} Array of Google Merchant Center product entries
 */
export function convertAllProductsToMerchantFormat(products, baseUrl = 'https://purepeelco.com') {
  const merchantProducts = []
  
  for (const product of products) {
    for (const variant of product.variants) {
      const merchantProduct = convertToGoogleMerchantFormat(product, variant, baseUrl)
      merchantProducts.push(merchantProduct)
    }
  }
  
  return merchantProducts
}

/**
 * Generate XML feed for Google Merchant Center
 * @param {Array} products - Array of Google Merchant Center formatted products
 * @returns {string} XML feed string
 */
export function generateXMLFeed(products) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
  xml += '  <channel>\n'
  xml += '    <title>Pure Peel Co. Products</title>\n'
  xml += '    <link>https://purepeelco.com</link>\n'
  xml += '    <description>Premium dehydrated citrus slices made in Canada</description>\n'
  
  for (const product of products) {
    xml += '    <item>\n'
    xml += `      <g:id><![CDATA[${product.id}]]></g:id>\n`
    xml += `      <g:title><![CDATA[${product.title}]]></g:title>\n`
    xml += `      <g:description><![CDATA[${product.description}]]></g:description>\n`
    xml += `      <g:link><![CDATA[${product.link}]]></g:link>\n`
    xml += `      <g:image_link><![CDATA[${product.image_link}]]></g:image_link>\n`
    xml += `      <g:price><![CDATA[${product.price}]]></g:price>\n`
    xml += `      <g:availability><![CDATA[${product.availability}]]></g:availability>\n`
    xml += `      <g:condition><![CDATA[${product.condition}]]></g:condition>\n`
    xml += `      <g:brand><![CDATA[${product.brand}]]></g:brand>\n`
    
    if (product.mpn) {
      xml += `      <g:mpn><![CDATA[${product.mpn}]]></g:mpn>\n`
    }
    
    if (product.gtin) {
      xml += `      <g:gtin><![CDATA[${product.gtin}]]></g:gtin>\n`
    }
    
    xml += `      <g:product_type><![CDATA[${product.product_type}]]></g:product_type>\n`
    xml += `      <g:google_product_category><![CDATA[${product.google_product_category}]]></g:google_product_category>\n`
    
    if (product.shipping) {
      xml += `      <g:shipping><![CDATA[${product.shipping}]]></g:shipping>\n`
    }
    
    if (product.size) {
      xml += `      <g:size><![CDATA[${product.size}]]></g:size>\n`
    }
    
    if (product.material) {
      xml += `      <g:material><![CDATA[${product.material}]]></g:material>\n`
    }
    
    if (product.custom_label_0) {
      xml += `      <g:custom_label_0><![CDATA[${product.custom_label_0}]]></g:custom_label_0>\n`
    }
    
    if (product.custom_label_1) {
      xml += `      <g:custom_label_1><![CDATA[${product.custom_label_1}]]></g:custom_label_1>\n`
    }
    
    if (product.custom_label_2) {
      xml += `      <g:custom_label_2><![CDATA[${product.custom_label_2}]]></g:custom_label_2>\n`
    }
    
    xml += '    </item>\n'
  }
  
  xml += '  </channel>\n'
  xml += '</rss>\n'
  
  return xml
}

/**
 * Generate CSV feed for Google Merchant Center (alternative format)
 * @param {Array} products - Array of Google Merchant Center formatted products
 * @returns {string} CSV feed string
 */
export function generateCSVFeed(products) {
  if (products.length === 0) return ''
  
  // CSV headers (Google Merchant Center required fields)
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'availability',
    'condition',
    'brand',
    'mpn',
    'gtin',
    'product_type',
    'google_product_category',
    'shipping',
    'size',
    'material',
    'custom_label_0',
    'custom_label_1',
    'custom_label_2'
  ]
  
  let csv = headers.join(',') + '\n'
  
  for (const product of products) {
    const row = headers.map(header => {
      const value = product[header] || ''
      // Escape quotes and wrap in quotes if contains comma
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csv += row.join(',') + '\n'
  }
  
  return csv
}
