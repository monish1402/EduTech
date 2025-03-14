CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"verification_code" text NOT NULL,
	"status" text DEFAULT 'valid' NOT NULL,
	"metadata" json,
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail" text NOT NULL,
	"educator_id" integer NOT NULL,
	"video_url" text NOT NULL,
	"quiz" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"quiz_score" integer,
	"certificate_issued" boolean DEFAULT false NOT NULL,
	"last_accessed" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"content" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"similarity_score" integer,
	"plagiarism_detected" boolean DEFAULT false NOT NULL,
	"matched_submission_ids" integer[],
	"verification_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_educator" boolean DEFAULT false NOT NULL,
	"profile_image" text,
	"bio" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
