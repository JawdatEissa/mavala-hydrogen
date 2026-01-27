/**
 * Generate a manifest of all images in public/images
 * This runs at BUILD TIME so the serverless function doesn't need to scan the filesystem
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📸 Generating image manifest...');

const publicImagesDir = path.join(projectRoot, 'public', 'images');
const manifestPath = path.join(projectRoot, 'app', 'data', 'image-manifest.json');

// Build manifest structure
const manifest = {
  products: {},  // slug -> [image paths]
  shades: {},    // shade folder name -> [image paths]
  generated: new Date().toISOString()
};

// Scan product image folders
if (fs.existsSync(publicImagesDir)) {
  const folders = fs.readdirSync(publicImagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const folder of folders) {
    if (folder.name === 'shades') continue; // Handle shades separately
    
    const folderPath = path.join(publicImagesDir, folder.name);
    const images = getImagesFromFolder(folderPath, folder.name);
    
    if (images.length > 0) {
      manifest.products[folder.name] = images;
    }
  }
  
  console.log(`  ✅ Found ${Object.keys(manifest.products).length} product folders`);
}

// Scan shades folder
const shadesDir = path.join(publicImagesDir, 'shades');
if (fs.existsSync(shadesDir)) {
  const shadeFolders = fs.readdirSync(shadesDir, { withFileTypes: true })
    .filter(d => d.isDirectory());
  
  for (const folder of shadeFolders) {
    const folderPath = path.join(shadesDir, folder.name);
    const images = getImagesFromFolder(folderPath, `shades/${folder.name}`);
    
    if (images.length > 0) {
      manifest.shades[folder.name] = images;
    }
  }
  
  console.log(`  ✅ Found ${Object.keys(manifest.shades).length} shade folders`);
}

// Write manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n✅ Manifest written to ${manifestPath}`);

// Helper function to get images from a folder
function getImagesFromFolder(folderPath, relativePath) {
  try {
    const files = fs.readdirSync(folderPath);
    const imageFiles = files
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
    
    const isShadeFolder = relativePath.startsWith('shades/');
    
    // For shade folders, use only clean numbered files (01.png, 02.png, 03.png)
    if (isShadeFolder) {
      const numberGroups = new Map(); // number -> file
      
      for (const file of imageFiles) {
        const ext = file.split('.').pop()?.toLowerCase() || '';
        const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        
        // Only accept clean numbered files (e.g., "01", "02", "03")
        if (!/^\d+$/.test(baseName)) continue;
        
        const num = baseName;
        // Prefer PNG over JPG
        if (!numberGroups.has(num) || ext === 'png') {
          numberGroups.set(num, file);
        }
      }
      
      // Build result array sorted by number
      const result = [];
      const sortedNumbers = Array.from(numberGroups.keys()).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (const num of sortedNumbers) {
        const file = numberGroups.get(num);
        if (file) {
          result.push(`/images/${relativePath}/${file}`);
        }
      }
      
      return result;
    }
    
    // For non-shade folders: sort with main image first, then secondary (02, 03, etc.)
    const baseNames = new Map();
    for (const file of imageFiles) {
      const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const ext = file.split('.').pop()?.toLowerCase() || '';
      
      if (!baseNames.has(baseName) || (ext === 'png' && !baseNames.get(baseName)?.endsWith('.png'))) {
        baseNames.set(baseName, file);
      }
    }
    
    // Custom sort: main images first (00, 01, or non-numbered), then secondary (02, 03, etc.)
    const entries = Array.from(baseNames.entries());
    
    // Categorize files
    const mainImages = []; // 00_, 01_, or files not starting with 02-99
    const secondaryImages = []; // 02, 03, etc. (secondary images without grey background)
    
    for (const [baseName, filename] of entries) {
      // Check if it's a secondary image (starts with 02, 03, 04, etc. - pure number or number only)
      const isSecondary = /^0[2-9]$|^[1-9][0-9]?$/.test(baseName) || /^0[2-9]_/.test(baseName);
      
      if (isSecondary) {
        secondaryImages.push([baseName, filename]);
      } else {
        mainImages.push([baseName, filename]);
      }
    }
    
    // Sort each category
    mainImages.sort((a, b) => a[0].localeCompare(b[0]));
    secondaryImages.sort((a, b) => {
      // Extract number for proper numeric sorting
      const numA = parseInt(a[0].match(/^\d+/)?.[0] || '99');
      const numB = parseInt(b[0].match(/^\d+/)?.[0] || '99');
      return numA - numB;
    });
    
    // Combine: main images first, then secondary
    const sortedEntries = [...mainImages, ...secondaryImages];
    
    return sortedEntries.map(([_, filename]) => `/images/${relativePath}/${filename}`);
  } catch {
    return [];
  }
}

