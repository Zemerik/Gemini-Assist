# Gemini Assist v1.1.1-Beta

AI Assistant CLI tool powered by Google Gemini API. Interact with Google's Gemini AI model directly from your terminal.

**🚀 Hybrid Architecture: 50% JavaScript, 50% Rust**  
This project uses Rust for core API operations and JavaScript for the CLI interface, providing the best of both worlds: Rust's performance and JavaScript's flexibility.

## Features

- 🤖 **Interactive Chat Mode** - Have conversations with Gemini AI
- 💬 **Single Query Mode** - Quick one-off questions
- 🎨 **Beautiful CLI Interface** - Colorful, user-friendly terminal experience
- ⚙️ **Configurable** - Customize model, temperature, and more
- 📦 **Easy Installation** - Simple npm package installation
- 🔑 **Secure API Key Management** - Support for environment variables

## Installation

### Prerequisites

- Node.js >= 14.0.0
- For Rust build: Rust toolchain (optional, JS fallback available)

### Global Installation (Recommended)

```bash
npm install -g gemini-assist
```

### Building Rust Components

The package includes Rust bindings for better performance. To build them:

```bash
npm install -g @napi-rs/cli
npm run build
```

If Rust bindings aren't available, the CLI automatically falls back to a JavaScript implementation. See [README_RUST.md](README_RUST.md) for details.

### Local Installation

```bash
npm install gemini-assist
```

## Getting Started

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy your API key

### 2. Set Your API Key

**Option A: Environment Variable (Recommended)**

```bash
export GEMINI_API_KEY=your_api_key_here
```

**Option B: Command Line Flag**

```bash
gemini-assist --api-key your_api_key_here "Your question here"
```

**Option C: .env File (Recommended for Local Development)**

Create a `.env` file in your project directory:

```bash
# Copy the example file
cp .env.example .env

# Then edit .env and add your API key
# GEMINI_API_KEY=your_api_key_here
```

The `.env` file is automatically loaded by the CLI using the `dotenv` package.

## Usage

### Interactive Mode

Start an interactive chat session:

```bash
gemini-assist --interactive
```

Or simply:

```bash
gemini-assist
```

In interactive mode:
- Type your questions and press Enter
- Type `exit`, `quit`, `bye`, or `q` to end the session
- Type `clear` to clear the screen

### Single Query Mode

Ask a quick question:

```bash
gemini-assist "What is the capital of France?"
```

### Command Line Options

```bash
gemini-assist [options] [query]

Options:
  -V, --version          Show version number
  -k, --api-key <key>    Gemini API key (or set GEMINI_API_KEY env variable)
  -m, --model <model>    Gemini model to use (default: gemini-1.5-flash)
  -i, --interactive      Start interactive chat mode
  -t, --temperature <value>  Temperature for response 0-1 (default: 0.7)
  -h, --help             Display help for command
```

### Examples

```bash
# Interactive mode with custom model
gemini-assist --interactive --model gemini-1.5-pro

# Single query with custom temperature
gemini-assist -t 0.9 "Write a creative story"

# Using alias
gassist "Explain quantum computing"
```

## Programmatic Usage

You can also use Gemini Assist as a Node.js module:

```javascript
const { GeminiClient } = require('gemini-assist');

const client = new GeminiClient('your-api-key', {
  model: 'gemini-1.5-flash',
  temperature: 0.7
});

async function chat() {
  const response = await client.chat('Hello, how are you?');
  console.log(response);
}

chat();
```

## Available Models

- `gemini-2.5-flash` (default) - Latest fast and efficient model
- `gemini-1.5-flash` - Fast and efficient, previous version
- `gemini-1.5-pro` - More capable model for complex tasks
- `gemini-pro` - Legacy model (may be deprecated)

**Note:** Model availability depends on your API key's access level. If a model doesn't work, try another one.

## Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Gemini API key (required)
- `DEBUG` - Set to `true` for detailed error messages

## Troubleshooting

### API Key Issues

If you get an "Invalid API key" error:
1. Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure there are no extra spaces when copying the key
3. Check that the `GEMINI_API_KEY` environment variable is set correctly

### Rate Limits

If you encounter rate limit errors:
- Wait a few moments before trying again
- Check your API quota at Google AI Studio
- Consider upgrading your API plan if needed

### Safety Filters

If content is blocked by safety filters:
- Rephrase your query
- Avoid potentially harmful or inappropriate content
- Check Google's content policy

## Requirements

- Node.js >= 14.0.0
- npm or yarn
- Valid Gemini API key

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on the project repository.

---

**Version:** 1.1.1-Beta  
**Powered by:** Google Gemini API
