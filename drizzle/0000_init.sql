CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."trainer_status" AS ENUM('approved', 'deactivated');--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"image_url" text,
	"timezone" text DEFAULT 'America/Toronto' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trainer_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"specialties" text[] NOT NULL,
	"certifications" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"specialties" text[] NOT NULL,
	"years_experience" integer,
	"city" text,
	"province" text,
	"accepting_clients" boolean DEFAULT true NOT NULL,
	"status" "trainer_status" DEFAULT 'approved' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(display_name, '')), 'A') || setweight(to_tsvector('english', coalesce(headline, '')), 'B') || setweight(to_tsvector('english', coalesce(bio, '')), 'C')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trainers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "trainers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "trainer_applications" ADD CONSTRAINT "trainer_applications_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_applications" ADD CONSTRAINT "trainer_applications_reviewed_by_profiles_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trainer_applications_one_pending_per_user" ON "trainer_applications" USING btree ("user_id") WHERE "trainer_applications"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "trainer_applications_status_idx" ON "trainer_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "trainers_search_idx" ON "trainers" USING gin ("search");--> statement-breakpoint
CREATE INDEX "trainers_specialties_idx" ON "trainers" USING gin ("specialties");--> statement-breakpoint
CREATE INDEX "trainers_listing_idx" ON "trainers" USING btree ("published","status","province");