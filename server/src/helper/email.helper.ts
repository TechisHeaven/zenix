import sanitizedConfig from "../utils/env.config";
import { createError } from "../utils/error.utils";
import nodemailer from "nodemailer";
import statusCodes from "../utils/status.utils";

const transporter = nodemailer.createTransport({
  host: sanitizedConfig.EMAIL_HOST,
  port: sanitizedConfig.EMAIL_PORT,
  secure: sanitizedConfig.EMAIL_SECURE, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: sanitizedConfig.EMAIL_USER,
    pass: sanitizedConfig.EMAIL_PASSWORD,
  },
});

export async function sendMail(
  recipientEmail: string,
  subject: string,
  htmlContent: string
) {
  try {
    const mailOptions = {
      from: {
        name: sanitizedConfig.EMAIL_NAME,
        address: sanitizedConfig.EMAIL_USER,
      },
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    throw createError(statusCodes.badRequest, error);
  }
}
