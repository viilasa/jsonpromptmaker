const fs = require('fs');
const path = require('path');

// Ensure postcss.config.js exists in the dist directory
const sourcePath = path.join(__dirname, '../postcss.config.cjs');
const destPath = path.join(__dirname, '../dist/postcss.config.js');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.dirname(destPath))) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
}

// Copy the file
fs.copyFileSync(sourcePath, destPath);

console.log('PostCSS config copied successfully!');
