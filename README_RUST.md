# Rust Integration Guide

This project is a **50% JavaScript, 50% Rust** hybrid implementation.

**Current Version:** v1.1.2

## Architecture

- **Rust (50%)**: Core Gemini API client logic, HTTP requests, and performance-critical operations
- **JavaScript (50%)**: CLI interface, user interaction, command parsing, and UI/UX

## Building the Rust Component

### Prerequisites

1. Install Rust: https://rustup.rs/
2. Install Node.js (v14+)
3. Install napi-rs CLI:
   ```bash
   npm install -g @napi-rs/cli
   ```

### Build Commands

```bash
# Build Rust bindings for all platforms (release mode)
npm run build

# Build for development (debug mode)
npm run build:debug

# Build for current platform only
cargo build --release
```

### Project Structure

```
Gemini Assist/
├── Cargo.toml              # Rust package configuration
├── build.rs                # NAPI build script
├── src/
│   ├── lib.rs              # NAPI bindings entry point
│   └── gemini_client.rs    # Rust Gemini API client
├── bin/
│   └── gemini-assist.js    # JavaScript CLI entry point
└── src/
    ├── gemini.js           # JS wrapper (uses Rust when available)
    └── utils.js            # JS utilities
```

## How It Works

1. **Rust Client** (`src/gemini_client.rs`):
   - Handles all HTTP communication with Gemini API
   - Manages chat history in memory
   - Processes API responses and error handling
   - Uses `reqwest` for async HTTP requests

2. **NAPI Bindings** (`src/lib.rs`):
   - Exposes Rust functions to Node.js
   - Handles async operations with Tokio
   - Provides type-safe JavaScript interop

3. **JavaScript Wrapper** (`src/gemini.js`):
   - Attempts to load Rust native bindings
   - Falls back to JavaScript implementation if Rust not available
   - Provides seamless API compatibility

## Development

### Testing Rust Code

```bash
# Run Rust tests
cargo test

# Check Rust code
cargo clippy

# Format Rust code
cargo fmt
```

### Development Workflow

1. Make changes to Rust code in `src/gemini_client.rs` or `src/lib.rs`
2. Rebuild: `npm run build:debug`
3. Test: `npm start --interactive`

### Fallback Behavior

If Rust bindings aren't available:
- The CLI automatically falls back to the JavaScript implementation
- Uses `@google/generative-ai` SDK instead
- All functionality remains available

## Performance Benefits

The Rust implementation provides:
- **Faster HTTP requests** (Rust's async runtime)
- **Lower memory usage** (no V8 overhead for API calls)
- **Better error handling** (Rust's type system)
- **Thread safety** (Tokio async runtime)

## Troubleshooting

### Rust Not Building

```bash
# Ensure Rust is installed
rustc --version

# Update Rust toolchain
rustup update

# Clean and rebuild
cargo clean
npm run build
```

### Module Not Found

If you see "Cannot find module '../index.node'":
- Run `npm run build` to compile Rust bindings
- Ensure you're on a supported platform
- Check `package.json` napi configuration

### Platform Support

Rust bindings are built for:
- macOS (x86_64, ARM64)
- Linux (x86_64, ARM64, musl)
- Windows (x86_64, ARM64)

For other platforms, JavaScript fallback will be used.
