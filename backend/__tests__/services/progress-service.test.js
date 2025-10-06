import { jest } from "@jest/globals";

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockSql = jest.fn(() => ({
  as: jest.fn(() => Symbol("alias")),
}));
mockSql.raw = jest.fn((value) => value);

jest.unstable_mockModule("../../configs/db.js", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

jest.unstable_mockModule("../../configs/schema.js", () => ({
  courses: {
    id: "courses.id",
    title: "courses.title",
    topic: "courses.topic",
    status: "courses.status",
    studyType: "courses.studyType",
    difficultyLevel: "courses.difficultyLevel",
    createdAt: "courses.createdAt",
    userId: "courses.userId",
  },
  chapters: {
    id: "chapters.id",
    courseId: "chapters.courseId",
  },
  userProgress: {
    chapterId: "userProgress.chapterId",
    userId: "userProgress.userId",
    completed: "userProgress.completed",
    updatedAt: "userProgress.updatedAt",
  },
}));

jest.unstable_mockModule("drizzle-orm", () => ({
  eq: jest.fn(() => "eq"),
  and: jest.fn(() => "and"),
  sql: mockSql,
}));

const createSelectChain = (rows) => {
  return {
    rows,
    from: jest.fn(function () { return this; }),
    leftJoin: jest.fn(function () { return this; }),
    innerJoin: jest.fn(function () { return this; }),
    where: jest.fn(function () { return this; }),
    groupBy: jest.fn(function () { return this; }),
    orderBy: jest.fn(function () { return this; }),
    execute: jest.fn(() => rows),
    filter: jest.fn((callback) => rows.filter(callback)),
  };
};

const statsChain = (rows) => createSelectChain(rows);

const { db } = await import("../../configs/db.js");
const { getCourseProgress, getAllCoursesProgress, getUserStats } = await import("../../server/progress-service.js");

describe("progress-service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when no course progress rows", async () => {
    mockSelect.mockReturnValue(createSelectChain([]));

    const result = await getCourseProgress("user-1", "course-1");
    expect(result).toBeNull();
  });

  it("returns first course progress row when present", async () => {
    const rows = [
      {
        courseId: "course-1",
        totalChapters: "3",
        completedChapters: "2",
        progressPercentage: "67",
      },
    ];
    mockSelect.mockReturnValue(createSelectChain(rows));

    const result = await getCourseProgress("user-1", "course-1");
    expect(result).toEqual(rows[0]);
  });

  it("returns all rows for getAllCoursesProgress", async () => {
    const rows = [
      { courseId: "course-1", totalChapters: "5" },
      { courseId: "course-2", totalChapters: "3" },
    ];
    mockSelect.mockReturnValue(createSelectChain(rows));

    const result = await getAllCoursesProgress("user-1");
    expect(result).toEqual(rows);
  });

  it("parses numbers and computes overall progress", async () => {
    const totalCoursesRows = [{ count: "4" }];
    const totalChaptersRows = [{ count: "10" }];
    const completedChaptersRows = [{ count: "7" }];
    const courseProgressRows = [
      {
        courseId: "course-1",
        totalChapters: "10",
        completedChapters: "7",
      },
      {
        courseId: "course-2",
        totalChapters: "4",
        completedChapters: "4",
      },
    ];

    mockSelect
      .mockReturnValueOnce(createSelectChain(totalCoursesRows))
      .mockReturnValueOnce(createSelectChain(totalChaptersRows))
      .mockReturnValueOnce(createSelectChain(completedChaptersRows))
      .mockReturnValueOnce(createSelectChain(courseProgressRows));

    const stats = await getUserStats("user-99");

    expect(stats).toEqual({
      totalCourses: 4,
      completedCourses: 1,
      totalChapters: 10,
      completedChapters: 7,
      overallProgress: 70,
    });
  });
});