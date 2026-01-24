# Release Notes - Gemini Assist v1.1.2

## 🎉 Gemini Assist v1.1.2

**Release Date:** January 2025  
**Version:** 1.1.2  
**Status:** Stable Release

---

## Overview

Gemini Assist v1.1.2 introduces powerful new features that enhance usability, scripting capabilities, and developer experience. This release focuses on improving workflow integration and providing better insights into the tool's operation.

## ✨ New Features

### 🚀 Stdin Support (Piping)
- **Read prompts from stdin** - Perfect for scripting and automation
- Pipe text directly to Gemini Assist for processing
- Example: `echo "Summarize this" | gemini-assist`

### 📊 Enhanced Version Information
- **Detailed version command** - `--version-info` flag shows comprehensive system information
- Displays package details, Node.js version, platform, and Rust binding status
- Helpful for debugging and support requests

### 📝 Conversation History Command
- **History tracking in interactive mode** - Type `history` or `hist` to see conversation message count
- Better awareness of conversation context
- Useful for understanding conversation length

### 🎯 Improved CLI Experience
- Better help messages with new command examples
- Enhanced error messages for stdin usage
- More intuitive command flow

## 🔧 Technical Improvements

### Code Quality
- Improved error handling for stdin operations
- Better async/await patterns
- Enhanced code documentation

### Developer Experience
- More flexible input methods (args, stdin, interactive)
- Better separation of concerns
- Improved code maintainability

## 📋 Usage Examples

### Stdin Support (New!)
```bash
# Pipe text directly
echo "What is AI?" | gemini-assist

# Process file content
cat document.txt | gemini-assist "Summarize this"

# Chain commands
curl -s https://api.example.com/data | gemini-assist "Analyze this JSON"
```

### Enhanced Version Info (New!)
```bash
# Show detailed version information
gemini-assist --version-info
```

### History Command (New!)
```bash
# In interactive mode
gemini-assist --interactive
You> history
📊 Conversation history: 5 messages
```

## 🐛 Bug Fixes

- Fixed stdin detection for better pipe support
- Improved error messages when no input is provided
- Better handling of edge cases in interactive mode

## 📝 Migration from v1.1.1-Beta

No breaking changes! This is a drop-in replacement. Simply update:

```bash
npm install -g @zemerik/gemini-assist@latest
```

All existing functionality remains the same, with new features added.

## 🔮 Upcoming Features (Planned)

- Chat history persistence
- Multi-modal support (images, files)
- Streaming responses for real-time output
- Custom prompt templates
- Conversation export/import
- Plugin system for extensibility

## 📝 Installation

```bash
npm install -g @zemerik/gemini-assist
```

## 🔑 Getting Started

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set environment variable: `export GEMINI_API_KEY=your_key`
3. Or create a `.env` file: `GEMINI_API_KEY=your_key`
4. Run: `gemini-assist --interactive`

## 🙏 Acknowledgments

- Google Gemini API team for the powerful AI capabilities
- Open source community for the excellent npm packages used
- All contributors and users who provided feedback

## 📄 License

MIT License - See LICENSE file for details

---

**Download:** `npm install -g @zemerik/gemini-assist`  
**Documentation:** See README.md  
**Issues:** Please report via GitHub Issues
