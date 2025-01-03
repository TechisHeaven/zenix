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
import { sessions } from "../../db/schemas/main.scheam";

dotenv.config();
const router = express.Router();

router.get(
  "/profile",
  ensureAuthenticated,
  ensureEmailVerified,
  async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.user.user_id;

      if (!id) {
        throw createError(401, "Something Went Wrong");
      }
      const user = await db.select().from(users).where(eq(users.user_id, id));

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

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
