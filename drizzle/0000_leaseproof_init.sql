CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"confirmation_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"household_id" text,
	"applicant_user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"screening_package" text DEFAULT 'standard' NOT NULL,
	"packet" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lease_score" integer,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"kind" text NOT NULL,
	"version" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	"signature" text,
	"ip_address" text,
	"user_agent" text,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"provider" text DEFAULT 'experian_connect' NOT NULL,
	"status" text DEFAULT 'authorized' NOT NULL,
	"share_reference" text,
	"inquiry_type" text DEFAULT 'soft' NOT NULL,
	"score" integer,
	"score_model" text,
	"summary" jsonb,
	"authorized_at" timestamp with time zone,
	"requested_at" timestamp with time zone,
	"shared_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"kind" text NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text,
	"address" text NOT NULL,
	"rent" integer DEFAULT 0 NOT NULL,
	"bedrooms" numeric(4, 1) DEFAULT '0' NOT NULL,
	"bathrooms" numeric(4, 1) DEFAULT '0' NOT NULL,
	"sqft" integer,
	"available_date" text,
	"screening_package" text DEFAULT 'standard' NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"neighborhood" text,
	"property_type" text,
	"zillow_url" text,
	"zpid" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'renter' NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"company" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_shares" ADD CONSTRAINT "credit_shares_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_confirmation_id_idx" ON "applications" USING btree ("confirmation_id");--> statement-breakpoint
CREATE INDEX "applications_listing_id_idx" ON "applications" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "applications_household_id_idx" ON "applications" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "applications_applicant_user_id_idx" ON "applications" USING btree ("applicant_user_id");--> statement-breakpoint
CREATE INDEX "consents_application_id_idx" ON "consents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "credit_shares_application_id_idx" ON "credit_shares" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "documents_application_id_idx" ON "documents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "households_listing_id_idx" ON "households" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listings_owner_id_idx" ON "listings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "payments_application_id_idx" ON "payments" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_stripe_session_idx" ON "payments" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");