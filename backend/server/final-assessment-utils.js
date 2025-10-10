import { sql } from "drizzle-orm";
import { db } from "../configs/db.js";

const CACHE_TTL_MS = 60_000;

let cache = {
  available: null,
  checkedAt: 0,
};

function extractRows(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.rows)) return result.rows;
  return [];
}

export async function areFinalAssessmentTablesAvailable() {
  const now = Date.now();

  if (cache.available !== null && now - cache.checkedAt < CACHE_TTL_MS) {
    return cache.available;
  }

  try {
    const result = await db.execute(sql`
      SELECT
        to_regclass('public.final_tests') IS NOT NULL AS final_tests,
        to_regclass('public.final_test_questions') IS NOT NULL AS final_test_questions,
        to_regclass('public.final_test_attempts') IS NOT NULL AS final_test_attempts
    `);

    const rows = extractRows(result);
    const status = rows[0] ?? {};

    const available = Boolean(status.final_tests) && Boolean(status.final_test_questions) && Boolean(status.final_test_attempts);

    cache = {
      available,
      checkedAt: now,
    };

    if (!available) {
      console.warn("Final assessment tables are not available. Skipping related queries.");
    }

    return available;
  } catch (error) {
    console.warn("Failed to verify final assessment tables. Assuming unavailable.", error);

    cache = {
      available: false,
      checkedAt: now,
    };

    return false;
  }
}

export function clearFinalAssessmentTablesCache() {
  cache = {
    available: null,
    checkedAt: 0,
  };
}