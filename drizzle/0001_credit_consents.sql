CREATE TABLE "credit_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"applicant_user_id" text,
	"application_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"landlord_id" text,
	"consented_at" timestamp with time zone NOT NULL,
	"copy_version" text NOT NULL,
	"copy_sha256" text NOT NULL,
	"disclosure_text" text NOT NULL,
	"checkbox_auth" boolean NOT NULL,
	"checkbox_use" boolean NOT NULL,
	"checkbox_auth_label" text NOT NULL,
	"checkbox_use_label" text NOT NULL,
	"typed_full_name" text NOT NULL,
	"purpose" text DEFAULT 'housing_application' NOT NULL,
	"recipient_name" text NOT NULL,
	"locale" text DEFAULT 'en-US' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"disclosure_snapshot_html" text NOT NULL,
	"experian_share_id" text,
	"kba_succeeded_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "credit_consents" ADD CONSTRAINT "credit_consents_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_consents" ADD CONSTRAINT "credit_consents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_consents" ADD CONSTRAINT "credit_consents_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_consents" ADD CONSTRAINT "credit_consents_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_consents_application_id_idx" ON "credit_consents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "credit_consents_listing_id_idx" ON "credit_consents" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "credit_consents_applicant_user_id_idx" ON "credit_consents" USING btree ("applicant_user_id");