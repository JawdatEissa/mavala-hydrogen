const fs = require('fs');
const path = require('path');

console.log('=== ANALYZING IMAGE USAGE ===\n');

// Get all folders in public/images
const imagesDir = path.join(__dirname, 'public', 'images');
const allFolders = fs.readdirSync(imagesDir).filter(f => {
  return fs.statSync(path.join(imagesDir, f)).isDirectory();
});

console.log(`Total folders in public/images: ${allFolders.length}\n`);

// Read all code
console.log('Reading code files...');
let allCode = '';

function readCodeFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== '.cache' && item !== 'build' && item !== '.git') {
      readCodeFiles(fullPath);
    } else if (/\.(tsx?|jsx?|json)$/i.test(item)) {
      allCode += fs.readFileSync(fullPath, 'utf8');
    }
  }
}

readCodeFiles(path.join(__dirname, 'app'));
console.log(`Read ${allCode.length} characters\n`);

// Check which folders are used
const used = [];
const unused = [];

for (const folder of allFolders) {
  if (allCode.includes(folder)) {
    used.push(folder);
  } else {
    unused.push(folder);
  }
}

console.log('RESULTS:');
console.log(`  Used folders: ${used.length}`);
console.log(`  Unused folders: ${unused.length}\n`);

// Calculate sizes
console.log('Calculating sizes...');
const unusedDetails = [];
let totalUnusedSize = 0;

for (const folder of unused) {
  const folderPath = path.join(imagesDir, folder);
  let size = 0;
  let fileCount = 0;
  
  try {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        size += stat.size;
        fileCount++;
      }
    }
  } catch (e) {}
  
  totalUnusedSize += size;
  unusedDetails.push({
    folder,
    sizeMB: (size / 1024 / 1024).toFixed(2),
    files: fileCount
  });
}

console.log(`\nTOTAL UNUSED SIZE: ${(totalUnusedSize / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

// Show top 50
console.log('TOP 50 LARGEST UNUSED FOLDERS:');
console.log('Folder | Size (MB) | Files');
console.log('----------------------------------------');
unusedDetails
  .sort((a, b) => parseFloat(b.sizeMB) - parseFloat(a.sizeMB))
  .slice(0, 50)
  .forEach(item => {
    console.log(`${item.folder.padEnd(30)} | ${item.sizeMB.padStart(8)} | ${item.files}`);
  });

// Save files
fs.writeFileSync('unused-folders-list.txt', unused.join('\n'));
fs.writeFileSync('used-folders-list.txt', used.join('\n'));
fs.writeFileSync('unused-folders-details.json', JSON.stringify(unusedDetails, null, 2));

console.log('\n\nFILES SAVED:');
console.log('  - unused-folders-list.txt');
console.log('  - used-folders-list.txt');
console.log('  - unused-folders-details.json');
console.log('\nYou can now move these unused folders out of the project.');

