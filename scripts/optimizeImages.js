#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Optimizes images by resizing to 2x display size and converting to WebP.
 * Maintains visual quality while reducing file size by 70-90%.
 * 
 * Requirements:
 * - sharp is already installed
 * - Run: npm run optimize:images
 * 
 * This script will:
 * 1. Resize images to 2x their display size (optimal for retina displays)
 * 2. Convert to WebP format with 80% quality
 * 3. Keep original images as fallback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('❌ Error: sharp is not installed.');
  console.error('   Please run: npm install --save-dev sharp');
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = IMAGES_DIR;

// Target dimensions (2x display size for retina - maintains quality)
const TARGET_DIMENSIONS = {
  'hero': { width: 3840, height: 2160 }, // 2x 1920x1080
  'product-card': { width: 680, height: 610 }, // 2x 340x305
  'lifestyle': { width: 2560, height: 1440 }, // 2x 1280x720
  'logo': { width: 352, height: 362 }, // 2x 176x181
  'product': { width: 1200, height: 1200 }, // 2x 600x600
};

// WebP quality settings
const WEBP_QUALITY = 80; // Good balance - maintains visual quality

/**
 * Determine image type based on filename
 */
function getImageType(filename) {
  if (filename.includes('banner') || filename.includes('driedcitrus')) return 'hero';
  if (filename.includes('product-card')) return 'product-card';
  if (filename.includes('moscow-mule') || filename.includes('charcuterie') || 
      filename.includes('drinks') || filename.includes('decorated') || 
      filename.includes('tea')) return 'lifestyle';
  if (filename.includes('logo')) return 'logo';
  if (filename.includes('product') && !filename.includes('card') && !filename.includes('box')) return 'product';
  return 'product-card'; // Default
}

/**
 * Optimize a single image
 */
async function optimizeImage(filePath) {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);
  
  // Skip if already WebP
  if (ext === '.webp') {
    console.log(`⏭️  Skipping ${filename} (already WebP)`);
    return;
  }

  // Skip if not an image
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    console.log(`⏭️  Skipping ${filename} (not an image)`);
    return;
  }

  try {
    const imageType = getImageType(filename);
    const targetDims = TARGET_DIMENSIONS[imageType] || TARGET_DIMENSIONS['product-card'];
    
    console.log(`\n📸 Processing ${filename} (type: ${imageType})`);
    
    // Read image metadata
    const metadata = await sharp(filePath).metadata();
    const originalSize = fs.statSync(filePath).size;
    console.log(`   Original: ${metadata.width}x${metadata.height}, ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Check if resizing is needed
    const needsResize = metadata.width > targetDims.width || metadata.height > targetDims.height;
    
    // Create WebP version
    const webpPath = path.join(OUTPUT_DIR, `${baseName}.webp`);
    let sharpInstance = sharp(filePath);
    
    // Auto-rotate based on EXIF orientation data
    // This ensures images are displayed correctly regardless of how they were taken
    sharpInstance = sharpInstance.rotate(); // Auto-rotates based on EXIF orientation
    
    // Resize if image is larger than target (maintains aspect ratio)
    if (needsResize) {
      console.log(`   📐 Resizing to max: ${targetDims.width}x${targetDims.height} (maintaining aspect ratio)`);
      sharpInstance = sharpInstance.resize(targetDims.width, targetDims.height, {
        fit: 'inside', // Maintains aspect ratio, fits within dimensions
        withoutEnlargement: true // Don't enlarge smaller images
      });
    }
    
    // Convert to WebP with optimized settings
    await sharpInstance
      .webp({ 
        quality: WEBP_QUALITY,
        effort: 6, // Higher effort = better compression
        smartSubsample: true // Better quality for smaller file size
      })
      .toFile(webpPath);
    
    const webpStats = fs.statSync(webpPath);
    const savings = ((1 - webpStats.size / originalSize) * 100).toFixed(1);
    const savingsMB = ((originalSize - webpStats.size) / 1024 / 1024).toFixed(2);
    
    console.log(`   ✅ Created WebP: ${(webpStats.size / 1024 / 1024).toFixed(2)} MB (${savings}% smaller, saved ${savingsMB} MB)`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log('📋 Strategy:');
  console.log('   • Resize to 2x display size (retina quality)');
  console.log('   • Convert to WebP format (80% quality)');
  console.log('   • Maintain aspect ratios (no cropping)');
  console.log('   • Keep originals as fallback\n');
  console.log(`📁 Source directory: ${IMAGES_DIR}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
  
  // Check if directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Error: Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }
  
  // Get all image files
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
  
  if (files.length === 0) {
    console.log('⚠️  No images found to optimize.');
    process.exit(0);
  }
  
  console.log(`Found ${files.length} image(s) to optimize:\n`);
  
  let totalOriginalSize = 0;
  let totalWebPSize = 0;
  
  // Process each image
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const originalSize = fs.statSync(filePath).size;
    totalOriginalSize += originalSize;
    
    await optimizeImage(filePath);
    
    // Check if WebP was created
    const baseName = path.basename(file, path.extname(file));
    const webpPath = path.join(OUTPUT_DIR, `${baseName}.webp`);
    if (fs.existsSync(webpPath)) {
      totalWebPSize += fs.statSync(webpPath).size;
    }
  }
  
  const totalSavings = ((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1);
  const totalSavingsMB = ((totalOriginalSize - totalWebPSize) / 1024 / 1024).toFixed(2);
  
  console.log('\n✨ Image optimization complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Original total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   WebP total: ${(totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total savings: ${totalSavings}% (${totalSavingsMB} MB)`);
  console.log('\n📝 Next steps:');
  console.log('   1. Test the website locally to ensure WebP images load correctly');
  console.log('   2. Original images are kept as fallback for older browsers');
  console.log('   3. Update components to use WebP with fallback (picture element)');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
