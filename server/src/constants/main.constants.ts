import sanitizedConfig from "../utils/env.config";

export const JWT_SECRET = sanitizedConfig.JWT_SECRET;
export const JWT_EXPIRATION = "24h";
export const JWT_EXPIRATION_EMAIL = "15m";
export const MAX_PASSWORD_LENGTH = 6;
export const PLAN_ONE = "basic";
export const PLAN_TWO = "premium";
