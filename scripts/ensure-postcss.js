const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const destPath = path.join(projectRoot, 'dist', 'postcss.config.js');
const distDir = path.dirname(destPath);

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write a minimal PostCSS config
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

try {
  fs.writeFileSync(destPath, postcssConfig);
  console.log(`Created minimal PostCSS config at: ${destPath}`);
} catch (err) {
  console.error('Error creating PostCSS config:', err);
  process.exit(1);
}
