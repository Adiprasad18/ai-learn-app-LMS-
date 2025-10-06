import { jest } from "@jest/globals";

const insertSpy = jest.fn();
const selectSpy = jest.fn();

jest.unstable_mockModule("../configs/db.js", () => ({
  db: {
    insert: () => ({ values: () => ({ onConflictDoUpdate: insertSpy }) }),
    select: selectSpy,
  },
}));

jest.unstable_mockModule("./final-assessment-utils.js", () => ({
  areFinalAssessmentTablesAvailable: jest.fn(),
}));

const { areFinalAssessmentTablesAvailable } = await import("./final-assessment-utils.js");
const { getCourseDetail } = await import("./course-service.js");

const COURSE_ID = "course-id";
const courseRecord = {
  id: COURSE_ID,
  userId: "user-1",
  title: "Course",
  chapters: [],
};

const mockQuery = jest.fn();

selectSpy.mockReturnValue({
  from: () => ({
    where: () => ({ limit: () => [courseRecord] }),
  }),
});

describe("getCourseDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectSpy.mockClear();
  });

  it("returns course without final test when tables absent", async () => {
    areFinalAssessmentTablesAvailable.mockResolvedValue(false);

    const result = await getCourseDetail(COURSE_ID);

    expect(result.finalTest).toBeNull();
  });
});