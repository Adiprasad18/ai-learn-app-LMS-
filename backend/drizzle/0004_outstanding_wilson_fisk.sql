CREATE TABLE "final_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_test_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "final_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"final_test_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"question" text NOT NULL,
	"type" varchar(50) DEFAULT 'multiple_choice',
	"options" json,
	"answer_key" json,
	"explanation" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "final_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"instructions" text,
	"question_count" integer DEFAULT 0 NOT NULL,
	"passing_score" integer DEFAULT 0 NOT NULL,
	"time_limit_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "final_test_attempts" ADD CONSTRAINT "final_test_attempts_final_test_id_final_tests_id_fk" FOREIGN KEY ("final_test_id") REFERENCES "public"."final_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_test_questions" ADD CONSTRAINT "final_test_questions_final_test_id_final_tests_id_fk" FOREIGN KEY ("final_test_id") REFERENCES "public"."final_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_tests" ADD CONSTRAINT "final_tests_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "final_tests_course_idx" ON "final_tests" USING btree ("course_id","title");