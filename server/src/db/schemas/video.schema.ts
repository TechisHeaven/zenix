import { sql } from "drizzle-orm";
import { users } from "./user.schema"; // Assuming you have a user schema file
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

export const videos = pgTable("videos", {
  video_id: uuid("video_id").primaryKey(),
  title: text("title"),
  description: text("description"),
  upload_date: timestamp("upload_date").defaultNow(),
  url: text("url"),
  encrypted_key: text("encrypted_key"),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`),
  category: text("category")
    .array()
    .default(sql`ARRAY[]::text[]`),
  resolution: text("resolution"),
  file_size: integer("file_size"),
  duration: integer("duration"),
  views: integer("views").default(0),
  likes_count: integer("likes_count").default(0),
  dislikes_count: integer("dislikes_count").default(0),
  comments_count: integer("comments_count").default(0),
  is_encrypted: boolean("is_encrypted").default(true),
  is_public: boolean("is_public").default(true),
  is_exclusive_for_premium: boolean("is_exclusive_for_premium").default(false), // For premium users.
  download_count: integer("download_count").default(0),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const comments = pgTable("comments", {
  comment_id: uuid("comment_id").primaryKey(),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
  }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
  }),
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").$onUpdateFn(() => new Date()),
});

export const video_likes = pgTable("video_likes", {
  like_id: uuid("like_id").primaryKey(),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
  }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
  }),
  is_like: boolean("is_like").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const video_reports = pgTable("video_reports", {
  report_id: uuid("report_id").primaryKey(),
  video_id: uuid("video_id").references(() => videos.video_id, {
    onDelete: "cascade",
  }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "cascade",
  }),
  reason: text("reason"),
  created_at: timestamp("created_at").defaultNow(),
});

export const video_statistics = pgTable("video_statistics", {
  stat_id: uuid("stat_id").primaryKey(),
  video_id: uuid("video_id")
    .notNull()
    .references(() => videos.video_id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  total_views: integer("total_views").default(0),
  total_likes: integer("total_likes").default(0),
  total_dislikes: integer("total_likes").default(0),
  total_comments: integer("total_comments").default(0),
  total_shares: integer("total_shares").default(0),
  total_watch_time: real("total_watch_time").default(0),
  engagement_rate: real("engagement_rate").default(0),
  premium_views: real("premium_views").default(0),
  average_watch_time: real("average_watch_time"),
  highest_watch_time: real("highest_watch_time"),
  updated_at: timestamp("updated_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});
