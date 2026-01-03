/**
 * Image Processing Script for pink-orange-product.jpg
 * 
 * This script requires the 'sharp' library:
 * npm install --save-dev sharp
 * 
 * Run with: node scripts/fix-image.js
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../public/images/pink-orange-product.jpg');
const outputPath = join(__dirname, '../public/images/pink-orange-product-fixed.jpg');

async function processImage() {
  try {
    if (!existsSync(inputPath)) {
      console.error('Image not found:', inputPath);
      process.exit(1);
    }

    console.log('Processing image with automated enhancements...');
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // Create a backup first
    const backupPath = join(__dirname, '../public/images/pink-orange-product-backup.jpg');
    await sharp(inputPath).toFile(backupPath);
    console.log('✅ Backup created');
    
    // Apply comprehensive adjustments
    await image
      // Exposure adjustment (+5 to +10)
      .modulate({
        brightness: 1.08,  // +8% exposure
        saturation: 1.02,  // Slight saturation boost
      })
      // Contrast enhancement (+10)
      .gamma(1.1)  // Gamma adjustment for contrast
      // Sharpen for label clarity
      .sharpen({
        sigma: 1.5,
        flat: 1,
        jagged: 2
      })
      // Enhance texture/clarity
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 9, -1, -1, -1, -1]  // Sharpening kernel
      })
      // Adjust levels for better whites and blacks
      .linear(1.1, -(128 * 0.1))  // Boost whites
      // Ensure high quality output
      .jpeg({ 
        quality: 95,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    console.log('✅ Image processed successfully!');
    console.log(`Output saved to: ${outputPath}`);
    console.log('\n⚠️  Note: Automated processing can do:');
    console.log('  ✅ Exposure/contrast adjustments');
    console.log('  ✅ Sharpening');
    console.log('  ✅ Color enhancements');
    console.log('\n❌ Still requires manual editing for:');
    console.log('  - Background replacement (pure white)');
    console.log('  - Image straightening');
    console.log('  - Precise shadow control');
    console.log('\n💡 Next steps:');
    console.log('  1. Review the fixed image');
    console.log('  2. Use Photoshop/Photopea for background & straightening');
    console.log('  3. Replace pink-orange-product.jpg with the final version');
    
  } catch (error) {
    console.error('Error processing image:', error);
    process.exit(1);
  }
}

processImage();

