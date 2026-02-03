import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = './public';
const MIN_SIZE_MB = 1;
const QUALITY = 85;

// Find all images recursively
function findImages(dir, images = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findImages(fullPath, images);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const sizeMB = stat.size / (1024 * 1024);
        if (sizeMB > MIN_SIZE_MB) {
          images.push({ path: fullPath, sizeMB: sizeMB.toFixed(2), ext });
        }
      }
    }
  }
  
  return images;
}

async function compressImage(imagePath, ext) {
  const originalSize = fs.statSync(imagePath).size;
  const tempPath = imagePath + '.tmp';
  
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Configure output based on format
    if (ext === '.png') {
      await image
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toFile(tempPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(tempPath);
    } else if (ext === '.webp') {
      await image
        .webp({ quality: QUALITY })
        .toFile(tempPath);
    }
    
    const newSize = fs.statSync(tempPath).size;
    
    // Only replace if new file is smaller
    if (newSize < originalSize) {
      fs.unlinkSync(imagePath);
      fs.renameSync(tempPath, imagePath);
      return { 
        success: true, 
        originalMB: (originalSize / (1024 * 1024)).toFixed(2),
        newMB: (newSize / (1024 * 1024)).toFixed(2),
        saved: ((originalSize - newSize) / (1024 * 1024)).toFixed(2)
      };
    } else {
      fs.unlinkSync(tempPath);
      return { success: false, reason: 'No size reduction' };
    }
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log(`Finding images larger than ${MIN_SIZE_MB}MB in ${PUBLIC_DIR}...\n`);
  
  const images = findImages(PUBLIC_DIR);
  console.log(`Found ${images.length} images to compress\n`);
  
  let totalSaved = 0;
  let successCount = 0;
  
  for (const img of images) {
    process.stdout.write(`Compressing: ${path.basename(img.path)} (${img.sizeMB}MB)... `);
    
    const result = await compressImage(img.path, img.ext);
    
    if (result.success) {
      console.log(`✓ ${result.originalMB}MB → ${result.newMB}MB (saved ${result.saved}MB)`);
      totalSaved += parseFloat(result.saved);
      successCount++;
    } else {
      console.log(`✗ ${result.reason}`);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Compressed: ${successCount}/${images.length} images`);
  console.log(`Total saved: ${totalSaved.toFixed(2)}MB`);
}

main().catch(console.error);
