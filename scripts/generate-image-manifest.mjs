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
    
    // Group by base name and prefer PNG over JPG
    const baseNames = new Map();
    for (const file of imageFiles) {
      const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const ext = file.split('.').pop()?.toLowerCase() || '';
      
      if (!baseNames.has(baseName) || (ext === 'png' && !baseNames.get(baseName)?.endsWith('.png'))) {
        baseNames.set(baseName, file);
      }
    }
    
    // Return sorted unique images as paths
    return Array.from(baseNames.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, filename]) => `/images/${relativePath}/${filename}`);
  } catch {
    return [];
  }
}

