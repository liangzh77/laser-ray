#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Building for production...');

// Copy src directory to public/src
const srcDir = path.join(__dirname, '..', 'src');
const destDir = path.join(__dirname, '..', 'public', 'src');

// Remove existing public/src if it exists
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

// Copy src to public/src
copyRecursiveSync(srcDir, destDir);

console.log('✓ Copied src/ to public/src/');
console.log('✓ Build completed successfully!');
