#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { GeminiClient } = require('../src/gemini');
const { validateApiKey, printWelcome, printError } = require('../src/utils');

const packageJson = require('../package.json');

// CLI Configuration
program
  .name('gemini-assist')
  .description('AI Assistant CLI powered by Google Gemini API')
  .version(packageJson.version, '-v, --version', 'Display version information')
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env variable)')
  .option('-m, --model <model>', 'Gemini model to use (default: gemini-2.5-flash)')
  .option('-i, --interactive', 'Start interactive chat mode', false)
  .option('-t, --temperature <value>', 'Temperature for response (0-1)', '0.7')
  .option('--version-info', 'Show detailed version information')
  .parse(process.argv);

const options = program.opts();

// Handle version info command
if (options.versionInfo) {
  showVersionInfo();
  process.exit(0);
}

async function main() {
  try {
    // Get API key
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      printError('API key is required. Set GEMINI_API_KEY environment variable or use --api-key flag.');
      console.log(chalk.yellow('\nTo get your API key:'));
      console.log(chalk.cyan('  1. Visit https://makersuite.google.com/app/apikey'));
      console.log(chalk.cyan('  2. Create a new API key'));
      console.log(chalk.cyan('  3. Create a .env file in the project root:'));
      console.log(chalk.gray('     cp .env.example .env'));
      console.log(chalk.cyan('  4. Add your API key to .env file:'));
      console.log(chalk.gray('     GEMINI_API_KEY=your_key_here'));
      console.log(chalk.cyan('  OR set it as environment variable:'));
      console.log(chalk.gray('     export GEMINI_API_KEY=your_key_here\n'));
      process.exit(1);
    }

    if (!validateApiKey(apiKey)) {
      printError('Invalid API key format. Please check your API key.');
      process.exit(1);
    }

    // Initialize Gemini client
    const client = new GeminiClient(apiKey, {
      model: options.model,
      temperature: parseFloat(options.temperature)
    });

    // Check if stdin has data (for piping)
    const stdinData = await readStdin();
    
    // Interactive mode
    if (options.interactive || (process.argv.length === 2 && !stdinData)) {
      await startInteractiveMode(client);
    } else {
      // Single query mode - from args, stdin, or error
      let query = program.args.join(' ');
      
      // If no args but stdin has data, use stdin
      if (!query && stdinData) {
        query = stdinData;
      }
      
      if (!query) {
        printError('Please provide a query, use --interactive mode, or pipe input.');
        program.help();
        process.exit(1);
      }

      const response = await client.chat(query);
      console.log(chalk.green('\n' + response + '\n'));
    }
  } catch (error) {
    printError(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

async function startInteractiveMode(client) {
  printWelcome();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('You> ')
  });

  console.log(chalk.gray('Type your message and press Enter. Type "exit", "quit", or "bye" to end the conversation.'));
  console.log(chalk.gray('Commands: "clear" to clear screen, "history" to show conversation history.\n'));

  rl.prompt();

  rl.on('line', async (input) => {
    const query = input.trim();

    if (!query) {
      rl.prompt();
      return;
    }

    // Exit commands
    if (['exit', 'quit', 'bye', 'q'].includes(query.toLowerCase())) {
      console.log(chalk.yellow('\nGoodbye! 👋\n'));
      rl.close();
      return;
    }

    // Clear command
    if (query.toLowerCase() === 'clear') {
      console.clear();
      printWelcome();
      rl.prompt();
      return;
    }

    // History command
    if (query.toLowerCase() === 'history' || query.toLowerCase() === 'hist') {
      try {
        const count = await client.getHistoryCount();
        console.log(chalk.blue(`\n📊 Conversation history: ${count} messages\n`));
      } catch (error) {
        console.log(chalk.blue('\n📊 Conversation history: Not available\n'));
      }
      rl.prompt();
      return;
    }

    // Show thinking indicator
    process.stdout.write(chalk.gray('Gemini> '));
    
    try {
      const response = await client.chat(query);
      console.log(chalk.green(response) + '\n');
    } catch (error) {
      printError(`Error: ${error.message}`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

// Helper function to read from stdin
function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    
    let data = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
    
    // Set a timeout to resolve if no data comes
    setTimeout(() => resolve(''), 100);
  });
}

// Helper function to show detailed version info
function showVersionInfo() {
  const os = require('os');
  let rustInfo = 'Not available (using JS fallback)';
  let nodeVersion = process.version;
  
  try {
    const native = require('../index.node');
    const rustVersion = native.rust_version();
    rustInfo = 'Available ✓';
  } catch (error) {
    rustInfo = 'Not available (using JS fallback)';
  }
  
  console.log(chalk.bold.cyan('╔═══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   ') + chalk.bold.white('Gemini Assist Version Info') + chalk.bold.cyan('   ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝'));
  console.log(chalk.cyan('\n📦 Package:') + chalk.white(` ${packageJson.name}`));
  console.log(chalk.cyan('🔢 Version:') + chalk.white(` ${packageJson.version}`));
  console.log(chalk.cyan('📝 Description:') + chalk.white(` ${packageJson.description}`));
  console.log(chalk.cyan('👤 Author:') + chalk.white(` ${packageJson.author}`));
  console.log(chalk.cyan('📄 License:') + chalk.white(` ${packageJson.license}`));
  console.log(chalk.cyan('\n🖥️  Environment:'));
  console.log(chalk.cyan('   Node.js:') + chalk.white(` ${nodeVersion}`));
  console.log(chalk.cyan('   Platform:') + chalk.white(` ${os.platform()} ${os.arch()}`));
  console.log(chalk.cyan('   Rust Bindings:') + chalk.white(` ${rustInfo}`));
  console.log(chalk.cyan('\n🔗 Links:'));
  if (packageJson.repository && packageJson.repository.url) {
    console.log(chalk.cyan('   Repository:') + chalk.white(` ${packageJson.repository.url}`));
  }
  console.log(chalk.cyan('   NPM:') + chalk.white(` https://www.npmjs.com/package/${packageJson.name}`));
  console.log('');
}

// Run the CLI
main();
