import {
  login_user_fields,
  register_user_fields,
} from "./../../constants/requiredfields.constants";
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { users } from "../../db/schemas/user.schema";
import db from "../../db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {
  generateToken,
  generateTokenEmail,
} from "../../middleware/auth.middleware";
import { eq } from "drizzle-orm";
import { redis } from "../../config/redis.config";
import { validateFields } from "../../utils/validate.config";
import { createError } from "../../utils/error.utils";
import { returnResponse } from "../../utils/response.utils";
import {
  JWT_EXPIRATION_EMAIL,
  MAX_PASSWORD_LENGTH,
} from "../../constants/main.constants";
import { sessions } from "../../db/schemas/main.scheam";
import { ensureAuthenticated, ensureEmailVerified } from "../../server";
import { sendMail } from "../../helper/email.helper";
import sanitizedConfig from "../../utils/env.config";
import { handleEmail } from "../../service/email.service";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();

router.get(
  "/user",
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

router.post("/register", async (req: Request, res: any, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const validate = validateFields(register_user_fields, {
      name,
      email,
      password,
    });

    if (!validate.isValid) {
      throw createError(404, `Missing Fields: ${validate.missingFields}`);
    }

    if (password.length < MAX_PASSWORD_LENGTH) {
      throw createError(400, `Password must be more than 6 characters`);
    }
    // Check if the user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      throw createError(400, `User already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user_id = uuidv4();
    // Create new user
    await db.insert(users).values({
      user_id,
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken({ user_id, email_verified: false });

    await redis.set(
      user_id,
      typeof token === "string" ? token : JSON.stringify(token)
    );

    await db.insert(sessions).values({
      session_id: uuidv4(),
      user_id: user_id,
      token: token,
    });

    await handleEmail(email);

    return res.status(201).json({
      statusCodes: 201,
      ok: true,
      message: "User registered successfully",
      data: { token },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req: Request, res: any, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const validate = validateFields(login_user_fields, {
      email,
      password,
    });

    if (!validate.isValid) {
      throw createError(404, `Missing Fields: ${validate.missingFields}`);
    }
    if (password.length < MAX_PASSWORD_LENGTH) {
      throw createError(400, `Password must be more than 6 characters`);
    }
    // Check if the user exists
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user[0]) {
      throw createError(400, "Invalid credentials");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user[0].password!);

    if (!isMatch) {
      throw createError(400, "Invalid Password");
    }

    if (user[0].email_verified === false) {
      await handleEmail(email);
      return res.status(200).json({
        statusCodes: 200,
        ok: true,
        message: "Verification Email Send successful",
        data: {},
      });
    }

    const user_id = user[0].user_id;
    // Generate JWT token
    const token = generateToken({
      user_id,
      email_verified: user[0].email_verified!,
    });

    // Optionally, store session in Redis for tracking login (e.g., token expiry)
    await redis.set(
      user_id.toString(),
      typeof token === "string" ? token : JSON.stringify(token)
    );

    const existingSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.user_id, user_id));

    if (existingSession.length > 0) {
      await db
        .update(sessions)
        .set({ token })
        .where(eq(sessions.user_id, user_id));
    } else {
      await db.insert(sessions).values({
        session_id: uuidv4(),
        user_id,
        token,
      });
    }
    return res.status(200).json({
      statusCodes: 200,
      ok: true,
      message: "Login successful",
      data: { token },
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/send-magic",
  async (req: Request, res: any, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Generate a unique token with JWT
      await handleEmail(email);

      res.status(200).json({ message: "Magic link sent!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error sending magic link" });
    }
  }
);

router.get(
  "/verify-email",
  async (req: Request, res: any, next: NextFunction) => {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);

      if (decoded) {
      }
      // Check if the token exists in Redis
      const email = await redis.get(token as string);

      if (!email) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const user = await db
        .select({
          user_id: users.user_id,
          email_verified: users.email_verified,
        })
        .from(users)
        .where(eq(users.email, email));

      const new_token = generateToken({
        user_id: user[0].user_id,
        email_verified: user[0].email_verified!,
      });

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ email_verified: true })
          .where(eq(users.email, email));

        await tx
          .update(sessions)
          .set({ token: new_token })
          .where(eq(sessions.user_id, user[0].user_id));
      });

      // Token is valid; proceed with login or account verification
      res.status(200).json({ message: "Token verified", email });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired" });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ message: "Invalid token" });
      } else {
        console.error(err);
        return res
          .status(500)
          .json({ message: "An error occurred during token verification" });
      }
    }
  }
);

export default router;
