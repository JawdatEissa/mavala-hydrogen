import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting custom Vercel build...\n');

// Step 1: Run the Remix build
console.log('📦 Building Remix app...');
execSync('npx remix vite:build', { stdio: 'inherit' });

// Step 2: Create .vercel/output structure
console.log('\n📂 Creating Vercel output structure...');

const outputDir = '.vercel/output';
const staticDir = path.join(outputDir, 'static');
const functionsDir = path.join(outputDir, 'functions');

// Clean and create directories
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(functionsDir, { recursive: true });

// Step 3: Copy static assets (build/client) to static output
console.log('📋 Copying static assets...');
const clientDir = 'build/client';
if (fs.existsSync(clientDir)) {
  copyDirSync(clientDir, staticDir);
}

// Step 4: Create the serverless function config
console.log('⚡ Setting up serverless function...');

const serverDir = 'build/server';
const serverFiles = fs.readdirSync(serverDir);
const nodeDir = serverFiles.find(f => f.startsWith('nodejs-'));

if (nodeDir) {
  const funcDir = path.join(functionsDir, 'index.func');
  fs.mkdirSync(funcDir, { recursive: true });
  
  // Copy server files
  copyDirSync(path.join(serverDir, nodeDir), funcDir);
  
  // Create .vc-config.json
  const vcConfig = {
    runtime: 'nodejs20.x',
    handler: 'index.js',
    launcherType: 'Nodejs'
  };
  fs.writeFileSync(path.join(funcDir, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));
}

// Step 5: Create config.json
console.log('⚙️ Creating output config...');
const config = {
  version: 3,
  routes: [
    { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    { src: '/images/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index' }
  ]
};
fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(config, null, 2));

console.log('\n✅ Build complete! Output in .vercel/output');

// Check function size
const funcPath = path.join(functionsDir, 'index.func');
if (fs.existsSync(funcPath)) {
  const size = getDirSize(funcPath);
  console.log(`\n📊 Function size: ${(size / 1024 / 1024).toFixed(2)} MB`);
  if (size > 250 * 1024 * 1024) {
    console.log('⚠️ Warning: Function exceeds 250MB limit!');
  }
}

// Helper function to copy directory
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper function to get directory size
function getDirSize(dir) {
  let size = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

