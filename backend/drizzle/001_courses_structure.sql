CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "external_id" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "is_member" boolean DEFAULT false,
    "stripe_customer_id" varchar(255),
    "subscription_status" varchar(50) DEFAULT 'inactive',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "courses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" varchar(255) NOT NULL,
    "title" varchar(255) NOT NULL,
    "topic" text NOT NULL,
    "study_type" varchar(100) NOT NULL,
    "difficulty_level" varchar(50) NOT NULL,
    "summary" text,
    "status" varchar(50) DEFAULT 'draft',
    "progress" integer DEFAULT 0,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chapters" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" varchar(255) NOT NULL,
    "summary" text,
    "order" integer NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "notes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "chapter_id" uuid REFERENCES "chapters"("id") ON DELETE CASCADE,
    "content" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "flashcards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
    "front" text NOT NULL,
    "back" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quizzes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
    "question" text NOT NULL,
    "options" json NOT NULL,
    "correct_answer" varchar(255) NOT NULL,
    "explanation" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quiz_submissions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "quiz_id" uuid REFERENCES "quizzes"("id") ON DELETE CASCADE,
    "user_id" varchar(255) NOT NULL,
    "selected_answer" varchar(255) NOT NULL,
    "is_correct" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_courses_user_id" ON "courses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_chapters_course_id" ON "chapters" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_notes_chapter_id" ON "notes" ("chapter_id");
CREATE INDEX IF NOT EXISTS "idx_flashcards_course_id" ON "flashcards" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_quizzes_course_id" ON "quizzes" ("course_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_submissions_quiz_id" ON "quiz_submissions" ("quiz_id");