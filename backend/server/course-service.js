import { db } from "../configs/db.js";
import {
  CHAPTER_TABLE,
  COURSE_TABLE,
  FLASHCARD_TABLE,
  NOTE_TABLE,
  QUIZ_SUBMISSION_TABLE,
  QUIZ_TABLE,
  USER_TABLE,
} from "../configs/schema.js";
import { eq, and, inArray, asc } from "drizzle-orm";

export async function insertCourse(course) {
  const {
    title,
    topic,
    studyType,
    difficultyLevel,
    summary,
    status,
  } = course;

  return db.insert(COURSE_TABLE).values(course).onConflictDoUpdate({
    target: COURSE_TABLE.id,
    set: {
      title,
      topic,
      studyType,
      difficultyLevel,
      summary,
      status,
      updatedAt: new Date(),
    },
  });
}

export async function insertChapters(chapters) {
  if (!chapters?.length) return;
  return db.insert(CHAPTER_TABLE).values(chapters).onConflictDoNothing();
}

export async function insertNotes(notes) {
  if (!notes?.length) return;
  return db.insert(NOTE_TABLE).values(notes).onConflictDoNothing();
}

export async function insertFlashcards(cards) {
  if (!cards?.length) return;
  return db.insert(FLASHCARD_TABLE).values(cards).onConflictDoNothing();
}

export async function insertQuizzes(questions) {
  if (!questions?.length) return;
  return db.insert(QUIZ_TABLE).values(questions).onConflictDoNothing();
}

export async function updateCourseStatus(courseId, status) {
  return db
    .update(COURSE_TABLE)
    .set({ status })
    .where(eq(COURSE_TABLE.id, courseId));
}

export async function updateCourseSummary(courseId, summary) {
  return db
    .update(COURSE_TABLE)
    .set({ summary })
    .where(eq(COURSE_TABLE.id, courseId));
}

export async function updateCourseProgress(courseId, progress, metadata) {
  return db
    .update(COURSE_TABLE)
    .set({ progress, progressMetadata: metadata })
    .where(eq(COURSE_TABLE.id, courseId));
}

export async function getCoursesForUser(userId) {
  return db
    .select()
    .from(COURSE_TABLE)
    .where(eq(COURSE_TABLE.userId, userId));
}

export async function getCourseDetail(courseId) {
  const courseResult = await db
    .select()
    .from(COURSE_TABLE)
    .where(eq(COURSE_TABLE.id, courseId))
    .limit(1);

  if (!courseResult || courseResult.length === 0) {
    return null;
  }

  const course = courseResult[0];

  const [chapters, flashcards, quizzes] = await Promise.all([
    db
      .select()
      .from(CHAPTER_TABLE)
      .where(eq(CHAPTER_TABLE.courseId, courseId)),
    db
      .select()
      .from(FLASHCARD_TABLE)
      .where(eq(FLASHCARD_TABLE.courseId, courseId)),
    db
      .select()
      .from(QUIZ_TABLE)
      .where(eq(QUIZ_TABLE.courseId, courseId)),
  ]);

  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const chapterIds = sortedChapters.map((chapter) => chapter.id);

  const notes = chapterIds.length
    ? await db
        .select()
        .from(NOTE_TABLE)
        .where(inArray(NOTE_TABLE.chapterId, chapterIds))
    : [];

  const notesByChapter = notes.reduce((accumulator, note) => {
    if (!accumulator.has(note.chapterId)) {
      accumulator.set(note.chapterId, []);
    }
    accumulator.get(note.chapterId).push(note);
    return accumulator;
  }, new Map());

  const chaptersWithNotes = sortedChapters.map((chapter) => ({
    ...chapter,
    notes: notesByChapter.get(chapter.id) ?? [],
  }));

  return {
    ...course,
    chapters: chaptersWithNotes,
    flashcards,
    quizzes,
  };
}

export async function getCourseWithContent(courseId) {
  return db.query.COURSE_TABLE.findFirst({
    where: eq(COURSE_TABLE.id, courseId),
    with: {
      chapters: {
        with: {
          notes: true,
        },
        orderBy: (chapters, { asc }) => [asc(chapters.order)],
      },
      flashcards: true,
      quizzes: {
        with: {
          submissions: true,
        },
      },
      finalTest: {
        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
          attempts: {
            orderBy: (attempts, { desc }) => [
              desc(attempts.completedAt),
              desc(attempts.createdAt),
            ],
          },
        },
      },
    },
  });
}

export async function getCourseById(courseId) {
  return db.query.COURSE_TABLE.findFirst({
    where: eq(COURSE_TABLE.id, courseId),
  });
}

export async function ensureUserRecord({ externalId, email, name }) {
  const existing = await db
    .select()
    .from(USER_TABLE)
    .where(eq(USER_TABLE.externalId, externalId));

  if (existing.length) return existing[0];

  const result = await db
    .insert(USER_TABLE)
    .values({
      externalId,
      email,
      name,
    })
    .returning();

  return result[0];
}

export async function recordQuizSubmission({ quizId, userId, selectedAnswer, isCorrect }) {
  return db
    .insert(QUIZ_SUBMISSION_TABLE)
    .values({ quizId, userId, selectedAnswer, isCorrect })
    .returning();
}

export async function getQuizSubmissions(quizId, userId) {
  return db
    .select()
    .from(QUIZ_SUBMISSION_TABLE)
    .where(and(eq(QUIZ_SUBMISSION_TABLE.quizId, quizId), eq(QUIZ_SUBMISSION_TABLE.userId, userId)));
}

export async function deleteCourse(courseId) {
  // Since we have CASCADE deletes in the schema, deleting the course will delete all related records
  return db.delete(COURSE_TABLE).where(eq(COURSE_TABLE.id, courseId));
}