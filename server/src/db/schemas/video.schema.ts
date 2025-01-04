import { users } from "./user.schema"; // Assuming you have a user schema file
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
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
  tags: jsonb("tags"),
  category: text("category"),
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
  video_id: uuid("video_id")
    .references(() => videos.video_id, {
      onDelete: "cascade",
    })
    .primaryKey(),
  user_id: uuid("user_id")
    .references(() => users.user_id, {
      onDelete: "cascade",
    })
    .primaryKey(),
  is_like: boolean("is_like").default(true), // true for like, false for dislike
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
