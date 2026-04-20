// Script to generate Google Merchant Center feed from existing product pages
// This reads products from the hardcoded product definitions in page files
// Usage: node scripts/generateFeedFromCodebase.js [format]

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { 
  convertAllProductsToMerchantFormat, 
  generateXMLFeed, 
  generateCSVFeed 
} from '../utils/googleMerchantCenter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import product definitions (you'll need to manually add these or use the API)
// For now, we'll define sample products based on your existing structure
const sampleProducts = [
  {
    id: "orange",
    name: "Orange",
    description: "Sweet, zesty, and aromatic. Ideal for classic cocktails like Old Fashioneds and mimosas, adds natural sweetness to hot or iced tea, and pairs beautifully with cheeses and cured meats on charcuterie boards.",
    showBulkInquiry: true,
    variants: [
      { id: "orange-mini", label: "Mini Bag — 10 pcs", option: "Mini Bag (10 pcs)", price: 5, image: "/images/orange-product.jpg" },
      { id: "orange-small", label: "Small Bag — 20 pcs", option: "Small Bag (20 pcs)", price: 9, image: "/images/orange-product.jpg" },
      { id: "orange-medium", label: "Medium Bag — 40 pcs", option: "Medium Bag (40 pcs)", price: 17, image: "/images/orange-product.jpg" },
      { id: "orange-large", label: "Large Bag — 75 pcs", option: "Large Bag (75 pcs)", price: 32, image: "/images/orange-product.jpg" },
      { id: "orange-clearbox", label: "Clear Box — 40 pcs", option: "Clear Box (40 pcs)", price: 17, image: "/images/orange-box.jpg" }
    ]
  },
  {
    id: "pink-orange",
    name: "Pink Orange",
    description: "Beautiful pink orange slices, dehydrated to preserve color and flavor. Perfect for premium cocktails and spritzes, elevates tea presentations with stunning color, and creates eye-catching gourmet displays.",
    showBulkInquiry: true,
    variants: [
      { id: "pink-orange-mini", label: "Mini Bag — 10 pcs", option: "Mini Bag (10 pcs)", price: 5, image: "/images/pink-orange-product.jpg" },
      { id: "pink-orange-small", label: "Small Bag — 20 pcs", option: "Small Bag (20 pcs)", price: 9, image: "/images/pink-orange-product.jpg" },
      { id: "pink-orange-medium", label: "Medium Bag — 40 pcs", option: "Medium Bag (40 pcs)", price: 17, image: "/images/pink-orange-product.jpg" },
      { id: "pink-orange-large", label: "Large Bag — 75 pcs", option: "Large Bag (75 pcs)", price: 32, image: "/images/pink-orange-product.jpg" },
      { id: "pink-orange-clearbox", label: "Clear Box — 40 pcs", option: "Clear Box (40 pcs)", price: 17, image: "/images/pink-orange-box.jpg" }
    ]
  },
  {
    id: "lime",
    name: "Lime",
    description: "Bright, crisp, and refreshing dehydrated lime slices. Essential for margaritas, mojitos, and gin & tonics. Adds a zesty kick to iced tea and cuts through rich flavors on charcuterie boards.",
    showBulkInquiry: true,
    variants: [
      { id: "lime-mini", label: "Mini Bag — 10 pcs", option: "Mini Bag (10 pcs)", price: 5, image: "/images/lime-product.jpg" },
      { id: "lime-small", label: "Small Bag — 20 pcs", option: "Small Bag (20 pcs)", price: 9, image: "/images/lime-product.jpg" },
      { id: "lime-medium", label: "Medium Bag — 40 pcs", option: "Medium Bag (40 pcs)", price: 17, image: "/images/lime-product.jpg" },
      { id: "lime-large", label: "Large Bag — 75 pcs", option: "Large Bag (75 pcs)", price: 32, image: "/images/lime-product.jpg" },
      { id: "lime-clearbox", label: "Clear Box — 40 pcs", option: "Clear Box (40 pcs)", price: 17, image: "/images/lime-box.jpg" }
    ]
  },
  {
    id: "lemon",
    name: "Lemon",
    description: "Tart, zesty, and refreshing dehydrated lemon slices. Perfect for lemon drops, whiskey sours, and classic tea pairings. Brightens charcuterie boards and complements creamy cheeses.",
    showBulkInquiry: true,
    variants: [
      { id: "lemon-mini", label: "Mini Bag — 10 pcs", option: "Mini Bag (10 pcs)", price: 5, image: "/images/lemon-product.jpg" },
      { id: "lemon-small", label: "Small Bag — 20 pcs", option: "Small Bag (20 pcs)", price: 9, image: "/images/lemon-product.jpg" },
      { id: "lemon-medium", label: "Medium Bag — 40 pcs", option: "Medium Bag (40 pcs)", price: 17, image: "/images/lemon-product.jpg" },
      { id: "lemon-large", label: "Large Bag — 75 pcs", option: "Large Bag (75 pcs)", price: 32, image: "/images/lemon-product.jpg" },
      { id: "lemon-clearbox", label: "Clear Box — 40 pcs", option: "Clear Box (40 pcs)", price: 17, image: "/images/lemon-box.jpg" }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    description: "Crisp, sweet, and aromatic dehydrated apple slices. Perfect for snacks and charcuterie boards.",
    showBulkInquiry: false,
    variants: [
      { id: "apple-small", label: "Small Bag — 20 pcs", option: "Small Bag (20 pcs)", price: 7.20, image: "/images/apple-product.JPEG" },
      { id: "apple-medium", label: "Medium Bag — 40 pcs", option: "Medium Bag (40 pcs)", price: 12, image: "/images/apple-product.JPEG" }
    ]
  },
  {
    id: "pineapple",
    name: "Pineapple",
    description: "Bright, tropical dehydrated pineapple slices. Sweet-tart and aromatic for cocktails and gourmet boards.",
    showBulkInquiry: true,
    variants: [
      { id: "pineapple-small", label: "Small Bag — 25 slices", option: "Small Bag (25 slices)", price: 10, image: "/images/pineapple-product.JPEG" },
      { id: "pineapple-medium", label: "Medium Bag — 40 slices", option: "Medium Bag (40 slices)", price: 15, image: "/images/pineapple-product.JPEG" }
    ]
  }
]

// Get format from command line (xml or csv)
const format = process.argv[2] || 'xml'

// Base URL
const baseUrl = process.env.BASE_URL || 'https://purepeelco.com'

console.log('🛒 Generating Google Merchant Center feed from codebase...')
console.log(`   Format: ${format.toUpperCase()}`)
console.log(`   Base URL: ${baseUrl}\n`)

try {
  console.log(`📦 Processing ${sampleProducts.length} products`)
  
  // Count total variants
  const totalVariants = sampleProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0)
  console.log(`   Total variants: ${totalVariants}\n`)
  
  // Convert to Google Merchant Center format
  const merchantProducts = convertAllProductsToMerchantFormat(sampleProducts, baseUrl)
  
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
  console.log('   1. Go to Google Merchant Center: https://merchants.google.com')
  console.log('   2. Navigate to Products > Feeds')
  console.log('   3. Click "+" to add a new feed')
  console.log('   4. Name: "Pure Peel Co. Products"')
  console.log('   5. Input method: "Upload"')
  console.log(`   6. Upload: ${filename}`)
  console.log('   7. Set schedule: Daily or Weekly')
  console.log('   8. Click "Save"\n')
  
  console.log('💡 Tip: After uploading, check Products > Diagnostics for any errors')
  
} catch (error) {
  console.error('❌ Error generating feed:', error)
  process.exit(1)
}
