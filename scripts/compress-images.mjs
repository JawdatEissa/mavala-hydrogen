/**
 * Compress secondary images (02.*, 03.*) that are larger than 600KB
 * Retains 85% quality to save file size
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const imagesDir = path.join(projectRoot, 'public', 'images');
const MIN_SIZE_BYTES = 600 * 1024; // 600KB
const QUALITY = 85; // 85% quality

console.log('🖼️  Compressing large secondary images (02.*, 03.*)...\n');

// Find all secondary images (02.*, 03.*) recursively
function findSecondaryImages(dir, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findSecondaryImages(fullPath, results);
    } else if (file.isFile()) {
      // Match 02.* or 03.* files (jpg, jpeg, png, webp)
      if (/^0[2-9]\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        const stats = fs.statSync(fullPath);
        if (stats.size > MIN_SIZE_BYTES) {
          results.push({
            path: fullPath,
            size: stats.size,
            name: file.name
          });
        }
      }
    }
  }
  
  return results;
}

// Compress a single image using copy-compress-replace to avoid file locking
async function compressImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const originalSize = fs.statSync(imagePath).size;
  const tempPath = imagePath + '.tmp';
  
  try {
    // Read file into buffer first to release the file handle
    const inputBuffer = fs.readFileSync(imagePath);
    let sharpInstance = sharp(inputBuffer);
    let outputBuffer;
    
    if (ext === '.jpg' || ext === '.jpeg') {
      outputBuffer = await sharpInstance
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();
    } else if (ext === '.png') {
      outputBuffer = await sharpInstance
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toBuffer();
    } else if (ext === '.webp') {
      outputBuffer = await sharpInstance
        .webp({ quality: QUALITY })
        .toBuffer();
    } else {
      console.log(`  ⏭️  Skipping unsupported format: ${imagePath}`);
      return null;
    }
    
    // Only save if we actually reduced the size
    if (outputBuffer.length < originalSize) {
      // Write to temp file first, then rename
      fs.writeFileSync(tempPath, outputBuffer);
      fs.renameSync(tempPath, imagePath);
      return {
        path: imagePath,
        originalSize,
        newSize: outputBuffer.length,
        saved: originalSize - outputBuffer.length
      };
    } else {
      return {
        path: imagePath,
        originalSize,
        newSize: originalSize,
        saved: 0,
        skipped: true
      };
    }
  } catch (error) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    console.error(`  ❌ Error compressing ${imagePath}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  const images = findSecondaryImages(imagesDir);
  
  console.log(`Found ${images.length} secondary images larger than 600KB\n`);
  
  if (images.length === 0) {
    console.log('✅ No images need compression!');
    return;
  }
  
  let totalSaved = 0;
  let compressed = 0;
  let skipped = 0;
  
  for (const image of images) {
    const relativePath = path.relative(imagesDir, image.path);
    process.stdout.write(`  Compressing ${relativePath}...`);
    
    const result = await compressImage(image.path);
    
    if (result) {
      if (result.skipped) {
        console.log(` already optimal`);
        skipped++;
      } else {
        const savedKB = (result.saved / 1024).toFixed(1);
        const newSizeKB = (result.newSize / 1024).toFixed(1);
        console.log(` saved ${savedKB}KB (now ${newSizeKB}KB)`);
        totalSaved += result.saved;
        compressed++;
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  ✅ Compressed: ${compressed} images`);
  console.log(`  ⏭️  Skipped (already optimal): ${skipped} images`);
  console.log(`  💾 Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
