#!/usr/bin/env node

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro',
  'gemini-1.5-pro-001',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-001',
  'models/gemini-pro',
  'models/gemini-1.5-flash'
];

async function testModel(modelName, apiKey) {
  try {
    console.log(`\n🧪 Testing model: ${modelName}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Say "Hello" in one word.');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ ${modelName} WORKS! Response: "${text.trim()}"`);
    return { model: modelName, status: 'success', response: text.trim() };
  } catch (error) {
    const errorMsg = error.message.split('\n')[0];
    // Check for different error types
    if (errorMsg.includes('API key not valid') || errorMsg.includes('API_KEY_INVALID')) {
      console.log(`❌ ${modelName} FAILED: Invalid API key`);
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      console.log(`❌ ${modelName} FAILED: Model not found (404)`);
    } else {
      // Show first 120 chars of error
      console.log(`❌ ${modelName} FAILED: ${errorMsg.substring(0, 120)}`);
    }
    return { model: modelName, status: 'failed', error: error.message };
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Check if API key is set and not a placeholder
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '' || apiKey.length < 20) {
    console.error('❌ GEMINI_API_KEY not set or is a placeholder!');
    console.log('\n📝 Instructions:');
    console.log('1. Get your API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Edit your .env file and replace "your_api_key_here" with your actual key');
    console.log('3. The .env file should look like:');
    console.log('   GEMINI_API_KEY=AIza...your_actual_key_here');
    console.log('\nCurrent status:');
    if (!apiKey) {
      console.log('  ✗ No API key found in environment');
    } else if (apiKey === 'your_api_key_here') {
      console.log('  ✗ Placeholder value detected (needs to be replaced)');
    } else if (apiKey.length < 20) {
      console.log(`  ✗ API key too short (${apiKey.length} chars, should be ~40+ chars)`);
    }
    process.exit(1);
  }
  
  console.log('🚀 Testing Gemini Models\n');
  console.log(`🔑 API Key loaded: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const modelName of modelsToTest) {
    const result = await testModel(modelName, apiKey);
    results.push(result);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  
  const workingModels = results.filter(r => r.status === 'success');
  const failedModels = results.filter(r => r.status === 'failed');
  
  if (workingModels.length > 0) {
    console.log('✅ Working Models:');
    workingModels.forEach(r => {
      console.log(`   ✓ ${r.model}`);
    });
    console.log(`\n💡 Recommended default: ${workingModels[0].model}`);
  } else {
    console.log('❌ No models worked.');
  }
  
  if (failedModels.length > 0) {
    console.log('\n❌ Failed Models:');
    const modelNotFound = failedModels.filter(r => r.error.includes('404') || r.error.includes('not found'));
    const invalidKey = failedModels.filter(r => r.error.includes('API key not valid') || r.error.includes('API_KEY_INVALID'));
    
    if (modelNotFound.length > 0) {
      console.log('   Models not found (404):');
      modelNotFound.forEach(r => console.log(`     - ${r.model}`));
    }
    if (invalidKey.length > 0) {
      console.log('   Invalid API key errors:');
      invalidKey.forEach(r => console.log(`     - ${r.model}`));
    }
  }
  
  if (workingModels.length === 0) {
    console.log('\n💡 Tips:');
    console.log('   - Make sure your API key is valid and active');
    console.log('   - Check that your API key has access to Gemini models');
    console.log('   - Try getting a new API key from: https://makersuite.google.com/app/apikey');
  }
}

main().catch(console.error);
