// Script to generate Google Merchant Center product feed
// Usage: node scripts/generateMerchantFeed.js [format]
// Format: xml (default) or csv

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getAllProducts } from '../utils/productStorage.js'
import { 
  convertAllProductsToMerchantFormat, 
  generateXMLFeed, 
  generateCSVFeed 
} from '../utils/googleMerchantCenter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get format from command line (xml or csv)
const format = process.argv[2] || 'xml'

// Base URL
const baseUrl = process.env.BASE_URL || 'https://purepeelco.com'

console.log('🛒 Generating Google Merchant Center feed...')
console.log(`   Format: ${format.toUpperCase()}`)
console.log(`   Base URL: ${baseUrl}\n`)

try {
  // Get all products
  const products = getAllProducts()
  
  if (products.length === 0) {
    console.log('⚠️  No products found. Make sure products are added via API first.')
    console.log('   Run: node scripts/addSampleProducts.js (if you have one)')
    process.exit(1)
  }
  
  console.log(`📦 Found ${products.length} products`)
  
  // Count total variants
  const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)
  console.log(`   Total variants: ${totalVariants}\n`)
  
  // Convert to Google Merchant Center format
  const merchantProducts = convertAllProductsToMerchantFormat(products, baseUrl)
  
  console.log(`✅ Converted ${merchantProducts.length} products to Merchant Center format\n`)
  
  // Generate feed
  let feedContent
  let filename
  
  if (format.toLowerCase() === 'csv') {
    feedContent = generateCSVFeed(merchantProducts)
    filename = 'merchant-center-feed.csv'
  } else {
    feedContent = generateXMLFeed(merchantProducts)
    filename = 'merchant-center-feed.xml'
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '..', filename)
  fs.writeFileSync(outputPath, feedContent, 'utf8')
  
  console.log(`✅ Feed generated successfully!`)
  console.log(`   File: ${filename}`)
  console.log(`   Path: ${outputPath}`)
  console.log(`   Size: ${(feedContent.length / 1024).toFixed(2)} KB\n`)
  
  console.log('📤 Next steps:')
  console.log('   1. Go to Google Merchant Center')
  console.log('   2. Navigate to Products > Feeds')
  console.log('   3. Add a new feed')
  console.log('   4. Upload this file or set up scheduled fetch\n')
  
} catch (error) {
  console.error('❌ Error generating feed:', error)
  process.exit(1)
}
