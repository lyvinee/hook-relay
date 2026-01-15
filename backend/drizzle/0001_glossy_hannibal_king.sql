CREATE TABLE "app_config" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
