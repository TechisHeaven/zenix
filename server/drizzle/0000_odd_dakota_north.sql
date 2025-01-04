CREATE TABLE "admin_logs" (
	"log_id" uuid PRIMARY KEY NOT NULL,
	"admin_id" uuid,
	"action_type" text,
	"action_details" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "download_history" (
	"download_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"video_id" uuid,
	"download_at" timestamp DEFAULT now(),
	"is_premium" boolean DEFAULT false,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlist_videos" (
	"playlist_video_id" uuid PRIMARY KEY NOT NULL,
	"playlist_id" uuid,
	"video_id" uuid,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"playlist_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"title" text,
	"description" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token" text,
	"device_info" jsonb,
	"ip_address" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "video_statistics" (
	"stat_id" uuid PRIMARY KEY NOT NULL,
	"video_id" uuid,
	"total_views" integer DEFAULT 0,
	"total_likes" integer DEFAULT 0,
	"total_comments" integer DEFAULT 0,
	"total_shares" integer DEFAULT 0,
	"total_watch_time" integer DEFAULT 0,
	"premium_views" integer DEFAULT 0,
	"average_watch_time" integer,
	"highest_watch_time" integer
);
--> statement-breakpoint
CREATE TABLE "watch_history" (
	"history_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"video_id" uuid,
	"watch_time" integer,
	"watched_at" timestamp DEFAULT now(),
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"password" varchar(255),
	"profile_image" varchar(255),
	"bio" text,
	"location" varchar(255),
	"date_of_birth" timestamp,
	"role" varchar(50) DEFAULT 'viewer',
	"preferences" jsonb,
	"last_login" timestamp,
	"account_status" varchar(50) DEFAULT 'active',
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"premium" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"comment_id" uuid PRIMARY KEY NOT NULL,
	"video_id" uuid,
	"user_id" uuid,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "video_likes" (
	"video_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid PRIMARY KEY NOT NULL,
	"is_like" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_reports" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"video_id" uuid,
	"user_id" uuid,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"video_id" uuid PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"upload_date" timestamp DEFAULT now(),
	"url" text,
	"encrypted_key" text,
	"user_id" uuid,
	"tags" jsonb,
	"category" text,
	"resolution" text,
	"file_size" integer,
	"duration" integer,
	"views" integer DEFAULT 0,
	"likes_count" integer DEFAULT 0,
	"dislikes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"is_encrypted" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"is_exclusive_for_premium" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"uploaded_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "download_history" ADD CONSTRAINT "download_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "download_history" ADD CONSTRAINT "download_history_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_playlist_id_playlists_playlist_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("playlist_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "video_statistics" ADD CONSTRAINT "video_statistics_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_reports" ADD CONSTRAINT "video_reports_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_reports" ADD CONSTRAINT "video_reports_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;