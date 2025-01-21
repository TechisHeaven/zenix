ALTER TABLE "video_statistics" DROP CONSTRAINT "video_statistics_video_id_videos_video_id_fk";
--> statement-breakpoint
ALTER TABLE "video_statistics" ALTER COLUMN "video_id" SET DEFAULT 'gen_random_uuid()';