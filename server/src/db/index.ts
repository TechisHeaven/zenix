import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import sanitizedConfig from "../utils/env.config";

const pool = new Pool({
  connectionString: sanitizedConfig.DATABASE, // Provide your DB connection URL
});

const db = drizzle(pool);

export default db;
