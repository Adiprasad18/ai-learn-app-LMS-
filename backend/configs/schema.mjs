import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  boolean,
  json,
  text,
  integer,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ===========================
   USER TABLE
=========================== */

export const USER_TABLE = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    externalIdIdx: uniqueIndex("users_external_id_idx").on(table.externalId),
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);


/* ===========================
   COURSE TABLE
=========================== */
export const COURSE_TABLE = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    topic: text("topic").notNull(),
    studyType: varchar("study_type", { length: 100 }).notNull(),
    difficultyLevel: varchar("difficulty_level", { length: 50 }).notNull(),
    summary: text("summary"),
    status: varchar("status", { length: 50 }).default("draft"),
    progress: integer("progress").default(0),
    progressMetadata: json("progress_metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("courses_user_title_idx").on(table.userId, table.title),
  })
);

/* ===========================
   CHAPTER TABLE
=========================== */
export const CHAPTER_TABLE = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => COURSE_TABLE.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   NOTE TABLE
=========================== */
export const NOTE_TABLE = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id")
    .notNull()
    .references(() => CHAPTER_TABLE.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   FLASHCARD TABLE
=========================== */
export const FLASHCARD_TABLE = pgTable("flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => COURSE_TABLE.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   QUIZ + SUBMISSION TABLES
=========================== */
export const QUIZ_TABLE = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => COURSE_TABLE.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  options: json("options").notNull(),
  correctAnswer: varchar("correct_answer", { length: 255 }).notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const QUIZ_SUBMISSION_TABLE = pgTable("quiz_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => QUIZ_TABLE.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  selectedAnswer: varchar("selected_answer", { length: 255 }).notNull(),
  isCorrect: boolean("is_correct").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ===========================
   USER PROGRESS TABLE
=========================== */
export const USER_PROGRESS_TABLE = pgTable(
  "user_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    chapterId: uuid("chapter_id").notNull(),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userChapterIdx: uniqueIndex("user_progress_user_chapter_idx").on(
      table.userId,
      table.chapterId
    ),
  })
);

/* ===========================
   RELATIONS
=========================== */
export const userRelations = relations(USER_TABLE, ({ many }) => ({
  courses: many(COURSE_TABLE),
}));

export const courseRelations = relations(COURSE_TABLE, ({ many, one }) => ({
  user: one(USER_TABLE, {
    fields: [COURSE_TABLE.userId],
    references: [USER_TABLE.externalId],
  }),
  chapters: many(CHAPTER_TABLE),
  flashcards: many(FLASHCARD_TABLE),
  quizzes: many(QUIZ_TABLE),
}));

export const chapterRelations = relations(CHAPTER_TABLE, ({ one, many }) => ({
  course: one(COURSE_TABLE, {
    fields: [CHAPTER_TABLE.courseId],
    references: [COURSE_TABLE.id],
  }),
  notes: many(NOTE_TABLE),
}));

export const noteRelations = relations(NOTE_TABLE, ({ one }) => ({
  chapter: one(CHAPTER_TABLE, {
    fields: [NOTE_TABLE.chapterId],
    references: [CHAPTER_TABLE.id],
  }),
}));

/* ===========================
   EXPORT ALIASES
=========================== */
export const courses = COURSE_TABLE;
export const chapters = CHAPTER_TABLE;
export const userProgress = USER_PROGRESS_TABLE;
