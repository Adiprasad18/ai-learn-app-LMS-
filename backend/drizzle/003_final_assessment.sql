-- Final assessment tables

CREATE TABLE IF NOT EXISTS "final_tests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" varchar(255) NOT NULL,
    "description" text,
    "instructions" text,
    "question_count" integer DEFAULT 0,
    "passing_score" integer DEFAULT 0,
    "time_limit_minutes" integer,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "final_tests_course_idx" ON "final_tests" ("course_id");

CREATE TABLE IF NOT EXISTS "final_test_questions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "final_test_id" uuid NOT NULL REFERENCES "final_tests"("id") ON DELETE CASCADE,
    "order" integer NOT NULL,
    "question" text NOT NULL,
    "type" varchar(50) DEFAULT 'multiple_choice',
    "options" json,
    "answer_key" json,
    "explanation" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "final_test_attempts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "final_test_id" uuid NOT NULL REFERENCES "final_tests"("id") ON DELETE CASCADE,
    "user_id" varchar(255) NOT NULL,
    "score" integer DEFAULT 0,
    "total_questions" integer DEFAULT 0,
    "correct_answers" integer DEFAULT 0,
    "percentage" integer DEFAULT 0,
    "passed" boolean DEFAULT false,
    "responses" json,
    "started_at" timestamp DEFAULT now(),
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "final_test_questions_final_test_idx" ON "final_test_questions" ("final_test_id");
CREATE INDEX IF NOT EXISTS "final_test_attempts_user_idx" ON "final_test_attempts" ("user_id");
CREATE INDEX IF NOT EXISTS "final_test_attempts_final_test_idx" ON "final_test_attempts" ("final_test_id");