#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Optimizes images across multiple directories in the project:
 * - Converts to WebP format (better compression, modern browsers)
 * - Creates optimized versions of original formats (JPEG/PNG)
 * - Resizes oversized images to configured max width
 * - Preserves originals as backup with "-original" suffix
 * - Idempotent: skips already-optimized files safely
 * 
 * Usage:
 *   node scripts/optimize-images.js           # Optimize all directories
 *   node scripts/optimize-images.js --blog     # Blog images only (headers + figures)
 *   node scripts/optimize-images.js --general  # General images only (public/images)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─── Directory Configurations ────────────────────────────────────────────────
// Each directory can have its own quality and size settings.
// Blog headers are decorative so lower quality is fine.
// Blog figures are technical content so quality stays higher.

const DIRECTORIES = [
  {
    name: 'General Images',
    path: path.join(__dirname, '../public/images'),
    group: 'general',
    quality: { webp: 90, jpeg: 90, png: 95 },
    maxWidth: 2000
  },
  {
    name: 'Blog Headers',
    path: path.join(__dirname, '../public/blog/headers'),
    group: 'blog',
    quality: { webp: 80, jpeg: 85, png: 90 },
    maxWidth: 1200  // Headers don't need full resolution
  },
  {
    name: 'Blog Figures',
    path: path.join(__dirname, '../public/blog/figures'),
    group: 'blog',
    quality: { webp: 85, jpeg: 85, png: 90 },
    maxWidth: 1600
  }
];

// ─── Statistics Tracker ──────────────────────────────────────────────────────

const stats = {
  processed: 0,
  skipped: 0,
  originalSize: 0,
  optimizedSize: 0,
  errors: []
};

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Get all optimizable image files recursively.
 * Skips backup files (-original) and existing WebP outputs.
 */
function getImageFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      getImageFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const name = path.basename(entry.name, ext);

      // Skip backup files and WebP outputs
      if (name.endsWith('-original') || name.endsWith('-optimized') || ext === '.webp') continue;

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

// ─── Core Optimization ───────────────────────────────────────────────────────

/**
 * Optimize a single image with the given directory config.
 * Creates WebP version and optimizes the original format.
 * Skips files that have already been fully optimized.
 */
async function optimizeImage(imagePath, config) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${name}.webp`);
    const backupPath = path.join(dir, `${name}-original${ext}`);

    // Skip if already fully optimized (backup + WebP both exist)
    const hasBackup = fs.existsSync(backupPath);
    const hasWebP = fs.existsSync(webpPath);

    if (hasBackup && hasWebP) {
      stats.skipped++;
      return;
    }

    // Get original size
    const originalSize = fs.statSync(imagePath).size;
    stats.originalSize += originalSize;

    // Load image metadata
    const metadata = await sharp(imagePath).metadata();

    const relPath = path.relative(path.join(__dirname, '..'), imagePath);
    console.log(`\n  Processing: ${relPath}`);
    console.log(`   Original: ${formatBytes(originalSize)} (${metadata.width}x${metadata.height})`);

    // Build pipeline with optional resize
    let pipeline = sharp(imagePath);

    if (metadata.width > config.maxWidth) {
      pipeline = pipeline.resize(config.maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`   Resizing: ${metadata.width}px -> ${config.maxWidth}px max width`);
    }

    // Create WebP version (if missing)
    if (!hasWebP) {
      await pipeline
        .clone()
        .webp({ quality: config.quality.webp, effort: 6 })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      console.log(`   WebP: ${formatBytes(webpSize)} (${Math.round((1 - webpSize / originalSize) * 100)}% smaller)`);
      stats.optimizedSize += webpSize;
    }

    // Optimize original format (if not already backed up)
    if (!hasBackup) {
      const optimizedPath = path.join(dir, `${name}-optimized${ext}`);

      if (ext === '.jpg' || ext === '.jpeg') {
        await pipeline
          .clone()
          .jpeg({ quality: config.quality.jpeg, mozjpeg: true })
          .toFile(optimizedPath);
      } else if (ext === '.png') {
        await pipeline
          .clone()
          .png({ quality: config.quality.png, compressionLevel: 9, palette: true })
          .toFile(optimizedPath);
      }

      const optimizedSize = fs.statSync(optimizedPath).size;
      console.log(`   Optimized ${ext.slice(1).toUpperCase()}: ${formatBytes(optimizedSize)} (${Math.round((1 - optimizedSize / originalSize) * 100)}% smaller)`);

      // Replace original with optimized if smaller
      if (optimizedSize < originalSize) {
        fs.renameSync(imagePath, backupPath);
        fs.renameSync(optimizedPath, imagePath);
      } else {
        fs.unlinkSync(optimizedPath);
        console.log(`   Kept original (already optimal)`);
      }
    }

    stats.processed++;
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    stats.errors.push({ file: imagePath, error: error.message });
  }
}

/**
 * Process all images in a single directory configuration.
 */
async function processDirectory(dirConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(` ${dirConfig.name}`);
  console.log(`  Path: ${dirConfig.path}`);
  console.log(`  Quality: WebP ${dirConfig.quality.webp}%, JPEG ${dirConfig.quality.jpeg}%, PNG ${dirConfig.quality.png}%`);
  console.log(`  Max Width: ${dirConfig.maxWidth}px`);
  console.log('='.repeat(60));

  const imageFiles = getImageFiles(dirConfig.path);

  if (imageFiles.length === 0) {
    console.log('  No new images found to optimize.');
    return;
  }

  console.log(`  Found ${imageFiles.length} images to process`);

  for (const imagePath of imageFiles) {
    await optimizeImage(imagePath, dirConfig);
  }
}

// ─── Main Execution ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Filter directories based on CLI flag
  let dirsToProcess;

  if (args.includes('--blog')) {
    dirsToProcess = DIRECTORIES.filter(d => d.group === 'blog');
    console.log('Blog Images Optimization\n');
  } else if (args.includes('--general')) {
    dirsToProcess = DIRECTORIES.filter(d => d.group === 'general');
    console.log('General Images Optimization\n');
  } else {
    dirsToProcess = DIRECTORIES;
    console.log('Full Image Optimization\n');
  }

  // Process each directory
  for (const dirConfig of dirsToProcess) {
    await processDirectory(dirConfig);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log(' OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(` Images processed: ${stats.processed}`);
  console.log(` Images skipped (already optimized): ${stats.skipped}`);
  console.log(` Original total size: ${formatBytes(stats.originalSize)}`);
  console.log(` WebP total size: ${formatBytes(stats.optimizedSize)}`);

  if (stats.originalSize > 0) {
    const savings = stats.originalSize - stats.optimizedSize;
    const pct = Math.round((1 - stats.optimizedSize / stats.originalSize) * 100);
    console.log(` Total savings (WebP): ${formatBytes(savings)} (${pct}% reduction)`);
  }

  if (stats.errors.length > 0) {
    console.log(`\n  Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }

  console.log('\n Optimization complete!\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
