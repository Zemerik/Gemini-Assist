#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const readline = require('readline');
const path = require('path');
require('dotenv').config();

const { GeminiClient } = require('../src/gemini');
const { validateApiKey, printWelcome, printError } = require('../src/utils');

const packageJson = require('../package.json');

// CLI Configuration
program
  .name('gemini-assist')
  .description('AI Assistant CLI powered by Google Gemini API')
  .version(packageJson.version)
  .option('-k, --api-key <key>', 'Gemini API key (or set GEMINI_API_KEY env variable)')
  .option('-m, --model <model>', 'Gemini model to use (default: gemini-2.5-flash)')
  .option('-i, --interactive', 'Start interactive chat mode', false)
  .option('-t, --temperature <value>', 'Temperature for response (0-1)', '0.7')
  .parse(process.argv);

const options = program.opts();

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

    // Interactive mode
    if (options.interactive || process.argv.length === 2) {
      await startInteractiveMode(client);
    } else {
      // Single query mode
      const query = program.args.join(' ');
      if (!query) {
        printError('Please provide a query or use --interactive mode.');
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

  console.log(chalk.gray('Type your message and press Enter. Type "exit", "quit", or "bye" to end the conversation.\n'));

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

// Run the CLI
main();
