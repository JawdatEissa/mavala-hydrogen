const fs = require('fs');
const path = require('path');

// Get all image files in public directory
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllImages(filePath, fileList);
    } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)) {
      // Store relative path from public directory
      const relativePath = filePath.replace(/\\/g, '/').replace('public/', '');
      fileList.push(relativePath);
    }
  });
  
  return fileList;
}

// Get all code files
function getAllCodeFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory() && file !== 'node_modules' && file !== '.cache' && file !== 'build') {
      getAllCodeFiles(filePath, fileList);
    } else if (/\.(tsx?|jsx?|json)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Read all code and find image references
function findImageReferences(codeFiles) {
  const references = new Set();
  
  codeFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Match various image reference patterns
    const patterns = [
      /["']\/images\/[^"']+\.(?:png|jpg|jpeg|webp|gif|svg)["']/gi,
      /["']images\/[^"']+\.(?:png|jpg|jpeg|webp|gif|svg)["']/gi,
      /src=["']\/[^"']+\.(?:png|jpg|jpeg|webp|gif|svg)["']/gi,
      /["'][^"']*\.(?:png|jpg|jpeg|webp|gif|svg)["']/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up the match
          let imagePath = match.replace(/["']/g, '').replace(/^\//, '');
          if (imagePath.startsWith('images/')) {
            references.add(imagePath);
          } else if (!imagePath.startsWith('http') && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(imagePath)) {
            references.add(imagePath);
          }
        });
      }
    });
  });
  
  return references;
}

console.log('🔍 Scanning for images...');
const allImages = getAllImages('public');
console.log(`📁 Found ${allImages.length} total images in public folder`);

console.log('\n🔍 Scanning code files for image references...');
const codeFiles = getAllCodeFiles('app');
const usedImages = findImageReferences(codeFiles);
console.log(`✅ Found ${usedImages.size} image references in code`);

// Find unused images
const unusedImages = allImages.filter(img => {
  const imgName = path.basename(img);
  const imgPath = img.replace(/\\/g, '/');
  
  // Check if this image or its name is referenced
  for (let ref of usedImages) {
    if (ref.includes(imgName) || ref === imgPath || ref === '/' + imgPath) {
      return false;
    }
  }
  return true;
});

console.log(`\n❌ Found ${unusedImages.length} potentially unused images`);

// Calculate size of unused images
let totalUnusedSize = 0;
unusedImages.forEach(img => {
  const fullPath = path.join('public', img);
  if (fs.existsSync(fullPath)) {
    totalUnusedSize += fs.statSync(fullPath).size;
  }
});

console.log(`💾 Total size of unused images: ${(totalUnusedSize / 1024 / 1024).toFixed(2)} MB`);

// Group unused images by directory
const unusedByDir = {};
unusedImages.forEach(img => {
  const dir = path.dirname(img);
  if (!unusedByDir[dir]) {
    unusedByDir[dir] = [];
  }
  unusedByDir[dir].push(path.basename(img));
});

console.log('\n📊 Unused images by directory:');
Object.entries(unusedByDir)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .forEach(([dir, files]) => {
    console.log(`  ${dir}: ${files.length} files`);
  });

// Save detailed report
const report = {
  totalImages: allImages.length,
  referencedImages: Array.from(usedImages),
  unusedImages: unusedImages,
  unusedSizeMB: (totalUnusedSize / 1024 / 1024).toFixed(2),
  unusedByDirectory: unusedByDir
};

fs.writeFileSync('unused-images-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: unused-images-report.json');
console.log('\n💡 To delete unused images, review the report first!');

