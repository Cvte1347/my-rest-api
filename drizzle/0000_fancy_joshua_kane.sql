CREATE SCHEMA "mangalib";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TABLE "mangalib"."manga" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"author" varchar(100),
	"description" text,
	"cover_url" text,
	"status" varchar(20) DEFAULT 'ongoing',
	"rating" varchar(5),
	"chapters_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
