/**
 * JSON parsing utilities for AI responses
 */

/**
 * Normalizes JSON string literals by properly escaping embedded newlines, tabs, and other control characters
 * @param {string} jsonString - The raw JSON string
 * @returns {string} - Normalized JSON string with properly escaped string literals
 */
function normalizeJsonStringLiterals(jsonString) {
  // Handle embedded newlines and tabs in string literals
  // This regex matches string literals and escapes internal newlines, tabs, etc.
  return jsonString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
    // Remove the quotes, process the content, then add quotes back
    const content = match.slice(1, -1);
    const escaped = content
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
    return '"' + escaped + '"';
  });
}

/**
 * Attempts to extract JSON from various formats the AI might return
 * @param {string} rawResponse - Raw AI response
 * @returns {string} - Extracted JSON string
 */
function extractJsonFromResponse(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return rawResponse;
  }

  // Strategy 1: Extract from markdown code blocks
  const codeBlockMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Strategy 2: Look for JSON-like content starting with { or [
  const jsonStartMatch = rawResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonStartMatch) {
    return jsonStartMatch[1].trim();
  }

  // Strategy 3: Return as-is if it looks like JSON already
  const trimmed = rawResponse.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  return rawResponse;
}

/**
 * Parses structured JSON with multiple fallback strategies
 * @param {string} rawResponse - Raw AI response
 * @returns {object} - Parsed JSON object
 */
function parseStructuredJson(rawResponse) {
  console.log('[json-utils] parseStructuredJson called with response length:', rawResponse?.length);

  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Invalid response: not a string');
  }

  let extractedJson = extractJsonFromResponse(rawResponse);

  // Try parsing directly first
  try {
    return JSON.parse(extractedJson);
  } catch (error) {
    console.log('[json-utils] Direct parse failed, trying normalization');
  }

  // Try with normalization
  try {
    const normalized = normalizeJsonStringLiterals(extractedJson);
    return JSON.parse(normalized);
  } catch (error) {
    console.log('[json-utils] Normalized parse failed, trying cleanup');
  }

  // Try cleaning up common issues
  try {
    // Remove any trailing commas before closing braces/brackets
    let cleaned = extractedJson
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove BOM if present
      .replace(/^\uFEFF/, '')
      // Trim whitespace
      .trim();

    // Try parsing again
    return JSON.parse(cleaned);
  } catch (error) {
    console.log('[json-utils] Cleanup parse failed');
  }

  // Try to extract partial JSON if possible
  try {
    const partial = parsePartialJson(extractedJson);
    if (partial) {
      console.log('[json-utils] Successfully parsed partial JSON');
      return partial;
    }
  } catch (error) {
    console.log('[json-utils] Partial parse also failed');
  }

  // If all else fails, throw with preview
  const preview = extractedJson.slice(0, 200).replace(/\s+/g, ' ');
  const parseError = new Error(
    `Failed to parse AI JSON response after all strategies. Received preview: "${preview}"...`
  );
  parseError.name = 'AiResponseParseError';
  parseError.rawResponse = rawResponse;
  parseError.extractedJson = extractedJson;
  parseError.preview = preview;
  throw parseError;
}

/**
 * Attempts to parse partial/incomplete JSON
 * @param {string} jsonString - Potentially incomplete JSON string
 * @returns {object|null} - Parsed object if successful, null otherwise
 */
function parsePartialJson(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return null;
  }

  const trimmed = jsonString.trim();

  // If it starts with { or [, try to parse as complete JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      // Continue to partial parsing
    }
  }

  // For partial parsing, we can try to fix common issues
  // This is a basic implementation - could be enhanced

  // Remove incomplete parts at the end
  let cleaned = trimmed;

  // Remove trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // If it ends with incomplete object/array, try to close it
  if (cleaned.startsWith('{') && !cleaned.endsWith('}')) {
    cleaned += '}';
  } else if (cleaned.startsWith('[') && !cleaned.endsWith(']')) {
    cleaned += ']';
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

export { parseStructuredJson, parsePartialJson, normalizeJsonStringLiterals };