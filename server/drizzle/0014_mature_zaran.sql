ALTER TABLE "video_statistics" ADD PRIMARY KEY ("video_id");--> statement-breakpoint
ALTER TABLE "video_statistics" ALTER COLUMN "video_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "video_statistics" DROP COLUMN "stat_id";