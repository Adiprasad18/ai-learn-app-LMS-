import { jest } from "@jest/globals";
import { sql } from "drizzle-orm";

jest.unstable_mockModule("../configs/db.js", () => {
  const execute = jest.fn();
  return {
    db: {
      execute,
    },
    __mockExecute: execute,
  };
});

const { db, __mockExecute } = await import("../configs/db.js");
const {
  areFinalAssessmentTablesAvailable,
  clearFinalAssessmentTablesCache,
} = await import("./final-assessment-utils.js");

describe("areFinalAssessmentTablesAvailable", () => {
  beforeEach(() => {
    clearFinalAssessmentTablesCache();
    __mockExecute.mockReset();
  });

  it("returns true when all tables exist", async () => {
    __mockExecute.mockResolvedValue({
      rows: [
        {
          final_tests: true,
          final_test_questions: true,
          final_test_attempts: true,
        },
      ],
    });

    const result = await areFinalAssessmentTablesAvailable();

    expect(result).toBe(true);
    expect(__mockExecute).toHaveBeenCalledTimes(1);
    expect(__mockExecute.mock.calls[0][0]).toEqual(expect.any(sql.Sql));
  });

  it("returns false when any table is missing", async () => {
    __mockExecute.mockResolvedValue({
      rows: [
        {
          final_tests: true,
          final_test_questions: false,
          final_test_attempts: true,
        },
      ],
    });

    const result = await areFinalAssessmentTablesAvailable();

    expect(result).toBe(false);
  });

  it("returns false when query fails", async () => {
    __mockExecute.mockRejectedValue(new Error("connection error"));

    const result = await areFinalAssessmentTablesAvailable();

    expect(result).toBe(false);
  });

  it("caches the result for subsequent calls", async () => {
    __mockExecute.mockResolvedValue({
      rows: [
        {
          final_tests: true,
          final_test_questions: true,
          final_test_attempts: true,
        },
      ],
    });

    const first = await areFinalAssessmentTablesAvailable();
    const second = await areFinalAssessmentTablesAvailable();

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(__mockExecute).toHaveBeenCalledTimes(1);
  });
});