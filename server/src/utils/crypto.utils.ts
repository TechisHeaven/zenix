import sanitizedConfig from "./env.config";
import crypto from "node:crypto";

export function generateVerificationLink(userID: string) {
  const secret = sanitizedConfig.JWT_SECRET;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(userID.toString())
    .digest("hex");

  return hash;
}
