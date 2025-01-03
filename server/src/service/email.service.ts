import { redis } from "../config/redis.config";
import { JWT_EXPIRATION_EMAIL } from "../constants/main.constants";
import { sendMail } from "../helper/email.helper";
import {
  generateTokenPayload,
  generateToken,
} from "../middleware/auth.middleware";
import sanitizedConfig from "../utils/env.config";

export async function handleEmail(email: string) {
  try {
    const token = await generateTokenPayload(email, JWT_EXPIRATION_EMAIL);
    // Store the token in Redis with a 15-minute expiration
    await redis.set(token, email, { EX: 900 });

    const magicLink = `${sanitizedConfig.CLIENT_URL}/verify-email?token=${token}`;

    // Send email with the magic link
    await sendMail(
      email,
      "Verify Your Account",
      `<p>Click the link below to verify your account:</p><a href="${magicLink}">${magicLink}</a>`
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}
