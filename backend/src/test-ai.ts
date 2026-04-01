import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load from backend root if running from src
dotenv.config({ path: path.join(__dirname, '../.env') });

const key = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY present:", !!key);

const genAI = new GoogleGenerativeAI(key || '');

async function listModels() {
  console.log("\nListing available models...");
  try {
    // Note: listModels is not directly on genAI in the new SDK version
    // It's part of the generative language client if using the REST API or different SDK
    // But for this SDK, we might need a workaround or just try common ones.
    console.log("ListModels is not directly available in this SDK version. Trying common models...");
  } catch (error: any) {
    console.error("ListModels failed:", error.message);
  }
}

async function testModel(modelName: string) {
  console.log(`\nTesting model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`Success (${modelName}):`, result.response.text());
  } catch (error: any) {
    console.error(`Failed (${modelName}):`, error.message);
  }
}

async function runTests() {
  await listModels();
  await testModel("gemini-1.5-flash");
  await testModel("gemini-1.5-flash-8b");
  await testModel("gemini-1.0-pro");
}

runTests();
