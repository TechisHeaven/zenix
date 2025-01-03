// utils/error.util.ts

interface ErrorResponse {
  statusCode: number;
  ok: boolean;
  message: string;
  details?: string | object;
}

export const createError = (
  statusCode: number,
  message: string,
  details?: string | object
): ErrorResponse => {
  return {
    statusCode,
    ok: false,
    message,
    details,
  };
};
