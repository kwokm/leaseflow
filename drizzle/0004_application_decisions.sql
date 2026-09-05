ALTER TABLE "applications" ADD COLUMN "decision" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "decided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "decided_by" text;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;