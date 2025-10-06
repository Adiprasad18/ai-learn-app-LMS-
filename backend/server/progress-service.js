/**
 * Progress Service
 * Handles course progress tracking and completion status
 */

import { db } from "../configs/db.js";
import {
  courses,
  chapters,
  userProgress,
} from "../configs/schema.js";
import { eq, and, sql } from "drizzle-orm";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Get course-specific progress
 */
export async function getCourseProgress(userId, courseId) {
  try {
    const result = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        totalChapters: sql`COUNT(DISTINCT ${chapters.id})`.as("totalChapters"),
        completedChapters: sql`COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${userProgress.chapterId} END)`.as(
          "completedChapters"
        ),
        progressPercentage: sql`
          CASE 
            WHEN COUNT(DISTINCT ${chapters.id}) = 0 THEN 0
            ELSE ROUND(
              (COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${userProgress.chapterId} END) * 100.0) / 
              COUNT(DISTINCT ${chapters.id})
            )
          END
        `.as("progressPercentage"),
        lastAccessedAt: sql`MAX(${userProgress.updatedAt})`.as("lastAccessedAt"),
      })
      .from(courses)
      .leftJoin(chapters, eq(chapters.courseId, courses.id))
      .leftJoin(
        userProgress,
        and(eq(userProgress.chapterId, chapters.id), eq(userProgress.userId, userId))
      )
      .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
      .groupBy(courses.id, courses.title)
      .execute();

    const raw = result[0];
    if (!raw) return null;

    return {
      ...raw,
      totalChapters: toNumber(raw.totalChapters),
      completedChapters: toNumber(raw.completedChapters),
      progressPercentage: toNumber(raw.progressPercentage),
      weightedProgress: toNumber(raw.progressPercentage),
    };
  } catch (error) {
    console.error("Error getting course progress:", error);
    throw error;
  }
}

/**
 * Get all course progress for a user
 */
export async function getAllCoursesProgress(userId) {
  try {
    const result = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        courseTopic: courses.topic,
        courseStatus: courses.status,
        studyType: courses.studyType,
        difficultyLevel: courses.difficultyLevel,
        createdAt: courses.createdAt,
        totalChapters: sql`COUNT(DISTINCT ${chapters.id})`.as("totalChapters"),
        completedChapters: sql`COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${userProgress.chapterId} END)`.as(
          "completedChapters"
        ),
        progressPercentage: sql`
          CASE 
            WHEN COUNT(DISTINCT ${chapters.id}) = 0 THEN 0
            ELSE ROUND(
              (COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${userProgress.chapterId} END) * 100.0) / 
              COUNT(DISTINCT ${chapters.id})
            )
          END
        `.as("progressPercentage"),
        lastAccessedAt: sql`MAX(${userProgress.updatedAt})`.as("lastAccessedAt"),
      })
      .from(courses)
      .leftJoin(chapters, eq(chapters.courseId, courses.id))
      .leftJoin(
        userProgress,
        and(eq(userProgress.chapterId, chapters.id), eq(userProgress.userId, userId))
      )
      .where(eq(courses.userId, userId))
      .groupBy(
        courses.id,
        courses.title,
        courses.topic,
        courses.status,
        courses.studyType,
        courses.difficultyLevel,
        courses.createdAt
      )
      .orderBy(sql`MAX(${userProgress.updatedAt}) DESC NULLS LAST, ${courses.createdAt} DESC`)
      .execute();

    return result.map((row) => ({
      ...row,
      totalChapters: toNumber(row.totalChapters),
      completedChapters: toNumber(row.completedChapters),
      progressPercentage: toNumber(row.progressPercentage),
      weightedProgress: toNumber(row.progressPercentage),
    }));
  } catch (error) {
    console.error("Error getting all courses progress:", error);
    throw error;
  }
}

/**
 * Mark a chapter as completed
 */
export async function markChapterCompleted(userId, chapterId) {
  try {
    const result = await db
      .insert(userProgress)
      .values({
        userId,
        chapterId,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: {
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error marking chapter completed:", error);
    throw error;
  }
}

/**
 * Mark a chapter as incomplete
 */
export async function markChapterIncomplete(userId, chapterId) {
  try {
    const result = await db
      .insert(userProgress)
      .values({
        userId,
        chapterId,
        completed: false,
        completedAt: null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: {
          completed: false,
          completedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error marking chapter incomplete:", error);
    throw error;
  }
}

/**
 * Update last access timestamp
 */
export async function updateChapterAccess(userId, chapterId) {
  try {
    const result = await db
      .insert(userProgress)
      .values({
        userId,
        chapterId,
        completed: false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: { updatedAt: new Date() },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error updating chapter access:", error);
    throw error;
  }
}

/**
 * Get chapter progress details
 */
export async function getChapterProgress(userId, chapterId) {
  try {
    const result = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.chapterId, chapterId)));

    return result[0] || null;
  } catch (error) {
    console.error("Error getting chapter progress:", error);
    throw error;
  }
}

/**
 * Get overall user statistics
 */
export async function getUserStats(userId) {
  try {
    const coursesResult = await db
      .select({ count: sql`COUNT(*)`.as("count") })
      .from(courses)
      .where(eq(courses.userId, userId))
      .execute();

    const totalCourses = toNumber(coursesResult[0]?.count);

    const chaptersResult = await db
      .select({ count: sql`COUNT(*)`.as("count") })
      .from(chapters)
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(courses.userId, userId))
      .execute();

    const totalChapters = toNumber(chaptersResult[0]?.count);

    const completedResult = await db
      .select({
        count: sql`COUNT(DISTINCT ${userProgress.chapterId})`.as("count"),
      })
      .from(userProgress)
      .innerJoin(chapters, eq(userProgress.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.completed, true),
          eq(courses.userId, userId)
        )
      )
      .execute();

    const completedChapters = toNumber(completedResult[0]?.count);

    const courseProgressResult = await db
      .select({
        courseId: courses.id,
        totalChapters: sql`COUNT(DISTINCT ${chapters.id})`.as("totalChapters"),
        completedChapters: sql`COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${userProgress.chapterId} END)`.as(
          "completedChapters"
        ),
      })
      .from(courses)
      .leftJoin(chapters, eq(chapters.courseId, courses.id))
      .leftJoin(
        userProgress,
        and(eq(userProgress.chapterId, chapters.id), eq(userProgress.userId, userId))
      )
      .where(eq(courses.userId, userId))
      .groupBy(courses.id)
      .execute();

    const completedCourses = courseProgressResult.filter((course) => {
      const total = toNumber(course.totalChapters);
      const completed = toNumber(course.completedChapters);
      return total > 0 && total === completed;
    }).length;

    const overallProgress =
      totalChapters > 0 ? Math.min((completedChapters / totalChapters) * 100, 100) : 0;

    return {
      totalCourses,
      completedCourses,
      totalChapters,
      completedChapters,
      overallProgress,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
}
