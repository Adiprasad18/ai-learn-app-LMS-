CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"chapter_id" uuid NOT NULL,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_progress_user_chapter_idx" ON "user_progress" USING btree ("user_id","chapter_id");