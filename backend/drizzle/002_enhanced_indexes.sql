-- Enhanced indexes and constraints for better performance

-- Add foreign key constraints
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE;
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;

-- Add performance indexes
CREATE INDEX "courses_user_id_idx" ON "courses"("user_id");
CREATE INDEX "courses_status_idx" ON "courses"("status");
CREATE INDEX "courses_created_at_idx" ON "courses"("created_at");

CREATE INDEX "chapters_course_id_idx" ON "chapters"("course_id");
CREATE INDEX "chapters_order_idx" ON "chapters"("order");

CREATE INDEX "notes_chapter_id_idx" ON "notes"("chapter_id");

CREATE INDEX "flashcards_course_id_idx" ON "flashcards"("course_id");

CREATE INDEX "quizzes_course_id_idx" ON "quizzes"("course_id");

CREATE INDEX "quiz_submissions_quiz_id_idx" ON "quiz_submissions"("quiz_id");
CREATE INDEX "quiz_submissions_user_id_idx" ON "quiz_submissions"("user_id");
CREATE INDEX "quiz_submissions_created_at_idx" ON "quiz_submissions"("created_at");

-- Add composite indexes for common queries
CREATE INDEX "courses_user_status_idx" ON "courses"("user_id", "status");
CREATE INDEX "quiz_submissions_user_quiz_idx" ON "quiz_submissions"("user_id", "quiz_id");