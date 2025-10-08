CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shareable_link" varchar(21) NOT NULL,
	"name" varchar(255),
	"address" text,
	"phone" varchar(20),
	"product_name" varchar(255),
	"status" varchar(20) DEFAULT 'Processing',
	CONSTRAINT "orders_shareable_link_unique" UNIQUE("shareable_link")
);
