CREATE TABLE "video_statistics" (
	"stat_id" uuid PRIMARY KEY NOT NULL,
	"video_id" uuid,
	"total_views" integer DEFAULT 0,
	"total_likes" integer DEFAULT 0,
	"total_comments" integer DEFAULT 0,
	"total_shares" integer DEFAULT 0,
	"total_watch_time" real DEFAULT 0,
	"engagement_rate" real DEFAULT 0,
	"premium_views" real DEFAULT 0,
	"average_watch_time" real,
	"highest_watch_time" real,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_views" (
	"view_id" serial PRIMARY KEY NOT NULL,
	"video_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "video_statistics" ADD CONSTRAINT "video_statistics_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE no action ON UPDATE no action;