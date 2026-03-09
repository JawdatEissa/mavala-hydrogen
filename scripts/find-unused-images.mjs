/**
 * Unused Image Scanner & Cleanup Tool
 * 
 * Scans all source files (tsx, ts, jsx, js, json, css, html, md) for image references,
 * then compares against actual image files on disk to find unused ones.
 * 
 * Usage:
 *   node scripts/find-unused-images.mjs           # Dry run - report only
 *   node scripts/find-unused-images.mjs --move     # Move unused images to staging folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const STAGING_DIR = path.resolve(ROOT, '..', '_unused_images_staging');

const MOVE_MODE = process.argv.includes('--move');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.avif', '.bmp', '.tiff', '.mp4']);
const SOURCE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.html', '.md', '.mjs', '.cjs']);

// Folders that are clearly backups and never referenced by application code
const KNOWN_BACKUP_DIRS = [
  'diagnosis-backup-original-png',
  'diagnosis-backup-png-originals',
  'images-backup-categories',
];

function getAllFiles(dir, extensions, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build' || entry.name === '.cache') continue;
      getAllFiles(fullPath, extensions, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function getImageFiles() {
  const images = getAllFiles(PUBLIC, IMAGE_EXTENSIONS);
  return images.map(fullPath => {
    const relativePath = path.relative(PUBLIC, fullPath).replace(/\\/g, '/');
    const urlPath = '/' + relativePath;
    const size = fs.statSync(fullPath).size;
    return { fullPath, relativePath, urlPath, size, filename: path.basename(fullPath) };
  });
}

function getSourceContent() {
  const sourceFiles = getAllFiles(path.join(ROOT, 'app'), SOURCE_EXTENSIONS);
  const scriptFiles = getAllFiles(path.join(ROOT, 'scripts'), SOURCE_EXTENSIONS);
  const rootConfigs = fs.readdirSync(ROOT)
    .filter(f => SOURCE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .map(f => path.join(ROOT, f));

  const allFiles = [...sourceFiles, ...scriptFiles, ...rootConfigs];
  let combinedContent = '';

  for (const file of allFiles) {
    try {
      combinedContent += '\n' + fs.readFileSync(file, 'utf-8');
    } catch {
      // skip unreadable files
    }
  }
  return combinedContent;
}

function extractProductSlugs() {
  const slugs = new Set();
  
  // From all-products.json
  try {
    const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', 'all-products.json'), 'utf-8'));
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.slug) slugs.add(p.slug);
        if (p.handle) slugs.add(p.handle);
      }
    }
  } catch {}

  // From all_products_new.json
  try {
    const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', 'products', 'all_products_new.json'), 'utf-8'));
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.slug) slugs.add(p.slug);
        if (p.handle) slugs.add(p.handle);
      }
    }
  } catch {}

  return slugs;
}

function isImageReferenced(image, sourceContent, productSlugs) {
  const { urlPath, relativePath, filename } = image;

  // Check if this image is in a known backup directory
  for (const backupDir of KNOWN_BACKUP_DIRS) {
    if (relativePath.startsWith(backupDir + '/') || relativePath.startsWith(backupDir + '\\')) {
      return { referenced: false, reason: 'backup-directory' };
    }
  }

  // 1. Direct URL path match (e.g., /images/shades/01.png or /diagnosis/dry-nail.png)
  if (sourceContent.includes(urlPath)) {
    return { referenced: true, reason: 'direct-url-path' };
  }

  // 2. Relative path match (without leading /)
  if (sourceContent.includes(relativePath)) {
    return { referenced: true, reason: 'relative-path' };
  }

  // 3. Filename match (for dynamic references like `/${slug}/${filename}`)
  if (sourceContent.includes(filename)) {
    return { referenced: true, reason: 'filename-match' };
  }

  // 4. URL-encoded filename (files with + in name)
  const decodedFilename = decodeURIComponent(filename.replace(/\+/g, ' '));
  if (decodedFilename !== filename && sourceContent.includes(decodedFilename)) {
    return { referenced: true, reason: 'decoded-filename-match' };
  }

  // 5. For images under /images/{product-slug}/ — check if product slug exists in product data
  //    These images are loaded dynamically via image-manifest.json
  const imagesMatch = relativePath.match(/^images\/([^/]+)\//);
  if (imagesMatch) {
    const folderSlug = imagesMatch[1];
    if (productSlugs.has(folderSlug)) {
      return { referenced: true, reason: 'product-slug-in-data' };
    }

    // Also check if the folder name appears as a concern slug (e.g., nail conditions)
    const concernPatterns = [
      'nail-concern-products', 'face-concern-products', 'blog',
      'shades', 'color', 'mini-color', 'all-products',
      'care', 'hands', 'foot-care', 'skincare', 'beauty', 'complexion',
      'makeup-corrector'
    ];
    if (concernPatterns.includes(folderSlug)) {
      // Check if specific files from these folders are referenced
      if (sourceContent.includes(urlPath) || sourceContent.includes(filename)) {
        return { referenced: true, reason: 'concern-folder-file-match' };
      }
      // For these special folders, check if ANY reference to the folder exists
      if (sourceContent.includes(`/images/${folderSlug}/`)) {
        return { referenced: true, reason: 'folder-path-referenced' };
      }
    }
  }

  // 6. For shade images - check if the parent shade folder name is referenced
  const shadesMatch = relativePath.match(/^images\/shades\/([^/]+)\//);
  if (shadesMatch) {
    const shadeName = shadesMatch[1];
    if (sourceContent.includes(shadeName)) {
      return { referenced: true, reason: 'shade-name-match' };
    }
  }

  // 7. Check for face-concerns, nail-concerns, skin-concerns, quiz, diagnosis, diagnosis-tiles, mavala-cares-images
  const topLevelFolders = ['face-concerns', 'nail-concerns', 'skin-concerns', 'quiz', 'diagnosis', 'diagnosis-tiles', 'mavala-cares-images'];
  for (const folder of topLevelFolders) {
    if (relativePath.startsWith(folder + '/')) {
      if (sourceContent.includes(urlPath) || sourceContent.includes(filename)) {
        return { referenced: true, reason: 'top-level-folder-match' };
      }
      // Check folder reference pattern
      if (sourceContent.includes(`/${folder}/`)) {
        const fnameWithoutExt = path.parse(filename).name;
        if (sourceContent.includes(fnameWithoutExt)) {
          return { referenced: true, reason: 'folder-and-stem-match' };
        }
      }
    }
  }

  return { referenced: false, reason: 'no-reference-found' };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function main() {
  console.log('='.repeat(70));
  console.log('  MAVALA PROJECT — UNUSED IMAGE SCANNER');
  console.log('='.repeat(70));
  console.log(`\nMode: ${MOVE_MODE ? 'MOVE (will relocate unused images)' : 'DRY RUN (report only, use --move to relocate)'}`);
  console.log(`Scanning: ${PUBLIC}\n`);

  // Step 1: Catalog all images
  console.log('[1/4] Cataloging all image files...');
  const allImages = getImageFiles();
  const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);
  console.log(`  Found ${allImages.length} image files (${formatBytes(totalSize)} total)\n`);

  // Step 2: Read all source code
  console.log('[2/4] Reading all source files for references...');
  const sourceContent = getSourceContent();
  console.log(`  Loaded ${formatBytes(sourceContent.length)} of source code\n`);

  // Step 3: Extract product slugs
  console.log('[3/4] Extracting product slugs from data files...');
  const productSlugs = extractProductSlugs();
  console.log(`  Found ${productSlugs.size} product slugs\n`);

  // Step 4: Cross-reference
  console.log('[4/4] Cross-referencing images against code references...\n');

  const unused = [];
  const used = [];

  for (const image of allImages) {
    const result = isImageReferenced(image, sourceContent, productSlugs);
    if (result.referenced) {
      used.push({ ...image, reason: result.reason });
    } else {
      unused.push({ ...image, reason: result.reason });
    }
  }

  // Group unused by directory
  const unusedByDir = {};
  for (const img of unused) {
    const dir = path.dirname(img.relativePath);
    if (!unusedByDir[dir]) unusedByDir[dir] = [];
    unusedByDir[dir].push(img);
  }

  const unusedSize = unused.reduce((sum, img) => sum + img.size, 0);
  const usedSize = used.reduce((sum, img) => sum + img.size, 0);

  // Report
  console.log('='.repeat(70));
  console.log('  RESULTS');
  console.log('='.repeat(70));
  console.log(`\n  Total images:    ${allImages.length} files (${formatBytes(totalSize)})`);
  console.log(`  Used images:     ${used.length} files (${formatBytes(usedSize)})`);
  console.log(`  Unused images:   ${unused.length} files (${formatBytes(unusedSize)})`);
  console.log(`  Reduction:       ${((unusedSize / totalSize) * 100).toFixed(1)}%\n`);

  // Detailed breakdown by directory
  console.log('-'.repeat(70));
  console.log('  UNUSED IMAGES BY DIRECTORY');
  console.log('-'.repeat(70));

  const sortedDirs = Object.entries(unusedByDir).sort((a, b) => {
    const sizeA = a[1].reduce((s, i) => s + i.size, 0);
    const sizeB = b[1].reduce((s, i) => s + i.size, 0);
    return sizeB - sizeA;
  });

  for (const [dir, images] of sortedDirs) {
    const dirSize = images.reduce((s, i) => s + i.size, 0);
    console.log(`\n  📁 ${dir}/ — ${images.length} files (${formatBytes(dirSize)})`);
    for (const img of images.slice(0, 5)) {
      console.log(`     - ${img.filename} (${formatBytes(img.size)}) [${img.reason}]`);
    }
    if (images.length > 5) {
      console.log(`     ... and ${images.length - 5} more files`);
    }
  }

  // Move files if requested
  if (MOVE_MODE && unused.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('  MOVING UNUSED IMAGES');
    console.log('='.repeat(70));

    if (!fs.existsSync(STAGING_DIR)) {
      fs.mkdirSync(STAGING_DIR, { recursive: true });
    }

    let movedCount = 0;
    let movedSize = 0;

    for (const img of unused) {
      const destPath = path.join(STAGING_DIR, img.relativePath);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      try {
        fs.renameSync(img.fullPath, destPath);
        movedCount++;
        movedSize += img.size;
      } catch (err) {
        // If rename fails (cross-device), copy + delete
        try {
          fs.copyFileSync(img.fullPath, destPath);
          fs.unlinkSync(img.fullPath);
          movedCount++;
          movedSize += img.size;
        } catch (err2) {
          console.log(`  ⚠ Failed to move: ${img.relativePath} — ${err2.message}`);
        }
      }
    }

    // Clean up empty directories
    function removeEmptyDirs(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          removeEmptyDirs(fullPath);
        }
      }
      const remaining = fs.readdirSync(dir);
      if (remaining.length === 0 && dir !== PUBLIC) {
        fs.rmdirSync(dir);
      }
    }
    removeEmptyDirs(PUBLIC);

    console.log(`\n  Moved ${movedCount} files (${formatBytes(movedSize)}) to:`);
    console.log(`  ${STAGING_DIR}`);
    console.log(`\n  If everything works fine, you can delete that folder later.`);
    console.log(`  If something breaks, move the files back from there.`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n  Before: ${allImages.length} images, ${formatBytes(totalSize)}`);
  console.log(`  After:  ${used.length} images, ${formatBytes(usedSize)}`);
  console.log(`  Saved:  ${unused.length} images, ${formatBytes(unusedSize)} (${((unusedSize / totalSize) * 100).toFixed(1)}% reduction)`);
  
  if (!MOVE_MODE && unused.length > 0) {
    console.log(`\n  Run with --move to relocate unused images:`);
    console.log(`  node scripts/find-unused-images.mjs --move\n`);
  }

  // Write detailed report to file
  const reportPath = path.join(ROOT, 'unused-images-report.txt');
  const reportLines = [
    `Unused Images Report — ${new Date().toISOString()}`,
    `Total: ${allImages.length} images (${formatBytes(totalSize)})`,
    `Unused: ${unused.length} images (${formatBytes(unusedSize)})`,
    `Used: ${used.length} images (${formatBytes(usedSize)})`,
    '',
    'UNUSED FILES:',
    ...unused.map(i => `  ${i.relativePath} (${formatBytes(i.size)}) [${i.reason}]`),
    '',
    'USED FILES:',
    ...used.map(i => `  ${i.relativePath} [${i.reason}]`),
  ];
  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
  console.log(`  Full report written to: unused-images-report.txt`);
}

main();
