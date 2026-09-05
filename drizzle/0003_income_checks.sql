CREATE TABLE "income_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"listing_id" text,
	"document_id" text,
	"applicant_name" text DEFAULT '' NOT NULL,
	"doc_kind" text NOT NULL,
	"blob_path" text NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"claimed_at" timestamp with time zone,
	"claimed_by" text,
	"error_text" text,
	"monthly_gross_cents" integer,
	"pay_frequency" text,
	"employer" text,
	"period_start" text,
	"period_end" text,
	"detected_name" text,
	"name_match" boolean,
	"recency" text,
	"recency_label" text,
	"extractor" text,
	"raw_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income_checks" ADD CONSTRAINT "income_checks_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_checks" ADD CONSTRAINT "income_checks_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_checks" ADD CONSTRAINT "income_checks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "income_checks_status_idx" ON "income_checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "income_checks_application_id_idx" ON "income_checks" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "income_checks_listing_id_idx" ON "income_checks" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "income_checks_created_at_idx" ON "income_checks" USING btree ("created_at");