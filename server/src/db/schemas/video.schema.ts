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
  is_encrypted: boolean("is_encrypted").default(true),
  is_public: boolean("is_public").default(true),
  is_exclusive_for_premium: boolean("is_exclusive_for_premium").default(false), // For premium users.
  download_count: integer("download_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
