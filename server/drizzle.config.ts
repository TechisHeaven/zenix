import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import sanitizedConfig from "./src/utils/env.config";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: sanitizedConfig.DATABASE!,
  },
});
