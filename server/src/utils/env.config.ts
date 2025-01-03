import dotenv from "dotenv";
// Loading process.env as ENV interface

import { Config, ENV } from "../types/env.types";

dotenv.config();

export const getConfig = (): ENV => {
  return {
    DATABASE: process.env.DATABASE,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    EMAIL_NAME: process.env.EMAIL_NAME,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT:
      typeof process.env.EMAIL_PORT === "number"
        ? process.env.EMAIL_PORT
        : parseInt(process.env.EMAIL_PORT!),
    EMAIL_SECURE:
      typeof process.env.EMAIL_SECURE === "boolean"
        ? process.env.EMAIL_SECURE
        : process.env.EMAIL_SECURE === "true",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
  };
};

export const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env file`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
