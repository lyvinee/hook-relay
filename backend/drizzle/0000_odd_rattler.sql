CREATE TYPE "public"."auth_method_type" AS ENUM('email', 'google', 'github');--> statement-breakpoint
CREATE TYPE "public"."user_role_type" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'success', 'failed', 'dlq');--> statement-breakpoint
CREATE TABLE "auth_methods" (
	"auth_method_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"method_type" "auth_method_type" NOT NULL,
	"provider_user_id" varchar(200),
	"secret_hash" varchar(200),
	"is_primary" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "auth_methods_user_id_method_type_unique" UNIQUE("user_id","method_type")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"client_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug_name" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "clients_slug_name_unique" UNIQUE("slug_name")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"topic_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_name" varchar(200) NOT NULL,
	"topic_slug_id" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "topics_topic_slug_id_unique" UNIQUE("topic_slug_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role_type" NOT NULL,
	"email" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"webhook_delivery_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_event_id" uuid NOT NULL,
	"delivery_payload" jsonb NOT NULL,
	"delivery_timestamp" timestamp with time zone NOT NULL,
	"delivery_status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"delivery_attempts" integer DEFAULT 0 NOT NULL,
	"delivery_retry_after" timestamp with time zone,
	"delivery_error" jsonb,
	"delivery_response" jsonb,
	"delivery_response_status" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_dlq" (
	"webhook_dlq_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_delivery_id" uuid NOT NULL,
	"delivery_payload" jsonb NOT NULL,
	"delivery_timestamp" timestamp with time zone NOT NULL,
	"delivery_status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"delivery_attempts" integer DEFAULT 0 NOT NULL,
	"delivery_retry_after" timestamp with time zone,
	"delivery_error" jsonb,
	"delivery_response" jsonb,
	"delivery_response_status" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"webhook_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"event_payload" jsonb NOT NULL,
	"event_timestamp" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_subscriptions" (
	"webhook_subscription_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "webhook_subscriptions_webhook_id_topic_id_unique" UNIQUE("webhook_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"webhook_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"endpoint_name" varchar(200) NOT NULL,
	"target_url" varchar(200) NOT NULL,
	"hmac_secret" varchar(200),
	"retry_policy" jsonb,
	"timeout_ms" integer DEFAULT 5000,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "webhooks_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "auth_methods" ADD CONSTRAINT "auth_methods_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_event_id_webhook_events_webhook_event_id_fk" FOREIGN KEY ("webhook_event_id") REFERENCES "public"."webhook_events"("webhook_event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_dlq" ADD CONSTRAINT "webhook_dlq_webhook_delivery_id_webhook_deliveries_webhook_delivery_id_fk" FOREIGN KEY ("webhook_delivery_id") REFERENCES "public"."webhook_deliveries"("webhook_delivery_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_webhook_id_webhooks_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("webhook_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_topic_id_topics_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("topic_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_webhook_id_webhooks_webhook_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("webhook_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_topic_id_topics_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("topic_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE no action ON UPDATE no action;