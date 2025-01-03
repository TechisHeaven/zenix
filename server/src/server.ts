import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import * as middlewares from "./middleware/middleware";
import api from "./routes";
import jwt, { decode } from "jsonwebtoken";
import { connectRedis, redis } from "./config/redis.config";
import { JWT_SECRET } from "./constants/main.constants";
import { DecodedJWTBody } from "./types/main.types";
import db from "./db";
import { users } from "./db/schemas/user.schema";
import { eq } from "drizzle-orm";

dotenv.config();
const app = express();
app.use(morgan("dev"));
app.use(helmet());
connectRedis();
const allowedOrigins = [
  "http://localhost:5173", // Allow your local development server (if applicable)
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/v1", api);

export async function ensureAuthenticated(req: any, res: any, next: () => any) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).send("Access denied");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedJWTBody;
    const sessionData = await redis.get(decoded.user_id); // Check if token exists in Redis

    if (!sessionData) {
      return res.status(401).send("Session expired or invalid");
    }

    req.user = decoded; // Add user information to request object
    next();
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
}
export async function ensureEmailVerified(req: any, res: any, next: () => any) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).send("Access denied");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedJWTBody;
    const sessionData = await redis.get(decoded.user_id); // Check if token exists in Redis

    if (!sessionData) {
      return res.status(401).send("Session expired or invalid");
    }

    req.user = decoded; // Add user information to request object

    const user_id = decoded.user_id;

    const user = await db
      .select({ email_verified: users.email_verified })
      .from(users)
      .where(eq(users.user_id, user_id));

    if (user[0].email_verified === false) {
      return res.status(401).send("Email not Verified");
    }

    next();
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
}

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
