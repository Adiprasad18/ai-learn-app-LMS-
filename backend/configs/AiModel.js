import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseStructuredJson } from "../utils/json-utils.js";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const aiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  return new GoogleGenerativeAI(apiKey);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractTextFromResponse = (result) => {
  const parts = result?.response?.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (typeof part?.text === "string") {
      return part.text;
    }

    if (typeof part?.data === "string") {
      return part.data;
    }
  }

  return "";
};

export const generateCourseOutline = async (prompt, options = {}) => {
  if (!prompt) {
    throw new Error("Prompt is required to generate course outline");
  }

  const { maxRetries = 2, backoffMs = 750 } = options;
  const client = aiClient();

  let model;
  try {
    model = client.getGenerativeModel({ model: MODEL_NAME });
  } catch (modelError) {
    console.error(`Failed to initialize Gemini model \"${MODEL_NAME}\":`, modelError);
    throw modelError;
  }

  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      });

      const rawResponse = extractTextFromResponse(result);

      if (!rawResponse?.trim()) {
        throw new Error("Empty response received from the AI model");
      }

      return parseStructuredJson(rawResponse);
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;

      console.warn(
        `Attempt ${attempt + 1} to generate AI content failed${isLastAttempt ? "" : ", retrying..."}`,
        error
      );

      if (isLastAttempt) {
        break;
      }

      const delay = Math.ceil(backoffMs * Math.pow(2, attempt));
      await sleep(delay);
    }

    attempt += 1;
  }

  console.error("Gemini model failed after retries:", lastError);
  throw new Error(lastError?.message || "Failed to generate course outline");
};