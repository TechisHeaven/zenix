CREATE TABLE "subscriptions" (
	"subscription_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"plan_id" text,
	"payment_details" jsonb,
	"status" text,
	"subscribed_at" timestamp DEFAULT now(),
	"cancelled_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;