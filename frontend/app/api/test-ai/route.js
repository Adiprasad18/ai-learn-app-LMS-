// Ensure this API route only runs in Node.js environment
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[test-ai] Testing AI service configuration...");

    // Check environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[test-ai] API Key exists:", !!apiKey);
    console.log(
      "[test-ai] API Key preview:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING"
    );

    // Try to import the content generator
    let contentGenerator;
    try {
      const contentGeneratorModule = await import("@/backend/ai/content-generator");
      contentGenerator = contentGeneratorModule.default;
      console.log("[test-ai] Content generator imported successfully");
    } catch (importError) {
      console.error("[test-ai] Failed to import content generator:", importError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import content generator",
          details: importError.message,
          stack: importError.stack,
        },
        { status: 500 }
      );
    }

    // Try to import streaming service
    try {
      await import("@/backend/ai/streaming-service");
      console.log("[test-ai] Streaming service imported successfully");
    } catch (importError) {
      console.error("[test-ai] Failed to import streaming service:", importError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import streaming service",
          details: importError.message,
          stack: importError.stack,
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: "AI service configuration is valid",
      checks: {
        apiKeyExists: !!apiKey,
        apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
        contentGeneratorImported: !!contentGenerator,
        streamingServiceImported: true,
      },
    });
  } catch (error) {
    console.error("[test-ai] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
};
