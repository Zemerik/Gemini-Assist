const chalk = require('chalk');

// Try to use Rust validation, fallback to JS
let validateApiKeyRust;
try {
  const native = require('../../index.node');
  validateApiKeyRust = native.validate_api_key_rust;
} catch (error) {
  validateApiKeyRust = null;
}

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Use Rust validation if available, otherwise JS
  if (validateApiKeyRust) {
    return validateApiKeyRust(apiKey);
  }
  
  // JS fallback
  return apiKey.length > 10 && /^[A-Za-z0-9_-]+$/.test(apiKey);
}

function printWelcome() {
  // Check if Rust is available
  let rustInfo = '';
  try {
    const native = require('../../index.node');
    const rustVersion = native.rust_version();
    rustInfo = chalk.green(' (Rust-powered)');
  } catch (error) {
    rustInfo = chalk.yellow(' (JS mode)');
  }
  
  console.clear();
  console.log(chalk.bold.cyan('╔═══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║      ') + chalk.bold.white('Gemini Assist v1.1.1-Beta') + rustInfo + chalk.bold.cyan('      ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝'));
  console.log(chalk.gray('AI Assistant powered by Google Gemini\n'));
}

function printError(message) {
  console.error(chalk.red.bold('✗ Error: ') + chalk.red(message));
}

function printSuccess(message) {
  console.log(chalk.green.bold('✓ ') + chalk.green(message));
}

function printInfo(message) {
  console.log(chalk.blue.bold('ℹ ') + chalk.blue(message));
}

module.exports = {
  validateApiKey,
  printWelcome,
  printError,
  printSuccess,
  printInfo
};
