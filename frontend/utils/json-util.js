// utils/json-utils.js
export function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error("[JSON Utils] Failed to parse:", str, err);
    return null;
  }
}

export function parseStructuredJson(data) {
  if (!data) return null;

  if (typeof data === "object") {
    return data;
  }

  if (typeof data === "string") {
    return safeJsonParse(data);
  }

  console.error("[JSON Utils] Unsupported data type:", typeof data);
  return null;
}
