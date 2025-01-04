import {
  pgTable,
  text,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { watch_history } from "./main.schema";

export const users = pgTable("users", {
  user_id: uuid("user_id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  profile_image: varchar("profile_image", { length: 255 }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }), // User's geographical location.
  date_of_birth: timestamp("date_of_birth"), // For age-based personalization.
  role: varchar("role", { length: 50 }).default("viewer"), // 'admin', 'content_creator', 'viewer'.
  preferences: jsonb("preferences"), // User preferences(e.g.,video categories).
  last_login: timestamp("last_login"), // Track last login.
  account_status: varchar("account_status", { length: 50 }).default("active"), // 'active', 'suspended', 'deleted'.
  email_verified: boolean("email_verified").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  premium: boolean("premium").default(false), // Premium subscription status.
});
