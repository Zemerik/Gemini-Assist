#!/usr/bin/env node

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testDefaultModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ Please set GEMINI_API_KEY in .env file');
    process.exit(1);
  }

  try {
    console.log('🧪 Testing SDK default model (no model name specified)...\n');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try without specifying model - let SDK use its default
    const model = genAI.getGenerativeModel({
      generationConfig: {
        temperature: 0.7,
      },
    });
    
    console.log('✅ SDK accepted config without model name');
    console.log('📞 Making API call...\n');
    
    const result = await model.generateContent('Say "Hello" in one word.');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ SUCCESS! Response: "${text.trim()}"`);
    console.log(`\n💡 The SDK default model works!`);
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    
    // Try to list models
    console.log('\n🔍 Attempting to list available models...\n');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // The SDK might have a listModels method or we can check the error for hints
      console.log('Note: Direct model listing may not be available in this SDK version');
    } catch (e) {
      console.error('Could not list models:', e.message);
    }
  }
}

testDefaultModel();
