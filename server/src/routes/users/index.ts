import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { ensureAuthenticated, ensureEmailVerified } from "../../server";
import { createError } from "../../utils/error.utils";
import db from "../../db";
import { users } from "../../db/schemas/user.schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { MAX_PASSWORD_LENGTH } from "../../constants/main.constants";
import { redis } from "../../config/redis.config";
import { sessions, watch_history } from "../../db/schemas/main.schema";
import { v4 as uuidv4 } from "uuid";
import { videos } from "../../db/schemas/video.schema";
import { uuidRegexTest } from "../../utils/uuidRegexTest";
import statusCodes from "../../utils/status.utils";

dotenv.config();
const router = express.Router();

router.get(
  "/profile",
  ensureAuthenticated,
  ensureEmailVerified,
  async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.user.user_id;

      if (!uuidRegexTest(id)) throw createError(400, "Invalid user ID format");

      if (!id) {
        throw createError(401, "Something Went Wrong");
      }
      const user = await db
        .select()
        .from(users)
        .where(eq(users.user_id, id))
        .leftJoin(videos, eq(videos.user_id, id));

      if (!user) {
        throw createError(404, "User not found");
      }
      return res.status(200).json({
        statusCode: 200,
        ok: true,
        message: "User fetched successfully",
        data: { ...user[0] },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/change-password",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user_id = req.user.user_id;

      if (!uuidRegexTest(user_id))
        throw createError(400, "Invalid user ID format");

      if (!currentPassword || !newPassword) {
        throw createError(
          400,
          "Current password and new password are required"
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.user_id, user_id));
      if (!user[0]) {
        throw createError(404, "User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user[0].password!);
      if (!isMatch) {
        throw createError(400, "Current password is incorrect");
      }

      if (newPassword.length < MAX_PASSWORD_LENGTH) {
        throw createError(400, "New password must be more than 6 characters");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.user_id, user_id));

      res.status(statusCodes.ok).json({
        statusCode: 200,
        ok: true,
        message: "Password Changed successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete User Account API
router.delete(
  "/delete-account",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;

      if (!uuidRegexTest(user_id))
        throw createError(400, "Invalid user ID format");

      const user = await db
        .select({ user_id: users.user_id })
        .from(users)
        .where(eq(users.user_id, user_id))
        .then((result) => result[0]);

      if (!user) throw createError(statusCodes.badRequest, "User not found");

      await db.delete(users).where(eq(users.user_id, user_id));

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "User account deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get User Watch History API
router.get(
  "/watch-history",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;

      if (!uuidRegexTest(user_id))
        throw createError(400, "Invalid user ID format");
      const history = await db
        .select()
        .from(watch_history)
        .where(eq(watch_history.user_id, user_id));

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Watch History fetched successfully",
        data: {
          watch_history: history,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add to Watch History API
router.post(
  "/watch-history",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const { video_id } = req.body;

      if (!video_id) {
        throw createError(404, "Video Id is required");
      }

      if (!uuidRegexTest(video_id))
        throw createError(400, "Invalid video ID format");
      if (!uuidRegexTest(user_id))
        throw createError(400, "Invalid user ID format");

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id));

      if (!video[0]) throw createError(404, "Video not found");

      await db.insert(watch_history).values({
        history_id: uuidv4(),
        user_id,
        video_id,
        watched_at: new Date(),
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Added to watch history",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
