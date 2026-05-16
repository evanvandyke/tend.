CREATE TYPE "public"."task_kind" AS ENUM('recurring', 'seasonal', 'project', 'quick', 'longcycle');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('active', 'pending', 'done', 'archived');--> statement-breakpoint
CREATE TABLE "garden_plants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plant_slug" text NOT NULL,
	"custom_name" text,
	"count" integer DEFAULT 1 NOT NULL,
	"started_indoors_at" timestamp,
	"transplanted_at" timestamp,
	"estimated_harvest_at" timestamp,
	"archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lunar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_date" timestamp NOT NULL,
	"event_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"topic" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"keys" jsonb NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_module_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"module_slug" text NOT NULL,
	"task_slug" text NOT NULL,
	"year" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_modules" (
	"user_id" text NOT NULL,
	"module_slug" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"enabled_at" timestamp DEFAULT now() NOT NULL,
	"customizations" jsonb,
	CONSTRAINT "user_modules_user_id_module_slug_pk" PRIMARY KEY("user_id","module_slug")
);
--> statement-breakpoint
CREATE TABLE "user_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "task_kind" NOT NULL,
	"status" "task_status" DEFAULT 'active' NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"cadence_days" integer,
	"cadence_years" integer,
	"last_completed_at" timestamp,
	"next_due_at" timestamp,
	"window_start_month" integer,
	"window_start_day" integer,
	"window_end_month" integer,
	"window_end_day" integer,
	"project_data" jsonb,
	"due_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"location_zip" text DEFAULT '84003',
	"email_notifications_enabled" boolean DEFAULT true,
	"push_notifications_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_completions" ADD CONSTRAINT "user_module_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_modules" ADD CONSTRAINT "user_modules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;