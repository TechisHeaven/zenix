import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { videos } from "./video.schema";

export const sessions = pgTable("sessions", {
  session_id: uuid("session_id").primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  token: text("token").unique(),
  device_info: jsonb("device_info"),
  ip_address: text("ip_address"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export const watch_history = pgTable("watch_history", {
  history_id: uuid("history_id").primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  watch_time: integer("watch_time").default(0),
  watched_at: timestamp("watched_at").defaultNow(),
  is_completed: boolean("is_completed").default(false),
});

export const playlists = pgTable("playlists", {
  playlist_id: uuid("playlist_id").primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  title: text("title"),
  description: text("description"),
  is_public: boolean("is_public").default(true),
  video_count: integer("video_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const playlist_videos = pgTable("playlist_videos", {
  playlist_video_id: uuid("playlist_video_id").primaryKey(),
  playlist_id: uuid("playlist_id").references(() => playlists.playlist_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  added_at: timestamp("added_at").defaultNow(),
});

// export const video_statistics = pgTable("video_statistics", {
//   stat_id: uuid("stat_id").primaryKey(),
//   video_id: uuid("video_id").references(() => videos.video_id, {
//     onDelete: "cascade",
//     onUpdate: "cascade",
//   }),
//   total_views: integer("total_views").default(0),
//   total_likes: integer("total_likes").default(0),
//   total_dislikes: integer("total_likes").default(0),
//   total_comments: integer("total_comments").default(0),
//   total_shares: integer("total_shares").default(0),
//   total_watch_time: integer("total_watch_time").default(0),
//   premium_views: integer("premium_views").default(0),
//   average_watch_time: integer("average_watch_time"),
//   highest_watch_time: integer("highest_watch_time"),
// });

export const download_history = pgTable("download_history", {
  download_id: uuid("download_id").primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  download_at: timestamp("download_at").defaultNow(),
  is_premium: boolean("is_premium").default(false),
  added_at: timestamp("added_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  subscription_id: uuid("subscription_id").primaryKey(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  plan_id: text("plan_id"),
  payment_details: jsonb("payment_details"),
  status: text("status"),
  subscribed_at: timestamp("subscribed_at").defaultNow(),
  cancelled_at: timestamp("cancelled_at"),
});

export const admin_logs = pgTable("admin_logs", {
  log_id: uuid("log_id").primaryKey(),
  admin_id: uuid("admin_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  action_type: text("action_type"), // E.g., 'video_approval', 'comment_modification'.
  action_details: jsonb("action_details"),
  timestamp: timestamp("timestamp").defaultNow(),
});
