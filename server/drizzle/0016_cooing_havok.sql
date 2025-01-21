/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'video_statistics'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "video_statistics" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "video_statistics" ALTER COLUMN "video_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "video_statistics" ALTER COLUMN "video_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "video_statistics" ADD COLUMN "stat_id" uuid PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "video_statistics" ADD CONSTRAINT "video_statistics_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;