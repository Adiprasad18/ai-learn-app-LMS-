import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables");
      process.exit(1);
    }
    
    console.log("Listing available Gemini models...\n");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List models using the REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("Available models:");
    console.log("=================\n");
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        console.log(`Model: ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Description: ${model.description}`);
        console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(", ") || "N/A"}`);
        console.log("");
      });
    } else {
      console.log("No models found");
    }
    
  } catch (error) {
    console.error("❌ Error listing models:");
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

listModels();