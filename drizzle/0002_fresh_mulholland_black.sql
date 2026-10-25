CREATE TABLE "tenant_contact" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"phone" text,
	"whatsapp" text,
	"email" text,
	"address_en" text,
	"address_ar" text,
	"hours_en" text,
	"hours_ar" text,
	"map_query" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_contact" ADD CONSTRAINT "tenant_contact_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;