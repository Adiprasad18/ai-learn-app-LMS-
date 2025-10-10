import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

async function testGeminiAPI() {
  console.log("Testing Gemini API...");
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in environment variables");
    process.exit(1);
  }
  
  console.log("✅ API Key found:", apiKey.substring(0, 10) + "...");
  
  try {
    // Initialize the client correctly (API key as string, not object)
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ GoogleGenerativeAI client initialized");
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("✅ Model retrieved: gemini-2.5-flash");
    
    // Test a simple generation (with responseMimeType for gemini-2.5-flash)
    console.log("\n🔄 Testing content generation...");
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: "Say 'Hello, AI is working!' and respond in JSON format with a 'message' field." }] 
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        responseMimeType: "application/json",
      },
    });
    
    const response = result.response;
    const text = response.text();
    
    console.log("✅ API Response received:");
    console.log(text);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      console.log("✅ JSON parsed successfully:", parsed);
    } catch (parseError) {
      console.log("⚠️  Response is not valid JSON, but API call succeeded");
    }
    
    console.log("\n✅ Gemini API is working correctly!");
    
  } catch (error) {
    console.error("❌ Error testing Gemini API:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Error response:", error.response);
    }
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

testGeminiAPI();