export type ENV = {
  DATABASE: string | undefined;
  JWT_SECRET: string | undefined;
  PORT: string | undefined;
  CLIENT_URL: string | undefined;
  EMAIL_NAME: string | undefined;
  EMAIL_USER: string | undefined;
  EMAIL_HOST: string | undefined;
  EMAIL_PORT: number | undefined;
  EMAIL_SECURE: boolean | undefined;
  EMAIL_PASSWORD: string | undefined;
};
export type Config = {
  DATABASE: string;
  JWT_SECRET: string;
  PORT: string;
  CLIENT_URL: string;
  EMAIL_NAME: string;
  EMAIL_USER: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_SECURE: boolean;
  EMAIL_PASSWORD: string;
};
