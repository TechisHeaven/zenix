import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../types/main.types";

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`) as any;
  error.statusCode = 404;
  // delete error.stack;
  next(error);
}
interface CustomError extends Error {
  statusCode?: number;
  details?: string | object;
  ok: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Format error response
  const errorResponse = {
    message: err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
    ok: err.ok || false,
    details: err.details || {},
    // Only include stack trace in development environment
    ...(isDevelopment && { stack: err.stack }),
  };

  res.status(errorResponse.statusCode).json(errorResponse);
}
