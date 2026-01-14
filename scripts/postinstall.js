const { existsSync } = require('fs');
const { join } = require('path');

// Check if Rust build is available, if not, fallback to JS
const nativePath = join(__dirname, '..', 'index.node');

if (!existsSync(nativePath)) {
  console.log('⚠ Rust native bindings not found. Building...');
  console.log('   Run "npm run build" to compile Rust bindings for better performance.');
  console.log('   The CLI will work with JavaScript fallback in the meantime.');
}
