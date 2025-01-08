export function transformPlaylistVideosData(data: any[]) {
  return data.map((item) => ({
    playlist_video_id: item.playlist_videos.playlist_video_id,
    playlist_id: item.playlist_videos.playlist_id,
    video_id: item.playlist_videos.video_id,
    added_at: item.playlist_videos.added_at,
    video: item.videos,
  }));
}
