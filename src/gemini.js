// Hybrid JS/Rust Implementation (50% JS, 50% Rust)
// Core Gemini API logic is handled by Rust (src/gemini_client.rs)
// This JS wrapper provides Node.js compatibility and fallback

let RustGeminiClient;

// Try to load Rust native bindings, fallback to JS implementation if not available
try {
  const native = require('../index.node');
  RustGeminiClient = native.RustGeminiClient;
} catch (error) {
  // Fallback to JS implementation if Rust bindings not available
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  // Only show fallback message once, not on every require
  if (!global.__gemini_fallback_shown) {
    console.log('⚠ Rust bindings not available, using JavaScript fallback');
    global.__gemini_fallback_shown = true;
  }
  
  class JSGeminiClient {
    constructor(apiKey, options = {}) {
      this.apiKey = apiKey;
      // Default to undefined to let SDK use its default, or use provided model
      this.modelName = options.model;
      this.temperature = options.temperature || 0.7;
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Build model config - SDK requires a model name
      // Default to gemini-2.5-flash
      let modelToUse = this.modelName || 'gemini-2.5-flash';
      
      const modelConfig = {
        model: modelToUse,
        generationConfig: {
          temperature: this.temperature,
        },
      };
      
      this.model = this.genAI.getGenerativeModel(modelConfig);
      
      // Store actual model name being used
      this.modelName = modelToUse;
      
      this.chatHistory = [];
    }

    async chat(prompt) {
      try {
        this.chatHistory.push({
          role: 'user',
          parts: [{ text: prompt }]
        });

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        this.chatHistory.push({
          role: 'model',
          parts: [{ text: text }]
        });

        return text;
      } catch (error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('Invalid API key. Please check your GEMINI_API_KEY.');
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new Error('API quota exceeded or rate limit reached. Please try again later.');
        } else if (error.message.includes('safety')) {
          throw new Error('Content was blocked by safety filters.');
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          // Provide helpful suggestions for model issues
          let suggestions = [
            'Try: --model gemini-1.5-flash (without version suffix)',
            'Try: --model gemini-1.5-pro',
            'Try: --model gemini-pro (legacy)',
            'Check your API key has access to this model',
            'View available models: https://ai.google.dev/models/gemini'
          ].join('\n  ');
          throw new Error(`Model "${this.modelName}" not found or not available.\n\nSuggestions:\n  ${suggestions}\n\nFull error: ${error.message}`);
        } else {
          throw new Error(`Gemini API error: ${error.message}`);
        }
      }
    }

    clearHistory() {
      this.chatHistory = [];
    }

    async getHistoryCount() {
      return this.chatHistory.length;
    }
  }

  RustGeminiClient = JSGeminiClient;
}

// Wrapper class that uses Rust implementation
class GeminiClient {
  constructor(apiKey, options = {}) {
    // Default to gemini-2.5-flash
    this.modelName = options.model || 'gemini-2.5-flash';
    this.temperature = options.temperature || 0.7;
    
    // Use Rust client (or JS fallback)
    this.client = new RustGeminiClient(
      apiKey,
      this.modelName,
      this.temperature
    );
  }

  async chat(prompt) {
    return await this.client.chat(prompt);
  }

  async clearHistory() {
    return await this.client.clearHistory();
  }

  async getHistoryCount() {
    return await this.client.getHistoryCount();
  }
}

module.exports = { GeminiClient };
