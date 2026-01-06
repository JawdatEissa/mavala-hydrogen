const fs = require('fs');
const path = require('path');

console.log('Starting image analysis...\n');

// Get all images recursively
function getImages(dir, baseDir = dir, images = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        getImages(fullPath, baseDir, images);
      } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(item)) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        images.push({
          path: relativePath,
          name: item,
          size: stat.size
        });
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err.message);
  }
  return images;
}

// Get all code content
function getCodeContent(dir, content = '') {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== '.cache' && item !== 'build') {
        content += getCodeContent(fullPath, '');
      } else if (/\.(tsx?|jsx?|json)$/i.test(item)) {
        content += fs.readFileSync(fullPath, 'utf8') + '\n';
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err.message);
  }
  return content;
}

try {
  // Get all images
  console.log('📁 Scanning public folder for images...');
  const allImages = getImages('public');
  console.log(`   Found ${allImages.length} images\n`);
  
  // Get all code
  console.log('📄 Reading all code files...');
  const allCode = getCodeContent('app');
  console.log(`   Read ${allCode.length} characters of code\n`);
  
  // Check which images are referenced
  console.log('🔍 Checking which images are used...\n');
  
  const used = [];
  const unused = [];
  let usedSize = 0;
  let unusedSize = 0;
  
  for (const img of allImages) {
    // Check if image name or path appears in code
    const isUsed = allCode.includes(img.name) || 
                   allCode.includes(img.path) || 
                   allCode.includes(img.path.replace(/\//g, '\\'));
    
    if (isUsed) {
      used.push(img);
      usedSize += img.size;
    } else {
      unused.push(img);
      unusedSize += img.size;
    }
  }
  
  console.log('✅ USED IMAGES:');
  console.log(`   Count: ${used.length}`);
  console.log(`   Size: ${(usedSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('❌ UNUSED IMAGES:');
  console.log(`   Count: ${unused.length}`);
  console.log(`   Size: ${(unusedSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Group unused by directory
  const byDir = {};
  for (const img of unused) {
    const dir = path.dirname(img.path);
    if (!byDir[dir]) {
      byDir[dir] = { count: 0, size: 0 };
    }
    byDir[dir].count++;
    byDir[dir].size += img.size;
  }
  
  console.log('📊 Top 15 directories with unused images:');
  Object.entries(byDir)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 15)
    .forEach(([dir, info]) => {
      console.log(`   ${dir}`);
      console.log(`      Files: ${info.count}, Size: ${(info.size / 1024 / 1024).toFixed(2)} MB`);
    });
  
  // Save report
  const report = {
    summary: {
      totalImages: allImages.length,
      usedImages: used.length,
      unusedImages: unused.length,
      usedSizeMB: (usedSize / 1024 / 1024).toFixed(2),
      unusedSizeMB: (unusedSize / 1024 / 1024).toFixed(2)
    },
    unusedByDirectory: byDir,
    unusedImagesList: unused.map(img => img.path)
  };
  
  fs.writeFileSync('image-analysis.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Full report saved to: image-analysis.json');
  
} catch (err) {
  console.error('ERROR:', err);
}

