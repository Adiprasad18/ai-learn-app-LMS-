/**
 * Streaming AI Service for Real-time Content Generation
 * Provides streaming capabilities for long-running AI operations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import telemetryService from "../services/telemetry-service.js";
import { parseStructuredJson, parsePartialJson } from "../utils/json-utils.js";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

class StreamingAiService {
  constructor() {
    this.client = null;
    this.model = null;
    this._initialized = false;
  }

  initializeClient() {
    if (this._initialized) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    this.client = new GoogleGenerativeAI(apiKey);
    try {
      this.model = this.client.getGenerativeModel({
        model: MODEL_NAME,
      });
    } catch (modelError) {
      console.error(`Failed to initialize Gemini model "${MODEL_NAME}":`, modelError);
      throw modelError;
    }

    this._initialized = true;
  }

  ensureInitialized() {
    if (!this._initialized) {
      this.initializeClient();
    }
  }

  /**
   * Generate plain content (non-streaming)
   */
  async generateContent(prompt, options = {}) {
    this.ensureInitialized();

    const {
      operation = "content_generation",
      maxRetries = 2,
      backoffMs = 500,
    } = options;

    const generationTimer = telemetryService.startTimer("generation", { operation });
    let attempt = 0;
    let lastError;

    while (attempt <= maxRetries) {
      try {
        const result = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        });

        const response = result.response;
        const text = response.text();

        const duration = generationTimer.end({ success: true, attempts: attempt + 1 });
        telemetryService.recordEvent("generation_success", {
          operation,
          attempts: attempt + 1,
          duration,
          responseLength: text.length,
        });

        return {
          success: true,
          content: text,
          attempts: attempt + 1,
        };
      } catch (error) {
        lastError = error;
        const isLastAttempt = attempt === maxRetries;

        telemetryService.recordEvent("generation_error", {
          operation,
          attempt: attempt + 1,
          error: error.message,
        });

        if (isLastAttempt) {
          const duration = generationTimer.end({ success: false, attempts: attempt + 1 });
          throw new Error(`Generation failed after ${maxRetries + 1} attempts: ${error.message}`);
        }

        const delay = Math.ceil(backoffMs * Math.pow(2, attempt));
        await new Promise((r) => setTimeout(r, delay));
      }

      attempt++;
    }

    throw lastError || new Error(`Generation failed after ${maxRetries + 1} attempts`);
  }

  /**
   * Generate plain content stream (text only)
   */
  async *generateContentStream(prompt, options = {}) {
    this.ensureInitialized();

    const {
      operation = "content_generation",
      chunkSize = 1024,
      maxRetries = 2,
      backoffMs = 500,
    } = options;

    const generationTimer = telemetryService.startTimer("streaming_generation", { operation });
    let attempt = 0;
    let lastError;

    while (attempt <= maxRetries) {
      try {
        const result = await this.model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        });

        let accumulatedContent = "";
        let chunkCount = 0;

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          accumulatedContent += chunkText;
          chunkCount++;

          telemetryService.recordMetric("streaming_chunk_length", chunkText.length, {
            operation,
            attempt: attempt + 1,
          });

          if (accumulatedContent.length >= chunkSize) {
            yield {
              type: "chunk",
              content: accumulatedContent,
              chunkIndex: chunkCount,
              isComplete: false,
              metadata: { operation, attempt: attempt + 1 },
            };
            accumulatedContent = "";
          }
        }

        if (accumulatedContent.length > 0) {
          yield {
            type: "chunk",
            content: accumulatedContent,
            chunkIndex: chunkCount,
            isComplete: false,
            metadata: { operation, attempt: attempt + 1 },
          };
        }

        const duration = generationTimer.end({ success: true, attempts: attempt + 1 });
        telemetryService.recordEvent("streaming_generation_success", {
          operation,
          totalChunks: chunkCount,
          attempts: attempt + 1,
          duration,
        });

        yield {
          type: "complete",
          content: "",
          chunkIndex: chunkCount,
          isComplete: true,
          metadata: {
            operation,
            attempt: attempt + 1,
            totalChunks: chunkCount,
            duration,
          },
        };
        return;
      } catch (error) {
        lastError = error;
        const isLastAttempt = attempt === maxRetries;

        telemetryService.recordEvent("streaming_generation_error", {
          operation,
          attempt: attempt + 1,
          error: error.message,
          isLastAttempt,
        });

        if (isLastAttempt) {
          const duration = generationTimer.end({
            success: false,
            error: error.message,
            attempts: attempt + 1,
          });

          yield {
            type: "error",
            content: "",
            error: error.message,
            isComplete: true,
            metadata: { operation, attempt: attempt + 1, duration },
          };

          return; // ✅ stop cleanly, don’t throw again
        }

        const delay = Math.ceil(backoffMs * Math.pow(2, attempt));
        await new Promise((r) => setTimeout(r, delay));
      }

      attempt++;
    }

    throw lastError || new Error(`Streaming generation failed after ${maxRetries + 1} attempts`);
  }

  /**
   * Generate structured JSON content with streaming
   */
  async *generateStructuredContentStream(prompt, schema, options = {}) {
    const enhancedPrompt = `You are a JSON API. You must respond ONLY with valid JSON.

${prompt}

REQUIRED: Respond with valid JSON that exactly matches this schema:
${JSON.stringify(schema, null, 2)}

IMPORTANT:
- Output ONLY the JSON object, no markdown, no explanations
- Do not wrap in code blocks
- Ensure all strings are properly escaped
- Use double quotes for all strings
- Do not include trailing commas`;

    let accumulatedJson = "";
    let lastSuccessfulContent = "";

    for await (const chunk of this.generateContentStream(enhancedPrompt, options)) {
      if (chunk.type === "chunk") {
        accumulatedJson += chunk.content;

        try {
          const parsed = parsePartialJson(accumulatedJson);
          if (parsed) {
            lastSuccessfulContent = accumulatedJson;
            yield {
              ...chunk,
              parsedContent: parsed,
              isValidJson: true,
              rawContent: accumulatedJson,
            };
          } else {
            yield {
              ...chunk,
              parsedContent: null,
              isValidJson: false,
              rawContent: accumulatedJson,
            };
          }
        } catch (err) {
          yield {
            ...chunk,
            parsedContent: null,
            isValidJson: false,
            parseError: err.message,
            rawContent: accumulatedJson,
          };
        }
      } else if (chunk.type === "complete") {
        try {
          const finalParsed = parseStructuredJson(accumulatedJson);
          yield {
            ...chunk,
            parsedContent: finalParsed,
            isValidJson: true,
            rawContent: accumulatedJson,
          };
        } catch (err) {
          yield {
            ...chunk,
            parsedContent: null,
            isValidJson: false,
            parseError: err.message,
            rawContent: lastSuccessfulContent || accumulatedJson,
          };
        }
      } else {
        yield {
          ...chunk,
          rawContent: lastSuccessfulContent,
        };
      }
    }
  }
}

// Singleton export
const streamingAiService = new StreamingAiService();
export default streamingAiService;
