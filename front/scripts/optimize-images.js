#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script optimizes all images in the public/images directory:
 * - Converts to WebP format (better compression)
 * - Creates optimized versions of original formats
 * - Maintains visual quality while reducing file size by 60-80%
 * - Preserves original files as backup
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  imagesDir: path.join(__dirname, '../public/images'),
  quality: {
    webp: 90,      // WebP quality (0-100) - 90 es muy alta calidad
    jpeg: 90,      // JPEG quality (0-100) - 90 mantiene excelente calidad
    png: 95        // PNG compression level (0-100) - 95 para máxima calidad PNG
  },
  maxWidth: 2000,  // Maximum width for large images
  preserveOriginals: true,  // SIEMPRE mantiene originales como backup
  backupDir: null   // Si quieres un directorio separado para backups, especifícalo aquí
};

// Track statistics
const stats = {
  processed: 0,
  originalSize: 0,
  optimizedSize: 0,
  errors: []
};

/**
 * Get all image files recursively
 */
function getImageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getImageFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${name}.webp`);
    
    // Get original size
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;
    stats.originalSize += originalSize;
    
    // Load image metadata
    const metadata = await sharp(imagePath).metadata();
    
    console.log(`\n📸 Processing: ${path.relative(CONFIG.imagesDir, imagePath)}`);
    console.log(`   Original: ${formatBytes(originalSize)} (${metadata.width}x${metadata.height})`);
    
    // Create Sharp pipeline
    let pipeline = sharp(imagePath);
    
    // Resize if too large
    if (metadata.width > CONFIG.maxWidth) {
      pipeline = pipeline.resize(CONFIG.maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Create WebP version (best compression)
    await pipeline
      .clone()
      .webp({ quality: CONFIG.quality.webp, effort: 6 })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    console.log(`   WebP: ${formatBytes(webpSize)} (${Math.round((1 - webpSize/originalSize) * 100)}% smaller)`);
    stats.optimizedSize += webpSize;
    
    // Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      const optimizedPath = path.join(dir, `${name}-optimized${ext}`);
      await sharp(imagePath)
        .jpeg({ quality: CONFIG.quality.jpeg, mozjpeg: true })
        .toFile(optimizedPath);
      
      const optimizedSize = fs.statSync(optimizedPath).size;
      console.log(`   Optimized JPEG: ${formatBytes(optimizedSize)} (${Math.round((1 - optimizedSize/originalSize) * 100)}% smaller)`);
      
      // Replace original if smaller
      if (optimizedSize < originalSize) {
        fs.renameSync(imagePath, path.join(dir, `${name}-original${ext}`));
        fs.renameSync(optimizedPath, imagePath);
      } else {
        fs.unlinkSync(optimizedPath);
      }
    } else if (ext === '.png') {
      const optimizedPath = path.join(dir, `${name}-optimized${ext}`);
      await sharp(imagePath)
        .png({ quality: CONFIG.quality.png, compressionLevel: 9, palette: true })
        .toFile(optimizedPath);
      
      const optimizedSize = fs.statSync(optimizedPath).size;
      console.log(`   Optimized PNG: ${formatBytes(optimizedSize)} (${Math.round((1 - optimizedSize/originalSize) * 100)}% smaller)`);
      
      // Replace original if smaller
      if (optimizedSize < originalSize) {
        fs.renameSync(imagePath, path.join(dir, `${name}-original${ext}`));
        fs.renameSync(optimizedPath, imagePath);
      } else {
        fs.unlinkSync(optimizedPath);
      }
    }
    
    stats.processed++;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.errors.push({ file: imagePath, error: error.message });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(' Starting Image Optimization\n');
  console.log(` Directory: ${CONFIG.imagesDir}`);
  console.log(`  Quality: WebP ${CONFIG.quality.webp}%, JPEG ${CONFIG.quality.jpeg}%, PNG ${CONFIG.quality.png}%`);
  console.log(` Max Width: ${CONFIG.maxWidth}px\n`);
  
  const imageFiles = getImageFiles(CONFIG.imagesDir);
  console.log(`Found ${imageFiles.length} images to process\n`);
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  // Process images
  for (const imagePath of imageFiles) {
    await optimizeImage(imagePath);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(' OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(` Images processed: ${stats.processed}`);
  console.log(` Original total size: ${formatBytes(stats.originalSize)}`);
  console.log(` Optimized total size: ${formatBytes(stats.optimizedSize)}`);
  console.log(` Total savings: ${formatBytes(stats.originalSize - stats.optimizedSize)} (${Math.round((1 - stats.optimizedSize/stats.originalSize) * 100)}% reduction)`);
  
  if (stats.errors.length > 0) {
    console.log(`\n  Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }
  
  console.log('\n Optimization complete!');
  console.log(' Tip: Use the WebP versions in your components for best performance.');
  console.log(' Original files are backed up with "-original" suffix.\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
