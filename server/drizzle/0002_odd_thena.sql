ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_admin_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "download_history" DROP CONSTRAINT "download_history_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "download_history" DROP CONSTRAINT "download_history_video_id_videos_video_id_fk";
--> statement-breakpoint
ALTER TABLE "playlist_videos" DROP CONSTRAINT "playlist_videos_playlist_id_playlists_playlist_id_fk";
--> statement-breakpoint
ALTER TABLE "playlist_videos" DROP CONSTRAINT "playlist_videos_video_id_videos_video_id_fk";
--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "video_statistics" DROP CONSTRAINT "video_statistics_video_id_videos_video_id_fk";
--> statement-breakpoint
ALTER TABLE "watch_history" DROP CONSTRAINT "watch_history_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "watch_history" DROP CONSTRAINT "watch_history_video_id_videos_video_id_fk";
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
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_video_id_videos_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("video_id") ON DELETE cascade ON UPDATE cascade;