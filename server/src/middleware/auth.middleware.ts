import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis.config";
import { JWT_EXPIRATION, JWT_SECRET } from "../constants/main.constants";
import { DecodedJWTBody } from "../types/main.types";

export function generateToken(payload: {
  user_id: string;
  email_verified: boolean;
}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}
export function generateTokenPayload(payload: any, time: string) {
  return jwt.sign({ ...payload }, JWT_SECRET, {
    expiresIn: time,
  });
}

export const verifyJWT = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

// Middleware to validate JWT and check Redis session
async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

    (req as any).user_id = decoded.user_id; // Add user information to request object
    next();
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
}

async function logout(req: Request, res: Response) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedJWTBody;
    await redis.del(decoded.user_id);
    return res.status(200).send("Logged out successfully");
  }
  return res.status(400).send("No token found");
}

module.exports = {
  verifyJWT,
  generateToken,
  generateTokenPayload,
  authenticateToken,
  logout,
};
