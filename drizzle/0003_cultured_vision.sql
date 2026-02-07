CREATE TABLE "material_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"purchase_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "production_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"quantity_produced" numeric(12, 4) NOT NULL,
	"labor_cost" numeric(12, 2) NOT NULL,
	"overhead_cost" numeric(12, 2) NOT NULL,
	"total_batch_cost" numeric(12, 2) NOT NULL,
	"unit_cost" numeric(12, 4) NOT NULL,
	"production_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "production_material_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"quantity_used" numeric(12, 4) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "unit_cost_snapshot" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "profit" numeric(12, 2);