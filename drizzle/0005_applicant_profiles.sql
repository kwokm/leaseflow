CREATE TABLE "applicant_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"draft_id" text,
	"listing_id" text,
	"photo_blob_path" text,
	"bio" text DEFAULT '' NOT NULL,
	"social_consent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"draft_id" text,
	"listing_id" text,
	"network" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"handle" text,
	"profile_url" text,
	"personal_profile" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"draft_id" text,
	"network" text NOT NULL,
	"position" integer NOT NULL,
	"permalink" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"taken_at" timestamp with time zone,
	"blob_path" text,
	"media_type" text DEFAULT 'image' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_snapshots" ADD CONSTRAINT "social_post_snapshots_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applicant_profiles_application_id_idx" ON "applicant_profiles" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "applicant_profiles_draft_id_idx" ON "applicant_profiles" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "social_connections_application_id_idx" ON "social_connections" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "social_connections_draft_id_idx" ON "social_connections" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "social_post_snapshots_application_id_idx" ON "social_post_snapshots" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "social_post_snapshots_draft_id_idx" ON "social_post_snapshots" USING btree ("draft_id");