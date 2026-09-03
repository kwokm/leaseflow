CREATE TABLE "adverse_action_notices" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"landlord_id" text,
	"applicant_user_id" text,
	"action_types" jsonb NOT NULL,
	"other_action" text,
	"letter_text" text NOT NULL,
	"letter_subject" text NOT NULL,
	"copy_version" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL,
	"delivery_channel" text NOT NULL,
	"email_status" text NOT NULL,
	"packet_snapshot" jsonb NOT NULL,
	"score_block_included" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adverse_action_notices" ADD CONSTRAINT "adverse_action_notices_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adverse_action_notices" ADD CONSTRAINT "adverse_action_notices_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adverse_action_notices" ADD CONSTRAINT "adverse_action_notices_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adverse_action_notices" ADD CONSTRAINT "adverse_action_notices_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adverse_action_notices_application_id_idx" ON "adverse_action_notices" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "adverse_action_notices_listing_id_idx" ON "adverse_action_notices" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "adverse_action_notices_landlord_id_idx" ON "adverse_action_notices" USING btree ("landlord_id");