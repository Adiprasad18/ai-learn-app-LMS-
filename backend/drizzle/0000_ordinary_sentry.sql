CREATE TABLE "studyMaterial" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(255) NOT NULL,
	"course_type" varchar(255) NOT NULL,
	"topic" varchar(255) NOT NULL,
	"difficulty_level" varchar(50) DEFAULT 'Easy',
	"course_layout" json,
	"created_by" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Generating'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_member" boolean DEFAULT false
);
